function format(x, n) {
  x = new Decimal(x);
  if (n === undefined) {
    n = 2;
  }
  let es = 0;
  while (x.gte(Decimal.pow(10, 1e6))) {
    x = x.log(10);
    es++;
  }
  let result;
  if (x.gte(1e6)) {
    let e = Math.floor(x.log(10).toNumber());
    let m = x.div(Decimal.pow(10, e)).toNumber();
    if (+m.toFixed(n) >= 10) {
      m /= 10;
      e++;
    }
    result = m.toFixed(n) + 'e' + e;
  } else if (x.equals(Math.round(x.toNumber()))) {
    result = '' + Math.round(x.toNumber());
  } else {
    result = x.toFixed(n);
  }
  return 'e'.repeat(es) + result;
}

function toTime(x, options) {
  if (x === Infinity) {
    return Infinity;
  }
  if (!options) {
    options = {};
  }
  if (x < 1 && options.secondFractions) {
    if (x < 1e-12) {
      let exponent = Math.floor(Math.log10(x));
      let mantissa = x / Math.pow(10, exponent);
      return mantissa.toFixed(2) + 'e' + exponent + ' seconds';
    }
    let level = -Math.floor(Math.log10(x) / 3);
    x *= Math.pow(1000, level)
    let prefixes = [null, 'milli', 'micro', 'nano', 'pico'];
    return x.toFixed(2) + ' ' + prefixes[level] + 'seconds';
  }
  if (x / 3600 >= 1e6) {
    return format(x / 3600) + ' hours';
  }
  return [x / 3600, x / 60 % 60, Math.floor(x % 60)].map((i) => Math.floor(i).toString().padStart(2, '0')).join(':');
}
