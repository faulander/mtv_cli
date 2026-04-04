<script lang="ts">
	import { page } from '$app/stores';
	import {
		LayoutDashboard,
		Search,
		ListChecks,
		FolderOpen,
		Settings,
		RefreshCw,
		Download,
		Menu,
		X,
		Tv
	} from '@lucide/svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	let mobileOpen = $state(false);

	const navItems = [
		{ href: '/', label: 'Dashboard', icon: LayoutDashboard },
		{ href: '/suche', label: 'Suche', icon: Search },
		{ href: '/vormerkliste', label: 'Vormerkliste', icon: ListChecks },
		{ href: '/dateien', label: 'Dateien', icon: FolderOpen },
		{ href: '/einstellungen', label: 'Einstellungen', icon: Settings }
	];

	const actionItems = [
		{ href: '/api/aktualisieren', label: 'Aktualisieren', icon: RefreshCw },
		{ href: '/api/download', label: 'Downloads starten', icon: Download }
	];

	function isActive(href: string, pathname: string): boolean {
		if (href === '/') return pathname === '/';
		return pathname.startsWith(href);
	}

	async function triggerAction(url: string, label: string) {
		mobileOpen = false;
		try {
			const res = await fetch(url, { method: 'POST' });
			const data = await res.json();
			// Toast wird von der aufrufenden Seite behandelt
			window.dispatchEvent(
				new CustomEvent('mtv-toast', {
					detail: { message: data.msg || label + ' gestartet', type: 'info' }
				})
			);
		} catch {
			window.dispatchEvent(
				new CustomEvent('mtv-toast', {
					detail: { message: label + ' fehlgeschlagen', type: 'error' }
				})
			);
		}
	}
</script>

<!-- Mobile Toggle -->
<button
	onclick={() => (mobileOpen = !mobileOpen)}
	class="fixed top-4 left-4 z-50 rounded-lg bg-white p-2 shadow-md lg:hidden dark:bg-neutral-800"
	aria-label="Menü"
>
	{#if mobileOpen}
		<X class="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
	{:else}
		<Menu class="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
	{/if}
</button>

<!-- Overlay -->
{#if mobileOpen}
	<button
		class="fixed inset-0 z-30 bg-black/50 lg:hidden"
		onclick={() => (mobileOpen = false)}
		aria-label="Menü schließen"
	></button>
{/if}

<!-- Sidebar -->
<aside
	class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-neutral-200 bg-white transition-transform duration-200 lg:translate-x-0 dark:border-neutral-800 dark:bg-neutral-900 {mobileOpen
		? 'translate-x-0'
		: '-translate-x-full'}"
>
	<!-- Header -->
	<div class="flex items-center gap-3 border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
		<Tv class="h-7 w-7 text-blue-600 dark:text-blue-400" />
		<div>
			<h1 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">Mediathekview</h1>
			<p class="text-xs text-neutral-500 dark:text-neutral-400">Filmliste & Downloads</p>
		</div>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 overflow-y-auto px-3 py-4">
		<p class="mb-2 px-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
			Navigation
		</p>
		<ul class="space-y-1">
			{#each navItems as item}
				{@const active = isActive(item.href, $page.url.pathname)}
				<li>
					<a
						href={item.href}
						onclick={() => (mobileOpen = false)}
						class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
							{active
							? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
							: 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'}"
					>
						<item.icon class="h-5 w-5" />
						{item.label}
					</a>
				</li>
			{/each}
		</ul>

		<p class="mt-6 mb-2 px-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
			Aktionen
		</p>
		<ul class="space-y-1">
			{#each actionItems as item}
				<li>
					<button
						onclick={() => triggerAction(item.href, item.label)}
						class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
					>
						<item.icon class="h-5 w-5" />
						{item.label}
					</button>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Footer -->
	<div class="flex items-center justify-between border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
		<span class="text-xs text-neutral-400 dark:text-neutral-500">mtv-cli v0.0.1</span>
		<ThemeToggle />
	</div>
</aside>
