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
  multiplierPer() {
    return InfinityUpgrade(1).effect();
  },
  multiplier() {
    return Decimal.pow(this.multiplierPer(), this.bought());
  },
  canBuy() {
    return this.cost().lte(player.stars) && !InfinityPrestigeLayer.mustInfinity();
  },
  buy() {
    if (!this.canBuy()) return
    player.stars = player.stars.minus(this.cost());
    this.incrementBought();
  },
  buyMax() {
    while (this.canBuy()) {this.buy()};
  }
};
