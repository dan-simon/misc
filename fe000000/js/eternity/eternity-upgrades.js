let EternityUpgrade = function (i) {
  if ('EternityUpgrades' in window) {
    return EternityUpgrades.get(i);
  }
  return {
    bought() {
      return player.eternityUpgrades[i - 1];
    },
    addBought(n) {
      player.eternityUpgrades[i - 1] += n;
    },
    boughtLimit() {
      return [7, Infinity, Infinity][i - 1];
    },
    costIncreasePer() {
      return [16, 4096, Math.pow(2, 16)][i - 1];
    },
    effectIncreasePer() {
      return [1, 0.5, 1][i - 1];
    },
    initialEffect() {
      return [1, 1, 0][i - 1];
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
    processEffect(x) {
      if (i === 3) {
        // This formula is annoyingly complicated, but I think it might have to be.
        // The first upgrade is really good (roughly 16x), and the second is decent (roughly 4x),
        // but after that they start being junk fairly quickly.
        return Decimal.pow(Math.max(EternityPoints.totalEPProducedThisComplexity().log2(), 1), Math.pow(x, 0.5));
      } else {
        return x;
      }
    },
    effect() {
      return this.processEffect(this.initialEffect() + this.effectIncreasePer() * this.bought());
    },
    nextEffect() {
      return this.processEffect(this.initialEffect() + this.effectIncreasePer() * (this.bought() + 1));
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
    maxBuyable() {
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
      player.eternityPoints = player.eternityPoints.safeMinus(this.costFor(n));
      this.addBought(n);
    },
    buyMax() {
      this.buy(this.maxBuyable(), true);
    }
  }
}

let EternityUpgrades = {
  list: [1, 2, 3].map((x) => EternityUpgrade(x)),
  get: function (x) {
    return this.list[x - 1];
  },
}
