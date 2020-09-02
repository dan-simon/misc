let EternityGenerator = function (i) {
  if ('EternityGenerators' in window) {
    return EternityGenerators.get(i);
  }
  return {
    tier() {
      return i;
    },
    amount() {
      return player.eternityGenerators[i - 1].amount;
    },
    bought() {
      return player.eternityGenerators[i - 1].bought;
    },
    addAmount(x) {
      player.eternityGenerators[i - 1].amount = player.eternityGenerators[i - 1].amount.plus(x);
    },
    resetAmount(x) {
      player.eternityGenerators[i - 1].amount = new Decimal(player.eternityGenerators[i - 1].bought);
    },
    addBought(n) {
      player.eternityGenerators[i - 1].bought += n;
      if (i === 8) {
        ComplexityChallenge.exitComplexityChallenge(5);
      }
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
      if (EternityChallenge.isEternityChallengeRunning(8)) {
        return new Decimal(0);
      }
      let perPurchaseMultiplier = Math.pow(2, EternityUpgrade(1).effect() / 8) *
        (i === 8 ? ComplexityChallenge.getComplexityChallengeReward(5) : 1);
      let factors = [
        Decimal.pow(perPurchaseMultiplier, this.bought()), Eternities.eternityGeneratorMultiplier(),
        Study(9).effect(), Study(10).effect(), Study(11).effect(), Study(12).effect(),  Study(15).effect(),
        EternityUpgrade(3).effect(), EternityProducer.multiplier(), EternityChallenge.getEternityChallengeReward(8),
        (i === 8) ? Chroma.effectOfColor(4) : 1, FinalityStars.multiplier(),
      ];
      // Most of these are numbers but that's fine, the first one is a Decimal
      // so the code works.
      let multiplier = factors.reduce((a, b) => a.times(b));
      let powFactors = [Powers.getTotalEffect('eternity'), FinalityShardUpgrade(1).effect()];
      return multiplier.safePow(powFactors.reduce((a, b) => a * b));
    },
    productionPerSecond() {
      return this.amount().times(this.multiplier());
    },
    produce(diff) {
      let production = this.productionPerSecond().times(diff);
      if (i === 1) {
        EternityStars.addAmount(production);
      } else {
        EternityGenerator(i - 1).addAmount(production);
      }
    },
    perSecond() {
      return (i < 8) ? EternityGenerator(i + 1).productionPerSecond() : new Decimal(0);
    },
    isVisible() {
      return i <= player.highestEternityGenerator + 1;
    },
    canBuy(n) {
      if (n === undefined) {
        n = 1;
      }
      return n <= this.maxBuyable();
    },
    maxBuyable() {
      if (!this.isVisible() || (i == 8 && ComplexityChallenge.isSafeguardOn(5))) return 0;
      let num = Math.floor(player.eternityPoints.div(this.cost()).times(
        Decimal.minus(this.costIncreasePer(), 1)).plus(1).log(this.costIncreasePer()));
      num = Math.max(num, 0);
      return num;
    },
    buy(n, guaranteedBuyable) {
      if (n === undefined) {
        n = 1;
      }
      if (n === 0 || (!guaranteedBuyable && !this.canBuy(n))) return;
      player.eternityPoints = player.eternityPoints.safeMinus(this.costFor(n));
      this.addAmount(n);
      this.addBought(n);
      if (player.highestEternityGenerator < i) {
        player.highestEternityGenerator = i;
      }
    },
    buyMax() {
      this.buy(this.maxBuyable(), true);
    }
  }
}

let EternityGenerators = {
  list: [...Array(8)].map((_, i) => EternityGenerator(i + 1)),
  get: function (x) {
    return this.list[x - 1];
  },
  highest () {
    return EternityGenerators.list[player.highestEternityGenerator] || null;
  }
}
