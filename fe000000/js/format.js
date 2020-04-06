let NOTATIONS = {};

function format (x) {
  return formatWithPrecision(x, 3, 3);
}

function formatWithPrecision (x, n) {
  if (!(player.options.notation in NOTATIONS)) {
    NOTATIONS[player.options.notation] = new ADNotations[
      player.options.notation.replace(/ [a-z]/g, (x) => x[1].toUpperCase()) + 'Notation']();
  }
  return NOTATIONS[player.options.notation].format(x, n, n);
}
