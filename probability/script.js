function factorial(x) {
  if (x <= 100) {
    let r = 1;
    for (let i = 1; i <= x; i++) {
      r *= i;
    }
    return new Decimal(r);
  } else {
    return new Decimal(x).factorial();
  }
}

function getSingleProb(n, k, p) {
  if (k < 0 || k > n) {
    return new Decimal(0);
  }
  return factorial(n).div(factorial(k)).div(
    factorial(n - k)).times(Decimal.pow(p, k)).times(Decimal.pow(1 - p, n - k));
}

function adjustDown(n, k, p, v) {
  return v.times(k * (1 - p) / ((n - k + 1) * p));
}

function getProbAtMost(n, k, p) {
  if (n % 1) {
    return 'Total must be an integer';
  }
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
  return ret.min(1);
}

function display(x, mode, percentSub) {
  if (typeof x === 'string') {
    return mode === 'normal' ? x : 'See above error'
  }
  if (mode === 'normal') {
    if (x.gte(10000)) {
      // fraction
      return x.mantissa.toFixed(3) + 'e' + x.exponent;
    } 
    if (x.lte(-1e-4) || x.gte(1e-4)) {
      if (percentSub) {
        return (x.lt(0) ? new Decimal(100).plus(x) : x).toFixed(2 - Math.min(x.exponent, 1));
      }
      return (x.lt(0) ? new Decimal(1).plus(x) : x).toFixed(2 - Math.min(x.exponent, -1));
    }
    if (x.lt(0)) {
      return '1 - ' + (-x.mantissa).toFixed(3) + 'e' + x.exponent;
    }
    if (x.gt(0)) {
      return x.mantissa.toFixed(3) + 'e' + x.exponent;
    }
    return '0';
  }
  if (mode === 'percent') {
    return display(x.times(100), 'normal', true) + '%';
  }
  if (mode === 'fraction') {
    if (x.eq(0)) {
      return '0';
    }
    if (x.eq(1)) {
      return '1';
    }
    if (x.abs().gt(0.5)) {
      x = x.plus(x.lt(0) ? 1 : -1);
    }
    if (x.lt(0)) {
      return '1 - 1 / ' + display(new Decimal(1).div(x.negate()), 'normal');
    }
    if (x.gt(0)) {
      return '1 / ' + display(new Decimal(1).div(x), 'normal');
    }
  }
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
  document.getElementById('ret-normal').innerHTML = display(val, 'normal');
  document.getElementById('ret-percent').innerHTML = display(val, 'percent');
  document.getElementById('ret-fraction').innerHTML = display(val, 'fraction');
}


