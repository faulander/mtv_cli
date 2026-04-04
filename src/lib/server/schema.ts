import type { Database } from 'bun:sqlite';

export function initSchema(db: Database): void {
	db.exec(`
		CREATE TABLE IF NOT EXISTS downloads (
			_id          TEXT PRIMARY KEY,
			Datum        TEXT,
			status       TEXT,
			DatumStatus  TEXT
		)
	`);

	db.exec(`
		CREATE TABLE IF NOT EXISTS status (
			key   TEXT PRIMARY KEY,
			Zeit  TEXT,
			text  TEXT
		)
	`);

	db.exec(`
		CREATE TABLE IF NOT EXISTS recordings (
			Sender       TEXT,
			Titel        TEXT,
			Beschreibung TEXT,
			DatumFilm    TEXT,
			Dateiname    TEXT PRIMARY KEY,
			DatumDatei   TEXT
		)
	`);

	// filme-Tabelle wird beim Update komplett neu erstellt,
	// daher hier kein CREATE — nur die anderen Tabellen initialisieren
}

export function createFilmTable(db: Database): void {
	db.exec('DROP TABLE IF EXISTS filme');
	db.exec(`
		CREATE TABLE filme (
			Sender         TEXT,
			Thema          TEXT,
			Titel          TEXT,
			Datum          TEXT,
			Zeit           TEXT,
			Dauer          TEXT,
			Groesse        INTEGER,
			Beschreibung   TEXT,
			Url            TEXT,
			Website        TEXT,
			Url_Untertitel TEXT,
			Url_RTMP       TEXT,
			Url_Klein      TEXT,
			Url_RTMP_Klein TEXT,
			Url_HD         TEXT,
			Url_RTMP_HD    TEXT,
			DatumL         TEXT,
			Url_History    TEXT,
			Geo            TEXT,
			neu            TEXT,
			_id            TEXT PRIMARY KEY
		)
	`);
}

export function createFilmIndexes(db: Database): void {
	db.exec('CREATE INDEX IF NOT EXISTS idx_filme_id ON filme(_id)');
	db.exec('CREATE INDEX IF NOT EXISTS idx_filme_sender ON filme(Sender)');
	db.exec('CREATE INDEX IF NOT EXISTS idx_filme_thema ON filme(Thema)');
}
