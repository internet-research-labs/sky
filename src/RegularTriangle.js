/**
 * Abstraction for a regular triangle
 */
export class RegularTriangle {
  constructor (x, y, size, theta) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.theta = theta || 0;
  }

  /**
   * Return the center point
   */
  getCenter() {
    return {
      'x': this.x,
      'y': this.y,
    };
  }

  /**
   * Return a list of points used to draw, etc. this triangle
   */
  getPointList() {
    var t = this.theta;
    var rad = this.size;
    var points = [];

    for (var i=0; i < 3; i++) {
      var theta = i * 2 * Math.PI / 3;

      var u = this.x + rad * Math.cos(t + theta);
      var v = this.y + rad * Math.sin(t + theta);

      // XXX: Add this if you dont want aliasing in canvas
      // u = Math.round(u);
      // v = Math.round(v);

      points.push({
        'x': u,
        'y': v,
      });
    }

    return points;
  }

  /**
   * Return an xy-coord bounding box
   */
  getBoundingBox() {
    var points = this.getPointList();
    var x = {'min': +Infinity, 'max': -Infinity};
    var y = {'min': +Infinity, 'max': -Infinity};

    // Naive
    points.forEach(function (val) {
      x.min = Math.min(x.min, val.x);
      x.max = Math.max(x.max, val.x);
      y.min = Math.min(y.min, val.y);
      y.max = Math.max(y.max, val.y);
    });

    return {
      'x': x.min,
      'y': y.min,
      'w': x.max-x.min,
      'h': y.max-y.min,
    };
  }

  getAlteredTriangle(radius) {
    return new RegularTriangle(
      this.x,
      this.y,
      radius,
      this.theta,
    );
  }
}
