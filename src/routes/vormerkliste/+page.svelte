<script lang="ts">
	import { Trash2 } from '@lucide/svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { enhance } from '$app/forms';
	import { isoToGerman } from '$lib/utils/date';
	import type { Download, DownloadStatus } from '$lib/types/film';

	let { data, form } = $props();

	let downloads: Download[] = $derived(form?.downloads ?? data.downloads ?? []);
	let selectedIds = $state(new Set<string>());

	const columns = [
		{ key: 'status', label: 'Status', sortable: true, class: 'w-28' },
		{ key: 'Sender', label: 'Sender', sortable: true, class: 'w-20' },
		{ key: 'Thema', label: 'Thema', sortable: true },
		{ key: 'Titel', label: 'Titel', sortable: true },
		{ key: 'Datum', label: 'Datum', sortable: true, class: 'w-24' },
		{ key: 'Dauer', label: 'Dauer', sortable: true, class: 'w-20' },
		{ key: 'DatumStatus', label: 'Status-Datum', sortable: true, class: 'w-28' }
	];

	$effect(() => {
		if (form?.message) {
			toastStore.success(form.message);
		}
	});
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-2xl font-bold tracking-tight">Vormerkliste</h2>
		<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
			Für den Download vorgemerkte Filme
		</p>
	</div>

	{#if selectedIds.size > 0}
		<form method="POST" action="?/loeschen" use:enhance>
			<input type="hidden" name="ids" value={[...selectedIds].join(',')} />
			<button
				type="submit"
				class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
			>
				<Trash2 class="h-4 w-4" />
				{selectedIds.size} Einträge löschen
			</button>
		</form>
	{/if}

	<DataTable
		data={downloads}
		{columns}
		selectable={true}
		bind:selectedIds
		emptyTitle="Keine vorgemerkten Filme"
		emptyDescription="Filme über die Suche vormerken"
	>
		{#snippet cell({ row, column })}
			{#if column.key === 'status'}
				<StatusBadge status={String(row.status) as DownloadStatus} />
			{:else if column.key === 'Datum' || column.key === 'DatumStatus'}
				{isoToGerman(String(row[column.key] ?? ''))}
			{:else}
				{row[column.key] ?? ''}
			{/if}
		{/snippet}
	</DataTable>
</div>
