let ComplexityChallenge = {
  goals: [Infinity,
    Decimal.pow(2, Math.pow(2, 32)), Decimal.pow(2, 4096),
    Decimal.pow(2, Math.pow(2, 22)), Decimal.pow(2, Math.pow(2, 29)),
    Decimal.pow(2, Math.pow(2, 24)), Decimal.pow(2, Math.pow(2, 20)),
  ],
  requirements: [Infinity, 0, 2, 4, 6, 8, 10],
  rewards: [
    null,
    x => Decimal.pow(2, x * Math.pow(Stars.amount().max(1).log2(), 0.5) / 2),
    x => Math.pow(1 + x / 16, -0.5),
    x => Decimal.pow(2, x / 8),
    x => Decimal.pow(2, x / 8),
    x => 1 + x / 8,
    x => Math.floor(x),
  ],
  colors: [null, 'blue', 'grey', 'purple', 'orange', 'yellow', 'green'],
  isComplexityChallengeRunning(x) {
    return player.isComplexityChallengeRunning[x - 1] && this.isComplexityChallengeUnlocked(x);
  },
  isComplexityChallengeUnlocked(x) {
    return player.complexities >= this.requirements[x];
  },
  getComplexityChallengeGoal(x) {
    return this.goals[x].pow(Math.pow(2, this.getComplexityChallengeCompletions(x) / 4));
  },
  getComplexityChallengeCompletionsAt(x, stars) {
    return 1 + Math.floor(4 * Math.log2(stars.log(2) / this.goals[x].log(2)));
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
  extraTheorems() {
    return this.getComplexityChallengeReward(6);
  },
  complexityChallengeStatusDescription(x) {
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
    player.complexityChallengeCompletions[x] = Math.max(player.complexityChallengeCompletions[x], completions);
  }
}
