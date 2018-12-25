import { RegularTriangle } from './RegularTriangle.js';

/*
 * --------------------------------------
 * \1,1 /\1,3 /\1,1 /\1,3 /\   1 /\1,
 *  \  /  \  /  \  /  \  /  \   /  \ 
 *   \/1,2 \/1,  \/1,2 \/1,4 \ /1,2 \
 *  ---------------------------------
 *   /\2,2 /\    /\2,2 /\    / \2,2 /
 *  /  \  /  \  /  \  /  \  /   \  / 
 *   2,1\/    \/ 2,1\/    \/   ,1\/  
 * --------------------------------------
 */
export default class TriangleMesh {

  /**
   * Construct a grid where xy-coordinates correspond to triangles instead of squares
   *  This class mostly just wraps the Triangle method with some math to know
   *  exactly where everything is located.
   */
  constructor(rad, props) {
    props = props || {};

    this.x = props.x || 0;
    this.y = props.y || 0;
    this.rad = rad;

    // This is probably rounded-off too much, and creating
    // a slight overlap along the edges of the triangles
    // TODO: Generalize this for a given theta
    this.dx = 1.73/2. * this.rad;
    this.dy = this.rad/2.;
  }

  /**
   * Return the xy-coordinate
   */
  getCenter(i, j) {
    var row = Math.floor(i / 2);
    var x = j * this.dx;
    var y = (4*i-2*row) * this.dy;

    if (i % 2 == 0 && j % 2 == 0) {
      y += this.dy;
    } else if (j % 2 == 0) {
      y -= this.dy;
    }

    return {
      'x': x,
      'y': y,
    };
  };

  /**
   * Return the xy-coordinate
   */
  getPoints (i, j) {
    var row = Math.floor(i / 2);
    var x = j * this.dx;
    var y = (4*i-2*row) * this.dy;

    if (i % 2 == 0 && j % 2 == 0) {
      y += this.dy;
    } else if (j % 2 == 0) {
      y -= this.dy;
    }

    return {
      'x': x,
      'y': y,
    };
  };

  /**
   * Return the xy-coordinate
   */
  getBoundingBox (i, j) {
    var row = Math.floor(i / 2);
    var x = j * this.dx;
    var y = (4*i-2*row) * this.dy;

    if (i % 2 == 0 && j % 2 == 0) {
      y += this.dy;
    } else if (j % 2 == 0) {
      y -= this.dy;
    }

    return {
      'x': Math.round(x),
      'y': Math.round(y),
    };
  }

  /**
   * Return the Triangle defined at i, j
   */
  get (i, j) {
    var center = this.getCenter(i, j);
    var theta = (i + j) % 2 ? Math.PI/2 : -Math.PI/2;
    return new RegularTriangle(center.x, center.y, this.rad, theta);
  }
}
