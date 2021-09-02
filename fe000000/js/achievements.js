let Achievements = {
  cache: {},
  names: [
    [
      'Easy',
      'GG',
      'This power of two doesn\'t exist',
      'Halfway',
      '5G network',
      'Hex generator?',
      'It\'s not luck',
      'The last one'
    ],
    [
      'Lose now, gain later',
      'Double-boost',
      'That\'s a lot',
      'That\'s still a lot',
      'Lose more now, gain more later',
      'You can idle now',
      'Reversed',
      'Too many stars spoil the universe'
    ],
    [
      'Challenged',
      'Hopefully they were the easy ones',
      'Uncapped',
      'Infinity?',
      'Nerf removal',
      'Lose nothing, gain anyway',
      'Stop-and-go',
      'Challenged again'
    ],
    [
      'Pull a fast one',
      'Tri-vial',
      'You can skip IC8 and get this later',
      'That took forever',
      'Hold infinity in the palm of your hand',
      'Not edutainment',
      'Longer than forever',
      'More nerf removal',
    ],
    [
      'Normal achievement',
      'More stop-and-go',
      'Forever idle',
      'Forever challenged',
      'Not enough',
      'Forever tired of all the "forever" achievements',
      'It\'s hard to notice the nerf',
      'Rainbow'
    ],
    [
      'That took long enough',
      'This achievement doesn\'t exist',
      'Fourth row hype',
      'That doesn\'t sound right',
      'It\'s not simple',
      'Faster than a snail',
      'More achievements?',
      'Still two more rows here'
    ],
    [
      'Even more... this achievement name is overdone',
      'Unpolluted',
      'They\'re not challenges',
      'Powerful',
      'You can probably delete some',
      'Next comes Sokoban',
      'Very crafty',
      'Wait, there\'s no tickspeed?'
    ],
    [
      'It is luck',
      'Forever capped',
      'Update before cap',
      'Nearing the end',
      'Faster than another snail with the same speed',
      'Permanently greener grass',
      'Last-mile delivery',
      'The end'
    ]
  ],
  // Various notes:
  // Yes, it is important that Challenge 10 be running (not just have its effect active)
  // for the Challenge 10 achievement. If some other challenge incorperated Challenge 10,
  // you still wouldn't be in Challenge 10 while in it. This is even more true for Challenge 2.
  // Whether the total EP achievement is current complexity or full total has no
  // consequences at all, because you necessarily get this achievement in first complexity.
  // Exception: Importing a save, where full total gives the achievement, as it should be.
  // Yes, there is some confusion between chroma and display chroma. But chroma is IMO the right one
  // to use because it's the thing we're actually basing stuff on.
  // Yes, "Have a power with rarity at least 3" actually requires you to have such a power,
  // not just to gain one. This very rarely encourages deleting a power so you can get
  // a new power with rarity at least 3 to not be deleted, but that's very rare.
  // You don't need an eternity power for the achievement for capping eternity power
  // extra multiplier, but powers do need to be unlocked.
  requirements: [
    [
      () => Generator(1).bought() > 0,
      () => Generator(2).bought() > 0,
      () => Generator(3).bought() > 0,
      () => Generator(4).bought() > 0,
      () => Generator(5).bought() > 0,
      () => Generator(6).bought() > 0,
      () => Generator(7).bought() > 0,
      () => Generator(8).bought() > 0
    ],
    [
      () => true,
      () => Boost.bought() >= 2,
      () => range(1, 7).map(i => Generator(i).amount()).reduce(
        (a, b) => Decimal.min(a, b)).gte(Math.pow(2, 16)),
      () => range(1, 8).map(i => Generator(i).multiplier()).reduce(
        (a, b) => Decimal.max(a, b)).gte(Math.pow(2, 16)),
      () => true,
      () => range(1, 9).every(x => Autobuyer(x).hasAutobuyer()),
      () => Achievements.hasReversed(range(1, 8).map(i => Generator(i).multiplier())),
      () => true
    ],
    [
      () => Challenge.numberOfChallengesCompleted() > 0,
      () => Challenge.numberOfChallengesCompleted() >= 6,
      () => InfinityPrestigeLayer.isBreakInfinityOn(),
      () => Stars.amount().gte(Decimal.pow(2, 1024)),
      () => Infinities.amount() >= 256,
      () => Challenge.isChallengeRunning(10) && player.stats.sacrificesThisInfinity === 0,
      () => Challenge.isChallengeRunning(2) && player.stats.timeSinceInfinity <= 16,
      () => InfinityChallenge.numberOfInfinityChallengesCompleted() > 0
    ],
    [
      () => InfinityChallenge.isInfinityChallengeRunning(1) && player.stats.timeSinceInfinity <= 1,
      () => InfinityChallenge.isInfinityChallengeRunning(3) && player.stats.timeSinceInfinity <= 3,
      () => InfinityChallenge.numberOfInfinityChallengesCompleted() >= 8,
      () => true,
      () => player.stats.timeSinceEternity <= 3600,
      () => range(1, 16).some(i => Study(i).isBought()),
      () => EternityMilestones.hasAllEternityMilestones(),
      () => Eternities.amount().gte(256)
    ],
    [
      () => range(1, 4).every(i => Study(i).isBought()),
      () => InfinityChallenge.isInfinityChallengeRunning(4) && player.stats.timeSinceInfinity <= 16,
      () => EternityProducer.isUnlocked(),
      () => EternityChallenge.getTotalEternityChallengeCompletions() > 0,
      () => EternityPoints.totalEPProduced().gte(Decimal.pow(2, 256)),
      () => true,
      () => EternityChallenge.isEternityChallengeRunning(1) &&
        EternityPrestigeLayer.eternityPointGain().gte(Decimal.pow(2, 256)),
      () => Chroma.isUnlocked()
    ],
    [
      () => EternityChallenge.areAllEternityChallengesCompleted(),
      () => Stars.amount().gte(Decimal.pow(9, Math.pow(9, 9))),
      () => range(1, 12).every(i => Study(i).isBought()),
      () => Permanence.getEternitiesPerPermanence().lte(1),
      () => true,
      () => player.stats.timeSinceComplexity <= Math.pow(2, 16),
      () => ComplexityAchievements.getTotalAchievementsUnlocked() > 0,
      () => ComplexityAchievements.getTotalAchievementsUnlocked() >= 16
    ],
    [
      () => Complexities.amount() >= 256,
      () => ComplexityPrestigeLayer.complexityPointGain().gte(16) && !Chroma.isColorUnlocked(6),
      () => range(1, 6).every(i => ComplexityChallenge.isComplexityChallengeRunning(i)),
      () => Powers.isUnlocked(),
      () => Powers.equipped().concat(Powers.stored()).length >= 12,
      () => Oracle.isUnlocked(),
      () => true,
      () => Galaxy.isUnlocked()
    ],
    [
      () => Powers.equipped().concat(Powers.stored()).some(x => x.rarity >= 3),
      () => Powers.isUnlocked() && Powers.getExtraMultiplier('eternity') === 3,
      () => Galaxy.timeToReachEffectCap() >= 18000,
      () => true,
      () => player.stats.timeSinceFinality <= Math.pow(2, 16),
      () => FinalityShards.totalUpgradeBonuses() >= 16,
      () => FinalityMilestones.hasAllFinalityMilestones(),
      () => FinalityShards.areAllUpgradesCapped()
    ]
  ],
  situations: [
    [
      'loop',
      'loop',
      'loop',
      'loop',
      'loop',
      'loop',
      'loop',
      'loop'
    ],
    [
      'sacrifice',
      'loop',
      'loop',
      'loop',
      'prestige',
      'loop',
      'loop',
      'infinity'
    ],
    [
      'loop',
      'loop',
      'loop',
      'loop',
      'loop',
      'infinity',
      'infinity',
      'loop'
    ],
    [
      'infinity',
      'infinity',
      'loop',
      'eternity',
      'eternity',
      'loop',
      'loop',
      'loop'
    ],
    [
      'loop',
      'infinity',
      'loop',
      'loop',
      'loop',
      'permanence',
      'eternity',
      'loop'
    ],
    [
      'loop',
      'loop',
      'loop',
      'loop',
      'complexity',
      'complexity',
      'loop',
      'loop'
    ],
    [
      'loop',
      'complexity',
      'complexity',
      'loop',
      'loop',
      'loop',
      'craft',
      'loop'
    ],
    [
      'loop',
      'loop',
      'loop',
      'finality',
      'finality',
      'loop',
      'loop',
      'loop'
    ]
  ],
  invalidateCache() {
    this.cache = {};
  },
  checkForAchievements(situation) {
    for (let row = 1; row <= 8; row++) {
      for (let column = 1; column <= 8; column++) {
        if (!this.hasAchievement(row, column) &&
          this.getAchievementSituation(row, column) === situation &&
          this.getAchievementRequirement(row, column)()) {
          this.unlockAchievement(row, column);
        }
      }
    }
  },
  hasAchievement(row, column) {
    return player.achievements.table[row - 1][column - 1];
  },
  getAchievementRawName(row, column) {
    return this.names[row - 1][column - 1];
  },
  getAchievementName(row, column) {
    return this.isAchievementClose(row, column) ? this.getAchievementRawName(row, column) : '???';
  },
  getAchievementRequirement(row, column) {
    return this.requirements[row - 1][column - 1];
  },
  getAchievementSituation(row, column) {
    return this.situations[row - 1][column - 1];
  },
  unlockAchievement(row, column) {
    player.achievements.table[row - 1][column - 1] = true;
    Notifications.notify(this.getAchievementRawName(row, column), 'achievements');
  },
  active() {
    return player.achievements.active;
  },
  toggleActive(x) {
    player.achievements.active = !player.achievements.active;
  },
  requirementDescriptions() {
    return player.achievements.requirementDescriptions;
  },
  toggleRequirementDescriptions(x) {
    player.achievements.requirementDescriptions = !player.achievements.requirementDescriptions;
  },
  showFullyFarRows() {
    return player.achievements.showFullyFarRows;
  },
  toggleShowFullyFarRows(x) {
    player.achievements.showFullyFarRows = !player.achievements.showFullyFarRows;
  },
  showCompletedRows() {
    return player.achievements.showCompletedRows;
  },
  toggleShowCompletedRows(x) {
    player.achievements.showCompletedRows = !player.achievements.showCompletedRows;
  },
  showRow(x) {
    if (!('row' + x in this.cache)) {
      let highestCloseRow = Math.min(8, Math.floor(this.getHighest() + this.beyondHighest() - 1) / 8);
      this.cache['row' + x] = (this.showFullyFarRows() || x <= highestCloseRow) &&
        (this.showCompletedRows() || range(1, 8).some(y => !this.hasAchievement(x, y)));
    }
    return this.cache['row' + x];
  },
  showAchievementDescriptionBelow(row, column) {
    return this.isAchievementClose(row, column) && this.showRow(row);
  },
  beyondHighest() {
    return Math.max(0, Math.floor(player.achievements.beyondHighest));
  },
  setBeyondHighest(x) {
    player.achievements.beyondHighest = (x === 0) ? 0 : (x || 2);
  },
  getHighest() {
    if (!('highest' in this.cache)) {
      this.cache['highest'] = Math.max(8, ...range(1, 8).map(
        x => 8 * x + Math.max(...range(1, 8).filter(y => this.hasAchievement(x, y)))));
    }
    return this.cache['highest'];
  },
  isAchievementClose(row, column) {
    if (!('close' + row + '&' + column in this.cache)) {
      let highest = this.getHighest();
      this.cache['close' + row + '&' + column] = 8 * row + column <= highest + this.beyondHighest();
    }
    return this.cache['close' + row + '&' + column];
  },
  achievementStatusDescription(row, column) {
    if (this.hasAchievement(row, column)) {
      return 'Unlocked';
    } else {
      return 'Locked';
    }
  },
  generatorMultiplier() {
    return this.active() ? this.rawGeneratorMultiplier() : 1;
  },
  otherMultiplier() {
    return this.active() ? this.rawOtherMultiplier() : 1;
  },
  rawGeneratorMultiplier() {
    return Math.pow(2, this.getTotalAchievementsUnlocked() / 64);
  },
  rawOtherMultiplier() {
    return 1 + this.getTotalAchievementsUnlocked() / 256;
  },
  getTotalAchievementsUnlocked() {
    return range(1, 8).map(x => range(1, 8).filter(y => this.hasAchievement(x, y)).length).reduce((a, b) => a + b);
  },
  nonGeneratorEffectsText() {
    let result = []
    if (Chroma.isUnlocked() || PrestigeLayerProgress.hasReached('complexity')) {
      result.push('chroma buildup speed');
    }
    if (Powers.isUnlocked() || PrestigeLayerProgress.hasReached('finality')) {
      result.push('power gain speed');
    }
    if (Galaxy.isUnlocked() || PrestigeLayerProgress.hasReached('finality')) {
      result.push('galaxy effect buildup speed');
    }
    return coordinate('*', '', result);
  },
  hasNonGeneratorEffects() {
    return Chroma.isUnlocked() || PrestigeLayerProgress.hasReached('complexity');
  },
  hasReversed(x) {
    return range(0, x.length - 2).every(i => x[i].lt(x[i + 1]));
  },
  color(row, column) {
    return Colors.makeStyle(this.hasAchievement(row, column), false);
  }
}
