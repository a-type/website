import {
	Avatar,
	Box,
	Button,
	Card,
	cardGridColumns,
	Checkbox,
	Collapsible,
	DateRangePicker,
	Dialog,
	DropdownMenu,
	FieldLabel,
	H4,
	HorizontalList,
	Icon,
	Input,
	NavBar,
	P,
	PageContent,
	PageNav,
	PageRoot,
	Provider,
	Select,
	Slider,
	Switch,
	Tooltip,
} from '@a-type/ui';
import { useEffect, useState } from 'react';
import '../../styles/global.css';

export interface SamplerProps {}

export function Sampler({}: SamplerProps) {
	const [primaryHue, setPrimaryHue] = useState(90);
	const [saturation, setSaturation] = useState(0.5);
	const [borderScale, setBorderScale] = useState(1);
	const [cornerScale, setCornerScale] = useState(1);

	useEffect(() => {
		const root = document.documentElement;
		root.style.setProperty('--dyn-primary-source', `${primaryHue}`);
		root.style.setProperty('--global-saturation', `${saturation}`);
		root.style.setProperty('--global-corner-scale', `${cornerScale}`);
		root.style.setProperty('--global-border-scale', `${borderScale}`);
	}, [primaryHue, borderScale, cornerScale, saturation]);

	return (
		<Provider>
			<PageRoot className="theme">
				<PageContent>
					<Box d="col" gap="lg" full="height">
						<Box gap justify="between" items="center" p="sm">
							<div className="font-fancy font-bold text-lg">Demo</div>
							<DropdownMenu>
								<DropdownMenu.Trigger asChild>
									<Button size="small" color="ghost">
										<Avatar name="Grant" />
										<Icon name="dots" />
									</Button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content>
									<DropdownMenu.Item>
										<DropdownMenu.Label>Settings</DropdownMenu.Label>
										<DropdownMenu.ItemRightSlot>
											<Icon name="gear" />
										</DropdownMenu.ItemRightSlot>
									</DropdownMenu.Item>
									<DropdownMenu.Item color="destructive">
										<DropdownMenu.Label>Log out</DropdownMenu.Label>
										<DropdownMenu.ItemRightSlot>
											<Icon name="arrowRight" />
										</DropdownMenu.ItemRightSlot>
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu>
						</Box>
						<Collapsible>
							<Collapsible.Trigger asChild>
								<Box gap items="center" p>
									<Icon
										name="chevron"
										className="[[data-state:open]>&]:rotate-180 transition-transform"
									/>
									<H4>Theme</H4>
									<Icon name="star" className="ml-auto fill-primary" />
								</Box>
							</Collapsible.Trigger>
							<Collapsible.Content>
								<Box surface gap d="col">
									<P className="text-xs">
										Try these sliders to see how much the look and feel can
										change
									</P>
									<Box d="col">
										<FieldLabel>Primary color</FieldLabel>
										<Slider
											color="primary"
											value={[primaryHue]}
											onValueChange={([v]) => setPrimaryHue(v)}
											min={0}
											max={360}
											step={1}
										/>
									</Box>
									<Box d="col">
										<FieldLabel>Saturation</FieldLabel>
										<Slider
											color="primary"
											value={[saturation]}
											onValueChange={([v]) => setSaturation(v)}
											min={0}
											max={1}
											step={0.1}
										/>
									</Box>
									<Box d="col">
										<FieldLabel>Border width</FieldLabel>
										<Slider
											color="primary"
											value={[borderScale]}
											onValueChange={([v]) => setBorderScale(v)}
											min={0}
											max={2}
											step={0.1}
										/>
									</Box>
									<Box d="col">
										<FieldLabel>Corner scale</FieldLabel>
										<Slider
											color="primary"
											value={[cornerScale]}
											onValueChange={([v]) => setCornerScale(v)}
											min={0}
											max={2}
											step={0.1}
										/>
									</Box>
								</Box>
							</Collapsible.Content>
						</Collapsible>
						<Box gap wrap>
							<H4>Controls</H4>
							<HorizontalList>
								<Tooltip content="Hello there">
									<Button color="primary">Hover me</Button>
								</Tooltip>
								<Dialog>
									<Dialog.Trigger asChild>
										<Button color="accent">Dialog</Button>
									</Dialog.Trigger>
									<Dialog.Content>
										<Dialog.Title>Dialog</Dialog.Title>
										<Dialog.Description>
											This is a dialog. It can be used to display information or
											ask for user input.
										</Dialog.Description>
										<Dialog.Actions>
											<Dialog.Close />
										</Dialog.Actions>
									</Dialog.Content>
								</Dialog>
								<Checkbox />
								<Switch />
								<Input placeholder="Input" />
								<Select value="">
									<Select.Trigger>
										<Select.Value placeholder="Select" />
										<Select.Icon />
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="1">Item 1</Select.Item>
										<Select.Item value="2">Item 2</Select.Item>
										<Select.Item value="3">Item 3</Select.Item>
									</Select.Content>
								</Select>
							</HorizontalList>
						</Box>
						<DateRangePicker
							onChange={() => {}}
							value={{
								start: new Date(),
								end: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000),
							}}
						/>
						<Card.Grid columns={cardGridColumns.small}>
							<Card>
								<Card.Main>
									<Card.Title>First post</Card.Title>
								</Card.Main>
								<Card.Footer>
									<Card.Actions>
										<Button size="icon-small" color="ghost">
											<Icon name="check" />
										</Button>
									</Card.Actions>
								</Card.Footer>
							</Card>
							<Card>
								<Card.Main>
									<Card.Title>Second post</Card.Title>
								</Card.Main>
								<Card.Footer>
									<Card.Actions>
										<Button size="icon-small" color="ghost">
											<Icon name="check" />
										</Button>
									</Card.Actions>
								</Card.Footer>
							</Card>
						</Card.Grid>
					</Box>
				</PageContent>
				<PageNav>
					<NavBar className="md:pt-xl">
						<NavBar.Item active>
							<NavBar.ItemIconWrapper>
								<NavBar.ItemIcon name="home"></NavBar.ItemIcon>
							</NavBar.ItemIconWrapper>
							<NavBar.ItemText>Home</NavBar.ItemText>
						</NavBar.Item>
						<NavBar.Item>
							<NavBar.ItemIconWrapper>
								<NavBar.ItemIcon name="page" />
							</NavBar.ItemIconWrapper>
							<NavBar.ItemPip />
							<NavBar.ItemText>Pages</NavBar.ItemText>
						</NavBar.Item>
						<NavBar.Item>
							<NavBar.ItemIconWrapper>
								<NavBar.ItemIcon name="add_person" />
							</NavBar.ItemIconWrapper>
							<NavBar.ItemText>Friends</NavBar.ItemText>
						</NavBar.Item>
					</NavBar>
				</PageNav>
			</PageRoot>
		</Provider>
	);
}
