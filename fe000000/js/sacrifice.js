let Sacrifice = {
  sacrificeMultiplier() {
    return player.sacrificeMultiplier;
  },
  setSacrificeMultiplier(x) {
    player.sacrificeMultiplier = x;
  },
  sacrificeRequirement() {
    return Decimal.pow(2, 16 * this.sacrificeMultiplier().toNumber());
  },
  canSacrifice() {
    return Generator(8).amount().gt(0) && player.stars.gte(this.sacrificeRequirement()) && !InfinityPrestigeLayer.mustInfinity();
  },
  isVisible() {
    return this.canSacrifice() || this.sacrificeMultiplier().gt(1) || player.infinities > 0;
  },
  newSacrificeMultiplier() {
    return this.canSacrifice() ? new Decimal(player.stars.log(2) / 16) : this.sacrificeMultiplier();
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
    Generators.resetAmounts(7);
    player.timeSincePurchase = 0;
    player.timeSinceSacrifice = 0;
  }
}
