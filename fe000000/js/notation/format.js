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

function notationIsLikeScientific(x) {
  return ['Scientific', 'Logarithm', 'Engineering', 'Letters',
  'Mixed Scientific', 'Mixed Engineering', 'Mixed Logarithm (Sci)'].includes(x.name);
}

function maybeAddInitialZero(x, expected, maybeDo) {
  if (x.length === 1 && (x === expected || notationIsLikeScientific(getTimeNotation())) && maybeDo) {
    return '0' + x;
  } else {
    return x;
  }
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

function formatTime(time, options) {
  let timeDisplay = player.options.timeDisplay;
  if (timeDisplay === 'Seconds' || time < 60) {
    return options.seconds.f(time) + ' second' + (options.seconds.s ? pluralize(time, '', 's') : 's');
  } else if (timeDisplay === 'D:H:M:S' || timeDisplay === 'D:H:M:S with notation') {
    let applyNotation = (timeDisplay === 'D:H:M:S with notation');
    let parts = [Math.floor(time / 86400), Math.floor(time / 3600) % 24, Math.floor(time / 60) % 60, Math.floor(time) % 60];
    while (parts[0] === 0) {
      parts.shift();
    }
    let f = (x, i) => maybeAddInitialZero(formatTimeInt(x), x.toString(), i !== 0);
    return parts.map(f).join(':');
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
    ((key === 'EvilNotation') ? ADCommunityNotations : ADNotations);
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

function autobuyerSettingToString(x) {
  let prec = NotationOptions.autobuyerPrecision();
  if (NotationOptions.parseAutobuyersInCurrentBase()) {
    if (NotationOptions.notation() === 'Hex') {
      return formatWithPrecision(x, prec);
    } else {
      return getNotation('Scientific').format(x, prec, prec, prec);
    }
  } else {
    return getNotation('DefaultScientific').format(x, prec, prec, prec);
  }
}

function stringToAutobuyerSetting(x) {
  if (NotationOptions.notation() === 'Hex') {
    return hexToNumber(x);
  }
  let y = x.split(displayDigitsAutobuyerSettings().includes('E') ? 'e' : /[Ee]/g).map(i => i.toUpperCase());
  if (y[y.length - 1] === '' && x[x.length - 1].toUpperCase() === 'E') {
    y.pop();
    y[y.length - 1] += 'E';
  }
  y = y.map(stringToAutobuyerSettingNoExponent);
  return y.length > 0 ? y.reduceRight((a, b) => Decimal.pow(exponentBaseAutobuyerSettings(), a).times(b)) : new Decimal(0);
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

function stringToAutobuyerSettingNoExponent(x) {
  let digits = displayDigitsAutobuyerSettings();
  let sign = Math.pow(-1, (x.match(/-/g) || []).length);
  let actualDigits = [...x].filter(i => i === '.' || digits.includes(i));
  let dec = actualDigits.includes('.') ? actualDigits.indexOf('.') - 1 : actualDigits.length - 1;
  actualDigits = actualDigits.filter(i => i !== '.');
  return actualDigits.length > 0 ? actualDigits.map(
    (x, i) => Decimal.pow(digits.length, dec - i).times(digits.indexOf(x))).reduce(
    (a, b) => a.plus(b)) : new Decimal(1);
}

let displayDigitsAutobuyerSettings = () => NotationOptions.parseAutobuyersInCurrentBase() ? NotationOptions.displayDigits() : '0123456789';

let exponentBaseAutobuyerSettings = () => NotationOptions.parseAutobuyersInCurrentBase() ? NotationOptions.exponentBase() : 10;


