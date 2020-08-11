Decimal.prototype.safeMinus = function (x) {
  if (this.minus(x).lt(this.times(-1e-10))) {
    throw new Error('Trying to spend more currency than possessed.');
  }
  return this.minus(x).max(0);
}
