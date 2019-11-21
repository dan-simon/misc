let Prestige = {
  prestigePower() {
    return player.prestigePower;
  },
  setPrestigePower(x) {
    player.prestigePower = x;
  },
  multiplier() {
    return this.prestigePower();
  },
  isPrestigeDisabled() {
    return Challenge.isChallengeRunning(10);
  },
  isPrestigeSquareRooted() {
    return [8, 11].indexOf(Challenge.currentChallenge()) !== -1;
  },
  prestigePowerExponent() {
    return this.isPrestigeDisabled() ? 0 : (this.isPrestigeSquareRooted() ? 0.5 : 1);
  },
  prestigeRequirement() {
    return Decimal.pow(2, Math.max(128, 96 + 16 * Math.log2(this.prestigePower()) / this.prestigePowerExponent()));
  },
  canPrestige() {
    return player.stars.gte(this.prestigeRequirement()) && !InfinityPrestigeLayer.mustInfinity() && !this.isPrestigeDisabled();
  },
  isVisible() {
    return (this.canPrestige() || this.prestigePower().gt(1) || player.infinities > 0) && !this.isPrestigeDisabled();
  },
  newPrestigePower() {
    return this.canPrestige() ? Decimal.pow(2, this.prestigePowerExponent() * (player.stars.log(2) - 96) / 16) : this.prestigePower();
  },
  prestigePowerGain() {
    return this.newPrestigePower().minus(this.prestigePower());
  },
  prestigePowerMultGain() {
    return this.newPrestigePower().div(this.prestigePower());
  },
  prestige() {
    if (!this.canPrestige()) return;
    this.setPrestigePower(this.newPrestigePower());
    this.prestigeReset();
  },
  prestigeReset() {
    player.stars = new Decimal(2);
    player.boost = {bought: 0};
    player.generators = initialGenerators();
    player.highestGenerator = 0;
    player.sacrificeMultiplier = new Decimal(1);
    player.stats.timeSincePurchase = 0;
    player.stats.timeSinceSacrifice = 0;
    player.stats.timeSincePrestige = 0;
  }
}
