<script lang="ts">
	import { Plus, Trash2, Play } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { isoToGerman } from '$lib/utils/date';

	let { data, form } = $props();

	let begriffe = $derived(data.begriffe);
	let matching = $state(false);
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-2xl font-bold tracking-tight">Suchbegriffe</h2>
		<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
			Gespeicherte Suchbegriffe werden automatisch gegen die Filmliste abgeglichen.
			Treffer werden zum Download vorgemerkt.
		</p>
	</div>

	<!-- Neuen Suchbegriff hinzufügen -->
	<section class="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
		<h3 class="mb-3 text-sm font-semibold text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
			Neuer Suchbegriff
		</h3>
		<form
			method="POST"
			action="?/add"
			use:enhance={() => {
				return async ({ update, result }) => {
					await update({ reset: true });
					if (result.type === 'success') {
						const d = result.data as Record<string, unknown>;
						if (d?.added) {
							toastStore.success('Suchbegriff gespeichert');
						} else if (d?.error) {
							toastStore.error(String(d.error));
						}
					}
				};
			}}
			class="flex gap-3"
		>
			<input
				type="text"
				name="suchbegriff"
				placeholder="z.B. thema:Tatort oder Schottland oder sender:arte Natur"
				required
				class="flex-1 rounded-lg border-neutral-300 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
			/>
			<button
				type="submit"
				class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
			>
				<Plus class="h-4 w-4" />
				Hinzufügen
			</button>
		</form>
		<p class="mt-2 text-xs text-neutral-400">
			Syntax: Freitext, oder feld:wert (sender:, thema:, titel:, beschreibung:, datum:). Mehrere Begriffe mit Leerzeichen trennen.
		</p>
	</section>

	<!-- Abgleich starten -->
	<div class="flex items-center gap-3">
		<form
			method="POST"
			action="?/match"
			use:enhance={() => {
				matching = true;
				return async ({ update, result }) => {
					await update({ reset: false });
					matching = false;
					if (result.type === 'success') {
						const d = result.data as Record<string, unknown>;
						const count = typeof d?.matched === 'number' ? d.matched : 0;
						if (count > 0) {
							toastStore.success(`${count} neue Filme vorgemerkt`);
						} else {
							toastStore.info('Keine neuen Treffer gefunden');
						}
					}
				};
			}}
		>
			<button
				type="submit"
				disabled={matching || begriffe.length === 0}
				class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
			>
				<Play class="h-4 w-4" />
				{matching ? 'Abgleich läuft...' : 'Jetzt abgleichen'}
			</button>
		</form>
		<span class="text-sm text-neutral-500 dark:text-neutral-400">
			{begriffe.length} {begriffe.length === 1 ? 'Suchbegriff' : 'Suchbegriffe'} gespeichert
		</span>
	</div>

	<!-- Liste der gespeicherten Suchbegriffe -->
	{#if begriffe.length > 0}
		<section class="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-neutral-200 dark:border-neutral-800">
						<th class="px-4 py-3 text-left font-medium text-neutral-500 dark:text-neutral-400">
							Suchbegriff
						</th>
						<th class="px-4 py-3 text-left font-medium text-neutral-500 dark:text-neutral-400 w-32">
							Erstellt
						</th>
						<th class="px-4 py-3 w-16"></th>
					</tr>
				</thead>
				<tbody>
					{#each begriffe as begriff}
						<tr class="border-b border-neutral-100 last:border-0 dark:border-neutral-800/50">
							<td class="px-4 py-3 font-mono text-sm">
								{begriff.suchbegriff}
							</td>
							<td class="px-4 py-3 text-neutral-500 dark:text-neutral-400">
								{isoToGerman(begriff.erstellt)}
							</td>
							<td class="px-4 py-3">
								<form
									method="POST"
									action="?/delete"
									use:enhance={() => {
										return async ({ update }) => {
											await update({ reset: false });
											toastStore.success('Suchbegriff gelöscht');
										};
									}}
								>
									<input type="hidden" name="id" value={begriff._id} />
									<button
										type="submit"
										class="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
										title="Löschen"
									>
										<Trash2 class="h-4 w-4" />
									</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</section>
	{:else}
		<div class="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-center dark:border-neutral-700 dark:bg-neutral-900/50">
			<p class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
				Noch keine Suchbegriffe gespeichert
			</p>
			<p class="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
				Füge Suchbegriffe hinzu, um Filme automatisch zum Download vorzumerken.
			</p>
		</div>
	{/if}
</div>
