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
    return this.complexityPointRequirementForFinality().times(255 / 256);
  },
  canFinality() {
    return ComplexityPoints.totalCPProducedThisFinality().gte(this.actualComplexityPointRequirementForFinality());
  },
  isRequirementVisible() {
    return !this.canFinality() && PrestigeLayerProgress.hasReached('complexity');
  },
  isAmountSpanVisible() {
    return this.isRequirementVisible() && PrestigeLayerProgress.hasReached('finality');
  },
  resetText() {
    if (this.canFinality()) {
      return 'finality';
    } else {
      return 'do a finality reset (no finality point gain or complexity gain)';
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
  finality() {
    if (!this.canFinality()) return;
    let pointGain = this.finalityPointGain();
    let shardGain = this.finalityShardGain();
    FinalityPoints.addAmount(pointGain);
    FinalityShards.addAmount(shardGain);
    Finalities.increment();
    Stats.addFinality(player.stats.timeSinceFinality, pointGain, shardGain);
    FinalityShardPresets.maybeRespec();
    Goals.recordPrestige('finality');
    this.finalityReset();
  },
  finalityReset() {
    // We need to do this here to avoid complexity achievements being applied in the eternity reset.
    // As said below, this method shouldn't apply rewards.
    FinalityShards.initializeStartingComplexityAchievements();
    // Here are the things that complexity sometimes (but not always) fails to reset and
    // finality should always reset. They're here since (1) it's a convenient
    // distinguishing place to put them and (2) studies need to be reset first,
    // otherwise you don't enter CC6 (as you should).
    player.bestBoostPower = 1;
    player.boughtTheorems = [0, 0, 0];
    player.studies = [
      false, false, false, false, false, false,
      false, false, false, false, false, false,
      0, 0, 0, 0
    ];
    player.firstTwelveStudyPurchaseOrder = [];
    // Extra theorems seem to fit in best here, because they're theorem-related, even though
    // nothing resets them other than finality.
    player.extraTheorems = [0, 0, 0, 0];
    // Complexities are here because they're used by a complexity achievement
    // to determine starting eternities.
    player.complexities = FinalityStartingBenefits.complexities();
    // This function takes care of applying the rewards for certain numbers of achievements,
    // so don't do it in initializeStartingComplexityAchievements().
    ComplexityPrestigeLayer.complexityReset();
    player.finalityStars = new Decimal(1);
    FinalityGenerators.list.forEach(x => x.resetAmount());
    player.complexityPoints = FinalityStartingBenefits.complexityPoints().plus(FinalityMilestones.startingComplexityPoints());
    player.complexityStars = new Decimal(2);
    player.complexityGenerators = initialComplexityGenerators(),
    player.highestComplexityGenerator = 0;
    player.complexityChallengeCompletions = player.complexityChallengeCompletions.map(
      x => Math.min(x, FinalityMilestones.keptComplexityChallenges()));
    // We keep hasGainedShards for the same reason we keep hasGainedPermanence in complexity;
    // it's used only for display.
    player.powers = {
      seed: player.powers.initialSeed,
      initialSeed: player.powers.initialSeed,
      unlocked: false,
      upgrades: [0, 0, 0],
      active: [],
      stored: [],
      gain: player.powers.gain,
      respec: false,
      hasGainedShards: player.powers.hasGainedShards,
      shards: 0,
      shardUpgrades: [0, 0, 0, 0],
      powerDeletionMode: player.powers.powerDeletionMode,
      presets: player.powers.presets,
      craft: {
        type: 'normal',
        rarity: 1,
      },
      lastData: {
        lowRarity: false,
        type: 'normal'
      },
      autoSort: {
        active: player.powers.autoSort.active,
        stored: player.powers.autoSort.stored
      }
    };
    // Jump to another seed, so each finality gets a new seed that doesn't depend
    // on when finality happened to happen.
    RNG.jump(Finalities.amount() * Math.pow(2, 20));
    // Note that player.oracle.timeSimulated doesn't matter here at all.
    // We let the player keep their settings since they probably want to.
    player.oracle = {
      unlocked: false,
      time: player.oracle.time,
      timeSimulated: 256,
      complexityPoints: new Decimal(0),
      complexityPointGain: new Decimal(0),
      complexityChallengeCompletions: [0, 0, 0, 0, 0, 0],
      originalComplexityChallengeCompletions: [0, 0, 0, 0, 0, 0],
      used: false,
      alert: player.oracle.alert,
      powerDisplay: player.oracle.powerDisplay,
      powers: []
    };
    player.galaxies.unlocked = false;
    if (Galaxy.isResetDilatedOnFinalityOn()) {
      Galaxy.resetDilated();
    } else {
      Galaxy.updateDilated();
    }
    player.stats.totalStarsProducedThisFinality = Stars.startingAmount();
    player.stats.totalInfinityStarsProducedThisFinality = new Decimal(0);
    player.stats.totalEternityStarsProducedThisFinality = new Decimal(0);
    player.stats.totalComplexityStarsProducedThisFinality = new Decimal(0);
    player.stats.totalCPProducedThisFinality = FinalityStartingBenefits.complexityPoints().plus(FinalityMilestones.startingComplexityPoints());
    player.stats.timeSinceFinality = 0;
    player.stats.lastTenComplexities = initialLastTenComplexities();
  }
}
