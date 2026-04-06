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

	updateTaskProgress('download', `${rows.length} Filme zum Download`, 0);

	let completed = 0;
	let failed = 0;
	const errors: string[] = [];
	const total = rows.length;

	// Sequentiell oder parallel je nach Konfiguration
	if (config.NUM_DOWNLOADS <= 1) {
		for (const film of rows) {
			const err = await downloadSingleFilm(film, config);
			if (!err) completed++;
			else { failed++; errors.push(err); }
			updateTaskProgress(
				'download',
				`${completed + failed} von ${total} (${failed} Fehler)`,
				Math.round(((completed + failed) / total) * 100)
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
				if (r.status === 'fulfilled' && !r.value) completed++;
				else if (r.status === 'fulfilled' && r.value) { failed++; errors.push(r.value); }
				else { failed++; errors.push(String((r as PromiseRejectedResult).reason)); }
			}
			updateTaskProgress(
				'download',
				`${completed + failed} von ${total} (${failed} Fehler)`,
				Math.round(((completed + failed) / total) * 100)
			);
		}
	}

	const summary = `Fertig: ${completed} heruntergeladen, ${failed} Fehler`;
	const detail = errors.length ? `\n${errors.join('\n')}` : '';
	updateTaskProgress('download', summary + detail, 100);
}

/** Gibt null bei Erfolg zurück, sonst eine Fehlermeldung. */
async function downloadSingleFilm(
	film: Film,
	config: ReturnType<typeof loadConfig>
): Promise<string | null> {
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
			stderr: 'pipe'
		});
		const exitCode = await proc.exited;

		if (exitCode === 0) {
			updateDownloadStatus(film._id, 'K');
			saveRecording(film._id, ziel);
			return null;
		} else {
			const stderr = await new Response(proc.stderr).text();
			const msg = `"${film.Titel}": exit ${exitCode} – ${stderr.trim() || 'unbekannter Fehler'}`;
			console.error(`Download fehlgeschlagen: ${msg}\n  cmd: ${cmd}`);
			updateDownloadStatus(film._id, 'F');
			return msg;
		}
	} catch (e) {
		const msg = `"${film.Titel}": ${e}`;
		console.error(`Download Ausnahme: ${msg}\n  cmd: ${cmd}`);
		updateDownloadStatus(film._id, 'F');
		return msg;
	}
}
