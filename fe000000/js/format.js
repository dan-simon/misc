let NOTATIONS = {};

function format (x) {
  return formatWithPrecision(x, 3);
}

function formatInt (x) {
  // This is a patch to a bug in the notations library where these notations
  // display 0 as the empty string.
  if (x === 0 && ['Binary', 'Hexadecimal'].includes(player.options.notation)) {
    return '0';
  }
  return getNotation().format(x, 3, 0);
}

function formatMaybeInt (x) {
  return Decimal.eq(x, Decimal.round(x)) ? formatInt(x) : format(x);
}

function getNotation() {
  if (!(player.options.notation in NOTATIONS)) {
    let Source = ['Binary', 'Hexadecimal', 'Evil'].includes(player.options.notation) ? ADCommunityNotations : ADNotations;
    NOTATIONS[player.options.notation] = new Source[
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
