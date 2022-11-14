function getSingleProb(n, k, p) {
  if (k < 0 || k > n) {
    return new Decimal(0);
  }
  return new Decimal(n).factorial().div(new Decimal(k).factorial()).div(
    new Decimal(n - k).factorial()).times(Decimal.pow(p, k)).times(Decimal.pow(1 - p, n - k));
}

function adjustDown(n, k, p, v) {
  return v.times(k * (1 - p) / ((n - k + 1) * p));
}

function getProbAtMost(n, k, p) {
  if (k % 1) {
    return 'Threshold must be an integer';
  }
  if (p < 0 || p > 1) {
    return 'Probability must be between 0 and 1';
  }
  if (k > n * p) {
    let v = getProbAtMost(n, n - k - 1, 1 - p);
    if (v.eq(0)) {
      return new Decimal(1);
    }
    if (v.eq(1)) {
      return new Decimal(0);
    }
    return v.negate();
  }
  let term = getSingleProb(n, k, p);
  let old = new Decimal(0);
  let ret = term;
  while (!old.eq(ret)) {
    old = ret;
    term = adjustDown(n, k, p, term);
    ret = ret.plus(term);
    k -= 1;
  }
  return ret;
}

function display(x) {
  if (typeof x === 'string') {
    return x;
  }
  if (x.lte(-0.01) || x.gte(0.01)) {
    return (x.lt(0) ? new Decimal(1).plus(x) : x).toFixed(3);
  }
  if (x.lt(0)) {
    return '1 - ' + (-x.mantissa).toFixed(3) + 'e' + x.exponent;
  }
  if (x.gt(0)) {
    return x.mantissa.toFixed(3) + 'e' + x.exponent;
  }
  return '0';
}

function parse(n) {
  return eval(n.replace(/%/g, '/100').replace(/,/g, '.'));
}

function main() {
  let n = parse(document.getElementById('n').value);
  let k = parse(document.getElementById('k').value);
  let p = parse(document.getElementById('p').value);
  let mode = document.getElementById('mode').value;
  let neg = false;
  if (mode === 'At least') {
    k = n - k;
    p = 1 - p;
    neg = true;
  } else if (mode === 'At most') {
    // nothing
  } else if (mode === 'Less than') {
    k = k - 1;
  } else if (mode === 'More than') {
    k = n - k - 1;
    p = 1 - p;
    neg = true;
  }
  let val = getProbAtMost(n, k, p);
  document.getElementById('ret').innerHTML = display(val);
}


