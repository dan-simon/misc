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
    return Math.min(Math.max(1, player.oracle.time), this.maxTime());
  },
  maxTicks() {
    return Math.pow(2, 20);
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
  powerGainInPredictions() {
    return player.oracle.powerGainInPredictions;
  },
  powerFutureExtraMultipliers() {
    return player.oracle.powerFutureExtraMultipliers;
  },
  powers() {
    return player.oracle.powers;
  },
  equippedPowers() {
    return player.oracle.equippedPowers;
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
  nextPowerGainInPredictions() {
    let settings = ['Same', 'On', 'Off'];
    player.oracle.powerGainInPredictions = settings[(settings.indexOf(player.oracle.powerGainInPredictions) + 1) % 3]
  },
  togglePowerFutureExtraMultipliers() {
    player.oracle.powerFutureExtraMultipliers = !player.oracle.powerFutureExtraMultipliers;
  },
  setTime(x) {
    player.oracle.time = x || 0;
  },
  setTicks(x) {
    player.oracle.ticks = x || 1;
  },
  invoke() {
    if (!this.isUnlocked()) {
      // This button is grey when the Oracle isn't unlocked, even if it's visible,
      // so it's reasonable to just return.
      return;
    }
    if (blocked) {
      alert('This is an evanescent simulation. Recursing within it is forbidden due to ' + 
        'the damage it may cause to the space-time continuum.');
      return;
    }
    let originalTime = player.stats.timeSinceGameStart;
    let save = Saving.encode(player);
    if (this.powerGainInPredictions() !== 'Same') {
      Powers.setPowerGain({'Off': false, 'On': true}[this.powerGainInPredictions()]);
    }
    player.oracle.isPredicting = true;
    let time = this.time();
    let ticks = this.ticks();
    Saving.oracleSimulateTime(time, ticks, function () {
      let complexityPoints = ComplexityPoints.amount();
      let complexityPointGain = ComplexityPrestigeLayer.canComplexity() ?
        ComplexityPrestigeLayer.complexityPointGain() : new Decimal(0);
      let complexityChallengeCompletions = ComplexityChallenge.getAllComplexityChallengeCompletions();
      let powerShards = PowerShards.amount();
      let galaxies = Galaxy.amount();
      let finalities = Finalities.amount();
      let finalityShards = FinalityShards.total();
      let equippedPowers = player.powers.equipped;
      let powers = player.powers.stored;
      let extraMultipliers = Powers.getAllExtraMultipliers();
      Saving.loadGame(save, null, null, true, function () {
        player.oracle.used = true;
        player.oracle.timeSimulated = time;
        player.oracle.ticksSimulated = ticks;
        player.oracle.complexityPoints = complexityPoints;
        player.oracle.complexityPointGain = complexityPointGain;
        player.oracle.originalComplexityChallengeCompletions = ComplexityChallenge.getAllComplexityChallengeCompletions();
        player.oracle.complexityChallengeCompletions = complexityChallengeCompletions;
        player.oracle.originalPowerShards = PowerShards.amount();
        player.oracle.powerShards = powerShards;
        player.oracle.originalGalaxies = Galaxy.amount();
        player.oracle.galaxies = galaxies;
        player.oracle.originalFinalities = Finalities.amount();
        player.oracle.finalities = finalities;
        player.oracle.originalFinalityShards = FinalityShards.total();
        player.oracle.finalityShards = finalityShards;
        player.oracle.equippedPowers = equippedPowers;
        player.oracle.powers = powers;
        player.oracle.extraMultipliers = extraMultipliers;
        player.stats.timeSinceOraclePrediction = 0;
        if (Oracle.alert()) {
          alert(Oracle.message());
        }
      });
    });
  },
  message() {
    let messages = [
      this.complexityPointMessage(), this.complexityPointGainMessage(), this.otherThingsGainMessage(), this.otherThingsLossMessage()
    ];
    return 'After ' + formatTime(player.oracle.timeSimulated, {seconds: {f: formatTimeMaybeInt, s: true}, larger: {f: formatTimeMaybeInt, s: true}}) +
      ' and ' + formatMaybeInt(player.oracle.ticksSimulated) + ' tick' +
      pluralize(player.oracle.ticksSimulated, '', 's') + ', you ' + coordinate('*', '', messages) + '.';
  },
  complexityPointMessage() {
    return 'will have ' + formatInt(player.oracle.complexityPoints) + ' ℂP';
  },
  complexityPointGainMessage() {
    return player.oracle.complexityPointGain.gt(0) ?
      ('will be able to gain ' + formatInt(player.oracle.complexityPointGain) + ' ℂP') : 'will not yet be able to complexity';
  },
  complexityChallengeCompletionsChangeText(gain) {
    // Note that we can lose complexity challenge completions, if we finality.
    let gainedCompletions = [1, 2, 3, 4, 5, 6].map(
      i => player.oracle.complexityChallengeCompletions[i - 1] - player.oracle.originalComplexityChallengeCompletions[i - 1]);
    let completionText = gainedCompletions.map(x => x * (gain ? 1 : -1)).map(
      (x, i) => x > 0 ? formatInt(x) + ' completion' + pluralize(x, '', 's') + ' of Complexity Challenge ' + (i + 1) : null);
    return coordinate('*', null, completionText);
  },
  powerShardChangeText(gain) {
    let diff = (player.oracle.powerShards - player.oracle.originalPowerShards) * (gain ? 1 : -1);
    if (diff <= 0) {
      return null;
    }
    return format(diff) + ' power shard' + pluralize(diff, '', 's');
  },
  galaxyChangeText(gain) {
    let diff = (player.oracle.galaxies - player.oracle.originalGalaxies) * (gain ? 1 : -1);
    if (diff <= 0) {
      return null;
    }
    return formatInt(diff) + ' galax' + pluralize(diff, 'y', 'ies');
  },
  finalityChangeText(gain) {
    let diff = (player.oracle.finalities - player.oracle.originalFinalities) * (gain ? 1 : -1);
    if (diff <= 0) {
      return null;
    }
    return formatInt(diff) + ' finalit' + pluralize(diff, 'y', 'ies');
  },
  finalityShardChangeText(gain) {
    let diff = (player.oracle.finalityShards - player.oracle.originalFinalityShards) * (gain ? 1 : -1);
    if (diff <= 0) {
      return null;
    }
    return formatInt(diff) + ' finality shard' + pluralize(diff, '', 's');
  },
  otherThingsGainMessage() {
    return coordinate('will have gained *', null, [
      this.complexityChallengeCompletionsChangeText(true), this.powerShardChangeText(true),
      this.galaxyChangeText(true), this.finalityChangeText(true), this.finalityShardChangeText(true),
    ]);
  },
  otherThingsLossMessage() {
    let hasGainedFinalities = player.oracle.finalities > player.oracle.originalFinalities;
    // Nothing but power shard autobuyers should be able to decrease anything during a finality.
    let cause = hasGainedFinalities ? 'finality' : 'power shard autobuyers';
    return coordinate('will have lost * (due to ' + cause + ')', null, [
      this.complexityChallengeCompletionsChangeText(false), this.powerShardChangeText(false),
      this.galaxyChangeText(false), this.finalityChangeText(false), this.finalityShardChangeText(false),
    ]);
  },
  messagePrequel() {
    if (this.isUsed()) {
      let timeString = formatTime(player.stats.timeSinceOraclePrediction, {seconds: {f: formatTimeNum, s: false}, larger: {f: formatTimeNum, s: false}});
      return 'The Oracle most recently said (' + timeString + ' ago):';
    } else {
      return 'The Oracle has not said anything yet in this finality.';
    }
  }
}
