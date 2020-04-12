let EternityPrestigeLayer = {
  infinityPointRequirementForEternity() {
    return Decimal.pow(2, 256);
  },
  canEternity() {
    return InfinityPoints.amount().gte(this.infinityPointRequirementForEternity());
  },
  eternityPointGain() {
    let oom = InfinityPoints.amount().log(2) / 256;
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
    Eternities.increment();
    Stats.addEternity(player.stats.timeSinceEternity, gain);
    // Not handled by Infinity.infinityReset() since that's also called
    // when you start a challenge.
    Challenge.setChallenge(0);
    InfinityChallenge.setInfinityChallenge(0);
    // I'm not sure whether or not this should go in the reset function.
    Studies.maybeRespec();
    this.eternityReset();
  },
  eternityReset() {
    InfinityPrestigeLayer.infinityReset();
    player.eternityStars = new Decimal(2);
    EternityGenerators.list.forEach(x => x.resetAmount());
    player.boostPower = 1;
    player.infinityPoints = EternityStartingBenefits.infinityPoints();
    player.infinities = EternityStartingBenefits.infinities();
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
    // Small bonus, arguably unexpected but not that big in the grand scheme of things.
    player.stats.totalStarsProducedThisEternity = EternityStartingBenefits.stars();
    player.stats.totalIPProducedThisEternity = EternityStartingBenefits.infinityPoints();
    player.stats.timeSinceEternity = 0;
    player.stats.timeSinceLastPeakEPPerSec = Math.pow(2, 256);
    player.stats.peakEPPerSec = new Decimal(0);
    player.stats.lastTenInfinities = initialLastTenInfinities();
  }
}
