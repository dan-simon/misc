let FinalityGenerator = function (i) {
  if (defined.finalityGenerators) {
    return FinalityGenerators.get(i);
  }
  return {
    tier() {
      return i;
    },
    amount() {
      return player.finalityGenerators[i - 1].amount;
    },
    bought() {
      return player.finalityGenerators[i - 1].bought;
    },
    addAmount(x) {
      player.finalityGenerators[i - 1].amount = player.finalityGenerators[i - 1].amount.plus(x);
    },
    resetAmount(x) {
      player.finalityGenerators[i - 1].amount = new Decimal(player.finalityGenerators[i - 1].bought);
    },
    addBought(n) {
      player.finalityGenerators[i - 1].bought += n;
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
    perPurchaseMultiplier() {
      return Finalities.finalityGeneratorPerPurchaseMultiplier();
    },
    multiplier() {
      return Decimal.pow(this.perPurchaseMultiplier(), this.bought()).times(
        Achievements.generatorMultiplier()).times(Finalities.finalityGeneratorMultiplier());
    },
    productionPerSecond() {
      return this.amount().times(this.multiplier());
    },
    produce(diff) {
      let production = this.productionPerSecond().times(diff);
      if (i === 1) {
        FinalityStars.addAmount(production);
      } else {
        FinalityGenerator(i - 1).addAmount(production);
      }
    },
    perSecond() {
      return (i < 8) ? FinalityGenerator(i + 1).productionPerSecond() : new Decimal(0);
    },
    isVisible() {
      return i <= player.highestFinalityGenerator + 1 || Options.actualViewAllGenerators('finality');
    },
    canBuy(n) {
      if (n === undefined) {
        n = 1;
      }
      return n <= this.maxBuyable();
    },
    newAutobuyerStart: Math.pow(i, 2),
    newAutobuyerScale: i,
    newAutobuyerCapLoc: Infinity,
    isGenerallyBuyable() {
      return i <= player.highestFinalityGenerator + 1;
    },
    maxBuyable(fraction) {
      if (!this.isGenerallyBuyable()) return 0;
      if (fraction === undefined) {
        fraction = 1;
      }
      let num = Math.floor(player.finalityPoints.times(fraction).div(this.cost()).times(
        Decimal.minus(this.costIncreasePer(), 1)).plus(1).log(this.costIncreasePer()));
      num = Math.max(num, 0);
      return num;
    },
    buy(n, guaranteedBuyable, free) {
      if (n === undefined) {
        n = 1;
      }
      if (n === 0 || (!guaranteedBuyable && !this.canBuy(n))) return;
      if (!free) {
        player.finalityPoints = player.finalityPoints.safeMinus(this.costFor(n));
      }
      this.addAmount(n);
      this.addBought(n);
      if (player.highestFinalityGenerator < i) {
        player.highestFinalityGenerator = i;
      }
    },
    buyMax(fraction) {
      this.buy(this.maxBuyable(fraction), true);
    }
  }
}

let FinalityGenerators = {
  list: [...Array(8)].map((_, i) => FinalityGenerator(i + 1)),
  get: function (x) {
    return this.list[x - 1];
  },
  highest () {
    return FinalityGenerators.list[player.highestFinalityGenerator] || null;
  }
}

defined.finalityGenerators = true;
