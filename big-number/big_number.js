// Very simple big number library, slow but easy to understand.
// Will work in modern browsers easily,
// for Node just change the last few lines.

class Decimal {
  constructor (value, raw) {
    if (raw) {
      for (let i in value) {
        this[i] = value[i];
      }
    } else if (typeof value === 'number') {
      this.zero = value === 0;
      this.neg = value < 0;
      this.e = Math.log(Math.abs(value));
    } else if (typeof value === 'string') {
      if (value.indexOf('e') === -1) {
        value = +value;
        this.zero = value === 0;
        this.neg = value < 0;
        this.e = Math.log(Math.abs(value));
      } else {
        let [mant, exp] = value.split('e');
        if (mant === '') {
          mant = '1';
        }
        mant = +mant;
        exp = +exp;
        this.zero = mant === 0;
        this.neg = mant < 0;
        this.e = Math.LN10 * exp + Math.log(mant);
      }
    } else {
      throw new Error('Could not convert value to Decimal.');
    }
  }

  negate () {
    return new Decimal(
      {'zero': this.zero, 'neg': !this.neg, 'e': this.e}, true);
  }

  abs () {
    return new Decimal(
      {'zero': this.zero, 'neg': false, 'e': this.e}, true);
  }

  eq (other) {
    if (!(other instanceof Decimal)) {
      other = new Decimal(other);
    }
    if (this.zero && other.zero) {
      return true;
    } else if (!this.zero && !other.zero && this.neg === other.neg &&
      this.e === other.e) {
      return true;
    } else {
      return false;
    }
  }

  gt (other) {
    if (!(other instanceof Decimal)) {
      other = new Decimal(other);
    }
    if (this.neg) {
      return !other.zero && other.neg && other.e > this.e;
    } else if (this.zero) {
      return !other.zero && other.neg;
    } else {
      return other.zero || other.neg || (other.e < this.e);
    }
  }

  gte (other) {
    return this.gt(other) || this.eq(other);
  }

  lt (other) {
    if (!(other instanceof Decimal)) {
      other = new Decimal(other);
    }
    return other.gt(this);
  }

  lte (other) {
    return this.lt(other) || this.eq(other);
  }

  max (other) {
    if (!(other instanceof Decimal)) {
      other = new Decimal(other);
    }
    if (this.gt(other)) {
      return this;
    } else {
      return other;
    }
  }

  min (other) {
    if (!(other instanceof Decimal)) {
      other = new Decimal(other);
    }
    if (other.gt(this)) {
      return this;
    } else {
      return other;
    }
  }

  plus (other) {
    if (!(other instanceof Decimal)) {
      other = new Decimal(other);
    }
    if (this.zero) {
      return other;
    }
    if (other.zero) {
      return this;
    }
    if (this.neg) {
      return this.negate().plus(other.negate()).negate();
    }
    if (other.neg) {
      return this.minus(other.negate());
    }
    if (this.lt(other)) {
      return other.plus(this);
    }
    // Both positive, second one smaller or equal.
    let new_exp = this.e + Math.log(1 + Math.exp(other.e - this.e));
    return new Decimal({'zero': false, 'neg': false, 'e': new_exp}, true);
  }

  add (other) {
    return this.plus(other);
  }

  minus (other) {
    if (!(other instanceof Decimal)) {
      other = new Decimal(other);
    }
    if (this.zero) {
      return other.negate();
    }
    if (other.zero) {
      return this;
    }
    if (this.neg) {
      return this.negate().plus(other.negate()).negate();
    }
    if (other.neg) {
      return this.minus(other.negate());
    }
    if (this.lt(other)) {
      return other.minus(this).negate();
    }
    if (this.eq(other)) {
      return new Decimal(0);
    }
    // Both positive, second one smaller.
    let new_exp = this.e + Math.log(1 - Math.exp(other.e - this.e));
    return new Decimal({'zero': false, 'neg': false, 'e': new_exp}, true);
  }

  sub (other) {
    return this.minus(other);
  }

  inv () {
    if (this.zero) {
      throw new Error('Inverting zero!');
    }
    return new Decimal(
      {'zero': false, 'neg': this.neg, 'e': -this.e}, true);
  }

  times (other) {
    if (!(other instanceof Decimal)) {
      other = new Decimal(other);
    }
    if (this.zero || other.zero) {
      return new Decimal(0);
    }
    return new Decimal(
      {'zero': false, 'neg': !!(this.neg ^ other.neg),
      'e': this.e + other.e}, true);
  }

  div (other) {
    if (!(other instanceof Decimal)) {
      other = new Decimal(other);
    }
    return this.times(other.inv());
  }

  toNum () {
    if (this.zero) {
      return 0;
    }
    return Math.exp(this.e) * (this.neg ? -1 : 1);
  }

  pow (other) {
    if (other instanceof Decimal) {
      other = other.toNum();
    }
    if (this.zero) {
      if (other < 0) {
        throw new Error('Cannot raise 0 to a negative power.');
      }
      if (other === 0) {
        throw new Error('This library throws an error for 0^0.');
      }
      return new Decimal(0);
    } else if (this.neg) {
      if (Math.round(other) !== other) {
        throw new Error('Can only raise negative numbers to integer powers.');
      }
      let result_neg = Math.round(other) % 2 === 1;
      return new Decimal(
        {'zero': false, 'neg': result_neg, 'e': this.e * other}, true)
    } else {
      return new Decimal(
        {'zero': false, 'neg': false, 'e': this.e * other}, true)
    }
  }

  exp () {
    return new Decimal(
      {'zero': false, 'neg': false, 'e': this.toNum()}, true);
  }

  ln () {
    if (this.zero || this.neg) {
      throw new Error('Taking log of a non-positive number!');
    }
    return this.e;
  }

  decLn () {
    return new Decimal(this.ln());
  }

  log (other) {
    if (!(other instanceof Decimal)) {
      other = new Decimal(other);
    }
    return this.ln() / other.ln();
  }

  decLog (other) {
    return new Decimal(this.log(other));
  }

  exponent () {
    return Math.floor(this.log(10));
  }

  mantessa () {
    return this.div(new Decimal(10).pow(this.exponent()));
  }

  toStr (digits) {
    if (this.zero) {
      return '0';
    }
    if (this.neg) {
      return '-' + this.negate().toStr(digits);
    }
    let mantessa = this.mantessa().toNum().toFixed(digits);
    let exponent = this.exponent();
    if (mantessa.startsWith('10')) {
      mantessa = '1' + mantessa.slice(2);
      exponent++;
    }
    return mantessa + 'e' + exponent;
  }

  save () {
    return {'zero': this.zero, 'neg': this.neg, 'e': this.e};
  }
}

for (let i of Object.getOwnPropertyNames(Decimal.prototype)) {
  Decimal[i] = function (first, ...args) {
    if (!(first instanceof Decimal)) {
      first = new Decimal(first);
    }
    return first[i](...args);
  }
}

Decimal.load = function (x) {
  return new Decimal(x, true);
}

Decimal.from = function (x) {
  return new Decimal(x);
}

// Comment this for Node.
export {Decimal};

// And uncomment this.
// module.exports = Decimal;
