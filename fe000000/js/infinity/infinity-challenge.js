let InfinityChallenge = {
  goals: [Infinity,
    Decimal.pow(2, 1024), Decimal.pow(2, 10240), Decimal.pow(2, 14336), Decimal.pow(2, 32768),
    Decimal.pow(2, 24576), Decimal.pow(2, 20480), Decimal.pow(2, 22528), Decimal.pow(2, 57344),
  ],
  requirements: [Infinity,
    Decimal.pow(2, 8192), Decimal.pow(2, 20480), Decimal.pow(2, 32768), Decimal.pow(2, 36864),
    Decimal.pow(2, 49152), Decimal.pow(2, 53248), Decimal.pow(2, 57344), Decimal.pow(2, 61440),
  ],
  infinityChallengeButtonText(x) {
    if (this.isInfinityChallengeRunning(x)) {
      return "Exit challenge"
    } else if (this.isInfinityChallengeRequirementReached(x)) {
      return "Start challenge";
    } else {
      return "Requires more stars";
    }
  },
  exitInfinityChallengeHeaderButtonText() {
    let challenge = this.currentInfinityChallenge();
    if (challenge !== 0) {
      if (this.isInfinityChallengeCompleted(challenge)) {
        return 'already completed';
      } else {
        return 'this will ' + (InfinityPrestigeLayer.canInfinity() ? '' : 'not ') + 'complete it';
      }
    }
  },
  startOrExitInfinityChallenge(x) {
    if (this.isInfinityChallengeRunning(x)) {
      this.exitInfinityChallenge();
    } else if (this.isInfinityChallengeRequirementReached(x)) {
      this.startInfinityChallenge(x);
    }
  },
  restartInfinityChallenge() {
    let running = this.currentInfinityChallenge();
    if (running !== 0) {
      this.exitInfinityChallenge();
      this.startInfinityChallenge(running);
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
  isSomeInfinityChallengeRunning() {
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
  restartOnCompletion() {
    return player.infinityChallengeRestartOnCompletion;
  },
  toggleRestartOnCompletion() {
    player.infinityChallengeRestartOnCompletion = !player.infinityChallengeRestartOnCompletion;
  },
  startInfinityChallenge(x) {
    let newLimit = InfinityChallenge.getInfinityChallengeGoal(x);
    if (InfinityPrestigeLayer.canInfinity()) {
      InfinityPrestigeLayer.infinity(false, newLimit);
    } else {
      InfinityPrestigeLayer.infinityReset(false, newLimit);
    }
    if (Autobuyers.disableWhenStartingInfinityChallenge()) {
      Autobuyers.setAll(false);
    }
    this.setInfinityChallenge(x);
    Challenge.setChallenge(0);
  },
  exitInfinityChallenge() {
    if (InfinityPrestigeLayer.canInfinity()) {
      // Finish the infinity challenge.
      InfinityPrestigeLayer.infinity(false, null);
    } else {
      this.setInfinityChallenge(0);
      InfinityPrestigeLayer.infinityReset(false, null);
    }
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
    // This will do nothing if the player doesn't have the auto-EC milestone.
    let autoInfinityChallenges = EternityStartingBenefits.infinityChallenges();
    for (let i = 1; i <= autoInfinityChallenges; i++) {
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
  // This reward is theoretically unbalanced and is a large contributor to the need
  // for the multiplier softcap. I used to think it wouldn't cause a problem
  // until at least past break_infinity's limit, probably much farther,
  // but I think that may have been before eternity stars coexisted with it.
  // It used to be stronger; I nerfed it (this was a while ago, at the time of
  // the eternity update), mostly because I didn't want it to get to ^16 and for
  // infinity generator multipliers from other sources to thus be 3x as strong.
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
