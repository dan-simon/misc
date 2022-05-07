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
