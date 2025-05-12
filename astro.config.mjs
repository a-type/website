import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import UnoCSS from 'unocss/astro';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	site: 'https://gfor.rest',
	integrations: [
		mdx(),
		sitemap(),
		react(),
		UnoCSS({
			// injectReset: true,
		}),
	],
});
