let InfinityGenerator = function (i) {
  if ('InfinityGenerators' in window) {
    return InfinityGenerators.get(i);
  }
  return {
    amount() {
      return player.infinityGenerators[i - 1].amount;
    },
    bought() {
      return player.infinityGenerators[i - 1].bought;
    },
    addAmount(x) {
      player.infinityGenerators[i - 1].amount = player.infinityGenerators[i - 1].amount.plus(x);
    },
    resetAmount(x) {
      player.infinityGenerators[i - 1].amount = new Decimal(player.infinityGenerators[i - 1].bought);
    },
    incrementBought() {
      player.infinityGenerators[i - 1].bought++;
    },
    cost() {
      return Decimal.pow(2, i * (i + this.bought()));
    },
    multiplier() {
      if (Challenge.isChallengeRunning(12)) {
        return new Decimal(0);
      }
      return Decimal.pow(2, this.bought() / 8).times(Infinities.infinityGeneratorMultiplier());
    },
    productionPerSecond() {
      return this.amount().times(this.multiplier());
    },
    produce(diff) {
      let production = this.productionPerSecond().times(diff);
      if (i === 1) {
        InfinityStars.addAmount(production);
      } else {
        InfinityGenerator(i - 1).addAmount(production);
      }
    },
    perSecond() {
      return (i < 8) ? InfinityGenerator(i + 1).productionPerSecond() : new Decimal(0);
    },
    isVisible() {
      return i <= player.highestInfinityGenerator + 1;
    },
    canBuy() {
      return this.isVisible() && this.cost().lte(player.infinityPoints);
    },
    buy() {
      if (!this.canBuy()) return
      player.infinityPoints = player.infinityPoints.minus(this.cost());
      this.addAmount(1);
      this.incrementBought();
      if (player.highestInfinityGenerator < i) {
        player.highestInfinityGenerator = i;
      }
    },
    buyMax() {
      while (this.canBuy()) {this.buy()};
    }
  }
}

let InfinityGenerators = {
  list: [...Array(8)].map((_, i) => InfinityGenerator(i + 1)),
  get: function (x) {
    return this.list[x - 1]
  },
  highest () {
    return InfinityGenerators.list[player.highestInfinityGenerator] || null;
  }
}
