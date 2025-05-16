let NOTATIONS = {};

function format (x) {
  return formatWithPrecision(x, NotationOptions.lowerPrecision());
}

function formatPrecisely (x) {
  return formatWithPrecision(x, NotationOptions.higherPrecision());
}

function formatVeryPrecisely (x) {
  return formatWithPrecision(x, NotationOptions.highestPrecision());
}

function formatInt (x) {
  let lp = NotationOptions.lowerPrecision();
  return getNotation().format(x, lp, 0, lp);
}

function formatOrdinalInt (x) {
  if (NotationOptions.formatOrdinals()) {
    return formatInt(x);
  } else {
    return '' + x;
  }
}

function formatMaybeInt (x) {
  return Decimal.eq(x, Decimal.round(x)) ? formatInt(x) : format(x);
}

function getTimeNotation() {
  return Options.notationOnTimes() ? getNotation() : getNotation('TimeScientific');
}

function formatTimeNum(x) {
  let lp = NotationOptions.lowerPrecision();
  return getTimeNotation().format(x, lp, lp, lp);
}

function formatTimeInt(x) {
  let lp = NotationOptions.lowerPrecision();
  return getTimeNotation().format(x, lp, 0, lp);
}

function formatTimeMaybeInt(x) {
  return Decimal.eq(x, Decimal.round(x)) ? formatTimeInt(x) : formatTimeNum(x);
}

let digitsCache = {};

let getNeededDigits = function (base) {
  if (!(base in digitsCache)) {
    digitsCache[base] = [null].concat([24, 60, 60].map(i => Math.ceil(Math.log(i) / Math.log(base))));
  }
  return digitsCache[base];
}

function maybeAddInitialZero(x, expected, digits) {
  if (digits !== null && x.length < digits && (x === expected || getTimeNotation().isCommon)) {
    return x.padStart(digits, '0');
  } else {
    return x;
  }
}

function formatDHMS(time, base) {
  let parts = [Math.floor(time / 86400), Math.floor(time / 3600) % 24, Math.floor(time / 60) % 60, Math.floor(time) % 60];
  let digits = getNeededDigits(base);
  while (parts[0] === 0) {
    parts.shift();
  }
  let f = (x, i) => maybeAddInitialZero(formatTimeInt(x), x.toString(), (i === 0) ? null : digits[4 - parts.length + i]);
  return parts.map(f).join(':');
}

function formatTime(time, options) {
  let timeDisplay = player.options.timeDisplay;
  if (timeDisplay === 'Seconds' || time < 60) {
    return options.seconds.f(time) + ' second' + (options.seconds.s ? pluralize(time, '', 's') : 's');
  } else if (timeDisplay === 'D:H:M:S') {
    // usesBase can be undefined but that's fine (we treat it as false).
    let base = getTimeNotation().usesBase ? NotationOptions.displayBase() : 10;
    return formatDHMS(time, base);
  } else if (timeDisplay === 'Largest unit') {
    if (time < 3600) {
      return options.larger.f(time / 60) + ' minute' + (options.larger.s ? pluralize(time / 60, '', 's') : 's');
    } else if (time < 86400) {
      return options.larger.f(time / 3600) + ' hour' + (options.larger.s ? pluralize(time / 3600, '', 's') : 's');
    } else {
      return options.larger.f(time / 86400) + ' day' + (options.larger.s ? pluralize(time / 86400, '', 's') : 's');
    }
  }
}

function getNotation(x) {
  if (x === undefined) {
    x = NotationOptions.notation();
  }
  if (!(x in NOTATIONS)) {
    // It used to be that Mixed Logarithm (Sci) had logarithm capitalized in the official notation name,
    // unlike Mixed scientific and Mixed engineering. However, then notation names were standardized,
    // the new names having capitalization on every word.
    let key = x.replace(/[()]/g, '').replace(/ [A-Za-z]/g, (x) => x[1].toUpperCase()) + 'Notation';
    let Source = (key in ModifiedNotations) ? ModifiedNotations :
    ((key in NewNotations) ? NewNotations :
    ((key === 'EvilNotation') ? ADCommunityNotations : ADNotations));
    NOTATIONS[x] = new Source[key]();
  }
  return NOTATIONS[x];
}

function formatWithPrecision(x, n) {
  return getNotation().format(x, n, n, n);
}

function pluralize(x, singular, plural) {
  return Decimal.eq(x, 1) ? singular : plural;
}

function isUsingTimeMode(autobuyer) {
  return Autobuyer(autobuyer).mode().slice(0, 4) === 'Time';
}

function autobuyerSettingToString(x, autobuyer) {
  let time = isUsingTimeMode(autobuyer);
  let specialFormat = NotationOptions.parseAutobuyersInCurrentBase() && (!time || Options.notationOnTimes());
  let prec = NotationOptions.inputPrecision();
  return numToString(x, specialFormat, prec);
}

function numToString(x, specialFormat, prec) {
  let intPrec = Decimal.eq(x, Decimal.round(x)) ? 0 : prec;
  if (specialFormat) {
    // Actually formatting as DMHS is very annoying
    if (NotationOptions.notation() === 'Hex') {
      return formatWithPrecision(x, prec);
    } else {
      return getNotation('Scientific').format(x, prec, intPrec, prec);
    }
  } else {
    return getNotation('DefaultScientific').format(x, prec, intPrec, prec);
  }
}

function stringToAutobuyerSetting(x, autobuyer) {
  let time = isUsingTimeMode(autobuyer);
  let specialFormat = NotationOptions.parseAutobuyersInCurrentBase() && (!time || Options.notationOnTimes());
  return stringToNum(x, specialFormat);
}

function stringToNum(x, specialFormat) {
  let parts = x.split(':').map(i => stringToNumNoColon(i, specialFormat));
  let res = parts[0];
  for (let i = 1; i < parts.length; i++) {
    let unit = parts.length - 1 - i;
    // I only know of one system that represents large times as arbitrarily long sequences of small numbers.
    res = res.times((unit >= 5) ? 20 : [60, 60, 24, 20, 18][unit]);
    res = res.plus(parts[1]);
  }
  return res;
}

function stringToNumNoColon(x, specialFormat) {
  if (specialFormat && NotationOptions.notation() === 'Hex') {
    return hexToNumber(x);
  }
  let y = x.split(displayDigits(specialFormat).includes('E') ? 'e' : /[Ee]/g).map(i => i.toUpperCase());
  if (y[y.length - 1] === '' && x && x[x.length - 1].toUpperCase() === 'E') {
    y.pop();
    y[y.length - 1] += 'E';
  }
  y = y.map(x => stringToNumNoExponent(x, specialFormat));
  return y.length > 0 ? y.reduceRight((a, b) => Decimal.pow(exponentBase(specialFormat), a).times(b)) : new Decimal(0);
}

function hexToNumber(x) {
  let bits = [...x.toUpperCase()].flatMap(i => '0123456789ABCDEF'.includes(i) ? [...(parseInt(i, 16) + 16).toString(2).slice(1)].map(i => +i) : []);
  bits.reverse();
  let f = function (x) {
    if (x.eq(Infinity)) {
      return new Decimal(Infinity);
    }
    if (x.eq(-Infinity)) {
      return new Decimal(0)
    }
    let int = Decimal.floor(x);
    // Because sufficiently high powers of 2 give infinity again
    return (int.gt(1e300) ? new Decimal(Infinity) : Decimal.pow(2, int)).times(x.minus(int).plus(1));
  }
  let op = new Decimal(-Infinity);
  for (let b of bits) {
    op = op.times(b ? 1 : -1);
    op = f(op);
    op = op.times(b ? 1 : -1);
  }
  return op;
}

function stringToNumNoExponent(x, specialFormat) {
  let digits = displayDigits(specialFormat);
  let sign = Math.pow(-1, (x.match(/-/g) || []).length);
  let actualDigits = [...x].filter(i => i === '.' || digits.includes(i));
  let dec = actualDigits.includes('.') ? actualDigits.indexOf('.') - 1 : actualDigits.length - 1;
  actualDigits = actualDigits.filter(i => i !== '.');
  return actualDigits.length > 0 ? actualDigits.map(
    (x, i) => Decimal.pow(digits.length, dec - i).times(digits.indexOf(x))).reduce(
    (a, b) => a.plus(b)) : new Decimal(1);
}

let displayDigits = (specialFormat) => specialFormat ? NotationOptions.displayDigits() : '0123456789';

let exponentBase = (specialFormat) => specialFormat ? NotationOptions.exponentBase() : 10;

function formatLogarithmVariant(n, places, placesExponent) {
  let db = NotationOptions.displayBase();
  // For this notation specifically, require exponent base to be at least 2.
  let eb = Math.max(2, NotationOptions.exponentBase());
  let c = NotationOptions.formatDecimalThresholdExponent(eb);
  // Preliminary check
  if (n.lessThan(eb ** c / 2)) {
    return baseFormat()(n, places);
  }
  let exponent = Math.floor(n.log(eb));
  let mantissa = n.div(Decimal.pow(eb, exponent)).toNumber();
  if (!(1 <= mantissa && mantissa < eb)) {
    const adjust = Math.floor(Math.log(mantissa) / Math.log(eb));
    mantissa /= Math.pow(eb, adjust);
    exponent += adjust;
  }
  if (exponent < c ? (baseFormat()(n, places) === baseFormat()(eb ** (exponent + 1), places)) :
  (baseFormat()(mantissa, places) === baseFormat()(eb, places))) {
    mantissa /= eb;
    exponent += 1;
  }
  // Stuff has been normalized
  if (exponent < c) {
    return baseFormat()(n, places);
  }
  if (exponent >= eb ** c) {
    return 'e' + formatLogarithmVariant(new Decimal(n.log(eb)), placesExponent, placesExponent);
  }
  let epsilon = 1e-9;
  let alteredMantissa = mantissa * eb ** (c - 1);
  let alteration = c - 1;
  if (Math.abs(alteredMantissa - Math.round(alteredMantissa)) > epsilon) {
    return baseFormat()(mantissa, places) + 'e' + baseFormat()(exponent, 0);
  }
  alteredMantissa = Math.round(alteredMantissa);
  while (alteration >= 0 && Number.isInteger(alteredMantissa)) {
    alteredMantissa /= eb;
    alteration -= 1;
  }
  alteredMantissa = Math.round(alteredMantissa * eb);
  alteration += 1;
  return (alteredMantissa === 1 ? '' : baseFormat()(alteredMantissa, 0)) + 'e' + baseFormat()(exponent - alteration, 0);
}

// And now for something completely different.
let numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

let title = x => x[0].toUpperCase() + x.slice(1).toLowerCase();
