let Sacrifice = {
  sacrificeMultiplier() {
    return player.sacrificeMultiplier;
  },
  setSacrificeMultiplier(x) {
    player.sacrificeMultiplier = x;
  },
  hasStrongerSacrifice() {
    return InfinityChallenge.isInfinityChallengeRunning(2) || InfinityChallenge.isInfinityChallengeCompleted(2);
  },
  sacrificeExponent() {
    if (InfinityChallenge.isInfinityChallengeRunning(2)) {
      return 1 / 8;
    } else if (InfinityChallenge.isInfinityChallengeCompleted(2)) {
      return 1 / 64;
    } else {
      return 0;
    }
  },
  sacrificeRequirement() {
    let req = Decimal.pow(2, 16 * (Challenge.isChallengeRunning(10) ? 1 : this.sacrificeMultiplier().toNumber()));
    if (this.hasStrongerSacrifice()) {
      req = req.min(this.sacrificeMultiplier().pow(1 / this.sacrificeExponent()));
    }
    return req;
  },
  canSacrifice() {
    return Generator(8).amount().gt(0) && player.stars.gte(this.sacrificeRequirement()) && !InfinityPrestigeLayer.mustInfinity();
  },
  isVisible() {
    return this.canSacrifice() || this.sacrificeMultiplier().gt(1) || player.infinities > 0;
  },
  newSacrificeMultiplier() {
    let mult = new Decimal(player.stars.log(2) / 16);
    if (this.hasStrongerSacrifice()) {
      mult = mult.max(player.stars.pow(this.sacrificeExponent()));
    }
    if (Challenge.isChallengeRunning(10)) {
      mult = mult.times(this.sacrificeMultiplier());
    }
    return this.canSacrifice() ? mult : this.sacrificeMultiplier();
  },
  sacrificeMultiplierGain() {
    return this.newSacrificeMultiplier().minus(this.sacrificeMultiplier());
  },
  sacrificeMultiplierMultGain() {
    return this.newSacrificeMultiplier().div(this.sacrificeMultiplier());
  },
  sacrifice() {
    if (!this.canSacrifice()) return;
    this.setSacrificeMultiplier(this.newSacrificeMultiplier());
    this.sacrificeReset();
  },
  sacrificeReset() {
    if (Challenge.isChallengeRunning(10)) {
      // Challenge 10 overrides Eternity Milestone 4.
      player.stars = EternityStartingBenefits.stars();
      player.boost = {bought: 0};
      player.generators = initialGenerators();
      player.highestGenerator = 0;
    } else if (!EternityMilestones.isEternityMilestoneActive(4)) {
      Generators.resetAmounts(7);
    }
    player.stats.timeSincePurchase = 0;
    player.stats.timeSinceSacrifice = 0;
  }
}
