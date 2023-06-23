import { a, config, useSpring } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import * as React from 'react';
import { BufferGeometry, Group, Vector3 } from 'three';

import { CloudShaderMaterial } from './CloudShaderMaterial';
import generateVoxelGeometries from './generateVoxelGeometries';
import { useCloudRef } from './useCloudRefs';

export type CloudProps = {
  velocity: Vector3;
  id: string;
  initialPosition: Vector3;
  onExitBoundary?: (id: string) => any;
  boundarySize: [number, number];
  size?: number;
  resolution?: number;
};

type GeometryState = {
  geometry: BufferGeometry;
  resolution: number;
};

export const Cloud = React.memo<CloudProps>(
  ({
    velocity,
    onExitBoundary,
    id,
    initialPosition,
    size = 680,
    resolution: providedResolution = 64,
    boundarySize,
  }) => {
    const ref = React.useRef<Group>();
    const rotation = React.useRef(Math.random() * Math.PI * 2);

    const [lodGeometries, setLodGeometries] = React.useState<
      Map<number, GeometryState>
    >(new Map());

    const generateLod = React.useCallback(
      () =>
        generateVoxelGeometries({ resolution: providedResolution }).then(
          ({ geometry: geo }) =>
            setLodGeometries((existing) => {
              existing.set(providedResolution, {
                resolution: providedResolution,
                geometry: geo,
              });
              return new Map(existing);
            }),
        ),
      [setLodGeometries, providedResolution],
    );

    const isExiting = React.useRef(false);
    useFrame(() => {
      if (!ref.current || !lodGeometries.size) return;

      ref.current.position.add(velocity);
      const planePosition = new Vector3(
        ref.current.position.x,
        0,
        ref.current.position.z,
      );
      if (planePosition.x > boundarySize[0] / 2 && !isExiting.current) {
        isExiting.current = true;
        onExitBoundary && onExitBoundary(id);
        // disabled: generate a new cloud
        //generateLod().then(() => {
        isExiting.current = false;
        if (!ref.current) return;
        ref.current.position.x = -boundarySize[0] * 0.75;
        ref.current.position.z = -Math.random() * 0.75 * boundarySize[1];
        //});
      }
    });

    React.useEffect(() => {
      generateLod();
    }, [generateLod]);

    const { y } = useSpring({
      y: !!lodGeometries.size ? initialPosition.y : 100,
      config: config.gentle,
    });
    const cloudRef = useCloudRef();

    if (!lodGeometries.size) {
      return null;
    }

    const { geometry, resolution } = lodGeometries.get(
      Array.from(lodGeometries.keys()).sort().pop() as number,
    ) as GeometryState;

    const scale = size / resolution;

    const position = y.to(
      (v) =>
        new Vector3(
          ref.current ? ref.current.position.x : initialPosition.x,
          v,
          ref.current ? ref.current.position.z : initialPosition.z,
        ) as any,
    );

    return (
      <>
        <a.group
          ref={ref}
          position={position}
          scale={[scale, scale, scale]}
          rotation={[0, rotation.current, 0]}
        >
          <mesh
            geometry={geometry}
            position={[0, 2 * (380 / size), 0]}
            castShadow
            ref={cloudRef}
          >
            <CloudShaderMaterial attach="material" />
            {/* <meshBasicMaterial attach="material" color="white" /> */}
          </mesh>
        </a.group>
      </>
    );
  },
);
