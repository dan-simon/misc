let ComplexityPrestigeLayer = {
  eternityPointRequirementForComplexity() {
    return Decimal.pow(2, Math.pow(2, 16));
  },
  hasEnoughEP() {
    return EternityPoints.totalEPProducedThisComplexity().gte(this.eternityPointRequirementForComplexity());
  },
  hasComplexityChallenge1Completion() {
    // It is possible, though extremely rare, that someone could have gotten about the same amount
    // of EP two eternities in a row and thus never have had enough stars for this completion.
    return ComplexityChallenge.getComplexityChallengeCompletions(1) >= 1;
  },
  canComplexity() {
    return this.hasEnoughEP() && this.hasComplexityChallenge1Completion();
  },
  isComplexityUnlocked() {
    return this.hasEnoughEP() || player.complexities > 0;
  },
  requirementForComplexity() {
    if (this.hasEnoughEP()) {
      // Formulate the requirement in terms the player can understand without knowing about complexity challenges.
      return format(Decimal.pow(2, Math.pow(2, 32))) + ' stars';
    }
    return format(this.eternityPointRequirementForComplexity()) + ' total eternity points this complexity';
  },
  isRequirementVisible() {
    return !this.canComplexity() && (player.eternities.gt(0) || player.complexities > 0);
  },
  complexityPointGain() {
    let oom = EternityPoints.totalEPProducedThisComplexity().max(1).log(2) / Math.pow(2, 16);
    return Decimal.pow(2, oom).floor();
  },
  currentCPPerSec() {
    return this.complexityPointGain().div(player.stats.timeSinceComplexity);
  },
  peakCPPerSec() {
    return player.stats.peakCPPerSec;
  },
  updatePeakCPPerSec() {
    let cps = this.currentCPPerSec();
    if (this.canComplexity() && cps.gt(player.stats.peakCPPerSec)) {
      player.stats.peakCPPerSec = cps;
      player.stats.timeSinceLastPeakCPPerSec = 0;
    }
  },
  complexity() {
    if (!this.canComplexity()) return;
    let gain = this.complexityPointGain();
    ComplexityPoints.addAmount(gain);
    Complexities.increment();
    Stats.addComplexity(player.stats.timeSinceComplexity, gain);
    this.complexityReset();
  },
  complexityReset() {
    // We need to do this here to avoid eternity milestones being applied in the eternity reset.
    player.eternities = new Decimal(ComplexityUpgrades.effect(1, 2));
    EternityPrestigeLayer.eternityReset();
    // Not handled by Eternity.eternityReset().
    EternityChallenge.setEternityChallenge(0);
    player.complexityStars = new Decimal(1);
    ComplexityGenerators.list.forEach(x => x.resetAmount());
    player.isComplexityChallengeRunning = [true, true, true, true, true, true];
    player.boostPower = 1;
    player.bestBoostPowerThisComplexity = 1;
    player.eternityPoints = new Decimal(0);
    player.eternityGenerators = initialEternityGenerators();
    player.highestEternityGenerator = 0;
    player.eternityUpgrades = [0, 0, 0];
    // Let the player keep eternity milestones off if they want.
    // Also let them keep their infinity autobuyers off if they want.
    player.boughtTheorems = [0, 0, 0];
    // It might be wise to respec studies if (1) studies are in general kept
    // by something later in the game and (2) respec is on.
    player.studies = [
      false, false, false, false, false, false,
      false, false, false, false, false, false,
      0, 0, 0, 0
    ];
    player.respecStudies = false;
    player.eternityProducer = {
      unlocked: false,
      upgrades: [0, 0]
    };
    player.unlockedEternityChallenge = 0;
    if (ComplexityUpgrades.hasComplexityUpgrade(4, 2)) {
      player.eternityChallengeCompletions = [4, 4, 4, 4, 4, 4, 4, 4];
    } else {
      player.eternityChallengeCompletions = [0, 0, 0, 0, 0, 0, 0, 0];
    }
    player.respecEternityChallenge = false;
    player.permanence = new Decimal(0);
    player.permanenceUpgrades = [0, 0, 0, 0];
    player.stats.lastPermanenceGain = new Decimal(0);
    // Don't reset player.hasGainedPermanence, since it's only used for display
    // (specifically, hiding permanence upgrades if it's false).
    player.chroma = {
      colors: [0, 0, 0, 0, 0, 0],
      unlocked: [false, false, false, false, false, false],
      current: 0,
      next: 0
    };
    // Small bonus, arguably unexpected but not that big in the grand scheme of things.
    player.stats.totalStarsProducedThisComplexity = new Decimal(2);
    player.stats.totalEPProducedThisComplexity = new Decimal(0);
    player.stats.totalEternitiesProducedThisComplexity = new Decimal(ComplexityUpgrades.effect(1, 2));
    player.stats.timeSinceAutoECCompletion = 0;
    player.stats.timeSincePermanenceGain = 0;
    player.stats.timeSinceComplexity = 0;
    player.stats.timeSinceLastPeakCPPerSec = Math.pow(2, 256);
    player.stats.peakCPPerSec = new Decimal(0);
    player.stats.lastTenEternities = initialLastTenEternities();
  }
}
