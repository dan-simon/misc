let Oracle = {
  isUnlocked() {
    return player.oracle.unlocked;
  },
  unlockCost() {
    return Decimal.pow(2, 256);
  },
  canUnlock() {
    return !this.isUnlocked() && player.complexityPoints.gte(this.unlockCost());
  },
  unlock(auto) {
    if (!this.canUnlock() || (
      auto && player.complexityPoints.minus(this.unlockCost()).lt(2) && ComplexityGenerator(1).bought() === 0)) return;
    player.complexityPoints = player.complexityPoints.safeMinus(this.unlockCost());
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
  powerDisplay() {
    return player.oracle.powerDisplay;
  },
  powers() {
    return player.oracle.powers;
  },
  toggleAlert() {
    player.oracle.alert = !player.oracle.alert;
  },
  togglePowerDisplay() {
    player.oracle.powerDisplay = !player.oracle.powerDisplay;
  },
  setTime(x) {
    player.oracle.time = x || 0;
  },
  invoke() {
    if (!this.isUnlocked()) return;
    let save = btoa(JSON.stringify(player));
    let time = this.time();
    Saving.oracleSimulateTime(time);
    complexityPoints = ComplexityPoints.amount();
    complexityPointGain = ComplexityPrestigeLayer.canComplexity() ?
      ComplexityPrestigeLayer.complexityPointGain() : new Decimal(0);
    complexityChallengeCompletions = ComplexityChallenge.getAllComplexityChallengeCompletions();
    powers = player.powers.stored;
    Saving.loadGame(save, null, true);
    player.oracle.used = true;
    player.oracle.timeSimulated = time;
    player.oracle.complexityPoints = complexityPoints;
    player.oracle.complexityPointGain = complexityPointGain;
    player.oracle.originalComplexityChallengeCompletions = ComplexityChallenge.getAllComplexityChallengeCompletions();
    player.oracle.complexityChallengeCompletions = complexityChallengeCompletions;
    player.oracle.powers = powers;
    if (this.alert()) {
      alert(this.message());
    }
  },
  message() {
    let messages = [this.complexityPointMessage(), this.complexityPointGainMessage(), this.complexityChallengeCompletionsMessage()];
    return 'After ' + formatMaybeInt(player.oracle.timeSimulated) + ' second' +
      pluralize(player.oracle.timeSimulated, '', 's') + ', you ' + coordinate('*', '', messages) + '.';
  },
  complexityPointMessage() {
    return 'will have ' + formatInt(player.oracle.complexityPoints) + ' ℂP';
  },
  complexityPointGainMessage() {
    return player.oracle.complexityPointGain.gt(0) ?
      ('will be able to gain ' + formatInt(player.oracle.complexityPointGain) + ' ℂP') : 'will not yet be able to complexity';
  },
  complexityChallengeCompletionsMessage() {
    // Note that we might, in theory, lose complexity challenge completions, if we finality.
    // I'm not sure if this can happen in practice but it seems worth mentioning.
    let gainedCompletions = [1, 2, 3, 4, 5, 6].map(
      i => player.oracle.complexityChallengeCompletions[i - 1] - player.oracle.originalComplexityChallengeCompletions[i - 1]);
    let completionText = gainedCompletions.map(
      (x, i) => x > 0 ? formatInt(x) + ' completion' + pluralize(x, '', 's') + ' of Complexity Challenge ' + (i + 1) : null);
    return coordinate('will have gained *', null, completionText);
  },
  messagePrequel() {
    if (this.isUsed()) {
      return 'The Oracle most recently said:';
    } else {
      return 'The Oracle has not said anything yet in this finality.';
    }
  }
}
