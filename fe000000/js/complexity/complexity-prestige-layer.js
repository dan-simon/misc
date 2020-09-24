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
  requirementForComplexity() {
    if (this.hasEnoughEP()) {
      // Formulate the requirement in terms the player can understand without knowing about complexity challenges.
      return format(Decimal.pow(2, Math.pow(2, 32))) + ' stars';
    }
    return format(this.eternityPointRequirementForComplexity()) + ' total eternity points';
  },
  isRequirementVisible() {
    return !this.canComplexity() && PrestigeLayerProgress.hasReached('eternity');
  },
  isAmountSpanVisible() {
    return this.isRequirementVisible() && PrestigeLayerProgress.hasReached('complexity');
  },
  resetText() {
    if (this.canComplexity()) {
      return 'complexity';
    } else {
      return 'do a complexity reset (no complexity point gain or complexity gain)';
    }
  },
  complexityPointGain() {
    if (!this.canComplexity()) {
      return new Decimal(0);
    }
    let oom = EternityPoints.totalEPProducedThisComplexity().max(1).log(2) / Math.pow(2, 16);
    return Decimal.pow(2, oom).floor();
  },
  complexityPoints() {
    return ComplexityPoints.amount();
  },
  newComplexityPoints() {
    return this.complexityPoints().plus(this.complexityPointGain());
  },
  totalComplexityPoints() {
    return ComplexityPoints.totalCPProducedThisFinality();
  },
  complexityPointGainRatio() {
    return this.complexityPointGain().div(this.totalComplexityPoints());
  },
  complexityPointGainRatioText() {
    if (this.totalComplexityPoints().neq(0)) {
      return format(this.complexityPointGainRatio()) + 'x total, ';
    } else {
      return '';
    }
  },
  complexityPointNext() {
    return Decimal.pow(this.complexityPointGain().plus(1), Math.pow(2, 16));
  },
  complexityPointNextText() {
    if (this.complexityPointGain().lt(256)) {
      return ', next at ' + format(this.complexityPointNext()) + ' EP';
    } else {
      return '';
    }
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
  complexityConfirmationMessage() {
    let gain = this.complexityPointGain();
    return 'Are you sure you want to complexity for ' +
    formatInt(gain) + ' complexity point' + pluralize(gain, '', 's') + '?';
  },
  complexityResetConfirmationMessage() {
    return 'Are you sure you want to do a complexity reset? This will not give you any complexity points.';
  },
  complexity(manual) {
    if (!this.canComplexity()) return;
    if (manual && Options.confirmation('complexity') && !confirm(this.complexityConfirmationMessage())) return;
    let gain = this.complexityPointGain();
    ComplexityPoints.addAmount(gain);
    Complexities.increment();
    Stats.addComplexity(player.stats.timeSinceComplexity, gain);
    Powers.maybeRespec();
    Goals.recordPrestige('complexity');
    this.complexityReset(false);
  },
  complexityReset(manual) {
    if (manual && Options.confirmation('complexityReset') && !confirm(this.complexityResetConfirmationMessage())) return;
    // We need to do this here to avoid eternity milestones being applied in the eternity reset.
    player.eternities = ComplexityAchievements.effect(1, 2);
    EternityPrestigeLayer.eternityReset(false);
    // Not handled by Eternity.eternityReset().
    EternityChallenge.setEternityChallenge(0);
    player.complexityStars = new Decimal(2);
    ComplexityGenerators.list.forEach(x => x.resetAmount());
    player.isComplexityChallengeRunning = [true, true, true, true, true, true];
    player.boostPower = 1;
    if (!ComplexityAchievements.hasComplexityAchievement(4, 4)) {
      player.bestBoostPower = 1;
    }
    player.eternityPoints = ComplexityAchievements.startingEternityPoints().plus(FinalityStartingBenefits.eternityPoints());
    player.eternityGenerators = initialEternityGenerators();
    player.highestEternityGenerator = 0;
    player.eternityUpgrades = [0, 0, 0];
    // Let the player keep eternity milestones off if they want.
    // Also let them keep their infinity autobuyers off if they want.
    // (That is, don't reset those things.)
    if (!ComplexityAchievements.hasComplexityAchievement(4, 4)) {
      player.boughtTheorems = [0, 0, 0];
    }
    if (!ComplexityAchievements.hasComplexityAchievement(4, 4) || player.respecStudies || ComplexityChallenge.isSafeguardOn(6)) {
      player.studies = [
        false, false, false, false, false, false,
        false, false, false, false, false, false,
        0, 0, 0, 0
      ];
      player.firstTwelveStudyPurchaseOrder = [];
    }
    if (Studies.list.some(x => x.isBought())) {
      ComplexityChallenge.exitComplexityChallenge(6);
    }
    player.respecStudies = false;
    player.boughtTheoremsThisComplexity = false;
    player.eternityProducer = {
      unlocked: false,
      upgrades: [0, 0]
    };
    player.unlockedEternityChallenge = 0;
    if (ComplexityAchievements.hasComplexityAchievement(4, 2)) {
      player.eternityChallengeCompletions = [4, 4, 4, 4, 4, 4, 4, 4];
    } else {
      player.eternityChallengeCompletions = [0, 0, 0, 0, 0, 0, 0, 0];
    }
    player.respecEternityChallenge = false;
    player.usedAutoECCompletionThisComplexity = false;
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
    player.stats.totalStarsProducedThisComplexity = Stars.startingAmount();
    player.stats.totalEPProducedThisComplexity = ComplexityAchievements.startingEternityPoints().plus(FinalityStartingBenefits.eternityPoints());
    player.stats.totalEternitiesProducedThisComplexity = ComplexityAchievements.effect(1, 2);
    player.stats.timeSinceAutoECCompletion = 0;
    player.stats.timeSincePermanenceGain = 0;
    player.stats.timeSinceComplexity = 0;
    player.stats.timeSinceLastPeakCPPerSec = Math.pow(2, 256);
    player.stats.peakCPPerSec = new Decimal(0);
    player.stats.lastTenEternities = initialLastTenEternities();
    // Not sure where to do this, might as well be here.
    Galaxy.updateDilated();
  }
}
