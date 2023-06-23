import { a, useSpring } from '@react-spring/three';
import { PerspectiveCamera } from '@react-three/drei';
import type * as React from 'react';
import { useMove } from 'react-use-gesture';
import { Euler, Vector3 } from 'three';

const AnimatedCamera = a(PerspectiveCamera);

export type CameraProps = {
  position: number[];
  movementFactor?: number;
};

export const Camera: React.FC<CameraProps> = ({ position }) => {
  const [{ currentPosition, currentRotation }, spring] = useSpring(() => ({
    currentPosition: position as [number, number, number],
    currentRotation: new Euler(0, 0, 0),
  }));

  useMove(
    ({ xy: [x, y] }: { xy: [number, number] }) => {
      if (typeof window === 'undefined') return;

      const allowedDragLimit = 5;
      const viewportHeight = document.body.clientHeight;
      const viewportWidth = document.body.clientWidth;

      const normalizedX = (x - viewportWidth / 2) / viewportWidth;
      const normalizedY = (y - viewportHeight / 2) / viewportHeight;

      spring.start({
        currentPosition: [
          position[0] + normalizedX * allowedDragLimit,
          position[1] - normalizedY * normalizedY * allowedDragLimit,
          position[2],
        ],
      });
    },
    { domTarget: window },
  );

  return (
    <AnimatedCamera
      makeDefault
      fov={70}
      position={currentPosition}
      rotation={currentRotation}
      onUpdate={(cam) => {
        cam.lookAt(new Vector3(0, 10, 0));
      }}
    />
  );
};
