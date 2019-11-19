let Stars = {
  amount() {
    return player.stars;
  },
  addAmount(x) {
    player.stars = player.stars.plus(x);
    player.stats.totalStarsProduced = player.stats.totalStarsProduced.plus(x);
  },
  perSecond() {
    return Generator(1).productionPerSecond();
  }
}
