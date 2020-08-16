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
  doComplexityStarsDoAnything() {
    return player.complexities > 0 || ComplexityGenerator(1).bought() > 0;
  },
  complexityChallengeRewardExtraComplexityStarPower(x) {
    // Note that if x is undefined, this returns the default value, as desired.
    if (x === 6 && FinalityMilestones.isFinalityMilestoneActive(5)) {
      return Powers.effectOfBestComplexityPowers() / Powers.getTotalEffect('complexity');
    } else {
      return 1;
    }
  },
  complexityChallengeRewardAmount(x) {
    return this.amount().pow(this.complexityChallengeRewardExtraComplexityStarPower(x));
  },
  complexityChallengeRewardMultiplier(x) {
    return this.doComplexityStarsDoAnything() ? Math.sqrt(this.complexityChallengeRewardAmount(x).log(2)) : 0;
  },
  complexityChallengeRewardStarsToActualStars(stars, x) {
    return stars.pow(1 / this.complexityChallengeRewardExtraComplexityStarPower(x));
  }
}
