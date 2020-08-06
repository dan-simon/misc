let ComplexityPoints = {
  amount() {
    return player.complexityPoints;
  },
  totalCPProduced() {
    return player.stats.totalCPProduced;
  },
  totalCPProducedThisFinality() {
    return player.stats.totalCPProducedThisFinality;
  },
  addAmount(x) {
    player.complexityPoints = player.complexityPoints.plus(x);
    player.stats.totalCPProduced = player.stats.totalCPProduced.plus(x);
    player.stats.totalCPProducedThisFinality = player.stats.totalCPProducedThisFinality.plus(x);
  }
}
