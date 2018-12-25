varying vec4 n;
uniform float wind;
void main() {
  vec4 p = vec4(position, 1.0);
  p.x += wind;
  gl_Position = projectionMatrix * modelViewMatrix * p;
}
