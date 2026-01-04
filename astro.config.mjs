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
			mode: 'development',
			base: '/',
			scope: '/',
			includeAssets: ['favicon.svg'],
			registerType: 'autoUpdate',
			manifest: {
				name: 'gfor.rest',
				short_name: 'gfor.rest',
				theme_color: '#ffffff',
			},
			pwaAssets: {
				config: true,
			},
			workbox: {
				navigateFallback: '/',
				globPatterns: ['**/*.{css,js,html,svg,png,ico,txt}'],
			},
			devOptions: {
				enabled: true,
				navigateFallbackAllowlist: [/^\/$/],
			},
			experimental: {
				directoryAndTrailingSlashHandler: true,
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
