import { AdaptiveDpr, AdaptiveEvents, Preload, useDetectGPU } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { DepthOfField, EffectComposer } from '@react-three/postprocessing';
import { Suspense, useContext } from 'react';
import { Color, PCFShadowMap, Vector3 } from 'three';

import { Camera } from './Camera';
import { CloudMap } from './CloudMap';
import { useColors } from './colors';
import LightContext from './LightContext';
import { Sun } from './Sun';
import { useCloudRefs } from './useCloudRefs';

export type SceneProps = {
  style?: any;
};

const lightValues = {
  pointLightPosition: new Vector3(100, 100, 0),
  pointLightColor: new Color('#fff'),
  ambientLightColor: new Color('#aaa'),
};

const windVelocity = new Vector3(0.003, 0, 0.0006);

const cameraPosition = [8, 30, 14];

const isSsr = typeof window === 'undefined';

const resolution = () =>
  !isSsr
    ? window.document.documentElement.clientHeight *
      window.document.documentElement.clientWidth
    : 0;
const initialResolution = resolution();
const defaultPixelRatio =
  initialResolution > 500000
    ? initialResolution > 1000000
      ? 0.5
      : 0.75
    : !isSsr
    ? window.devicePixelRatio
    : 0;

const InnerScene: React.FC<SceneProps> = ({ style }) => {
  const bgColor = useColors((c) => c.ground);
  const lightContext = useContext(LightContext);

  const gpu = useDetectGPU();

  const cloudRefs = useCloudRefs();

  return (
    <Canvas
      shadows={{ type: PCFShadowMap, enabled: true }}
      style={{ backgroundColor: bgColor, ...style }}
      dpr={defaultPixelRatio}
    >
      <Suspense fallback={null}>
        <Camera position={cameraPosition} />
        <Sun />
        <ambientLight color={lightContext.ambientLightColor} />
        <CloudMap velocity={windVelocity} />
        {gpu.tier >= 2 && (
          <EffectComposer autoClear={false}>
            {/* <SSAO /> */}
            {/* <Outline
              selection={cloudRefs.refs}
              blendFunction={BlendFunction.ALPHA}
              visibleEdgeColor={0x000000}
              edgeStrength={0.1}
            /> */}
            <DepthOfField blur={19} bokehScale={2} />
          </EffectComposer>
        )}
        <AdaptiveDpr />
        <AdaptiveEvents />
        <Preload all />
      </Suspense>
    </Canvas>
  );
};

export const Scene: React.FC<SceneProps> = (props) => {
  return (
    <LightContext.Provider value={lightValues}>
      <Suspense fallback={null}>
        <InnerScene {...props} />
      </Suspense>
    </LightContext.Provider>
  );
};

export default Scene;
