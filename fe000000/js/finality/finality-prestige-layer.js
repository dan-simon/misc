let FinalityPrestigeLayer = {
  complexityPointRequirementForFinality() {
    return Decimal.pow(2, Math.pow(2, 16));
  },
  canFinality() {
    return ComplexityPoints.totalCPProducedThisFinality().gte(this.complexityPointRequirementForFinality());
  },
  requirementVisible() {
    return !this.canComplexity() && PrestigeLayerProgress.hasReached('complexity');
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
    return new Decimal(2);
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
    return (Finalities.amount() + 1) % 64 === 0;
  },
  finalityShardGain() {
    return 16 * Finalities.amount() * (areFinalityShardsDoubled ? 2 : 1);
  },
  finalityShards() {
    return FinalityShards.amount();
  },
  newFinalityShards() {
    return this.finalityShards() + this.finalityShardGain();
  },
  totalFinalityPoints() {
    return FinalityShards.total();
  },
  finalityPointGainRatio() {
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
    FinalityShards.maybeRespec();
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
    // This function takes care of applying the rewards for certain numbers of achievements,
    // so don't do it in initializeStartingComplexityAchievements().
    ComplexityPrestigeLayer.complexityReset();
    // Lots of stuff needs to go here, but that's hopefully pretty clear.
  }
}
