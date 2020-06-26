let Stats = {
  addToTimeStats(diff) {
    player.stats.timeSincePurchase += diff;
    player.stats.timeSinceSacrifice += diff;
    player.stats.timeSincePrestige += diff;
    player.stats.timeSinceInfinity += diff;
    player.stats.timeSinceEternity += diff;
    player.stats.timeSinceComplexity += diff;
    player.stats.timeSinceGameStart += diff;
    player.stats.timeSinceLastPeakIPPerSec += diff;
    player.stats.timeSinceLastPeakEPPerSec += diff;
    player.stats.timeSinceLastPeakCPPerSec += diff;
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
  }
}
