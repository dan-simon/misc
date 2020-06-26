let EternityPoints = {
  amount() {
    return player.eternityPoints;
  },
  totalEPProduced() {
    return player.stats.totalEPProduced;
  },
  totalEPProducedThisComplexity() {
    return player.stats.totalEPProducedThisComplexity;
  },
  addAmount(x) {
    player.eternityPoints = player.eternityPoints.plus(x);
    player.stats.totalEPProduced = player.stats.totalEPProduced.plus(x);
  }
}
