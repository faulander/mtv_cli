import { getDb } from './db';
import type { Download } from '$lib/types/film';

/**
 * Downloads auslesen — mit Filminfo aus der filme-Tabelle gejoint.
 */
export function readDownloads(
	statusFilter: string[] = ['V', 'S', 'A', 'F', 'K']
): Download[] {
	const db = getDb();
	const placeholders = statusFilter.map(() => '?').join(',');

	try {
		return db
			.query(
				`SELECT d.status AS status,
						d.DatumStatus AS DatumStatus,
						d._id AS _id,
						d.Datum AS Datum,
						f.Sender AS Sender,
						f.Thema AS Thema,
						f.Titel AS Titel,
						f.Dauer AS Dauer
				 FROM downloads AS d
				 LEFT JOIN filme AS f ON f._id = d._id
				 WHERE d.status IN (${placeholders})
				 ORDER BY d.DatumStatus DESC`
			)
			.all(...statusFilter) as Download[];
	} catch {
		return [];
	}
}

/**
 * Downloads löschen.
 */
export function deleteDownloads(ids: string[]): number {
	if (!ids.length) return 0;
	const db = getDb();
	const placeholders = ids.map(() => '?').join(',');
	const result = db.query(`DELETE FROM downloads WHERE _id IN (${placeholders})`).run(...ids);
	return result.changes;
}

/**
 * Download-Status ändern.
 */
export function updateDownloadStatus(id: string, status: string): void {
	const db = getDb();
	const today = new Date().toISOString().split('T')[0];
	db.query('UPDATE downloads SET status = ?, DatumStatus = ? WHERE _id = ?').run(
		status,
		today,
		id
	);
}
