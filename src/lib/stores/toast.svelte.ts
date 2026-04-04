export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
	id: number;
	message: string;
	type: ToastType;
}

let toasts = $state<Toast[]>([]);
let nextId = 0;

export const toastStore = {
	get items() {
		return toasts;
	},
	add(message: string, type: ToastType = 'info', duration = 4000) {
		const id = nextId++;
		toasts = [...toasts, { id, message, type }];
		if (duration > 0) {
			setTimeout(() => this.remove(id), duration);
		}
	},
	remove(id: number) {
		toasts = toasts.filter((t) => t.id !== id);
	},
	success(message: string) {
		this.add(message, 'success');
	},
	error(message: string) {
		this.add(message, 'error', 6000);
	},
	info(message: string) {
		this.add(message, 'info');
	}
};
