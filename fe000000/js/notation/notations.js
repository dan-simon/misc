function baseFormat() {
  return fm(NotationOptions.displayBase(), NotationOptions.displayDigits());
}

function specialBaseFormat() {
  return sfm(NotationOptions.displayBase(), NotationOptions.displayDigits());
}

function fm(base, digits) {
  return function (n, precision) {
   // We use -1 as a sentinal undefined value for formatExponent in some cases,
   // so we max with zero to avoid strange results.
   let value = Math.round(n * base ** Math.max(0, precision));
   const d = [];
   while (value > 0 || d.length === 0) {
     d.push(digits[value % base]);
     value = Math.floor(value / base);
   }
   let result = d.reverse().join("");
   // This only happens for positive values so if precision is negative it's not a concern.
   if (precision > 0) {
     result = result.padStart(precision + 1, digits[0]);
     result = `${result.slice(0, -precision)}.${result.slice(-precision)}`;
   }
   return result;
 };
}

function sfm(base, digits) {
  return function (n, precision) {
    precision = Math.max(0, precision);
    if (n === 0) {
      return (precision === 0) ? digits[0] : (digits[0] + '.' + digits[0].repeat(precision));
    }
    let rvalue = n * base ** precision;
    while (rvalue < 1) {
      if (precision >= 3) {
        return NotationOptions.notExactlyZero() || 'not exactly ' + digits[0];
      }
      rvalue *= base;
      precision += 1;
    }
    value = Math.round(rvalue);
    const d = [];
    while (value > 0 || d.length === 0) {
      d.push(digits[value % base]);
      value = Math.floor(value / base);
    }
    let result = d.reverse().join("");
    // This only happens for positive values so if precision is negative it's not a concern.
    if (precision > 0) {
      result = result.padStart(precision + 1, digits[0]);
      result = `${result.slice(0, -precision)}.${result.slice(-precision)}`;
    }
    return result;
  };
}

function representExponentWithAlphabet(x, a) {
  let r = [];
  while (x > 0) {
    r.push(a[(x - 1) % a.length]);
    x = Math.floor((x - 1) / a.length);
  }
  r.reverse();
  return r.join('');
}

let adaptedFormat = function (value, places, placesUnder1000, placesExponent) {
  if (typeof value === "number" && !Number.isFinite(value)) {
    return this.infinite;
  }

  const decimal = Decimal.fromValue_noAlloc(value);

  // We don't have anything that uses very small formatting and uses this function
  // at the same time, so we cut out that case.

  if (decimal.lt(NotationOptions.formatDecimalThreshold())) {
    const number = decimal.toNumber();
    return number < 0
      ? this.formatNegativeUnder1000(Math.abs(number), placesUnder1000)
      : this.formatUnder1000(number, placesUnder1000);
  }

  if (ADNotations.Settings.isInfinite(decimal.abs())) {
    return decimal.sign() < 0 ? this.negativeInfinite : this.infinite;
  }

  return decimal.sign() < 0
    ? this.formatNegativeDecimal(decimal.abs(), places, placesExponent)
    : this.formatDecimal(decimal, places, placesExponent);
  }

// General notes about the below notations:
// None of them define canHandleNegativePlaces. This is because
// FE000000 always makes sure to define places when calling format,
// because the format method is only called via the functions in format.js,
// all of which define places in their call to the method. So the issue of
// "what if places is undefined" that canHandleNegativePlaces was meant
// to handle never comes up.

// Time Scientific and Default Scientific seem to be the same but I have no trust in that continuing.
// They also don't need the special case for a different threshold.
class TimeScientificNotation extends ADNotations.Notation {
  get name() {
    return "Time Scientific";
  }
  
  formatUnder1000(value, places) {
    return ADNotations.formatMantissaBaseTen(value, places);
  }

  formatDecimal(value, places, placesExponent) {
    return ADNotations.formatMantissaWithExponent(ADNotations.formatMantissaBaseTen,
      (n, p) => this.formatExponent(n, p, (n, _) => ADNotations.formatMantissaBaseTen(n, 0), p),
      10, 1, () => '')(value, places, placesExponent);
  }
}


class DefaultScientificNotation extends ADNotations.Notation {
  get name() {
    return "Default Scientific";
  }
  
  formatUnder1000(value, places) {
    if (value < 1 && value !== 0) {
      if (value < 0.001) {
        return NotationOptions.notExactlyZero() || 'not exactly 0';
      }
      if (places < 3) {
        places = Math.max(Math.ceil(-Math.log10(value)), places);
      }
    }
    return value.toFixed(Math.max(0, places));
  }

  formatDecimal(value, places, placesExponent) {
    return ADNotations.formatMantissaWithExponent(ADNotations.formatMantissaBaseTen,
      (n, p) => this.formatExponent(n, p, (n, _) => ADNotations.formatMantissaBaseTen(n, 0), p),
      10, 1, () => '')(value, places, placesExponent);
  }
}

class ScientificNotation extends ADNotations.Notation {
  get name() {
    return "Scientific";
  }
  
  formatUnder1000(value, places) {
    return specialBaseFormat()(value, places);
  }

  formatDecimal(value, places, placesExponent) {
    return ADNotations.formatMantissaWithExponent(baseFormat(),
      (n, p) => this.formatExponent(n, p, (n, _) => baseFormat()(n, 0), p),
      NotationOptions.exponentBase(), 1, () => '')(value, places, placesExponent);
  }
}

class StandardNotation extends ADNotations.Notation {
  get name() {
    return "Standard";
  }
  
  formatUnder1000(value, places) {
    return specialBaseFormat()(value, places);
  }

  formatDecimal(value, places, placesExponent) {
    return ADNotations.formatMantissaWithExponent(baseFormat(),
      (n, _) => ADNotations.abbreviateStandard(n),
      Math.pow(NotationOptions.exponentBase(), 3), 1, () => '', ' ', false)(value, places, placesExponent);
  }
}

class LogarithmNotation extends ADNotations.Notation {
  get name() {
    return "Logarithm";
  }
  
  formatUnder1000(value, places) {
    return specialBaseFormat()(value, places);
  }

  formatDecimal(value, places, placesExponent) {
    const logBase = value.log(NotationOptions.exponentBase());
    return `e${this.formatExponent(logBase, places, baseFormat(), placesExponent)}`;
  }
}

class EngineeringNotation extends ADNotations.Notation {
  get name() {
    return "Engineering";
  }
  
  formatUnder1000(value, places) {
    return specialBaseFormat()(value, places);
  }

  formatDecimal(value, places, placesExponent) {
    return ADNotations.formatMantissaWithExponent(baseFormat(),
      (n, p) => this.formatExponent(n, p, (n, _) => baseFormat()(n, 0), p),
      NotationOptions.exponentBase(), 3, () => '')(value, places, placesExponent);
  }
}

class LettersNotation extends ADNotations.Notation {
  get name() {
    return "Letters";
  }
  
  formatUnder1000(value, places) {
    return specialBaseFormat()(value, places);
  }

  formatDecimal(value, places, placesExponent) {
    return ADNotations.formatMantissaWithExponent(baseFormat(),
      (n, _) => representExponentWithAlphabet(n, NotationOptions.alphabet()),
      NotationOptions.exponentBase(), 1, () => '', '')(value, places, placesExponent);
  }
}

// Below are mixed notations.
let standard = new StandardNotation();
let scientific = new ScientificNotation();

class MixedScientificNotation extends ADNotations.Notation {
  get name() {
    return "Mixed Scientific";
  }
  
  formatUnder1000(value, places) {
    return specialBaseFormat()(value, places);
  }

  formatDecimal(value, places, placesExponent) {
    if (value.lt(1e33)) {
      return standard.formatDecimal(value, places, placesExponent);
    }
    return ADNotations.formatMantissaWithExponent(baseFormat(),
      (n, p) => this.formatExponent(n, p, (n, _) => baseFormat()(n, 0), p),
      NotationOptions.exponentBase(), 1, () => '')(value, places, placesExponent);
  }
}

class MixedEngineeringNotation extends ADNotations.Notation {
  get name() {
    return "Mixed Engineering";
  }
  
  formatUnder1000(value, places) {
    return specialBaseFormat()(value, places);
  }

  formatDecimal(value, places, placesExponent) {
    if (value.lt(1e33)) {
      return standard.formatDecimal(value, places, placesExponent);
    }
    return ADNotations.formatMantissaWithExponent(baseFormat(),
      (n, p) => this.formatExponent(n, p, (n, _) => baseFormat()(n, 0), p),
      NotationOptions.exponentBase(), 3, () => '')(value, places, placesExponent);
  }
}

class MixedLogarithmSciNotation extends ADNotations.Notation {
  get name() {
    return "Mixed Logarithm (Sci)";
  }
  
  formatUnder1000(value, places) {
    return specialBaseFormat()(value, places);
  }

  formatDecimal(value, places, placesExponent) {
    if (value.lt(1e33)) {
      return scientific.formatDecimal(value, places, placesExponent);
    }
    const logBase = value.log(NotationOptions.exponentBase());
    return `e${this.formatExponent(logBase, places, baseFormat(), placesExponent)}`;
  }
}

class LogarithmVariantNotation extends ADNotations.Notation {
  get name() {
    return "Logarithm Variant";
  }
  
  formatUnder1000(value, places) {
    return formatLogarithmVariant(new Decimal(value), places, places);
  }

  formatDecimal(value, places, placesExponent) {
    return formatLogarithmVariant(value, places, placesExponent);
  }
}

class SpokenBinaryNotation extends ADNotations.Notation {
  get name() {
    return "Spoken Binary";
  }

  formatVerySmallDecimal(value, places) {
    return this.formatSpokenBinary(value, 8);
  }

  formatUnder1000(value, places) {
    if (places === 0) {
      return this.formatSpokenBinaryInt(new Decimal(value), 8)[0];
    } else {
      return this.formatSpokenBinary(new Decimal(value), 8);
    }
  }

  formatDecimal(value, places) {
    if (places === 0) {
      return this.formatSpokenBinaryInt(new Decimal(value), 8)[0];
    } else {
      return this.formatSpokenBinary(new Decimal(value), 8);
    }
  }

  formatSpokenBinary(x, d) {
    let [a, v] = this.formatSpokenBinaryInt(x, d);
    let frac = x.minus(v);
    // This is a bit unsafe
    if (frac.lte(0) || frac.gt(1) || a.length > d - 2) {
      return a;
    }
    let bv = new Decimal(0);
    let curr = '';
    for (let c = 0; c < 10; c++) {
      if (frac.lt(SpokenBinaryData.revPowTable[c])) {
        continue;
      }
      if (a.length === d - 2) {
        return a + '.' + SpokenBinaryData.binaryIntChars[c];
      }
      let [t, nv] = this.formatSpokenBinaryInt(frac.times(SpokenBinaryData.powTable[c]).plus(1e-9).floor(), d - 2 - a.length);
      nv = nv.times(SpokenBinaryData.revPowTable[c]);
      if (t === '1') {
        t = '';
      }
      if (nv.gt(bv.times(1 + 1e-9))) {
        bv = nv;
        curr = t + SpokenBinaryData.binaryIntChars[c];
      }
      if (bv.gt(nv.times(1 + 1e-9))) {
        return a + '.' + curr;
      }
    }
    return a + '.' + curr;
  }

  formatSpokenBinaryInt(x, d) {
    if (x.lt(1) || d === 0) {
      return ['0', new Decimal(0)];
    }
    if (x.lt(2)) {
      return ['1', new Decimal(1)];
    }
    let c = Math.floor(Math.log2(Decimal.log2(x)) + 1e-9);
    let n = SpokenBinaryData.powTable[c];
    if (d === 1) {
      return [SpokenBinaryData.binaryIntChars[c], n];
    }
    // If this is 1e-9 it causes some weird issues
    // specifically, 2^64 - 2^11 -> 2^32 - 2^-23 which is rounded down
    let f = x.div(n).plus(1e-6).floor();
    let [a, v1] = this.formatSpokenBinaryInt(f, d - 1);
    if (a === '1') {
      a = '';
    }
    let rem = x.minus(f.times(n)).max(0).plus(1e-6).floor();
    // This is such a hacky solution
    if (rem.div(n).min(1).lt(f.div(1e6))) {
      rem = new Decimal(0);
    }
    let [b, v2] = this.formatSpokenBinaryInt(rem, d - 1 - a.length);
    if (b === '0') {
      b = '';
    }
    return [a + SpokenBinaryData.binaryIntChars[c] + b, v1.times(n).plus(v2)];
  }
}

let SpokenBinaryData = {
  genPowTable: function (rev) {
    return [...Array(54)].map((_, i) => Decimal.pow(2, (rev ? -1 : 1) * Math.pow(2, i)));
  },
  binaryIntChars: '24ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
}

SpokenBinaryData.powTable = SpokenBinaryData.genPowTable(false);
SpokenBinaryData.revPowTable = SpokenBinaryData.genPowTable(true);

let ModifiedNotations = {
  'TimeScientificNotation': TimeScientificNotation,
  'DefaultScientificNotation': DefaultScientificNotation,
  'ScientificNotation': ScientificNotation,
  'StandardNotation': StandardNotation,
  'LogarithmNotation': LogarithmNotation,
  'LettersNotation': LettersNotation,
  'EngineeringNotation': EngineeringNotation,
  'MixedScientificNotation': MixedScientificNotation,
  'MixedEngineeringNotation': MixedEngineeringNotation,
  'MixedLogarithmSciNotation': MixedLogarithmSciNotation,
  'LogarithmVariantNotation': LogarithmVariantNotation,
}

let NewNotations = {
  'SpokenBinaryNotation': SpokenBinaryNotation,
}

for (let i in ModifiedNotations) {
  ModifiedNotations[i].prototype.isCommon = true;
  if (i !== 'TimeScientificNotation' && i !== 'DefaultScientificNotation') {
    ModifiedNotations[i].prototype.format = adaptedFormat;
    ModifiedNotations[i].prototype.usesBase = true;
  }
}
