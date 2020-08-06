let FinalityStars = {
  amount() {
    return player.finalityStars;
  },
  addAmount(x) {
    player.finalityStars = player.finalityStars.plus(x);
  },
  perSecond() {
    return FinalityGenerator(1).productionPerSecond();
  },
  multiplier() {
    return Decimal.pow(2, Math.pow(this.amount().log2(), 1.5));
  }
}
