import Grass from '../obj/Grass.js';
import {add, cross, sub, normalize, scale} from '../math3.js';
import {getElapsedTime} from '../utils.js';

function magnitude(vec, s) {
  return scale(normalize(vec), s);
}

function extend(xs, ys) {
  ys.forEach((y) => {
    xs.push(y);
  });
}

function translate(xs, [x, y, z]) {
  for (let i=0; i < xs.length; i += 3) {
    xs[i+0] += x;
    xs[i+1] += y;
    xs[i+2] += z;
  }
}


function rotateyMesh(xs, rot) {
  if (xs.length % 3 != 0) {
    throw "whatever";
  }

  for (let i=0; i < xs.length; i += 3) {
    let x = xs[i+0];
    let z = xs[i+2];
    xs[i+0] = x*Math.cos(rot)+z*Math.sin(rot);
    xs[i+2] = -x*Math.sin(rot)+z*Math.cos(rot);
  }
}


export class InstancedGrassyField {
  constructor(width, height, density, variations, floor) {
    console.log("[Loading instanced grassy field]]");
    this.width = width;
    this.height = height;
    this.density = density || 1.0;
    this.variations = variations || 20;
    this.blades = [];
    this.floor = floor || undefined;

    this.vertices = [];
    this.normals = [];

    // Make all the different variations
    for (let i=0; i < variations; i++) {
      let bend = Math.PI/30*(Math.random());
      let rot = 2*Math.PI*(Math.random()-0.5);


      let [v, n] = this.blade(bend, rot);
      v = Float32Array.from(v);
      n = Float32Array.from(n);

      let bgeo = new THREE.BufferGeometry();
      bgeo.addAttribute('position', new THREE.BufferAttribute(v, 3));
      bgeo.addAttribute('normal', new THREE.BufferAttribute(n, 3));

      let igeo = new THREE.InstancedBufferGeometry();
      igeo.addAttribute('position', v);
      igeo.addAttribute('normal', n);

    }





    console.log(this.shader());


    return;

    let bladeStart = getElapsedTime();


    let X_SEGS = 90;
    let Y_SEGS = 91;

    X_SEGS = Math.floor(this.width*Math.sqrt(this.density));
    Y_SEGS = Math.floor(this.height*Math.sqrt(this.density));

    let DX = this.width/X_SEGS;
    let DY = this.height/Y_SEGS;

    function stagger() {
      let r = 2*Math.random()-1.0;
      return r*DX/2.0;
    }

    for (let i=0; i < X_SEGS; i++) {
      for (let j=0; j < Y_SEGS; j++) {
        let k = Math.floor(this.blades.length*Math.random());
        let x = i*DX - this.width/2.0 + stagger();
        let z = j*DY - this.width/2.0 + stagger();
        let y = this.floor(x, z);
        let [v, n] = this.blades[k];
        v = v.slice();
        translate(v, [x, y, z]);
        extend(this.vertices, v);
        extend(this.normals, n);
      }
    }

    console.log("Extend array time:", getElapsedTime()-bladeStart);
  }

  shader() {
    return new THREE.RawShaderMaterial({
      vertexShader: require('./shaders/instanced-grassy-field.vert'),
      fragmentShader: require('./shaders/instanced-grassy-field.frag'),
      uniforms: {
      },
    });
  }

  /**
   * Return geometry matrix for a blade of grass
   */
  blade(theta, rot) {
    let [v, n] = this._blade(theta);

    rotateyMesh(v, rot);
    rotateyMesh(n, rot);

    return [v, n];
  }

  _blade(theta) {
    let x = 0;
    let y = 0;
    let z = 0;

    // Params
    let NUM_SEGMENTS = 10;
    let HEIGHT_SEGMENT = (0.08+0.03*Math.random());
    let WIDTH_SEGMENT = 0.10;

    // Build segments
    let segments = []
    let vertices = [];
    let normals = [];

    for (let i=0; i <= NUM_SEGMENTS; i++) {
      let t = theta*i;
      let [x, y, z] = [0, Math.cos(t), Math.sin(t)];
      let [a, b, c] = cross([1, 0, 0], [x, y, z]);
      segments.push({
        'delta': magnitude([x, y, z], HEIGHT_SEGMENT),
        'normal': normalize([a, b, c]),
      });
    }

    for (let i=0; i <= NUM_SEGMENTS; i++) {
      let [dx, dy, dz] = segments[i].delta;
      let s = (NUM_SEGMENTS-i+1)/NUM_SEGMENTS;

      let a = [x+WIDTH_SEGMENT*s, y, z];
      let b = [x-WIDTH_SEGMENT*s, y, z];
      let c = [x+dx+WIDTH_SEGMENT*s, y+dy, z+dz];
      let d = [x+dx-WIDTH_SEGMENT*s, y+dy, z+dz];
 
      // Face 1
      extend(vertices, b);
      extend(vertices, a);
      extend(vertices, c);

      // Face 2
      extend(vertices, b);
      extend(vertices, c);
      extend(vertices, d);

      // Normals
      let n = segments[i].normal;
      extend(normals, n);
      extend(normals, n);
      extend(normals, n);
      extend(normals, n);
      extend(normals, n);
      extend(normals, n);

      x += dx;
      y += dy;
      z += dz;
    }

    return [vertices, normals];
  }

  geometry() {
    this.geo = new THREE.BufferGeometry();

    let start = getElapsedTime();
    let v = Float32Array.from(this.vertices);

    this.geo.addAttribute('position', new THREE.BufferAttribute(v, 3));

    let n = Float32Array.from(this.normals);
    this.geo.addAttribute('normal', new THREE.BufferAttribute(n, 3));
    console.log("Copy array time:", getElapsedTime()-start);
    return this.geo;
  }
}
