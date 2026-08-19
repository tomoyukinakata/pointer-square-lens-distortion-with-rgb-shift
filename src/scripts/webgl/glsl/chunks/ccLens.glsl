// ---------------------------------------------------------------------------
// Applies a CC Lens-style radial distortion to UV coordinates.
// ---------------------------------------------------------------------------
float getCCLensScale(float distortion, float radius2) {
  if (distortion >= 0.0) {
    return 1.0 + distortion * radius2;
  }

  return 1.0 / (1.0 - distortion * radius2);
}

vec2 getCCLensUv(vec2 uv, vec2 resolution, float distortion) {
  vec2 centeredUv = uv - 0.5;
  vec2 aspectScale = vec2(resolution.x / resolution.y, 1.0);
  vec2 centeredPosition = centeredUv * aspectScale;

  float radius2 = dot(centeredPosition, centeredPosition);
  float lensScale = getCCLensScale(distortion, radius2);

  vec2 distortedPosition = centeredPosition * lensScale;
  vec2 distortedCenteredUv = distortedPosition / aspectScale;
  vec2 distortedUv = distortedCenteredUv + 0.5;
  vec2 distortionOffset = distortedUv - uv;

  return uv - distortionOffset;
}
