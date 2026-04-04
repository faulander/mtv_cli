<script lang="ts">
	import { Save } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { toastStore } from '$lib/stores/toast.svelte';

	let { data, form } = $props();

	let config = $derived(form?.config ?? data.config);

	$effect(() => {
		if (form?.saved) {
			toastStore.success('Einstellungen gespeichert');
		}
	});
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-2xl font-bold tracking-tight">Einstellungen</h2>
		<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
			Konfiguration der Mediathek-Anwendung
		</p>
	</div>

	<form method="POST" use:enhance class="space-y-8">
		<!-- Allgemein -->
		<section class="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
			<h3 class="mb-4 text-lg font-semibold">Allgemein</h3>
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="MSG_LEVEL" class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
						Log-Level
					</label>
					<select
						name="MSG_LEVEL"
						id="MSG_LEVEL"
						value={config.MSG_LEVEL}
						class="w-full rounded-lg border-neutral-300 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
					>
						<option value="TRACE">TRACE</option>
						<option value="DEBUG">DEBUG</option>
						<option value="INFO">INFO</option>
						<option value="WARN">WARN</option>
						<option value="ERROR">ERROR</option>
					</select>
				</div>

				<div>
					<label for="UPDATE_INTERVAL" class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
						Aktualisierungsintervall (Stunden)
					</label>
					<input
						type="number"
						name="UPDATE_INTERVAL"
						id="UPDATE_INTERVAL"
						value={config.UPDATE_INTERVAL}
						min="1"
						max="168"
						class="w-full rounded-lg border-neutral-300 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
					/>
				</div>
			</div>
		</section>

		<!-- Filter -->
		<section class="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
			<h3 class="mb-4 text-lg font-semibold">Filter</h3>
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="DATE_CUTOFF" class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
						Filme älter als (Tage)
					</label>
					<input
						type="number"
						name="DATE_CUTOFF"
						id="DATE_CUTOFF"
						value={config.DATE_CUTOFF}
						min="1"
						max="365"
						class="w-full rounded-lg border-neutral-300 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
					/>
					<p class="mt-1 text-xs text-neutral-400">Ältere Filme werden beim Import ignoriert</p>
				</div>

				<div>
					<label for="DAUER_CUTOFF" class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
						Filme kürzer als (Minuten)
					</label>
					<input
						type="number"
						name="DAUER_CUTOFF"
						id="DAUER_CUTOFF"
						value={config.DAUER_CUTOFF}
						min="0"
						max="120"
						class="w-full rounded-lg border-neutral-300 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
					/>
					<p class="mt-1 text-xs text-neutral-400">Kürzere Filme werden beim Import ignoriert</p>
				</div>
			</div>
		</section>

		<!-- Downloads -->
		<section class="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
			<h3 class="mb-4 text-lg font-semibold">Downloads</h3>
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="QUALITAET" class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
						Qualität
					</label>
					<select
						name="QUALITAET"
						id="QUALITAET"
						value={config.QUALITAET}
						class="w-full rounded-lg border-neutral-300 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
					>
						<option value="HD">HD</option>
						<option value="SD">SD</option>
						<option value="LOW">LOW</option>
					</select>
				</div>

				<div>
					<label for="NUM_DOWNLOADS" class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
						Parallele Downloads
					</label>
					<input
						type="number"
						name="NUM_DOWNLOADS"
						id="NUM_DOWNLOADS"
						value={config.NUM_DOWNLOADS}
						min="1"
						max="10"
						class="w-full rounded-lg border-neutral-300 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
					/>
				</div>

				<div class="sm:col-span-2">
					<label for="ZIEL_DOWNLOADS" class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
						Zielverzeichnis
					</label>
					<input
						type="text"
						name="ZIEL_DOWNLOADS"
						id="ZIEL_DOWNLOADS"
						value={config.ZIEL_DOWNLOADS}
						class="w-full rounded-lg border-neutral-300 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
					/>
					<p class="mt-1 text-xs text-neutral-400">
						Variablen: {'{Sender}'}, {'{Datum}'}, {'{Thema}'}, {'{Titel}'}, {'{ext}'}
					</p>
				</div>

				<div class="sm:col-span-2">
					<label for="CMD_DOWNLOADS" class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
						Download-Befehl
					</label>
					<input
						type="text"
						name="CMD_DOWNLOADS"
						id="CMD_DOWNLOADS"
						value={config.CMD_DOWNLOADS}
						class="w-full rounded-lg border-neutral-300 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
					/>
					<p class="mt-1 text-xs text-neutral-400">
						Variablen: {'{ziel}'}, {'{url}'}
					</p>
				</div>

				<div class="sm:col-span-2">
					<label for="CMD_DOWNLOADS_M3U" class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
						Download-Befehl (M3U)
					</label>
					<input
						type="text"
						name="CMD_DOWNLOADS_M3U"
						id="CMD_DOWNLOADS_M3U"
						value={config.CMD_DOWNLOADS_M3U}
						class="w-full rounded-lg border-neutral-300 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
					/>
				</div>
			</div>
		</section>

		<!-- Webserver -->
		<section class="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
			<h3 class="mb-4 text-lg font-semibold">Webserver</h3>
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="WEB_HOST" class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
						Host
					</label>
					<input
						type="text"
						name="WEB_HOST"
						id="WEB_HOST"
						value={config.WEB_HOST}
						class="w-full rounded-lg border-neutral-300 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
					/>
				</div>

				<div>
					<label for="WEB_PORT" class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
						Port
					</label>
					<input
						type="number"
						name="WEB_PORT"
						id="WEB_PORT"
						value={config.WEB_PORT}
						min="1"
						max="65535"
						class="w-full rounded-lg border-neutral-300 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
					/>
				</div>
			</div>
		</section>

		<!-- Speichern -->
		<div class="flex justify-end">
			<button
				type="submit"
				class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
			>
				<Save class="h-4 w-4" />
				Speichern
			</button>
		</div>
	</form>
</div>
