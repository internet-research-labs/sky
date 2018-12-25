// Select a random element from a list
export function select(list) {
  return list[Math.floor(Math.random() * list.length)];
};

// May a 3-dimensional array
export function makeArray3(height, width, depth) {
  let array3 = new Array(height);
  for (let i=0; i < height; i++) {
    array3[i] = new Array(width);
    for (let j=0; j < width; j++) {
      array3[i][j] = new Array(depth);
    }
  }
  return array3;
};

// Return rgb(r, b, b) as a string
export function rgb(r, g, b) {
  return "rgb(" + r + ", " + g + ", " + b + ")";
};

// Return random floating point in [lower, upper)
export function random(lower, upper) {
  return lower + Math.random() * (upper-lower);
};

// Return elapsed time since function was declared
let getElapsedTime = (function() {
  let start = +new Date();
  return function () {
    return (new Date() - start)/1000.;
  }
}());

export {getElapsedTime};

// Return hex value from a hex string
export function stringToHex(str) {
  return parseInt(str.substring(1), 16);
}

// Return decimal number rounded to the n-th place
export function round(f, n) {
  let s = Math.pow(10, n);
  return Math.round(s*f)/s;
}

// Return Cartesian Coordinates from Normalized Spherical [Theta,Fi]
export function cartesian([r, t, f]) {
  return [
    round(r*Math.sin(t)*Math.cos(f), 3),
    round(r*Math.sin(t)*Math.sin(f), 3),
    round(r*Math.cos(t), 3),
  ];
}

// Return xyz-coordinate from Longitude-Latitude
export function longlat([r, lon, lat]) {
  lat = Math.PI/2.0 - lat;
  return [
    r*Math.sin(lat)*Math.sin(lon),
    r*Math.cos(lat),
    r*Math.sin(lat)*Math.cos(lon),
  ];
}
