precision highp float;

uniform sampler2D u_texture1;
uniform sampler2D u_texture2;
uniform vec2 u_meshSize;
uniform vec2 u_textureSize1;
uniform vec2 u_textureSize2;
uniform float u_squareSize;

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

  vec2 uvSquare = v_uv * 2.0 - 1.0;

  vec2 squareAspectScale = vec2(
    min(u_meshSize.y / u_meshSize.x, 1.0),
    min(u_meshSize.x / u_meshSize.y, 1.0)
  );

  uvSquare /= squareAspectScale;

  float squareHalfSize = u_squareSize;

  float left = -squareHalfSize;
  float right = squareHalfSize;
  float bottom = -squareHalfSize;
  float top = squareHalfSize;

  float squareMask =
    step(left, uvSquare.x)
    * (1.0 - step(right, uvSquare.x))
    * step(bottom, uvSquare.y)
    * (1.0 - step(top, uvSquare.y));

  vec4 insideColor = texture2D(
    u_texture1,
    texture1Uv
  );

  vec4 outsideColor = texture2D(
    u_texture2,
    texture2Uv
  );

  vec4 finalColor = mix(
    outsideColor,
    insideColor,
    squareMask
  );

  gl_FragColor = finalColor;
}