let Tabs = {
  rows: [
    ['main', 'infinity', 'challenges', 'autobuyers', 'infinity-challenges', 'goals', 'statistics', 'options'],
    ['eternity', 'eternity-milestones', 'studies', 'eternity-producer', 'eternity-challenges', 'chroma'],
    ['complexity', 'complexity-challenges', 'complexity-achievements', 'powers', 'oracle', 'galaxies'],
    ['finality', 'finality-shards', 'finality-milestones']
  ],
  currentTab() {
    return player.currentTab;
  },
  setTab(x) {
    player.currentTab = x;
  },
  isTabOptionVisible(x) {
    return {
      'main': () => true,
      'infinity': () => PrestigeLayerProgress.hasReached('infinity'),
      'challenges': () => PrestigeLayerProgress.hasReached('infinity'),
      'autobuyers': () => true,
      'infinity-challenges': () => SpecialTabs.isTabVisible('infinity-challenges'),
      'goals': () => true,
      'statistics': () => true,
      'options': () => true,
      'eternity': () => PrestigeLayerProgress.hasReached('eternity'),
      'eternity-milestones': () => PrestigeLayerProgress.hasReached('eternity'),
      'studies': () => PrestigeLayerProgress.hasReached('eternity'),
      'eternity-producer': () => SpecialTabs.isTabVisible('eternity-producer'),
      'eternity-challenges': () => SpecialTabs.isTabVisible('eternity-challenges'),
      'chroma': () => SpecialTabs.isTabVisible('chroma'),
      'complexity': () => PrestigeLayerProgress.hasReached('complexity'),
      'complexity-challenges': () => PrestigeLayerProgress.hasReached('complexity'),
      'complexity-achievements': () => PrestigeLayerProgress.hasReached('complexity'),
      'powers': () => SpecialTabs.isTabVisible('powers'),
      'oracle': () => SpecialTabs.isTabVisible('oracle'),
      'galaxies': () => SpecialTabs.isTabVisible('galaxies'),
      'finality': () => PrestigeLayerProgress.hasReached('finality'),
      'finality-shards': () => PrestigeLayerProgress.hasReached('finality'),
      'finality-milestones': () => PrestigeLayerProgress.hasReached('finality'),
    }[x]();
  },
  isTabOptionOn(x) {
    return player.tabOptions[x];
  },
  isTabVisible(x) {
    return this.isTabOptionVisible(x) && this.isTabOptionOn(x);
  },
  displayTabRow(i) {
    return this.rows[i - 1].some(x => this.isTabVisible(x));
  },
  getSpace(x) {
    return x.map(s => s.length).reduce((a, b) => a + b) + 2 * x.length;
  },
  getTabBreaks(i) {
    let tabBreaks = [];
    let display = [[]]
    for (let rawRow of this.rows) {
      row = rawRow.filter(x => this.isTabVisible(x));
      if (this.getSpace(display[display.length - 1].concat(row)) > 96) {
        display.push(row);
        tabBreaks.push(true);
      } else {
        display[display.length - 1] = display[display.length - 1].concat(row);
        tabBreaks.push(false);
      }
    }
    // First entry is always false.
    return tabBreaks.slice(1);
  },
  displayTabBreak(i) {
    return this.getTabBreaks()[i - 1];
  },
  setTabOption(x, b) {
    player.tabOptions[x] = b;
  }
}

let SpecialTabs = {
  starRequirements: {
    'infinity-challenges': InfinityChallenge.getInfinityChallengeRequirement(1),
    'eternity-producer': Decimal.pow(EternityProducer.unlockCost(), Math.pow(2, 16)),
    'eternity-challenges': EternityChallenge.getEternityChallengeRequirementAtTier(1, 0),
    'chroma': Decimal.pow(Chroma.getUnlockColorCost(1), Math.pow(2, 16)),
    'powers': Decimal.pow(Powers.unlockCost(), Math.pow(2, 32)),
    'oracle': Decimal.pow(Oracle.unlockCost(), Math.pow(2, 32)),
    'galaxies': Decimal.pow(Galaxy.unlockCost(), Math.pow(2, 32)),
  },
  alternateRequirments: {
    'infinity-challenges': () => Goals.hasGoal(4),
    'eternity-producer': () => Goals.hasGoal(7),
    'eternity-challenges': () => Goals.hasGoal(8),
    'chroma': () => EternityChallenge.isTotalCompletionsRewardActive(2),
    'powers': () => Goals.hasGoal(12),
    'oracle': () => Powers.isUnlocked(),
    'galaxies': () => Oracle.isUnlocked(),
  },
  shouldMakeTabVisible(x) {
    let actualRequirement = this.starRequirements[x].pow(0.5);
    return this.alternateRequirments[x]() ||
    player.stats.totalStarsProduced.gte(actualRequirement) ||
    player.stats.totalIPProduced.gte(actualRequirement.pow(Math.pow(2, -8))) ||
    player.stats.totalEPProduced.gte(actualRequirement.pow(Math.pow(2, -16))) ||
    player.stats.totalCPProduced.gte(actualRequirement.pow(Math.pow(2, -32))) ||
    PrestigeLayerProgress.hasReached('finality');
  },
  makeTabsVisible() {
    for (let x in this.starRequirements) {
      if (this.shouldMakeTabVisible(x)) {
        player.isTabVisible[x] = true;
      }
    }
  },
  isTabVisible(x) {
    return player.isTabVisible[x];
  }
}
