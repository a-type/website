import { Box } from '@a-type/ui';
import { useState } from 'react';

export interface ScrollShadowDemoProps {}

export function ScrollShadowDemo({}: ScrollShadowDemoProps) {
	const [color, setColor] = useState<'primary' | 'accent'>('primary');

	return (
		<Box surface={color} col gap className={`my-lg mx-auto overflow-hidden`}>
			<Box col gap p>
				<div className="flex flex-row gap-sm items-center">
					<span>Change the parent color:</span>{' '}
					<button
						className="cursor-pointer bg-primary w-8 h-8 rounded-full border-none hover:bg-darken-1"
						onClick={() => setColor('primary')}
					></button>
					<button
						className="cursor-pointer bg-accent w-8 h-8 rounded-full border-none hover:bg-darken-1"
						onClick={() => setColor('accent')}
					></button>
				</div>
			</Box>
			<div className="h-120px w-full overflow-y-auto p-md">
				Lorem Ipsum is simply dummy text of the printing and typesetting
				industry. Lorem Ipsum has been the industry's standard dummy text ever
				since the 1500s, when an unknown printer took a galley of type and
				scrambled it to make a type specimen book. It has survived not only five
				centuries, but also the leap into electronic typesetting, remaining
				essentially unchanged. It was popularised in the 1960s with the release
				of Letraset sheets containing Lorem Ipsum passages, and more recently
				with desktop publishing software like Aldus PageMaker including versions
				of Lorem Ipsum.
			</div>
			<div className="[box-shadow:0_0_12px_18px_var(--v-bg)] absolute bottom-0 left-0 right-0 w-full z-1" />
		</Box>
	);
}
