let ChallengeExitOrRestart = {
  exitChallenge() {
    if (Challenge.isSomeChallengeRunning()) {
      Challenge.exitChallenge();
    } else if (InfinityChallenge.isSomeInfinityChallengeRunning()) {
      InfinityChallenge.exitInfinityChallenge();
    } else if (EternityChallenge.isSomeEternityChallengeRunning()) {
      EternityChallenge.exitEternityChallenge();
    }
  },
  restartChallenge() {
    if (Challenge.isSomeChallengeRunning()) {
      Challenge.restartChallenge();
    } else if (InfinityChallenge.isSomeInfinityChallengeRunning()) {
      InfinityChallenge.restartInfinityChallenge();
    } else if (EternityChallenge.isSomeEternityChallengeRunning()) {
      EternityChallenge.restartEternityChallenge();
    }
  }
}
