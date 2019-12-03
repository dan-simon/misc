let InfinityPoints = {
  amount() {
    return player.infinityPoints;
  },
  addAmount(x) {
    player.infinityPoints = player.infinityPoints.plus(x);
    player.stats.totalIPProduced = player.stats.totalIPProduced.plus(x);
  },
  multiplier() {
    let mult = this.amount().div(4).plus(1);
    if (!InfinityChallenge.isInfinityChallengeCompleted(1)) {
      mult = mult.min(16);
    }
    return mult;
  }
}
