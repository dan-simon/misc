let ComplexityGenerator = function (i) {
  if ('ComplexityGenerators' in window) {
    return ComplexityGenerators.get(i);
  }
  return {
    tier() {
      return i;
    },
    amount() {
      return player.complexityGenerators[i - 1].amount;
    },
    bought() {
      return player.complexityGenerators[i - 1].bought;
    },
    addAmount(x) {
      player.complexityGenerators[i - 1].amount = player.complexityGenerators[i - 1].amount.plus(x);
    },
    resetAmount(x) {
      player.complexityGenerators[i - 1].amount = new Decimal(player.complexityGenerators[i - 1].bought);
    },
    addBought(n) {
      player.complexityGenerators[i - 1].bought += n;
    },
    costIncreasePer() {
      return Decimal.pow(2, i);
    },
    initialCost() {
      return Decimal.pow(2, Math.pow(i, 2));
    },
    cost() {
      return this.initialCost().times(Decimal.pow(this.costIncreasePer(), this.bought()));
    },
    costFor(n) {
      return this.cost().times(Decimal.pow(this.costIncreasePer(), n).minus(1)).div(Decimal.minus(this.costIncreasePer(), 1));
    },
    multiplier() {
      let perPurchaseMultiplier = ComplexityAchievements.effect(4, 1);
      let factors = [
        Decimal.pow(perPurchaseMultiplier, this.bought()), Complexities.complexityGeneratorMultiplier(),
        FinalityStars.multiplier(),
      ];
      let multiplier = factors.reduce((a, b) => a.times(b));
      let powFactors = [Powers.getTotalEffect('complexity'), FinalityShardUpgrade(1).effect()];
      return multiplier.safePow(powFactors.reduce((a, b) => a * b));
    },
    productionPerSecond() {
      return this.amount().times(this.multiplier());
    },
    produce(diff) {
      let production = this.productionPerSecond().times(diff);
      if (i === 1) {
        ComplexityStars.addAmount(production);
      } else {
        ComplexityGenerator(i - 1).addAmount(production);
      }
    },
    perSecond() {
      return (i < 8) ? ComplexityGenerator(i + 1).productionPerSecond() : new Decimal(0);
    },
    isVisible() {
      return i <= player.highestComplexityGenerator + 1;
    },
    canBuy(n) {
      if (n === undefined) {
        n = 1;
      }
      return n <= this.maxBuyable();
    },
    maxBuyable() {
      if (!this.isVisible()) return 0;
      let num = Math.floor(player.complexityPoints.div(this.cost()).times(
        Decimal.minus(this.costIncreasePer(), 1)).plus(1).log(this.costIncreasePer()));
      num = Math.max(num, 0);
      return num;
    },
    buy(n, guaranteedBuyable) {
      if (n === undefined) {
        n = 1;
      }
      if (n === 0 || (!guaranteedBuyable && !this.canBuy(n))) return;
      player.complexityPoints = player.complexityPoints.safeMinus(this.costFor(n));
      this.addAmount(n);
      this.addBought(n);
      if (player.highestComplexityGenerator < i) {
        player.highestComplexityGenerator = i;
      }
    },
    buyMax() {
      this.buy(this.maxBuyable(), true);
    }
  }
}

let ComplexityGenerators = {
  list: [...Array(8)].map((_, i) => ComplexityGenerator(i + 1)),
  get: function (x) {
    return this.list[x - 1];
  },
  highest () {
    return ComplexityGenerators.list[player.highestComplexityGenerator] || null;
  }
}
