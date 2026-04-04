import { getDb } from './db';
import { loadConfig } from './settings';
import { updateDownloadStatus } from './downloads';
import { saveRecording } from './recordings';
import { updateTaskProgress } from './background-tasks';
import { getFilmUrl } from '$lib/utils/url';
import { sanitizeFilename } from '$lib/utils/sanitize';
import type { Film } from '$lib/types/film';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * Alle vorgemerkten Filme herunterladen.
 */
export async function downloadFilme(): Promise<void> {
	const config = loadConfig();
	const db = getDb();

	// Filme mit Status V, S, A, F lesen
	const rows = db
		.query(
			`SELECT f.* FROM filme AS f, downloads AS d
			 WHERE f._id = d._id AND d.status IN ('V', 'S', 'A', 'F')`
		)
		.all() as Film[];

	if (!rows.length) {
		updateTaskProgress('download', 'Keine vorgemerkten Filme vorhanden');
		return;
	}

	updateTaskProgress('download', `${rows.length} Filme zum Download`);

	let completed = 0;
	let failed = 0;

	// Sequentiell oder parallel je nach Konfiguration
	if (config.NUM_DOWNLOADS <= 1) {
		for (const film of rows) {
			const success = await downloadSingleFilm(film, config);
			if (success) completed++;
			else failed++;
			updateTaskProgress(
				'download',
				`${completed + failed} von ${rows.length} (${failed} Fehler)`
			);
		}
	} else {
		// Parallele Downloads in Batches
		const batchSize = config.NUM_DOWNLOADS;
		for (let i = 0; i < rows.length; i += batchSize) {
			const batch = rows.slice(i, i + batchSize);
			const results = await Promise.allSettled(
				batch.map((film) => downloadSingleFilm(film, config))
			);
			for (const r of results) {
				if (r.status === 'fulfilled' && r.value) completed++;
				else failed++;
			}
			updateTaskProgress(
				'download',
				`${completed + failed} von ${rows.length} (${failed} Fehler)`
			);
		}
	}

	updateTaskProgress(
		'download',
		`Fertig: ${completed} heruntergeladen, ${failed} Fehler`
	);
}

async function downloadSingleFilm(
	film: Film,
	config: ReturnType<typeof loadConfig>
): Promise<boolean> {
	const [size, url] = getFilmUrl(film, config.QUALITAET);

	const thema = sanitizeFilename(film.Thema);
	const titel = sanitizeFilename(film.Titel);
	const ext = url.split('.').pop()?.toLowerCase()?.split('?')[0] || 'mp4';

	const isM3U = ext.startsWith('m3u');
	const finalExt = isM3U ? 'mp4' : ext;

	// Ziel-Pfad erstellen
	const ziel = config.ZIEL_DOWNLOADS
		.replace('{Sender}', film.Sender)
		.replace('{Datum}', film.Datum)
		.replace('{Thema}', thema)
		.replace('{Titel}', titel)
		.replace('{ext}', finalExt);

	// Verzeichnis sicherstellen
	const dir = dirname(ziel);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}

	// Status auf Aktiv setzen
	updateDownloadStatus(film._id, 'A');

	// Download-Kommando zusammenbauen und ausführen
	const cmdTemplate = isM3U ? config.CMD_DOWNLOADS_M3U : config.CMD_DOWNLOADS;
	const cmd = cmdTemplate.replace('{ziel}', ziel).replace('{url}', url);

	try {
		const proc = Bun.spawn(['sh', '-c', cmd], {
			stdout: 'ignore',
			stderr: 'ignore'
		});
		const exitCode = await proc.exited;

		if (exitCode === 0) {
			updateDownloadStatus(film._id, 'K');
			saveRecording(film._id, ziel);
			return true;
		} else {
			updateDownloadStatus(film._id, 'F');
			return false;
		}
	} catch {
		updateDownloadStatus(film._id, 'F');
		return false;
	}
}
