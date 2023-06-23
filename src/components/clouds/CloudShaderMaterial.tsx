import { a, useSpring } from '@react-spring/three';
import * as React from 'react';

import { useColors } from './colors';
import LightContext from './LightContext';
import Shader from './shaders/CloudShader';

export type CloudShaderMaterialProps = {
  attach?: string;
  baseColor?: string;
  shadeColor1?: string;
  shadeColor2?: string;
};

export const CloudShaderMaterial: React.FC<CloudShaderMaterialProps> = ({
  baseColor: providedBaseColor,
  shadeColor1,
  shadeColor2,
  ...rest
}) => {
  const colors = useColors();

  const { pointLightPosition, pointLightColor, ambientLightColor } =
    React.useContext(LightContext);

  const { baseColor, lineColor, lineColor2 } = useSpring({
    baseColor: providedBaseColor ?? colors.cloudWhite,
    lineColor: shadeColor1 ?? colors.cloudShadow1,
    lineColor2: shadeColor2 ?? colors.cloudShadow2,
  });

  // const shaderArgs = React.useMemo(
  //   () => ({
  //     fog: true,
  //     lights: true,
  //     dithering: true,
  //     uniforms: {
  //       ...Shader.uniforms,
  //       uDirLightPos: { value: pointLightPosition },
  //       uDirLightColor: { value: pointLightColor },
  //       ambientLightColor: { value: ambientLightColor },
  //       uBaseColor: { value: baseColor || new Color(colors.cloudWhite) },
  //       uLineColor1: { value: shadeColor1 || new Color(colors.cloudShadow1) },
  //       uLineColor2: { value: shadeColor2 || new Color(colors.cloudShadow2) },
  //     },
  //     vertexShader: Shader.vertexShader,
  //     fragmentShader: Shader.fragmentShader,
  //   }),
  //   [
  //     pointLightColor,
  //     pointLightPosition,
  //     ambientLightColor,
  //     baseColor,
  //     shadeColor1,
  //     shadeColor2,
  //     colors.cloudWhite,
  //     colors.cloudShadow1,
  //     colors.cloudShadow2,
  //   ],
  // );

  return (
    <a.shaderMaterial
      args={[
        {
          lights: true,
          uniforms: {
            ...Shader.uniforms,
            uDirLightPos: { value: pointLightPosition },
            uDirLightColor: { value: pointLightColor },
            ambientLightColor: { value: ambientLightColor },
          },
          vertexShader: Shader.vertexShader,
          fragmentShader: Shader.fragmentShader,
        },
      ]}
      uniforms-uBaseColor-value={baseColor}
      uniforms-uLineColor1-value={lineColor}
      uniforms-uLineColor2-value={lineColor2}
      {...rest}
    />
  );
};
