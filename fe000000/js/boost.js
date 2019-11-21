let Boost = {
  bought() {
    return player.boost.bought;
  },
  incrementBought() {
    player.boost.bought = player.boost.bought + 1;
  },
  cost() {
    return Decimal.pow(2, Math.pow(8 + 2 * this.bought(), 2));
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
  canBuy() {
    return this.isVisible() && this.cost().lte(player.stars) && !Challenge.allPurchasesUsed() &&
    !InfinityPrestigeLayer.mustInfinity();
  },
  buy() {
    if (!this.canBuy()) return
    player.stars = player.stars.minus(this.cost());
    this.incrementBought();
    Stats.recordPurchase();
  },
  buyMax() {
    while (this.canBuy()) {this.buy()};
  }
};
