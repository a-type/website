import { Button, Icon } from '@a-type/ui';
import { Showcase, ShowcaseItem } from './Showcase';

export interface MainShowcaseProps {}

export function MainShowcase({}: MainShowcaseProps) {
	return (
		<Showcase>
			<ShowcaseItem
				url="https://biscuits.club"
				image="https://biscuits.club/og-image.png"
				title="Biscuits"
				description="A suite of local-first web apps"
			/>
			<ShowcaseItem
				url="https://verdant.dev"
				image="https://verdant.dev/opengraph.png"
				title="Verdant"
				description="Local-first data and sync framework"
			/>
			<ShowcaseItem
				url="https://alef.io"
				image="/images/showcase/alef.png"
				title="Alef"
				description="Augmented reality furniture staging and home decoration"
			/>
			<ShowcaseItem
				url="https://youtu.be/TH-78-I6Eh0?list=PLTbD2QA-VMnXFsLbuPGz1H-Najv9MD2-H&t=82"
				title="My talk for the local-first web community"
				description="I describe my experience making local-first tooling and getting apps to market"
			/>
			<ShowcaseItem
				url="https://a-type.github.io/calendar-blocks/"
				title="Calendar Blocks"
				description="A set of flexible primitives for React date pickers"
			/>
		</Showcase>
	);
}

export interface OldShowcaseProps {}

export function OldShowcase({}: OldShowcaseProps) {
	return (
		<Showcase>
			<ShowcaseItem
				url="https://popspace.io"
				title="PopSpace"
				description="Online spatial meeting spaces. A prior startup."
			>
				<Button asChild size="small" color="ghost">
					<a
						href="https://www.loom.com/share/3c010e7b79114695a5b356579aafb1b7?sid=6ea72b48-af76-4b4d-94cb-2ba38f9f4ad1"
						target="_blank"
					>
						Video
						<Icon name="new_window" />
					</a>
				</Button>
			</ShowcaseItem>
			<ShowcaseItem
				url="/projects/subway"
				title="Lo-fi subway sketch"
				description="A WebGL subway animation I made for Verdant's previous incarnation"
			/>
			{/* <ShowcaseItem
				url="/projects/clouds"
				title="Clouds"
				description="A procedural 3d cloudscape"
			/> */}
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
