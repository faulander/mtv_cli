<script lang="ts">
	import { DOWNLOAD_STATUS_LABELS, type DownloadStatus } from '$lib/types/film';

	interface Props {
		status: DownloadStatus;
	}

	let { status }: Props = $props();

	const colors: Record<DownloadStatus, string> = {
		V: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
		S: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
		A: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
		F: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
		K: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
	};
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {colors[status]}">
	{DOWNLOAD_STATUS_LABELS[status]}
</span>
