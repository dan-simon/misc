let ComplexityStars = {
  amount() {
    return player.complexityStars;
  },
  addAmount(x) {
    player.complexityStars = player.complexityStars.plus(x);
    player.stats.totalComplexityStarsProducedThisFinality = player.stats.totalComplexityStarsProducedThisFinality.plus(x);
  },
  perSecond() {
    return ComplexityGenerator(1).productionPerSecond();
  },
  complexityChallengeMultiplier() {
    return Math.sqrt(this.amount().log(2));
  }
}
