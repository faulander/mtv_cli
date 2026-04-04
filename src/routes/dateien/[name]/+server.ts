import type { RequestHandler } from './$types';
import { existsSync } from 'node:fs';
import { basename } from 'node:path';

export const GET: RequestHandler = async ({ params }) => {
	const dateiname = decodeURIComponent(params.name);

	if (!existsSync(dateiname)) {
		return new Response(JSON.stringify({ msg: 'Datei nicht gefunden' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const file = Bun.file(dateiname);
	const filename = basename(dateiname);

	return new Response(file.stream(), {
		headers: {
			'Content-Type': 'application/octet-stream',
			'Content-Disposition': `attachment; filename="${filename}"`,
			'Content-Length': String(file.size)
		}
	});
};
