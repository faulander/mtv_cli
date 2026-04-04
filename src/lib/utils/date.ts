/**
 * ISO-Datum (YYYY-MM-DD) ins deutsche Format (TT.MM.JJ) umwandeln.
 */
export function isoToGerman(iso: string): string {
	if (!iso) return '';
	const teile = iso.split('-');
	if (teile.length !== 3) return iso;
	return `${teile[2]}.${teile[1]}.${teile[0].slice(2)}`;
}

/**
 * ISO-Datum ins lange deutsche Format (TT.MM.JJJJ) umwandeln.
 */
export function isoToGermanLong(iso: string): string {
	if (!iso) return '';
	const teile = iso.split('-');
	if (teile.length !== 3) return iso;
	return `${teile[2]}.${teile[1]}.${teile[0]}`;
}

/**
 * ISO-Zeitstempel formatieren (TT.MM.JJJJ HH:MM:SS).
 */
export function formatTimestamp(iso: string): string {
	if (!iso) return '';
	const d = new Date(iso);
	if (isNaN(d.getTime())) return iso;

	const tag = String(d.getDate()).padStart(2, '0');
	const monat = String(d.getMonth() + 1).padStart(2, '0');
	const jahr = d.getFullYear();
	const std = String(d.getHours()).padStart(2, '0');
	const min = String(d.getMinutes()).padStart(2, '0');
	const sek = String(d.getSeconds()).padStart(2, '0');
	return `${tag}.${monat}.${jahr} ${std}:${min}:${sek}`;
}

/**
 * Deutsches Datum (TT.MM.JJ oder TT.MM.JJJJ) in ISO-Format.
 */
export function germanToIso(datum: string): string {
	if (!datum) return '';
	const teile = datum.split('.');
	if (teile.length !== 3) return datum;

	const tag = teile[0].padStart(2, '0');
	const monat = teile[1].padStart(2, '0');
	let jahr = teile[2];
	if (jahr.length === 2) jahr = '20' + jahr;
	return `${jahr}-${monat}-${tag}`;
}
