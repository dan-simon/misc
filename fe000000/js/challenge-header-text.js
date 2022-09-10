let ChallengeHeaderText = {
  getCurrentChallengesText() {
    // Don't include 1.
    let runningComplexityChallenges = [2, 3, 4, 5, 6].filter(x => ComplexityChallenge.isComplexityChallengeRunning(x)).map(x => formatOrdinalInt(x));
    let challenges = [
      Challenge.isSomeChallengeRunning() ? 'Normal Challenge ' + formatOrdinalInt(Challenge.currentChallenge()) : null,
      InfinityChallenge.isSomeInfinityChallengeRunning() ? 'Infinity Challenge ' + formatOrdinalInt(InfinityChallenge.currentInfinityChallenge()) : null,
      EternityChallenge.isSomeEternityChallengeRunning() ? 'Eternity Challenge ' + formatOrdinalInt(EternityChallenge.currentEternityChallenge()) : null,
      runningComplexityChallenges.length > 0 ?
      'Complexity Challenge' + pluralize(runningComplexityChallenges.length, '', 's') + ' ' + coordinate('*', '', runningComplexityChallenges) : null
    ];
    return coordinate('You are currently in *.', 'You are currently not in any challenge.', challenges);
  },
  getNextChallengesText() {
    // Don't include 1.
    let nextComplexityChallenges = [2, 3, 4, 5, 6].filter(x => ComplexityChallenge.isComplexityChallengeNext(x)).map(x => formatOrdinalInt(x));
    if (nextComplexityChallenges.length > 0) {
      return 'You will enter Complexity Challenge' + pluralize(nextComplexityChallenges.length, '', 's') + ' ' + coordinate('*', '', nextComplexityChallenges) + ' next complexity.';
    } else {
      return null;
    }
  },
  getNextCCCompletionText() {
    let minRunningComplexityChallengeGoal = [1, 2, 3, 4, 5, 6].filter(
      x => ComplexityChallenge.isComplexityChallengeRunning(x)).map(
      x => ComplexityChallenge.getComplexityChallengeGoal(x)).reduce(
      (x, y) => Decimal.min(x, y));
    return 'Next ℂC completion at ' + format(minRunningComplexityChallengeGoal) + ' stars.';
  },
  getText() {
    let texts = [];
    if (PrestigeLayerProgress.hasReached('infinity') && Options.showCurrentChallenges()) {
      texts.push(this.getCurrentChallengesText());
      let next = this.getNextChallengesText();
      if (next) {
        texts.push(next);
      }
    }
    if (PrestigeLayerProgress.hasReached('complexity') && Options.showNextCCCompletion()) {
      texts.push(this.getNextCCCompletionText());
    }
    return texts.map(i => ' ' + i).join('');
  }
}
