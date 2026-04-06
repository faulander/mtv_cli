import type { Actions, PageServerLoad } from './$types';
import {
	readSuchbegriffe,
	addSuchbegriff,
	deleteSuchbegriff,
	matchSuchbegriffe
} from '$lib/server/suchbegriffe';

export const load: PageServerLoad = async () => {
	const begriffe = readSuchbegriffe();
	return { begriffe };
};

export const actions: Actions = {
	add: async ({ request }) => {
		const formData = await request.formData();
		const suchbegriff = formData.get('suchbegriff')?.toString().trim();

		if (!suchbegriff) {
			return { error: 'Bitte einen Suchbegriff eingeben' };
		}

		const added = addSuchbegriff(suchbegriff);
		if (added === 0) {
			return { error: 'Suchbegriff existiert bereits' };
		}

		return { added: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = parseInt(formData.get('id')?.toString() || '0');
		if (id) {
			deleteSuchbegriff(id);
		}
		return { deleted: true };
	},

	match: async () => {
		const count = matchSuchbegriffe();
		return { matched: count };
	}
};
