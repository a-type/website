import { Card, clsx } from '@a-type/ui';
import type { ReactNode } from 'react';

export interface ShowcaseProps {
	children?: ReactNode;
}

export function Showcase({ children }: ShowcaseProps) {
	return (
		<Card.Grid
			className="w-full"
			columns={(width) => {
				if (width > 2000) {
					return 5;
				}
				if (width > 1400) {
					return 4;
				}
				if (width > 800) {
					return 3;
				}
				if (width > 300) {
					return 2;
				}
				return 1;
			}}
		>
			{children}
		</Card.Grid>
	);
}

export function ShowcaseItem({
	image,
	imageAlt,
	title,
	url,
	children,
	description,
}: {
	image?: string;
	imageAlt?: string;
	title: string;
	url: string;
	children?: ReactNode;
	description?: string;
}) {
	return (
		<Card
			className={clsx('border-default	h-auto group', image ? 'aspect-4/3' : '')}
		>
			{image && (
				<Card.Image asChild>
					<img src={image} className="w-full h-full object-cl" alt={imageAlt} />
				</Card.Image>
			)}
			<Card.Main asChild className="flex-[1_0_auto]">
				<a
					rel="noopener noreferrer"
					target="_blank"
					href={url}
					aria-label={title}
				>
					<Card.Title className="font-light mb-auto flex-shrink-0">
						{title}
					</Card.Title>
					{description && (
						<Card.Content
							className={clsx(
								'bg-wash flex-shrink-0',
								image && 'opacity-0 group-hover:opacity-100 transition-opacity',
							)}
						>
							{description}
						</Card.Content>
					)}
				</a>
			</Card.Main>
			{children && <Card.Footer>{children}</Card.Footer>}
		</Card>
	);
}
