let FinalityPrestigeLayer = {
  complexityPointRequirementForFinality() {
    return Decimal.pow(2, Math.pow(2, 16));
  },
  actualComplexityPointRequirementForFinality() {
    // What's going on here is that due to EP gen, after reaching the star limit,
    // your EP will, after a few ticks, increase to almost, but not quite,
    // enough to get enough complexity points to finality. After a second or so
    // EP will get high enough. But for that second, if you complexity,
    // total complexity points and complexity points requirement will look the same,
    // and it'll be confusing. Hence, this.
    // The new generation code doesn't actually fix this because you don't get extra EP
    // at the finality threshold.
    return this.complexityPointRequirementForFinality().times(255 / 256);
  },
  canFinality() {
    return ComplexityPoints.totalCPProducedThisFinality().gte(this.actualComplexityPointRequirementForFinality());
  },
  canFinalityWith(x) {
    return ComplexityPoints.totalCPProducedThisFinality().plus(x).gte(this.actualComplexityPointRequirementForFinality());
  },
  canShowFinality() {
    return this.canFinality() && !this.showFastSpecial();
  },
  showFastSpecial() {
    return !Options.showResetButtonsForFastResets() && FastResetText.isDoingFastBeyond('finality');
  },
  isRequirementVisible() {
    return !this.canShowFinality() && PrestigeLayerProgress.hasReached('complexity');
  },
  isAmountSpanVisible() {
    return this.isRequirementVisible() && PrestigeLayerProgress.hasReached('finality');
  },
  resetText() {
    if (this.canFinality()) {
      return 'finality';
    } else {
      return 'do a finality reset (no finality point gain or finality gain)';
    }
  },
  finalityPointGain() {
    return FinalityShardUpgrade(2).effect();
  },
  finalityPoints() {
    return FinalityPoints.amount();
  },
  newFinalityPoints() {
    return this.finalityPoints().plus(this.finalityPointGain());
  },
  totalFinalityPoints() {
    return FinalityPoints.totalFPProduced();
  },
  finalityPointGainRatio() {
    return this.finalityPointGain().div(this.totalFinalityPoints());
  },
  finalityPointGainRatioText() {
    if (this.totalFinalityPoints().neq(0)) {
      return format(this.finalityPointGainRatio()) + 'x total, ';
    } else {
      return '';
    }
  },
  areFinalityShardsDoubled() {
    return (1 + Finalities.amount()) % 64 === 0;
  },
  finalityShardGain() {
    return 16 * (1 + Finalities.amount()) * (this.areFinalityShardsDoubled() ? 2 : 1);
  },
  finalityShards() {
    return FinalityShards.amount();
  },
  newFinalityShards() {
    return this.finalityShards() + this.finalityShardGain();
  },
  totalFinalityShards() {
    return FinalityShards.total();
  },
  finalityShardGainRatio() {
    return this.finalityShardGain() / this.totalFinalityShards();
  },
  finalityShardGainRatioText() {
    if (this.totalFinalityShards() !== 0) {
      return format(this.finalityShardGainRatio()) + 'x total, ';
    } else {
      return '';
    }
  },
  finalityConfirmationMessage() {
    let pointGain = this.finalityPointGain();
    let shardGain = this.finalityShardGain();
    return 'Are you sure you want to finality for ' +
    formatInt(pointGain) + ' finality point' + pluralize(pointGain, '', 's') + ' and ' +
    formatInt(shardGain) + ' finality shard' + pluralize(shardGain, '', 's') + '?';
  },
  finalityResetConfirmationMessage() {
    return 'Are you sure you want to do a finality reset? This will not give you any finality points or finality shards.';
  },
  finality(manual, justReset) {
    if (!this.canFinality()) return;
    if (manual && Options.confirmation('finality') && !confirm(this.finalityConfirmationMessage())) return;
    Achievements.checkForAchievements('finality');
    let pointGain = this.finalityPointGain();
    let shardGain = this.finalityShardGain();
    let prevTotal = this.totalFinalityPoints();
    FinalityPoints.addAmount(pointGain);
    FinalityShards.addAmount(shardGain);
    Finalities.increment();
    Stats.addFinality(player.stats.timeSinceFinality, pointGain, shardGain, prevTotal);
    FinalityShardPresets.maybeRespec();
    Goals.recordPrestige('finality');
    this.finalityReset(false, justReset);
  },
  finalityReset(manual, justReset) {
    if (manual && Options.confirmation('finality') && !confirm(this.finalityResetConfirmationMessage())) return;
    // We need to do this here to avoid complexity achievements being applied in the eternity reset.
    // As said below, this method shouldn't apply rewards.
    FinalityShards.initializeStartingComplexityAchievements();
    // Here are the things that complexity sometimes (but not always) fails to reset and
    // finality should always reset. They're here since (1) it's a convenient
    // distinguishing place to put them and (2) studies need to be reset first,
    // otherwise you don't enter CC6 (as you should).
    player.bestBoostPower = 1;
    player.boughtTheorems = [0, 0, 0];
    player.studies = initialStudies();
    player.studySettings.firstTwelveStudyPurchaseOrder = [];
    player.studySettings.studiesBeforeLastRespec = initialStudies();
    player.studySettings.firstTwelveStudyPurchaseOrderBeforeLastRespec = [];
    // Extra theorems seem to fit in best here, because they're theorem-related, even though
    // nothing resets them other than finality.
    player.extraTheorems = [0, 0, 0, 0];
    // Complexities are here because they're used by a complexity achievement
    // to determine starting eternities.
    player.complexities = FinalityStartingBenefits.complexities();
    // This function takes care of applying the rewards for certain numbers of achievements.
    // So we don't apply those rewards in initializeStartingComplexityAchievements();
    // we apply them here instead.
    ComplexityPrestigeLayer.complexityReset(false, justReset, false);
    player.finalityStars = new Decimal(1);
    FinalityGenerators.list.forEach(x => x.resetAmount());
    player.complexityPoints = FinalityStartingBenefits.complexityPoints().plus(FinalityMilestones.startingComplexityPoints());
    player.complexityStars = new Decimal(2);
    player.complexityGenerators = initialComplexityGenerators(),
    player.highestComplexityGenerator = 0;
    player.complexityChallengeCompletions = player.complexityChallengeCompletions.map(
      x => Math.min(x, FinalityMilestones.keptComplexityChallenges()));
    player.complexityChallengeLastCompletion = [[-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1]];
    // Reset the power preset index before going further.
    player.lastPresetIndices[2] = 0;
    // We keep hasGainedShards for the same reason we keep hasGainedPermanence in complexity;
    // it's used only for display.
    player.powers = {
      seed: player.powers.initialSeed,
      initialSeed: player.powers.initialSeed,
      id: 1,
      unlocked: false,
      upgrades: [0, 0, 0],
      equipped: [],
      stored: [],
      gain: player.powers.gain,
      respec: false,
      presetRespec: player.powers.presetRespec,
      hasGainedShards: player.powers.hasGainedShards,
      shards: 0,
      shardUpgrades: [0, 0, 0, 0],
      presets: player.powers.presets,
      craft: player.powers.craft,
      lastData: {
        lowRarity: false,
        type: 'none'
      }
    };
    // Jump to another seed, so each finality gets a new seed that doesn't depend
    // on when finality happened to happen.
    RNG.jump(Finalities.amount() * Math.pow(2, 20));
    // Note that player.oracle.timeSimulated doesn't matter here at all.
    // We let the player keep their settings since they probably want to.
    // Also, doing a finality doesn't change whether we're predicting or not.
    player.oracle = {
      unlocked: false,
      isPredicting: player.oracle.isPredicting,
      time: player.oracle.time,
      timeSimulated: 256,
      ticks: player.oracle.ticks,
      ticksSimulated: 1024,
      complexityPoints: new Decimal(0),
      complexityPointGain: new Decimal(0),
      complexityChallengeCompletions: [0, 0, 0, 0, 0, 0],
      originalComplexityChallengeCompletions: [0, 0, 0, 0, 0, 0],
      powerShards: 0,
      originalPowerShards: 0,
      galaxies: 0,
      originalGalaxies: 0,
      finalities: 0,
      originalFinalities: 0,
      finalityShards: 0,
      originalFinalityShards: 0,
      used: false,
      alert: player.oracle.alert,
      powerGainInPredictions: player.oracle.powerGainInPredictions,
      powerDisplay: player.oracle.powerDisplay,
      powerFutureExtraMultipliers: player.oracle.powerFutureExtraMultipliers,
      equippedPowers: [],
      powers: [],
      extraMultipliers: {
        normal: 1,
        infinity: 1,
        eternity: 1,
        complexity: 1
      },
      complexityStars: new Decimal(0),
      freeTime: 0,
      timeSinceComplexity: 0,
      showInPowers: false,
      showInGalaxies: false,
    };
    player.galaxies.unlocked = false;
    if (Galaxy.isResetNextDilatedOnFinalityOn()) {
      Galaxy.resetNextDilated();
    }
    Galaxy.updateDilated();
    player.stats.totalStarsProducedThisFinality = Stars.startingAmount();
    player.stats.totalInfinityStarsProducedThisFinality = new Decimal(0);
    player.stats.totalEternityStarsProducedThisFinality = new Decimal(0);
    player.stats.totalComplexityStarsProducedThisFinality = new Decimal(0);
    player.stats.totalCPProducedThisFinality = FinalityStartingBenefits.complexityPoints().plus(FinalityMilestones.startingComplexityPoints());
    player.stats.timeSincePowerGain = 0;
    player.stats.timeSinceOraclePrediction = 0;
    player.stats.timeSinceFinality = 0;
    player.stats.lastTenComplexities = initialLastTenComplexities();
  }
}
