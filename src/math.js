/**
 * Return a set of points
 */
export function line(p, q, steps) {
  steps = steps || 50;

  let points = [];
  let d = 1.0/(steps-1);

  for (let i=0; i < steps; i++) {
    points.push(i*d);
  }

  return points;
}
