let EternityChallenge = {
  goals: [Infinity,
    Decimal.pow(2, 512), Decimal.pow(2, 8192), Decimal.pow(2, 1024),
    Decimal.pow(2, 1.375 * Math.pow(2, 14)), Decimal.pow(2, 1.125 * Math.pow(2, 15)),
    Decimal.pow(2, 1.6875 * Math.pow(2, 15)), Decimal.pow(2, 1.5 * Math.pow(2, 16)),
    Decimal.pow(2, 1.75 * Math.pow(2, 15)),
  ],
  requirements: [Infinity,
    Decimal.pow(2, 1.75 * Math.pow(2, 21)), 1024, Decimal.pow(2, 1.375 * Math.pow(2, 18)),
    Decimal.pow(2, 1.375 * Math.pow(2, 14)), Decimal.pow(2, 1.375 * Math.pow(2, 16)), 15,
    Decimal.pow(2, 768), Decimal.pow(2, 8192),
  ],
  goalIncreases: [Infinity,
    Decimal.pow(2, 1024), Decimal.pow(2, 9216), Decimal.pow(2, 320),
    Decimal.pow(2, 1.75 * Math.pow(2, 14)), Decimal.pow(2, 1.375 * Math.pow(2, 14)),
    Decimal.pow(2, 1.4375 * Math.pow(2, 16)), Decimal.pow(2, 1.25 * Math.pow(2, 16)),
    Decimal.pow(2, Math.pow(2, 16)),
  ],
  requirementIncreases: [Infinity,
    Decimal.pow(2, 1.5 * Math.pow(2, 20)), 512, Decimal.pow(2, 1.25 * Math.pow(2, 17)),
    Decimal.pow(2, Math.pow(2, 15)), Decimal.pow(2, Math.pow(2, 16)), 5,
    Decimal.pow(2, 768), Decimal.pow(2, 8192),
  ],
  rewards: [
    null,
    x => Decimal.pow(2, x * Math.pow(Stars.amount().max(1).log2(), 0.5) / 4),
    x => 1 - x / 16,
    x => 1 + x / 256,
    x => Decimal.pow(2, x * Math.pow(InfinityPoints.totalIPProducedThisEternity().max(1).log2(), 0.5) / 2),
    x => 1 + x / 64,
    x => 1 + x / 16,
    x => EternityPoints.totalEPProducedThisComplexity().max(1).pow(x / 4),
    x => Decimal.pow(2, 32 * x),
  ],
  resourceAmounts: [
    () => null,
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
    null, 'stars', 'boosts', 'prestige power', 'infinity points',
    'infinity stars', 'total EC completions',
    'eternity points', 'eternity stars',
  ],
  costs: [Infinity, 5, 6, 8, 10, 12, 15, 20, 24],
  totalCompletionsRewardThresholds: [null, 8, 16, 24, 32],
  pressEternityChallengeButton(x) {
    if (this.isEternityChallengeRunning(x)) {
      this.exitEternityChallenge();
    } else if (this.canEternityChallengeBeStarted(x)) {
      this.startEternityChallenge(x);
    } else if (this.canEternityChallengeBeUnlocked(x)) {
      this.unlockEternityChallenge(x);
    }
  },
  eternityChallengeButtonText(x) {
    if (this.isEternityChallengeRunning(x)) {
      return 'Exit challenge';
    } else if (this.canEternityChallengeBeStarted(x)) {
      return 'Start challenge';
    } else if (this.canEternityChallengeBeUnlocked(x)) {
      return 'Unlock challenge';
    } else if (this.getUnlockedEternityChallenge() !== 0) {
      return 'Another EC already unlocked';
    } else if (Decimal.lt(this.getEternityChallengeResourceAmount(x), this.getEternityChallengeRequirement(x))) {
      return 'Requires more ' + this.getEternityChallengeResourceName(x);
    } else if (Studies.unspentTheorems() < this.getEternityChallengeCost(x)) {
      return 'Requires more unspent theorems';
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
    if (ComplexityAchievements.hasComplexityAchievement(3, 2)) {
      return 0;
    }
    return this.costs[x];
  },
  getUnlockedEternityChallenge() {
    return player.unlockedEternityChallenge;
  },
  getUnlockedEternityChallengeCost() {
    let challenge = this.getUnlockedEternityChallenge();
    return (challenge > 0) ? this.getEternityChallengeCost(challenge) : 0;
  },
  getEternityChallengeCompletions(x) {
    return player.eternityChallengeCompletions[x - 1];
  },
  isEternityChallengeCompleted(x) {
    return this.getEternityChallengeCompletions(x) >= 4;
  },
  getRewardCalculationEternityChallengeCompletions(x) {
    if (EternityChallenge.isEternityChallengeRunning(6)) {
      return 0;
    }
    return this.getEternityChallengeCompletions(x) *
      (x === 6 ? 1 : EternityChallenge.getEternityChallengeReward(6));
  },
  getNextRewardCalculationEternityChallengeCompletions(x) {
    if (EternityChallenge.isEternityChallengeRunning(6)) {
      return 0;
    }
    return (1 + this.getEternityChallengeCompletions(x)) *
      (x === 6 ? 1 : EternityChallenge.getEternityChallengeReward(6));
  },
  getTotalEternityChallengeCompletions() {
    return [1, 2, 3, 4, 5, 6, 7, 8].map(x => this.getEternityChallengeCompletions(x)).reduce((a, b) => a + b);
  },
  areAllEternityChallengesCompleted() {
    return this.getTotalEternityChallengeCompletions() >= 32;
  },
  getTotalCompletionsRewardThreshold(x) {
    return this.totalCompletionsRewardThresholds[x];
  },
  getTotalCompletionsRewardRawEffect(x) {
    if (x === 1) {
      return 1 + this.getTotalEternityChallengeCompletions() / 4;
    } else if (x === 2) {
      return Math.pow(1 + this.getTotalEternityChallengeCompletions() / 4, 3);
    } else if (x === 4) {
      return 2;
    }
    return null;
  },
  isTotalCompletionsRewardActive(x) {
    return this.getTotalEternityChallengeCompletions() >= this.getTotalCompletionsRewardThreshold(x);
  },
  getTotalCompletionsRewardEffect(x) {
    if (this.isTotalCompletionsRewardActive(x)) {
      return this.getTotalCompletionsRewardRawEffect(x);
    }
    return 1;
  },
  extraTheoremsRaw() {
    return this.getTotalEternityChallengeCompletions();
  },
  extraTheoremsIndex() {
    return 1;
  },
  extraTheoremsActualAndDisplay() {
    if (ComplexityAchievements.hasComplexityAchievement(4, 4)) {
      return player.extraTheorems[this.extraTheoremsIndex()];
    } else {
      return this.extraTheoremsRaw();
    }
  },
  getEternityChallengeResourceAmount(x) {
    return this.resourceAmounts[x]();
  },
  getEternityChallengeResourceName(x) {
    return this.resourceNames[x];
  },
  canEternityChallengeBeStarted(x) {
    return ComplexityAchievements.hasComplexityAchievement(3, 2) || this.getUnlockedEternityChallenge() === x;
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
  eternityChallengeRequirementDescription(x) {
    // This could be done as easily in the HTML but it seems nice to have a method.
    // Also, we don't use formatInt because it might show the current resource amount incorrectly
    // (for example, 2 stars rather than 1.75).
    return formatMaybeInt(this.getEternityChallengeResourceAmount(x)) + '/' + formatMaybeInt(this.getEternityChallengeRequirement(x)) +
      ' ' + this.getEternityChallengeResourceName(x);
  },
  eternityChallengeStatusDescription(x) {
    let description;
    if (this.isEternityChallengeCompleted(x)) {
      description = 'Completed (' + formatInt(this.getEternityChallengeCompletions(x)) + '/' + formatInt(4) + ')';
    } else {
      description = formatInt(this.getEternityChallengeCompletions(x)) + '/' + formatInt(4) + ' completions';
    }
    if (this.isEternityChallengeRunning(x)) {
      description += ', running';
    }
    return description;
  },
  setEternityChallenge(x) {
    player.currentEternityChallenge = x;
  },
  canEternityChallengeBeUnlocked(x) {
    if (ComplexityAchievements.hasComplexityAchievement(3, 2)) {
      return true;
    }
    return this.getUnlockedEternityChallenge() === 0 &&
      Decimal.gte(this.getEternityChallengeResourceAmount(x), this.getEternityChallengeRequirement(x)) &&
      Studies.unspentTheorems() >= this.getEternityChallengeCost(x);
  },
  unlockEternityChallenge(x) {
    // This function should only be called if the eternity challenge
    // has previously been confirmed to be unlockable.
    player.unlockedEternityChallenge = x;
  },
  canRespec() {
    return !ComplexityAchievements.hasComplexityAchievement(3, 2);
  },
  isRespecOn() {
    return player.respecEternityChallenge;
  },
  toggleRespec() {
    player.respecEternityChallenge = !player.respecEternityChallenge;
  },
  respec() {
    // This fails in situations where ECs being locked is no longer a thing.
    if (this.canRespec()) {
      this.lockUnlockedEternityChallenge();
    }
  },
  maybeRespec() {
    if (this.isRespecOn()) {
      this.respec();
    }
    player.respecEternityChallenge = false;
  },
  respecAndReset() {
    this.respec();
    if (EternityPrestigeLayer.canEternity()) {
      EternityPrestigeLayer.eternity();
    } else {
      EternityPrestigeLayer.eternityReset();
    }
  },
  lockUnlockedEternityChallenge() {
    // This can happen if we're respeccing and doing an eternity reset.
    this.setEternityChallenge(0);
    player.unlockedEternityChallenge = 0;
  },
  startEternityChallenge(x) {
    this.setEternityChallenge(x);
    EternityPrestigeLayer.eternityReset();
  },
  exitEternityChallenge() {
    this.setEternityChallenge(0);
    EternityPrestigeLayer.eternityReset();
  },
  checkForEternityChallengeCompletion() {
    let cc = this.currentEternityChallenge();
    if (cc !== 0) {
      this.completeEternityChallenge(cc);
    }
  },
  completeEternityChallenge(x) {
    if (player.eternityChallengeCompletions[x - 1] < 4) {
      player.eternityChallengeCompletions[x - 1]++;
    }
    // Current eternity challenge is set to 0 as part of lockUnlockedEternityChallenge.
    this.lockUnlockedEternityChallenge();
  },
  eternityChallenge1InfinityStarsEffect() {
    return 1 - 1 / (1 + player.infinityStars.max(1).log2() / 2048);
  },
  eternityChallenge1EternityStarsEffect() {
    return 1 - 1 / (1 + player.eternityStars.max(1).log2() / 256);
  },
  eternityChallenge4AllowedInfinities() {
    return Math.max(0, 12 - 4 * this.getEternityChallengeCompletions(4));
  },
  eternityChallenge4DoneInfinities() {
    return Infinities.realAmount();
  },
  eternityChallenge4RemainingInfinities() {
    return this.eternityChallenge4AllowedInfinities() - Infinities.realAmount();
  },
  isThereEternityChallengeText() {
    return [1, 4].indexOf(this.currentEternityChallenge()) !== -1;
  },
  eternityChallengeText() {
    let cc = this.currentEternityChallenge();
    if (cc === 1) {
      return 'Eternity Challenge 1 exponents: ' +
        formatWithPrecision(this.eternityChallenge1InfinityStarsEffect(), 5) + ' to normal generators, ' +
        formatWithPrecision(this.eternityChallenge1EternityStarsEffect(), 5) + ' to infinity generators';
    } else if (cc === 4) {
      return 'Eternity Challenge 4: ' + formatInt(this.eternityChallenge4DoneInfinities()) + '/' +
        formatInt(this.eternityChallenge4AllowedInfinities()) + ' infinities done';
    } else {
      return 'This text should never appear.';
    }
  },
  eternityChallengeTotalCompletionsReward4Text() {
    if (ComplexityAchievements.hasComplexityAchievement(2, 2)) {
      return 'Chroma buildup speed ' + formatInt(this.getTotalCompletionsRewardRawEffect(4)) + 'x.';
    } else {
      return 'Autobuyers for eternity upgrades, eternity generators, and Eternity Producer upgrades, and chroma buildup speed ' + formatInt(this.getTotalCompletionsRewardRawEffect(4)) + 'x.';
    }
  },
  // Technically this is a bit redundant.
  isRequirementDisplayOn() {
    return player.isEternityChallengeRequirementDisplayOn || !ComplexityAchievements.hasComplexityAchievement(3, 2);
  },
  toggleRequirementDisplay() {
    if (ComplexityAchievements.hasComplexityAchievement(3, 2)) {
      player.isEternityChallengeRequirementDisplayOn = !player.isEternityChallengeRequirementDisplayOn;
    }
  },
  hasAutoECCompletion() {
    return Complexities.amount() > 0;
  },
  isAutoECCompletionOn() {
    return player.autoECCompletion;
  },
  isAutoECCompletionActive() {
    return this.hasAutoECCompletion() && this.isAutoECCompletionOn();
  },
  toggleAutoECCompletion() {
    player.autoECCompletion = !player.autoECCompletion;
  },
  timeSinceAutoECCompletion() {
    return player.stats.timeSinceAutoECCompletion;
  },
  timeUntilAutoECCompletion() {
    let timePer = Complexities.autoECCompletionTime();
    return timePer - this.timeSinceAutoECCompletion() % timePer;
  },
  checkForAutoEternityChallengeCompletions() {
    if (this.isAutoECCompletionActive()) {
      let timePer = Complexities.autoECCompletionTime();
      let startingAutoCompletions = Math.floor(player.stats.timeSinceAutoECCompletion / timePer);
      let autoCompletions = startingAutoCompletions;
      for (let ec = 1; ec <= 8; ec++) {
        if (autoCompletions === 0) {
          break;
        }
        if (!this.isEternityChallengeCompleted(ec)) {
          let newCompletions = Math.min(
            4 - player.eternityChallengeCompletions[ec - 1], autoCompletions);
          player.eternityChallengeCompletions[ec - 1] += newCompletions;
          autoCompletions -= newCompletions;
          player.usedAutoECCompletionThisComplexity = true;
        }
      }
      player.stats.timeSinceAutoECCompletion -= timePer * (startingAutoCompletions - autoCompletions);
    }
  },
  imminentAutoECCompletionTiers() {
    return Math.min(
      32 - this.getTotalEternityChallengeCompletions(),
      Math.floor(player.stats.timeSinceAutoECCompletion / Complexities.autoECCompletionTime()));
  },
  usedAutoECCompletionThisComplexity() {
    return player.usedAutoECCompletionThisComplexity;
  },
  color(x) {
    return Colors.makeStyle(this.getEternityChallengeCompletions(x) / 4, true);
  }
}
