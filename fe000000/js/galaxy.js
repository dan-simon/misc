let Galaxy = {
  totalStarsProduced() {
    return player.stats.totalStarsProduced;
  },
  totalInfinityStarsProduced() {
    return player.stats.totalInfinityStarsProduced;
  },
  totalEternityStarsProduced() {
    return player.stats.totalEternityStarsProduced;
  },
  totalComplexityStarsProduced() {
    return player.stats.totalComplexityStarsProduced;
  },
  starFactor() {
    return this.totalStarsProduced().max(1).log2();
  },
  infinityStarFactor() {
    return this.totalInfinityStarsProduced().max(1).log2();
  },
  eternityStarFactor() {
    return this.totalEternityStarsProduced().max(1).log2();
  },
  complexityStarFactor() {
    return this.totalComplexityStarsProduced().max(1).log2();
  },
  stellarProduct() {
    return this.starFactor() * this.infinityStarFactor() *
      this.eternityStarFactor() * this.complexityStarFactor();
  },
  baseGalaxyRequirement() {
    return Math.pow(2, 120);
  },
  amount() {
    if (!this.isUnlocked()) return 0;
    return this.stellarProductAmount() + this.complexityPointAmount();
  },
  stellarProductAmount() {
    return Math.floor(Math.max(Math.log2(this.stellarProduct() / this.baseGalaxyRequirement()) + 1, 0));
  },
  complexityPointAmount() {
    return Math.floor(Math.max(Math.log2(ComplexityPoints.totalCPProduced().max(1).log2() / this.unlockCost().log2()) + 1, 0));
  },
  nextStellarProductGalaxy() {
    return this.baseGalaxyRequirement() * Math.pow(2, this.stellarProductAmount());
  },
  nextComplexityPointGalaxy() {
    return this.unlockCost().pow(Math.pow(2, this.complexityPointAmount()))
  },
  isUnlocked() {
    return player.galaxies.unlocked;
  },
  unlockCost() {
    return Decimal.pow(2, 1024);
  },
  canUnlock() {
    return player.complexityPoints.gte(this.unlockCost());
  },
  unlock(auto) {
    if (!this.canUnlock() || (
      auto && player.complexityPoints.minus(this.unlockCost()).lt(2) && ComplexityGenerator(1).bought() === 0)) return;
    player.complexityPoints = player.complexityPoints.safeMinus(this.unlockCost());
    player.galaxies.unlocked = true;
  },
  effect() {
    return Math.min(1 + Math.log2(1 + this.effectSpeed() * player.stats.timeSinceComplexity / 1024) / 64, this.effectCap());
  },
  effectCap() {
    return 1 + Math.sqrt(this.amount() - this.dilated()) / 64;
  },
  effectSpeed() {
    return Math.pow(1 + this.dilated(), 2);
  },
  timeToReachEffectCap() {
    return 1024 * (Math.pow(2, 64 * (this.effectCap() - 1)) - 1) /  this.effectSpeed();
  },
  nextEffectCap() {
    return 1 + Math.sqrt(this.amount() - this.nextDilated()) / 64;
  },
  nextEffectSpeed() {
    return Math.pow(1 + this.nextDilated(), 2);
  },
  nextTimeToReachEffectCap() {
    return 1024 * (Math.pow(2, 64 * (this.nextEffectCap() - 1)) - 1) / this.nextEffectSpeed()
  },
  dilated() {
    return this.dilatedRawToActual(this.dilatedRaw());
  },
  dilatedRaw() {
    return player.galaxies.dilated;
  },
  nextDilated() {
    return this.dilatedRawToActual(this.nextDilatedRaw());
  },
  nextDilatedRaw() {
    return player.galaxies.nextDilated;
  },
  dilatedRawToActual(x) {
    if (x < 0) {
      return Math.max(0, x + this.amount());
    } else {
      return Math.min(x, this.amount());
    }
  },
  updateDilated() {
    player.galaxies.dilated = player.galaxies.nextDilated;
  },
  setNextDilated(x) {
    player.galaxies.nextDilated = Math.floor(x || 0);
  },
  getStrengthIncrease() {
    return Math.pow(this.amount() / 128, 0.5);
  }
}
