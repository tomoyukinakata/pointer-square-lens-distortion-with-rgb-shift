precision highp float;

attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 v_uv;

void main() {
	v_uv = uv;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
