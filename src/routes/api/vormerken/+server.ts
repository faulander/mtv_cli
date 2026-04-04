import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
	const { ids, dates } = await request.json();

	if (!Array.isArray(ids) || !Array.isArray(dates) || ids.length === 0) {
		return json({ msg: 'Keine Filme ausgewählt' }, { status: 400 });
	}

	const db = getDb();
	const today = new Date().toISOString().split('T')[0];
	const stmt = db.prepare(
		'INSERT OR IGNORE INTO downloads (_id, Datum, status, DatumStatus) VALUES (?, ?, ?, ?)'
	);

	let changes = 0;
	const insert = db.transaction(() => {
		for (let i = 0; i < ids.length; i++) {
			const result = stmt.run(ids[i], dates[i] || today, 'V', today);
			changes += result.changes;
		}
	});
	insert();

	return json({ msg: `${changes} von ${ids.length} Filme vorgemerkt` });
};
