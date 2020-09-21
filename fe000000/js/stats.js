let Stats = {
  addToTimeStats(diff) {
    player.stats.timeSincePurchase += diff;
    player.stats.timeSinceSacrifice += diff;
    player.stats.timeSincePrestige += diff;
    player.stats.timeSinceInfinity += diff;
    player.stats.timeSinceEternity += diff;
    player.stats.timeSinceFinality += diff;
    player.stats.timeSinceAutoECCompletion += diff;
    player.stats.timeSincePermanenceGain += diff;
    player.stats.timeSinceComplexity += diff;
    player.stats.timeSinceGameStart += diff;
    player.stats.timeSinceLastPeakIPPerSec += diff;
    player.stats.timeSinceLastPeakEPPerSec += diff;
    player.stats.timeSinceLastPeakCPPerSec += diff;
    player.stats.timeSincePowerGain += diff;
    ComplexityChallenge.addToTimeStats(diff);
  },
  recordPurchase(i, n) {
    player.stats.timeSincePurchase = 0;
    player.stats.purchasesThisInfinity += n;
    player.stats.purchasesThisInfinityByType[i] += n;
  },
  addInfinity(time, gain) {
    player.stats.fastestInfinity = Math.min(time, player.stats.fastestInfinity);
    player.stats.lastTenInfinities.unshift([time, gain, gain.div(time)]);
    player.stats.lastTenInfinities.pop();
  },
  addEternity(time, gain) {
    player.stats.fastestEternity = Math.min(time, player.stats.fastestEternity);
    player.stats.lastTenEternities.unshift([time, gain, gain.div(time)]);
    player.stats.lastTenEternities.pop();
  },
  addComplexity(time, gain) {
    player.stats.fastestComplexity = Math.min(time, player.stats.fastestComplexity);
    player.stats.lastTenComplexities.unshift([time, gain, gain.div(time)]);
    player.stats.lastTenComplexities.pop();
  },
  addFinality(time, pointGain, shardGain) {
    player.stats.fastestFinality = Math.min(time, player.stats.fastestFinality);
    player.stats.lastTenFinalities.unshift([time, pointGain, shardGain]);
    player.stats.lastTenFinalities.pop();
  },
  lastRunsToShow() {
    return player.stats.lastRunsToShow;
  },
  setLastRunsToShow(x) {
    player.stats.lastRunsToShow = Math.min(10, Math.max(0, x || 0));
  },
  setShowRunType(layer, b) {
    player.stats.lastRunTypesToShow[layer] = b;
  },
  key(layer) {
    return 'lastTen' + layer[0].toUpperCase() + layer.slice(1, -1) + 'ies';
  },
  showAnyRuns(x) {
    return this.lastRunsToShow() >= x;
  },
  showRunType(layer) {
    return player.stats.lastRunTypesToShow[layer];
  },
  showRun(x, layer) {
    return this.showAnyRuns(x) && this.showRunType(layer) && player.stats[this.key(layer)][x - 1][0] !== -1;
  }
}
