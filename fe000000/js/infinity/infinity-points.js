let InfinityPoints = {
  amount() {
    return player.infinityPoints;
  },
  addAmount(x) {
    player.infinityPoints = player.infinityPoints.plus(x);
    player.stats.totalIPProduced = player.stats.totalIPProduced.plus(x);
  },
  multiplier() {
    return this.amount().div(4).plus(1);
  }
}
