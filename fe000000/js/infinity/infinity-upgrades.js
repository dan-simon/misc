let InfinityUpgrade = function (i) {
  if ('InfinityUpgrade' in window) {
    return InfinityUpgrade.get(i);
  }
  return {
    bought() {
      return player.infinityUpgrades[i - 1];
    },
    incrementBought() {
      player.infinityUpgrades[i - 1]++;
    },
    boughtLimit() {
      return [Infinity, 12][i - 1];
    },
    costIncreasePer() {
      return [8, 16][i - 1];
    },
    effectIncreasePer() {
      return [0.25, 0.125][i - 1];
    },
    initialEffect() {
      return [2, 0.5][i - 1];
    },
    initialCost() {
      return this.costIncreasePer();
    },
    cost() {
      return this.initialCost().times(Decimal.pow(this.costIncreasePer(), this.bought()));
    },
    effect() {
      return this.initialEffect() + this.effectIncreasePer() * this.bought();
    },
    nextEffect() {
      return this.initialEffect() + this.effectIncreasePer() * (this.bought() + 1);
    },
    atBoughtLimit() {
      return this.bought() >= this.boughtLimit();
    },
    canBuy() {
      return this.cost().lte(player.infinityPoints) && !this.atBoughtLimit();
    },
    buy() {
      if (!this.canBuy()) return
      player.infinityPoints = player.infinityPoints.minus(this.cost());
      this.incrementBought();
    },
    buyMax() {
      while (this.canBuy()) {this.buy()};
    }
  }
}

let InfinityUpgrades = {
  list: [1, 2].map((x) => InfinityUpgrade(x)),
  get: function (x) {
    return this.list[x - 1]
  },
}
