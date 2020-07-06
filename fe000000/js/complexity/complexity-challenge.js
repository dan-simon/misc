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
    return player.complexities >= this.requirements[x];
  },
  getComplexityChallengeGoal(x) {
    return this.goals[x].pow(Math.pow(2, this.getComplexityChallengeCompletions(x) / 4));
  },
  getComplexityChallengeCompletionsAt(x, stars) {
    return 1 + Math.floor(4 * Math.log2(stars.max(1).log2() / this.goals[x].log2()));
  },
  getComplexityChallengeReward(x) {
    return this.rewards[x](this.getComplexityChallengeCompletions(x) * ComplexityStars.complexityChallengeMultiplier());
  },
  getComplexityChallengeNextReward(x) {
    return this.rewards[x]((1 + this.getComplexityChallengeCompletions(x)) * ComplexityStars.complexityChallengeMultiplier());
  },
  getComplexityChallengeCompletions(x) {
    return player.complexityChallengeCompletions[x - 1];
  },
  getTotalComplexityChallengeCompletions() {
    return [1, 2, 3, 4, 5, 6].map(x => this.getComplexityChallengeCompletions(x)).reduce((a, b) => a + b);
  },
  extraTheorems() {
    return this.getComplexityChallengeReward(6);
  },
  complexityStarsForNextExtraTheorem() {
    let cc6 = this.getComplexityChallengeCompletions(6);
    if (cc6 === 0) {
      return Infinity;
    }
    return Decimal.pow(2, Math.pow((this.extraTheorems() + 1) / cc6, 2));
  },
  complexityChallengeStatusDescription(x) {
    if (!this.isComplexityChallengeUnlocked(x)) {
      return 'Locked (requires ' + format(this.requirements[x]) + ' complexities)';
    }
    let description = format(this.getComplexityChallengeCompletions(x)) + ' completions';
    if (this.isComplexityChallengeRunning(x)) {
      description += ', running';
    }
    return description;
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
    player.complexityChallengeCompletions[x - 1] = Math.max(player.complexityChallengeCompletions[x - 1], completions);
  },
  complexityReset() {
    // It's easy to imagine wanting something else here (for example, because certain things
    // disqualify you from complexity challenges), which is why this is its own method.
    ComplexityPrestigeLayer.complexityReset();
  },
  isSafeguardOn(x) {
    return player.complexityChallengeSafeguards[x - 2];
  },
  toggleSafeguard(x) {
    player.complexityChallengeSafeguards[x - 2] = !player.complexityChallengeSafeguards[x - 2];
  }
}
