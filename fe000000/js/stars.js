let Stars = {
  amount() {
    return player.stars;
  },
  startingAmount() {
    return EternityStartingBenefits.stars().plus(FinalityStartingBenefits.stars());
  },
  limit() {
    if (InfinityPrestigeLayer.isInfinityBroken()) {
      return MultiverseCollapse.stars();
    } else {
      return InfinityPrestigeLayer.starRequirementForInfinity();
    }
  },
  atLimit() {
    return this.amount().gte(this.limit());
  },
  collapsedText() {
    if (!this.atLimit()) return;
    if (InfinityPrestigeLayer.isInfinityBroken()) {
      return 'multiverse has';
    } else if (this.amount().gte(MultiverseCollapse.stars())) {
      return 'multiverse and universe have';
    } else {
      return 'universe has';
    }
  },
  setAmount(x) {
    player.stars = x.min(this.limit());
  },
  addAmount(x) {
    let oldStars = player.stars;
    player.stars = player.stars.plus(x).min(this.limit());
    let change = player.stars.minus(oldStars).max(0);
    // Update stats with stars (and change).
    player.stats.bestStarsThisSacrifice = player.stats.bestStarsThisSacrifice.max(player.stars);
    player.stats.bestStarsThisPrestige = player.stats.bestStarsThisPrestige.max(player.stars);
    player.stats.bestStarsThisInfinity = player.stats.bestStarsThisInfinity.max(player.stars);
    player.stats.totalStarsProduced = player.stats.totalStarsProduced.plus(change);
    player.stats.totalStarsProducedThisEternity = player.stats.totalStarsProducedThisEternity.plus(change);
    player.stats.totalStarsProducedThisComplexity = player.stats.totalStarsProducedThisComplexity.plus(change);
    player.stats.totalStarsProducedThisFinality = player.stats.totalStarsProducedThisFinality.plus(change);
  },
  perSecond() {
    return Generator(1).productionPerSecond();
  }
}
