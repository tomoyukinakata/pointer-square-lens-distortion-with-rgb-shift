precision highp float;

uniform sampler2D u_texture1;
uniform sampler2D u_texture2;
uniform vec2 u_meshSize;
uniform vec2 u_textureSize1;
uniform vec2 u_textureSize2;
uniform vec2 u_mouse;
uniform float u_squareSize;
uniform float u_lensDistortion;
uniform float u_rgbShiftR;
uniform float u_rgbShiftG;
uniform float u_rgbShiftB;
uniform float u_waveFrequency;
uniform float u_waveStrength;
uniform float u_waveSpeed;
uniform float u_randomFrequency;
uniform float u_randomStrength;
uniform float u_randomSpeed;
uniform float u_time;

varying vec2 v_uv;

#include "../chunks/coverUv.glsl"
#include "../chunks/ccLens.glsl"
#include "../chunks/random3.glsl"

void main() {
  vec2 texture2Uv = getCoverUv(v_uv, u_meshSize, u_textureSize2);

  // Convert the square UV coordinates from the 0.0-to-1.0 range to the -1.0-to-1.0 range.
  vec2 uvSquare = v_uv * 2.0 - 1.0;

  // Offset the coordinates so the mouse position becomes the origin for the square test.
  uvSquare -= u_mouse;

  // Calculate an aspect-ratio correction factor for determining the square's bounds.
  vec2 squareAspectScale = vec2(min((u_meshSize.y / u_meshSize.x), 1.0), min((u_meshSize.x / u_meshSize.y), 1.0));

  // Correct the test coordinates so the mask remains square.
  uvSquare /= squareAspectScale;

  float wave = sin(
    texture2Uv.y * u_waveFrequency
    + u_time * u_waveSpeed
  ) * u_waveStrength;
  texture2Uv.y += wave;
  texture2Uv += random3(
    vec3(texture2Uv * u_randomFrequency, u_time * u_randomSpeed)
  ).x * u_randomStrength;

  // Store half the square's side length so u_squareSize can control its size.
  float squareHalfSize = u_squareSize;

  // Calculate the square's left edge.
  float left = -squareHalfSize;

  // Calculate the square's right edge.
  float right = squareHalfSize;

  // Calculate the square's bottom edge.
  float bottom = -squareHalfSize;

  // Calculate the square's top edge.
  float top = squareHalfSize;

  // Return 1.0 when uvSquare is inside the square and 0.0 when it is outside.
  float squareMask = step(left, uvSquare.x) * (1.0 - step(right, uvSquare.x)) * step(bottom, uvSquare.y) * (1.0 - step(top, uvSquare.y));

  // Convert uvSquare to the 0.0-to-1.0 range for the CC Lens distortion.
  vec2 squareUv = uvSquare / (squareHalfSize * 2.0) + 0.5;

  // Apply the CC Lens distortion inside the square.
  vec2 distortedSquareUv = getCCLensUv(squareUv, vec2(1.0), u_lensDistortion);

  // Calculate the square-local offset from the difference before and after distortion.
  vec2 squareLensOffset = distortedSquareUv - squareUv;

  // squareLensOffset is relative to the square. Adding it directly to v_uv would treat it as
  // relative to the entire mesh and make the distortion too large, so scale it by the square's
  // half-size and aspect-ratio correction factor to convert it to a mesh-relative offset.
  vec2 viewportLensOffset = squareLensOffset * squareHalfSize * squareAspectScale;

  // Convert the coordinates inside the square to UV coordinates for u_texture1.
  vec2 lensTexture1Uv = getCoverUv(v_uv + viewportLensOffset, u_meshSize, u_textureSize1);

  // Use the square's center as the origin so the RGB shift grows stronger toward the outside.
  vec2 rgbShiftDirection = (squareUv - 0.5) * 2.0;

  // Sample each RGB channel with a different UV offset to create color separation.
  float r = texture2D(u_texture1, lensTexture1Uv + rgbShiftDirection * u_rgbShiftR).r;
  float g = texture2D(u_texture1, lensTexture1Uv + rgbShiftDirection * u_rgbShiftG).g;
  float b = texture2D(u_texture1, lensTexture1Uv + rgbShiftDirection * u_rgbShiftB).b;

  // Recombine the shifted u_texture1 channels to create the color inside the square.
  vec4 insideColor = vec4(r, g, b, 1.0);

  // Sample u_texture2 for the color outside the square.
  vec4 outsideColor = texture2D(u_texture2, texture2Uv);

  // Blend the inside and outside colors according to the square mask.
  vec4 finalColor = mix(outsideColor, insideColor, squareMask);

  gl_FragColor = finalColor;
}
