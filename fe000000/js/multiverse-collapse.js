let MultiverseCollapse = {
  hasHappened() {
    return player.stars.gte(this.stars());
  },
  stars() {
    return Decimal.pow(2, Math.pow(2, 48));
  }
}
