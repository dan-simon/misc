let ComplexityUpgrades = {
  complexityUpgradeRequirements: [
    [
      () => ComplexityChallenge.getComplexityChallengeCompletions(2) >= 8,
      (_, eter) => eter,
      () => false,
      () => false
    ],
    [
      () => Boost.multiplierPer() >= Math.pow(2, 16) && !InfinityChallenge.isInfinityChallengeRunning(7),
      () => Eternities.amount().gte(Math.pow(2, 16)),
      () => false,
      () => false
    ],
    [
      () => false,
      () => EternityChallenge.getTotalEternityChallengeCompletions() >= 32,
      () => false,
      () => false
    ],
    [
      () => false,
      () => EternityChallenge.getTotalEternityChallengeCompletions() >= 4,
      () => false,
      () => Studies.totalTheorems() >= 168
    ]
  ],
  complexityUpgradeEffects: [
    [
      () => Complexities.permanenceAndChromaMultiplier(),
      () => Math.pow(Math.min(16, player.complexities), 2),
      () => 0,
      () => 0
    ],
    [
      () => 1 + Math.sqrt(Math.max(0, player.eternities.log(2) / 256)),
      () => 0,
      () => 0,
      () => 0
    ],
    [
      () => 0,
      () => 0,
      () => 0,
      () => 0
    ],
    [
      () => 0,
      () => 0,
      () => 0,
      () => 0
    ]
  ],
  complexityUpgradeDefaults: [
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  checkForComplexityUpgrades(inf, eter) {
    for (let row = 1; row < 4; row++) {
      if (ComplexityChallenge.isComplexityChallengeRunning([2, 3, 4, 6][row - 1])) {
        for (let column = 1; column < 4; column++) {
          if (this.canUnlockComplexityUpgrade(row, column, inf, eter)) {
            this.unlockComplexityUpgrade(row, column);
          }
        }
      }
    }
  },
  canUnlockComplexityUpgrade(row, column, inf, eter) {
    // This doesn't check being in the challenge so make sure to check that first.
    return this.complexityUpgradeRequirements[row - 1][column - 1](inf, eter);
  },
  unlockComplexityUpgrade(row, column) {
    player.complexityUpgrades[row - 1][column - 1] = true;
  },
  hasComplexityUpgrade(row, column) {
    return player.complexityUpgrades[row - 1][column - 1];
  },
  complexityUpgradeStatusDescription(row, column) {
    if (this.hasComplexityUpgrade(row, column)) {
      return 'Active';
    } else {
      return 'Locked';
    }
  },
  rawEffect(row, column) {
    return this.complexityUpgradeEffects[row - 1][column - 1]();
  },
  effect(row, column) {
    if (this.hasComplexityUpgrade(row, column)) {
      return this.rawEffect(row, column);
    }
    return this.complexityUpgradeDefaults[row - 1][column - 1];
  }
}
