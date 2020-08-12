let FinalityStartingBenefits = {
  anyStartingBenefits() {
    return FinalityShards.totalUpgradeBonuses() > 0;
  },
  benefitAt(required, x) {
    if (x < required || player.finalities === 0) {
      return new Decimal(0);
    }
    return Decimal.pow(2, Math.pow(2, x - required));
  },
  stars() {
    return this.starsAt(FinalityShards.totalUpgradeBonuses());
  },
  starsAt(x) {
    return this.benefitAt(0, x);
  },
  infinityPoints() {
    return this.infinityPointsAt(FinalityShards.totalUpgradeBonuses());
  },
  infinityPointsAt(x) {
    return this.benefitAt(8, x);
  },
  eternityPoints() {
    return this.eternityPointsAt(FinalityShards.totalUpgradeBonuses());
  },
  eternityPointsAt(x) {
    return this.benefitAt(16, x);
  },
  complexityPoints() {
    return this.complexityPointsAt(FinalityShards.totalUpgradeBonuses());
  },
  complexityPointsAt(x) {
    return this.benefitAt(32, x);
  },
  complexities() {
    return this.complexitiesAt(FinalityShards.totalUpgradeBonuses());
  },
  complexitiesAt(x) {
    return Math.floor(Math.pow(Math.min(4, x / 4), 4));
  },
  complexityAchievements() {
    return this.complexityAchievementsAt(FinalityShards.totalUpgradeBonuses());
  },
  complexityAchievementsAt(x) {
    return Math.min(16, x);
  },
  anyComplexityStartingBenefits() {
    return this.complexityPoints().gt(0) || this.complexities() > 0 || this.complexityAchievements() > 0;
  },
  complexityStartingBenefitsDisplay() {
    let benefits = [];
    if (this.complexityPoints().gt(0)) {
      benefits.push(formatInt(this.complexityPoints()) + ' complexity point' + pluralize(this.complexityPoints(), '', 's'));
    }
    if (this.complexities() > 0) {
      benefits.push(formatInt(this.complexities()) + ' complexit' + pluralize(this.complexities(), 'y', 'ies'));
    }
    if (this.complexityAchievements() > 0) {
      benefits.push(formatInt(this.complexityAchievements()) + ' complexity achievement' + pluralize(this.complexityAchievements(), '', 's'));
    }
    return coordinate('*', '', benefits);
  },
  galaxies() {
    // Not really a starting benefit in the same sense.
    return this.galaxiesAt(FinalityShards.totalUpgradeBonuses());
  },
  galaxiesAt(x) {
    return Math.floor(x / 4);
  },
  anyGalaxies() {
    return this.galaxies() > 0;
  }
}
