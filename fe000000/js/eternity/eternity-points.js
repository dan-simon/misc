let EternityPoints = {
  amount() {
    return player.eternityPoints;
  },
  addAmount(x) {
    player.eternityPoints = player.eternityPoints.plus(x);
    player.stats.totalEPProduced = player.stats.totalEPProduced.plus(x);
  }
}
