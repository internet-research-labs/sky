import {add, cross, sub, normalize, scale} from '../math3.js';

let DEBUG = true;

function magnitude(vec, s) {
  return scale(normalize(vec), s);
}

function vec([x, y, z]) {
  return new THREE.Vector3(x, y, z);
}

export class WindyGrass {
  constructor(x, y, z, wind) {
    this.up = [0, 1, 0];
    this.root = [x, y, z];
    this.updateWind(wind || [1, 0, 0]);
    this.updateGeometry();
  }

  getTheta() {
    return 0.0;
  }

  updateWind(wind) {
    this.wind = wind || [1, 0, 0];
  }

  updateGeometry() {
  }
}

export default class Grass {

  /**
   * Dynamic Locations
   */
  constructor(x, y, z, theta) {
    this.up = [0, 1, 0];
    this.root = [x, y, z];
    this.theta = theta || 0.0;

    this.segments = [];
    this.force = [0, 0, 0];

    this.NUM_SEGMENTS = 20;
    this.LENGTH_SEGMENT = 0.5;
    this.HEIGHT_SEGMENT = 0.08+Math.random()*0.02;
    this.WIDTH_SEGMENT = 0.0;

    let d = this.theta;

    // Add segments and give it a slight bend
    for (let i=0; i <= this.NUM_SEGMENTS; i++) {
      let theta = d*i;
      let [a, b] = [Math.cos(theta), Math.sin(theta)];
      this.segments.push({
        'delta': magnitude([0, a, b], this.HEIGHT_SEGMENT),
        'normal': normalize([a, b, 0]),
      });
    }
  }

  updateTheta(theta) {
  }

  /**
   * Return
   */
  getGeo() {
    let geo = new THREE.Geometry();

    let [x, y, z] = this.root;

    for (let i=0; i <= this.NUM_SEGMENTS; i++) {
      let [dx, dy, dz] = this.segments[i].delta;
      let s = (this.NUM_SEGMENTS-i+1)/this.NUM_SEGMENTS;

      geo.vertices.push(vec([x+0.13*s, y, z]));
      geo.vertices.push(vec([x-0.13*s, y, z]));

      x += dx;
      y += dy;
      z += dz;
    }

    for (let i=0; i < this.NUM_SEGMENTS; i++) {
      let n = vec(this.segments[i].normal);
      geo.faces.push(new THREE.Face3(2*i+0, 2*i+1, 2*i+2, n));
      geo.faces.push(new THREE.Face3(2*i+3, 2*i+2, 2*i+1, n));
    }


    return geo;
  }

  /**
   */
  updateWind(x, y, z) {
    this.wind[0] = x;
    this.wind[1] = y;
    this.wind[2] = z;
  }

  /**
   * Update Geometry from origin and wind
   */
  updateGeometry() {
  }

  getGeo2() {
    let geo = new THREE.Geometry();
    let [x, y, z] = this.root;
    let [dx, dy, dz] = this.up;

    for (let i=0; i < this.NUM_SEGMENTS; i++) {
      let n = this.segments[i].normal;
      let cl = scale(normalize(cross([dx, dy, dz], n)), s*this.WIDTH_SEGMENT);
      let cr = scale(normalize(cross([dx, dy, dz], n)), -s*this.WIDTH_SEGMENT);

      geo.vertices.push(vec(add(cl, [x, y, z])));
      geo.vertices.push(vec(add(cr, [x, y, z])));

      let old_vec = [x, y, z];
      [x, y, z] = add([x, y, z], magnitude([dx, dy, dz], this.HEIGHT_SEGMENT));
      dx = x-old_vec[0];
      dy = y-old_vec[1];
      dz = z-old_vec[2];
    }

    for (let i=0; i < this.NUM_SEGMENTS-1; i++) {
      let n = vec(this.segments[0].normal);
      geo.faces.push(new THREE.Face3(2*i+0, 2*i+1, 2*i+2, n));
      geo.faces.push(new THREE.Face3(2*i+3, 2*i+2, 2*i+1, n));
    }

    return geo;
  }
}
