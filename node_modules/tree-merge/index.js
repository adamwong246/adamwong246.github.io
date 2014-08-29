var MATCH = "match";
var UNMATCH = "unmatch";
var UNKNOWN = "unknown";
var shallowMatch = function(obj1, obj2) {
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    if (obj1 === obj2) return MATCH;
    return UNMATCH;
  }
  return UNKNOWN;
};


module.exports = function treeMerge(a, b) {
  var ymax = a.length > b.length ? a.length : b.length;
  var xmax = 0;
  var c = [];
  for (var y=0; y<ymax; y++) {
    a[y] = a[y] || [];
    b[y] = b[y] || [];
    c[y] = c[y] || [];
    var alen, blen = 0;
    if (typeof a[y] === 'object') alen = a[y].length;
    if (typeof b[y] === 'object') blen = b[y].length;
    var xtemp = alen > blen ? alen : blen;
    xmax = xtemp > xmax ? xtemp : xmax;
  }

  for (var y=0; y<ymax; y++) {
    for (var x=0; x<xmax; x++) {
      var exists = a[y][x] && b[y][x];
      var shallowMatchResult = shallowMatch(a[y][x], b[y][x]);
      if (exists && shallowMatchResult === MATCH) {
        c[y][x] ? c[y].push(a[y][x]) : c[y][x] = a[y][x];
      } else if (shallowMatchResult === UNMATCH) {
        if (a[y][x]) c[y].push(a[y][x]);
        if (b[y][x]) c[y].push(b[y][x]);
      } else if (exists) {
        c[y][x] = treeMerge([a[y][x]], [b[y][x]])[0];
      }
    }
  }
  return c;
};

