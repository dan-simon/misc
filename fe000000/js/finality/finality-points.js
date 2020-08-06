let FinalityPoints = {
  amount() {
    return player.finalityPoints;
  },
  totalFPProduced() {
    return player.stats.totalFPProduced;
  },
  addAmount(x) {
    player.finalityPoints = player.finalityPoints.plus(x);
    player.stats.totalFPProduced = player.stats.totalFPProduced.plus(x);
  }
}
