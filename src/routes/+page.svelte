<script lang="ts">
	import { Film, Database, Clock, RefreshCw, Download } from '@lucide/svelte';
	import { formatTimestamp } from '$lib/utils/date';

	let { data } = $props();

	let stats = $derived([
		{
			label: 'Filme in der Datenbank',
			value: data.anzahlFilme.toLocaleString('de-DE'),
			icon: Film,
			color: 'text-blue-600 dark:text-blue-400',
			bg: 'bg-blue-50 dark:bg-blue-950'
		},
		{
			label: 'Letzte Aktualisierung',
			value: data.letzteAktualisierung
				? formatTimestamp(data.letzteAktualisierung)
				: 'Noch nicht aktualisiert',
			icon: Clock,
			color: 'text-emerald-600 dark:text-emerald-400',
			bg: 'bg-emerald-50 dark:bg-emerald-950'
		}
	]);
</script>

<div class="space-y-8">
	<!-- Header -->
	<div>
		<h2 class="text-2xl font-bold tracking-tight">Dashboard</h2>
		<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
			Übersicht über die Mediathek-Datenbank
		</p>
	</div>

	<!-- Statistik-Karten -->
	<div class="grid gap-4 sm:grid-cols-2">
		{#each stats as stat}
			<div
				class="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
			>
				<div class="flex items-center gap-4">
					<div class="rounded-lg p-3 {stat.bg}">
						<stat.icon class="h-6 w-6 {stat.color}" />
					</div>
					<div>
						<p class="text-sm font-medium text-neutral-500 dark:text-neutral-400">
							{stat.label}
						</p>
						<p class="mt-1 text-xl font-semibold">{stat.value}</p>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Schnellaktionen -->
	<div>
		<h3 class="mb-3 text-lg font-semibold">Schnellaktionen</h3>
		<div class="grid gap-3 sm:grid-cols-3">
			<a
				href="/suche"
				class="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-700 dark:hover:bg-blue-950"
			>
				<Database class="h-5 w-5 text-blue-600 dark:text-blue-400" />
				<span class="text-sm font-medium">Filme suchen</span>
			</a>
			<button
				onclick={async () => {
					await fetch('/api/aktualisieren', { method: 'POST' });
					window.dispatchEvent(
						new CustomEvent('mtv-toast', {
							detail: { message: 'Aktualisierung gestartet', type: 'info' }
						})
					);
				}}
				class="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-emerald-700 dark:hover:bg-emerald-950"
			>
				<RefreshCw class="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
				<span class="text-sm font-medium">Filmliste aktualisieren</span>
			</button>
			<button
				onclick={async () => {
					await fetch('/api/download', { method: 'POST' });
					window.dispatchEvent(
						new CustomEvent('mtv-toast', {
							detail: { message: 'Downloads gestartet', type: 'info' }
						})
					);
				}}
				class="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-purple-300 hover:bg-purple-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-purple-700 dark:hover:bg-purple-950"
			>
				<Download class="h-5 w-5 text-purple-600 dark:text-purple-400" />
				<span class="text-sm font-medium">Downloads starten</span>
			</button>
		</div>
	</div>
</div>
