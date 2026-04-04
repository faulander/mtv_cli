import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { runTask, getTask } from '$lib/server/background-tasks';
import { updateFilmList } from '$lib/server/film-update';

export const POST: RequestHandler = async () => {
	const current = getTask('aktualisieren');
	if (current.status === 'running') {
		return json({ msg: 'Aktualisierung läuft bereits' });
	}

	runTask('aktualisieren', updateFilmList);
	return json({ msg: 'Aktualisierung gestartet' });
};
