export class SunnySky {
  // Constructor
  constructor({size, sunPosition, simulacrum}) {
    this.size = size;
    this.demoSun = this.getDemoSphere(sunPosition);
    this.geo = this.geometry();
    this.mat = this.material();
    this.sky = new THREE.Group();
    this.sky.add(new THREE.Mesh(this.geo, this.mat));

    this.ambientLight = new THREE.AmbientLight(0xCCCCCC);

    this.directionalLight = new THREE.DirectionalLight(0xCCCCCC, 0.9);
    this.directionalLight.position.set(0, 0, -1);
    this.directionalLight.lookAt(new THREE.Vector3(0, 0, 0));
    this.directionalLight.castShadow = true;
		this.directionalLight.shadow.camera.near = 1;
		this.directionalLight.shadow.camera.far = 9000;

    this.pointLight1 = new THREE.PointLight(0xFFFFFF, 8.0, 90);
    this.pointLight1.position.set(0, 10, -10);
    this.pointLight1.lookAt(new THREE.Vector3(0, 0, 0));
    this.pointLight1.castShadow = true;
		this.pointLight1.shadow.camera.near = 1;
		this.pointLight1.shadow.camera.far = 1000;
		this.pointLight1.shadow.mapSize.width = 1000.0;
		this.pointLight1.shadow.mapSize.height = 1000.0;
		this.pointLight1.shadow.bias = -0.005;

    /*
    this.pointLight2 = new THREE.PointLight(0x333333, 2, 800);
    this.pointLight2.position.set(0, 10, -10);
    this.pointLight2.lookAt(new THREE.Vector3(0, 0, 0));
    */

    if (simulacrum) {
      this.simulacrum = this.simulacrum(0, 0, 0);
    }
  }


  // Return the simulacrum
  simulacrum(x, y, z) {

    let objects = {};

    console.log("[SIMULACRUM] Added");
    let g = new THREE.Group();

    let size = 0.2;
    let box = new THREE.BoxGeometry(size, size, size);
    let mat = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      color: 0xDDDDDD,
      wireframe: true,
    });
    objects.sky = new THREE.Mesh(box, mat);
    objects.sky.position.set(0.0, 0.0, 0.0);

    objects.sun = new THREE.Mesh(
      new THREE.IcosahedronGeometry(size/4.0),
      mat,
    );
    objects.sun.position.set(0.0, 0.1, 1.0);
    g.add(objects.sky);
    g.add(objects.sun);


    // Position the entire simulacrum
    g.position.x = x;
    g.position.y = y;
    g.position.z = z;

    return {
      group: g,
      objects: objects,
    };
  }

  getDemoSphere([x, y, z]) {
    let geo = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshBasicMaterial({color: 0x000000}),
    );
    geo.position.x = x;
    geo.position.y = y;
    geo.position.z = z;
    return geo;
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
    this.demoSun.position.x = x;
    this.demoSun.position.y = y;
    this.demoSun.position.z = z;

    let r = 100.0;
    let [a, b, c] = [r*x, r*y, r*z];
    this.pointLight1.position.set(a, b, c);
    this.directionalLight.position.set(x, y, z);
    this.directionalLight.position.multiplyScalar(r);
    this.directionalLight.lookAt(0, 0.0, 0);

    console.log(this.directionalLight.shadow.map);

    if (y < 0) {
      this.pointLight1.color.set(0, 0, 0)
    } else {
      this.pointLight1.color.set(0xFFFFFF);
    }

    if (this.simulacrum) {
      let [j, k, l] = [6.0*x, 6.0*y, 6.0*z];
      this.simulacrum.objects.sun.position.set(j, k, l);
      let r = -3.0;
      this.simulacrum.objects.sun.rotation.set(r*j, r*k, r*l);
    }
  }

  set(params) {
    this.mat.uniforms.rayleigh.value = params.rayleigh || this.mat.uniforms.rayleigh.value;
    this.mat.uniforms.turbidity.value = params.turbidity || this.mat.uniforms.turbidity.value;
    this.mat.uniforms.luminance.value = params.luminance || this.mat.uniforms.luminance.value;
    // this.mat.uniforms.mieDirectionalG.value = params.mieDirectionalG || this.mat.uniforms.mieDirectionalG.value;
    // this.mat.uniforms.mieCoefficient.value = params.mieCoefficient || this.mat.uniforms.mieCoefficient.value;
  }
}
