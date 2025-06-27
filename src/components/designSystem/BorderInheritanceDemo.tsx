import { useState } from 'react';

export interface BorderInheritanceDemoProps {}

export function BorderInheritanceDemo({}: BorderInheritanceDemoProps) {
	const [color, setColor] = useState('bg-primary-wash');

	return (
		<div
			id="inheritance-parent"
			className={`${color} gap-md flex flex-col p-md my-lg mx-auto rounded-lg`}
		>
			<div className="flex flex-row gap-sm items-center">
				<span>Change the parent color:</span>{' '}
				<button
					className="cursor-pointer bg-primary w-8 h-8 rounded-full border-none hover:bg-darken-1"
					onClick={() => setColor('bg-primary-wash')}
				></button>
				<button
					className="cursor-pointer bg-accent w-8 h-8 rounded-full border-none hover:bg-darken-1"
					onClick={() => setColor('bg-accent-wash')}
				></button>
			</div>
			<div className="border border-solid border-color-bg border-color-darken-8 rounded-md px-md py-sm">
				Border adapts to parent background
			</div>
		</div>
	);
}
