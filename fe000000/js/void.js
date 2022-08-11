let Void = {
  isUnlocked() {
    return player.voidData.unlocked;
  },
  unlockCost() {
    return Decimal.pow(2, 128);
  },
  canUnlock() {
    return !this.isUnlocked() && player.complexityPoints.gte(this.unlockCost());
  },
  unlock(auto) {
    if (!this.canUnlock() || (
      auto && player.complexityPoints.minus(this.unlockCost()).lt(2) && ComplexityGenerator(1).bought() === 0)) return;
    player.complexityPoints = player.complexityPoints.safeMinus(this.unlockCost());
    player.voidData.unlocked = true;
  },
  inVoid() {
    return player.voidData.inVoid;
  },
  enteringOrInVoid() {
    return player.voidData.enteringOrInVoid;
  },
  nerfEffect() {
    return this.inVoid() ? Powers.getExtraMultiplier('eternity') : 1;
  },
  isNerfEffectAtCap() {
    return this.inVoid() && Powers.isTypeAtCap('eternity');
  },
  currentVoidProgress() {
    if (!this.inVoid()) return 0;
    return ComplexityPrestigeLayer.canComplexity() ?
    EternityPoints.totalEPProducedThisComplexity().max(1).log(2) / Math.pow(2, 16) : 0;
  },
  currentVoidProgressDisplay() {
    return player.voidData.displayCurrentProgress;
  },
  maximumVoidProgress() {
    return player.voidData.progress;
  },
  atMaximumProgressDisplay() {
    return this.currentVoidProgressDisplay() === this.maximumVoidProgress();
  },
  updateVoidProgress() {
    player.voidData.progress = Math.max(player.voidData.progress, this.currentVoidProgress());
    player.voidData.displayCurrentProgress = this.currentVoidProgress();
  },
  givePowerShards(diff) {
    let gain = diff * this.powerShardReward();
    if (gain > 0) {
      PowerShards.gainPowerShards(gain);
    }
  },
  complexityGeneratorReward() {
    return Decimal.pow(2, 64 * Math.pow(this.powerShardReward(), 1 / 4));
  },
  powerShardReward() {
    if (!this.isUnlocked()) {
      return 0;
    }
    let raw = this.maximumVoidProgress() / 32;
    let p = 2 * raw / (raw + 1);
    if (FinalityMilestones.isFinalityMilestoneActive(7)) {
      p = 2;
    }
    return Math.pow(p, 2) / 64;
  },
  hasNonzeroPowerShardReward() {
    return this.powerShardReward() > 0;
  },
  powerShardFrequency() {
    // Note that when this is capped by a finality milestone,
    // it becomes exactly 16, so is an integer.
    return 1 / this.powerShardReward();
  },
  canEnterOrExitVoid() {
    return this.isUnlocked();
  },
  enterVoid() {
    player.voidData.enteringOrInVoid = true;
    if (ComplexityPrestigeLayer.canComplexity()) {
      ComplexityPrestigeLayer.complexity(false);
    } else {
      ComplexityPrestigeLayer.complexityReset(false);
    }
    player.voidData.inVoid = true;
  },
  exitVoid() {
    if (ComplexityPrestigeLayer.canComplexity()) {
      // This takes care of exiting the Void for us.
      ComplexityPrestigeLayer.complexity(false);
    } else {
      this.exitVoidInternal();
      ComplexityPrestigeLayer.complexityReset(false);
    }
  },
  enterOrExitVoid() {
    if (!this.canEnterOrExitVoid()) {
      return;
    }
    if (this.inVoid()) {
      this.exitVoid();
    } else {
      this.enterVoid();
    }
  },
  exitVoidInternal() {
    if (this.inVoid()) {
      player.voidData.enteringOrInVoid = false;
      player.voidData.inVoid = false;
      ComplexityChallenge.rebuyStudies();
    }
  }
}
