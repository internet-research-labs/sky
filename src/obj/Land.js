import TriangleSurface from '../TriangleSurface.js';

export class Land {
  /**
   * Create a Land
   */
  constructor({height, width, floor}) {
    this.height = height;
    this.width = width;
    this.f = floor;
    this.surface = new TriangleSurface(this.f, 1.0, width, height);
  }

  /**
   * Return the heigh of the land at this position
   */
  position(x, y) {
    return this.f(x, y);
  }

  /**
   * Return Buffer Mesh for this tract of land
   */
  getMesh() {
    return this.surface.build();
  }
}
