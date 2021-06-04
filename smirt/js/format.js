let NOTATIONS = {};

function format (x) {
  return formatWithPrecision(x, 3);
}

function formatInt (x) {
  return getNotation().format(x, 3, 0);
}

function formatMaybeInt (x) {
  return Decimal.eq(x, Decimal.round(x)) ? formatInt(x) : format(x);
}

function maybeAddInitialZero(x, maybeDo) {
  if (x.length === 1 && maybeDo) {
    return '0' + x;
  } else {
    return x;
  }
}

function formatTime(time, options) {
  if (time < 60) {
    return options.seconds.f(time) + ' second' + (options.seconds.s ? pluralize(time, '', 's') : 's');
  } else {
    let parts = [Math.floor(time / 86400), Math.floor(time / 3600) % 24, Math.floor(time / 60) % 60, Math.floor(time) % 60];
    while (parts[0] === 0) {
      parts.shift();
    }
    let f = (x, i) => maybeAddInitialZero(x.toString(), i !== 0);
    return parts.map(f).join(':');
  }
}

function getNotation() {
  if (!(player.options.notation in NOTATIONS)) {
    NOTATIONS[player.options.notation] = new ADNotations[
      player.options.notation.replace(/ [a-z]/g, (x) => x[1].toUpperCase()) + 'Notation']();
  }
  return NOTATIONS[player.options.notation];
}

function formatWithPrecision(x, n) {
  return getNotation().format(x, n, n);
}

function pluralize(x, singular, plural) {
  return Decimal.eq(x, 1) ? singular : plural;
}
