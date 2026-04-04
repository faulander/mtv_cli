import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { runTask, getTask } from '$lib/server/background-tasks';
import { downloadFilme } from '$lib/server/download-manager';

export const POST: RequestHandler = async () => {
	const current = getTask('download');
	if (current.status === 'running') {
		return json({ msg: 'Downloads laufen bereits' });
	}

	runTask('download', downloadFilme);
	return json({ msg: 'Downloads gestartet' });
};
