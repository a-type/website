import { definePreset } from '@arbor-css/core';
import { compileSingleColor, presetV1 } from '@arbor-css/core/preset-v1';

const preset = definePreset({
	name: 'gfor.rest',
	extends: [
		presetV1({
			color: {
				ranges: {
					brand: {
						hue: 300,
					},
					dynamic: {
						hue: 0,
					},
				},
				mainColor: 'brand',
			},
		}),
	],

	modeSchema: {
		dynamic: {
			hue: 'other',
			saturation: 'other',
		},
	},

	baseMode: ($) => ({
		dynamic: {
			hue: 0,
			saturation: 1,
		},
		color: {
			dynamic: compileSingleColor(
				{
					hue: $.mode.dynamic.hue,
					saturation: $.mode.dynamic.saturation,
				},
				$.mode.global,
			),
		},
	}),
});

export default preset;

preset.bundleMode('color-dynamic', {
	dynamic: {
		hue: 'var(--dyn-hue)',
		saturation: 'var(--dyn-sat)',
	},
	tint: preset.$.mode.color.dynamic,
	gray: preset.$.mode.color.dynamic.gray,
});
