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
    return !this.canEternity() && (player.infinities > 0 || player.eternities.gt(0) || player.complexities > 0);
  },
  resetText() {
    if (this.canEternity()) {
      return 'eternity';
    } else {
      return 'do an eternity reset (no eternity point gain or eternity gain)';
    }
  },
  eternityPointGain() {
    let oom = InfinityPoints.totalIPProducedThisEternity().log(2) / 256;
    return Decimal.pow(2, oom).floor();
  },
  currentEPPerSec() {
    return this.eternityPointGain().div(player.stats.timeSinceEternity);
  },
  peakEPPerSec() {
    return player.stats.peakEPPerSec;
  },
  updatePeakEPPerSec() {
    let cps = this.currentEPPerSec();
    if (this.canEternity() && cps.gt(player.stats.peakEPPerSec)) {
      player.stats.peakEPPerSec = cps;
      player.stats.timeSinceLastPeakEPPerSec = 0;
    }
  },
  eternity() {
    if (!this.canEternity()) return;
    let gain = this.eternityPointGain();
    EternityPoints.addAmount(gain);
    Eternities.add(Eternities.commonEternityGainMultiplier());
    Stats.addEternity(player.stats.timeSinceEternity, gain);
    // Eternity challenge handling
    EternityChallenge.checkForEternityChallengeCompletion();
    // I'm not sure whether or not this should go in the reset function.
    Studies.maybeRespec();
    EternityChallenge.maybeRespec();
    this.eternityReset();
  },
  eternityReset() {
    InfinityPrestigeLayer.infinityReset();
    // Not handled by Infinity.infinityReset() since that's also called
    // when you start a challenge.
    Challenge.setChallenge(0);
    InfinityChallenge.setInfinityChallenge(0);
    player.eternityStars = new Decimal(2);
    EternityGenerators.list.forEach(x => x.resetAmount());
    player.boostPower = 1;
    player.infinityPoints = EternityStartingBenefits.infinityPoints();
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
    // Doesn't need to be part of eternity milestone 2,
    // since after eternity milestone 2 you have all the
    // normal autobuyers anyway (plus the slow autobuyers have
    // nothing to do with challenges).
    // Honestly resetting autobuyer timers feels really bad
    // to me for some reason.
    player.slowAutobuyers = [
      false, false, false, false, false, false, false, false, false,
    ];
    // Reset color being generated, as the player desired.
    Chroma.updateChromaOnEternity();
    // Small bonus, arguably unexpected but not that big in the grand scheme of things.
    player.stats.totalStarsProducedThisEternity = EternityStartingBenefits.stars();
    player.stats.totalIPProducedThisEternity = EternityStartingBenefits.infinityPoints();
    player.stats.timeSinceEternity = 0;
    player.stats.timeSinceLastPeakEPPerSec = Math.pow(2, 256);
    player.stats.peakEPPerSec = new Decimal(0);
    player.stats.lastTenInfinities = initialLastTenInfinities();
  }
}
