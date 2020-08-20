let ComplexityStars = {
  amount() {
    return player.complexityStars;
  },
  addAmount(x) {
    let oldExtraAmount = ComplexityStars.extraAmount();
    player.complexityStars = player.complexityStars.plus(x);
    let gainForTotal = ComplexityStars.extraAmount().minus(oldExtraAmount);
    player.stats.totalComplexityStarsProducedThisFinality = player.stats.totalComplexityStarsProducedThisFinality.plus(gainForTotal);
  },
  perSecond() {
    return ComplexityGenerator(1).productionPerSecond();
  },
  doComplexityStarsDoAnything() {
    return player.complexities > 0 || ComplexityGenerator(1).bought() > 0;
  },
  extraComplexityStarPower() {
    if (FinalityMilestones.isFinalityMilestoneActive(5)) {
      return Powers.effectOfBestComplexityPowers() / Powers.getTotalEffect('complexity');
    } else {
      return 1;
    }
  },
  extraAmount() {
    return this.amount().pow(this.extraComplexityStarPower());
  },
  complexityChallengeRewardExtraComplexityStarPower(x) {
    // Note that if x is undefined, this returns the default value, as desired.
    if (x === 6) {
      return this.extraComplexityStarPower();
    } else {
      return 1;
    }
  },
  complexityChallengeRewardAmount(x) {
    return this.amount().pow(this.complexityChallengeRewardExtraComplexityStarPower(x));
  },
  complexityChallengeRewardMultiplier(x) {
    return this.doComplexityStarsDoAnything() ? Math.sqrt(this.complexityChallengeRewardAmount(x).log(2)) : 0;
  }
}
