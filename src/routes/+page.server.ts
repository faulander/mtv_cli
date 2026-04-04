import type { PageServerLoad } from './$types';
import { readStatus, getFilmCount } from '$lib/server/filmdb';

export const load: PageServerLoad = async () => {
	const statusRows = readStatus(['_akt', '_anzahl']);
	let letzteAktualisierung = '';
	let anzahlFilme = 0;

	for (const row of statusRows) {
		if (row.key === '_akt') {
			letzteAktualisierung = row.Zeit || '';
		} else if (row.key === '_anzahl') {
			anzahlFilme = parseInt(row.text || '0') || 0;
		}
	}

	// Fallback: direkte Zählung
	if (!anzahlFilme) {
		anzahlFilme = getFilmCount();
	}

	return { letzteAktualisierung, anzahlFilme };
};
