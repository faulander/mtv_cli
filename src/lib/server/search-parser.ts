/**
 * Suchsprache → SQL WHERE-Klausel.
 * Vollständiger Port der Python get_query()-Logik.
 */

/**
 * Deutsches Datum (TT.MM.JJ oder TT.MM.JJJJ) in ISO umwandeln.
 */
function isoDate(datum: string): string {
	const parts = datum.split('.');
	if (parts.length !== 3) return datum;
	const tag = parts[0].padStart(2, '0');
	const monat = parts[1].padStart(2, '0');
	let jahr = parts[2];
	if (jahr.length === 2) jahr = '20' + jahr;
	return `${jahr}-${monat}-${tag}`;
}

/**
 * Suchbegriffe in eine SQL-Query umwandeln.
 *
 * Unterstützt:
 * - Globale Suche: Token ohne Doppelpunkt → OR über Sender/Thema/Titel/Beschreibung
 * - Feld-Suche: sender:ARD → (Sender LIKE '%ARD%')
 * - Datum: datum:>01.01.25, datum:>=01.01.25, datum:01.01-31.01, datum:=15.03.25
 * - Boolesch: und/and, oder/or, (, )
 * - Raw SQL: wenn erstes Token mit "select" beginnt
 */
export function buildQuery(suche: string[]): string {
	const selectClause = 'SELECT * FROM filme WHERE ';

	if (!suche.length) {
		return 'SELECT * FROM filme';
	}

	// Raw SQL durchreichen
	if (suche[0].toLowerCase().startsWith('select')) {
		return suche.join(' ');
	}

	let whereClause = '';
	let op = '';

	for (const token of suche) {
		// Logische Operatoren
		if (['(', 'und', 'oder', 'and', 'or', ')'].includes(token)) {
			if (op) {
				whereClause += op;
			}
			op = ` ${token} `;
			continue;
		}

		if (token.includes(':')) {
			// Feld-spezifische Suche
			const colonIdx = token.indexOf(':');
			const key = token.substring(0, colonIdx);
			const value = token.substring(colonIdx + 1);

			if (whereClause) {
				whereClause += op || ' AND ';
			}

			if (key.toUpperCase() === 'DATUM') {
				whereClause += parseDateCondition(key, value);
			} else {
				whereClause += `(${key} LIKE '%${escapeSQL(value)}%')`;
			}
		} else {
			// Volltextsuche
			if (whereClause) {
				whereClause += op || ' OR ';
			}
			const escaped = escapeSQL(token);
			whereClause += `(Sender LIKE '%${escaped}%' OR Thema LIKE '%${escaped}%' OR Titel LIKE '%${escaped}%' OR Beschreibung LIKE '%${escaped}%')`;
		}
		op = '';
	}

	// Restlichen Operator anhängen
	if (op) {
		whereClause += op;
	}

	return selectClause + whereClause;
}

function parseDateCondition(key: string, value: string): string {
	if (value.startsWith('>') || value.startsWith('<') || value.startsWith('=')) {
		let dateOp: string;
		let dateValue: string;

		if (value.length > 1 && ['<', '>', '='].includes(value[1])) {
			dateOp = value.substring(0, 2);
			dateValue = value.substring(2);
		} else {
			dateOp = value[0];
			dateValue = value.substring(1);
		}

		// = → = (exakt)
		if (dateOp === '=') dateOp = '=';

		return `(${key} ${dateOp} '${isoDate(dateValue)}')`;
	}

	if (value.includes('-')) {
		const limits = value.split('-');
		if (limits.length === 2) {
			return `(${key} >= '${isoDate(limits[0])}' AND ${key} <= '${isoDate(limits[1])}')`;
		}
	}

	// Exakter Vergleich
	return `(${key} = '${isoDate(value)}')`;
}

/**
 * Einfaches SQL-Escaping für LIKE-Werte.
 */
function escapeSQL(value: string): string {
	return value.replace(/'/g, "''");
}

/**
 * Suchformular-Felder in ein Suchbegriffe-Array umwandeln.
 */
export function formToSearchTerms(formData: FormData): string[] {
	const terms: string[] = [];

	const global = formData.get('global')?.toString().trim();
	if (global) {
		terms.push(global);
	}

	for (const field of ['sender', 'thema', 'datum', 'titel', 'beschreibung']) {
		const value = formData.get(field)?.toString().trim();
		if (value) {
			terms.push(`${field}:${value}`);
		}
	}

	return terms;
}
