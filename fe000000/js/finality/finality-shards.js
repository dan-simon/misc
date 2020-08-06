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
    spentSoFar() {
      return [...Array(this.bought())].map((_, i) => this.costAfterBought(i)).reduce((a, b) => a + b, 0);
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
      return this.cost() <= FinalityShards.amount();
    },
    buy(areUpgradeBonusesHandledElsewhere) {
      let old = FinalityShards.totalUpgradeBonuses();
      if (!this.canBuy()) return;
      this.addBought(1);
      if (!areUpgradeBonusesHandledElsewhere) {
        FinalityShards.handleNewUpgradeBonuses(old);
      }
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
    x => Math.pow(1 + x, 2), x => 1 + x / 8,
    x => Math.pow(1 + x, 2), x => x / 8,
    x => Math.pow(1 + x, 2), x => x
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
    this.respec();
    if (FinalityPrestigeLayer.canFinality()) {
      FinalityPrestigeLayer.finality();
    } else {
      FinalityPrestigeLayer.finalityReset();
    }
  },
  initializeStartingComplexityAchievements() {
    let totalUpgradeBonuses = this.totalUpgradeBonuses();
    for (let row = 0; row < 4; row++) {
      for (let column = 0; column < 4; column++) {
        player.complexityAchievements[row][column] = 4 * row + column < totalUpgradeBonuses;
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
      FinalityStartingBenefits.eternityPointsAt(old)))
    ComplexityPoints.addAmount(FinalityStartingBenefits.complexityPointsAt(current).minus(
      FinalityStartingBenefits.complexityPointsAt(old)))
    Complexities.add(FinalityStartingBenefits.complexitiesAt(current) -
      FinalityStartingBenefits.complexitiesAt(old));
    for (let i = old; i < current; i++) {
      let row = Math.floor(i / 4) + 1;
      let column = i % 4 + 1;
      if (!ComplexityAchievements.hasComplexityAchievement(row, column)) {
        ComplexityAchievements.unlockComplexityAchievement(row, column);
      }
    }
  },
  areAllUpgradesCapped() {
    return this.upgradeList.every(x => x.atBoughtLimit());
  }
}
