import { Button, Icon } from '@a-type/ui';
import { Showcase, ShowcaseItem } from './Showcase';

export interface MainShowcaseProps {}

export function MainShowcase({}: MainShowcaseProps) {
	return (
		<Showcase>
			<ShowcaseItem
				url="https://biscuits.club"
				image="https://biscuits.club/og-image.png"
				imageAlt="A phone running a grocery list app, with the title 'Biscuits' and tagline 'Scratch-Made Apps'"
				title="Biscuits"
				description="A suite of local-first web apps"
			/>
			<ShowcaseItem
				url="https://verdant.dev"
				image="https://verdant.dev/opengraph.png"
				imageAlt="A green tree and the word 'Verdant'"
				title="Verdant"
				description="Local-first data and sync framework"
			/>
			<ShowcaseItem
				url="/projects/alef"
				image="/images/showcase/alef.png"
				imageAlt="A capture from within an AR headset of a realspace room with virtual furniture models laid out within, and a floating menu"
				title="Alef"
				description="Augmented reality furniture staging and home decoration"
			/>
			<ShowcaseItem
				url="https://www.youtube.com/watch?v=Anae1TPI5VY"
				title="My 2024 talk for the Triangle Devs meetup"
				image="/images/showcase/triangle-talk.png"
				imageAlt="A slide deck showing a flowchart with various changeset representations being ordered in time by clients and servers independently"
				description="I dig into how local-first works, my approach to migrating databases, and my hopes for sustainable software"
			/>
			<ShowcaseItem
				url="/blog/lofi-intro"
				title="Blog series: making a local-first framework"
				description="A deep dive into the goals, challenges, and implementation of Verdant"
			/>
			<ShowcaseItem
				url="/projects/design-system"
				title="My personal design system"
				description="An experimental and idiosyncratic library I use in all my side-projects"
			/>
			<ShowcaseItem
				url="/projects/rout"
				image="/images/showcase/rout.png"
				imageAlt="The image is blurred, but you can make out a purple background and white text overlaid"
				title="(coming soon)"
				imagePosition="center"
			/>
		</Showcase>
	);
}

export interface OldShowcaseProps {}

export function OldShowcase({}: OldShowcaseProps) {
	return (
		<Showcase>
			<ShowcaseItem
				url="https://youtu.be/TH-78-I6Eh0?list=PLTbD2QA-VMnXFsLbuPGz1H-Najv9MD2-H&t=82"
				title="My 2023 talk for the local-first web community"
				description="I describe my experience making local-first tooling and getting apps to market"
			/>
			<ShowcaseItem
				url="/projects/volu"
				title="Volu"
				description="An in-headset WebXR development environment"
				image="/images/showcase/volu.png"
				imageAlt="A code editor with a preview window showing a 3D cloud model"
				imagePosition="center"
			/>
			<ShowcaseItem
				url="https://popspace.io"
				title="PopSpace"
				description="Online spatial meeting spaces. A prior startup."
				image="/images/showcase/popspace.png"
				imageAlt="A 2d canvas space with little floating video feeds and avatars, screen shares, and files dropped on it"
			>
				<Button asChild size="small" color="accent">
					<a
						href="https://www.loom.com/share/3c010e7b79114695a5b356579aafb1b7?sid=6ea72b48-af76-4b4d-94cb-2ba38f9f4ad1"
						target="_blank"
					>
						Overview video
						<Icon name="new_window" />
					</a>
				</Button>
			</ShowcaseItem>
			<ShowcaseItem
				url="https://a-type.github.io/calendar-blocks/"
				title="Calendar Blocks"
				description="A set of flexible primitives for React date pickers"
			/>
			<ShowcaseItem
				url="/projects/subway"
				title="Lo-fi subway sketch"
				description="A WebGL subway animation I made for Verdant's previous incarnation"
				image="/images/showcase/subway.png"
				imageAlt="A view down the subway, kind of PS2-level graphics, with film grain and depth of field"
				imagePosition="center"
			/>
			<ShowcaseItem
				url="/projects/clouds"
				title="Clouds"
				description="A procedural 3d cloudscape"
				image="/images/showcase/clouds.png"
				imageAlt="A 3D cloudscape seen from above, with big white clouds hovering over a patchwork green field"
			/>
			<ShowcaseItem
				url="/blog/alarm-clock"
				title="Building my own smart alarm clock"
			/>
			<ShowcaseItem
				url="https://github.com/a-type/graphql-arangodb"
				title="GraphQL-ArangoDB"
				description="Translates GraphQL queries to ArangoDB AQL queries"
			/>
			<ShowcaseItem
				url="https://dimension-dom.netlify.app/"
				title="Dimension"
				description="Tools for multi-axis keyboard navigation"
			/>
		</Showcase>
	);
}
