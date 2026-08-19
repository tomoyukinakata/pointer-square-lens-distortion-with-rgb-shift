// ---------------------------------------------------------------------------
// Generates a pseudo-random vec3 from a 3D input coordinate.
// ---------------------------------------------------------------------------
// <www.shadertoy.com/view/XsX3zB>
// by Nikita Miropolskiy
vec3 random3(vec3 c) {
  float j = 4096.0 * sin(dot(c, vec3(17.0, 59.4, 15.0)));
  vec3 r;

  r.z = fract(512.0 * j);
  j *= 0.125;
  r.x = fract(512.0 * j);
  j *= 0.125;
  r.y = fract(512.0 * j);

  return r - 0.5;
}
