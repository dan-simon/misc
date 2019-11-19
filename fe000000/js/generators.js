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
    resetAmount() {
      player.generators[i - 1].amount = new Decimal(0);
    },
    incrementBought() {
      player.generators[i - 1].bought++;
    },
    cost() {
      let extraFactor = Challenge.isChallengeRunning(5) ? 2 : 1;
      return Decimal.pow(2, Math.pow(i, 2) + i * this.bought() * extraFactor);
    },
    multiplier() {
      let factors = [
        Decimal.pow(2, this.bought() / 8), Boost.multiplier(), Prestige.multiplier(),
        InfinityPoints.multiplier(), InfinityStars.multiplier(), Challenge.multiplier(),
        (i === 8) ? Sacrifice.sacrificeMultiplier() : 1
      ];
      let multiplier = factors.reduce((a, b) => a.times(b));
      let powFactors = [Challenge.isChallengeRunning(1) ? ((i === 1) ? 4 : 0) : 1];
      return multiplier.pow(powFactors.reduce((a, b) => a.times(b)));
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
      return i <= player.highestGenerator + 1 && ((!Challenge.isChallengeRnning(6)) || i <= 6);
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
      if (Challenge.isChallengeRunning(4)) {
        Generators.resetAmounts(i - 1);
      }
      Stats.recordPurchase();
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
  },
  resetAmounts(i) {
    Generators.list.slice(0, i).forEach(g => g.resetAmount());
  }
}
