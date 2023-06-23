import { Color, ShaderChunk, UniformsLib, UniformsUtils, Vector3 } from 'three';

export default {
  uniforms: UniformsUtils.merge([
    UniformsLib.lights,
    UniformsLib.fog,
    {
      uDirLightPos: { value: new Vector3() },
      uDirLightColor: { value: new Color(0xeeeeee) },
      ambientLightColor: { value: new Color(0x050505) },
      uBaseColor: { value: new Color(0xffffff) },
      uLineColor1: { value: new Color(0xa0a0a0) },
      uLineColor2: { value: new Color(0x0000a0) },
    },
  ]),

  vertexShader: `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    ${ShaderChunk.beginnormal_vertex}
    ${ShaderChunk.defaultnormal_vertex}
    ${ShaderChunk.begin_vertex}
    ${ShaderChunk.project_vertex}
    ${ShaderChunk.worldpos_vertex}
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
  }
  `,

  fragmentShader: `
    ${ShaderChunk.common}
    ${ShaderChunk.packing}
    ${ShaderChunk.bsdfs}
    ${ShaderChunk.lights_pars_begin}

    uniform vec3 uBaseColor;
    uniform vec3 uLineColor1;
    uniform vec3 uLineColor2;

    uniform vec3 uDirLightPos;
    uniform vec3 uDirLightColor;

    varying vec3 vNormal;

    void main() {
      float shadowPower = 1.0;
      float t = 0.0;

      float directionalLightWeighting = max(dot(normalize(vNormal), uDirLightPos), 0.0);
      vec3 lightWeighting = uDirLightColor * directionalLightWeighting;

      if (directionalLightWeighting < 12.0) {
        gl_FragColor = vec4(uLineColor1, 1.0);
      } else {
        gl_FragColor = vec4(uBaseColor, 1.0);
      }

      if (directionalLightWeighting < 0.001) {
        t = (mod(gl_FragCoord.x + gl_FragCoord.y, 4.0));
        if (t > 2.0 && t < 4.0) {
          gl_FragColor = vec4( mix(uLineColor2, uLineColor1, 0.5 * shadowPower), 1.0);
        }
      }
    }
  `,
};
