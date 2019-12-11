let InfinityChallenge = {
  goals: [Infinity,
    Decimal.pow(2, 1024), Decimal.pow(2, 10240), Decimal.pow(2, 14336), Decimal.pow(2, 65536),
    Decimal.pow(2, 65536), Decimal.pow(2, 65536), Decimal.pow(2, 65536), Decimal.pow(2, 65536),
  ],
  requirements: [Infinity,
    Decimal.pow(2, 8192), Decimal.pow(2, 20480), Decimal.pow(2, 32768), Decimal.pow(2, 65536),
    Decimal.pow(2, 65536), Decimal.pow(2, 65536), Decimal.pow(2, 65536), Decimal.pow(2, 65536),
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
  isInfinityChallengeRequirementReached(x) {
    return player.stats.totalStarsProducedThisEternity.gte(this.getInfinityChallengeRequirement(x));
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
  isInfinityChallengeCompleted(x) {
    return player.infinityChallengesCompleted[x - 1];
  },
  numberOfInfinityChallengesCompleted() {
    return player.infinityChallengesCompleted.reduce((a, b) => a + b);
  },
  multiplier() {
    return Decimal.pow(2, this.numberOfInfinityChallengesCompleted() / 4);
  },
  areAllInfinityChallengesCompleted() {
    return this.numberOfInfinityChallengesCompleted() === 2;
  },
  infinityChallenge3PrestigePowerExponent() {
    return 8 / (8 + player.stats.prestigesThisInfinity);
  },
  infinityChallenge3Reward() {
    return 1 + Prestige.prestigePower().log(2);
  }
}
