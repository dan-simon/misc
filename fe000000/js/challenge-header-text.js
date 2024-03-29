let ChallengeHeaderText = {
  getCurrentChallengesText() {
    // Don't include 1.
    let runningComplexityChallenges = [2, 3, 4, 5, 6].filter(x => ComplexityChallenge.isComplexityChallengeRunning(x));
    let challenges = [
      Challenge.isSomeChallengeRunning() ? 'Normal Challenge ' + formatOrdinalInt(Challenge.currentChallenge()) : null,
      InfinityChallenge.isSomeInfinityChallengeRunning() ? 'Infinity Challenge ' + formatOrdinalInt(InfinityChallenge.currentInfinityChallenge()) : null,
      EternityChallenge.isSomeEternityChallengeRunning() ? 'Eternity Challenge ' + formatOrdinalInt(EternityChallenge.currentEternityChallenge()) : null,
      runningComplexityChallenges.length > 0 ?
      'Complexity Challenge' + pluralize(runningComplexityChallenges.length, '', 's') + ' ' + coordinate('*', '', runningComplexityChallenges.map(formatOrdinalInt)) : null
    ];
    return coordinate('You are currently in *.', 'You are currently not in any challenge.', challenges);
  },
  getNextCCCompletionText() {
    let minRunningComplexityChallengeGoal = [1, 2, 3, 4, 5, 6].filter(
      x => ComplexityChallenge.isComplexityChallengeRunning(x)).map(
      x => ComplexityChallenge.getComplexityChallengeGoal(x)).reduce(
      (x, y) => Decimal.min(x, y));
    let nextComplexityChallengeGoalDisplay = [1, 2, 3, 4, 5, 6].filter(
      x => ComplexityChallenge.isComplexityChallengeRunning(x) &&
      ComplexityChallenge.getComplexityChallengeGoal(x).eq(minRunningComplexityChallengeGoal)).map(
      x => 'ℂC' + formatOrdinalInt(x) + 'x' + formatInt(ComplexityChallenge.getComplexityChallengeCompletions(x) + 1));
    return 'Next ℂC completion' + pluralize(nextComplexityChallengeGoalDisplay.length, '', 's') +
    ' (' + nextComplexityChallengeGoalDisplay.join(', ') + ') at ' + format(minRunningComplexityChallengeGoal) + ' stars.';
  },
  getText() {
    let texts = [];
    if (PrestigeLayerProgress.hasReached('infinity') && Options.showCurrentChallenges()) {
      texts.push(this.getCurrentChallengesText());
    }
    if (PrestigeLayerProgress.hasReached('complexity') && Options.showNextCCCompletion()) {
      texts.push(this.getNextCCCompletionText());
    }
    return texts.map(i => ' ' + i).join('');
  }
}
