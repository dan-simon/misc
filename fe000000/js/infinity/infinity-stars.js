let InfinityStars = {
  amount() {
    return player.infinityStars;
  },
  addAmount(x) {
    player.infinityStars = player.infinityStars.plus(x);
    player.stats.totalInfinityStarsProducedThisFinality = player.stats.totalInfinityStarsProducedThisFinality.plus(x);
  },
  perSecond() {
    return InfinityGenerator(1).productionPerSecond();
  },
  exponent() {
    return InfinityUpgrade(2).effect();
  },
  multiplier() {
    return this.amount().pow(this.exponent());
  }
}
