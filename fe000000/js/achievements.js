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
      'Quick return',
      'Reversed'
    ],
    [
      'All a lot',
      'Too many stars spoil the universe',
      'Challenged',
      'Infinitely quick',
      'Too high',
      'Infinity is more than one',
      'Hopefully they were the easy ones',
      'Uncapped'
    ],
    [
      'Infinity?',
      'Infinitely quicker',
      'Thrifty',
      'Nerf removal',
      'Lose nothing, gain anyway',
      'Stop-and-go',
      'A taste of what\'s coming',
      'Challenged again'
    ],
    [
      'The last infinity',
      'Pull a fast one',
      'Far too high',
      'Infinite effect',
      'Tri-vial',
      'Sacrifice is enough',
      'You can skip IC8 and get this later',
      'That took forever'
    ],
    [
      'Hold infinity in the palm of your hand',
      'Not edutainment',
      'I knew him forever',
      'Longer than forever',
      'More nerf removal',
      'Normal achievement',
      'More stop-and-go',
      'Forever idle'
    ],
    [
      'You\'ll want this theorem eventually',
      'Forever challenged',
      'One down, seven to go',
      'Not enough',
      'Forever tired of all the "forever" achievements',
      'It\'s hard to notice the nerf',
      'Nicer than it sounds',
      'Rainbow'
    ],
    [
      'Ever closer',
      'That took long enough',
      'This achievement doesn\'t exist',
      'Fourth row hype',
      'What\'s that?',
      'That doesn\'t sound right',
      'Lightspeed',
      'It\'s not simple'
    ],
    [
      'Double rainbow',
      'If you\'re asking, it\'s worth it',
      'Faster than a snail',
      'More achievements?',
      'Too complex?',
      'Faster than a turtle',
      'Bingo',
      'Still two more rows here'
    ],
    [
      'Even more... this achievement name is overdone',
      'High-frequency',
      'They\'re not challenges',
      'Powerful',
      'Diminishing returns',
      'You can probably delete some',
      'Forever capped',
      'Next comes Sokoban'
    ],
    [
      'Very crafty',
      'Infinite eternities',
      'It is luck',
      'Wait, there\'s no tickspeed?',
      'Not that type of power',
      'Update before cap',
      'Short run era?',
      'Nearing the end'
    ],
    [
      'It\'s still not simple',
      'Still powerful',
      'Faster than another snail with the same speed',
      'Permanently greener grass',
      'Short-run achievement naming is hard',
      'Last-mile delivery',
      'The final one',
      'The end'
    ]
  ],
  // Various notes:
  // Yes, it is important that Challenge 10 be running (not just have its effect active)
  // for the Challenge 10 achievement. If some other challenge incorporated Challenge 10,
  // you still wouldn't be in Challenge 10 while in it. This is even more true for Challenge 2,
  // since in that case there actually *is* another challenge (IC1) incorporating it.
  // Whether the total EP achievement is current complexity or full total has no
  // consequences at all, because you necessarily get this achievement in first complexity.
  // Exception: Importing a save, where full total gives the achievement, as it should be.
  // Yes, there is some confusion between chroma and display chroma. But chroma is IMO the right one
  // to use because it's the thing we're actually basing stuff on.
  // No, I'm not sure if comparing to the chroma cap requires us to also check that chroma is unlocked,
  // but better safe that sorry (perhaps the chroma cap could be 0, which would give the achievement for free).
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
      () => range(1, 7).map(i => Generator(i).amount()).every(i => i.gte(Math.pow(2, 16))),
      () => range(1, 8).map(i => Generator(i).multiplier()).some(i => i.gte(Math.pow(2, 16))),
      () => true,
      () => range(1, 9).every(x => Autobuyer(x).hasAutobuyer()),
      () => Stars.amount().gte(Decimal.pow(2, 128)) && player.stats.timeSincePrestige <= 60,
      () => Achievements.hasReversed(range(1, 8).map(i => Generator(i).multiplier()))
    ],
    [
      () => range(1, 8).map(i => Generator(i).multiplier()).every(i => i.gte(Math.pow(2, 16))),
      () => true,
      () => Challenge.numberOfChallengesCompleted() > 0,
      () => player.stats.timeSinceInfinity <= 3600,
      () => Prestige.prestigePowerMultGain().gte(16),
      () => InfinityGenerator(2).bought() > 0,
      () => Challenge.numberOfChallengesCompleted() >= 6,
      () => InfinityPrestigeLayer.isBreakInfinityOn()
    ],
    [
      () => Stars.amount().gte(Decimal.pow(2, 1024)),
      () => player.stats.timeSinceInfinity <= 60,
      () => Challenge.isChallengeRunning(7) && Challenge.challenge7PurchasesLeft() >= 256,
      () => Infinities.amount() >= 256,
      () => Challenge.isChallengeRunning(10) && player.stats.sacrificesThisInfinity === 0,
      () => Challenge.isChallengeRunning(2) && player.stats.timeSinceInfinity <= 16,
      () => InfinityPrestigeLayer.infinityPointGain().gte(4096) && player.stats.prestigesThisInfinity <= 4,
      () => InfinityChallenge.numberOfInfinityChallengesCompleted() > 0
    ],
    [
      () => InfinityGenerator(8).bought() > 0,
      () => InfinityChallenge.isInfinityChallengeRunning(1) && player.stats.timeSinceInfinity <= 1,
      () => Prestige.prestigePowerMultGain().gte(Decimal.pow(2, 256)),
      () => InfinityStars.multiplier().gte(Decimal.pow(2, 256)),
      () => InfinityChallenge.isInfinityChallengeRunning(3) && player.stats.timeSinceInfinity <= 3,
      () => InfinityChallenge.isInfinityChallengeRunning(2) && player.stats.prestigesThisInfinity === 0,
      () => InfinityChallenge.numberOfInfinityChallengesCompleted() >= 8,
      () => true
    ],
    [
      () => player.stats.timeSinceEternity <= 3600,
      () => range(1, 16).some(i => Study(i).isBought()),
      () => player.stats.timeSinceEternity <= 60,
      () => EternityMilestones.hasAllEternityMilestones(),
      () => Eternities.amount().gte(256),
      () => range(1, 4).every(i => Study(i).isBought()),
      () => InfinityChallenge.isInfinityChallengeRunning(4) && player.stats.timeSinceInfinity <= 16,
      () => EternityProducer.isUnlocked()
    ],
    [
      () => Boost.extraTheoremsActualAndDisplay() >= 6,
      () => EternityChallenge.getTotalEternityChallengeCompletions() > 0,
      () => [1, 2, 3, 4, 5, 6, 7, 8].some(x => EternityChallenge.getEternityChallengeCompletions(x) === 4),
      () => EternityPoints.totalEPProduced().gte(Decimal.pow(2, 256)),
      () => true,
      () => EternityChallenge.isEternityChallengeRunning(1) &&
          EternityPrestigeLayer.eternityPointGain().gte(Decimal.pow(2, 256)),
      () => EternityChallenge.getTotalEternityChallengeCompletions() >= 24,
      () => Chroma.isUnlocked()
    ],
    [
      () => Chroma.isUnlocked() && Chroma.amount() >= Chroma.cap() * 0.75,
      () => EternityChallenge.areAllEternityChallengesCompleted(),
      () => Stars.amount().gte(Decimal.pow(9, Math.pow(9, 9))),
      () => range(1, 12).every(i => Study(i).isBought()),
      () => Generators.areAnyMultipliersNerfed(),
      () => Permanence.getEternitiesPerPermanence().lte(1),
      () => Chroma.amount() >= Math.pow(2, 14) && player.stats.timeSinceEternity <= 16,
      () => true
    ],
    [
      () => PrestigeLayerProgress.hasReached('complexity') && Chroma.isUnlocked(),
      () => ComplexityChallenge.getComplexityChallengeCompletions(1) >= 2,
      () => player.stats.timeSinceComplexity <= Math.pow(2, 16),
      () => ComplexityAchievements.getTotalAchievementsUnlocked() > 0,
      () => ComplexityGenerator(2).bought() > 0,
      () => player.stats.timeSinceComplexity <= 3600,
      () => Achievements.complexityAchievementLines.some(i => i.every(j => ComplexityAchievements.hasComplexityAchievement(j[0], j[1]))),
      () => ComplexityAchievements.getTotalAchievementsUnlocked() >= 16
    ],
    [
      () => Complexities.amount() >= 256,
      () => ComplexityPrestigeLayer.complexityPointGain().gte(16) && !Chroma.isColorUnlocked(6),
      () => range(1, 6).every(i => ComplexityChallenge.isComplexityChallengeRunning(i)),
      () => Powers.isUnlocked(),
      () => Powers.equipped().length === 3 && Powers.equipped().every(i => i.type === Powers.equipped()[0].type),
      () => Powers.equipped().concat(Powers.stored()).length >= 12,
      () => Powers.isUnlocked() && Powers.getExtraMultiplier('eternity') === 3,
      () => Oracle.isUnlocked()
    ],
    [
      () => true,
      () => Eternities.amount().gte(Decimal.pow(2, 256)),
      () => Powers.equipped().concat(Powers.stored()).some(x => x.rarity >= 3),
      () => Galaxy.isUnlocked(),
      () => Chroma.isUnlocked() && Chroma.amount() >= Math.pow(2, Achievements.logThresholdChromaForDoubling()),
      () => Galaxy.timeToReachEffectCap() >= 18000,
      () => Powers.isUnlocked() && Powers.getExtraMultiplier('eternity') === 3 && player.stats.timeSinceComplexity <= 60,
      () => true
    ],
    [
      () => PrestigeLayerProgress.hasReached('finality'),
      () => PrestigeLayerProgress.hasReached('finality') && Powers.isUnlocked(),
      () => player.stats.timeSinceFinality <= Math.pow(2, 16),
      () => FinalityShards.totalUpgradeBonuses() >= 16,
      () => player.stats.timeSinceFinality <= 3600,
      () => FinalityMilestones.hasAllFinalityMilestones(),
      () => FinalityGenerator(8).bought() > 0,
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
      'loop'
    ],
    [
      'loop',
      'infinity',
      'loop',
      'infinity',
      'prestige',
      'loop',
      'loop',
      'loop'
    ],
    [
      'loop',
      'infinity',
      'infinity',
      'loop',
      'infinity',
      'infinity',
      'infinity',
      'loop'
    ],
    [
      'loop',
      'infinity',
      'prestige',
      'loop',
      'infinity',
      'infinity',
      'loop',
      'eternity'
    ],
    [
      'eternity',
      'loop',
      'eternity',
      'loop',
      'loop',
      'loop',
      'infinity',
      'loop'
    ],
    [
      'loop',
      'loop',
      'loop',
      'loop',
      'permanence',
      'eternity',
      'loop',
      'loop'
    ],
    [
      'loop',
      'loop',
      'loop',
      'loop',
      'loop',
      'loop',
      'loop',
      'complexity'
    ],
    [
      'loop',
      'loop',
      'complexity',
      'loop',
      'loop',
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
      'loop',
      'loop'
    ],
    [
      'craft',
      'loop',
      'loop',
      'loop',
      'loop',
      'loop',
      'loop',
      'finality'
    ],
    [
      'complexity',
      'loop',
      'finality',
      'loop',
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
    for (let row = 1; row <= 12; row++) {
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
    if (this.cache.count) {
      this.cache.count++;
    }
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
      let highestCloseRow = Math.min(12, Math.floor(this.getHighest() + this.beyondHighest() - 1) / 8);
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
      this.cache['highest'] = Math.max(8, ...range(1, 12).map(
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
    return Math.pow(2, this.getTotalAchievementsUnlockedForMultipliers() / 64);
  },
  rawOtherMultiplier() {
    // This stops things from being buggy if you have negative achievements.
    let ach = this.getTotalAchievementsUnlockedForMultipliers();
    return (ach >= 0) ? (1 + ach / 256) : (1 / (1 - ach / 256));
  },
  getTotalAchievementsUnlockedForMultipliers() {
    return (this.getTotalAchievementsUnlocked() + player.cheats.extraAchievements) * player.cheats.achievementExtraMultiplier;
  },
  getTotalAchievementsUnlocked() {
    if (this.cache.count === undefined) {
      this.cache.count = range(1, 12).map(x => range(1, 8).filter(y => this.hasAchievement(x, y)).length).reduce((a, b) => a + b);
    }
    return this.cache.count;
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
  complexityAchievementLines: [
    [[1, 1], [1, 2], [1, 3], [1, 4]],
    [[2, 1], [2, 2], [2, 3], [2, 4]],
    [[3, 1], [3, 2], [3, 3], [3, 4]],
    [[4, 1], [4, 2], [4, 3], [4, 4]],
    [[1, 1], [2, 1], [3, 1], [4, 1]],
    [[1, 2], [2, 2], [3, 2], [4, 2]],
    [[1, 3], [2, 3], [3, 3], [4, 3]],
    [[1, 4], [2, 4], [3, 4], [4, 4]]
  ],
  logThresholdChromaForDoubling() {
    let eff = Galaxy.effect();
    // Note that this can be infinite if the galaxy effect is slightly more than 1, also.
    // I just feel slightly unsafe about the effect = 1 logic even though it should work,
    // so it's special-cased.
    return (eff === 1) ? Infinity : eff / (eff - 1);
  },
  thresholdChromaForDoublingText() {
    if (!(Chroma.isUnlocked() && Galaxy.isUnlocked())) {
      return '';
    }
    if (Galaxy.effect() === 1) {
      return ' (currently requires infinite chroma)'
    }
    let t = Decimal.pow(2, this.logThresholdChromaForDoubling());
    return ' (currently requires ' + format(t) + ' chroma)';
  },
  color(row, column) {
    return Colors.makeStyle(this.hasAchievement(row, column), false);
  }
}
