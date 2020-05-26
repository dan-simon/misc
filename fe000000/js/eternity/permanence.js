let Permanence = {
  getRequiredEternities() {
    return this.getLeftoverEternities() + this.getEternitiesPerPermanence();
  },
  getLeftoverEternities() {
    return 16;
  },
  getEternitiesPerPermanence() {
    return Math.pow(2, 24) / PermanenceUpgrade(4).effect();
  },
  canGainPermanence() {
    return Eternities.amount() >= this.getRequiredEternities();
  },
  permanenceGain() {
    return (Eternities.amount() - this.getLeftoverEternities()) / this.getEternitiesPerPermanence();
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
    player.permanence += x;
  },
  anythingToBuy() {
    return PermanenceUpgrades.list.some(x => x.canBuy());
  },
  maxAll() {
    PermanenceUpgrades.list.forEach(x => x.buyMax());
  }
}
