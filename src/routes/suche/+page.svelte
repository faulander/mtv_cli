<script lang="ts">
	import { BookmarkPlus } from '@lucide/svelte';
	import SearchForm from '$lib/components/SearchForm.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { isoToGerman } from '$lib/utils/date';
	import type { Film } from '$lib/types/film';

	let { form } = $props();

	let results: Film[] = $derived(form?.results ?? []);
	let searched = $derived(form?.searched ?? false);
	let selectedIds = $state(new Set<string>());
	let saving = $state(false);

	const columns = [
		{ key: 'Sender', label: 'Sender', sortable: true, class: 'w-20' },
		{ key: 'Thema', label: 'Thema', sortable: true },
		{ key: 'Titel', label: 'Titel', sortable: true },
		{ key: 'Datum', label: 'Datum', sortable: true, class: 'w-24' },
		{ key: 'Dauer', label: 'Dauer', sortable: true, class: 'w-20' }
	];

	async function vormerken() {
		if (selectedIds.size === 0) return;
		saving = true;

		const selected = results.filter((f) => selectedIds.has(f._id));
		const ids = selected.map((f) => f._id);
		const dates = selected.map((f) => f.Datum);

		try {
			const res = await fetch('/api/vormerken', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ids, dates })
			});
			const data = await res.json();
			toastStore.success(data.msg || `${ids.length} Filme vorgemerkt`);
			selectedIds = new Set();
		} catch {
			toastStore.error('Vormerken fehlgeschlagen');
		} finally {
			saving = false;
		}
	}
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-2xl font-bold tracking-tight">Suche</h2>
		<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
			Filme in der Mediathek-Datenbank suchen
		</p>
	</div>

	<div class="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
		<SearchForm />
	</div>

	{#if searched}
		<!-- Aktionsleiste -->
		{#if results.length > 0 && selectedIds.size > 0}
			<div class="flex items-center gap-3">
				<button
					onclick={vormerken}
					disabled={saving}
					class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
				>
					<BookmarkPlus class="h-4 w-4" />
					{selectedIds.size} Filme vormerken
				</button>
			</div>
		{/if}

		<DataTable
			data={results}
			{columns}
			selectable={true}
			bind:selectedIds
			emptyTitle="Keine Treffer"
			emptyDescription="Versuche andere Suchbegriffe"
		>
			{#snippet cell({ row, column })}
				{#if column.key === 'Datum'}
					{isoToGerman(String(row[column.key] ?? ''))}
				{:else if column.key === 'Titel'}
					<div title={String(row['Beschreibung'] ?? '')}>
						{row[column.key]}
					</div>
				{:else}
					{row[column.key] ?? ''}
				{/if}
			{/snippet}
		</DataTable>
	{/if}
</div>
