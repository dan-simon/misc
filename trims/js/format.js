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
