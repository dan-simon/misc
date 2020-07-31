let InfinityChallenge = {
  goals: [Infinity,
    Decimal.pow(2, 1024), Decimal.pow(2, 10240), Decimal.pow(2, 14336), Decimal.pow(2, 32768),
    Decimal.pow(2, 24576), Decimal.pow(2, 20480), Decimal.pow(2, 22528), Decimal.pow(2, 57344),
  ],
  requirements: [Infinity,
    Decimal.pow(2, 8192), Decimal.pow(2, 20480), Decimal.pow(2, 32768), Decimal.pow(2, 36864),
    Decimal.pow(2, 49152), Decimal.pow(2, 53248), Decimal.pow(2, 57344), Decimal.pow(2, 61440),
  ],
  startOrExitInfinityChallenge(x) {
    if (this.isInfinityChallengeRunning(x)) {
      this.exitInfinityChallenge();
    } else if (this.isInfinityChallengeRequirementReached(x)) {
      this.startInfinityChallenge(x);
    }
  },
  currentInfinityChallenge() {
    return player.currentInfinityChallenge;
  },
  getInfinityChallengeGoal(x) {
    return this.goals[x];
  },
  getInfinityChallengeRequirement(x) {
    return this.requirements[x];
  },
  totalStarsProducedThisEternity() {
    return player.stats.totalStarsProducedThisEternity;
  },
  isInfinityChallengeRequirementReached(x) {
    return this.totalStarsProducedThisEternity().gte(this.getInfinityChallengeRequirement(x));
  },
  isInfinityChallengeRunning(x) {
    return this.currentInfinityChallenge() === x;
  },
  isSomeInfinityChallengeRunning(x) {
    return this.currentInfinityChallenge() !== 0;
  },
  isNoInfinityChallengeRunning() {
    return this.currentInfinityChallenge() === 0;
  },
  infinityChallengeStatusDescription(x) {
    if (this.isInfinityChallengeCompleted(x)) {
      if (this.isInfinityChallengeRunning(x)) {
        return 'Completed, running';
      } else {
        return 'Completed';
      }
    } else {
      if (this.isInfinityChallengeRunning(x)) {
        return 'Running';
      } else {
        return '';
      }
    }
  },
  setInfinityChallenge(x) {
    player.currentInfinityChallenge = x;
  },
  startInfinityChallenge(x) {
    this.setInfinityChallenge(x);
    Challenge.setChallenge(0);
    InfinityPrestigeLayer.infinityReset();
  },
  exitInfinityChallenge() {
    this.setInfinityChallenge(0);
    InfinityPrestigeLayer.infinityReset();
  },
  checkForInfinityChallengeCompletion() {
    let cc = this.currentInfinityChallenge();
    if (cc !== 0) {
      this.completeInfinityChallenge(cc);
    }
  },
  completeInfinityChallenge(x) {
    player.infinityChallengesCompleted[x - 1] = true;
  },
  checkForAllAutoInfinityChallengeCompletions() {
    // Don't call this unless the player actually has
    // the relevant eternity milestone.
    for (let i = 1; i <= 8; i++) {
      this.checkForAutoInfinityChallengeCompletion(i);
    }
  },
  checkForAutoInfinityChallengeCompletion(x) {
    // Don't call this unless the player actually has
    // the relevant eternity milestone.
    if (this.isInfinityChallengeRequirementReached(x)) {
      this.completeInfinityChallenge(x);
    }
  },
  isInfinityChallengeCompleted(x) {
    return player.infinityChallengesCompleted[x - 1];
  },
  numberOfInfinityChallengesCompleted() {
    return player.infinityChallengesCompleted.reduce((a, b) => a + b);
  },
  multiplier() {
    return Decimal.pow(2, this.numberOfInfinityChallengesCompleted() / 4);
  },
  infinityChallenge3PrestigePowerExponent() {
    return 8 / (8 + player.stats.prestigesThisInfinity);
  },
  infinityChallenge3Reward() {
    return 1 + Prestige.prestigePower().log(2);
  },
  infinityChallenge4Pow() {
    return Math.min(player.stats.timeSincePurchase / 16, 1);
  },
  infinityChallenge4Reward() {
    return 1 + player.stats.timeSinceInfinity / 64;
  },
  infinityChallenge5Pow() {
    return Math.min(1, Math.log2(Math.max(Stars.amount().log(2), 1)) / 16);
  },
  // This reward is theoretically unbalanced and will eventually make everything explode,
  // but I'm fairly sure it doesn't do so until past break_infinity's limit,
  // probably much farther. It used to be stronger; I nerfed it, mostly because
  // I didn't want it to get to ^16 and for infinity dimension multipliers
  // from other sources to thus be 3x as stronger.
  infinityChallenge5Reward() {
    return 1 + Math.sqrt(Math.log2(Math.max(Stars.amount().log(2) / 16384, 1)));
  },
  infinityChallenge6PrestigePowerExponent() {
    return 1 / (1 + player.stats.prestigesThisInfinity % 2);
  },
  // This is another theoretically problematic but practically probably-fine reward.
  // I think it's slightly more likely to be a problem than the previous one, though.
  infinityChallenge6Reward() {
    return 1 + Math.log2(Math.max(InfinityStars.amount().log(2), 1)) / 512;
  },
  infinityChallenge8PurchasesLeft() {
    return 7 - player.stats.purchasesThisInfinity + 9 * player.stats.purchasesThisInfinityByType[8];
  },
  color(x) {
    return Colors.makeStyle(this.isInfinityChallengeCompleted(x), true);
  }
}
