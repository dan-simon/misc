let FinalityShards = {
  total() {
    return player.totalFinalityShards;
  },
  spent() {
    // Write this later.
    return 0;
  },
  amount() {
    return this.total() - this.spent();
  },
  addAmount(x) {
    player.totalFinalityShards += x;
  },
  isRespecOn() {
    return player.respecFinalityShards;
  },
  toggleRespec() {
    player.respecFinalityShards = !player.respecFinalityShards;
  },
  respec() {
    // Write this later.
  },
  maybeRespec() {
    if (this.isRespecOn()) {
      this.respec();
    }
    player.respecFinalityShards = false;
  },
  initializeStartingComplexityAchievements() {
    let totalUpgradeBonuses = this.totalUpgradeBonuses();
    for (let row = 0; row < 4; row++) {
      for (let column = 0; column < 4; column++) {
        player.complexityAchievements[row][column] = 4 * row + column < totalUpgradeBonuses;
      }
    }
  },
  totalUpgradeBonuses() {
    return Math.floor(this.totalUpgrades() / 4);
  },
  totalUpgrades() {
    // Write this later.
    return 0;
  }
}
