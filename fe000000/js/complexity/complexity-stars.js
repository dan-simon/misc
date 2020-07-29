let ComplexityStars = {
  amount() {
    return player.complexityStars;
  },
  addAmount(x) {
    player.complexityStars = player.complexityStars.plus(x);
    player.stats.totalComplexityStarsProduced = player.stats.totalComplexityStarsProduced.plus(x);
  },
  perSecond() {
    return ComplexityGenerator(1).productionPerSecond();
  },
  complexityChallengeMultiplier() {
    return Math.sqrt(this.amount().log(2));
  }
}
