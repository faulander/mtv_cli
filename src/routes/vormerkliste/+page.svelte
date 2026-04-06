<script lang="ts">
	import { Trash2 } from '@lucide/svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { isoToGerman } from '$lib/utils/date';
	import { onDestroy } from 'svelte';
	import type { Download, DownloadStatus } from '$lib/types/film';

	let { data, form } = $props();

	let downloads: Download[] = $derived(form?.downloads ?? data.downloads ?? []);
	let selectedIds = $state(new Set<string>());

	// Download-Status polling
	let taskStatus = $state<string>('idle');
	let taskMessage = $state('');
	let taskProgress = $state<number | undefined>(undefined);
	let pollTimer: ReturnType<typeof setInterval> | null = null;

	function startPolling() {
		if (pollTimer) return;
		pollTimer = setInterval(pollStatus, 2000);
		pollStatus();
	}

	function stopPolling() {
		if (pollTimer) {
			clearInterval(pollTimer);
			pollTimer = null;
		}
	}

	async function pollStatus() {
		try {
			const res = await fetch('/api/status');
			const tasks = await res.json();
			const dl = tasks.download;
			if (dl) {
				taskStatus = dl.status;
				taskMessage = dl.message;
				taskProgress = dl.progress;

				if (dl.status === 'running') {
					// Refresh the list to reflect status changes (V→A→K/F)
					invalidateAll();
				} else if (dl.status === 'complete' || dl.status === 'error') {
					invalidateAll();
					stopPolling();
				}
			} else {
				taskStatus = 'idle';
				taskMessage = '';
				taskProgress = undefined;
			}
		} catch {
			// ignore fetch errors
		}
	}

	// Start polling on mount, stop on destroy
	startPolling();
	onDestroy(stopPolling);

	const columns = [
		{ key: 'status', label: 'Status', sortable: true, class: 'w-28' },
		{ key: 'Sender', label: 'Sender', sortable: true, class: 'w-20' },
		{ key: 'Thema', label: 'Thema', sortable: true },
		{ key: 'Titel', label: 'Titel', sortable: true },
		{ key: 'Datum', label: 'Datum', sortable: true, class: 'w-24' },
		{ key: 'Dauer', label: 'Dauer', sortable: true, class: 'w-20' },
		{ key: 'DatumStatus', label: 'Status-Datum', sortable: true, class: 'w-28' }
	];

	function getRowClass(row: Download): string {
		if (row.status === 'A') return 'bg-cyan-50 dark:bg-cyan-950/30';
		if (row.status === 'K') return 'bg-green-50 dark:bg-green-950/20';
		if (row.status === 'F') return 'bg-red-50 dark:bg-red-950/20';
		return '';
	}
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-2xl font-bold tracking-tight">Vormerkliste</h2>
		<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
			Für den Download vorgemerkte Filme
		</p>
	</div>

	<!-- Download-Fortschritt -->
	{#if taskStatus === 'running'}
		<div class="rounded-xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-950/30">
			<div class="flex items-center justify-between text-sm">
				<span class="font-medium text-cyan-800 dark:text-cyan-200">
					Download läuft
				</span>
				<span class="text-cyan-600 dark:text-cyan-400">
					{taskMessage}
				</span>
			</div>
			{#if taskProgress !== undefined}
				<div class="mt-2 h-2 overflow-hidden rounded-full bg-cyan-200 dark:bg-cyan-800">
					<div
						class="h-full rounded-full bg-cyan-600 transition-all duration-500 dark:bg-cyan-400"
						style="width: {taskProgress}%"
					></div>
				</div>
			{/if}
		</div>
	{:else if taskStatus === 'complete' && taskMessage}
		<div class="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
			<span class="text-sm font-medium text-green-800 dark:text-green-200">
				{taskMessage}
			</span>
		</div>
	{:else if taskStatus === 'error' && taskMessage}
		<div class="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
			<span class="text-sm font-medium text-red-800 dark:text-red-200">
				{taskMessage}
			</span>
		</div>
	{/if}

	{#if selectedIds.size > 0}
		<form method="POST" action="?/loeschen" use:enhance={() => {
			return async ({ update, result }) => {
				await update({ reset: false });
				if (result.type === 'success') {
					const d = result.data as Record<string, unknown> | undefined;
					if (d?.message) toastStore.success(String(d.message));
				}
				selectedIds = new Set();
			};
		}}>
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
		rowClass={getRowClass}
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
