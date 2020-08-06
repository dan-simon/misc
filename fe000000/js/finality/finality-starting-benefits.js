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
  anyComplexities() {
    // This exists because having a greater-than sign in HTML isn't great.
    return this.complexities() > 0;
  }
}
