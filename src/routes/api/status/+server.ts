import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllTasks } from '$lib/server/background-tasks';

export const GET: RequestHandler = async () => {
	return json(getAllTasks());
};
