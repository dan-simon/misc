let range = function (lower, upper) {
  return [...Array(upper - lower + 1)].map((_, i) => i + lower);
}