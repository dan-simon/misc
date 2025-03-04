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
    this.basePropsChange();
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
    this.basePropsChange();
    this.notationChange();
  },
  alphabet() {
    return player.options.notation.alphabet;
  },
  setAlphabet(x) {
    player.options.notation.alphabet = (x && x.length >= 2) ? x : 'abcdefghijklmnopqrstuvwxyz';
    this.notationChange();
  },
  notExactlyZero() {
    return player.options.notation.notExactlyZero;
  },
  setNotExactlyZero(x) {
    player.options.notation.notExactlyZero = x;
    this.notationChange();
  },
  decimalThresholdCache: {},
  formatDecimalThreshold(e=this.exponentBase()) {
    if (!(e in this.decimalThresholdCache)) {
      this.decimalThresholdCache[e] = Math.pow(e, Math.max(3, Math.ceil(3 / Math.log10(e))));
    }
    return this.decimalThresholdCache[e];
  },
  decimalThresholdExponentCache: {},
  formatDecimalThresholdExponent(e=this.exponentBase()) {
    if (!(e in this.decimalThresholdExponentCache)) {
      this.decimalThresholdExponentCache[e] = Math.max(3, Math.ceil(3 / Math.log10(e)));
    }
    return this.decimalThresholdExponentCache[e];
  },
  formatOrdinals() {
    return player.options.notation.formatOrdinals;
  },
  toggleFormatOrdinals() {
    player.options.notation.formatOrdinals = !player.options.notation.formatOrdinals;
    this.notationChangeAutobuyers();
  },
  parseAutobuyersInCurrentBase() {
    return player.options.notation.parseAutobuyersInCurrentBase;
  },
  toggleParseAutobuyersInCurrentBase() {
    player.options.notation.parseAutobuyersInCurrentBase = !player.options.notation.parseAutobuyersInCurrentBase;
    this.notationChangeOthers();
  },
  parseInputsInCurrentBase() {
    return player.options.notation.parseInputsInCurrentBase;
  },
  toggleParseInputsInCurrentBase() {
    player.options.notation.parseInputsInCurrentBase = !player.options.notation.parseInputsInCurrentBase;
    this.notationChange();
  },
  inputPrecision() {
    return Math.min(Math.max(0, Math.floor(player.options.notation.inputPrecision)), 10);
  },
  setInputPrecision(x) {
    player.options.notation.inputPrecision = (x === 0) ? 0 : (x || 3);
    this.notationChange();
  },
  basePropsChange() {
    // This avoids recursive exponent expansion, which could previously happen with bases such that x^x^...^x^9 converged to a finite limit
    // (threshold is somewhere between 1.2 and 1.3)
    // The Math.pow(this.exponentBase() - 1, -2) gets some cases with very small bases, where even x^x^...^x^1000 doesn't converge.
    // Commas don't have this specific issue, but they do have an issue where nested exponents above the comma threshold don't have decimals in log notation.
    // It's easy to see that ADNotations.Settings.exponentCommas.min < ADNotations.Settings.exponentCommas.max is guaranteed.
    ADNotations.Settings.exponentCommas.min = Math.max(1000, Math.pow(this.displayBase(), 5));
    ADNotations.Settings.exponentCommas.max = Math.max(1000, Math.pow(this.exponentBase() - 1, -2), Math.pow(this.displayBase(), 9));
  },
  notationChange() {
    this.notationChangeAutobuyers();
    this.notationChangeOthers();
  },
  notationChangeAutobuyers(x = [10, 11, 12, 13, 14, 15]) {
    for (let i of x) {
      Autobuyer(i).redisplayPriority();
    }
  },
  formatMaybeTime(x, isTime) {
    let specialFormat = NotationOptions.parseInputsInCurrentBase() && (!isTime || Options.notationOnTimes());
    let prec = NotationOptions.inputPrecision();
    return numToString(x, specialFormat, prec);
  },
  readMaybeTime(x, isTime) {
    let specialFormat = NotationOptions.parseInputsInCurrentBase() && (!isTime || Options.notationOnTimes());
    return stringToNum(x, specialFormat);
  },
  read(x, y) {
    // Never return decimal, always return number. Generally, this is only used on number inputs,
    // as you can see by looking at all the things below that it's used for.
    // However, there's one special case, which is that we can return "min" or "max",
    // so we can't just always apply + to the result.
    let res = {
      'autobuyers-timer-length': () => this.readMaybeTime(y, true),
      'autobuyers-tier-requirement': () => this.readMaybeTime(y, false),
      'chroma-value': () => this.readMaybeTime(y, false),
      'craft-rarity': () => (y === 'max' || y === 'min') ? y : this.readMaybeTime(y, false),
      'oracle-display-time': () => this.readMaybeTime(y, true),
      'oracle-display-ticks': () => this.readMaybeTime(y, false),
      'next-dilated-amount': () => this.readMaybeTime(y, Galaxy.nextDilatedMode() === 'Seconds to reach cap'),
      'achievements-beyond-highest': () => this.readMaybeTime(y, false),
      'last-runs-to-show': () => this.readMaybeTime(y, false),
      'export-reminder': () => this.readMaybeTime(y, true),
      'offline-ticks': () => this.readMaybeTime(y, false),
      'lower-precision': () => this.readMaybeTime(y, false),
      'higher-precision': () => this.readMaybeTime(y, false),
      'input-precision': () => this.readMaybeTime(y, false),
    }[x]();
    if (res === 'min' || res === 'max') {
      return res;
    } else {
      return +res;
    }
  },
  format(x) {
    return {
      'autobuyers-timer-length': () => this.formatMaybeTime(Autobuyers.autobuyersTimerLength(), true),
      'autobuyers-tier-requirement': () => this.formatMaybeTime(Autobuyers.automaticallyCompleteChallengesTierRequirement(), false),
      'chroma-value': () => this.formatMaybeTime(Chroma.timeForChromaValue(), false),
      'craft-rarity': () => {
        let y = PowerShards.craftedRarityDisplay();
        return (y === 'max' || y === 'min') ? y : this.formatMaybeTime(y, false);
      },
      'oracle-display-time': () => this.formatMaybeTime(Oracle.displayTime(), true),
      'oracle-display-ticks': () => this.formatMaybeTime(Oracle.displayTicks(), false),
      'next-dilated-amount': () => this.formatMaybeTime(Galaxy.nextDilatedAmount(), Galaxy.nextDilatedMode() === 'Seconds to reach cap'),
      'achievements-beyond-highest': () => this.formatMaybeTime(Achievements.beyondHighest(), true),
      'last-runs-to-show': () => this.formatMaybeTime(Stats.lastRunsToShow(), false),
      'export-reminder': () => this.formatMaybeTime(Options.exportNotificationFrequency(), true),
      'offline-ticks': () => this.formatMaybeTime(Options.offlineTicks(), false),
      'lower-precision': () => this.formatMaybeTime(NotationOptions.lowerPrecision(), false),
      'higher-precision': () => this.formatMaybeTime(NotationOptions.higherPrecision(), false),
      'input-precision': () => this.formatMaybeTime(NotationOptions.inputPrecision(), false),
    }[x]();
  },
  notationChangeOthers(x = null) {
    if (x === null) {
      x = ['autobuyers-timer-length', 'autobuyers-tier-requirement', 'chroma-value', 'craft-rarity', 'oracle-display-time',
      'oracle-display-ticks', 'next-dilated-amount', 'achievements-beyond-highest', 'last-runs-to-show',
      'export-reminder', 'offline-ticks', 'lower-precision', 'higher-precision', 'input-precision'];
    }
    for (let i of x) {
      document.getElementsByClassName(i)[0].value = this.format(i);
    }
  }
}
