varying vec4 n;
void main() {
  n = vec4(normal, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
