<script lang="ts">
	import { AlertTriangle } from '@lucide/svelte';

	interface Props {
		open: boolean;
		title?: string;
		message?: string;
		confirmLabel?: string;
		onconfirm: () => void;
		oncancel: () => void;
	}

	let {
		open = false,
		title = 'Bestätigung',
		message = 'Bist du sicher?',
		confirmLabel = 'Ja, löschen',
		onconfirm,
		oncancel
	}: Props = $props();
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<!-- Overlay -->
		<button class="fixed inset-0 bg-black/50" onclick={oncancel} aria-label="Schließen"></button>

		<!-- Dialog -->
		<div class="relative w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
			<div class="flex items-start gap-4">
				<div class="rounded-full bg-red-100 p-2 dark:bg-red-950">
					<AlertTriangle class="h-5 w-5 text-red-600 dark:text-red-400" />
				</div>
				<div class="flex-1">
					<h3 class="text-lg font-semibold">{title}</h3>
					<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{message}</p>
				</div>
			</div>

			<div class="mt-6 flex justify-end gap-3">
				<button
					onclick={oncancel}
					class="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
				>
					Abbrechen
				</button>
				<button
					onclick={onconfirm}
					class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
				>
					{confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}
