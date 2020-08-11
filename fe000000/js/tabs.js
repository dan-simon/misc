let Tabs = {
  currentTab() {
    return player.currentTab;
  },
  setTab(x) {
    player.currentTab = x;
  },
  isTabVisible(x) {
    return {
      'main': () => true,
      'infinity': () => PrestigeLayerProgress.hasReached('infinity'),
      'challenges': () => PrestigeLayerProgress.hasReached('infinity'),
      'autobuyers': () => true,
      'infinity-challenges': () => SpecialTabs.isTabVisible('infinity-challenges'),
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
      'statistics': () => true,
      'options': () => true,
    }[x]();
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
  shouldMakeTabVisible(x) {
    let actualRequirement = this.starRequirements[x].pow(0.5);
    return player.stats.totalStarsProduced.gte(actualRequirement) ||
    player.stats.totalIPProduced.gte(actualRequirement.pow(Math.pow(2, -8))) ||
    player.stats.totalEPProduced.gte(actualRequirement.pow(Math.pow(2, -16))) ||
    player.stats.totalCPProduced.gte(actualRequirement.pow(Math.pow(2, -32)));
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
