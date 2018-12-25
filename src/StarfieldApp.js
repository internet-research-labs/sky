import App from './app-utils/App.js';
import QuentinLike from './app-utils/Quentin.js';
import {add, cross, sub, normalize, scale} from './math3.js';
import {getElapsedTime} from './utils.js';
import * as THREE from 'THREE';

import {sky, StarrySky} from './obj/StarrySky.js';
import {SunnySky} from './obj/SunnySky.js';

import SimplexNoise from 'simplex-noise';

// Generative objects
import {GrassyField} from './obj/GrassyField.js';
import {Land} from  './obj/Land.js';

import TriangleSurface from './TriangleSurface.js';

function norm(v) {
  return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
}

function stringToHex(str) {
  return parseInt(str.substring(1), 16);
}

const NORTH = new THREE.Vector3(-1, 0, 0);
const EAST = new THREE.Vector3(0, 0, -1);
const SOUTH = new THREE.Vector3(+1, 0, 0);
const WEST = new THREE.Vector3(0, 0, +1);

export default class StarfieldApp extends QuentinLike {
  constructor(params) {
    super(params);
    this.id = params.id;
    this.el = document.getElementById(this.id);
    this.app = {};
    this.width = this.el.offsetWidth;
    this.height = this.el.offsetHeight;
  }

  setup() {
    this.app.width      = this.width;
    this.app.height     = this.height;
    this.app.view_angle = 15;
    this.app.aspect     = this.width/this.height;
    this.app.near       = 0.1;
    this.app.far        = 2000;
    this.app.iterations = 0;
    this.app.time       = 0;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias : true,
      canvas: this.el,
    });

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      this.app.view_angle,
      this.app.aspect,
      this.app.near,
      this.app.far,
    );

    // Lights
    this.ambientLight = new THREE.AmbientLight(0xCCCCCC);
    this.directionalLight = new THREE.DirectionalLight(0x333333, 0.5);
    this.pointLight1 = new THREE.PointLight(0x333333, 2, 800);
    this.pointLight2 = new THREE.PointLight(0x333333, 2, 800);

    this.directionalLight.position.set(0, 0, -1);
    this.pointLight1.position.set(0, 10, -10);
    this.pointLight2.position.set(0, 10, -10);

    this.directionalLight.lookAt(new THREE.Vector3(0, 0, 0));
    this.pointLight1.lookAt(new THREE.Vector3(0, 0, 0));
    this.pointLight2.lookAt(new THREE.Vector3(0, 0, 0));

    this.scene.add(this.directionalLight);
    this.scene.add(this.pointLight1);
    this.scene.add(this.pointLight2);
    this.scene.add(this.ambientLight);

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(1.2);
    this.renderer.setClearColor(0xFFFFFF);

    // Sky
    this.sky = this.getSky();
    this.scene.add(this.sky.sky);
    this.sky.simulacrum.group.position.set(0, 2, 5);
    this.scene.add(this.sky.simulacrum.group);
    this.setTheta(0.0);

    // Helper setup functions
    this.setupTrack();

    // Add visible components

    let start = getElapsedTime();
    this.fieldMesh = {}

    this.addFloor();

    // Add obelisks
    // console.log("Adding obelisks");

    // this.addObelisk([-20, 0], 0xFF0000); // N
    // this.addObelisk([0, -20], 0x00FFFF);
    // this.addObelisk([+20, 0], 0xFF00FF);
    // this.addObelisk([0, +20], 0x00FF00);

    // this.addObelisk(EAST, 0xFF00FF);
    // this.addObelisk(WEST, 0x00FF00);

    // console.log("Create grassy field time:", getElapsedTime()-start);
  }

  // Setup a camera track... but in this case actually do nothing
  setupTrack() {
    this.camera.position.set(0, 30, 0);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  }


  /**
   * Return a sky [and helper objects]
   */
  getSky() {
    return new SunnySky({
      size: 100,
      sunPosition: [1.0, 0.0, 0.0],
      simulacrum: true,
    });

    let g = new THREE.Group();

    let stars = []; 
    let starSize =   900;
    let STAR_COUNT = 10000;

    for (let i=0; i < STAR_COUNT; i++) {
      let r = starSize;

      let t = 2*Math.random()-1;
      let u = 2*Math.random()-1;

      let x = t;
      let y = u;
      let z = 2*Math.random()-1.0;
      stars.push([x, y, z]);
    }

    return new StarrySky(stars, starSize);
  }

  setPhong({color, emissive, specular, shininess, reflectivity}) {
    this.grassMaterial = new THREE.MeshPhongMaterial({
      color: stringToHex(color),
      emissive: stringToHex(emissive),
      specular: stringToHex(specular),
      shininess: shininess,
      reflectivity: reflectivity,
      // shading: THREE.SmoothShading,
      flatShading: true,
      side: THREE.BackSide,
    });
    this.fieldMesh.material = this.grassMaterial;
    // this.fieldMesh.material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide, });
  }

  // Set the theta of the sky
  setTheta(theta) {
    this.skyTheta = theta;
    this.skyAxis = new THREE.Vector3(
      Math.cos(-theta),
      Math.sin(-theta),
      0.0,
    );
  }

  // Add a tombstone
  addTombstone(x, z) {
    let geometry = new THREE.BoxGeometry(4, 8, 1);
    let material =  new THREE.MeshPhongMaterial({
      color: 0x333333,
      emissive: 0x777777,
      specular: 0x000000,
      reflectivity: 0,
      shininess: 0,
      // shading: THREE.SmoothShading,
      flatShading: true,
      side: THREE.DoubleSide,
    });
    let cube = new THREE.Mesh(geometry, material);
    cube.position.x = x;
    cube.position.y = 0;
    cube.position.z = z;
  }


  // Just draw a simple floor
  addFloor() {
    let mat = new THREE.MeshPhongMaterial({
      color: 0x33333,
      emissive: 0x000000,
      specular: 0x000000,
      shininess: 0.0,
      // shading: THREE.SmoothShading,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    let _abc = (function () {
      let s = 80.0;
      let simplex = new SimplexNoise("whatever");
      return (x, y) => {
        return 0.0;
        return 4.0*simplex.noise2D(x/s, y/s);
      };
    }());

    this.floor = new Land({
      height: 900,
      width: 900,
      floor: _abc,
    });

    // console.log(this.sky.textures);

    let images = [];

    /*
    this.sky.textures.forEach((v, i) => {
      images.push(v.image);
    });
    */

    let cubeTex = new THREE.CubeTexture(
      images,
      THREE.CubeReflectionMapping,
    );
    cubeTex.wrapS = THREE.RepeatWrapping;
    cubeTex.wrapT = THREE.RepeatWrapping;
    cubeTex.repeat.set( 4, 4 );

    this.cubeCamera = new THREE.CubeCamera(100, 1000, Math.pow(2, 11) );
    this.scene.add(this.cubeCamera);


    let floorMat = new THREE.MeshPhongMaterial({
      color: 0xCCCCCC,
      wireframe: true,
      // envMap: this.cubeCamera.renderTarget,
      reflectivity: 0.95,
      side: THREE.BackSide,
    });

    // let geo = this.floor.getMesh();

    let surface = new TriangleSurface(this.floor.f, 1, 90, 90);

    this.scene.add(new THREE.Mesh(surface.build(), floorMat));
    let geo = new THREE.BoxGeometry(1, 5, 1);

    this.mirrorBox = new THREE.Mesh(geo, floorMat);
    // this.scene.add(this.mirrorBox);

    // 
    // this.addGrassyField();
  }

  addObelisk([x, z], c) {
    let geo = new THREE.BoxGeometry(1, 5, 1);
    let mat = new THREE.MeshBasicMaterial({color: c});
    let mesh = new THREE.Mesh(geo, mat);
    let y = this.floor.f(x, z);
    let pos = new THREE.Vector3(x, y, z);
    mesh.position.set(pos.x, pos.y+2.5, pos.z);
    mesh.rotation.y = Math.PI/4.0;
    this.scene.add(mesh);
  }

  /**
   * What is this?
   */
  addGrid() {
    let mat = new THREE.LineBasicMaterial({color: 0x999999});
    let VALS = 100;
    for (let i=-VALS; i <= VALS; i++) {
      let geo = new THREE.Geometry();
      geo.vertices.push(new THREE.Vector3(i, 0, -80));
      geo.vertices.push(new THREE.Vector3(i, 0, 80));
      this.scene.add(new THREE.Line(geo, mat));
      geo = new THREE.Geometry();
      geo.vertices.push(new THREE.Vector3(-80, 0, i));
      geo.vertices.push(new THREE.Vector3(80, 0, i));
      this.scene.add(new THREE.Line(geo, mat));
    }
  }

  update(params) {
    let t = +new Date() / 200.0 / 1.0;
    let f = Math.PI/4.0;
    let r = 90;
    f = t/10.;

    // ...
    let [a, b, c] = [0, 2, 0];

    // ...
    let theta = f % 2*Math.PI;
    // this.sky.sky.setRotationFromAxisAngle(this.skyAxis, theta);

    // ...
    this.camera.position.set(a, b, c);
    this.camera.lookAt(a, b, c+10.0);

    // Move skybox around camera position
    this.sky.sky.position.set(
      this.camera.position.x,
      this.camera.position.y,
      this.camera.position.z,
    );

    // this.cubeCamera.position.copy(this.mirrorBox.position);
    // this.cubeCamera.update(this.renderer, this.scene);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      this.app.view_angle,
      this.app.aspect,
      this.app.near,
      this.app.far
    );
  }

  setSize(width, height) {
    this.app.width = width;
    this.app.height = height;
    this.app.aspect = width/height;
    this.setupCamera();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.app.width, this.app.height);
  }

  set(p) {
    this.sky.set(p);
  }

  setSunPosition(x, y, z) {
    this.sky.setSunPosition(x, y, z);
  }

  resize(width, height) {
    this.setSize(width, height);
  }

  draw() {
    this.renderer.render(this.scene, this.camera);
  }
}
