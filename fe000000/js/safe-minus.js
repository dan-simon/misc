Decimal.prototype.safeMinus = function (x) {
  if (this.minus(x).lt(marginForSafeMinus(this).times(-1))) {
    throw new Error('Trying to spend more currency than possessed.');
  }
  return this.minus(x).max(minimumReducedToBySafeMinus(this));
}

let marginForSafeMinus = function (x) {
  return x.times(1e-15 * x.max(2).log2());
}

let minimumReducedToBySafeMinus = function (x) {
  if (x.gte(Decimal.pow(2, Math.pow(2, 32)))) {
    return x.div(16);
  } else if (x.gte(Math.pow(2, 256))) {
    return x.div(Math.pow(2, 16));
  } else {
    return new Decimal(0);
  }
}
