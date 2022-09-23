let InfinityUpgrade = function (i) {
  if (defined.infinityUpgrades) {
    return InfinityUpgrades.get(i);
  }
  return {
    bought() {
      return player.infinityUpgrades[i - 1];
    },
    addBought(n) {
      player.infinityUpgrades[i - 1] += n;
    },
    boughtLimit() {
      return [Infinity, 8][i - 1];
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
      return new Decimal(this.costIncreasePer());
    },
    cost() {
      return this.initialCost().times(Decimal.pow(this.costIncreasePer(), this.bought()));
    },
    costFor(n) {
      return this.cost().times(Decimal.pow(this.costIncreasePer(), n).minus(1)).div(Decimal.minus(this.costIncreasePer(), 1));
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
    canBuy(n) {
      if (n === undefined) {
        n = 1;
      }
      return n <= this.maxBuyable();
    },
    newAutobuyerStart: [3, 4][i - 1],
    newAutobuyerScale: [3, 4][i - 1],
    newAutobuyerCapLoc: [Infinity, 32][i - 1],
    isGenerallyBuyable() {
      return true;
    },
    maxBuyable(fraction) {
      if (!this.isGenerallyBuyable()) return 0;
      if (fraction === undefined) {
        fraction = 1;
      }
      let num = Math.floor(player.infinityPoints.times(fraction).div(this.cost()).times(
        Decimal.minus(this.costIncreasePer(), 1)).plus(1).log(this.costIncreasePer()));
      num = Math.min(num, this.boughtLimit() - this.bought());
      num = Math.max(num, 0);
      return num;
    },
    buy(n, guaranteedBuyable, free) {
      if (n === undefined) {
        n = 1;
      }
      if (n === 0 || (!guaranteedBuyable && !this.canBuy(n))) return;
      if (!free) {
        player.infinityPoints = player.infinityPoints.safeMinus(this.costFor(n));
      }
      this.addBought(n);
    },
    buyMax(fraction) {
      this.buy(this.maxBuyable(fraction), true);
    }
  }
}

let InfinityUpgrades = {
  list: [1, 2].map((x) => InfinityUpgrade(x)),
  get: function (x) {
    return this.list[x - 1];
  },
}

defined.infinityUpgrades = true;
