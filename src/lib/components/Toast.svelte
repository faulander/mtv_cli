<script lang="ts">
	import { X, CheckCircle, AlertCircle, Info } from '@lucide/svelte';
	import type { ToastType } from '$lib/stores/toast.svelte';

	interface Props {
		message: string;
		type: ToastType;
		onclose: () => void;
	}

	let { message, type, onclose }: Props = $props();

	const icons = { success: CheckCircle, error: AlertCircle, info: Info } as const;
	const colors = {
		success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800',
		error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800',
		info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800'
	} as const;

	let Icon = $derived(icons[type]);
	let colorClass = $derived(colors[type]);
</script>

<div
	class="flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg {colorClass}"
	role="alert"
>
	<Icon class="h-5 w-5 shrink-0" />
	<span class="flex-1 text-sm">{message}</span>
	<button onclick={onclose} class="shrink-0 rounded p-1 opacity-60 transition-opacity hover:opacity-100">
		<X class="h-4 w-4" />
	</button>
</div>
