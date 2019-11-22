let Stats = {
  addToTimeStats(diff) {
    player.stats.timeSincePurchase += diff;
    player.stats.timeSinceSacrifice += diff;
    player.stats.timeSincePrestige += diff;
    player.stats.timeSinceInfinity += diff;
    player.stats.timeSinceGameStart += diff;
    player.stats.timeSinceLastPeakIPPerSec += diff;
  },
  recordPurchase(n) {
    player.stats.timeSincePurchase = 0;
    player.stats.purchasesThisInfinity += n;
  },
  addInfinity(time, gain) {
    player.stats.fastestInfinity = Math.min(time, player.stats.fastestInfinity);
    player.stats.lastTenInfinities.unshift([time, gain, gain.div(time)]);
    player.stats.lastTenInfinities.pop();
  }
}
