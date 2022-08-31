let range = function (lower, upper) {
  if (rangeCache[lower][upper] === null) {
    rangeCache[lower][upper] = [...Array(upper - lower + 1)].map((_, i) => i + lower);
  }
  return rangeCache[lower][upper];
}

let rangeCache = [...Array(30)].map((_, i) => [...Array(30)].map((_, j) => null));