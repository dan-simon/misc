let Upgrades = {
  amount(level, type) {
    return player.upgrades[level][type];
  },
  baseCost(level, adj) {
    let adjZone = 4 * (this.amount(level, 0) - (adj ? 1 : 0)) + level + 1;
    return zoneToCost(adjZone);
  },
  cost(level, type) {
    if (type === 0) {
      return this.baseCost(level, false);
    } else if (type === 1) {
      return logMult(this.baseCost(level, true), scale(this.amount(level, type), this.costScale(level)));
    } else if (type === 2) {
      return logMult(logMult(new Decimal(64), scale(level, 2)), scale(Math.pow(this.amount(level, type), 2), 4));
    }
  },
  costScale(level) {
    return 1 + this.amount(level, 2);
  },
  resourceName(type) {
    return (type === 2) ? 'stone' : 'metal';
  },
  resource(type) {
    return (type === 2) ? Stone : Metal;
  },
  isAffordable(level, type) {
    return this.resource(type).amount().gte(this.cost(level, type));
  },
  isUnlocked(level, type) {
    return (type === 0) ? (Zone.worldZone() > 4 * this.amount(level, 0) + level && (!Challenge.isRunning(1) || this.amount(level, 0) === 0)) : (this.amount(level, 0) > 0)
  },
  canBuy(level, type) {
    return this.isAffordable(level, type) && this.isUnlocked(level, type);
  },
  buy(level, type) {
    if (!this.canBuy(level, type)) {
      return false;
    }
    this.resource(type).subtract(this.cost(level, type));
    player.upgrades[level][type]++;
    if (type === 0) {
      player.upgrades[level][1] = 1;
    }
  },
  buyMax(level, type) {
    while (this.canBuy(level, type)) {
      this.buy(level, type);
    }
  },
  unprestige(level) {
    if (player.upgrades[level][0] > 1) {
      player.upgrades[level][0]--;
    }
  },
  scalingStart() {
    return Challenge.isRunning(0) ? 4 : (16 + Perks.amount(4));
  },
  rescale(x) {
    let s = this.scalingStart();
    return 2 * s - 2 * s * Math.pow(0.5, Math.floor(x / s)) * (1 - (x % s) / (2 * s));
  },
  attack(level) {
    return Math.floor(this.rescale(this.amount(level, 1)) * (4 * (this.amount(level, 0) - 1) + level + 1));
  },
  totalAttack() {
    return [0, 1, 2, 3].map(i => this.attack(i)).reduce((a, b) => a + b) +
      Map.explorationAttack() + 4 * Perks.amount(0) + AetherUpgrade.attack();
  }
}

let AetherUpgrade = {
  amount() {
    return player.aetherUpgrades;
  },
  cost() {
    return Decimal.pow(2, this.amount() + 8);
  },
  attack() {
    return player.aetherAttack;
  },
  canBuy() {
    return this.resource().amount().gte(this.cost());
  },
  buy() {
    if (!this.canBuy()) {
      return false;
    }
    this.resource().subtract(this.cost());
    player.aetherUpgrades++;
    player.aetherAttack += Zone.worldZone();
  },
  resourceName() {
    return 'aether';
  },
  resource() {
    return Aether;
  }
}
