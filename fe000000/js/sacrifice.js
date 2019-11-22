let Sacrifice = {
  sacrificeMultiplier() {
    return player.sacrificeMultiplier;
  },
  setSacrificeMultiplier(x) {
    player.sacrificeMultiplier = x;
  },
  sacrificeRequirement() {
    return Decimal.pow(2, 16 * (Challenge.isChallengeRunning(10) ? 1 : this.sacrificeMultiplier().toNumber()));
  },
  canSacrifice() {
    return Generator(8).amount().gt(0) && player.stars.gte(this.sacrificeRequirement()) && !InfinityPrestigeLayer.mustInfinity();
  },
  isVisible() {
    return this.canSacrifice() || this.sacrificeMultiplier().gt(1) || player.infinities > 0;
  },
  newSacrificeMultiplier() {
    let mult = new Decimal(player.stars.log(2) / 16);
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
      player.stars = new Decimal(2);
      player.boost = {bought: 0};
      player.generators = initialGenerators();
      player.highestGenerator = 0;
    } else {
      Generators.resetAmounts(7);
    }
    player.stats.timeSincePurchase = 0;
    player.stats.timeSinceSacrifice = 0;
  }
}
