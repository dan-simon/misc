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
  complexityChallengeRewardAmount(x) {
    // Note that if x is undefined, this returns the default value, as desired.
    if (x === 6 && FinalityMilestones.isFinalityMilestoneActive(5)) {
      return Powers.complexityStarsForFinalityMilestone5();
    } else {
      return this.amount();
    }
  },
  complexityChallengeRewardMultiplier(x) {
    return Math.sqrt(this.complexityChallengeRewardAmount(x).log(2));
  }
}
