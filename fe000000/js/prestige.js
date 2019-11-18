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
  prestigeRequirement() {
    return Decimal.pow(2, Math.max(128, 96 + 16 * Math.log2(this.prestigePower())));
  },
  canPrestige() {
    return player.stars.gte(this.prestigeRequirement()) && !InfinityPrestigeLayer.mustInfinity();
  },
  isVisible() {
    return this.prestigePower().gt(1) || this.canPrestige();
  },
  newPrestigePower() {
    return this.canPrestige() ? Decimal.pow(2, (player.stars.log(2) - 96) / 16) : this.prestigePower();
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
  }
}
