import { Box, Button, Icon, Note } from '@a-type/ui';

export interface JobNoteProps {}

export function JobNote({}: JobNoteProps) {
	return (
		<Note className="ml-auto max-w-250px">
			<Box d="col" items="start" gap>
				<div className="pl-md pt-sm">
					I'm looking for a new role!{' '}
					<a className="font-bold" href="mailto:hi@gfor.rest">
						Get in touch
					</a>
					.
				</div>
				<Button color="ghost" size="small" asChild>
					<a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
						Resume
						<Icon name="download" />
					</a>
				</Button>
			</Box>
		</Note>
	);
}
