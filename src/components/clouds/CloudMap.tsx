import { ThreeEvent } from '@react-three/fiber';
import * as React from 'react';
import { Vector3 } from 'three';

import { Cloud, CloudProps } from './Cloud';
import { Ground } from './Ground';

const planeSize = 500;
const fieldSize = 100;
const baseFieldSize = [fieldSize, fieldSize] as [number, number];
const cloudHeight = 0;
const cloudMinSize = 500;
const cloudSizeVariance = 200;

export type CloudFieldProps = Omit<
  CloudProps,
  'onExitBoundary' | 'id' | 'initialPosition' | 'boundarySize'
> & {
  numClouds?: number;
  maxClouds?: number;
};

export const CloudMap: React.FC<CloudFieldProps> = ({
  numClouds = 6,
  maxClouds = 10,
  ...cloudProps
}) => {
  const size = baseFieldSize;

  const [clouds, setClouds] = React.useState<CloudData[]>([]);

  React.useEffect(() => {
    const initClouds: Array<CloudData> = [];

    // one cloud always at 0
    const firstId = randomId();
    initClouds.push({
      id: firstId,
      initialPosition: new Vector3(0, cloudHeight, 0),
      size: randomSize(),
    });

    for (let i = 0; i < numClouds - 1; i++) {
      const id = randomId();
      initClouds.push({
        id,
        initialPosition: randomPosition(size),
        size: randomSize(),
      });
    }
    setClouds(initClouds);
  }, [size[0], size[1]]);

  const boundarySize = React.useMemo(
    () => [size[0] * 1.5, size[1] * 1.5] as [number, number],
    [size[0], size[1]],
  );

  const createCloud = (ev: ThreeEvent<MouseEvent>) => {
    const id = randomId();
    const size = randomSize();
    const pos = ev.intersections[0].point;
    // const pos = ev.unprojectedPoint;
    setClouds((cur) => {
      if (cur.length >= maxClouds) {
        cur.shift();
      }
      return [
        ...cur,
        {
          id,
          initialPosition: new Vector3(pos.x, cloudHeight, pos.z),
          size,
        },
      ];
    });
  };

  return (
    <>
      {clouds.map((cloud) => (
        <Cloud
          id={cloud.id}
          key={cloud.id}
          boundarySize={boundarySize}
          initialPosition={cloud.initialPosition}
          size={cloud.size}
          {...cloudProps}
        />
      ))}
      <Ground planeSize={planeSize} onClick={createCloud} />
    </>
  );
};

type CloudData = {
  id: string;
  initialPosition: Vector3;
  size: number;
};

const randomId = () => `${Math.random() * 10000000}`;

const randomPosition = (boundarySize: [number, number]) =>
  new Vector3(
    Math.random() * boundarySize[0] - boundarySize[0] / 2,
    cloudHeight,
    Math.random() * boundarySize[1] - boundarySize[1] / 2,
  );

const randomSize = () => Math.random() * cloudSizeVariance + cloudMinSize;
