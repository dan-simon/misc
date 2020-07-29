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
  unlock() {
    if (!this.canUnlock()) return;
    player.complexityPoints = player.complexityPoints.minus(this.unlockCost());
    player.galaxies.unlocked = true;
  }
}
