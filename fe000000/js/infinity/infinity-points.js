let InfinityPoints = {
  amount() {
    return player.infinityPoints;
  },
  totalIPProducedThisEternity() {
    return player.stats.totalIPProducedThisEternity;
  },
  addAmount(x) {
    player.infinityPoints = player.infinityPoints.plus(x);
    player.stats.totalIPProduced = player.stats.totalIPProduced.plus(x);
    player.stats.totalIPProducedThisEternity = player.stats.totalIPProducedThisEternity.plus(x);
  },
  multiplier() {
    let mult = this.totalIPProducedThisEternity().div(4).plus(1);
    if (!InfinityChallenge.isInfinityChallengeCompleted(1)) {
      mult = mult.min(16);
    }
    return mult;
  }
}
