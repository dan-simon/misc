let Galaxy = {
  totalStarsProducedThisFinality() {
    return player.stats.totalStarsProducedThisFinality;
  },
  totalInfinityStarsProducedThisFinality() {
    return player.stats.totalInfinityStarsProducedThisFinality;
  },
  totalEternityStarsProducedThisFinality() {
    return player.stats.totalEternityStarsProducedThisFinality;
  },
  totalComplexityStarsProducedThisFinality() {
    return player.stats.totalComplexityStarsProducedThisFinality;
  },
  starFactor() {
    return this.totalStarsProducedThisFinality().max(1).log2();
  },
  infinityStarFactor() {
    return this.totalInfinityStarsProducedThisFinality().max(1).log2();
  },
  eternityStarFactor() {
    return this.totalEternityStarsProducedThisFinality().max(1).log2();
  },
  complexityStarFactor() {
    return this.totalComplexityStarsProducedThisFinality().max(1).log2();
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
    return this.stellarProductAmount() + this.complexityPointAmount() + this.finalityShardUpgradeAmount();
  },
  showSpecialZeroText() {
    return !this.isUnlocked() && this.stellarProductAmount() + this.complexityPointAmount() + this.finalityShardUpgradeAmount() > 0;
  },
  nextAmount() {
    if (!this.isUnlocked()) return 0;
    return this.stellarProductAmount() + this.nextComplexityPointAmount() + this.finalityShardUpgradeAmount();
  },
  stellarProductAmount() {
    return Math.floor(Math.max(Math.log2(this.stellarProduct() / this.baseGalaxyRequirement()) + 1, 0));
  },
  complexityPointAmount() {
    return Math.floor(Math.max(Math.log2(ComplexityPoints.totalCPProducedThisFinality().max(1).log2() / this.unlockCost().log2()) + 1, 0));
  },
  nextComplexityPointAmount() {
    return Math.floor(Math.max(Math.log2(ComplexityPoints.totalCPProducedThisFinality().plus(ComplexityPrestigeLayer.complexityPointGain()).max(1).log2() / this.unlockCost().log2()) + 1, 0));
  },
  finalityShardUpgradeAmount() {
    return FinalityStartingBenefits.galaxies();
  },
  nextStellarProductGalaxy() {
    return this.baseGalaxyRequirement() * Math.pow(2, this.stellarProductAmount());
  },
  nextComplexityPointGalaxy() {
    return this.unlockCost().pow(Math.pow(2, this.complexityPointAmount()));
  },
  isUnlocked() {
    return player.galaxies.unlocked;
  },
  unlockCost() {
    return Decimal.pow(2, 1024);
  },
  canUnlock() {
    return !this.isUnlocked() && player.complexityPoints.gte(this.unlockCost());
  },
  unlock(auto) {
    if (!this.canUnlock() || (
      auto && player.complexityPoints.minus(this.unlockCost()).lt(2) && ComplexityGenerator(1).bought() === 0)) return;
    player.complexityPoints = player.complexityPoints.safeMinus(this.unlockCost());
    player.galaxies.unlocked = true;
    this.updateDilatedMinor();
  },
  otherSpeedMultiplier() {
    return Achievements.otherMultiplier() * FinalityShardUpgrade(8).effect();
  },
  effect() {
    return Math.min(1 + Math.log2(1 + this.actualSpeed() * (player.stats.timeSinceComplexity + FinalityMilestones.freeTimeInComplexity()) / 1024) / 64, this.effectCap());
  },
  effectCap(d, amount) {
    if (d === undefined) {
      d = this.dilated();
    }
    if (amount === undefined) {
      amount = this.amount();
    }
    // The max with 0 is there to minimize the effect of something going very wrong and dilating more galaxies than the player has.
    return 1 + Math.sqrt(Math.max(0, amount - d)) / 64;
  },
  effectSpeed(d) {
    if (d === undefined) {
      d = this.dilated();
    }
    return Math.pow(1 + d, 2);
  },
  actualSpeed(d) {
    return this.effectSpeed(d) * this.otherSpeedMultiplier();
  },
  timeToReachEffectCap(d, amount) {
    return Math.max(0, 1024 * (Math.pow(2, 64 * (this.effectCap(d, amount) - 1)) - 1) / this.actualSpeed(d) - FinalityMilestones.freeTimeInComplexity());
  },
  nextEffectCap() {
    return this.effectCap(this.nextDilated(), this.nextAmount());
  },
  nextEffectSpeed() {
    return this.effectSpeed(this.nextDilated(), this.nextAmount())
  },
  nextActualSpeed() {
    return this.actualSpeed(this.nextDilated(), this.nextAmount())
  },
  nextTimeToReachEffectCap() {
    return this.timeToReachEffectCap(this.nextDilated(), this.nextAmount());
  },
  dilated() {
    return player.galaxies.dilated;
  },
  undilated() {
    return player.galaxies.undilated;
  },
  nextDilated() {
    return this.nextDilatedClamped(0, this.nextAmount(), this.nextAmount());
  },
  nextDilatedClamped(min, max, total) {
    let mode = this.nextDilatedMode();
    let amount = this.nextDilatedAmount();
    if (mode === 'Amount') {
      return Math.floor(Math.min(max, Math.max(min, amount)));
    } else if (mode === 'All but amount') {
      return Math.floor(Math.min(max, Math.max(min, total - amount)));
    } else if (mode === 'Seconds to reach cap') {
      // This loop is as things go pretty cheap.
      // If there were more than 128 dilated galaxies, I'd start to be worried,
      // but we're nowhere near that.
      let safe = max;
      while (safe >= min + 16 && this.timeToReachEffectCap(safe - 16, total) <= amount) {
        safe -= 16;
      }
      while (safe >= min + 1 && this.timeToReachEffectCap(safe - 1, total) <= amount) {
        safe -= 1;
      }
      return safe;
    }
  },
  nextDilatedMode(x) {
    return player.galaxies.nextDilatedMode;
  },
  setNextDilatedMode(x) {
    player.galaxies.nextDilatedMode = x;
  },
  nextDilatedAmount(x) {
    return player.galaxies.nextDilatedAmount;
  },
  setNextDilatedAmount(x) {
    player.galaxies.nextDilatedAmount = x || 0;
  },
  getStrengthIncrease() {
    return Math.pow(this.amount() / 128, 0.5);
  },
  toggleResetNextDilatedOnFinality() {
    player.galaxies.resetNextDilatedOnFinality = !player.galaxies.resetNextDilatedOnFinality;
  },
  isResetNextDilatedOnFinalityOn() {
    return player.galaxies.resetNextDilatedOnFinality;
  },
  updateDilated() {
    let d = this.nextDilated();
    let total = this.amount();
    player.galaxies.dilated = d;
    player.galaxies.undilated = total - d;
  },
  updateDilatedMinor() {
    let total = this.amount();
    if (this.dilated() + this.undilated() < total) {
      let d = this.nextDilatedClamped(this.dilated(), total - this.undilated(), this.amount());
      player.galaxies.dilated = d;
      player.galaxies.undilated = total - d;
    }
  },
  resetNextDilated() {
    player.galaxies.nextDilatedMode = 'Amount';
    player.galaxies.nextDilatedAmount = 0;
    this.updateNextDilatedInputDisplay();
  },
  updateNextDilatedInputDisplay() {
    document.getElementsByClassName('next-dilated-mode')[0].value = this.nextDilatedMode();
    document.getElementsByClassName('next-dilated-amount')[0].value = NotationOptions.format('next-dilated-amount');
  },
  tabColors() {
    return ['normal', 'infinity', 'eternity', 'complexity'];
  }
}
