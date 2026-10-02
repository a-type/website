import { atom, computed } from 'nanostores';

export const dynamicThemeStore = atom(0);

const presets = [
	{
		videoSrc: '/videos/motion/1_out.mp4',
		hue: 190,
		saturation: 0.25,
		overlayClass: '@mode-light',
	},
	{
		videoSrc: '/videos/motion/2_out.mp4',
		hue: 50,
		saturation: 1,
		overlayClass: '@mode-light',
	},
	{
		videoSrc: '/videos/motion/3_out.mp4',
		hue: 110,
		saturation: 0.5,
		overlayClass: '@mode-light',
	},
	{
		videoSrc: '/videos/motion/4_out.mp4',
		hue: 280,
		saturation: 0.9,
		overlayClass: '@mode-light',
	},
];

export const dynamicTheme = computed(
	dynamicThemeStore,
	(value) => presets[value],
);

const paths = [
	['/blog', 1],
	['/projects', 2],
	['/about', 3],
	['', 0],
] as const;

export function getDynamicThemeIndexForPath(path: string): number {
	for (const [p, val] of paths) {
		if (path.startsWith(p)) {
			return val;
		}
	}
	return 0;
}
if (typeof window !== 'undefined') {
	dynamicThemeStore.set(getDynamicThemeIndexForPath(window.location.pathname));
}

export function getDynamicThemeForPath(path: string) {
	const index = getDynamicThemeIndexForPath(path);
	return presets[index];
}
