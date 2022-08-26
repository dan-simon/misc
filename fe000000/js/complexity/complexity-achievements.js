let ComplexityAchievements = {
  complexityAchievementNames: [
    ['One per generator', 'Forever isn\'t too long', 'More colorful than a potato', 'Forgot something'],
    ['Actually a boost', 'Time after time', 'After a hurricane', '3 * 7 * 11'],
    ['No rest', 'Broke every stone', 'Shadeless', 'Thousand-theorem twilight'],
    ['Power beats knowledge', 'Calm EC', 'Nonzero-color theorem', 'On the other side']
  ],
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
  complexityChallengeFor(row) {
    return [2, 3, 4, 6][row - 1];
  },
  checkForComplexityAchievements(situation) {
    for (let row = 1; row <= 4; row++) {
      if (ComplexityChallenge.isComplexityChallengeRunning(this.complexityChallengeFor(row))) {
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
  giveComplexityAchievementSingleResult(row, column, fromUnusualSource) {
    // We also call this function when we enable a complexity achievement.
    // The check for being active catches the case where we enable an inactive achievement.
    if (!this.isComplexityAchievementActive(row, column)) return;
    if (row === 1 && column === 2) {
      // Give the starting eternities, belatedly, as if the player had started with them.
      if (fromUnusualSource) {
        Eternities.addSudden(this.effect(1, 2));
      } else {
        // If we're getting this naturally, we're doing an eternity reset immediately, so
        // the player is practically just getting a lot more eternities from that reset.
        Eternities.add(this.effect(1, 2));
      }
    }
    if (row === 3 && column === 4) {
      // This usually doesn't matter, but we don't really want the player to
      // have an unlocked EC with "Broke every stone" (it leads to a potential
      // hidden unlocked EC which shows up in presets, but isn't visible anywhere else).
      // So we lock the currently unlocked EC if any.
      player.unlockedEternityChallenge = 0;
    }
    if (row === 4 && column === 2) {
      player.eternityChallengeCompletions = [4, 4, 4, 4, 4, 4, 4, 4];
      // There are some edge cases where you get this from a finality shard upgrade,
      // and you could be in EC4 at that time.
      EternityChallenge.checkForExitingEternityChallenge4(0);
    }
    if (row === 4 && column === 4) {
      Studies.updateExtraTheorems();
    }
  },
  giveComplexityAchievementGlobalResult() {
    // This function only gets called when a complexity achievement is unlocked (not when one is enabled).
    if (this.getTotalAchievementsUnlocked() === this.getAchievementsUnlockedRewardThreshold(1)) {
      EternityPoints.addAmount(this.getAchievementsUnlockedRewardEffect(1));
    }
    if (this.getTotalAchievementsUnlocked() === this.getAchievementsUnlockedRewardThreshold(4)) {
      EternityPoints.addAmount(this.getAchievementsUnlockedRewardEffect(4));
    }
  },
  unlockComplexityAchievement(row, column, fromUnusualSource) {
    player.complexityAchievements[row - 1][column - 1] = true;
    this.giveComplexityAchievementSingleResult(row, column, fromUnusualSource);
    this.giveComplexityAchievementGlobalResult();
    // When we finality, the complexity achievements we keep are just kept.
    // They don't get re-unlocked. So it's fine to notify whenever we get a complexity achievement,
    // even if we get it from buying finality shard upgrades.
    Notifications.notify(this.getComplexityAchievementName(row, column), 'complexityAchievements');
  },
  getComplexityAchievementName(row, column) {
    return this.complexityAchievementNames[row - 1][column - 1];
  },
  hasComplexityAchievement(row, column) {
    return player.complexityAchievements[row - 1][column - 1];
  },
  isComplexityAchievementDisabled(row, column) {
    if (row === 1 && column === 3) {
      // Yeah, this is a bit dumb, but if we do want to disable another complexity achievement
      // it'll help a lot.
      return !player.complexityAchievementsEnabled[[1].indexOf(row)];
    } else {
      return false;
    }
  },
  isComplexityAchievementActive(row, column) {
    return this.hasComplexityAchievement(row, column) && !this.isComplexityAchievementDisabled(row, column);
  },
  isComplexityAchievementClose(row, column) {
    return ComplexityChallenge.isComplexityChallengeUnlocked(this.complexityChallengeFor(row));
  },
  toggleAchievement(row, column) {
    if (row === 1 && column === 3) {
      player.complexityAchievementsEnabled[[1].indexOf(row)] = !player.complexityAchievementsEnabled[[1].indexOf(row)];
      if (player.complexityAchievementsEnabled[[1].indexOf(row)]) {
        this.giveComplexityAchievementSingleResult(row, column, true);
      }
    }
  },
  complexityAchievementStatusDescription(row, column) {
    if (this.isComplexityAchievementActive(row, column)) {
      return 'Active';
    } else if (!this.hasComplexityAchievement(row, column)) {
      return 'Locked';
    } else if (this.isComplexityAchievementDisabled(row, column)) {
      return 'Disabled';
    }
  },
  rawEffect(row, column) {
    return this.complexityAchievementEffects[row - 1][column - 1]();
  },
  effect(row, column) {
    if (this.isComplexityAchievementActive(row, column)) {
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
  getAchievementsUnlockedRewardClass(x) {
    return Colors.rewardClass(this.isAchievementsUnlockedRewardActive(x));
  },
  startingEternityPoints() {
    return this.getAchievementsUnlockedRewardEffect(1).plus(this.getAchievementsUnlockedRewardEffect(4));
  },
  achievementStatusNumber(row, column) {
    if (this.isComplexityAchievementActive(row, column)) {
      return 1;
    } else if (!this.hasComplexityAchievement(row, column)) {
      return 0;
    } else if (this.isComplexityAchievementDisabled(row, column)) {
      return 0.5;
    }
  },
  color(row, column) {
    return Colors.makeStyle(this.achievementStatusNumber(row, column), false);
  },
  complexityAchievementRow1Column2EffectFormula(x) {
    // The round is here because Decimal.pow(16, 2) isn't exactly new Decimal(256).
    return Decimal.pow(Math.min(16, x), 2).round();
  }
}
