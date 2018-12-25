import App from './App.js';
import {line} from '../math.js';
import {add, sub, scale} from '../math3.js';

export default class QuentinLike extends App {
  /**
   * @param p start position
   * @param q stop position
   * @param theta start angle
   * @param fi stop angle
   * @param steps
   */
  quentin(p, q, steps) {
    steps = steps || 50;
    let theta = this.camera.view_angle * Math.PI / 2;
    let fi = 24 * Math.PI/2;


    // Get series of x's and theta's
    let xs = line(p, q, steps);
    let ts = line(theta, fi, steps);

    let position = add(
      scale(p, 1-xs),
      scale(q, xs),
    );

    let angle = theta*(1-ts) + fi*ts;

    console.log('...same chains');

  }

  getPlane(fov, p, q) {
    let d = sub(q, p);
    let x = Math.sqrt(d[0]*d[0] + d[1]*d[1] + d[2]*d[2]);

    let theta = fov * Math.PI / 180;
    let b = 2*x*Math.tan(theta/2)/2.0 - 0.02;

    return [
      [q[0]-b, q[1]-b, q[2]],
      [q[0]+b, q[1]-b, q[2]],
      [q[0]-b, q[1]+b, q[2]],
      [q[0]+b, q[1]+b, q[2]],
    ];
  }

  getPlaneWidth(fov, p, q) {
    let d = sub(q, p);
    let x = Math.sqrt(d[0]*d[0] + d[1]*d[1] + d[2]*d[2]);

    let theta = fov * Math.PI / 180;
    let b = 2*x*Math.tan(theta/2);

    return b;
  }

  getFov(backwall, p, q) {
    let d = sub(q, p);
    let x = Math.sqrt(d[0]*d[0] + d[1]*d[1] + d[2]*d[2]);

    let theta = 2*Math.atan(backwall/2.0/x) * 180 / Math.PI;

    return theta;
  }
}
