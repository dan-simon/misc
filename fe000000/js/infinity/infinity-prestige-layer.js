let InfinityPrestigeLayer = {
  canInfinityBeBroken() {
    return Challenge.areAllChallengesCompleted();
  },
  isInfinityBroken() {
    return this.canInfinityBeBroken() && player.breakInfinity &&
    Challenge.isNoChallengeRunning() && InfinityChallenge.isNoInfinityChallengeRunning();
  },
  breakInfinityButtonText() {
    return player.breakInfinity ?
      `Fix infinity: force infinity at ${format(Decimal.pow(2, 256))} stars` :
      `Break infinity: allow stars to go beyond ${format(Decimal.pow(2, 256))}, with greater IP gain`;
  },
  toggleBreakInfinity() {
    if (this.canInfinityBeBroken()) {
      player.breakInfinity = !player.breakInfinity;
    }
  },
  starRequirementForInfinity() {
    if (InfinityChallenge.isSomeInfinityChallengeRunning()) {
      return InfinityChallenge.getInfinityChallengeGoal(InfinityChallenge.currentInfinityChallenge());
    } else {
      return Decimal.pow(2, 256);
    }
  },
  canInfinity() {
    return Stars.amount().gte(this.starRequirementForInfinity());
  },
  mustInfinity() {
    return this.canInfinity() && !this.isInfinityBroken();
  },
  isRequirementVisible() {
    return !this.canInfinity();
  },
  isAmountSpanVisible() {
    return this.isRequirementVisible() && (player.infinities > 0 || player.eternities.gt(0) || player.complexities > 0);
  },
  infinityPointGain() {
    let oom = (this.isInfinityBroken() ? Stars.amount() : this.starRequirementForInfinity()).max(1).log(2) / 256;
    return Decimal.pow(2, oom).floor();
  },
  infinityPoints() {
    return InfinityPoints.amount();
  },
  newInfinityPoints() {
    return this.infinityPoints().plus(this.infinityPointGain());
  },
  totalInfinityPoints() {
    return InfinityPoints.totalIPProducedThisEternity();
  },
  infinityPointGainRatio() {
    return this.infinityPointGain().div(this.totalInfinityPoints());
  },
  infinityPointGainRatioText() {
    if (this.totalInfinityPoints().neq(0)) {
      return format(this.infinityPointGainRatio()) + 'x total, ';
    } else {
      return '';
    }
  },
  currentIPPerSec() {
    return this.infinityPointGain().div(player.stats.timeSinceInfinity);
  },
  peakIPPerSec() {
    return player.stats.peakIPPerSec;
  },
  updatePeakIPPerSec() {
    let cps = this.currentIPPerSec();
    if (this.canInfinity() && cps.gt(player.stats.peakIPPerSec)) {
      player.stats.peakIPPerSec = cps;
      player.stats.timeSinceLastPeakIPPerSec = 0;
    }
  },
  infinity() {
    if (!this.canInfinity()) return;
    if (EternityChallenge.isEternityChallengeRunning(4) &&
      EternityChallenge.eternityChallenge4RemainingInfinities() === 0) {
      EternityChallenge.exitEternityChallenge();
    }
    let gain = this.infinityPointGain();
    InfinityPoints.addAmount(gain);
    Infinities.increment();
    ComplexityAchievements.checkForComplexityAchievements('infinity');
    Stats.addInfinity(player.stats.timeSinceInfinity, gain);
    Challenge.checkForChallengeCompletion();
    InfinityChallenge.checkForInfinityChallengeCompletion();
    Challenge.setChallenge(0);
    InfinityChallenge.setInfinityChallenge(0);
    this.infinityReset();
  },
  infinityReset() {
    Prestige.prestigeReset(true);
    player.prestigePower = new Decimal(1);
    player.infinityStars = new Decimal(1);
    InfinityGenerators.list.forEach(x => x.resetAmount());
    player.stats.timeSinceInfinity = 0;
    player.stats.timeSinceLastPeakIPPerSec = Math.pow(2, 256);
    player.stats.peakIPPerSec = new Decimal(0);
    player.stats.purchasesThisInfinity = 0;
    player.stats.purchasesThisInfinityByType = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    player.stats.prestigesThisInfinity = 0;
  }
}
