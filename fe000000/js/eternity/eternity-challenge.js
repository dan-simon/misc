let EternityChallenge = {
  goals: [Infinity,
    Decimal.pow(2, Math.pow(2, 32)), Decimal.pow(2, Math.pow(2, 32)), Decimal.pow(2, Math.pow(2, 32)),
    Decimal.pow(2, Math.pow(2, 32)), Decimal.pow(2, Math.pow(2, 32)), Decimal.pow(2, Math.pow(2, 32)),
    Decimal.pow(2, Math.pow(2, 32)), Decimal.pow(2, Math.pow(2, 32)),
  ],
  requirements: [Infinity,
    Decimal.pow(2, 1.75 * Math.pow(2, 21)), 1024, Decimal.pow(2, 1.5 * Math.pow(2, 18)),
    Decimal.pow(2, Math.pow(2, 32)), Decimal.pow(2, Math.pow(2, 32)), 12,
    Decimal.pow(2, Math.pow(2, 32)), Decimal.pow(2, Math.pow(2, 32)),
  ],
  goalIncreases: [Infinity,
    Decimal.pow(2, Math.pow(2, 32)), Decimal.pow(2, Math.pow(2, 32)), Decimal.pow(2, Math.pow(2, 32)),
    Decimal.pow(2, Math.pow(2, 32)), Decimal.pow(2, Math.pow(2, 32)), Decimal.pow(2, Math.pow(2, 32)),
    Decimal.pow(2, Math.pow(2, 32)), Decimal.pow(2, Math.pow(2, 32)),
  ],
  requirementIncreases: [Infinity,
    Decimal.pow(2, 1.5 * Math.pow(2, 20)), 512, Decimal.pow(2, Math.pow(2, 17)),
    Decimal.pow(2, Math.pow(2, 32)), Decimal.pow(2, Math.pow(2, 32)), 4,
    Decimal.pow(2, Math.pow(2, 32)), Decimal.pow(2, Math.pow(2, 32)),
  ],
  rewards: [
    x => Decimal.pow(2, x * Math.pow(player.stars.max(1).log2(), 0.5) / 4),
    x => 1 - x / 8,
    x => 1 + x / 512,
    x => InfinityPoints.amount().max(1).pow(x / 512),
    x => 1 + x / 64,
    x => 1 + x / 8,
    x => EternityPoints.amount().max(1).pow(x / 4),
    x => Decimal.pow(16, x),
  ],
  resourceAmounts: [
    () => Stars.amount(),
    () => Boost.bought(),
    () => Prestige.prestigePower(),
    () => InfinityPoints.amount(),
    () => InfinityStars.amount(),
    () => EternityChallenge.getTotalEternityChallengeCompletions(),
    () => EternityPoints.amount(),
    () => EternityStars.amount(),
  ],
  resourceNames: [
    'stars', 'boosts', 'prestige power', 'infinity points',
    'infinity stars', 'total eternity challenge completions',
    'eternity points', 'eternity stars',
  ],
  costs: [Infinity, 5, 6, 8, 10, 12, 15, 20, 24],
  pressEternityChallengeButton(x) {
    if (this.isEternityChallengeRunning(x)) {
      this.exitEternityChallenge();
    } else if (this.canEternityChallengeBeStarted(x)) {
      this.startEternityChallenge(x);
    } else if (this.canEternityChallengeBeUnlocked(x)) {
      this.unlockEternityChallenge(x);
    }
  },
  currentEternityChallenge() {
    return player.currentEternityChallenge;
  },
  getEternityChallengeGoal(x) {
    return this.goals[x].times(Decimal.pow(this.goalIncreases[x], this.getEternityChallengeCompletions(x)));
  },
  getEternityChallengeRequirement(x) {
    let initialRequirement = this.requirements[x];
    if (Decimal.gt(initialRequirement, 1e10)) {
      return initialRequirement.times(Decimal.pow(this.requirementIncreases[x], this.getEternityChallengeCompletions(x)));
    } else {
      return initialRequirement + this.requirementIncreases[x] * this.getEternityChallengeCompletions(x);
    }
  },
  getEternityChallengeReward(x) {
    return this.rewards[x](this.getRewardCalculationEternityChallengeCompletions(x));
  },
  getEternityChallengeNextReward(x) {
    return this.rewards[x](this.getNextRewardCalculationEternityChallengeCompletions(x));
  },
  getEternityChallengeCost(x) {
    return this.costs[x];
  },
  getUnlockedEternityChallenge() {
    return player.unlockedEternityChallenge;
  },
  getUnlockedEternityChallengeCost() {
    let challenge = this.getUnlockedEternityChallenge();
    return (challenge > 0) ? this.getEternityChallengeCost(challenge) : 0;
  },
  getEternityChallengeCompetions(x) {
    return player.eternityChallengeCompletions[x - 1];
  },
  getRewardCalculationEternityChallengeCompetions(x) {
    if (EternityChallenge.isEternityChallengeRunning(6)) {
      return 0;
    }
    return this.getEternityChallengeCompetions(x) *
      (x === 6 ? 1 : EternityChallenge.getEternityChallengeReward(6));
  },
  getNextRewardCalculationEternityChallengeCompetions(x) {
    if (EternityChallenge.isEternityChallengeRunning(6)) {
      return 0;
    }
    return (1 + this.getEternityChallengeCompetions(x)) *
      (x === 6 ? 1 : EternityChallenge.getEternityChallengeReward(6));
  },
  getTotalEternityChallengeCompletions() {
    return [1, 2, 3, 4, 5, 6, 7, 8].map(x => this.getEternityChallengeCompetions(x)).reduce((a, b) => a + b);
  },
  getEternityChallengeResourceAmount(x) {
    return this.resourceAmounts[x]();
  },
  canEternityChallengeBeStarted(x) {
    return this.getUnlockedEternityChallenge() === x;
  },
  isEternityChallengeRunning(x) {
    return this.currentEternityChallenge() === x;
  },
  isSomeEternityChallengeRunning(x) {
    return this.currentEternityChallenge() !== 0;
  },
  isNoEternityChallengeRunning() {
    return this.currentEternityChallenge() === 0;
  },
  eternityChallengeCostDescription(x) {
    // This could be done as easily in the HTML but it seems nice to have a method
    return format(this.eternityChallengeResourceAmount(x)) + '/' + format(this.eternityChallengeRequirement(x)) +
      ' ' + this.getEternityChallengeResourceName(x);
  },
  eternityChallengeCostDescription(x) {
    return 'Cost: ' + format(this.getEternityChallengeCost(x)) + ' theorems';
  },
  eternityChallengeStatusDescription(x) {
    if (this.isEternityChallengeRunning(x)) {
      return 'Running';
    } else {
      return '';
    }
  },
  eternityChallengeCompletionsDescription(x) {
    // This could be done as easily in the HTML but it seems nice to have a method (also applies to some things below)
    return 'Completed ' + format(this.getEternityChallengeCompletions(x)) + '/' + format(4) + ' times';
  },
  setEternityChallenge(x) {
    player.currentEternityChallenge = x;
  },
  // here are some functions that should be together
  unlockEternityChallenge(x) {
    // This function should only be called if the eternity challenge
    // has previously been confirmed to be unlockable.
    player.unspentTheorems -= this.getEternityChallengeCost(x);
    player.unlockedEternityChallenge = x;
  },
  lockUnlockedEternityChallenge() {
    player.unspentTheorems += this.getUnlockedEternityChallengeCost();
    player.unlockedEternityChallenge = 0;
  },
  // nothing below this line has been changed yet at all
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
  // new code after this point
  eternityChallenge1InfinityStarsEffect() {
    return 1 - 1 / (1 + player.infinityStars.log2().max(1) / 4096);
  },
  eternityChallenge1EternityStarsEffect() {
    return 1 - 1 / (1 + player.eternityStars.log2().max(1) / 256);
  },
  eternityChallenge4AllowedInfinities() {
    return 12 - 4 * this.getEternityChallengeCompetions(4);
  },
  eternityChallenge4RemainingInfinities() {
    return this.eternityChallenge4AllowedInfinities() - Infinities.realAmount();
  }
}
