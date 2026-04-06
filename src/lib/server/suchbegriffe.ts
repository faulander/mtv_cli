import { getDb } from './db';

export interface Suchbegriff {
	_id: number;
	suchbegriff: string;
	erstellt: string;
}

/**
 * Alle gespeicherten Suchbegriffe lesen.
 */
export function readSuchbegriffe(): Suchbegriff[] {
	const db = getDb();
	return db.query('SELECT * FROM suchbegriffe ORDER BY erstellt DESC').all() as Suchbegriff[];
}

/**
 * Neuen Suchbegriff speichern.
 */
export function addSuchbegriff(suchbegriff: string): number {
	const db = getDb();
	const today = new Date().toISOString().split('T')[0];
	const result = db
		.query('INSERT OR IGNORE INTO suchbegriffe (suchbegriff, erstellt) VALUES (?, ?)')
		.run(suchbegriff.trim(), today);
	return result.changes;
}

/**
 * Suchbegriff löschen.
 */
export function deleteSuchbegriff(id: number): void {
	const db = getDb();
	db.query('DELETE FROM suchbegriffe WHERE _id = ?').run(id);
}

/**
 * Alle Suchbegriffe gegen die Filmdatenbank laufen lassen
 * und Treffer als Download vormerken.
 * Gibt die Anzahl neu vorgemerkter Filme zurück.
 */
export function matchSuchbegriffe(): number {
	const db = getDb();
	const begriffe = readSuchbegriffe();
	const today = new Date().toISOString().split('T')[0];

	const insertStmt = db.prepare(
		'INSERT OR IGNORE INTO downloads (_id, Datum, status, DatumStatus) VALUES (?, ?, ?, ?)'
	);

	let total = 0;

	const run = db.transaction(() => {
		for (const b of begriffe) {
			const phrase = b.suchbegriff.trim();
			if (!phrase) continue;

			const escaped = phrase.replace(/'/g, "''");
			const query = `SELECT _id, Datum FROM filme WHERE Titel LIKE '%${escaped}%' OR Thema LIKE '%${escaped}%' OR Beschreibung LIKE '%${escaped}%'`;
			try {
				const rows = db.query(query).all() as { _id: string; Datum: string }[];
				for (const row of rows) {
					const result = insertStmt.run(row._id, row.Datum || today, 'V', today);
					total += result.changes;
				}
			} catch {
				// Ungültiger Suchbegriff — überspringen
			}
		}
	});
	run();

	return total;
}
