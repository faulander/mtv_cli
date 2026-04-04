<script lang="ts">
	import { Sun, Moon } from '@lucide/svelte';
	import { theme } from '$lib/stores/theme.svelte';
</script>

<button
	onclick={theme.toggle}
	class="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
	aria-label={theme.isDark ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren'}
>
	{#if theme.isDark}
		<Sun class="h-5 w-5" />
	{:else}
		<Moon class="h-5 w-5" />
	{/if}
</button>
