let Generator = function (i) {
  if ('Generators' in window) {
    return Generators.get(i);
  }
  return {
    amount() {
      return player.generators[i - 1].amount;
    },
    bought() {
      return player.generators[i - 1].bought;
    },
    addAmount(x) {
      player.generators[i - 1].amount = player.generators[i - 1].amount.plus(x);
    },
    incrementBought() {
      player.generators[i - 1].bought++;
    },
    cost() {
      return Decimal.pow(2, i * (i + this.bought()));
    },
    multiplier() {
      let factors = [
        Decimal.pow(2, this.bought() / 8), Boost.multiplier(), Prestige.multiplier(),
        InfinityPoints.multiplier(), InfinityStars.multiplier()
      ];
      return factors.reduce((a, b) => a.times(b));
    },
    productionPerSecond() {
      return this.amount().times(this.multiplier());
    },
    produce(diff) {
      let production = this.productionPerSecond().times(diff);
      if (i === 1) {
        Stars.addAmount(production);
      } else {
        Generator(i - 1).addAmount(production);
      }
    },
    perSecond() {
      return (i < 8) ? Generator(i + 1).productionPerSecond() : new Decimal(0);
    },
    isVisible() {
      return i <= player.highestGenerator + 1;
    },
    canBuy() {
      return this.isVisible() && this.cost().lte(player.stars) && !InfinityPrestigeLayer.mustInfinity();
    },
    buy() {
      if (!this.canBuy()) return
      player.stars = player.stars.minus(this.cost());
      this.addAmount(1);
      this.incrementBought();
      if (player.highestGenerator < i) {
        player.highestGenerator = i;
      }
    },
    buyMax() {
      while (this.canBuy()) {this.buy()};
    }
  }
}

let Generators = {
  list: [...Array(8)].map((_, i) => Generator(i + 1)),
  get: function (x) {
    return this.list[x - 1]
  },
  highest () {
    return Generators.list[player.highestGenerator + 1] || null;
  }
}
