let InfinityGenerator = function (i) {
  if ('InfinityGenerators' in window) {
    return InfinityGenerators.get(i);
  }
  return {
    tier() {
      return i;
    },
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
    addBought(n) {
      player.infinityGenerators[i - 1].bought += n;
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
      if (Challenge.isChallengeRunning(12)) {
        return new Decimal(0);
      }
      let factors = [
        EternityChallenge.isEternityChallengeRunning(7) ? new Decimal(1) : Decimal.pow(2, this.bought() / 8),
        Infinities.infinityGeneratorMultiplier(), InfinityChallenge.multiplier(),
        (i === 1 && InfinityChallenge.isInfinityChallengeCompleted(3)) ? InfinityChallenge.infinityChallenge3Reward() : 1,
        InfinityChallenge.isInfinityChallengeCompleted(4) ? InfinityChallenge.infinityChallenge4Reward() : 1,
        (i === 8 && InfinityChallenge.isInfinityChallengeCompleted(8)) ? Math.max(1, Generator(8).amount().toNumber()) : 1,
        EternityStars.multiplier(), Study(5).effect(), Study(6).effect(), Study(7).effect(), Study(8).effect(), Study(14).effect(),
        EternityChallenge.getEternityChallengeReward(4), EternityChallenge.getEternityChallengeReward(7), FinalityStars.multiplier(),
      ];
      let multiplier = factors.reduce((a, b) => a.times(b));
      let powFactors = [
        (i === 5 && InfinityChallenge.isInfinityChallengeCompleted(5)) ? InfinityChallenge.infinityChallenge5Reward() : 1,
        EternityChallenge.isEternityChallengeRunning(1) ? EternityChallenge.eternityChallenge1EternityStarsEffect() : 1,
        EternityChallenge.isEternityChallengeRunning(5) ? 0.5 : 1, EternityChallenge.getEternityChallengeReward(5),
        EternityStars.power(), Powers.getTotalEffect('infinity'), FinalityShardUpgrade(1).effect(),
      ];
      return multiplier.safePow(powFactors.reduce((a, b) => a * b));
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
    canBuy(n) {
      if (n === undefined) {
        n = 1;
      }
      return n <= this.maxBuyable();
    },
    maxBuyable(n) {
      if (!this.isVisible()) return 0;
      let num = Math.floor(player.infinityPoints.div(this.cost()).times(
        Decimal.minus(this.costIncreasePer(), 1)).plus(1).log(this.costIncreasePer()));
      num = Math.max(num, 0);
      return num;
    },
    buy(n, guaranteedBuyable) {
      if (n === undefined) {
        n = 1;
      }
      if (n === 0 || (!guaranteedBuyable && !this.canBuy(n))) return;
      player.infinityPoints = player.infinityPoints.safeMinus(this.costFor(n));
      this.addAmount(n);
      this.addBought(n);
      if (player.highestInfinityGenerator < i) {
        player.highestInfinityGenerator = i;
      }
    },
    buyMax() {
      this.buy(this.maxBuyable(), true);
    }
  }
}

let InfinityGenerators = {
  list: [...Array(8)].map((_, i) => InfinityGenerator(i + 1)),
  get: function (x) {
    return this.list[x - 1];
  },
  highest() {
    return InfinityGenerators.list[player.highestInfinityGenerator] || null;
  }
}
