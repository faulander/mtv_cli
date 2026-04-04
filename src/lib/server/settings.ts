import { getDb } from './db';
import { DEFAULT_CONFIG, type AppConfig } from '$lib/types/config';

const CONFIG_KEY = '_config';

/**
 * Einstellungen aus der status-Tabelle lesen.
 * Gespeichert als JSON im text-Feld.
 */
export function loadConfig(): AppConfig {
	const db = getDb();
	const row = db.query('SELECT text FROM status WHERE key = ?').get(CONFIG_KEY) as
		| { text: string | null }
		| null;

	if (row?.text) {
		try {
			const saved = JSON.parse(row.text) as Partial<AppConfig>;
			return { ...DEFAULT_CONFIG, ...saved };
		} catch {
			return { ...DEFAULT_CONFIG };
		}
	}
	return { ...DEFAULT_CONFIG };
}

/**
 * Einstellungen in der status-Tabelle speichern.
 */
export function saveConfig(config: AppConfig): void {
	const db = getDb();
	const now = new Date().toISOString();
	db.query('INSERT OR REPLACE INTO status (key, Zeit, text) VALUES (?, ?, ?)').run(
		CONFIG_KEY,
		now,
		JSON.stringify(config)
	);
}

/**
 * Einzelnen Einstellungswert ändern.
 */
export function updateConfigValue<K extends keyof AppConfig>(
	key: K,
	value: AppConfig[K]
): AppConfig {
	const config = loadConfig();
	config[key] = value;
	saveConfig(config);
	return config;
}
