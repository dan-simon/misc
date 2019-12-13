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
    addBought(n) {
      player.generators[i - 1].bought += n;
    },
    costIncreasePer() {
      let extraFactor = Challenge.isChallengeEffectActive(5) ? 2 : 1;
      return Decimal.pow(2, i * extraFactor);
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
      let factors = [
        Decimal.pow(2, this.bought() / 8), Boost.multiplier(), Prestige.multiplier(),
        InfinityPoints.multiplier(), InfinityStars.multiplier(), Challenge.multiplier(),
        (i === 8) ? Sacrifice.sacrificeMultiplier() : 1,
        Challenge.isChallengeEffectActive(2) ? Challenge.challenge2Mult() : 1,
        (i === 1 && Challenge.isChallengeEffectActive(3)) ? Challenge.challenge3Mult() : 1,
        Challenge.isChallengeRunning(8) ? Generator(8).amount().max(1) : 1
      ];
      let multiplier = factors.reduce((a, b) => a.times(b));
      let powFactors = [
        Challenge.isChallengeRunning(1) ? ((i === 1) ? 4 : 0) : 1,
        InfinityChallenge.isInfinityChallengeRunning(4) ? InfinityChallenge.infinityChallenge4Pow() : 1
      ];
      return multiplier.pow(powFactors.reduce((a, b) => a * b));
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
      return i <= player.highestGenerator + 1 && ((!Challenge.isChallengeEffectActive(6)) || i <= 6);
    },
    canBuy(n) {
      if (n === undefined) {
        n = 1;
      }
      return n <= this.maxBuyable();
    },
    maxBuyable() {
      if (!this.isVisible() || InfinityPrestigeLayer.mustInfinity()) return 0;
      let num = Math.floor(player.stars.div(this.cost()).times(
        Decimal.minus(this.costIncreasePer(), 1)).plus(1).log(this.costIncreasePer()));
      num = Math.min(num,
        Challenge.isChallengeRunning(10) ? 1 - this.bought() : Infinity,
        Challenge.isChallengeEffectActive(7) ? Challenge.challenge7PurchasesLeft() : Infinity);
      num = Math.max(num, 0);
      return num;
    },
    buy(n, guaranteedBuyable) {
      if (n === undefined) {
        n = 1;
      }
      if (n === 0 || (!guaranteedBuyable && !this.canBuy(n))) return;
      player.stars = player.stars.minus(this.costFor(n));
      this.addAmount(n);
      this.addBought(n);
      if (player.highestGenerator < i) {
        player.highestGenerator = i;
      }
      if (Challenge.isChallengeEffectActive(4)) {
        Generators.resetAmounts(i - 1);
      }
      Stats.recordPurchase(n);
    },
    buyMax() {
      this.buy(this.maxBuyable(), true);
    }
  }
}

let Generators = {
  list: [...Array(8)].map((_, i) => Generator(i + 1)),
  get: function (x) {
    return this.list[x - 1];
  },
  highest () {
    return Generators.list[player.highestGenerator] || null;
  },
  resetAmounts(i) {
    Generators.list.slice(0, i).forEach(g => g.resetAmount());
  }
}
