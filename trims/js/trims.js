let Trims = {
  amount() {
    return player.trims;
  },
  fraction() {
    return this.amount() / this.capacity();
  },
  displayAmount() {
    return Math.floor(this.amount());
  },
  atCapacity() {
    return this.amount() === this.capacity();
  },
  add(x) {
    player.trims = Math.min(player.trims + x, this.capacity());
  },
  subtract(x) {
    player.trims = Math.max(player.trims - x, 0);
  },
  breedingProduction() {
    return this.amount() >= 2 ? this.amount() / 100 : 0;
  },
  gatheringMultiplier() {
    return 1;
  },
  gatheringProduction() {
    return this.amount() * this.gatheringMultiplier();
  },
  breed(diff) {
    this.add(diff * this.breedingProduction());
  },
  gather(diff) {
    Stuff.add(diff * this.gatheringProduction());
  },
  capacity() {
    return 10 - Equip.totalSpaceOfType('housing') + Equip.totalResourceProvidedOfType('housing');
  },
  attackPer() {
    return 10 - Equip.totalSpaceOfType('weapon') + Equip.totalResourceProvidedOfType('weapon');
  },
  healthPer() {
    return 50 - 5 * Equip.totalSpaceOfType('armor') + Equip.totalResourceProvidedOfType('armor');;
  }
}
