export type TaskStatus = 'idle' | 'running' | 'complete' | 'error';

export interface Task {
	status: TaskStatus;
	message: string;
	startedAt?: number;
	progress?: number;
}

const tasks = new Map<string, Task>();

export function getTask(name: string): Task {
	return tasks.get(name) || { status: 'idle', message: '' };
}

export function getAllTasks(): Record<string, Task> {
	return Object.fromEntries(tasks);
}

export function runTask(name: string, fn: () => Promise<void>): void {
	const current = tasks.get(name);
	if (current?.status === 'running') {
		return; // Bereits laufend
	}

	tasks.set(name, { status: 'running', message: 'Gestartet...', startedAt: Date.now() });

	fn()
		.then(() => {
			tasks.set(name, { status: 'complete', message: 'Fertig' });
		})
		.catch((e) => {
			tasks.set(name, { status: 'error', message: String(e) });
		});
}

export function updateTaskProgress(name: string, message: string, progress?: number): void {
	const task = tasks.get(name);
	if (task) {
		task.message = message;
		if (progress !== undefined) task.progress = progress;
	}
}
