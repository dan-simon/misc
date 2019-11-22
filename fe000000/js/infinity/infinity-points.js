let InfinityPoints = {
  amount() {
    return player.infinityPoints;
  },
  addAmount(x) {
    player.infinityPoints = player.infinityPoints.plus(x);
    player.stats.totalIPProduced = player.stats.totalIPProduced.plus(x);
  },
  multiplier() {
    if (this.amount().gt(32)) {
      return this.amount().log(2) * 2 - 1;
    } else {
      return this.amount().div(4).plus(1);
    }
  }
}
