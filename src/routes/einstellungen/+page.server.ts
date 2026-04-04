import type { Actions, PageServerLoad } from './$types';
import { loadConfig, saveConfig } from '$lib/server/settings';
import type { AppConfig } from '$lib/types/config';
import type { Qualitaet } from '$lib/types/film';

export const load: PageServerLoad = async () => {
	const config = loadConfig();
	return { config };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const config: AppConfig = {
			MSG_LEVEL: formData.get('MSG_LEVEL')?.toString() || 'INFO',
			DATE_CUTOFF: parseInt(formData.get('DATE_CUTOFF')?.toString() || '30') || 30,
			DAUER_CUTOFF: parseInt(formData.get('DAUER_CUTOFF')?.toString() || '5') || 5,
			NUM_DOWNLOADS: parseInt(formData.get('NUM_DOWNLOADS')?.toString() || '2') || 2,
			ZIEL_DOWNLOADS: formData.get('ZIEL_DOWNLOADS')?.toString() || '/downloads/{Sender}_{Datum}_{Thema}_{Titel}.{ext}',
			CMD_DOWNLOADS: formData.get('CMD_DOWNLOADS')?.toString() || "wget -q -c -O '{ziel}' '{url}'",
			CMD_DOWNLOADS_M3U: formData.get('CMD_DOWNLOADS_M3U')?.toString() || "wget -q -O - '{url}' | grep '^http' | wget -q -O '{ziel}' -i -",
			QUALITAET: (formData.get('QUALITAET')?.toString() || 'LOW') as Qualitaet,
			WEB_PORT: parseInt(formData.get('WEB_PORT')?.toString() || '8026') || 8026,
			WEB_HOST: formData.get('WEB_HOST')?.toString() || '0.0.0.0',
			UPDATE_INTERVAL: parseInt(formData.get('UPDATE_INTERVAL')?.toString() || '24') || 24
		};

		saveConfig(config);
		return { config, saved: true };
	}
};
