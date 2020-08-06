let FinalityStartingBenefits = {
  benefit(required) {
    if (FinalityShards.totalUpgradeBonuses() < required || player.finalities === 0) {
      return new Decimal(0);
    }
    return Decimal.pow(2, Math.pow(2, FinalityShards.totalUpgradeBonuses() - required));
  },
  stars() {
    return this.benefit(0);
  },
  infinityPoints() {
    return this.benefit(8);
  },
  eternityPoints() {
    return this.benefit(16);
  },
  complexityPoints() {
    return this.benefit(32);
  },
  complexities() {
    return Math.pow(Math.min(16, FinalityShards.totalUpgradeBonuses()), 2);
  }
}
