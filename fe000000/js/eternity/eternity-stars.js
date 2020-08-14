let EternityStars = {
  amount() {
    return player.eternityStars;
  },
  addAmount(x) {
    player.eternityStars = player.eternityStars.plus(x);
    player.stats.totalEternityStarsProducedThisFinality = player.stats.totalEternityStarsProducedThisFinality.plus(x);
  },
  perSecond() {
    return EternityGenerator(1).productionPerSecond();
  },
  doEternityStarsDoAnything() {
    return player.eternities.gt(0) || EternityGenerator(1).bought() > 0;
  },
  multiplier() {
    // Only give a boost if the player has at least one eternity
    // (otherwise they don't even see this mechanic).
    return this.doEternityStarsDoAnything() ? this.amount() : new Decimal(1);
  },
  power() {
    return this.doEternityStarsDoAnything() ? 1 + Math.log2(this.amount().log(2)) / 512 : 1;
  }
}
