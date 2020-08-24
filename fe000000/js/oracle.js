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
  displayTime() {
    return player.oracle.time;
  },
  time() {
    return Math.min(Math.max(0, player.oracle.time), this.maxTime());
  },
  maxTicks() {
    return Math.pow(2, 16);
  },
  defaultTicks() {
    return 1024;
  },
  displayTicks() {
    return player.oracle.ticks;
  },
  ticks() {
    return Math.min(Math.max(1, Math.floor(player.oracle.ticks)), this.maxTicks());
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
  powerFutureExtraMultipliers() {
    return player.oracle.powerFutureExtraMultipliers;
  },
  powers() {
    return player.oracle.powers;
  },
  extraMultipliers() {
    return player.oracle.extraMultipliers;
  },
  toggleAlert() {
    player.oracle.alert = !player.oracle.alert;
  },
  togglePowerDisplay() {
    player.oracle.powerDisplay = !player.oracle.powerDisplay;
  },
  togglePowerFutureExtraMultipliers() {
    player.oracle.powerFutureExtraMultipliers= !player.oracle.powerFutureExtraMultipliers;
  },
  setTime(x) {
    player.oracle.time = x || 0;
  },
  setTicks(x) {
    player.oracle.ticks = x || 1;
  },
  invoke() {
    if (!this.isUnlocked()) return;
    let save = btoa(JSON.stringify(player));
    let time = this.time();
    let ticks = this.ticks();
    Saving.oracleSimulateTime(time, ticks);
    let complexityPoints = ComplexityPoints.amount();
    let complexityPointGain = ComplexityPrestigeLayer.canComplexity() ?
      ComplexityPrestigeLayer.complexityPointGain() : new Decimal(0);
    let complexityChallengeCompletions = ComplexityChallenge.getAllComplexityChallengeCompletions();
    let finalities = Finalities.amount();
    let finalityShards = FinalityShards.total();
    let powers = player.powers.stored.map(p => Powers.makeFuture(p));
    let extraMultipliers = Powers.getAllExtraMultipliers();
    Saving.loadGame(save, null, true);
    player.oracle.used = true;
    player.oracle.timeSimulated = time;
    player.oracle.ticksSimulated = ticks;
    player.oracle.complexityPoints = complexityPoints;
    player.oracle.complexityPointGain = complexityPointGain;
    player.oracle.originalComplexityChallengeCompletions = ComplexityChallenge.getAllComplexityChallengeCompletions();
    player.oracle.complexityChallengeCompletions = complexityChallengeCompletions;
    player.oracle.originalFinalities = Finalities.amount();
    player.oracle.finalities = finalities;
    player.oracle.originalFinalityShards = FinalityShards.total();
    player.oracle.finalityShards = finalityShards;
    player.oracle.powers = powers;
    player.oracle.extraMultipliers = extraMultipliers;
    if (this.alert()) {
      alert(this.message());
    }
  },
  message() {
    let messages = [
      this.complexityPointMessage(), this.complexityPointGainMessage(),
      this.complexityChallengeCompletionsMessage(), this.finalityMessage()
    ];
    return 'After ' + formatMaybeInt(player.oracle.timeSimulated) + ' second' +
      pluralize(player.oracle.timeSimulated, '', 's') + ' and ' + formatMaybeInt(player.oracle.ticksSimulated) + ' tick' +
      pluralize(player.oracle.ticksSimulated, '', 's') + ', you ' + coordinate('*', '', messages) + '.';
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
  finalityMessage() {
    if (player.oracle.finalities === player.oracle.originalFinalities) {
      return null;
    }
    return 'will have gained ' + formatInt(player.oracle.finalities - player.oracle.originalFinalities) +
      ' finalit' + pluralize(player.oracle.finalities - player.oracle.originalFinalities, 'y', 'ies') +
      ' and ' + formatInt(player.oracle.finalityShards - player.oracle.originalFinalityShards) +
      ' finality shard' + pluralize(player.oracle.finalityShards - player.oracle.originalFinalityShards, '', 's');
  },
  messagePrequel() {
    if (this.isUsed()) {
      return 'The Oracle most recently said:';
    } else {
      return 'The Oracle has not said anything yet in this finality.';
    }
  }
}
