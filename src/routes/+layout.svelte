<script lang="ts">
	import './layout.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		// Globale Toast-Events von der Sidebar abfangen
		const handler = (e: CustomEvent<{ message: string; type: 'success' | 'error' | 'info' }>) => {
			toastStore.add(e.detail.message, e.detail.type);
		};
		window.addEventListener('mtv-toast', handler as EventListener);
		return () => window.removeEventListener('mtv-toast', handler as EventListener);
	});
</script>

<svelte:head>
	<title>Mediathekview</title>
</svelte:head>

<div class="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
	<Sidebar />
	<main class="lg:pl-64">
		<div class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
			{@render children()}
		</div>
	</main>
	<ToastContainer />
</div>
