let EternityUpgrade = function (i) {
  if ('EternityUpgrade' in window) {
    return EternityUpgrade.get(i);
  }
  return {
    bought() {
      return player.eternityUpgrades[i - 1];
    },
    addBought(n) {
      player.eternityUpgrades[i - 1] += n;
    },
    boughtLimit() {
      return [7, Infinity][i - 1];
    },
    costIncreasePer() {
      return [16, 4096][i - 1];
    },
    effectIncreasePer() {
      return [1, 0.5][i - 1];
    },
    initialEffect() {
      return [1, 1][i - 1];
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
    maxBuyable(n) {
      let num = Math.floor(player.eternityPoints.div(this.cost()).times(
        Decimal.minus(this.costIncreasePer(), 1)).plus(1).log(this.costIncreasePer()));
      num = Math.min(num, this.boughtLimit() - this.bought());
      num = Math.max(num, 0);
      return num;
    },
    buy(n, guaranteedBuyable) {
      if (n === undefined) {
        n = 1;
      }
      if (n === 0 || (!guaranteedBuyable && !this.canBuy(n))) return;
      player.eternityPoints = player.eternityPoints.minus(this.costFor(n));
      this.addBought(n);
    },
    buyMax() {
      this.buy(this.maxBuyable(), true);
    }
  }
}

let EternityUpgrades = {
  list: [1, 2].map((x) => EternityUpgrade(x)),
  get: function (x) {
    return this.list[x - 1];
  },
}
