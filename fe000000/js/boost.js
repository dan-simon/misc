let Boost = {
  bought() {
    return player.boost.bought;
  },
  highestBought() {
    return player.highestBoostsBought;
  },
  highestBoughtThisEternity() {
    return player.highestBoostsBoughtThisEternity;
  },
  addBought(n) {
    player.boost.bought += n;
    player.highestBoostsBought = Math.max(player.highestBoostsBought, player.boost.bought);
    player.highestBoostsBoughtThisEternity = Math.max(player.highestBoostsBoughtThisEternity, player.boost.bought);
    ComplexityChallenge.exitComplexityChallenge(2);
  },
  costForOne(n) {
    return Decimal.pow(2, this.costSlowdown() * Math.pow(this.costSkip() * (this.bought() + this.costStart() + n - 1), this.costPower()));
  },
  cost() {
    return this.costForOne(1);
  },
  costFor(n) {
    // Scaling gets good enough that it becomes impractical to consider
    let m = n;
    let totalCost = new Decimal(0);
    while (m > 0) {
      let newTotalCost = totalCost.plus(this.costForOne(m));
      if (totalCost.eq(newTotalCost)) {
        break;
      }
      totalCost = newTotalCost;
      m--;
    }
    return totalCost;
  },
  areBoostsDisabled() {
    return [8, 9, 10].indexOf(Challenge.currentChallenge()) !== -1;
  },
  multiplierPer() {
    if (this.areBoostsDisabled()) {
      return 1;
    }
    let mult = InfinityUpgrade(1).effect();
    if (InfinityChallenge.isInfinityChallengeCompleted(7)) {
      mult += 2;
    }
    mult *= Study(1).effect() * EternityUpgrade(2).effect() * Chroma.effectOfColor(1) *
      ComplexityAchievements.effect(2, 1) * this.boostPowerEffect();
    if (InfinityChallenge.isInfinityChallengeRunning(7)) {
      mult = Math.pow(mult, 2);
    }
    return mult;
  },
  multiplier() {
    return Decimal.pow(this.multiplierPer(), this.bought());
  },
  isVisible() {
    return !this.areBoostsDisabled();
  },
  canBuy(n) {
    if (n === undefined) {
      n = 1;
    }
    return n <= this.maxBuyable();
  },
  costSlowdown() {
    return EternityChallenge.getEternityChallengeReward(2) * ComplexityChallenge.getComplexityChallengeReward(2);
  },
  costPower() {
    return EternityChallenge.isEternityChallengeRunning(2) ? 3 : 2;
  },
  costStart() {
    return EternityChallenge.isEternityChallengeRunning(2) ? 2 : 4;
  },
  costSkip() {
    return EternityChallenge.isEternityChallengeRunning(2) ? 1 : 2;
  },
  isNotBuyableAtAll() {
    // This function is a bit misleadingly named. It checks if there's some condition making boosts completely unbuyable
    // independent of how many stars you have.
    return !this.isVisible() || Stars.atLimit() || !Generators.anyGenerators() || ComplexityChallenge.isSafeguardOn(2);
  },
  maxBuyable() {
    if (this.isNotBuyableAtAll()) return 0;
    let num = Math.floor(Math.pow(player.stars.max(1).log(2) / this.costSlowdown(), 1 / this.costPower()) / this.costSkip() - this.costStart() + 1) - this.bought();
    if (player.stars.lt(this.costFor(num))) {
      num -= 1;
    }
    num = Math.min(num, Challenge.isChallengeEffectActive(7) ? Challenge.challenge7PurchasesLeft() : Infinity,
      InfinityChallenge.isInfinityChallengeRunning(8) ? InfinityChallenge.infinityChallenge8PurchasesLeft() : Infinity);
    num = Math.max(num, 0);
    return num;
  },
  buy(n, guaranteedBuyable) {
    if (n === undefined) {
      n = 1;
    }
    if (n === 0 || (!guaranteedBuyable && !this.canBuy(n))) return;
    player.stars = player.stars.safeMinus(this.costFor(n));
    this.addBought(n);
    Stats.recordPurchase(0, n);
  },
  buyMax() {
    this.buy(this.maxBuyable(), true);
  },
  boostPower() {
    return player.boostPower;
  },
  boostPowerEffect() {
    return 1 + Math.log2(this.boostPower())
  },
  isBoostPowerVisible() {
    return this.boostPower() > 1;
  },
  boostPowerPerSecond() {
    return this.boostPowerPerBoost() * Math.max(0, this.highestBoughtThisEternity() - this.boostPowerStart());
  },
  boostPowerPerBoost() {
    return EternityChallenge.getTotalCompletionsRewardEffect(1) * ComplexityAchievements.effect(1, 1) / 16384;
  },
  boostPowerStart() {
    return 320;
  },
  produceBoostPower(diff) {
    player.boostPower += this.boostPowerPerSecond() * diff;
    player.bestBoostPower = Math.max(player.boostPower, player.bestBoostPower);
  },
  bestBoostPower() {
    return player.bestBoostPower;
  },
  isBestBoostPowerVisible() {
    return this.bestBoostPower() > 1;
  },
  bestBoostPowerDescription() {
    if (ComplexityAchievements.hasComplexityAchievement(4, 4)) {
      return 'best boost power this finality';
    } else {
      return 'best boost power this complexity';
    }
  },
  extraTheoremsRaw() {
    return Studies.theoremsFrom(Math.log2(this.bestBoostPower()), 3);
  },
  extraTheoremsIndex() {
    return 0;
  },
  extraTheoremsActualAndDisplay() {
    if (ComplexityAchievements.hasComplexityAchievement(4, 4)) {
      return player.extraTheorems[this.extraTheoremsIndex()];
    } else {
      return this.extraTheoremsRaw();
    }
  },
  nextExtraTheorem() {
    return Math.pow(2, Studies.costPow(this.extraTheoremsActualAndDisplay(), 3));
  }
};
