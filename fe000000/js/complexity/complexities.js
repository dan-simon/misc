let Complexities = {
  amount() {
    return player.complexities;
  },
  increment() {
    player.complexities++;
  },
  add(x) {
    player.complexities += x;
  },
  addSudden(x) {
    this.add(x);
    if (ComplexityAchievements.isComplexityAchievementActive(1, 2)) {
      let old = ComplexityAchievements.complexityAchievementRow1Column2EffectFormula(this.amount() - x);
      let current = ComplexityAchievements.complexityAchievementRow1Column2EffectFormula(this.amount());
      Eternities.addSudden(current.minus(old));
    }
    // This is messy, but we sometimes need to update our complexity challenge completion
    // records so that they don't appear to be from tons of complexities ago.
    for (let entry of player.complexityChallengeLastCompletion) {
      if (entry[0] >= 0) {
        entry[0] += x;
      }
    }
  },
  complexityGeneratorMultiplier() {
    // This is intentionally always at most 1, and often less.
    return Math.min(1, Math.max(1, this.amount()) / 256);
  },
  permanenceMultiplier() {
    return this.permanenceAndChromaMultiplier();
  },
  chromaMultiplier() {
    return this.permanenceAndChromaMultiplier();
  },
  permanenceAndChromaMultiplier() {
    return Math.pow(4, Math.pow(Math.min(this.amount(), 256), 0.25));
  },
  autoECCompletionTime() {
    let interval = 8192 / Math.min(this.amount(), 256);
    if (this.hasAutoECCompletionSpeedupFromFinalities()) {
      interval /= this.autoECCompletionSpeedupFromFinalities();
    }
    return interval;
  },
  hasAutoECCompletionSpeedupFromFinalities() {
    return Finalities.amount() > 0;
  },
  autoECCompletionSpeedupFromFinalities() {
    return 4;
  }
}
