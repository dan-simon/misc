let Prism = {
  amountRewardThresholds: [null, 8, 16, 32],
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
  basePrismRequirement() {
    return Math.pow(2, 128);
  },
  amount() {
    if (!this.isUnlocked()) return 0;
    return this.stellarProductAmount() + this.complexityPointAmount();
  },
  stellarProductAmount() {
    return Math.floor(Math.max(Math.log2(this.stellarProduct() / this.basePrismRequirement()) + 1, 0));
  },
  complexityPointAmount() {
    return Math.floor(Math.max(Math.log2(ComplexityPoints.totalCPProduced().max(1).log2() / this.unlockCost().log2()) + 1, 0));
  },
  nextStellarProductPrism() {
    return this.basePrismRequirement() * Math.pow(2, this.stellarProductAmount());
  },
  nextComplexityPointPrism() {
    return this.unlockCost().pow(Math.pow(2, this.complexityPointAmount()))
  },
  isUnlocked() {
    return player.prisms.unlocked;
  },
  unlockCost() {
    return Decimal.pow(2, 4096);
  },
  canUnlock() {
    return player.complexityPoints.gte(this.unlockCost());
  },
  unlock() {
    if (!this.canUnlock()) return;
    player.complexityPoints = player.complexityPoints.minus(this.unlockCost());
    player.prisms.unlocked = true;
  },
  effect() {
    return Math.min(1 + Math.log2(1 + this.effectSpeed() * player.stats.timeSinceComplexity / 1024) / 64, this.effectCap());
  },
  effectCap() {
    return 1 + Math.sqrt(this.amount() - this.grisms()) / 64;
  },
  effectSpeed() {
    return Math.pow(1 + this.grisms(), 2);
  },
  timeToReachEffectCap() {
    return 1024 * (Math.pow(2, 64 * (this.effectCap() - 1)) - 1) /  this.effectSpeed();
  },
  nextEffectCap() {
    return 1 + Math.sqrt(this.amount() - this.nextGrisms()) / 64;
  },
  nextEffectSpeed() {
    return Math.pow(1 + this.nextGrisms(), 2);
  },
  nextTimeToReachEffectCap() {
    return 1024 * (Math.pow(2, 64 * (this.nextEffectCap() - 1)) - 1) / this.nextEffectSpeed()
  },
  grisms() {
    return player.prisms.grisms;
  },
  nextGrisms() {
    return Math.min(player.prisms.nextGrisms, this.amount());
  },
  setNextGrisms(x) {
    player.prisms.nextGrisms = Math.floor(Math.max(x || 0, 0));
  },
  getAmountRewardThreshold(x) {
    return this.amountRewardThresholds[x];
  },
  getAmountRewardRawEffect(x) {
    return [null, 0.5, 0.5, 1.5][x];
  },
  isAmountRewardActive(x) {
    return this.amount() >= this.getAmountRewardThreshold(x);
  },
  getAmountRewardEffect(x) {
    if (this.isAmountRewardActive(x)) {
      return this.getAmountRewardRawEffect(x);
    }
    return [null, 0, 0, 1][x];
  }
}
