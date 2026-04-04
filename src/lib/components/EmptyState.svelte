<script lang="ts">
	import { Inbox } from '@lucide/svelte';
	import type { Component } from 'svelte';

	interface Props {
		title?: string;
		description?: string;
		icon?: Component;
	}

	let { title = 'Keine Daten', description = '', icon: Icon = Inbox }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-16 text-center">
	<div class="mb-4 rounded-full bg-neutral-100 p-4 dark:bg-neutral-800">
		<Icon class="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
	</div>
	<h3 class="text-lg font-medium text-neutral-700 dark:text-neutral-300">{title}</h3>
	{#if description}
		<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
	{/if}
</div>
