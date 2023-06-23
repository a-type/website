import { createContext } from 'react';
import { Color, Vector3 } from 'three';

export default createContext<{
  pointLightPosition: Vector3;
  pointLightColor: Color;
  ambientLightColor: Color;
}>({
  pointLightPosition: new Vector3(-44, 14, 14),
  pointLightColor: new Color('#fff'),
  ambientLightColor: new Color('#aaa'),
});
