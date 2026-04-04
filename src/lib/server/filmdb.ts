import { getDb } from './db';
import type { Film, StatusEntry } from '$lib/types/film';

/**
 * Status-Einträge lesen (letzte Aktualisierung, Filmanzahl).
 */
export function readStatus(keys: string[]): StatusEntry[] {
	const db = getDb();
	const placeholders = keys.map(() => '?').join(',');
	return db
		.query(`SELECT key, Zeit, text FROM status WHERE key IN (${placeholders})`)
		.all(...keys) as StatusEntry[];
}

/**
 * Status speichern.
 */
export function saveStatus(key: string, text: string | null = null): void {
	const db = getDb();
	const now = new Date().toISOString();
	db.query('INSERT OR REPLACE INTO status (key, Zeit, text) VALUES (?, ?, ?)').run(
		key,
		now,
		text
	);
}

/**
 * SQL-Query auf die filme-Tabelle ausführen.
 */
export function executeQuery(statement: string): Film[] {
	const db = getDb();
	try {
		return db.query(statement).all() as Film[];
	} catch {
		return [];
	}
}

/**
 * Anzahl der Filme in der Datenbank.
 */
export function getFilmCount(): number {
	const db = getDb();
	try {
		const row = db.query('SELECT COUNT(*) as count FROM filme').get() as { count: number };
		return row.count;
	} catch {
		return 0;
	}
}
