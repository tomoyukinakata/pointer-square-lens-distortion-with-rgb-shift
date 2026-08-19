// ---------------------------------------------------------------------------
// Make the texture UVs behave like CSS's `background-size: cover`.
// ---------------------------------------------------------------------------
vec2 getCoverUv(vec2 uv, vec2 meshSize, vec2 textureSize) {
  vec2 meshRatio = vec2(meshSize.x / meshSize.y, meshSize.y / meshSize.x);
  vec2 textureRatio = vec2(textureSize.x / textureSize.y, textureSize.y / textureSize.x);
  vec2 resolutionRatio = vec2(
    min(meshRatio.x / textureRatio.x, 1.0),
    min(meshRatio.y / textureRatio.y, 1.0)
  );

  return (uv - 0.5) * resolutionRatio + 0.5;
}
