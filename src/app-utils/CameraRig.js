/**
 * Determines a path for a camera rig
 */
export default class CameraRig {
  constructor(camera, timeStep) {
    this.camera = camera;
    this.loop = false;
    this.running = false;
    this.timeStep = timeStep;
    this.time = 0;

    this.paths = [];
    this.durations = [];
  }

  tick() {
    this.time += this.timeStep;
  }

  /**
   * 
   */
  addPath(f, duration) {
    let lastDuration = this.durations.length ? this.durations[this.durations.length-1] : 0;
    this.durations.push(duration + lastDuration);
    this.paths.push(f);
  }

  /**
   * Start moving camera
   */
  start() {
  }

  /**
   * Stop moving camera
   */
  stop() {
  }
}
