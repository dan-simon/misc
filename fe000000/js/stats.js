let Stats = {
  addToTimeStats(diff) {
    player.stats.timeSincePurchase += diff;
    player.stats.timeSinceSacrifice += diff;
    player.stats.timeSincePrestige += diff;
    player.stats.timeSinceInfinity += diff;
    player.stats.timeSinceGameStart += diff;
  },
  recordPurchase(n) {
    player.stats.timeSincePurchase = 0;
    player.stats.purchasesThisInfinity += n;
  }
}
