let EternityPrestigeLayer = {
  infinityPointRequirementForEternity() {
    if (EternityChallenge.isSomeEternityChallengeRunning()) {
      return EternityChallenge.getEternityChallengeGoal(EternityChallenge.currentEternityChallenge());
    } else {
      return Decimal.pow(2, 256);
    }
  },
  canEternity() {
    return InfinityPoints.totalIPProducedThisEternity().gte(this.infinityPointRequirementForEternity());
  },
  isRequirementVisible() {
    return !this.canEternity() && PrestigeLayerProgress.hasReached('infinity');
  },
  isAmountSpanVisible() {
    return this.isRequirementVisible() && PrestigeLayerProgress.hasReached('eternity');
  },
  resetText() {
    if (this.canEternity()) {
      return 'eternity';
    } else {
      return 'do an eternity reset (no eternity point gain or eternity gain)';
    }
  },
  eternityPointGain() {
    if (!this.canEternity()) {
      return new Decimal(0);
    }
    let oom = InfinityPoints.totalIPProducedThisEternity().max(1).log(2) / 256;
    return Decimal.pow(2, oom).floor();
  },
  eternityPoints() {
    return EternityPoints.amount();
  },
  newEternityPoints() {
    return this.eternityPoints().plus(this.eternityPointGain());
  },
  totalEternityPoints() {
    return EternityPoints.totalEPProducedThisComplexity();
  },
  newTotalEternityPoints() {
    return this.totalEternityPoints().plus(this.eternityPointGain());
  },
  eternityPointGainRatio() {
    return this.eternityPointGain().div(this.totalEternityPoints());
  },
  eternityPointGainRatioText() {
    if (this.totalEternityPoints().neq(0)) {
      return format(this.eternityPointGainRatio()) + 'x total, ';
    } else {
      return '';
    }
  },
  eternityPointNext() {
    return Decimal.pow(this.eternityPointGain().plus(1), 256);
  },
  eternityPointNextText() {
    if (this.eternityPointGain().lt(256)) {
      return ', next at ' + format(this.eternityPointNext()) + ' IP';
    } else {
      return '';
    }
  },
  currentEPPerSec() {
    // This Math.max is here to prevent issues with gain after 0 seconds from starting benefits.
    return this.eternityPointGain().div(Math.max(player.stats.timeSinceEternity, 1 / 16));
  },
  currentLogEPPerSec() {
    return Stats.getLogPerSec(player.stats.timeSinceEternity, this.eternityPointGain(), this.totalEternityPoints(), false);
  },
  currentLogEPPerSecDisplay() {
    return Stats.getLogPerSec(player.stats.timeSinceEternity, this.eternityPointGain(), this.totalEternityPoints(), true);
  },
  peakEPPerSec() {
    return player.stats.peakEPPerSec;
  },
  peakLogEPPerSec() {
    return player.stats.peakLogEPPerSec;
  },
  peakLogEPPerSecDisplay() {
    return this.peakLogEPPerSec() / Math.log2(NotationOptions.exponentBase());
  },
  updatePeakEPPerSec() {
    let cps = this.currentEPPerSec();
    if (this.canEternity() && cps.gt(player.stats.peakEPPerSec)) {
      player.stats.peakEPPerSec = cps;
      player.stats.timeSinceLastPeakEPPerSec = 0;
    }
  },
  updatePeakLogEPPerSec() {
    let cps = this.currentLogEPPerSec();
    if (this.canEternity() && cps >= player.stats.peakLogEPPerSec) {
      player.stats.peakLogEPPerSec = cps;
      player.stats.timeSinceLastPeakLogEPPerSec = 0;
    }
  },
  showLog(x) {
    let setting = Options.showLogSetting(x);
    if (setting === 'Default') {
      return Autobuyer(13).hasAutobuyer() && ['Time past peak log/sec', 'Fraction of peak log/sec'].includes(Autobuyer(13).mode());
    } else if (setting === 'Off') {
      return false;
    } else if (setting === 'On') {
      return true;
    }
  },
  compareEPGain() {
    if (this.eternityPointGain().lt(this.eternityPoints())) {
      player.stats.timeSinceEPGainWasAmount = 0;
    }
    if (this.eternityPointGain().lt(this.totalEternityPoints())) {
      player.stats.timeSinceEPGainWasTotal = 0;
    }
  },
  eternityConfirmationMessage() {
    let gain = this.eternityPointGain();
    return 'Are you sure you want to eternity for ' +
    formatInt(gain) + ' eternity point' + pluralize(gain, '', 's') + '?';
  },
  eternityResetConfirmationMessage() {
    return 'Are you sure you want to do an eternity reset? This will not give you any eternity points.';
  },
  eternity(manual) {
    if (!this.canEternity()) return;
    if (manual && Options.confirmation('eternity') && !confirm(this.eternityConfirmationMessage())) return;
    Achievements.checkForAchievements('eternity');
    let gain = this.eternityPointGain();
    let amount = this.eternityPoints();
    EternityPoints.addAmount(gain);
    Eternities.add(Eternities.commonEternityGainMultiplier());
    // Note that this happens before starting benefits which might care
    // about additional eternities from complexity achievements.
    ComplexityAchievements.checkForComplexityAchievements('eternity');
    Stats.addEternity(player.stats.timeSinceEternity, gain, amount);
    // Eternity challenge handling
    EternityChallenge.checkForEternityChallengeCompletion();
    // I'm not sure whether or not this should go in the reset function.
    Studies.maybeRespec();
    EternityChallenge.maybeRespec();
    Goals.recordPrestige('eternity');
    this.eternityReset(false);
  },
  eternityReset(manual) {
    if (manual && Options.confirmation('eternity') && !confirm(this.eternityResetConfirmationMessage())) return;
    let newLimit = (EternityMilestones.isEternityMilestoneActive(2) && player.breakInfinity) ? MultiverseCollapse.stars() : Decimal.pow(2, 256);
    InfinityPrestigeLayer.infinityReset(false, newLimit);
    // Not handled by Infinity.infinityReset() since that's also called
    // when you start a challenge.
    Challenge.setChallenge(0);
    InfinityChallenge.setInfinityChallenge(0);
    player.eternityStars = new Decimal(2);
    EternityGenerators.list.forEach(x => x.resetAmount());
    player.boostPower = 1;
    player.highestBoostsBoughtThisEternity = 0;
    player.infinityPoints = EternityStartingBenefits.infinityPoints().plus(FinalityStartingBenefits.infinityPoints());
    player.infinities = EternityStartingBenefits.infinities();
    player.realInfinities = 0;
    player.infinityGenerators = initialInfinityGenerators();
    player.highestInfinityGenerator = 0;
    player.infinityUpgrades = [0, 0];
    player.infinityChallengesCompleted = [
      false, false, false, false, false, false, false, false,
    ];
    if (!EternityMilestones.isEternityMilestoneActive(2)) {
      // No need to reset autobuyers. They'll only do anything if active,
      // which requires them to be unlocked.
      player.challengesCompleted = [
        false, false, false, false, false, false,
        false, false, false, false, false, false,
      ];
      player.breakInfinity = false;
    }
    // Don't reset the slow autobuyers; let the player keep those.
    // Reset color being generated, as the player desired.
    Chroma.updateChromaOnEternity();
    // Small bonus, arguably unexpected but not that big in the grand scheme of things.
    player.stats.totalStarsProducedThisEternity = Stars.startingAmount();
    player.stats.totalIPProducedThisEternity = EternityStartingBenefits.infinityPoints().plus(FinalityStartingBenefits.infinityPoints());
    player.stats.timeSinceEternity = 0;
    player.stats.timeSinceLastPeakEPPerSec = Math.pow(2, 256);
    player.stats.timeSinceLastPeakLogEPPerSec = Math.pow(2, 256);
    player.stats.timeSinceEPGainWasAmount = 0;
    player.stats.timeSinceEPGainWasTotal = 0;
    player.stats.peakEPPerSec = new Decimal(0);
    player.stats.peakLogEPPerSec = 0;
    player.stats.lastTenInfinities = initialLastTenInfinities();
  }
}
