let ComplexityUpgrades = {
  complexityUpgradeRequirements: [
    [
      () => ComplexityChallenge.getComplexityChallengeCompletions(2) >= 8,
      situation => situation === 'eternity',
      () => false,
      () => false
    ],
    [
      () => Boost.multiplierPer() >= Math.pow(2, 24) && !InfinityChallenge.isInfinityChallengeRunning(7),
      () => Eternities.amount().gte(Math.pow(2, 24)),
      situation => situation === 'chroma',
      () => Studies.totalTheorems() >= 154
    ],
    [
      () => false,
      () => EternityChallenge.getTotalEternityChallengeCompletions() >= 32,
      () => ComplexityChallenge.getComplexityChallengeCompletions(4) >= 8,
      () => Generators.areAnyMultipliersNerfed()
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
      () => 1 + Math.max(0, player.eternities.log(2) / 64),
      () => null,
      () => 1 + Math.max(0, player.eternities.log(2) / 16),
      () => 2
    ],
    [
      () => 0,
      () => 0,
      () => null,
      () => null
    ],
    [
      () => 0,
      () => Math.min(2 * Complexities.amount(), 32),
      () => 0,
      () => 0
    ]
  ],
  complexityUpgradeDefaults: [
    [1, 0, 0, 0],
    [1, null, 1, 1],
    [0, 0, null, null],
    [0, 0, 0, 0]
  ],
  checkForComplexityUpgrades(situation) {
    for (let row = 1; row < 4; row++) {
      if (ComplexityChallenge.isComplexityChallengeRunning([2, 3, 4, 6][row - 1])) {
        for (let column = 1; column < 4; column++) {
          if (!this.hasComplexityUpgrade(row, column) &&
            this.canUnlockComplexityUpgrade(row, column, situation)) {
            this.unlockComplexityUpgrade(row, column);
          }
        }
      }
    }
  },
  canUnlockComplexityUpgrade(row, column, situation) {
    // This doesn't check being in the challenge so make sure to check that first.
    // It also doesn't check whether the player already has the complexity upgrade.
    return this.complexityUpgradeRequirements[row - 1][column - 1](situation);
  },
  unlockComplexityUpgrade(row, column) {
    player.complexityUpgrades[row - 1][column - 1] = true;
    if (row === 1 && column === 2) {
      // Give the starting eternities, belatedly, as if the player had started with them.
      Eternities.add(this.effect(1, 2));
    }
    if (row === 4 && column === 2) {
      this.giveStartingECs(this.effect(1, 4));
    }
  },
  giveStartingECs(x) {
    for (let i = 0; i < Math.floor(x / 4); i++) {
      // This should always be 4, but let's be safe in case extra completions
      // are added later or something.
      player.eternityChallengeCompletions[i] = Math.max(
        player.eternityChallengeCompletions[i], 4);
    }
    player.eternityChallengeCompletions[Math.floor(x / 4)] = Math.max(
      player.eternityChallengeCompletions[Math.floor(x / 4)], x % 4);
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
