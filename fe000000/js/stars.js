let Stars = {
  amount() {
    return player.stars;
  },
  addAmount(x) {
    x = x.min(MultiverseCollapse.stars().minus(this.amount())).max(0);
    player.stars = player.stars.plus(x);
    player.stats.totalStarsProduced = player.stats.totalStarsProduced.plus(x);
    player.stats.totalStarsProducedThisEternity = player.stats.totalStarsProducedThisEternity.plus(x);
    player.stats.totalStarsProducedThisComplexity = player.stats.totalStarsProducedThisComplexity.plus(x);
    player.stats.totalStarsProducedThisFinality = player.stats.totalStarsProducedThisFinality.plus(x);
  },
  perSecond() {
    return Generator(1).productionPerSecond();
  }
}
