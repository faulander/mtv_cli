import { getDb } from './db';
import { createFilmTable, createFilmIndexes } from './schema';
import { parseFilmRecord, dauerAlsMinuten, datumToIso } from './filminfo';
import { saveStatus } from './filmdb';
import { loadConfig } from './settings';
import { updateTaskProgress } from './background-tasks';
import { matchSuchbegriffe } from './suchbegriffe';

const URL_FILMLISTE = 'https://liste.mediathekview.de/Filmliste-akt.xz';
const BUFSIZE = 8192;

/**
 * Filmliste herunterladen, entpacken und in die Datenbank importieren.
 * Wird als Background-Task ausgeführt.
 */
export async function updateFilmList(): Promise<void> {
	const config = loadConfig();
	const dateCutoff = new Date();
	dateCutoff.setDate(dateCutoff.getDate() - config.DATE_CUTOFF);
	const dateCutoffIso = dateCutoff.toISOString().split('T')[0];

	updateTaskProgress('aktualisieren', 'Filmliste wird heruntergeladen...');

	// Filmliste herunterladen und via xz entpacken
	const response = await fetch(URL_FILMLISTE);
	if (!response.ok || !response.body) {
		throw new Error(`Download fehlgeschlagen: ${response.status}`);
	}

	const proc = Bun.spawn(['xz', '--decompress', '--stdout'], {
		stdin: response.body,
		stdout: 'pipe',
		stderr: 'pipe'
	});

	const reader = proc.stdout.getReader();
	const decoder = new TextDecoder();

	// Datenbank vorbereiten
	const db = getDb();
	createFilmTable(db);

	const insertStmt = db.prepare(
		'INSERT OR IGNORE INTO filme VALUES (' + Array(21).fill('?').join(',') + ')'
	);

	let lastListe: string[] | null = null;
	let haveHeader = false;
	let lastRec = '';
	let total = 0;
	let inserted = 0;
	let errors = 0;
	let bufCount = 0;
	const regex = /,\n? *"X" ?: ?/;

	db.exec('BEGIN');

	try {
		while (true) {
			const { done, value } = await reader.read();

			if (done) {
				// Letzten Satz verarbeiten
				if (lastRec.length > 0) {
					total++;
					processRecord(lastRec.replace(/\]$/, ''));
				}
				break;
			}

			const chunk = decoder.decode(value, { stream: true });
			bufCount++;

			if (bufCount % 500 === 0) {
				updateTaskProgress(
					'aktualisieren',
					`Verarbeite... ${inserted.toLocaleString('de-DE')} Filme importiert`
				);
			}

			// Sätze aufteilen
			const combined = lastRec + chunk;
			const records = combined.split(regex);

			// Letzter Satz könnte unvollständig sein
			lastRec = records.pop() || '';

			for (const record of records) {
				if (!haveHeader) {
					haveHeader = true;
					continue;
				}
				total++;
				processRecord(record);
			}

			// Zwischenspeicherung alle 50000 Sätze
			if (inserted > 0 && inserted % 50000 === 0) {
				db.exec('COMMIT');
				db.exec('BEGIN');
			}
		}

		db.exec('COMMIT');
	} catch (e) {
		db.exec('ROLLBACK');
		throw e;
	}

	// Indizes erstellen
	updateTaskProgress('aktualisieren', 'Erstelle Indizes...');
	createFilmIndexes(db);

	// Status speichern
	saveStatus('_akt');
	saveStatus('_anzahl', String(inserted));

	// Suchbegriffe abgleichen
	updateTaskProgress('aktualisieren', 'Gleiche Suchbegriffe ab...');
	const matched = matchSuchbegriffe();

	updateTaskProgress(
		'aktualisieren',
		`Fertig: ${inserted.toLocaleString('de-DE')} Filme importiert (${errors} Dubletten)` +
			(matched > 0 ? `, ${matched} neue Filme vorgemerkt` : '')
	);

	// xz-Prozess abwarten
	await proc.exited;

	function processRecord(record: string) {
		try {
			const liste = JSON.parse(record) as string[];
			const film = parseFilmRecord(liste, lastListe);
			lastListe = liste;

			if (!film) return;

			// Blacklist prüfen
			if (film.Datum < dateCutoffIso) return;
			if (dauerAlsMinuten(film.Dauer) < config.DAUER_CUTOFF) return;

			insertStmt.run(
				film.Sender, film.Thema, film.Titel, film.Datum, film.Zeit,
				film.Dauer, film.Groesse, film.Beschreibung, film.Url, film.Website,
				film.Url_Untertitel, film.Url_RTMP, film.Url_Klein, film.Url_RTMP_Klein,
				film.Url_HD, film.Url_RTMP_HD, film.DatumL, film.Url_History,
				film.Geo, film.neu, film._id
			);
			inserted++;
		} catch {
			errors++;
		}
	}
}
