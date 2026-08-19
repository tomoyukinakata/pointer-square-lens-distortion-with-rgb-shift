precision highp float;

uniform sampler2D u_texture1;
uniform sampler2D u_texture2;
uniform vec2 u_meshSize;
uniform vec2 u_textureSize1;
uniform vec2 u_textureSize2;
uniform float u_squareSize;
uniform float u_lensDistortion;
uniform float u_rgbShiftR;
uniform float u_rgbShiftG;
uniform float u_rgbShiftB;

varying vec2 v_uv;

#include "../chunks/coverUv.glsl"
#include "../chunks/ccLens.glsl"

void main() {
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

  vec2 squareUv =
    uvSquare / (squareHalfSize * 2.0) + 0.5;

  vec2 distortedSquareUv = getCCLensUv(
    squareUv,
    vec2(1.0),
    u_lensDistortion
  );

  vec2 squareLensOffset =
    distortedSquareUv - squareUv;

  vec2 viewportLensOffset =
    squareLensOffset
    * squareHalfSize
    * squareAspectScale;

  vec2 lensTexture1Uv = getCoverUv(
    v_uv + viewportLensOffset,
    u_meshSize,
    u_textureSize1
  );

  vec2 rgbShiftDirection =
    (squareUv - 0.5) * 2.0;

  float r = texture2D(
    u_texture1,
    lensTexture1Uv
      + rgbShiftDirection * u_rgbShiftR
  ).r;
  float g = texture2D(
    u_texture1,
    lensTexture1Uv
      + rgbShiftDirection * u_rgbShiftG
  ).g;
  float b = texture2D(
    u_texture1,
    lensTexture1Uv
      + rgbShiftDirection * u_rgbShiftB
  ).b;

  vec4 insideColor = vec4(r, g, b, 1.0);

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
