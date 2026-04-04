import type { Qualitaet } from './film';

export interface AppConfig {
	MSG_LEVEL: string;
	DATE_CUTOFF: number;
	DAUER_CUTOFF: number;
	NUM_DOWNLOADS: number;
	ZIEL_DOWNLOADS: string;
	CMD_DOWNLOADS: string;
	CMD_DOWNLOADS_M3U: string;
	QUALITAET: Qualitaet;
	WEB_PORT: number;
	WEB_HOST: string;
	UPDATE_INTERVAL: number;
}

export const DEFAULT_CONFIG: AppConfig = {
	MSG_LEVEL: 'INFO',
	DATE_CUTOFF: 30,
	DAUER_CUTOFF: 5,
	NUM_DOWNLOADS: 2,
	ZIEL_DOWNLOADS: '/downloads/{Sender}_{Datum}_{Thema}_{Titel}.{ext}',
	CMD_DOWNLOADS: "wget -q -c -O '{ziel}' '{url}'",
	CMD_DOWNLOADS_M3U: "wget -q -O - '{url}' | grep '^http' | wget -q -O '{ziel}' -i -",
	QUALITAET: 'LOW',
	WEB_PORT: 8026,
	WEB_HOST: '0.0.0.0',
	UPDATE_INTERVAL: 24
};
