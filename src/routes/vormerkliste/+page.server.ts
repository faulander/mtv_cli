import type { Actions, PageServerLoad } from './$types';
import { readDownloads, deleteDownloads } from '$lib/server/downloads';

export const load: PageServerLoad = async () => {
	const downloads = readDownloads();
	return { downloads };
};

export const actions: Actions = {
	loeschen: async ({ request }) => {
		const formData = await request.formData();
		const idsRaw = formData.get('ids')?.toString() || '';
		const ids = idsRaw.split(',').filter(Boolean);

		const changes = deleteDownloads(ids);
		const downloads = readDownloads();

		return { downloads, message: `${changes} Einträge gelöscht` };
	}
};
