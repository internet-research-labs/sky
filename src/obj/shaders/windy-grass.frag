uniform float time;
uniform vec3 dir;
varying vec4 n;

void main() {
  float x = sin(time);
  vec4 u = normalize(vec4(dir, 1.0));
  vec4 v = normalize(n);
  float l = dot(u, v);
  // l = (sin(time) + 1.0)/2.0;

  l = 0.2;
  // gl_FragColor = n;
  gl_FragColor = vec4(l, l, l, 1.0);
  // gl_FragColor = vec4(l, l, l, 1.0);
}
