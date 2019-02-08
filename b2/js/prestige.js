function prestige (i) {
  if (player.generators[i].prestigeAmount.lt(prestigeThreshold)) {
    return false;
  }
  if (player.generators.length === i + 1) {
    initializeTier();
  }
  player.generators[i + 1].prestigeAmount = player.generators[i + 1].prestigeAmount.plus(
    getPrestigeGain(player.generators[i].prestigeAmount));
  for (let k = 0; k <= i; k++) {
    resetTier(k);
  }
  partialResetTier(i + 1);
  player.incrementali.currencyAmount = 1;
  player.incrementali.galaxies = 0;
  player.incrementali.nextGalaxy = 100;
}
