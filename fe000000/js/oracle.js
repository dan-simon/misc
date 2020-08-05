let Oracle = {
  isUnlocked() {
    return player.oracle.unlocked;
  },
  unlockCost() {
    return Decimal.pow(2, 256);
  },
  canUnlock() {
    return player.complexityPoints.gte(this.unlockCost());
  },
  unlock() {
    if (!this.canUnlock()) return;
    player.complexityPoints = player.complexityPoints.minus(this.unlockCost());
    player.oracle.unlocked = true;
  },
  maxTime() {
    return Math.pow(2, 16);
  },
  time() {
    return Math.min(Math.max(0, player.oracle.time), this.maxTime());
  },
  isUsed() {
    return player.oracle.used;
  },
  alert() {
    return player.oracle.alert;
  },
  powers() {
    return player.oracle.powers;
  },
  toggleAlert() {
    player.oracle.alert = !player.oracle.alert;
  },
  setTime(x) {
    player.oracle.time = x || 0;
  },
  invoke() {
    let save = btoa(JSON.stringify(player));
    let time = this.time();
    Saving.oracleSimulateTime(time);
    complexityPoints = ComplexityPoints.amount();
    complexityPointGain = ComplexityPrestigeLayer.canComplexity() ?
      ComplexityPrestigeLayer.complexityPointGain() : new Decimal(0);
    powers = player.powers.stored;
    Saving.loadGame(save, null, true);
    player.oracle.used = true;
    player.oracle.timeSimulated = time;
    player.oracle.complexityPoints = complexityPoints;
    player.oracle.complexityPointGain = complexityPointGain;
    player.oracle.powers = powers;
    if (this.alert()) {
      alert(this.shortMessage());
    }
  },
  shortMessage() {
    let ending = player.oracle.complexityPointGain.gt(0) ?
      ('be able to gain ' + formatInt(player.oracle.complexityPointGain) + ' ℂP.') : 'not yet be able to complexity.';
    return 'After ' + formatMaybeInt(player.oracle.timeSimulated) + ' second' +
      pluralize(player.oracle.timeSimulated, '', 's') + ', you will have ' +
      formatInt(player.oracle.complexityPoints) + ' ℂP and will ' + ending;
  },
  longMessage() {
    if (this.isUsed()) {
      return 'The Oracle most recently said "' + this.shortMessage() + '"';
    } else {
      return 'The Oracle has not said anything.'
    }
  }
}
