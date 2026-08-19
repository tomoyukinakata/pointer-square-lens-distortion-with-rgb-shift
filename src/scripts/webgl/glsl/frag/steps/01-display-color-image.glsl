precision highp float;

uniform sampler2D u_texture1;
uniform sampler2D u_texture2;
uniform vec2 u_meshSize;
uniform vec2 u_textureSize1;
uniform vec2 u_textureSize2;

varying vec2 v_uv;

#include "../chunks/coverUv.glsl"

void main() {
  vec2 texture1Uv = getCoverUv(
    v_uv,
    u_meshSize,
    u_textureSize1
  );

  vec2 texture2Uv = getCoverUv(
    v_uv,
    u_meshSize,
    u_textureSize2
  );

  vec4 insideColor = texture2D(
    u_texture1,
    texture1Uv
  );

  vec4 outsideColor = texture2D(
    u_texture2,
    texture2Uv
  );

  gl_FragColor = insideColor;
}