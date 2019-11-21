let Boost = {
  bought() {
    return player.boost.bought;
  },
  addBought(n) {
    player.boost.bought = player.boost.bought + n;
  },
  costForOne(n) {
    return Decimal.pow(2, Math.pow(8 + 2 * (this.bought() + n - 1), 2));
  },
  cost() {
    return this.costForOne(1);
  },
  costFor(n) {
    // Everything but the last two are easily negligible and don't change the total cost up to precision.
    if (n === 0) {
      return new Decimal(0);
    } else if (n === 1) {
      return this.costForOne(1)
    } else {
      return this.costForOne(n).plus(this.costForOne(n - 1));
    }
  },
  areBoostsDisabled() {
    return [8, 9, 10].indexOf(Challenge.currentChallenge()) !== -1;
  },
  multiplierPer() {
    return this.areBoostsDisabled() ? 1 : InfinityUpgrade(1).effect();
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
  maxBuyable() {
    if (!this.isVisible() || InfinityPrestigeLayer.mustInfinity()) return 0;
    // The 6 rather than 8 handles an off-by-one issue.
    let num = Math.floor((Math.pow(player.stars.max(1).log(2), 0.5) - 6) / 2) - this.bought();
    if (player.stars.lt(this.costFor(num))) {
      num -= 1;
    }
    num = Math.min(num, Challenge.isChallengeRunning(7) ? Challenge.challenge7PurchasesLeft() : Infinity);
    num = Math.max(num, 0);
    return num;
  },
  buy(n, guaranteedBuyable) {
    if (n === undefined) {
      n = 1;
    }
    if (n === 0 || (!guaranteedBuyable && !this.canBuy(n))) return;
    player.stars = player.stars.minus(this.costFor(n));
    this.addBought(n);
    Stats.recordPurchase(n);
  },
  buyMax() {
    this.buy(this.maxBuyable(), true);
  }
};
