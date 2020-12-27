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
  powerGainInPredictions() {
    return player.oracle.powerGainInPredictions;
  },
  powerFutureExtraMultipliers() {
    return player.oracle.powerFutureExtraMultipliers;
  },
  showWaitsFromPastTime() {
    return player.oracle.showWaitsFromPastTime;
  },
  powers() {
    return player.oracle.powers;
  },
  activePowers() {
    return player.oracle.activePowers;
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
  toggleShowWaitsFromPastTime() {
    player.oracle.showWaitsFromPastTime = !player.oracle.showWaitsFromPastTime;
  },
  setTime(x) {
    player.oracle.time = x || 0;
  },
  setTicks(x) {
    player.oracle.ticks = x || 1;
  },
  invoke() {
    if (!this.isUnlocked()) return;
    if (blocked) {
      alert('This is an evanescent simulation. Recursing within it is forbidden due to ' + 
        'the damage it may cause to the space-time continuum.');
      return;
    }
    let originalTime = player.stats.timeSinceGameStart;
    let save = Saving.encode(player);
    if (this.powerGainInPredictions() !== 'Same') {
      player.powers.gain = {'Off': false, 'On': true}[this.powerGainInPredictions()];
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
      let activePowers = player.powers.active.map(p => Powers.makeFuture(p, originalTime));
      let powers = player.powers.stored.map(p => Powers.makeFuture(p, originalTime));
      let extraMultipliers = Powers.getAllExtraMultipliers();
      Saving.loadGame(save, null, true, function () {
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
        player.oracle.activePowers = activePowers;
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
      this.complexityPointMessage(), this.complexityPointGainMessage(), this.otherThingsMessage(),
    ];
    return 'After ' + formatTime(player.oracle.timeSimulated, {seconds: {f: formatMaybeInt, s: true}, larger: {f: formatMaybeInt, s: true}}) +
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
  complexityChallengeCompletionsGainText() {
    // Note that we might, in theory, lose complexity challenge completions, if we finality.
    // I'm not sure if this can happen in practice but it seems worth mentioning.
    let gainedCompletions = [1, 2, 3, 4, 5, 6].map(
      i => player.oracle.complexityChallengeCompletions[i - 1] - player.oracle.originalComplexityChallengeCompletions[i - 1]);
    let completionText = gainedCompletions.map(
      (x, i) => x > 0 ? formatInt(x) + ' completion' + pluralize(x, '', 's') + ' of Complexity Challenge ' + (i + 1) : null);
    return coordinate('*', null, completionText);
  },
  powerShardGainText() {
    if (player.oracle.PowerShards === player.oracle.originalPowerShards) {
      return null;
    }
    return format(player.oracle.powerShards - player.oracle.originalPowerShards) +
      ' power shard' + pluralize(player.oracle.powerShards - player.oracle.originalPowerShards, '', 's');
  },
  galaxyGainText() {
    if (player.oracle.galaxies === player.oracle.originalGalaxies) {
      return null;
    }
    return formatInt(player.oracle.galaxies - player.oracle.originalGalaxies) +
      ' galax' + pluralize(player.oracle.galaxies - player.oracle.originalGalaxies, 'y', 'ies');
  },
  finalityGainText() {
    if (player.oracle.finalities === player.oracle.originalFinalities) {
      return null;
    }
    return formatInt(player.oracle.finalities - player.oracle.originalFinalities) +
      ' finalit' + pluralize(player.oracle.finalities - player.oracle.originalFinalities, 'y', 'ies');
  },
  finalityShardGainText() {
    if (player.oracle.finalityShards === player.oracle.originalFinalityShards) {
      return null;
    }
    return formatInt(player.oracle.finalityShards - player.oracle.originalFinalityShards) +
    ' finality shard' + pluralize(player.oracle.finalityShards - player.oracle.originalFinalityShards, '', 's');
  },
  otherThingsMessage() {
    return coordinate('will have gained *', null, [
      this.complexityChallengeCompletionsGainText(), this.powerShardGainText(),
      this.galaxyGainText(), this.finalityGainText(), this.finalityShardGainText(),
    ]);
  },
  messagePrequel() {
    if (this.isUsed()) {
      let timeString = formatTime(player.stats.timeSinceOraclePrediction, {seconds: {f: format, s: false}, larger: {f: format, s: false}});
      return 'The Oracle most recently said (' + timeString + ' ago):';
    } else {
      return 'The Oracle has not said anything yet in this finality.';
    }
  }
}
