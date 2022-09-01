function baseFormat() {
  return ADNotations.formatMantissa(NotationOptions.displayBase(), NotationOptions.displayDigits());
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
      10, 1, true)(value, places, placesExponent);
  }
}


class DefaultScientificNotation extends ADNotations.Notation {
  get name() {
    return "Default Scientific";
  }
  
  formatUnder1000(value, places) {
    return ADNotations.formatMantissaBaseTen(value, places);
  }

  formatDecimal(value, places, placesExponent) {
    return ADNotations.formatMantissaWithExponent(ADNotations.formatMantissaBaseTen,
      (n, p) => this.formatExponent(n, p, (n, _) => ADNotations.formatMantissaBaseTen(n, 0), p),
      10, 1, true)(value, places, placesExponent);
  }
}

class ScientificNotation extends ADNotations.Notation {
  get name() {
    return "Scientific";
  }
  
  formatUnder1000(value, places) {
    return baseFormat()(value, places);
  }

  formatDecimal(value, places, placesExponent) {
    return ADNotations.formatMantissaWithExponent(baseFormat(),
      (n, p) => this.formatExponent(n, p, (n, _) => baseFormat()(n, 0), p),
      NotationOptions.exponentBase(), 1, true)(value, places, placesExponent);
  }
}

class StandardNotation extends ADNotations.Notation {
  get name() {
    return "Standard";
  }
  
  formatUnder1000(value, places) {
    return baseFormat()(value, places);
  }

  formatDecimal(value, places, placesExponent) {
    return ADNotations.formatMantissaWithExponent(baseFormat(),
      (n, _) => ADNotations.abbreviateStandard(n),
      Math.pow(NotationOptions.exponentBase(), 3), 1, true, ' ', false)(value, places, placesExponent);
  }
}

class LogarithmNotation extends ADNotations.Notation {
  get name() {
    return "Logarithm";
  }
  
  formatUnder1000(value, places) {
    return baseFormat()(value, places);
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
    return baseFormat()(value, places);
  }

  formatDecimal(value, places, placesExponent) {
    return ADNotations.formatMantissaWithExponent(baseFormat(),
      (n, p) => this.formatExponent(n, p, (n, _) => baseFormat()(n, 0), p),
      NotationOptions.exponentBase(), 3, true)(value, places, placesExponent);
  }
}

class LettersNotation extends ADNotations.Notation {
  get name() {
    return "Letters";
  }
  
  formatUnder1000(value, places) {
    return baseFormat()(value, places);
  }

  formatDecimal(value, places, placesExponent) {
    return ADNotations.formatMantissaWithExponent(baseFormat(),
      (n, _) => representExponentWithAlphabet(n, NotationOptions.alphabet()),
      NotationOptions.exponentBase(), 1, true, '')(value, places, placesExponent);
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
    return baseFormat()(value, places);
  }

  formatDecimal(value, places, placesExponent) {
    if (value.lt(1e33)) {
      return standard.formatDecimal(value, places, placesExponent);
    }
    return ADNotations.formatMantissaWithExponent(baseFormat(),
      (n, p) => this.formatExponent(n, p, (n, _) => baseFormat()(n, 0), p),
      NotationOptions.exponentBase(), 1, true)(value, places, placesExponent);
  }
}

class MixedEngineeringNotation extends ADNotations.Notation {
  get name() {
    return "Mixed Engineering";
  }
  
  formatUnder1000(value, places) {
    return baseFormat()(value, places);
  }

  formatDecimal(value, places, placesExponent) {
    if (value.lt(1e33)) {
      return standard.formatDecimal(value, places, placesExponent);
    }
    return ADNotations.formatMantissaWithExponent(baseFormat(),
      (n, p) => this.formatExponent(n, p, (n, _) => baseFormat()(n, 0), p),
      NotationOptions.exponentBase(), 3, true)(value, places, placesExponent);
  }
}

class MixedLogarithmSciNotation extends ADNotations.Notation {
  get name() {
    return "Mixed Logarithm (Sci)";
  }
  
  formatUnder1000(value, places) {
    return baseFormat()(value, places);
  }

  formatDecimal(value, places, placesExponent) {
    if (value.lt(1e33)) {
      return scientific.formatDecimal(value, places, placesExponent);
    }
    const logBase = value.log(NotationOptions.exponentBase());
    return `e${this.formatExponent(logBase, places, baseFormat(), placesExponent)}`;
  }
}

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
}

for (let i in ModifiedNotations) {
  if (i !== 'TimeScientificNotation' && i !== 'DefaultScientificNotation') {
    ModifiedNotations[i].prototype.format = adaptedFormat;
  }
}
