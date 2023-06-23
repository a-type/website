import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useLoader } from '@react-three/fiber';
import * as React from 'react';
import { FontLoader, Mesh, Vector3 } from 'three';

export type TextProps = {
  children: string;
  size?: number;
  position?: Vector3;
};

export const Text: React.FC<TextProps> = ({
  children,
  size = 1,
  position = new Vector3(),
}) => {
  const font = useLoader(FontLoader as any, '/fonts/Poiret One_Regular.json');
  const config = React.useMemo(
    () => ({
      font,
      size: 24,
      height: 1,
      curveSegments: 32,
    }),
    [font],
  );
  const onUpdate = (self: Mesh) => {
    const size = new Vector3();
    self.geometry.computeBoundingBox();
    self.geometry.boundingBox.getSize(size);
    self.position.x = -size.x / 2;
    self.position.y = -size.y / 2;
  };

  const isNarrow = useMediaQuery('(max-width: 800px)');

  return (
    <group
      scale={[
        0.1 * size * (isNarrow ? 0.5 : 1),
        0.1 * size * (isNarrow ? 0.5 : 1),
        0.1,
      ]}
      rotation={[0, 0, 0]}
      position={position}
    >
      <mesh onUpdate={onUpdate} receiveShadow>
        <textGeometry
          attach="geometry"
          args={[children, config] as [string, any]}
        />
        <meshStandardMaterial attach="material" color="#fff" />
      </mesh>
    </group>
  );
};
