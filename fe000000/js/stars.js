let Stars = {
  amount() {
    return player.stars;
  },
  addAmount(x) {
    player.stars = player.stars.plus(x);
  },
  perSecond() {
    return Generator(1).productionPerSecond();
  }
}
