let ComplexityChallenge = {
  goals: [Infinity,
    Decimal.pow(2, Math.pow(2, 32)), Decimal.pow(2, 4096),
    Decimal.pow(2, Math.pow(2, 24)), Decimal.pow(2, Math.pow(2, 29)),
    Decimal.pow(2, Math.pow(2, 32)), Decimal.pow(2, Math.pow(2, 24)),
  ],
  requirements: [Infinity, 0, 2, 4, 6, 8, 12],
  rewards: [
    null,
    x => Decimal.pow(2, x * Math.pow(Stars.amount().max(1).log2(), 0.5) / 2),
    x => 1 / Math.log2(2 + x / 256),
    x => Decimal.pow(2, Math.sqrt(x) / 2),
    x => 1 + x / 64,
    x => 1 + x / 8,
    x => Math.floor(x / 2),
  ],
  colors: [null, 'yellow', 'grey', 'purple', 'orange', 'cyan', 'green'],
  isComplexityChallengeRunning(x) {
    return player.isComplexityChallengeRunning[x - 1] && this.isComplexityChallengeUnlocked(x);
  },
  exitComplexityChallenge(x) {
    player.isComplexityChallengeRunning[x - 1] = false;
  },
  isComplexityChallengeUnlocked(x) {
    // Yes, you can complete Complexity Challenge 1 before knowing that it exists.
    // Finality Milestone 1 also removes complexity requirements for unlocking complexity challenges.
    return player.complexities >= this.requirements[x] || FinalityMilestones.isFinalityMilestoneActive(1);
  },
  numberUnlocked() {
    return [1, 2, 3, 4, 5, 6].filter(i => this.isComplexityChallengeUnlocked(i)).length;
  },
  getComplexityChallengeGoal(x) {
    return this.goals[x].pow(Math.pow(2, this.getComplexityChallengeCompletions(x) / 4));
  },
  getComplexityChallengeCompletionsAt(x, stars) {
    return 1 + Math.floor(4 * Math.log2(stars.max(1).log2() / this.goals[x].log2()));
  },
  getComplexityChallengeReward(x) {
    return this.rewards[x](this.getComplexityChallengeCompletions(x) * ComplexityStars.complexityChallengeRewardMultiplier(x));
  },
  getComplexityChallengeNextReward(x) {
    return this.rewards[x]((1 + this.getComplexityChallengeCompletions(x)) * ComplexityStars.complexityChallengeRewardMultiplier(x));
  },
  getComplexityChallengeCompletions(x) {
    return player.complexityChallengeCompletions[x - 1];
  },
  getTotalComplexityChallengeCompletions() {
    return [1, 2, 3, 4, 5, 6].map(x => this.getComplexityChallengeCompletions(x)).reduce((a, b) => a + b);
  },
  getAllComplexityChallengeCompletions() {
    return [1, 2, 3, 4, 5, 6].map(x => this.getComplexityChallengeCompletions(x));
  },
  extraTheoremsRaw() {
    return this.getComplexityChallengeReward(6);
  },
  extraTheoremsIndex() {
    return 3;
  },
  extraTheoremsActualAndDisplay() {
    if (ComplexityAchievements.hasComplexityAchievement(4, 4)) {
      return player.extraTheorems[this.extraTheoremsIndex()];
    } else {
      return this.extraTheoremsRaw();
    }
  },
  showActualExtraTheorems() {
    return this.extraTheoremsRaw() < this.extraTheoremsActualAndDisplay();
  },
  extraComplexityStarsForNextExtraTheorem() {
    let cc6 = this.getComplexityChallengeCompletions(6);
    if (cc6 === 0 || !ComplexityStars.doComplexityStarsDoAnything()) {
      return new Decimal(Infinity);
    }
    return Decimal.pow(2, Math.pow(2 * (this.extraTheoremsActualAndDisplay() + 1) / cc6, 2));
  },
  complexityChallengeStatusDescription(x) {
    if (!this.isComplexityChallengeUnlocked(x)) {
      return 'Locked (requires ' + formatInt(this.requirements[x]) + ' complexities)';
    }
    let description = formatInt(this.getComplexityChallengeCompletions(x)) + ' completion' +
      pluralize(this.getComplexityChallengeCompletions(x), '', 's');
    if (this.isComplexityChallengeRunning(x)) {
      description += ', running';
    }
    return description;
  },
  showComplexityChallengeLastCompletionDescription(x) {
    return this.getComplexityChallengeCompletions(x) > 0;
  },
  complexityChallengeLastCompletionDescription(x) {
    if (player.complexityChallengeLastCompletion[x - 1][1] < Finalities.amount()) {
      return 'Not completed this finality';
    } else {
      let complexities = Complexities.amount() - player.complexityChallengeLastCompletion[x - 1][0];
      if (complexities === 0) {
        return 'Completed this complexity'
      } else {
        return 'Last completed ' + formatInt(complexities) + ' complexit' + pluralize(complexities, 'y', 'ies') + ' ago';
      }
    }
  },
  checkForComplexityChallengeCompletions() {
    for (let cc = 1; cc <= 6; cc++) {
      if (this.isComplexityChallengeRunning(cc)) {
        this.makeComplexityChallengeCompletionsAtLeast(
          cc, this.getComplexityChallengeCompletionsAt(cc, Stars.amount()));
      }
    }
  },
  makeComplexityChallengeCompletionsAtLeast(x, completions) {
    if (player.complexityChallengeCompletions[x - 1] < completions) {
      player.complexityChallengeLastCompletion[x - 1] = [Complexities.amount(), Finalities.amount()];
    }
    player.complexityChallengeCompletions[x - 1] = Math.max(player.complexityChallengeCompletions[x - 1], completions);
  },
  complexityReset(manual) {
    // It's easy to imagine wanting something else here (for example, because certain things
    // disqualify you from complexity challenges), which is why this is its own method.
    ComplexityPrestigeLayer.complexityReset(manual);
  },
  isSafeguardOn(x) {
    return player.complexityChallengeSafeguards[x - 2];
  },
  toggleSafeguard(x) {
    player.complexityChallengeSafeguards[x - 2] = !player.complexityChallengeSafeguards[x - 2];
  },
  addToTimeStats(diff) {
    for (let i = 1; i <= 6; i++) {
      if (this.isComplexityChallengeRunning(i)) {
        player.complexityChallengeTimeSpent[i - 1] += diff;
      } else {
        player.complexityChallengeTimeSpent[i - 1] = 0;
      }
    }
  },
  longTimeThreshold() {
    return Math.pow(2, 16);
  },
  longTimeOn(x) {
    return this.isSafeguardOn(x) && player.complexityChallengeTimeSpent[x - 1] >= this.longTimeThreshold();
  },
  anyLongTime() {
    return [2, 3, 4, 5, 6].some(x => this.longTimeOn(x));
  },
  longTimeText() {
    let complexityChallenges = [2, 3, 4, 5, 6].filter(x => this.longTimeOn(x));
    return 'Complexity Challenge' + pluralize(complexityChallenges.length, '', 's') + ' ' + coordinate('*', '', complexityChallenges);
  },
  removeLongTimeMessage() {
    for (let i = 2; i <= 6; i++) {
      if (this.longTimeOn(i)) {
        player.complexityChallengeTimeSpent[i - 1] = 0
      }
    }
  },
  color(x) {
    return Colors.makeStyle(1 - 2 / (2 + Math.log2(1 + this.getComplexityChallengeCompletions(x) / 2)), true);
  }
}
