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
  complexityChallengeRewardExtraComplexityStarPower(x) {
    // Note that if x is undefined, this returns the default value, as desired.
    if (x === 6 && FinalityMilestones.isFinalityMilestoneActive(5)) {
      return Powers.effectOfBestComplexityPowers() / Powers.getTotalEffect('complexity');
    } else {
      return 1
    }
  },
  complexityChallengeRewardAmount(x) {
    return this.amount().pow(this.complexityChallengeRewardExtraComplexityStarPower(x));
  },
  complexityChallengeRewardMultiplier(x) {
    return Math.sqrt(this.complexityChallengeRewardAmount(x).log(2));
  },
  complexityChallengeRewardStarsToActualStars(stars, x) {
    return stars.pow(1 / this.complexityChallengeRewardExtraComplexityStarPower(x));
  }
}
