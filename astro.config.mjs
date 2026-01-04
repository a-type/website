import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import AstroPWA from '@vite-pwa/astro';
import { defineConfig } from 'astro/config';
import UnoCSS from 'unocss/astro';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	site: 'https://gfor.rest',

	markdown: {
		shikiConfig: {
			themes: {
				light: 'vitesse-light',
				dark: 'poimandres',
			},
		},
	},
	integrations: [
		mdx({
			shikiConfig: {
				themes: {
					light: 'vitesse-light',
					dark: 'poimandres',
				},
			},
			syntaxHighlight: 'shiki',
		}),
		sitemap(),
		react(),
		UnoCSS({}),
		AstroPWA({
			devOptions: {
				enabled: true,
			},
		}),
	],
	vite: {
		optimizeDeps: {
			exclude: ['@a-type/ui'],
			include: ['@a-type/ui > formik'],
		},
	},
});
