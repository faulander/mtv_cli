export interface Film {
	[key: string]: unknown;
	Sender: string;
	Thema: string;
	Titel: string;
	Datum: string;
	Zeit: string;
	Dauer: string;
	Groesse: number;
	Beschreibung: string;
	Url: string;
	Website: string;
	Url_Untertitel: string;
	Url_RTMP: string;
	Url_Klein: string;
	Url_RTMP_Klein: string;
	Url_HD: string;
	Url_RTMP_HD: string;
	DatumL: string;
	Url_History: string;
	Geo: string;
	neu: string;
	_id: string;
}

export type Qualitaet = 'HD' | 'SD' | 'LOW';

export type DownloadStatus = 'V' | 'S' | 'A' | 'F' | 'K';

export const DOWNLOAD_STATUS_LABELS: Record<DownloadStatus, string> = {
	V: 'Vorgemerkt',
	S: 'Sofort',
	A: 'Aktiv',
	F: 'Fehler',
	K: 'Komplett'
};

export interface Download {
	[key: string]: unknown;
	_id: string;
	Datum: string;
	status: DownloadStatus;
	DatumStatus: string;
	// Joined fields from filme
	Sender?: string;
	Thema?: string;
	Titel?: string;
	Dauer?: string;
}

export interface Recording {
	[key: string]: unknown;
	Sender: string;
	Titel: string;
	Beschreibung: string;
	DatumFilm: string;
	Dateiname: string;
	DatumDatei: string;
}

export interface StatusEntry {
	key: string;
	Zeit: string;
	text: string | null;
}
