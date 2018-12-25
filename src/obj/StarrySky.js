let vert = require('./shaders/starry.vert');
let frag = require('./shaders/starry.frag');


let SKY_SIZE = 2;


// Return the L-infinity norm of a 3-array
function linf(v) {
  return Math.max(
    Math.abs(v[0]),
    Math.abs(v[1]),
    Math.abs(v[2]),
  );
}


/**
 * Return a sky object
 */
export function sky(stars, boxSize) {
  try {
    let size = Math.floor(3*boxSize);
    let skyBox = new THREE.CubeGeometry(boxSize, boxSize, boxSize, 1, 1, 1);
    let skyMat = skyMaterial(stars, size);
    let skyMesh = new THREE.Mesh(skyBox, skyMat);
    return skyMesh;
  } catch (err) {
    console.log("Fail", err);
  }
} 


/**
 * Return information to determine which face the texture is on
 */
function sidetc(v) {
  let norm = -1;
  let sign = undefined;
  let coord = -1;

  for (let i=0; i < v.length; i++) {
    let x = Math.abs(v[i]);
    if (x > norm) {
      norm = x;
      sign = v[i] >= 0 ? 1 : -1;
      coord = i;
    }
  }

  return [norm, sign, coord];
}

/**
 * Return uv-coord from the xyz-coord
 */
function remap([x, y, z], skyWidth, skyHeight) {
  let [n, s, i] = sidetc([x, y, z]);
  let [u, v] = [-1, -1];
  let face = 0;

  switch (i) {
  // X-coord dominant
  case 0:
    u = -s*z/n;
    v = y/n;
    face = s > 0 ? 0 : 1;
    break;
  case 1:
    u = x/n;
    v = -s*z/n;
    face = s > 0 ? 2 : 3;
    break
  case 2:
    u = s*x/n;
    v = y/n;
    face = s > 0 ? 4 : 5;
    break;
  default:
    throw "What the fuck";
  }

  u = (u+1)/2.*skyWidth;
  v = (v+1)/2.*skyHeight;

  return [Math.floor(u), Math.floor(v), face];
}


function __blank_data(width, height) {
  let size = width*height;
  return new Uint8Array(4*size);
}


// {X,Y,Z}{-,+}-Faces for cube
let X_POSITIVE = 0;
let X_NEGATIVE = 1;
let Y_POSITIVE = 2;
let Y_NEGATIVE = 3;
let Z_POSITIVE = 4;
let Z_NEGATIVE = 5;

/**
 * Return sky texture
 */
function skyTextures(stars, width, height) {
  let size = width*height;

  let data = [];


  for (let j=0; j < 6; j++) {
    let r = Math.floor(Math.random()*255);
    r = 0;
    data.push(__blank_data(width, height));
    for (let i=0; i < size; i++) {
      data[j][4*i+0] = r;
      data[j][4*i+1] = r;
      data[j][4*i+2] = r;
      data[j][4*i+3] = 255;
    }
  }

  function setWhite(lis, x, y, lum) {
    lum = lum || 255.0;
    let i = 4*(y*height+x);
    lis[i+0] = lum;
    lis[i+1] = lum;
    lis[i+2] = lum;
    lis[i+3] = lum;
  }

  stars = stars || [];

  let lum = 0;
  stars.forEach((v) => {
    lum = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
    let [x, y, i] = remap(v, width, height);
    if (x >= 0 && y >= 0) {
      setWhite(data[i], x, y, Math.floor(255*lum));
    }
  });


  function __texture(data) {
    let tex = new THREE.DataTexture(
      data,
      width,
      height,
      THREE.RGBAFormat,
      THREE.UnsignedByteType,
      THREE.UVMapping,
    );
    tex.needsUpdate = true;
    return tex;
  }

  return [
    __texture(data[X_POSITIVE]),
    __texture(data[X_NEGATIVE]),
    __texture(data[Y_POSITIVE]),
    __texture(data[Y_NEGATIVE]),
    __texture(data[Z_POSITIVE]),
    __texture(data[Z_NEGATIVE]),
  ];
}


/**
 * Return a sky material
 */
function skyMaterial(stars, size) {

  let width = size;
  let height = size;

  let uniforms = {
    time: {value: 1.0},
    dir: {value: new THREE.Vector3(0.0, 0.0, 1.0), type: 'v3'},
  };

  let textures = skyTextures(stars, width, height);

  let faceMaterials = [
    new THREE.MeshBasicMaterial({map: textures[0], side: THREE.DoubleSide}),
    new THREE.MeshBasicMaterial({map: textures[1], side: THREE.DoubleSide}),
    new THREE.MeshBasicMaterial({map: textures[2], side: THREE.DoubleSide}),
    new THREE.MeshBasicMaterial({map: textures[3], side: THREE.DoubleSide}),
    new THREE.MeshBasicMaterial({map: textures[4], side: THREE.DoubleSide}),
    new THREE.MeshBasicMaterial({map: textures[5], side: THREE.DoubleSide}),
  ];

  return faceMaterials;
}


export class StarrySky {
  constructor(stars, boxSize) {
    this.stars = stars;
    let size = Math.floor(3*boxSize);
    this.sky = sky(stars, boxSize);
    this.textures = skyTextures(stars, size, size);
  }
}
