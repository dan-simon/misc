let Permanence = {
  getRequiredEternities() {
    return this.getEternitiesPerPermanence() + this.getLeftoverEternities();
  },
  getLeftoverEternities() {
    return 16;
  },
  getTotalPermanenceMultiplier() {
    return PermanenceUpgrade(4).effect() * Complexities.permanenceMultiplier();
  },
  getEternitiesPerPermanence() {
    return Math.pow(2, 24) / this.getTotalPermanenceMultiplier();
  },
  canGainPermanence() {
    return Eternities.amount().gte(this.getRequiredEternities());
  },
  permanenceGain() {
    return Eternities.amount().minus(this.getLeftoverEternities()).div(this.getEternitiesPerPermanence());
  },
  hasGainedPermanence() {
    return player.hasGainedPermanence;
  },
  gainPermanence() {
    if (!this.canGainPermanence()) return;
    player.hasGainedPermanence = true;
    this.add(this.permanenceGain());
    Eternities.setAmount(this.getLeftoverEternities());
  },
  amount() {
    return player.permanence;
  },
  add(x) {
    player.permanence = player.permanence.plus(x);
  },
  anythingToBuy() {
    return PermanenceUpgrades.list.some(x => x.canBuy());
  },
  maxAll() {
    // We name the upgrade list for convenience.
    let list = PermanenceUpgrades.list;
    // Buying short of max
    list.forEach(x => x.buyShortOfMax(3));
    while (list.some(x => x.canBuy())) {
      // We copy it so that sorting doesn't rearrange the list, which would be a subtle source of bugs
      // (lettign current costs influence future buy order even after costs change).
      // Note: This nonly buys in the expected order if sort is stable.
      [...list].sort((x, y) => x.bought() - y.bought())[0].buy();
    }
  }
}
