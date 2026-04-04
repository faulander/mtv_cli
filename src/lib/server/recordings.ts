import { getDb } from './db';
import type { Recording } from '$lib/types/film';
import { existsSync, unlinkSync } from 'node:fs';
import { basename } from 'node:path';

/**
 * Aufnahmen lesen. Entfernt automatisch Einträge für nicht mehr vorhandene Dateien.
 */
export function readRecordings(): (Recording & { Datei: string })[] {
	const db = getDb();
	let rows: Recording[];

	try {
		rows = db.query('SELECT * FROM recordings').all() as Recording[];
	} catch {
		return [];
	}

	const result: (Recording & { Datei: string })[] = [];
	const toDelete: string[] = [];

	for (const row of rows) {
		if (!existsSync(row.Dateiname)) {
			toDelete.push(row.Dateiname);
			continue;
		}
		result.push({ ...row, Datei: basename(row.Dateiname) });
	}

	// Nicht mehr vorhandene Dateien aus der DB entfernen
	if (toDelete.length) {
		const placeholders = toDelete.map(() => '?').join(',');
		db.query(`DELETE FROM recordings WHERE Dateiname IN (${placeholders})`).run(...toDelete);
	}

	return result;
}

/**
 * Aufnahme löschen (Datei + DB-Eintrag).
 */
export function deleteRecording(dateiname: string): { success: boolean; message: string } {
	const db = getDb();

	const row = db.query('SELECT * FROM recordings WHERE Dateiname = ?').get(dateiname);
	if (!row) {
		return { success: false, message: 'Datei nicht in der Datenbank' };
	}

	if (existsSync(dateiname)) {
		try {
			unlinkSync(dateiname);
		} catch (e) {
			return { success: false, message: `Löschen fehlgeschlagen: ${e}` };
		}
	}

	db.query('DELETE FROM recordings WHERE Dateiname = ?').run(dateiname);
	return { success: true, message: 'Datei gelöscht' };
}

/**
 * Aufnahme in der DB speichern.
 */
export function saveRecording(
	id: string,
	dateiname: string
): void {
	const db = getDb();

	const film = db
		.query('SELECT Sender, Titel, Beschreibung, Datum FROM filme WHERE _id = ?')
		.get(id) as { Sender: string; Titel: string; Beschreibung: string; Datum: string } | null;

	if (!film) return;

	const today = new Date().toISOString().split('T')[0];
	db.query('INSERT OR IGNORE INTO recordings VALUES (?, ?, ?, ?, ?, ?)').run(
		film.Sender,
		film.Titel,
		film.Beschreibung,
		film.Datum,
		dateiname,
		today
	);
}
