<script lang="ts">
	import { Search } from '@lucide/svelte';
	import { enhance } from '$app/forms';

	interface Props {
		loading?: boolean;
	}

	let { loading = false }: Props = $props();
</script>

<form method="POST" action="?/suche" use:enhance class="space-y-4">
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<!-- Global -->
		<div class="sm:col-span-2 lg:col-span-3">
			<label for="global" class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
				Volltextsuche
			</label>
			<div class="relative">
				<Search
					class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400"
				/>
				<input
					type="text"
					name="global"
					id="global"
					placeholder="Suchbegriff eingeben..."
					class="w-full rounded-lg border-neutral-300 py-2 pr-3 pl-10 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
				/>
			</div>
		</div>

		<!-- Sender -->
		<div>
			<label for="sender" class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
				Sender
			</label>
			<input
				type="text"
				name="sender"
				id="sender"
				placeholder="z.B. ARD, ZDF"
				class="w-full rounded-lg border-neutral-300 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
			/>
		</div>

		<!-- Thema -->
		<div>
			<label for="thema" class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
				Thema
			</label>
			<input
				type="text"
				name="thema"
				id="thema"
				placeholder="z.B. Terra X"
				class="w-full rounded-lg border-neutral-300 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
			/>
		</div>

		<!-- Datum -->
		<div>
			<label for="datum" class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
				Datum
			</label>
			<input
				type="text"
				name="datum"
				id="datum"
				placeholder="z.B. >01.01.25"
				class="w-full rounded-lg border-neutral-300 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
			/>
			<p class="mt-1 text-xs text-neutral-400">
				TT.MM.JJ &middot; &gt;, &lt;, &gt;=, &lt;= &middot; Von-Bis
			</p>
		</div>

		<!-- Titel -->
		<div>
			<label for="titel" class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
				Titel
			</label>
			<input
				type="text"
				name="titel"
				id="titel"
				placeholder="z.B. Nachrichten"
				class="w-full rounded-lg border-neutral-300 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
			/>
		</div>

		<!-- Beschreibung -->
		<div>
			<label for="beschreibung" class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
				Beschreibung
			</label>
			<input
				type="text"
				name="beschreibung"
				id="beschreibung"
				placeholder="Stichwort in Beschreibung"
				class="w-full rounded-lg border-neutral-300 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
			/>
		</div>
	</div>

	<div class="flex justify-end">
		<button
			type="submit"
			disabled={loading}
			class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
		>
			<Search class="h-4 w-4" />
			Suchen
		</button>
	</div>
</form>
