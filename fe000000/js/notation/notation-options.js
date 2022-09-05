let NotationOptions = {
  notation() {
    return player.options.notation.notation;
  },
  setNotation(x) {
    player.options.notation.notation = x;
    this.notationChange();
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
    this.notationChange();
  },
  setHigherPrecision(x) {
    player.options.notation.higherPrecision = (x === 0) ? 0 : (x || 5);
    this.notationChange();
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
    this.notationChange();
  },
  displayBase() {
    return (typeof player.options.notation.displayDigits === 'number') ? player.options.notation.displayDigits :
    player.options.notation.displayDigits.length;
  },
  displayDigits() {
    return (typeof player.options.notation.displayDigits === 'number') ? '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, player.options.notation.displayDigits) :
    player.options.notation.displayDigits;
  },
  exponentBase() {
    return player.options.notation.exponentBase;
  },
  setExponentBase(x) {
    // This can intentionally be fractional.
    player.options.notation.exponentBase = x ? Math.max(1 + 1e-6, Math.min(1e80, x)) : 10;
    this.notationChange();
  },
  alphabet() {
    return player.options.notation.alphabet;
  },
  setAlphabet(x) {
    player.options.notation.alphabet = (x && x.length >= 2) ? x : 'abcdefghijklmnopqrstuvwxyz';
    this.notationChange();
  },
  decimalThresholdCache: {},
  formatDecimalThreshold() {
    let e = this.exponentBase();
    if (!(e in this.decimalThresholdCache)) {
      this.decimalThresholdCache[e] = Math.pow(e, Math.max(3, Math.ceil(3 / Math.log10(e))));
    }
    return this.decimalThresholdCache[e];
  },
  formatOrdinals() {
    return player.options.notation.formatOrdinals;
  },
  toggleFormatOrdinals() {
    player.options.notation.formatOrdinals = !player.options.notation.formatOrdinals;
    this.notationChange();
  },
  parseAutobuyersInCurrentBase() {
    return player.options.notation.parseAutobuyersInCurrentBase;
  },
  toggleParseAutobuyersInCurrentBase() {
    player.options.notation.parseAutobuyersInCurrentBase = !player.options.notation.parseAutobuyersInCurrentBase;
    this.notationChange();
  },
  autobuyerPrecision() {
    return Math.min(Math.max(0, Math.floor(player.options.notation.autobuyerPrecision)), 10);
  },
  setAutobuyerPrecision(x) {
    player.options.notation.autobuyerPrecision = (x === 0) ? 0 : (x || 3);
    this.notationChange();
  },
  notationChange(x = [10, 11, 12, 13, 14, 15]) {
    for (let i of x) {
      for (let input of Array.from(document.getElementsByClassName('autobuyer-priority-' + i))) {
        input.value = autobuyerSettingToString(Autobuyer(i).priority(), i);
      }
    }
  }
}
