import { Card, clsx } from '@a-type/ui';
import type { ReactNode } from 'react';

export interface ShowcaseProps {
	children?: ReactNode;
}

export function Showcase({ children }: ShowcaseProps) {
	return <Card.Grid className="w-full">{children}</Card.Grid>;
}

export function ShowcaseItem({
	image,
	title,
	url,
	children,
	description,
}: {
	image?: string;
	title: string;
	url: string;
	children?: ReactNode;
	description?: string;
}) {
	return (
		<Card className={clsx('border-default	', image ? 'aspect-16/9' : '')}>
			{image && (
				<Card.Image asChild>
					<img src={image} className="w-full h-full" />
				</Card.Image>
			)}
			<Card.Main asChild className="flex-[1_0_auto]">
				<a rel="noopener noreferrer" target="_blank" href={url}>
					<Card.Title className="font-light mb-auto flex-shrink-0">
						{title}
					</Card.Title>
					{description && (
						<Card.Content className="bg-wash flex-shrink-0">
							{description}
						</Card.Content>
					)}
				</a>
			</Card.Main>
			{children && <Card.Footer>{children}</Card.Footer>}
		</Card>
	);
}
