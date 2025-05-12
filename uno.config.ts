// uno.config.ts
import preset from '@a-type/ui/uno-preset';
import variantGroup from '@unocss/transformer-variant-group';
import { defineConfig } from 'unocss';

export const presetOptions = {
	borderScale: 1,
	roundedness: 1,
	scale: 'md',
	saturation: 70,
	spacingScale: 1,
} as Parameters<typeof preset>[0];

export default defineConfig({
	presets: [preset(presetOptions)],
	transformers: [variantGroup()],
	preflights: [
		{
			getCSS: () => `
			html, body, #root {
				display: flex;
				flex-direction: column;
			}

			#root {
				flex: 1;
			}
		`,
		},
	],
});
