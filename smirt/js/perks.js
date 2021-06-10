let Perks = {
  amount(x) {
    return player.perks[x];
  },
  count() {
    return 6;
  },
  totalCost() {
    return [...Array(this.count())].map((_, i) => this.costToCurrent(i)).reduce((a, b) => a + b, 0);
  },
  costToCurrent(x) {
    return logMult(new Decimal(this.baseCost(x)), new Decimal([...Array(this.amount(x))].map(
      (_, i) => this.perkCostMult(i)).reduce((a, b) => a + b, 0))).toNumber();
  },
  cost(x) {
    return logMult(new Decimal(this.baseCost(x)), new Decimal(this.perkCostMult(this.amount(x)))).toNumber();
  },
  resourceName() {
    return 'gold';
  },
  perkCostMult(x) {
    return scale(x, 4).toNumber();
  },
  baseCost(x) {
    return [1, 1, 1, 1, 64, 1024][x];
  },
  isUnlocked(x) {
    return x < 4 || ([4, 5].includes(x) && Challenge.isCompleted(x - 4));
  },
  canBuy(x) {
    return Gold.amount() >= this.cost(x) && this.isUnlocked(x);
  },
  buy(x) {
    if (!this.canBuy(x)) {
      return false;
    }
    player.perks[x]++;
  },
  respec() {
    if (!confirm('Are you sure you want to respec perks?')) {
      return false;
    }
    if (Gold.canPortal()) {
      Gold.portal();
    } else {
      Gold.portalReset();
    }
    for (let i = 0; i < this.count(); i++) {
      player.perks[i] = 0;
    }
  }
}
