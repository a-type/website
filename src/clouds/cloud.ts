type RandomFn = () => number;
type CanvasSurface = HTMLCanvasElement | OffscreenCanvas;
type CanvasContext =
	| CanvasRenderingContext2D
	| OffscreenCanvasRenderingContext2D;

type Lobe = {
	centerX: number;
	centerY: number;
	radiusX: number;
	radiusY: number;
	depth: number;
	heading: number;
};

type DrawCloudOptions = {
	floor?: number;
	rootCenterX?: number;
	seed?: number;
	sizeMultiplier?: number;
	cloudFill?: string;
	cloudOutline?: string;
	shadowColor?: string;
	debug?: boolean;
};

type CloudBounds = {
	left: number;
	top: number;
	right: number;
	bottom: number;
	lobes: Lobe[];
};

type CloudRenderer = {
	drawCloud: (target: CanvasContext, options?: DrawCloudOptions) => CloudBounds;
	fractalCloudLobes: (
		width: number,
		height: number,
		floor: number,
		rootCenterX: number | null | undefined,
		options?: { seed?: number; sizeMultiplier?: number },
	) => Lobe[];
	verticalShapeInfluence: (
		originY: number,
		floor: number,
		height: number,
		radiusY: number,
		lateralness: number,
		energy: number,
		midpoint: number,
		flatteningStrength: number,
		upperLiftStrength: number,
	) => number;
};

const DEFAULT_FILL = '#ffffff';
const DEFAULT_OUTLINE = '#000000';
const DEFAULT_SHADOW = '#505050';
const MARGIN = 4;
const OUTER_OUTLINE_WIDTH = 2;
const INNER_OVERLAY_BORDER_WIDTH = 1;

function randomGenerator(seed?: number | null): RandomFn {
	if (seed === undefined || seed === null) {
		return Math.random;
	}

	let state = Number(seed) >>> 0;
	return function () {
		state = (state + 0x6d2b79f5) >>> 0;
		let value = Math.imul(state ^ (state >>> 15), 1 | state);
		value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	};
}

function randomBetween(
	random: RandomFn,
	minimum: number,
	maximum: number,
): number {
	return minimum + random() * (maximum - minimum);
}

function round(value: number): number {
	return Math.round(value);
}

function verticalShapeInfluence(
	originY: number,
	floor: number,
	height: number,
	radiusY: number,
	lateralness: number,
	energy: number,
	midpoint: number,
	flatteningStrength: number,
	upperLiftStrength: number,
): number {
	const heightFraction = Math.min(
		1,
		Math.max(0, (floor - originY) / Math.max(1, height)),
	);
	const lowerWeight = Math.max(0, (midpoint - heightFraction) / midpoint);
	const upperWeight = Math.max(
		0,
		(heightFraction - midpoint) / Math.max(0.001, 1 - midpoint),
	);
	return (
		radiusY *
		energy *
		(flatteningStrength * lateralness ** 4 * lowerWeight -
			upperLiftStrength * upperWeight)
	);
}

function fractalCloudLobes(
	width: number,
	height: number,
	floor: number,
	rootCenterX: number | null | undefined,
	options?: { seed?: number; sizeMultiplier?: number },
): Lobe[] {
	const settings = options || {};
	const sizeMultiplier =
		settings.sizeMultiplier === undefined ? 1 : settings.sizeMultiplier;
	const random = randomGenerator(settings.seed);

	const energy = 1.42;
	const generations = 4;
	const branchesPerNode = 5;
	const headingJitter = 0.64;
	const scaleMin = 0.39;
	const scaleMax = 0.53;
	const rootRadiusFraction = 1 / 4;
	const rootXFraction = 48 / 100;
	const coreAlignmentWidth = 0.38;
	const projectionFraction = 0.6;
	const velocityFloor = 0.32;
	const velocityGain = 0.68;
	const firstGenerationUpwardDamping = 0.55;
	const branchScaleBase = 0.32;
	const branchScaleVelocity = 0.4;
	const branchScaleMultiplier = 1.7;
	const lateralSpreadBase = 0.55;
	const lateralSpreadGain = 0.66;
	const spreadTurbulence = 0.06;
	const upliftBase = 0.72;
	const upliftTurbulence = 0.05;
	const upliftMultiplier = 1.15;
	const upliftVerticalGain = 0.55;
	const settlingBase = 0.36;
	const settlingTurbulence = 0.04;
	const shapeMidpoint = 0.5;
	const flatteningStrength = 0.58;
	const upperShapeLift = 0.18;

	const rootRadius = round(
		Math.min(width, height) * rootRadiusFraction * sizeMultiplier,
	);
	const root: Lobe = {
		centerX:
			rootCenterX === undefined || rootCenterX === null ?
				round(width * rootXFraction)
			:	round(rootCenterX),
		centerY: floor - rootRadius,
		radiusX: rootRadius,
		radiusY: rootRadius,
		depth: 0,
		heading: -1.57,
	};
	const lobes: Lobe[] = [root];
	let frontier: Lobe[] = [root];
	const rootHeadings = [-1.57, -0.12, 3.02, -2.26, -0.78];

	for (let depth = 1; depth <= generations; depth += 1) {
		const nextFrontier: Lobe[] = [];
		for (const parent of frontier) {
			const headings =
				depth === 1 ? rootHeadings : (
					Array.from({ length: branchesPerNode }, () =>
						randomBetween(
							random,
							parent.heading - headingJitter,
							parent.heading + headingJitter,
						),
					)
				);

			for (const direction of headings) {
				const turbulence = randomBetween(random, -1, 1);
				const scale = randomBetween(random, scaleMin, scaleMax);
				const originX = depth === 1 ? root.centerX : parent.centerX;
				const originY =
					depth === 1 ? root.centerY + root.radiusY : parent.centerY;
				const projectedX =
					originX + Math.cos(direction) * parent.radiusX * projectionFraction;
				const coreAlignment = Math.max(
					0,
					1 -
						Math.abs(projectedX - root.centerX) / (width * coreAlignmentWidth),
				);
				const upwardness = Math.max(0, -Math.sin(direction));
				const upwardVelocity =
					upwardness * (depth === 1 ? firstGenerationUpwardDamping : 1);
				const velocity =
					velocityFloor + velocityGain * coreAlignment * upwardVelocity;
				const branchScale =
					(branchScaleBase + branchScaleVelocity * velocity) *
					scale *
					branchScaleMultiplier *
					energy *
					sizeMultiplier;
				const radiusX = Math.max(8, round(parent.radiusX * branchScale));
				const radiusY = Math.max(7, round(parent.radiusY * branchScale));
				const lateralness = Math.abs(Math.cos(direction));
				const horizontalReach =
					parent.radiusX *
					(lateralSpreadBase +
						lateralSpreadGain * lateralness +
						turbulence * spreadTurbulence) *
					energy;
				let centerX = round(originX + Math.cos(direction) * horizontalReach);
				centerX = Math.max(radiusX, centerX);
				const hotAirLift =
					parent.radiusY *
					velocity *
					(upliftBase + turbulence * upliftTurbulence) *
					(upliftMultiplier + upliftVerticalGain * upwardness);
				const lateralSettling =
					parent.radiusY *
					(1 - velocity) *
					(settlingBase + turbulence * settlingTurbulence);
				const shapeInfluence = verticalShapeInfluence(
					originY,
					floor,
					height,
					parent.radiusY,
					lateralness,
					energy,
					shapeMidpoint,
					flatteningStrength,
					upperShapeLift,
				);
				let centerY = round(
					originY - hotAirLift + lateralSettling + shapeInfluence,
				);
				centerY = Math.min(floor - radiusY, centerY);
				const child: Lobe = {
					centerX,
					centerY,
					radiusX,
					radiusY,
					depth,
					heading: direction,
				};
				lobes.push(child);
				nextFrontier.push(child);
			}
		}
		frontier = nextFrontier;
	}
	return lobes;
}

function get2dContext(canvas: CanvasSurface): CanvasContext {
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Canvas 2D context is unavailable');
	}
	return context as CanvasContext;
}

function canvasFor(
	context: CanvasContext,
	width: number,
	height: number,
): CanvasSurface {
	const canvas = context.canvas;
	const ownerDocument =
		canvas && 'ownerDocument' in canvas && canvas.ownerDocument ?
			canvas.ownerDocument
		: typeof document === 'object' ? document
		: null;

	if (typeof OffscreenCanvas === 'function') {
		return new OffscreenCanvas(width, height) as CanvasSurface;
	}
	if (ownerDocument) {
		const canvas = ownerDocument.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		return canvas as CanvasSurface;
	}

	throw new Error(
		'Canvas offscreen rendering requires a browser document or OffscreenCanvas',
	);
}

function maskCanvas(context: CanvasContext): CanvasSurface {
	return canvasFor(context, context.canvas.width, context.canvas.height);
}

function ellipsePath(context: CanvasContext, lobe: Lobe): void {
	context.ellipse(
		lobe.centerX,
		lobe.centerY,
		lobe.radiusX,
		lobe.radiusY,
		0,
		0,
		Math.PI * 2,
	);
}

function roundedRectanglePath(
	context: CanvasContext,
	left: number,
	top: number,
	right: number,
	bottom: number,
	radius: number,
): void {
	const width = right - left;
	const height = bottom - top;
	const corner = Math.min(radius, width / 2, height / 2);
	context.beginPath();
	context.moveTo(left + corner, top);
	context.lineTo(right - corner, top);
	context.quadraticCurveTo(right, top, right, top + corner);
	context.lineTo(right, bottom - corner);
	context.quadraticCurveTo(right, bottom, right - corner, bottom);
	context.lineTo(left + corner, bottom);
	context.quadraticCurveTo(left, bottom, left, bottom - corner);
	context.lineTo(left, top + corner);
	context.quadraticCurveTo(left, top, left + corner, top);
	context.closePath();
}

function drawMaskShapes(
	mask: CanvasSurface,
	lobes: Lobe[],
	floor: number,
): CanvasContext {
	const context = get2dContext(mask);
	context.fillStyle = '#ffffff';
	const root = lobes[0];
	const rootBottom = root.centerY + root.radiusY;
	roundedRectanglePath(
		context,
		root.centerX - root.radiusX,
		rootBottom - 38,
		root.centerX + root.radiusX,
		rootBottom,
		18,
	);
	context.fill();

	for (const lobe of lobes) {
		context.beginPath();
		ellipsePath(context, lobe);
		context.fill();
	}

	return context;
}

function fillCanvas(canvas: CanvasSurface, color: string): void {
	const context = get2dContext(canvas);
	context.fillStyle = color;
	context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawMasked(
	target: CanvasContext,
	layer: CanvasSurface,
	mask: CanvasSurface,
): void {
	const output = canvasFor(target, target.canvas.width, target.canvas.height);
	const outputContext = get2dContext(output);
	outputContext.drawImage(layer, 0, 0);
	outputContext.globalCompositeOperation = 'destination-in';
	outputContext.drawImage(mask, 0, 0);
	target.save();
	target.globalCompositeOperation = 'source-over';
	target.drawImage(output, 0, 0);
	target.restore();
}

function copyMask(
	context: CanvasContext,
	source: CanvasSurface,
): CanvasSurface {
	const copy = maskCanvas(context);
	get2dContext(copy).drawImage(source, 0, 0);
	return copy;
}

function intersectMasks(
	context: CanvasContext,
	first: CanvasSurface,
	second: CanvasSurface,
): CanvasSurface {
	const result = copyMask(context, first);
	const resultContext = get2dContext(result);
	resultContext.globalCompositeOperation = 'destination-in';
	resultContext.drawImage(second, 0, 0);
	return result;
}

function unionMasks(
	context: CanvasContext,
	first: CanvasSurface,
	second: CanvasSurface,
): CanvasSurface {
	const result = copyMask(context, first);
	const resultContext = get2dContext(result);
	resultContext.globalCompositeOperation = 'lighter';
	resultContext.drawImage(second, 0, 0);
	return result;
}

function subtractMasks(
	context: CanvasContext,
	first: CanvasSurface,
	second: CanvasSurface,
): CanvasSurface {
	const result = copyMask(context, first);
	const resultContext = get2dContext(result);
	resultContext.globalCompositeOperation = 'destination-out';
	resultContext.drawImage(second, 0, 0);
	return result;
}

function minFilter(
	context: CanvasContext,
	source: CanvasSurface,
	size: number,
): CanvasSurface {
	const width = source.width;
	const height = source.height;
	const sourceContext = get2dContext(source);
	const input = sourceContext.getImageData(0, 0, width, height);
	const output = sourceContext.createImageData(width, height);
	const radius = Math.floor(size / 2);

	for (let y = 0; y < height; y += 1) {
		for (let x = 0; x < width; x += 1) {
			let minimum = 255;
			for (
				let sampleY = Math.max(0, y - radius);
				sampleY <= Math.min(height - 1, y + radius) && minimum > 0;
				sampleY += 1
			) {
				for (
					let sampleX = Math.max(0, x - radius);
					sampleX <= Math.min(width - 1, x + radius);
					sampleX += 1
				) {
					minimum = Math.min(
						minimum,
						input.data[(sampleY * width + sampleX) * 4 + 3],
					);
					if (minimum === 0) break;
				}
			}
			const index = (y * width + x) * 4;
			output.data[index] = 255;
			output.data[index + 1] = 255;
			output.data[index + 2] = 255;
			output.data[index + 3] = minimum;
		}
	}

	const result = maskCanvas(context);
	get2dContext(result).putImageData(output, 0, 0);
	return result;
}

function lobeMask(context: CanvasContext, lobe: Lobe): CanvasSurface {
	const mask = maskCanvas(context);
	const maskContext = get2dContext(mask);
	maskContext.fillStyle = '#ffffff';
	maskContext.beginPath();
	ellipsePath(maskContext, lobe);
	maskContext.fill();
	return mask;
}

function upperLobeMask(
	context: CanvasContext,
	lobe: Lobe,
	nodeMask: CanvasSurface,
): CanvasSurface {
	const upperRadiusX = Math.max(1, round(lobe.radiusX * 1.08));
	const upperRadiusY = Math.max(1, round(lobe.radiusY * 0.64));
	const upperCenterY = lobe.centerY - lobe.radiusY + upperRadiusY;
	const upperMask = maskCanvas(context);
	const upperContext = get2dContext(upperMask);
	upperContext.fillStyle = '#ffffff';
	upperContext.beginPath();
	upperContext.ellipse(
		lobe.centerX,
		upperCenterY,
		upperRadiusX,
		upperRadiusY,
		0,
		0,
		Math.PI * 2,
	);
	upperContext.fill();
	return intersectMasks(context, upperMask, nodeMask);
}

function shadowLayer(
	context: CanvasContext,
	fill: string,
	shadow: string,
): CanvasSurface {
	const layer = canvasFor(context, context.canvas.width, context.canvas.height);
	fillCanvas(layer, fill);
	const layerContext = get2dContext(layer);
	layerContext.fillStyle = shadow;
	for (let y = 0; y < layer.height; y += 4) {
		for (let x = 0; x < layer.width; x += 4) {
			layerContext.fillRect(x, y, 1, 1);
			layerContext.fillRect(x + 2, y + 2, 1, 1);
		}
	}
	return layer;
}

function boundsFor(lobes: Lobe[], floor: number): CloudBounds {
	return {
		left: Math.min(...lobes.map((lobe) => lobe.centerX - lobe.radiusX)),
		top: Math.min(...lobes.map((lobe) => lobe.centerY - lobe.radiusY)),
		right: Math.max(...lobes.map((lobe) => lobe.centerX + lobe.radiusX)),
		bottom: floor,
		lobes,
	};
}

function fillLayer(context: CanvasContext, color: string): CanvasSurface {
	const layer = canvasFor(context, context.canvas.width, context.canvas.height);
	fillCanvas(layer, color);
	return layer;
}

function drawCloud(
	target: CanvasContext,
	options?: DrawCloudOptions,
): CloudBounds {
	if (!target || !target.canvas) {
		throw new TypeError('drawCloud requires a 2D Canvas rendering context');
	}
	console.log(`Drawing cloud to ${target.canvas}`);
	const settings = options || {};
	const width = target.canvas.width;
	const height = target.canvas.height;
	let floor =
		settings.floor === undefined ? round(height * 0.98) : settings.floor;
	const rootCenterX =
		settings.rootCenterX === undefined ?
			round(width * 0.48)
		:	settings.rootCenterX;
	const fill =
		settings.cloudFill === undefined ? DEFAULT_FILL : settings.cloudFill;
	const outline =
		settings.cloudOutline === undefined ?
			DEFAULT_OUTLINE
		:	settings.cloudOutline;
	const shadow =
		settings.shadowColor === undefined ? DEFAULT_SHADOW : settings.shadowColor;
	const seed = settings.seed;
	const lobes = fractalCloudLobes(width, height, floor, rootCenterX, {
		seed,
		sizeMultiplier: settings.sizeMultiplier,
	});
	const contourLobes = fractalCloudLobes(width, height, floor, rootCenterX, {
		seed,
		sizeMultiplier: 0.92,
	});
	const allLobes = [...lobes, ...contourLobes];
	const horizontalShift = Math.max(
		0,
		-Math.min(...allLobes.map((lobe) => lobe.centerX - lobe.radiusX)),
	);
	for (const lobe of allLobes) {
		lobe.centerX += horizontalShift;
	}
	const bounds = boundsFor(allLobes, floor);
	const left = Math.floor(bounds.left) - MARGIN;
	const top = Math.floor(Math.min(bounds.top, floor - 38)) - MARGIN;
	target.canvas.width = Math.ceil(bounds.right) - left + MARGIN;
	target.canvas.height = Math.ceil(bounds.bottom) - top + MARGIN;
	for (const lobe of allLobes) {
		lobe.centerX -= left;
		lobe.centerY -= top;
	}
	floor -= top;

	const silhouette = maskCanvas(target);
	drawMaskShapes(silhouette, lobes, floor);

	const cloudFillLayer = fillLayer(target, fill);
	const outlineLayer = fillLayer(target, outline);
	drawMasked(target, cloudFillLayer, silhouette);

	const random = randomGenerator(
		seed === undefined || seed === null ? undefined : Number(seed) + 1,
	);
	const shadowPattern = shadowLayer(target, fill, shadow);
	const maxDepth = Math.max(...lobes.map((lobe) => lobe.depth));
	const shadedDepths = new Set([maxDepth, maxDepth - 1]);

	for (const lobe of [...lobes].sort((a, b) => b.depth - a.depth)) {
		const nodeMask = lobeMask(target, lobe);
		if (shadedDepths.has(lobe.depth) && random() < 2 / 3) {
			drawMasked(target, shadowPattern, nodeMask);
		}
		drawMasked(target, cloudFillLayer, upperLobeMask(target, lobe, nodeMask));
	}

	const contourMask = maskCanvas(target);
	const contourContext = get2dContext(contourMask);
	contourContext.fillStyle = '#ffffff';
	for (const lobe of contourLobes) {
		if (lobe.depth === 3 && random() < 0.75 && lobe.centerY < floor - 20) {
			contourContext.beginPath();
			ellipsePath(contourContext, lobe);
			contourContext.fill();
		}
	}
	drawMasked(target, cloudFillLayer, contourMask);
	drawMasked(
		target,
		fillLayer(target, '#323232'),
		subtractMasks(
			target,
			contourMask,
			minFilter(target, contourMask, INNER_OVERLAY_BORDER_WIDTH * 2 + 1),
		),
	);

	let eraseMask = maskCanvas(target);
	const eraseContext = get2dContext(eraseMask);
	eraseContext.fillStyle = '#ffffff';
	for (const lobe of contourLobes) {
		if (lobe.depth === 2 && lobe.centerY < floor - 20) {
			eraseContext.beginPath();
			ellipsePath(eraseContext, lobe);
			eraseContext.fill();
		}
	}
	eraseMask = intersectMasks(target, eraseMask, silhouette);
	drawMasked(target, cloudFillLayer, eraseMask);

	for (const lobe of contourLobes) {
		if (lobe.depth !== 2 || lobe.centerY >= floor - 20 || random() >= 2 / 3) {
			continue;
		}
		const nodeMask = intersectMasks(target, lobeMask(target, lobe), silhouette);
		drawMasked(target, shadowPattern, nodeMask);
		drawMasked(target, cloudFillLayer, upperLobeMask(target, lobe, nodeMask));
	}

	const cloudUnion = unionMasks(target, silhouette, contourMask);
	drawMasked(
		target,
		outlineLayer,
		subtractMasks(
			target,
			cloudUnion,
			minFilter(target, cloudUnion, OUTER_OUTLINE_WIDTH * 2 + 1),
		),
	);

	if (settings.debug) {
		target.save();
		target.strokeStyle = outline;
		target.lineWidth = 1;
		for (const lobe of lobes) {
			target.beginPath();
			ellipsePath(target, lobe);
			target.stroke();
		}
		target.restore();
	}

	return {
		left: bounds.left - left,
		top: Math.min(bounds.top, bounds.bottom - 38) - top,
		right: bounds.right - left,
		bottom: floor,
		lobes,
	};
}

const CloudAPI: CloudRenderer = {
	drawCloud,
	fractalCloudLobes,
	verticalShapeInfluence,
};

export default CloudAPI;
