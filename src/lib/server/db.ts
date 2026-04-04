import { Database } from 'bun:sqlite';
import { env } from '$env/dynamic/private';
import { initSchema } from './schema';

const DB_PATH = env.MTV_DB_PATH || `${process.env.HOME}/.mediathek3/filme.sqlite`;

let db: Database | null = null;

export function getDb(): Database {
	if (!db) {
		// Verzeichnis sicherstellen
		const dir = DB_PATH.substring(0, DB_PATH.lastIndexOf('/'));
		try {
			Bun.spawnSync(['mkdir', '-p', dir]);
		} catch {
			// Verzeichnis existiert vermutlich schon
		}

		db = new Database(DB_PATH, { create: true });
		db.exec('PRAGMA journal_mode=WAL');
		db.exec('PRAGMA foreign_keys=ON');
		initSchema(db);
	}
	return db;
}
