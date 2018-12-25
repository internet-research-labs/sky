import {cartesian, longlat} from '../utils.js';


// Return a box
function _box([x, y, z], c, size) {
  size = size || 0.3;
  let box = new THREE.EdgesGeometry(new THREE.BoxGeometry(size, size, size));
  let mat = new THREE.LineBasicMaterial({
    color: 0xDDDDDD,
    linewidth: 10,
  });
  return new THREE.LineSegments(box, mat);
}


// Return a line from origin to [x, y, z]
function _dir([x, y, z], c) {
  let g = new THREE.Geometry();
  g.vertices.push(new THREE.Vector3(-x, -y, -z));
  g.vertices.push(new THREE.Vector3(x, y, z));
  let m = new THREE.LineBasicMaterial({color: c, linewidth: 100});
  return new THREE.Line(g, m);
}

// Return a global at [x, y, z] of color {{c}} size {{size}}
function _globe([x, y, z], c, size) {
  size = size || 0.1;
  let g = new THREE.Mesh(
    new THREE.SphereGeometry(size, 20, 20),
    new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      color: c,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    }),
  );

  g.position.set(x, y, z);

  return g;
}


// Must-implement methods for Sky-like things
export class AbstractSky {
  object() { }
  set() { }
  setSunPosition(x, y, z) { }
  setGlobeRotation(t) { }
  setGlobePosition(theta, fi) { }
}


// Simulacrum
export class SimulacrumSky extends AbstractSky {
  constructor(params) {
    super();
    this.size = params ? params.size : undefined;
    this.group = new THREE.Group();
    this.objects = this.generate(0, 0, 0);
  }

  globe() {
    let g = new THREE.Group();

    let axes = new THREE.Group();
    let l = 2.0*this.size;
    axes.add(_dir([l, 0, 0], 0xFF0000));
    axes.add(_dir([0, l, 0], 0x00FF00));
    axes.add(_dir([0, 0, l], 0x0000FF));
    axes.add(_globe([0, 0, 0], 0xCCCCCC, this.size));
    g.add(axes);

    return g;
  }

  // Return control objects from inputs
  _params({sunPosition, globeCoordinates}) {
    console.log("[SIMULACRUM] Sun is at ", sunPosition);
    console.log("[SIMULACRUM] Located at  ", globleCoordinates);
  }

  _starbox() {
  }

  _blank() {
  }

  generate(x, y, z) {
    let objects = {};

    let g = new THREE.Group();

    let size = 0.2;
    let mat = new THREE.MeshBasicMaterial({
      color: 0xDDDDDD,
      wireframe: true,
    });
    objects.sun = new THREE.Mesh(
      new THREE.IcosahedronGeometry(size/4.0),
      mat,
    );
    objects.world = this.globe();
    objects.stars = _box([0, 0, 0], 0xCCCCCC, this.size*2.9);
    let pos = longlat([this.size, 0.0, 0.0]);
    objects.pos = _globe(pos, 0x00CCCC, 0.025);

    // objects.sun.position.set(0.0, 0.1, 1.0);

    objects.world.add(objects.pos);
    g.add(objects.world);
    g.add(objects.sun);
    g.add(objects.stars);

    return {
      group: g,
      objects: objects,
    };
  }

  object() {
    return this.objects.group;
  }

  setGlobePosition(lon, lat) {
    let [x, y, z] = longlat([this.size, lon, lat]);
    this.objects.objects.pos.position.set(x, y, z);
  }

  setSunPosition(x, y, z) {
    let p = new THREE.Vector3(x, y, z);
    p.normalize();
    p.multiplyScalar(4*this.size);

    this.objects.objects.sun.position.copy(p);

    let r = -20.0;
    this.objects.objects.sun.rotation.set(r*p.x, r*p.y, r*p.z);
  }

  setGlobeRotation(t) {
    let axis = new THREE.Vector3(0.0, 1.0, 0.0);
    axis.normalize();
    this.objects.objects.world.setRotationFromAxisAngle(
      axis,
      t,
    );
  }
}

export class Sky {
  // Constructor
  constructor({size, sunPosition}) {
    this.size = size;
    this.demoSun = new THREE.Group();
    this.geo = this.geometry();
    this.mat = this.material();
    this.sky = new THREE.Group();
    this.sky.add(new THREE.Mesh(this.geo, this.mat));
    this.params = {
      'rot': 0.0,
    };
  }

  geometry() {
    let size = this.size;
    let geo = new THREE.BoxGeometry(size, size, size, 1, 1, 1);
    return geo;
  }

  // Return material for
  material() {
    return new THREE.ShaderMaterial({
      transparent: true,
      vertexShader: require('./shaders/sky.vert'),
      fragmentShader: require('./shaders/sky.frag'),
      side: THREE.DoubleSide,
      uniforms: {
        rayleigh: {value: 4.0},
        turbidity: {value: 4.9},
        mieDirectionalG: {value: 0.0},
        mieCoefficient: {value: 0.0},
        luminance: {value: 1.0},
        sunPosition: {value: this.demoSun.position},

        theta: {value: 0.3},
        size: {value: this.size},
      },
    });
  }

  setSunPosition(x, y, z) {
    let p = new THREE.Vector3(x, y, z);
    p.normalize();
    this.demoSun.position.set(p.x, p.y, p.z);
  }

  set(params) {
    this.mat.uniforms.rayleigh.value = params.rayleigh || this.mat.uniforms.rayleigh.value;
    this.mat.uniforms.turbidity.value = params.turbidity || this.mat.uniforms.turbidity.value;
    this.mat.uniforms.luminance.value = params.luminance || this.mat.uniforms.luminance.value;
  }

  // t in [0, 1)
  setGlobeRotation(t) {
    this.params.rot = (t % 1.0)*2.0*Math.PI;
  }


  setGlobePosition(theta, fi) {
  }
}
