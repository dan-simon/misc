let InfinityPoints = {
  amount() {
    return player.infinityPoints;
  },
  addAmount(x) {
    player.infinityPoints = player.infinityPoints.plus(x);
  },
  multiplier() {
    if (this.amount().gt(8)) {
      return this.amount().log(2);
    } else {
      return this.amount().div(4).plus(1);
    }
  }
}
