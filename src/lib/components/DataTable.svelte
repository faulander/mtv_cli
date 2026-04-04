<script lang="ts" generics="T extends object">
	import { ChevronUp, ChevronDown, ChevronsUpDown } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import EmptyState from './EmptyState.svelte';

	interface Column {
		key: string;
		label: string;
		sortable?: boolean;
		class?: string;
	}

	interface Props {
		data: T[];
		columns: Column[];
		selectable?: boolean;
		pageSize?: number;
		selectedIds?: Set<string>;
		idKey?: string;
		onselect?: (ids: Set<string>) => void;
		cell?: Snippet<[{ row: T; column: Column }]>;
		emptyTitle?: string;
		emptyDescription?: string;
	}

	let {
		data,
		columns,
		selectable = false,
		pageSize = 50,
		selectedIds = $bindable(new Set<string>()),
		idKey = '_id',
		onselect,
		cell,
		emptyTitle = 'Keine Daten',
		emptyDescription = ''
	}: Props = $props();

	let sortKey = $state('');
	let sortDir = $state<'asc' | 'desc'>('asc');
	let currentPage = $state(0);

	// Sortierung
	let sortedData = $derived.by(() => {
		if (!sortKey) return data;
		const dir = sortDir === 'asc' ? 1 : -1;
		return [...data].sort((a, b) => {
			const va = String((a as Record<string, unknown>)[sortKey] ?? '');
			const vb = String((b as Record<string, unknown>)[sortKey] ?? '');
			return va.localeCompare(vb, 'de') * dir;
		});
	});

	// Paginierung
	let totalPages = $derived(Math.max(1, Math.ceil(sortedData.length / pageSize)));
	let pagedData = $derived(sortedData.slice(currentPage * pageSize, (currentPage + 1) * pageSize));

	function toggleSort(key: string) {
		if (sortKey === key) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDir = 'asc';
		}
		currentPage = 0;
	}

	function toggleSelect(id: string) {
		const next = new Set(selectedIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selectedIds = next;
		onselect?.(next);
	}

	function toggleAll() {
		if (selectedIds.size === pagedData.length) {
			selectedIds = new Set();
		} else {
			selectedIds = new Set(pagedData.map((r) => String((r as Record<string, unknown>)[idKey])));
		}
		onselect?.(selectedIds);
	}

	// Seite zurücksetzen wenn Daten sich ändern
	$effect(() => {
		data;
		currentPage = 0;
		selectedIds = new Set();
	});
</script>

{#if data.length === 0}
	<EmptyState title={emptyTitle} description={emptyDescription} />
{:else}
	<div class="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead class="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
					<tr>
						{#if selectable}
							<th class="w-10 px-3 py-3">
								<input
									type="checkbox"
									checked={pagedData.length > 0 && selectedIds.size === pagedData.length}
									onchange={toggleAll}
									class="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800"
								/>
							</th>
						{/if}
						{#each columns as col}
							<th class="px-3 py-3 font-medium text-neutral-500 dark:text-neutral-400 {col.class || ''}">
								{#if col.sortable}
									<button
										onclick={() => toggleSort(col.key)}
										class="inline-flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-200"
									>
										{col.label}
										{#if sortKey === col.key}
											{#if sortDir === 'asc'}
												<ChevronUp class="h-4 w-4" />
											{:else}
												<ChevronDown class="h-4 w-4" />
											{/if}
										{:else}
											<ChevronsUpDown class="h-3.5 w-3.5 opacity-40" />
										{/if}
									</button>
								{:else}
									{col.label}
								{/if}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
					{#each pagedData as row}
						<tr class="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
							{#if selectable}
								<td class="px-3 py-2.5">
									<input
										type="checkbox"
										checked={selectedIds.has(String((row as Record<string, unknown>)[idKey]))}
										onchange={() => toggleSelect(String((row as Record<string, unknown>)[idKey]))}
										class="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800"
									/>
								</td>
							{/if}
							{#each columns as column}
								<td class="px-3 py-2.5 {column.class || ''}">
									{#if cell}
										{@render cell({ row, column })}
									{:else}
										{(row as Record<string, unknown>)[column.key] ?? ''}
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Footer: Anzahl + Paginierung -->
		<div
			class="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm dark:border-neutral-800 dark:bg-neutral-900"
		>
			<span class="text-neutral-500 dark:text-neutral-400">
				{data.length} Einträge
				{#if selectable && selectedIds.size > 0}
					<span class="ml-1">({selectedIds.size} ausgewählt)</span>
				{/if}
			</span>

			{#if totalPages > 1}
				<div class="flex items-center gap-1">
					<button
						onclick={() => (currentPage = Math.max(0, currentPage - 1))}
						disabled={currentPage === 0}
						class="rounded px-2 py-1 text-neutral-600 hover:bg-neutral-200 disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800"
					>
						Zurück
					</button>
					<span class="px-2 text-neutral-500 dark:text-neutral-400">
						{currentPage + 1} / {totalPages}
					</span>
					<button
						onclick={() => (currentPage = Math.min(totalPages - 1, currentPage + 1))}
						disabled={currentPage >= totalPages - 1}
						class="rounded px-2 py-1 text-neutral-600 hover:bg-neutral-200 disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800"
					>
						Weiter
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
