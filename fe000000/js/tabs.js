let Tabs = {
  rows: [
    ['main', 'infinity', 'normal-challenges', 'autobuyers', 'infinity-challenges'],
    ['goals', 'achievements', 'statistics', 'last-ten-runs', 'options'],
    ['eternity', 'eternity-milestones', 'studies', 'eternity-producer', 'eternity-challenges', 'chroma'],
    ['complexity', 'complexity-challenges', 'complexity-achievements', 'powers', 'oracle', 'galaxies'],
    ['finality', 'finality-shards', 'finality-milestones']
  ],
  tabToTabGroup: {
    'main': 'normal',
    'infinity': 'infinity',
    'normal-challenges': 'infinity',
    'autobuyers': 'normal',
    'infinity-challenges': 'infinity',
    'goals': 'miscellaneous',
    'achievements': 'miscellaneous',
    'statistics': 'miscellaneous',
    'last-ten-runs': 'miscellaneous',
    'options': 'miscellaneous',
    'eternity': 'eternity',
    'eternity-milestones': 'eternity',
    'studies': 'eternity',
    'eternity-producer': 'eternity',
    'eternity-challenges': 'eternity',
    'chroma': 'eternity',
    'complexity': 'complexity',
    'complexity-challenges': 'complexity',
    'complexity-achievements': 'complexity',
    'powers': 'complexity',
    'oracle': 'complexity',
    'galaxies': 'complexity',
    'finality': 'finality',
    'finality-shards': 'finality',
    'finality-milestones': 'finality'
  },
  currentTab() {
    return player.currentTab;
  },
  setTab(x) {
    player.currentTab = x;
    player.currentTabGroup = this.tabToTabGroup[x];
    player.currentTabInGroup[player.currentTabGroup] = x;
  },
  setTabGroup(x) {
    player.currentTabGroup = x;
    player.currentTab = player.currentTabInGroup[x];
  },
  isTabOptionVisible(x) {
    if (Options.showAllTabs()) {
      return true;
    }
    return {
      'main': () => true,
      'infinity': () => PrestigeLayerProgress.hasReached('infinity'),
      'normal-challenges': () => PrestigeLayerProgress.hasReached('infinity'),
      'autobuyers': () => true,
      'infinity-challenges': () => SpecialTabs.isTabVisible('infinity-challenges'),
      'goals': () => true,
      'achievements': () => true,
      'statistics': () => true,
      'last-ten-runs': () => PrestigeLayerProgress.hasReached('infinity'),
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
  isTabVisibleRaw(x) {
    return this.isTabOptionVisible(x) && this.isTabOptionOn(x);
  },
  isTabVisible(x) {
    return this.isTabVisibleRaw(x) && (this.tabToTabGroup[x] === player.currentTabGroup || !this.usingTabGroups());
  },
  usingTabGroups() {
    return player.usingTabGroups;
  },
  setUsingTabGroups(x) {
    player.usingTabGroups = x;
  },
  isTabGroupVisible(x) {
    return this.usingTabGroups() && (x === 'miscellaneous' || this.isTabVisibleRaw(x === 'normal' ? 'main' : x));
  },
  displayTabRow(i) {
    return this.rows[i - 1].some(x => this.isTabVisible(x));
  },
  getSpace(x) {
    return x.map(s => s.length).reduce((a, b) => a + b, 0) + 2 * x.length;
  },
  getTabBreaks(i) {
    let tabBreaks = [];
    let display = [[]]
    for (let rawRow of this.rows) {
      row = rawRow.filter(x => this.isTabVisible(x));
      if (this.getSpace(display[display.length - 1].concat(row)) > 108) {
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
  },
  showAllUnlockedTabs() {
    for (let x in player.tabOptions) {
      if (x !== 'options') {
        player.tabOptions[x] = true;
        document.getElementsByClassName(x + '-tab-option')[0].checked = true;
      }
    }
  },
  hash(x) {
    let d = {
      'achievements': 'ac',
      'autobuyers': 'au',
      'challenges': 'cha',
      'chroma': 'chr',
      'complexity': 'co',
      'galaxies': 'ga',
      'goals': 'go',
      'options': 'op',
      'oracle': 'or',
      'statistics': 'sta',
      'studies': 'stu'
    };
    return x.split('-').map(w => w in d ? d[w] : w[0]).join('');
  },
  exportString() {
    return Object.keys(player.tabOptions).filter(x => player.tabOptions[x]).map(x => this.hash(x)).sort().join(',') || 'none';
  },
  export() {
    let output = document.getElementById('tabs-export-output');
    let parent = output.parentElement;
    let tabPresetBr = document.getElementsByClassName('tabpresetbr')[0];
    parent.style.display = '';
    tabPresetBr.style.display = '';
    output.value = this.exportString();
    output.select();
    if (player.options.exportCopy) {
      output.select();
      try {
        document.execCommand('copy');
      } catch(ex) {
        alert('Copying to clipboard failed.');
      }
    }
    if (!player.options.exportShow) {
      parent.style.display = 'none';
      tabPresetBr.style.display = 'none';
      document.getElementsByClassName('tabs-export-button')[0].focus();
    }
  },
  importString(importString) {
    let presetsWithName = player.tabPresets.filter(x => x.name === importString);
    if (presetsWithName.length > 0) {
      this.importStringFromPreset(presetsWithName[0].tabs);
    } else {
      this.importStringFromPreset(importString);
    }
  },
  importStringFromPreset(importString) {
    if (!importString) return;
    importString = importString.toLowerCase();
    let tabHashes = (importString === 'none') ? [] : importString.split(',');
    for (let x in player.tabOptions) {
      if (x !== 'options') {
        let value = tabHashes.includes(this.hash(x));
        player.tabOptions[x] = value;
        document.getElementsByClassName(x + '-tab-option')[0].checked = value;
      }
    }
  },
  import() {
    this.importString(prompt('Enter tabs to show (as previously exported):'));
  },
  hasPreset(x) {
    return player.tabPresets.length >= x;
  },
  presetName(x) {
    if (!this.hasPreset(x)) return 'Untitled';
    return player.tabPresets[x - 1].name;
  },
  presetTabs(x) {
    if (!this.hasPreset(x)) return '';
    return player.tabPresets[x - 1].tabs;
  },
  setPresetName(x, name) {
    player.tabPresets[x - 1].name = name;
  },
  setPresetTabs(x, shownTabs) {
    player.tabPresets[x - 1].tabs = shownTabs;
  },
  presetSetToCurrentTabs(x) {
    if (Options.confirmation('presetChange') && !confirm('Are you sure you want to change this tab preset?')) {
      return;
    }
    this.setPresetTabs(x, this.exportString());
    this.redisplayPresetTabs(x);
  },
  isLastPresetIndex(x) {
    return player.lastPresetIndices[0] === x;
  },
  setLastPresetIndex(x) {
    player.lastPresetIndices[0] = x;
  },
  updateLastPresetIndexFromDeletion(x) {
    if (player.lastPresetIndices[1] === x) {
      player.lastPresetIndices[0] = 0;
    }
    if (player.lastPresetIndices[1] > x) {
      player.lastPresetIndices[0]--;
    }
  },
  presetClass(x) {
    return (Options.presetHighlightColors() && this.isLastPresetIndex(x)) ? 'softlyhighlighted' : '';
  },
  presetLoad(x) {
    this.importStringFromPreset(this.presetTabs(x));
    this.setLastPresetIndex(x);
  },
  presetDelete(x) {
    if (Options.confirmation('presetDeletion') && !confirm('Are you sure you want to delete this tab preset?')) {
      return;
    }
    player.tabPresets = player.tabPresets.slice(0, x - 1).concat(player.tabPresets.slice(x));
    this.updateLastPresetIndexFromDeletion(x);
    for (let i = x; i <= player.tabPresets.length; i++) {
      this.redisplayPreset(i);
    }
  },
  presetCreate() {
    if (!this.hasPreset(32)) {
      player.tabPresets.push({'name': 'Untitled', 'tabs': this.exportString()});
      this.redisplayPreset(player.tabPresets.length);
    }
  },
  presetSort() {
    player.tabPresets.sort((a, b) => presetSortFunction(a.name, b.name));
    for (let i = 1; i <= player.tabPresets.length; i++) {
      this.redisplayPreset(i);
    }
  },
  redisplayPreset(x) {
    this.redisplayPresetName(x);
    this.redisplayPresetTabs(x);
  },
  redisplayPresetName(x) {
    document.getElementsByClassName('presettabname' + x)[0].value = this.presetName(x);
  },
  redisplayPresetTabs(x) {
    document.getElementsByClassName('presettablist' + x)[0].value = this.presetTabs(x);
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
    'chroma': () => EternityChallenge.isTotalCompletionsRewardActive(3),
    'powers': () => Goals.hasGoal(12),
    'oracle': () => Powers.isUnlocked(),
    'galaxies': () => Oracle.isUnlocked(),
  },
  shouldMakeTabVisible(x) {
    let actualRequirement = this.starRequirements[x].pow(3 / 4);
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

// Note that after prestige or infinity, you'll necessarily have enough total stars
// for all of boost, sacrifice, and prestige to show up.
// Also: Goal 7 is all eternity milestones, and boost power starts at 320 boosts
// (so display requires 240 boosts).
let SpecialDivs = {
  requirements: {
    'boosts': () => Generator(7).amount().gt(0) || player.stats.totalStarsProduced.gte(Math.pow(2, 56)),
    'sacrifice': () => Generator(8).amount().gt(0) || player.stats.totalStarsProduced.gte(Math.pow(2, 96)),
    'prestige': () => player.stats.sacrificesThisInfinity > 0 || player.stats.totalStarsProduced.gte(Math.pow(2, 112)),
    'infinity': () => player.stats.prestigesThisInfinity > 0 || player.stats.totalStarsProduced.gte(Math.pow(2, 224)),
    'boost-power': () => Goals.hasGoal(7) || Boost.highestBoughtThisEternity() >= 3 * Boost.boostPowerStart() / 4,
    'softcap': () => Generators.list.some(x => x.multiplier().gte(Generators.nerfValue().pow(0.25))),
    'hardcap': () => player.stats.totalStarsProduced.gte(Decimal.pow(2, Math.pow(2, 46))),
  },
  shouldMakeDivVisible(x) {
    return this.requirements[x]();
  },
  makeDivsVisible() {
    for (let x in this.requirements) {
      if (this.shouldMakeDivVisible(x)) {
        player.isDivVisible[x] = true;
      }
    }
  },
  isDivVisible(x) {
    return player.isDivVisible[x];
  }
}

let ResetButtons = {
  list: ['infinity', 'eternity', 'complexity', 'finality'],
  isResetButtonVisible(x) {
    let isReached = (x === 'infinity') ? SpecialDivs.isDivVisible('infinity') : PrestigeLayerProgress.hasReached(this.list[this.list.indexOf(x) - 1]);
    return isReached && (Options.showResetButtonsForHiddenTabs() || Tabs.isTabVisible(x) || !PrestigeLayerProgress.hasReached(x));
  }
}

