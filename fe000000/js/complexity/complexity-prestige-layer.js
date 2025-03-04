let ComplexityPrestigeLayer = {
  eternityPointRequirementForComplexity() {
    return Decimal.pow(2, Math.pow(2, 16));
  },
  hasEnoughEP() {
    return EternityPoints.totalEPProducedThisComplexity().gte(this.eternityPointRequirementForComplexity());
  },
  hasEnoughEPWith(x) {
    return EternityPoints.totalEPProducedThisComplexity().plus(x).gte(this.eternityPointRequirementForComplexity());
  },
  hasComplexityChallenge1Completion() {
    // It is possible, though extremely rare, that someone could have gotten about the same amount
    // of EP two eternities in a row and thus never have had enough stars for this completion.
    return ComplexityChallenge.getComplexityChallengeCompletions(1) >= 1;
  },
  canComplexity() {
    return this.hasEnoughEP() && this.hasComplexityChallenge1Completion();
  },
  canComplexityWith(x) {
    return this.hasEnoughEPWith(x) && this.hasComplexityChallenge1Completion();
  },
  canComplexityReset() {
    return this.rawCanComplexityReset() && this.isComplexityResetEnabled();
  },
  rawCanComplexityReset() {
    return !this.canComplexity();
  },
  isComplexityResetEnabled() {
    return Options.confirmation('complexityReset') !== 'Disabled' && (Options.confirmation('complexityReset') !== 'Usually disabled' || player.stats.timeSinceComplexity <= 64);
  },
  canShowComplexity() {
    return this.canComplexity() && !this.showFastSpecial();
  },
  showFastSpecial() {
    return !Options.showResetButtonsForFastResets() && FastResetText.isDoingFastBeyond('complexity');
  },
  requirementForComplexity() {
    if (this.hasEnoughEP()) {
      // Formulate the requirement in terms the player can understand without knowing about complexity challenges.
      return format(Decimal.pow(2, Math.pow(2, 32))) + ' stars';
    }
    return format(this.eternityPointRequirementForComplexity()) + ' total eternity points';
  },
  isRequirementVisible() {
    return !this.canShowComplexity() && PrestigeLayerProgress.hasReached('eternity');
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
  hasComplexityPointGeneration() {
    return FinalityMilestones.isFinalityMilestoneActive(16) || player.cheats.complexityPointGeneration;
  },
  complexityPointGain() {
    if (!this.canComplexity()) {
      return new Decimal(0);
    }
    let oom = EternityPoints.totalEPProducedThisComplexity().plus(EternityPrestigeLayer.eternityPointGain()).max(1).log(2) / Math.pow(2, 16);
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
  newTotalComplexityPoints() {
    return this.totalComplexityPoints().plus(this.complexityPointGain());
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
    // This Math.max is here to prevent issues with gain after 0 seconds from starting benefits.
    return this.complexityPointGain().div(Math.max(player.stats.timeSinceComplexity, 1 / 16));
  },
  currentLogCPPerSec() {
    return Stats.getLogPerSec(player.stats.timeSinceComplexity, this.complexityPointGain(), this.totalComplexityPoints(), false);
  },
  currentLogCPPerSecDisplay() {
    return Stats.getLogPerSec(player.stats.timeSinceComplexity, this.complexityPointGain(), this.totalComplexityPoints(), true);
  },
  peakCPPerSec() {
    return player.stats.peakCPPerSec;
  },
  peakLogCPPerSec() {
    return player.stats.peakLogCPPerSec;
  },
  peakLogCPPerSecDisplay() {
    return this.peakLogCPPerSec() / Math.log2(NotationOptions.exponentBase());
  },
  updatePeakCPPerSec() {
    let cps = this.currentCPPerSec();
    if (this.canComplexity() && cps.gt(player.stats.peakCPPerSec)) {
      player.stats.peakCPPerSec = cps;
      player.stats.timeSinceLastPeakCPPerSec = 0;
    }
  },
  updatePeakLogCPPerSec() {
    let cps = this.currentLogCPPerSec();
    if (this.canComplexity() && cps >= player.stats.peakLogCPPerSec) {
      player.stats.peakLogCPPerSec = cps;
      player.stats.timeSinceLastPeakLogCPPerSec = 0;
    }
  },
  showLog(x) {
    let setting = Options.showLogSetting(x);
    if (setting === 'Default') {
      return Autobuyer(15).hasAutobuyer() && ['Time past peak log/sec', 'Fraction of peak log/sec'].includes(Autobuyer(15).mode());
    } else if (setting === 'Off') {
      return false;
    } else if (setting === 'On') {
      return true;
    }
  },
  compareCPGain() {
    if (this.complexityPointGain().lt(this.complexityPoints())) {
      player.stats.timeSinceCPGainWasAmount = 0;
    }
    if (this.complexityPointGain().lt(this.totalComplexityPoints())) {
      player.stats.timeSinceCPGainWasTotal = 0;
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
    Achievements.checkForAchievements('complexity');
    let gain = this.complexityPointGain();
    let prevTotal = this.totalComplexityPoints();
    ComplexityPoints.addAmount(gain);
    Complexities.increment();
    Stats.addComplexity(player.stats.timeSinceComplexity, gain, prevTotal);
    Powers.maybeRespec();
    Goals.recordPrestige('complexity');
    this.complexityReset(false, false, false);
  },
  complexityReset(manual, justReset, entering) {
    if (manual && !this.rawCanComplexityReset()) return;
    if (manual && !this.isComplexityResetEnabled()) {
      alert('You cannot do a complexity reset due to your complexity reset confirmation setting of "' +
      Options.confirmation('complexityReset') + '". Go to the Options tab to change this.');
      return;
    }
    if (manual && Options.confirmation('complexityReset') === 'Confirmation' && !confirm(this.complexityResetConfirmationMessage())) return;
    // We need to do this here to avoid eternity milestones being applied in the eternity reset.
    player.eternities = ComplexityAchievements.effect(1, 2);
    EternityPrestigeLayer.eternityReset(false);
    // Not handled by Eternity.eternityReset().
    EternityChallenge.setEternityChallenge(0);
    player.complexityStars = new Decimal(2);
    ComplexityGenerators.list.forEach(x => x.resetAmount());
    // It's crucial to exit while our running data is still accurate (that is, before we set player.isComplexityChallengeRunning).
    // Also, if the player is entering a complexity challenge, we don't exit complexity challenges.
    if (!entering && Options.exitComplexityChallengesOnComplexity()) {
      ComplexityChallenge.turnAllActiveSafeguardsOff();
    }
    player.isComplexityChallengeRunning = [true, true, true, true, true, true];
    player.boostPower = 1;
    if (!ComplexityAchievements.isComplexityAchievementActive(4, 4)) {
      player.bestBoostPower = 1;
    }
    player.eternityPoints = ComplexityAchievements.startingEternityPoints().plus(FinalityStartingBenefits.eternityPoints());
    player.eternityGenerators = initialEternityGenerators();
    player.highestEternityGenerator = 0;
    player.eternityUpgrades = [0, 0, 0];
    // Let the player keep eternity milestones off if they want.
    // Also let them keep their infinity autobuyers off if they want.
    // (That is, don't reset those things.)
    if (!ComplexityAchievements.isComplexityAchievementActive(4, 4)) {
      player.boughtTheorems = [0, 0, 0];
    }
    if (!ComplexityAchievements.isComplexityAchievementActive(4, 4) || player.studySettings.respecStudies || ComplexityChallenge.isSafeguardOn(6)) {
      if (ComplexityAchievements.isComplexityAchievementActive(4, 4) && !Studies.areStudiesInitialStudies()) {
        Studies.setStudiesBeforeLastRespec();
      }
      player.studies = initialStudies();
      player.studySettings.firstTwelveStudyPurchaseOrder = [];
      player.lastPresetIndices[1] = 0;
    }
    if (Studies.list.some(x => x.isBought())) {
      ComplexityChallenge.exitComplexityChallenge(6);
    }
    player.studySettings.respecStudies = false;
    player.studySettings.boughtTheoremsThisComplexity = false;
    player.eternityProducer = {
      unlocked: false,
      upgrades: [0, 0]
    };
    player.unlockedEternityChallenge = 0;
    if (ComplexityAchievements.isComplexityAchievementActive(4, 2)) {
      player.eternityChallengeCompletions = [4, 4, 4, 4, 4, 4, 4, 4];
    } else {
      player.eternityChallengeCompletions = [0, 0, 0, 0, 0, 0, 0, 0];
    }
    player.respecEternityChallenge = false;
    player.recentEternityChallengeRequirements = [false, false, false, false, false, false, false, false];
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
      next: 0,
      displayAmount: 0,
      timeForChromaValue: player.chroma.timeForChromaValue,
      timeForChromaMode: player.chroma.timeForChromaMode,
      rotate: player.chroma.rotate,
      startProducingWhenUnlocked: player.chroma.startProducingWhenUnlocked,
    };
    // Small bonus, arguably unexpected but not that big in the grand scheme of things.
    player.stats.totalStarsProducedThisComplexity = Stars.startingAmount();
    player.stats.totalEPProducedThisComplexity = ComplexityAchievements.startingEternityPoints().plus(FinalityStartingBenefits.eternityPoints());
    player.stats.totalEternitiesProducedThisComplexity = ComplexityAchievements.effect(1, 2);
    player.stats.timeSinceAutoECCompletion = 0;
    player.stats.timeSincePermanenceGain = 0;
    player.stats.timeSinceComplexity = 0;
    player.stats.timeSinceLastPeakCPPerSec = Math.pow(2, 256);
    player.stats.timeSinceLastPeakLogCPPerSec = Math.pow(2, 256);
    player.stats.timeSinceCPGainWasAmount = 0;
    player.stats.timeSinceCPGainWasTotal = 0;
    player.stats.peakCPPerSec = new Decimal(0);
    player.stats.peakLogCPPerSec = 0;
    player.stats.lastTenEternities = initialLastTenEternities();
    // Not sure where to do this, might as well be here.
    Galaxy.updateDilated();
  }
}
