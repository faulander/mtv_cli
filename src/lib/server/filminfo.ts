import type { Film, Qualitaet } from '$lib/types/film';

/**
 * Film-ID aus den Kernfeldern generieren (MD5-Hash).
 * Identisch zum Python-Original: md5(sender+thema+titel+datum+zeit+url)
 */
export function generateFilmId(
	sender: string,
	thema: string,
	titel: string,
	datum: string,
	zeit: string,
	url: string
): string {
	const hasher = new Bun.CryptoHasher('md5');
	hasher.update(sender + thema + titel + datum + zeit + url);
	return hasher.digest('hex');
}

/**
 * Dauer im Format "HH:MM:SS" in Minuten umrechnen.
 */
export function dauerAlsMinuten(dauer: string): number {
	if (!dauer) return 0;
	const teile = dauer.split(':');
	if (teile.length === 3) {
		return parseInt(teile[0]) * 60 + parseInt(teile[1]);
	}
	if (teile.length === 2) {
		return parseInt(teile[0]);
	}
	return 0;
}

/**
 * Deutsches Datum (TT.MM.JJJJ oder TT.MM.JJ) in ISO-Format umwandeln.
 */
export function datumToIso(datum: string): string {
	if (!datum) return '';
	if (datum.includes('-')) return datum; // bereits ISO

	const teile = datum.split('.');
	if (teile.length !== 3) return '';

	const tag = teile[0].padStart(2, '0');
	const monat = teile[1].padStart(2, '0');
	let jahr = teile[2];
	if (jahr.length === 2) {
		jahr = '20' + jahr;
	}
	return `${jahr}-${monat}-${tag}`;
}

/**
 * URL basierend auf Qualitätseinstellung auflösen.
 * HD/LOW-URLs sind Suffix-basiert auf der Basis-URL.
 * Rückgabe: [Größenbezeichnung, URL]
 */
export function getUrl(film: Film, qualitaet: Qualitaet): [string, string] {
	if (qualitaet === 'HD' && film.Url_HD) {
		const url = resolveUrl(film.Url, film.Url_HD);
		return ['HD', url];
	}
	if (qualitaet === 'LOW' && film.Url_Klein) {
		const url = resolveUrl(film.Url, film.Url_Klein);
		return ['LOW', url];
	}
	return ['SD', film.Url];
}

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
 * JSON-Array (aus der Filmliste) in ein Film-Objekt umwandeln.
 * lastRecord wird für Sender/Thema-Übernahme aus vorherigem Satz genutzt.
 */
export function parseFilmRecord(
	liste: string[],
	lastListe: string[] | null
): Film | null {
	// Leere Werte aus vorherigem Satz übernehmen (Sender, Thema)
	if (lastListe) {
		for (let i = 0; i < 2; i++) {
			if (!liste[i]) {
				liste[i] = lastListe[i];
			}
		}
	}

	// Filme ohne Datum aussortieren (Livestreams)
	if (!liste[3]) return null;

	const sender = liste[0] || '';
	const thema = liste[1] || '';
	const titel = liste[2] || '';
	const datum = datumToIso(liste[3] || '');
	const zeit = liste[4] || '';
	const dauer = liste[5] || '';
	const groesse = parseInt(liste[6]) || 0;
	const beschreibung = liste[7] || '';
	const url = liste[8] || '';
	const website = liste[9] || '';

	const _id = generateFilmId(sender, thema, titel, liste[3], zeit, url);

	return {
		Sender: sender,
		Thema: thema,
		Titel: titel,
		Datum: datum,
		Zeit: zeit,
		Dauer: dauer,
		Groesse: groesse,
		Beschreibung: beschreibung,
		Url: url,
		Website: website,
		Url_Untertitel: liste[10] || '',
		Url_RTMP: liste[11] || '',
		Url_Klein: liste[12] || '',
		Url_RTMP_Klein: liste[13] || '',
		Url_HD: liste[14] || '',
		Url_RTMP_HD: liste[15] || '',
		DatumL: liste[16] || '',
		Url_History: liste[17] || '',
		Geo: liste[18] || '',
		neu: liste[19] || '',
		_id
	};
}
