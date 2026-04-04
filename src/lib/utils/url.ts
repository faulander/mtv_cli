import type { Film, Qualitaet } from '$lib/types/film';

/**
 * Relative URL auflösen. Das Mediathekview-Format speichert
 * HD/Klein-URLs als "offset|suffix" relativ zur Basis-URL.
 */
function resolveUrl(baseUrl: string, relativeUrl: string): string {
	if (!relativeUrl) return baseUrl;
	if (relativeUrl.startsWith('http')) return relativeUrl;

	const pipeIdx = relativeUrl.indexOf('|');
	if (pipeIdx === -1) return relativeUrl;

	const offset = parseInt(relativeUrl.substring(0, pipeIdx));
	const suffix = relativeUrl.substring(pipeIdx + 1);
	return baseUrl.substring(0, offset) + suffix;
}

/**
 * Beste URL basierend auf Qualitätseinstellung ermitteln.
 * Rückgabe: [Größenbezeichnung, URL]
 */
export function getFilmUrl(film: Film, qualitaet: Qualitaet): [string, string] {
	if (qualitaet === 'HD' && film.Url_HD) {
		return ['HD', resolveUrl(film.Url, film.Url_HD)];
	}
	if (qualitaet === 'LOW' && film.Url_Klein) {
		return ['LOW', resolveUrl(film.Url, film.Url_Klein)];
	}
	return ['SD', film.Url];
}
