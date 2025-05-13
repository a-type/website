import { animated, useSpring } from '@react-spring/three';
import { Environment, PerformanceMonitor, Plane } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import {
	Bloom,
	DepthOfField,
	EffectComposer,
	Noise,
	Select,
	Selection,
} from '@react-three/postprocessing';
import { Suspense, useCallback, useRef, useState } from 'react';
import { Group } from 'three';
import {
	Instances as SubwayInstances,
	Model as SubwayModel,
} from './Subway-bake';

const CAR_COUNT = 5;

export function SubwayScene() {
	const [perfLevel, setPerfLevel] = useState(3);
	const incrementPerf = useCallback(
		() => setPerfLevel((p) => Math.min(4, p + 1)),
		[],
	);
	const decrementPerf = useCallback(
		() => setPerfLevel((p) => Math.max(0, p - 1)),
		[],
	);

	let dpr = 1;
	if (perfLevel === 0) {
		dpr = 0.25;
	} else if (perfLevel === 1) {
		dpr = 0.5;
	} else if (perfLevel === 2) {
		dpr = 1;
	} else if (perfLevel === 3) {
		dpr = 1;
	} else if (perfLevel === 4) {
		dpr = 2;
	}

	return (
		<Suspense>
			<Canvas
				camera={{
					position: [0, 0, 4],
				}}
				shadows={false}
				dpr={dpr}
			>
				<Selection>
					<EffectComposer autoClear={false} multisampling={0}>
						<DepthOfField
							focusDistance={1}
							focalLength={0.02}
							bokehScale={2}
							height={480}
						/>
						{/* <HueSaturation hue={Math.random() * 255} /> */}
						<Bloom luminanceThreshold={0} luminanceSmoothing={3} height={800} />
						<Noise opacity={0.1} />
						{/* <DotScreen scale={4} /> */}
					</EffectComposer>
					{/* <Select enabled> */}
					<Scene />
					{/* </Select> */}
					{/* <OrbitControls /> */}
					<color attach="background" args={[0x202020]} />
					<PerformanceMonitor
						onIncline={incrementPerf}
						onDecline={decrementPerf}
						flipflops={3}
						onFallback={() => setPerfLevel(1)}
					/>
				</Selection>
			</Canvas>
		</Suspense>
	);
}

function Scene() {
	return (
		<>
			{/* <pointLight position={[0, 2, 0]} castShadow intensity={0.5} /> */}
			<ambientLight intensity={0.1} color={0xffe0b2} />
			{/* <directionalLight
				position={[0, 2, 0]}
				castShadow
				intensity={0.15}
				color={0xffb300}
			/> */}
			<Select enabled>
				<SubwayInstances>
					{new Array(CAR_COUNT).fill(null).map((_, i) => (
						<Car key={i} index={i} />
					))}
				</SubwayInstances>
			</Select>
			{/* <BakeShadows /> */}
			<Environment preset="city" />
			<RunnerLights />
			<CameraMouseMove />
			{/* walls */}
		</>
	);
}

function CameraMouseMove() {
	const ref = useRef<any>(null);
	useFrame(({ camera, mouse }) => {
		const x = mouse.x;
		const y = mouse.y;
		const sinShake = Math.sin(Date.now() / 1000) * 0.03;
		camera.position.x = x / 4 + sinShake;
		camera.position.y = y / 4 + sinShake;
		camera.lookAt(0, 0, 0);
	});
	return null;
}

function Car({ index }: { index: number }) {
	const [{ position }, api] = useSpring(() => ({
		position: [0, 0, index * -8.9],
		config: { mass: 5, tension: 500, friction: 200 },
	}));

	useFrame((state) => {
		// train cars move in a sinusoidal pattern
		const t = state.clock.getElapsedTime();
		const x = Math.sin(t + index * 0.25) / (3 / index);
		const z = index * -8.9;
		api.start({ position: [x, 0, z] });
	});

	return (
		<animated.group position={position}>
			<SubwayModel />
		</animated.group>
	);
}

const runnerLightIntensity = 0.25;
const runnerLightColor = 0xfff3af;
const runnerPosition = 8;
function RunnerLights() {
	const ref = useRef<Group>(null!);
	const modeRef = useRef(1);
	const lightRef1 = useRef<any>(null);
	const lightRef2 = useRef<any>(null);
	const lightRef3 = useRef<any>(null);
	const lightRef4 = useRef<any>(null);

	const lightIntensityRef = useRef(runnerLightIntensity);
	const setLightIntensity = useCallback((intensity: number) => {
		lightRef1.current.intensity = intensity;
		lightRef2.current.intensity = intensity;
		lightRef3.current.intensity = intensity;
		lightRef4.current.intensity = intensity;
		lightIntensityRef.current = intensity;
	}, []);

	useFrame(() => {
		if (modeRef.current === 1) {
			ref.current.position.z += 1;
			if (ref.current.position.z > 100) modeRef.current = 2;
		}
		if (modeRef.current === 2) {
			ref.current.position.y += 1;
			if (ref.current.position.y > 30) modeRef.current = 3;
		}
		if (modeRef.current === 3) {
			setLightIntensity(lightIntensityRef.current - 0.001);
			if (lightIntensityRef.current <= 0) modeRef.current = 4;
		}
		if (modeRef.current === 4) {
			ref.current.position.z -= 1;
			if (ref.current.position.z < -100) modeRef.current = 5;
		}
		if (modeRef.current === 5) {
			ref.current.position.y -= 1;
			if (ref.current.position.y < 0) modeRef.current = 6;
		} else if (modeRef.current === 6) {
			setLightIntensity(lightIntensityRef.current + 0.001);
			if (lightIntensityRef.current >= runnerLightIntensity)
				modeRef.current = 1;
		}

		// if (
		// 	modeRef.current > 1 && modeRef.current < 6
		// ) {
		// 	if (lightIntensityRef.current > 0) {
		// 		setLightIntensity(lightIntensityRef.current - 0.005);
		// 	}
		// }
	});
	return (
		<group ref={ref}>
			<pointLight
				ref={lightRef1}
				position={[-runnerPosition, 0, 0]}
				intensity={runnerLightIntensity}
				color={runnerLightColor}
			/>
			<pointLight
				ref={lightRef2}
				position={[runnerPosition, 0, 0]}
				intensity={runnerLightIntensity}
				color={runnerLightColor}
			/>
			<pointLight
				ref={lightRef3}
				position={[-runnerPosition, 0, -10]}
				intensity={runnerLightIntensity}
				color={runnerLightColor}
			/>
			<pointLight
				ref={lightRef4}
				position={[runnerPosition, 0, -10]}
				intensity={runnerLightIntensity}
				color={runnerLightColor}
			/>
			<Plane
				args={[50, 10]}
				rotation={[0, Math.PI / 2, 0]}
				position={[-10, 2, 25]}
			>
				<meshBasicMaterial color={'#f9f5ba'} attach="material" />
			</Plane>
			<Plane
				args={[50, 10]}
				rotation={[0, -Math.PI / 2, 0]}
				position={[10, 2, 25]}
			>
				<meshBasicMaterial color={'#f9f5ba'} attach="material" />
			</Plane>
		</group>
	);
}
