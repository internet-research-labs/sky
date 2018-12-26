import App from './app-utils/App.js';
import QuentinLike from './app-utils/Quentin.js';
import {add, cross, sub, normalize, scale} from './math3.js';
import {random, getElapsedTime} from './utils.js';
import * as THREE from 'THREE';

import {sky, StarrySky} from './obj/StarrySky.js';
import {SunnySky} from './obj/SunnySky.js';
import {CityBuilder} from './obj/city.js';

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
    this.renderer.shadowMap.enabled = true;
    // this.renderer.shadowMap.type = THREE.BasicShadowMap;

    /*
    this.renderer.shadowCameraNear = 3;
    this.renderer.shadowCameraFar = 9000;
    this.renderer.shadowCameraFov = 50;
    this.renderer.shadowMapBias = 0.0039;
    this.renderer.shadowMapDarkness = 0.5;
    this.renderer.shadowMapWidth = 1024;
    this.renderer.shadowMapHeight = 1024;
    */

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

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(1.2);
    this.renderer.setClearColor(0xFFFFFF);

    // Sky
    this.sky = this.getSky();
    this.scene.add(this.sky.sky);
    this.sky.simulacrum.group.position.set(0, 2, 5);
    // this.scene.add(this.sky.simulacrum.group);

    this.scene.add(this.sky.ambientLight);
    this.scene.add(this.sky.directionalLight);
    this.scene.add(this.sky.pointLight1);
    // this.scene.add(this.sky.pointLight2);

    let helper = new THREE.DirectionalLightHelper(this.sky.directionalLight, 0.3);
    this.scene.add(helper);

    // Add visible components

    let start = getElapsedTime();
    this.fieldMesh = {}

    this.addFloor();
    this.addSkyline();

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

  addSkyline() {
    let builder = new CityBuilder();
    const WIDTH = 1.0;
    const PAD = 0.2;

    for (let j=0; j < 4; j++) {
      for (let i=-20; i < 20; i++) {
        if (i > -3 && i < 3) {
          continue;
        }
        let x = i*(WIDTH+PAD);
        let z = 50.0+j*(WIDTH+PAD);
        let y = this.floor.f(x, z);
        let h = random(2.0, 8.0);

        builder.addBuilding(
          x, y, z,
          {
            width: WIDTH,
            height: h,
            depth: WIDTH,
          },
        );
      }
    }
    let w = 0.3;
    let m = new THREE.Mesh(
      new THREE.BoxGeometry(w, w, w),
      new THREE.MeshBasicMaterial({color: 0xFF0000}),
    );
    m.position.set(0, 1.0, 0);
    m.castShadow = true;

    let n = new THREE.Mesh(
      new THREE.BoxGeometry(w, w, w),
      new THREE.MeshPhongMaterial({color: 0xFF0000}),
    );
    n.receiveShadow = true;
    this.scene.add(m);
    this.scene.add(n);
    this.scene.add(builder.group);
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
      let a = 3.0;
      let s = 40.0;
      let simplex = new SimplexNoise("whatever");
      return (x, y) => {
        return a*simplex.noise2D(x/s, y/s);
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
      // envMap: this.cubeCamera.renderTarget,
      reflectivity: 0.95,
      side: THREE.DoubleSide,
    });

    /*
    let surface = new THREE.PlaneGeometry(100, 100, 100);
    let obj = new THREE.Mesh(surface, mat);
    obj.position.set(0, 0, 40);
    obj.rotation.x = Math.PI/2.0;
    obj.receiveShadow = true;
    this.scene.add(obj);
    //*/

    let surface = new TriangleSurface(this.floor.f, 1, 90, 90);
    let o = new THREE.Mesh(surface.build(), mat);
    o.receiveShadow = true;
    this.scene.add(o);
    //*/
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

  update(params) {
    let t = +new Date() / 200.0 / 1.0;
    let f = Math.PI/4.0;
    let r = 90;
    f = t/10.;

    // ...
    let [a, b, c] = [0, 10, -10];
    this.camera.position.set(a, b, c);
    this.camera.lookAt(a, 0, c+100);

    // Move skybox around camera position
    this.sky.sky.position.set(a, b, c);
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

  setRendererParams(p) {
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
