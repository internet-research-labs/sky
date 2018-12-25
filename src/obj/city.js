import * as THREE from 'THREE';

// ...
export class CityBuilder {
  // Construct
  constructor() {
    this.layout = [];
    this.group = new THREE.Group();
  }

  // AddBuilding
  addBuilding(x, y, z, {width, height, depth}) {
    let g = new THREE.BoxGeometry(width, height, depth);
    let m = new THREE.MeshPhongMaterial({color: 0xCCCCCC});
    let o = new THREE.Mesh(g, m);
    o.castShadow = true;
    o.receiveShadow = true;
    o.position.set(x, y+height/2.0, z);
    this.group.add(o);
  }
}
