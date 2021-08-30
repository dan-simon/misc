let NOTATIONS = {};

function format (x) {
  return formatWithPrecision(x, Options.lowerPrecision());
}

function formatPrecisely (x) {
  return formatWithPrecision(x, Options.higherPrecision());
}

function formatVeryPrecisely (x) {
  return formatWithPrecision(x, Options.highestPrecision());
}

function formatInt (x) {
  return getNotation().format(x, Options.lowerPrecision(), 0);
}

function formatMaybeInt (x) {
  return Decimal.eq(x, Decimal.round(x)) ? formatInt(x) : format(x);
}

function maybeAddInitialZero(x, expected, maybeDo) {
  if (x.length === 1 && x === expected && maybeDo) {
    return '0' + x;
  } else {
    return x;
  }
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
    let f = (x, i) => maybeAddInitialZero((applyNotation ? formatInt(x) : x.toString()), x.toString(), i !== 0);
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
    x = player.options.notation;
  }
  if (!(x in NOTATIONS)) {
    // Mixed Logarithm (Sci) has logarithm capitalized in the official notation name,
    // unlike Mixed scientific and Mixed engineering.
    let Source = ['Binary', 'Hexadecimal', 'Evil', 'Mixed Logarithm (Sci)'].includes(x) ? ADCommunityNotations : ADNotations;
    NOTATIONS[x] = new Source[x.replace(/[()]/g, '').replace(/ [A-Za-z]/g, (x) => x[1].toUpperCase()) + 'Notation']();
  }
  return NOTATIONS[x];
}

function formatWithPrecision(x, n) {
  return getNotation().format(x, n, n);
}

function pluralize(x, singular, plural) {
  return Decimal.eq(x, 1) ? singular : plural;
}
