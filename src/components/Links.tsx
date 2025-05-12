import { Button, clsx } from '@a-type/ui';

export interface LinksProps {
	className?: string;
}

export function Links({ className }: LinksProps) {
	return (
		<nav className={clsx('flex gap-md flex-wrap', className)}>
			<LinksItem url="https://github.com/a-type" newTab>
				GitHub
			</LinksItem>
			<LinksItem url="https://bsky.app/profile/gfor.rest" newTab>
				Bluesky
			</LinksItem>
			<LinksItem url="https://indieweb.social/@grantf" newTab>
				Mastodon
			</LinksItem>
			<LinksItem url="/blog">Blog</LinksItem>
		</nav>
	);
}

function LinksItem({
	url,
	children,
	newTab = false,
}: {
	url: string;
	children: React.ReactNode;
	newTab?: boolean;
}) {
	return (
		<Button asChild color="default" size="small">
			<a
				href={url}
				target={newTab ? '_blank' : undefined}
				rel={newTab ? 'noopener noreferrer' : undefined}
			>
				{children}
			</a>
		</Button>
	);
}
