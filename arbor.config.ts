import { definePreset } from '@arbor-css/core';
import { compileSingleColor, presetV1 } from '@arbor-css/core/preset-v1';

const base = presetV1({
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
});

const preset = definePreset({
	name: 'gfor.rest',
	extends: [base],

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

	mixins: (create, $) => ({
		hover: create('hover', {
			definition: (css) => css`
				@media (hover: hover) and (pointer: fine) {
					&:hover {
						${base.mixins.bgHeavier.apply({ '--step': 1 })}
						${base.mixins.ring.apply({
							'--ring': base.functions.ring.compute({
								'--color': $.mixins.bg.ref,
								'--size': '4px',
							}),
						})}

								&[data-emphasis="primary"] {
							${base.mixins.bgLighter.apply({ '--step': 1 })}
						}
					}
				}
			`,
		}),
		focus: create('focus', {
			definition: (css) => css`
				&:focus {
					outline: none;
				}
				&:focus-visible,
				&[data-focus-visible='true'] {
					${base.mixins.bgLighter.apply({ '--step': 1 })}
					${base.mixins.ring.apply({
						'--ring': base.functions.ring.compute({
							'--color': $.mode.tint.heavy,
							'--size': '2px',
						}),
					})}

							&[data-emphasis="primary"] {
						${base.mixins.bgLighter.apply({ '--step': 2 })}
					}
				}
			`,
		}),
		active: create('active', {
			definition: (css) => css`
				&:active {
					${base.mixins.bgHeavier.apply({ '--step': 2 })}

					&[data-emphasis="primary"] {
						${base.mixins.bgLighter.apply({ '--step': 2 })}
					}
				}
			`,
		}),
		disabled: create('disabled', {
			definition: (css) => css`
				&&:disabled,
				&&[data-disabled='true'] {
					cursor: not-allowed;
					box-shadow: none;
					${base.mixins.bgDesaturated.apply({ '--step': 8 })}
					${base.mixins.fgFaded.apply({
						'--opacity': 0.65,
						'--source': $.mode.gray.ink,
					})}
							${base.mixins.borderColorFaded.apply({
						'--opacity': 0.35,
						'--source': $.mode.gray.ink,
					})}
				}
			`,
		}),
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
