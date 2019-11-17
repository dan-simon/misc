let NOTATIONS = {};

function format (x) {
  if (!(player.options.notation in NOTATIONS)) {
    NOTATIONS[player.options.notation] = new ADNotations[
      player.options.notation.replace(/ [a-z]/g, (x) => x[1].toUpperCase()) + 'Notation']();
  }
  return NOTATIONS[player.options.notation].format(x, 2, 2);
}
