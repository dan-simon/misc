let MultiverseCollapse = {
  hasHappened() {
    return player.stars.gte(Decimal.pow(2, Math.pow(2, 48)));
  }
}
