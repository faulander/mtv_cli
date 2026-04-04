import { browser } from '$app/environment';

let current = $state<'light' | 'dark'>('light');

if (browser) {
	const saved = localStorage.getItem('theme');
	if (saved === 'dark' || (!saved && matchMedia('(prefers-color-scheme: dark)').matches)) {
		current = 'dark';
	}
}

export const theme = {
	get value() {
		return current;
	},
	get isDark() {
		return current === 'dark';
	},
	toggle() {
		current = current === 'dark' ? 'light' : 'dark';
		if (browser) {
			document.documentElement.classList.toggle('dark', current === 'dark');
			localStorage.setItem('theme', current);
		}
	}
};
