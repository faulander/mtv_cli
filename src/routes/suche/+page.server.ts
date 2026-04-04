import type { Actions, PageServerLoad } from './$types';
import { buildQuery, formToSearchTerms } from '$lib/server/search-parser';
import { executeQuery } from '$lib/server/filmdb';
import type { Film } from '$lib/types/film';

export const load: PageServerLoad = async () => {
	return { results: [] as Film[], searched: false };
};

export const actions: Actions = {
	suche: async ({ request }) => {
		const formData = await request.formData();
		const terms = formToSearchTerms(formData);

		if (!terms.length) {
			return { results: [], searched: true };
		}

		const query = buildQuery(terms);
		const results = executeQuery(query);

		return { results, searched: true };
	}
};
