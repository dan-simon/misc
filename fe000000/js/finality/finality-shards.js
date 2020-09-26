let FinalityShardUpgrade = function (i) {
  if ('FinalityShards' in window) {
    return FinalityShards.getUpgrade(i);
  }
  return {
    bought() {
      return player.finalityShardUpgrades[i - 1];
    },
    addBought(n) {
      player.finalityShardUpgrades[i - 1] += n;
    },
    boughtLimit() {
      return i <= 2 ? 72 : 8;
    },
    effectFormula() {
      return FinalityShards.upgradeEffectFormulas[i - 1];
    },
    costAfterBought(x) {
      return Math.floor((1 + x) * Math.pow(2, Math.max(0, (1 + x) / 8 - 1 / 2)));
    },
    cost() {
      return this.costAfterBought(this.bought());
    },
    spentForFirst(x) {
      return [...Array(x)].map((_, i) => this.costAfterBought(i)).reduce((a, b) => a + b, 0);
    },
    spentSoFar() {
      return this.spentForFirst(this.bought());
    },
    effect() {
      // The apparently extra parentheses are intentional.
      return this.effectFormula()(this.bought());
    },
    nextEffect() {
      return this.effectFormula()(1 + this.bought());
    },
    atBoughtLimit() {
      return this.bought() >= this.boughtLimit();
    },
    canBuy() {
      return this.cost() <= FinalityShards.amount() && !this.atBoughtLimit();
    },
    buy(areUpgradeBonusesHandledElsewhere) {
      let old = FinalityShards.totalUpgradeBonuses();
      if (!this.canBuy()) return false;
      this.addBought(1);
      if (!areUpgradeBonusesHandledElsewhere) {
        FinalityShards.handleNewUpgradeBonuses(old);
      }
      return true;
    },
    buyMax() {
      let old = FinalityShards.totalUpgradeBonuses();
      while (this.buy(true)) {};
      FinalityShards.handleNewUpgradeBonuses(old);
    }
  }
}

let FinalityShards = {
  upgradeEffectFormulas: [
    x => 1 + x / 2048, x => Decimal.pow(2, Math.pow(x, 1.5) / 8).floor().max(2 + x),
    x => Math.pow(1 + x, 2), x => Math.pow(1 + x, 2),
    x => 1 + x / 8, x => Math.pow(1 + x, 2),
    x => x / 8, x => Math.pow(1 + x, 2),
  ],
  upgradeList: [1, 2, 3, 4, 5, 6, 7, 8].map((x) => FinalityShardUpgrade(x)),
  getUpgrade: function (x) {
    return this.upgradeList[x - 1];
  },
  total() {
    return player.totalFinalityShards;
  },
  spent() {
    return this.upgradeList.map(x => x.spentSoFar()).reduce((a, b) => a + b);
  },
  amount() {
    return this.total() - this.spent();
  },
  addAmount(x) {
    player.totalFinalityShards += x;
  },
  initializeStartingComplexityAchievements() {
    let startingComplexityAchievements = FinalityStartingBenefits.complexityAchievements();
    for (let row = 0; row < 4; row++) {
      for (let column = 0; column < 4; column++) {
        player.complexityAchievements[row][column] = 4 * row + column < startingComplexityAchievements;
      }
    }
  },
  totalUpgrades() {
    return this.upgradeList.map(x => x.bought()).reduce((a, b) => a + b);
  },
  totalUpgradeBonuses() {
    return Math.floor(this.totalUpgrades() / 4);
  },
  handleNewUpgradeBonuses(old) {
    // This is called at a point when the current number of upgrade bonuses is
    // the new number.
    let current = this.totalUpgradeBonuses();
    Stars.addAmount(FinalityStartingBenefits.starsAt(current).minus(
      FinalityStartingBenefits.starsAt(old)));
    InfinityPoints.addAmount(FinalityStartingBenefits.infinityPointsAt(current).minus(
      FinalityStartingBenefits.infinityPointsAt(old)));
    EternityPoints.addAmount(FinalityStartingBenefits.eternityPointsAt(current).minus(
      FinalityStartingBenefits.eternityPointsAt(old)));
    ComplexityPoints.addAmount(FinalityStartingBenefits.complexityPointsAt(current).minus(
      FinalityStartingBenefits.complexityPointsAt(old)));
    Complexities.addSudden(FinalityStartingBenefits.complexitiesAt(current) -
      FinalityStartingBenefits.complexitiesAt(old));
    for (
      let i = FinalityStartingBenefits.complexityAchievementsAt(old);
      i < FinalityStartingBenefits.complexityAchievementsAt(current); i++) {
      let row = Math.floor(i / 4) + 1;
      let column = i % 4 + 1;
      if (!ComplexityAchievements.hasComplexityAchievement(row, column)) {
        ComplexityAchievements.unlockComplexityAchievement(row, column, true);
      }
    }
  },
  areAllUpgradesCapped() {
    return this.upgradeList.every(x => x.atBoughtLimit());
  },
  anythingToBuy() {
    return this.upgradeList.some(x => x.canBuy());
  },
  maxAll() {
    // Buy the one bought least as long as it's possible to buy one. This isn't too expensive computationally
    // and only happens on user input.
    while (this.anythingToBuy()) {
      [...this.upgradeList].filter(x => x.canBuy()).sort((x, y) => x.bought() - y.bought())[0].buy();
    }
  }
}

let FinalityShardPresets = {
  isRespecOn() {
    return player.respecFinalityShards;
  },
  toggleRespec() {
    player.respecFinalityShards = !player.respecFinalityShards;
  },
  respec() {
    player.finalityShardUpgrades = [0, 0, 0, 0, 0, 0, 0, 0];
  },
  maybeRespec() {
    if (this.isRespecOn()) {
      this.respec();
    }
    player.respecFinalityShards = false;
  },
  respecAndReset() {
    if (Options.confirmation('finalityShardUpgradesRespec') && !confirm(
      'Are you sure you want to respec your bought finality shard upgrades and ' +
      FinalityPrestigeLayer.resetText() + '?')) return;
    this.respec();
    if (FinalityPrestigeLayer.canFinality()) {
      FinalityPrestigeLayer.finality(false);
    } else {
      FinalityPrestigeLayer.finalityReset(false);
    }
  },
  exportString() {
    if (FinalityShards.totalUpgrades() === 0) return 'none';
    return FinalityShards.upgradeList.map(x => x.bought()).join(',');
  },
  export() {
    let output = document.getElementById('finality-shard-upgrades-export-output');
    let parent = output.parentElement;
    parent.style.display = '';
    output.value = this.exportString();
    output.select();
    try {
      document.execCommand('copy');
    } catch(ex) {
      alert('Copying to clipboard failed.');
    }
    if (!player.options.exportDisplay) {
      parent.style.display = 'none';
      document.getElementsByClassName('finality-shard-upgrades-export-button')[0].focus();
    }
  },
  toNumber(x) {
    return Math.max(0, Math.floor(+x)) || 0;
  },
  importStringCounts(importString) {
    if (importString === 'none') importString = '';
    let result = importString.split(',').map(x => this.toNumber(x));
    return result.concat([0, 0, 0, 0, 0, 0, 0, 0].slice(result.length));
  },
  importString(importString) {
    if (!importString) return;
    let importStringCounts = this.importStringCounts(importString);
    let old = FinalityShards.totalUpgradeBonuses();
    for (let i = 1; i <= 8; i++) {
      let times = Math.min(importStringCounts[i - 1], FinalityShardUpgrade(i).boughtLimit()) -
        FinalityShardUpgrade(i).bought();
      for (let j = 0; j < times; j++) {
        FinalityShardUpgrade(i).buy(true);
      }
    }
    FinalityShards.handleNewUpgradeBonuses(old);
  },
  import() {
    this.importString(prompt('Enter your finality shard upgrades (as previously exported):'));
  },
  hasPreset(x) {
    return player.finalityShardUpgradePresets.length >= x;
  },
  presetName(x) {
    if (!this.hasPreset(x)) return 'Untitled';
    return player.finalityShardUpgradePresets[x - 1].name;
  },
  presetFinalityShardUpgradeList(x) {
    if (!this.hasPreset(x)) return '';
    return player.finalityShardUpgradePresets[x - 1].upgrades;
  },
  setPresetName(x, name) {
    player.finalityShardUpgradePresets[x - 1].name = name;
  },
  setPresetFinalityShardUpgradeList(x, finalityShardUpgrades) {
    player.finalityShardUpgradePresets[x - 1].upgrades = finalityShardUpgrades;
  },
  presetSetToCurrentFinalityShardUpgrades(x) {
    this.setPresetFinalityShardUpgradeList(x, this.exportString());
    this.redisplayPresetFinalityShardUpgradeList(x);
  },
  presetLoad(x) {
    this.importString(this.presetFinalityShardUpgradeList(x));
  },
  presetDelete(x) {
    player.finalityShardUpgradePresets = player.finalityShardUpgradePresets.slice(0, x - 1).concat(
      player.finalityShardUpgradePresets.slice(x));
    for (let i = x; i <= player.finalityShardUpgradePresets.length; i++) {
      this.redisplayPreset(i);
    }
  },
  presetCreate() {
    if (!this.hasPreset(32)) {
      player.finalityShardUpgradePresets.push({'name': 'Untitled', 'upgrades': this.exportString()});
      this.redisplayPreset(player.finalityShardUpgradePresets.length);
    }
  },
  redisplayPreset(x) {
    this.redisplayPresetName(x);
    this.redisplayPresetFinalityShardUpgradeList(x);
  },
  redisplayPresetName(x) {
    document.getElementsByClassName('presetfinalityshardupgradename' + x)[0].value = this.presetName(x);
  },
  redisplayPresetFinalityShardUpgradeList(x) {
    document.getElementsByClassName('presetfinalityshardupgradelist' + x)[0].value = this.presetFinalityShardUpgradeList(x);
  }
}
