Math.safePow = function (w, x) {
  return (w < 1 && x > 1) ? w : Math.pow(w, x);
}

Decimal.prototype.safePow = function (x) {
  return (this.lt(1) && x > 1) ? this : this.pow(x);
}
