<script lang="ts">
	import { toastStore } from '$lib/stores/toast.svelte';
	import Toast from './Toast.svelte';
</script>

{#if toastStore.items.length > 0}
	<div class="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
		{#each toastStore.items as toast (toast.id)}
			<div class="animate-in slide-in-from-right">
				<Toast
					message={toast.message}
					type={toast.type}
					onclose={() => toastStore.remove(toast.id)}
				/>
			</div>
		{/each}
	</div>
{/if}
