let ChallengeHeaderText = {
  getText() {
    // Don't include 1.
    let runningComplexityChallenges = [2, 3, 4, 5, 6].filter(x => ComplexityChallenge.isComplexityChallengeRunning(x));
    let challenges = [
      Challenge.isSomeChallengeRunning() ? 'Challenge ' + Challenge.currentChallenge() : null,
      InfinityChallenge.isSomeInfinityChallengeRunning() ? 'Infinity Challenge ' + InfinityChallenge.currentInfinityChallenge() : null,
      EternityChallenge.isSomeEternityChallengeRunning() ? 'Eternity Challenge ' + EternityChallenge.currentEternityChallenge() : null,
      runningComplexityChallenges.length > 0 ?
      'Complexity Challenge' + pluralize(runningComplexityChallenges.length, '', 's') + ' ' + coordinate('*', '', runningComplexityChallenges) : null
    ];
    return coordinate('You are currently in *.', 'You are currently not in any challenge.', challenges);
  }
}
