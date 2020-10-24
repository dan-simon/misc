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
    return this.getEternityChallengeGoalAtTier(x, this.getEternityChallengeCompletions(x));
  },
  getEternityChallengeGoalAtTier(x, y) {
    return this.goals[x].times(Decimal.pow(this.goalIncreases[x], y));
  },
  getEternityChallengeRequirement(x) {
    return this.getEternityChallengeRequirementAtTier(x, this.getEternityChallengeCompletions(x));
  },
  getEternityChallengeRequirementAtTier(x, y) {
    let initialRequirement = this.requirements[x];
    if (Decimal.gt(initialRequirement, 1e10)) {
      return initialRequirement.times(Decimal.pow(this.requirementIncreases[x], y));
    } else {
      return initialRequirement + this.requirementIncreases[x] * y;
    }
  },
  getEternityChallengeReward(x) {
    return this.rewards[x](this.getRewardCalculationEternityChallengeCompletions(x));
  },
  getEternityChallengeNextReward(x) {
    return this.rewards[x](this.getNextRewardCalculationEternityChallengeCompletions(x));
  },
  getEternityChallengeCost(x) {
    if (this.isEternityChallengeUnlockingMeaningless()) {
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
    if (x === undefined) {
      x = this.currentEternityChallenge();
    }
    if (x === 0) return;
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
    return this.isEternityChallengeUnlockingMeaningless() || this.getUnlockedEternityChallenge() === x;
  },
  isEternityChallengeRunning(x) {
    return this.currentEternityChallenge() === x;
  },
  isSomeEternityChallengeRunning() {
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
  hasBrokeEveryStone() {
    return ComplexityAchievements.hasComplexityAchievement(3, 2);
  },
  isEternityChallengeUnlockingMeaningless() {
    return this.hasBrokeEveryStone();
  },
  canEternityChallengeBeUnlocked(x) {
    if (this.isEternityChallengeUnlockingMeaningless()) {
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
    return !this.isEternityChallengeUnlockingMeaningless();
  },
  isRespecOn() {
    return player.respecEternityChallenge;
  },
  toggleRespec() {
    player.respecEternityChallenge = !player.respecEternityChallenge;
  },
  respec() {
    // This fails in situations where ECs being locked is no longer a thing,
    // which is why we then can't respec and so don't do anything when
    // this function is called.
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
    if (Options.confirmation('eternityChallengeRespec') && !confirm(
      'Are you sure you want to respec your unlocked eternity challenge and ' +
      EternityPrestigeLayer.resetText() + '?')) return;
    this.respec();
    if (EternityPrestigeLayer.canEternity()) {
      EternityPrestigeLayer.eternity(false);
    } else {
      EternityPrestigeLayer.eternityReset(false);
    }
  },
  lockUnlockedEternityChallenge() {
    // This can happen if we're respeccing and doing an eternity reset.
    this.setEternityChallenge(0);
    player.unlockedEternityChallenge = 0;
  },
  startEternityChallenge(x) {
    if (EternityPrestigeLayer.canEternity()) {
      EternityPrestigeLayer.eternity(false);
    } else {
      EternityPrestigeLayer.eternityReset(false);
    }
    this.setEternityChallenge(x);
  },
  exitEternityChallenge() {
    this.setEternityChallenge(0);
    EternityPrestigeLayer.eternityReset(false);
  },
  checkForEternityChallengeCompletion() {
    let cc = this.currentEternityChallenge();
    if (cc !== 0) {
      this.completeEternityChallenge(cc);
    }
  },
  completeEternityChallenge(x) {
    player.eternityChallengeCompletions[x - 1] = this.getNextEternityChallengeCompletions(x);
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
    return this.eternityChallenge4AllowedInfinitiesAtTier(this.getEternityChallengeCompletions(4));
  },
  eternityChallenge4AllowedInfinitiesAtTier(x) {
    return Math.max(0, 12 - 4 * x);
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
  hasAllECsForever() {
    // Technically if you respec you lose ECs, so this should only be used for certain things,
    // like display of options that don't make much sense with all ECs.
    return FinalityStartingBenefits.complexityAchievements() >= 14;
  },
  // Technically this is a bit redundant.
  isRequirementDisplayOn() {
    return player.isEternityChallengeRequirementDisplayOn || !this.isEternityChallengeUnlockingMeaningless();
  },
  toggleRequirementDisplay() {
    if (this.isEternityChallengeUnlockingMeaningless()) {
      player.isEternityChallengeRequirementDisplayOn = !player.isEternityChallengeRequirementDisplayOn;
    }
  },
  showRequirementDisplayToggle() {
    // This option still does something, so we leave it even after all ECs.
    // We don't show it, however, when you still need to unlock ECs.
    return this.isEternityChallengeUnlockingMeaningless();
  },
  hasAutoECCompletion() {
    return Complexities.amount() > 0 || Finalities.amount() > 0;
  },
  showAutoECCompletion() {
    return this.hasAutoECCompletion() && !this.hasAllECsForever();
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
  autoECCompletionTime() {
    return 1 / (1 / Complexities.autoECCompletionTime() + 1 / Finalities.autoECCompletionTime());
  },
  autoECFromComplexities() {
    return Complexities.autoECCompletionTime() !== Infinity;
  },
  autoECFromFinalities() {
    return Finalities.autoECCompletionTime() !== Infinity;
  },
  timeUntilAutoECCompletion() {
    let timePer = this.autoECCompletionTime();
    return timePer - this.timeSinceAutoECCompletion() % timePer;
  },
  checkForAutoEternityChallengeCompletions() {
    if (this.isAutoECCompletionActive()) {
      let timePer = this.autoECCompletionTime();
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
      Math.floor(player.stats.timeSinceAutoECCompletion / this.autoECCompletionTime()));
  },
  usedAutoECCompletionThisComplexity() {
    return player.usedAutoECCompletionThisComplexity;
  },
  canCompleteMultipleTiersAtOnce() {
    return this.hasBrokeEveryStone();
  },
  displayTiersCompletedOnEternity() {
    return this.canCompleteMultipleTiersAtOnce() && this.isSomeEternityChallengeRunning();
  },
  tiersCompletedOnEternity(x) {
    if (x === undefined) {
      x = this.currentEternityChallenge();
    }
    if (x === 0) return;
    return this.getNextEternityChallengeCompletions(x) - this.getEternityChallengeCompletions(x);
  },
  eternityChallengeCompletionsIsTierPossible(x, tier) {
    return x !== 4 || (this.eternityChallenge4DoneInfinities() <= this.eternityChallenge4AllowedInfinitiesAtTier(tier));
  },
  getNextEternityChallengeCompletions(x) {
    if (x === undefined) {
      x = this.currentEternityChallenge();
    }
    if (x === 0) return;
    let completions = this.getEternityChallengeCompletions(x);
    // This could be a log, but I really don't trust logs.
    while (completions < 4) {
      let newGoal = this.getEternityChallengeGoalAtTier(x, completions);
      if (InfinityPoints.totalIPProducedThisEternity().lt(newGoal) ||
      !this.eternityChallengeCompletionsIsTierPossible(x, completions)) {
        break;
      }
      completions++;
      // Break now if we can't get more than one tier.
      if (!this.canCompleteMultipleTiersAtOnce()) {
        break;
      }
    }
    return completions;
  },
  eternityChallengeCompletionsNextText(x) {
    if (x === undefined) {
      x = this.currentEternityChallenge();
    }
    if (x === 0) return;
    let nextCompletions = this.getNextEternityChallengeCompletions(x);
    if (nextCompletions === 4) {
      return '';
    } else if (this.eternityChallengeCompletionsIsTierPossible(x, nextCompletions)) {
      return ', next at ' + format(this.getEternityChallengeGoalAtTier(x, this.getNextEternityChallengeCompletions(x))) + ' IP';
    } else {
      return ', too many infinities for more'
    }
  },
  areEternityChallengesVisible() {
    return SpecialTabs.isTabVisible('eternity-challenges');
  },
  color(x) {
    return Colors.makeStyle(this.getEternityChallengeCompletions(x) / 4, true);
  }
}
