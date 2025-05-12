import { Card } from '@a-type/ui';

export interface BlogPostsProps {
	posts: any[];
}

export function BlogPosts({ posts }: BlogPostsProps) {
	return (
		<Card.Grid className="w-full">
			{posts.map((post) => (
				<Card key={post.url}>
					<Card.Main asChild>
						<a href={post.url}>
							<Card.Title>{post.frontmatter.title}</Card.Title>
							<Card.Content>
								<time dateTime={post.frontmatter.pubDate}>
									{new Date(post.frontmatter.pubDate).toLocaleDateString(
										'en-us',
										{
											year: 'numeric',
											month: 'short',
											day: 'numeric',
										},
									)}
								</time>
							</Card.Content>
							<Card.Content>{post.frontmatter.description}</Card.Content>
						</a>
					</Card.Main>
				</Card>
			))}
		</Card.Grid>
	);
}
