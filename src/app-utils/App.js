export default class App {
  constructor(params) {
  };

  setup(params) {
    throw new Error('Calling empty setup function');
  };

  update(params) {
    throw new Error('Calling empty update function');
  };

  draw() {
    throw new Error('Calling empty draw function');
  };

  loop(params) {
    requestAnimationFrame(function () {
      this.loop(params);
    }.bind(this));
    this.update(params);
    this.draw();
  }
}
