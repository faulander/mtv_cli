/**
 * Dateinamen bereinigen: Unsichere Zeichen durch sichere ersetzen.
 * Identisch zum Python-Original (REP_TAB).
 */
const REPLACEMENTS: Record<string, string> = {
	'/': '_',
	"'": '\u00b4', // ´
	'`': '\u00b4' // ´
};

export function sanitizeFilename(name: string): string {
	let result = name;
	for (const [from, to] of Object.entries(REPLACEMENTS)) {
		result = result.replaceAll(from, to);
	}
	return result;
}
