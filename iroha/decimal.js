class BiDecimal {
  constructor (num, raw) {
    if (!raw) {
      this.exp = 0;
      this.val = num;
      this.zero = num === 0;
    } else {
      this.exp = num.exp;
      this.val = num.val;
      this.zero = num.zero;
    }
    this.mut_simplify();
  }

  mut_simplify () {
    if (this.val === 0) {
      this.zero = true;
    }
    if (this.zero) {
      this.val = null;
      this.exp = null;
    } else {
      while (this.val % 2 == 0) {
        this.val = this.val / 2;
        this.exp++;
      }
    }
  }

  plus (x) {
    if (!(x instanceof BiDecimal)) {
      x = new BiDecimal(x);
    }
    if (this.zero) {
      return x;
    } else if (x.zero) {
      return this;
    } else {
      let common = Math.min(this.exp, x.exp);
      let sum_val = this.val * 2 ** (this.exp - common) +
      x.val * 2 ** (x.exp - common);
      return new BiDecimal({'exp': common, 'val': sum_val, 'zero': sum_val === 0}, true);
    }
  }

  negate () {
    if (this.zero) {
      return this;
    } else {
      return new BiDecimal({'exp': this.exp, 'val': -this.val, 'zero': false}, true);
    }
  }

  abs () {
    return this.lt(0) ? this.negate() : this;
  }

  log2 () {
    if (this.zero) {
      throw new Error('taking log of zero');
    } else {
      return this.exp + Math.log2(this.val);
    }
  }

  toNumber () {
    if (this.zero) {
      return 0;
    } else {
      return 2 ** this.exp * this.val;
    }
  }

  eq (x) {
    if (!(x instanceof BiDecimal)) {
      x = new BiDecimal(x);
    }
    if (this.zero) {
      return x.zero;
    } else {
      return !x.zero && this.exp === x.exp && this.val === x.val;
    }
  }

  lt (x) {
    if (!(x instanceof BiDecimal)) {
      x = new BiDecimal(x);
    }
    return this.toNumber() < x.toNumber();
  }

  isNaN () {
    return isNaN(this.exp) || isNaN(this.val);
  }

  sub (x) {
    if (!(x instanceof BiDecimal)) {
      x = new BiDecimal(x);
    }
    return this.plus(x.negate());
  }

  shift (x) {
    if (this.zero) {
      return this;
    } else {
      return new BiDecimal({'exp': this.exp + x, 'val': this.val, 'zero': false}, true);
    }
  }
}

BiDecimal.plus = function (a, b) {
  if (!(a instanceof BiDecimal)) {
    a = new BiDecimal(a);
  }
  return a.plus(b);
}

BiDecimal.sub = function (a, b) {
  if (!(a instanceof BiDecimal)) {
    a = new BiDecimal(a);
  }
  return a.sub(b);
}

BiDecimal.negate = function (a) {
  if (!(a instanceof BiDecimal)) {
    a = new BiDecimal(a);
  }
  return a.negate();
}

BiDecimal.shift = function (a, b) {
  if (!(a instanceof BiDecimal)) {
    a = new BiDecimal(a);
  }
  return a.shift(b);
}
