let Permanence = {
  getRequiredEternities() {
    return this.getEternitiesPerPermanence() + this.getLeftoverEternities();
  },
  getLeftoverEternities() {
    return 16;
  },
  getEternitiesPerPermanence() {
    return Math.pow(2, 24) / PermanenceUpgrade(4).effect();
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
    PermanenceUpgrades.list.forEach(x => x.buyMax());
  }
}
