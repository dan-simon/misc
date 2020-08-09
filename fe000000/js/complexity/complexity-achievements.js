let ComplexityAchievements = {
  complexityAchievementRequirements: [
    [
      () => ComplexityChallenge.getComplexityChallengeCompletions(2) >= 8,
      situation => situation === 'eternity',
      situation => situation === 'chroma',
      () => Studies.list.filter(x => x.isBought()).length >= 11
    ],
    [
      () => Boost.multiplierPer() >= Math.pow(2, 24) && !InfinityChallenge.isInfinityChallengeRunning(7),
      () => Eternities.amount().gte(Math.pow(2, 24)),
      situation => situation === 'chroma',
      () => Studies.totalTheorems() >= 231
    ],
    [
      () => Boost.bought() >= 1024 && EternityChallenge.isEternityChallengeRunning(2),
      () => EternityChallenge.areAllEternityChallengesCompleted() && !EternityChallenge.usedAutoECCompletionThisComplexity(),
      () => ComplexityChallenge.getComplexityChallengeCompletions(4) >= 13,
      () => EternityPoints.totalEPProducedThisComplexity().gte(Decimal.pow(2, 1.75 * Math.pow(2, 16))) && !Studies.boughtTheoremsThisComplexity()
    ],
    [
      () => Boost.boostPower() >= Math.pow(2, 16),
      () => EternityChallenge.getTotalEternityChallengeCompletions() >= 20 && !EternityChallenge.usedAutoECCompletionThisComplexity(),
      situation => situation === 'chroma',
      () => Studies.totalTheorems() >= 168
    ]
  ],
  // The round is here because Decimal.pow(16, 2) isn't exactly new Decimal(256).
  complexityAchievementEffects: [
    [
      () => Complexities.permanenceAndChromaMultiplier(),
      () => ComplexityAchievements.complexityAchievementRow1Column2EffectFormula(Complexities.amount()),
      () => null,
      () => Math.pow(Math.max(1, Math.log2(Boost.multiplierPer())), 0.5)
    ],
    [
      () => 1 + Math.max(0, player.eternities.log(2) / 64),
      () => null,
      () => 1 + Math.max(0, player.eternities.log(2) / 16),
      () => 3
    ],
    [
      () => 1 + Math.log2(1 + Chroma.colorAmount(1) / Math.pow(2, 20)),
      () => null,
      () => null,
      () => 1.125
    ],
    [
      () => Math.max(Math.pow(2, 1 / 8), Math.pow(Math.max(0, Math.log2(Boost.bestBoostPower())), 1 / 4)),
      () => null,
      () => 1 + Studies.totalTheorems() / 1024,
      () => Decimal.pow(2, 1024)
    ]
  ],
  complexityAchievementDefaults: [
    [1, new Decimal(0), null, 1],
    [1, null, 1, 1],
    [1, null, null, 1],
    [Math.pow(2, 1 / 8), null, 1, new Decimal(0)]
  ],
  achievementsUnlockedRewardThresholds: [4, 8, 12, 16],
  checkForComplexityAchievements(situation) {
    for (let row = 1; row <= 4; row++) {
      if (ComplexityChallenge.isComplexityChallengeRunning([2, 3, 4, 6][row - 1])) {
        for (let column = 1; column <= 4; column++) {
          if (!this.hasComplexityAchievement(row, column) &&
            this.canUnlockComplexityAchievement(row, column, situation)) {
            this.unlockComplexityAchievement(row, column, false);
          }
        }
      }
    }
  },
  canUnlockComplexityAchievement(row, column, situation) {
    // This doesn't check being in the challenge so make sure to check that first.
    // It also doesn't check whether the player already has the complexity achievement.
    return this.complexityAchievementRequirements[row - 1][column - 1](situation);
  },
  unlockComplexityAchievement(row, column, fromFinalityShardUpgrades) {
    player.complexityAchievements[row - 1][column - 1] = true;
    if (row === 1 && column === 2) {
      // Give the starting eternities, belatedly, as if the player had started with them.
      if (fromFinalityShardUpgrades) {
        Eternities.addSudden(this.effect(1, 2));
      } else {
        // If we're getting this naturally, we're doing an eternity reset immediately, so
        // the player is practically just getting a lot more eternities from that reset.
        Eternities.add(this.effect(1, 2));
      }
    }
    if (row === 4 && column === 2) {
      player.eternityChallengeCompletions = [4, 4, 4, 4, 4, 4, 4, 4];
    }
    if (row == 4 && column === 4) {
      Studies.updateExtraTheorems();
    }
    if (this.getTotalAchievementsUnlocked() === this.getAchievementsUnlockedRewardThreshold(1)) {
      EternityPoints.addAmount(this.getAchievementsUnlockedRewardEffect(1));
    }
    if (this.getTotalAchievementsUnlocked() === this.getAchievementsUnlockedRewardThreshold(4)) {
      EternityPoints.addAmount(this.getAchievementsUnlockedRewardEffect(4));
    }
  },
  hasComplexityAchievement(row, column) {
    return player.complexityAchievements[row - 1][column - 1];
  },
  complexityAchievementStatusDescription(row, column) {
    if (this.hasComplexityAchievement(row, column)) {
      return 'Active';
    } else {
      return 'Locked';
    }
  },
  rawEffect(row, column) {
    return this.complexityAchievementEffects[row - 1][column - 1]();
  },
  effect(row, column) {
    if (this.hasComplexityAchievement(row, column)) {
      return this.rawEffect(row, column);
    }
    return this.complexityAchievementDefaults[row - 1][column - 1];
  },
  getTotalAchievementsUnlocked() {
    return [1, 2, 3, 4].map(x => [1, 2, 3, 4].filter(y => this.hasComplexityAchievement(x, y)).length).reduce((a, b) => a + b);
  },
  getAchievementsUnlockedRewardThreshold(x) {
    return this.achievementsUnlockedRewardThresholds[x - 1];
  },
  getAchievementsUnlockedRewardRawEffect(x) {
    if (x === 1) {
      return new Decimal(Boost.highestBought());
    } else if (x === 2) {
      return 1 + this.getTotalAchievementsUnlocked() / 4;
    } else if (x === 4) {
      return Decimal.pow(2, 1024);
    }
    return null;
  },
  isAchievementsUnlockedRewardActive(x) {
    return this.getTotalAchievementsUnlocked() >= this.getAchievementsUnlockedRewardThreshold(x);
  },
  getAchievementsUnlockedRewardEffect(x) {
    if (this.isAchievementsUnlockedRewardActive(x)) {
      return this.getAchievementsUnlockedRewardRawEffect(x);
    }
    return [new Decimal(0), 1, null, new Decimal(0)][x - 1];
  },
  startingEternityPoints() {
    return this.getAchievementsUnlockedRewardEffect(1).add(this.getAchievementsUnlockedRewardEffect(4));
  },
  color(row, column) {
    return Colors.makeStyle(this.hasComplexityAchievement(row, column), false);
  },
  complexityAchievementRow1Column2EffectFormula(x) {
    return Decimal.pow(Math.min(16, x), 2).round();
  }
}
