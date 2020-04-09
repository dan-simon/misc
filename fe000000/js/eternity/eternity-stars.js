let EternityStars = {
  amount() {
    return player.eternityStars;
  },
  addAmount(x) {
    player.eternityStars = player.eternityStars.plus(x);
  },
  perSecond() {
    return EternityGenerator(1).productionPerSecond();
  },
  multiplier() {
    // Only give a boost if the player has at least one eternity
    // (otherwise they don't even see this mechanic).
    return (player.eternities > 0) ? this.amount() : new Decimal(1);
  },
  power() {
    return 1 + Math.log2(this.amount().log(2)) / 512;
  }
}
