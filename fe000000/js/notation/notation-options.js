let NotationOptions = {
  notation() {
    return player.options.notation.notation;
  },
  setNotation(x) {
    player.options.notation.notation = x;
  },
  lowerPrecision() {
    return Math.min(Math.max(0, Math.floor(player.options.notation.lowerPrecision)), 10);
  },
  higherPrecision() {
    return Math.min(Math.max(0, Math.floor(player.options.notation.higherPrecision)), 10);
  },
  highestPrecision(x) {
    return 2 + Math.max(this.lowerPrecision(), this.higherPrecision())
  },
  setLowerPrecision(x) {
    player.options.notation.lowerPrecision = (x === 0) ? 0 : (x || 3);
  },
  setHigherPrecision(x) {
    player.options.notation.higherPrecision = (x === 0) ? 0 : (x || 5);
  },
  rawDisplayBase() {
    return (typeof player.options.notation.displayDigits === 'number') ? player.options.notation.displayDigits :
    '\'' + player.options.notation.displayDigits + '\'';
  },
  setDisplayBase(x) {
    let first = x[0];
    let last = x[x.length - 1];
    if (x.length >= 4 && first === last && !first.match(/\d/g)) {
      player.options.notation.displayDigits = x.slice(1, -1);
    } else {
      let y = Math.floor(+x);
      player.options.notation.displayDigits = y ? Math.min(Math.max(2, y), 36) : 10;
    }
  },
  displayBase() {
    return (typeof player.options.notation.displayDigits === 'number') ? player.options.notation.displayDigits :
    player.options.notation.displayDigits.length;
  },
  displayDigits() {
    return (typeof player.options.notation.displayDigits === 'number') ? '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, player.options.notation.displayDigits) :
    player.options.notation.displayDigits.length;
  },
  exponentBase() {
    return player.options.notation.exponentBase;
  },
  setExponentBase(x) {
    // This can intentionally be fractional.
    player.options.notation.exponentBase = (x && (x >= 1 + 1e-6)) ? x : 10;
  },
  alphabet() {
    return player.options.notation.alphabet;
  },
  setAlphabet(x) {
    player.options.notation.alphabet = (x && x.length >= 2) ? x : 'abcdefghijklmnopqrstuvwxyz';
  }
}
