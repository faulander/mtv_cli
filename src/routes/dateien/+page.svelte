<script lang="ts">
	import { Trash2, Download } from '@lucide/svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { enhance } from '$app/forms';
	import { isoToGerman } from '$lib/utils/date';
	import type { Recording } from '$lib/types/film';

	let { data, form } = $props();

	let dateien = $derived(form?.dateien ?? data.dateien ?? []);

	const columns = [
		{ key: 'Sender', label: 'Sender', sortable: true, class: 'w-20' },
		{ key: 'Datei', label: 'Datei', sortable: true },
		{ key: 'Titel', label: 'Titel', sortable: true },
		{ key: 'DatumFilm', label: 'Film-Datum', sortable: true, class: 'w-28' },
		{ key: 'DatumDatei', label: 'Download-Datum', sortable: true, class: 'w-28' },
		{ key: '_actions', label: '', class: 'w-24' }
	];

</script>

<div class="space-y-6">
	<div>
		<h2 class="text-2xl font-bold tracking-tight">Dateien</h2>
		<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
			Heruntergeladene Filme verwalten
		</p>
	</div>

	<DataTable
		data={dateien}
		{columns}
		idKey="Dateiname"
		emptyTitle="Keine Dateien vorhanden"
		emptyDescription="Filme herunterladen, um sie hier zu sehen"
	>
		{#snippet cell({ row, column })}
			{#if column.key === 'DatumFilm' || column.key === 'DatumDatei'}
				{isoToGerman(String(row[column.key] ?? ''))}
			{:else if column.key === 'Titel'}
				<div title={String((row as Record<string, unknown>)['Beschreibung'] ?? '')}>
					{row[column.key]}
				</div>
			{:else if column.key === '_actions'}
				<div class="flex items-center gap-1">
					<a
						href="/dateien/{encodeURIComponent(String((row as Record<string, unknown>)['Dateiname']))}"
						class="rounded p-1.5 text-neutral-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
						title="Herunterladen"
					>
						<Download class="h-4 w-4" />
					</a>
					<form method="POST" action="?/loeschen" use:enhance={() => {
						return async ({ update, result }) => {
							await update({ reset: false });
							if (result.type === 'success') {
								const d = result.data as Record<string, unknown> | undefined;
								if (d?.message) {
									if (d.success) toastStore.success(String(d.message));
									else toastStore.error(String(d.message));
								}
							}
						};
					}}>
						<input type="hidden" name="dateiname" value={String((row as Record<string, unknown>)['Dateiname'])} />
						<button
							type="submit"
							class="rounded p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
							title="Löschen"
						>
							<Trash2 class="h-4 w-4" />
						</button>
					</form>
				</div>
			{:else}
				{row[column.key] ?? ''}
			{/if}
		{/snippet}
	</DataTable>
</div>
