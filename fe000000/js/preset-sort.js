let presetSortFunction = function (a, b) {
  let aParts = presetNameParts(a);
  let bParts = presetNameParts(b);
  for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
    if (typeof aParts[i] === 'string' && typeof bParts[i] === 'number') {
      return 1;
    }
    if (typeof aParts[i] === 'number' && typeof bParts[i] === 'string') {
      return -1;
    }
    if (aParts[i] > bParts[i]) {
      return 1;
    }
    if (aParts[i] < bParts[i]) {
      return -1;
    }
  }
  if (aParts.length > bParts.length) {
    return 1;
  }
  if (aParts.length < bParts.length) {
    return -1;
  }
  return 0;
}

let presetNameParts = function (x) {
  return [...x.matchAll(/[0-9]+|[^0-9]/g)].map(i => i[0]).map(
    i => ('0' <= i[0] && i[0] <= '9') ? +i : i);
}
