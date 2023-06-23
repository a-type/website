import * as React from 'react';
import { Vector3 } from 'three';

import { useColors } from './colors';

export const Ray: React.FC<{ start: Vector3; end: Vector3 }> = ({
  start,
  end,
}) => {
  const vertices = React.useMemo(
    () => new Float32Array([start.x, start.y, start.z, end.x, end.y, end.z]),
    [start, end],
  );
  const colors = useColors();

  return (
    <line>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attachObject={['attributes', 'position']}
          itemSize={3}
          array={vertices}
        />
      </bufferGeometry>
      <lineBasicMaterial attach="material" color="white" />
    </line>
  );
};
