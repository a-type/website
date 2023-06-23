import { a, useSpring } from '@react-spring/three';
import { ThreeEvent, useLoader } from '@react-three/fiber';
import { RepeatWrapping, TextureLoader } from 'three';

import { useColors } from './colors';
import tex from './textures/ground_texture_4.jpg';

export function Ground({
  planeSize,
  onClick,
}: {
  planeSize: number;
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
}) {
  const colors = useColors();

  const texture = useLoader(TextureLoader, tex);
  texture.repeat.set(Math.floor(planeSize / 50), Math.floor(planeSize / 50));
  texture.wrapS = texture.wrapT = RepeatWrapping;

  const { color } = useSpring({
    color: colors.ground,
  });

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
      onClick={onClick}
    >
      <planeGeometry
        args={[(planeSize * 16) / 9, planeSize, 16, 16]}
        attach="geometry"
      />
      <a.meshStandardMaterial attach="material" color={color} map={texture} />
    </mesh>
  );
}
