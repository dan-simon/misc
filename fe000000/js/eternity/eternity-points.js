let EternityPoints = {
  amount() {
    return player.eternityPoints;
  },
  totalEPProduced() {
    return player.stats.totalEPProduced;
  },
  addAmount(x) {
    player.eternityPoints = player.eternityPoints.plus(x);
    player.stats.totalEPProduced = player.stats.totalEPProduced.plus(x);
  }
}
