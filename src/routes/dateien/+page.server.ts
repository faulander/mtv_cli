import type { Actions, PageServerLoad } from './$types';
import { readRecordings, deleteRecording } from '$lib/server/recordings';

export const load: PageServerLoad = async () => {
	const dateien = readRecordings();
	return { dateien };
};

export const actions: Actions = {
	loeschen: async ({ request }) => {
		const formData = await request.formData();
		const dateiname = formData.get('dateiname')?.toString() || '';

		const result = deleteRecording(dateiname);
		const dateien = readRecordings();

		return { dateien, ...result };
	}
};
