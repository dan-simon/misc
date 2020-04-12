let STUDY_EFFECTS = [
  () => 2,
  () => Decimal.pow(4, Math.pow(Prestige.prestigePower().log2(), 0.5)),
  () => Decimal.pow(2, Math.pow(player.stats.totalStarsProduced.log2(), 0.5) / 2),
  () => Decimal.pow(2, 16 * Studies.totalTheorems()),
  () => Decimal.pow(2, Math.pow(Boost.bought(), 1.75) / 1024),
  () => Decimal.pow(2, Math.pow(4 * Prestige.prestigePower().log2(), 0.875) / 1024),
  () => Decimal.pow(2, Math.pow(Math.min(16, Math.max(0, Math.log2(Eternities.amount()))), 2) / 4),
  () => Decimal.pow(2, Math.pow(Studies.totalTheorems(), 2) / 16),
  () => Boost.multiplierPer(),
  () => Math.pow(Math.max(1, Math.log2(Prestige.prestigePower().log2())), 3),
  () => Math.pow(2, Math.pow(Math.log2(1 + player.stats.timeSinceEternity / 64), 1.5)),
  () => Math.pow(Studies.totalTheorems(), 2),
]

let Study = function (i) {
  if ('Studies' in window) {
    return Studies.get(i);
  }
  return {
    isBought() {
      return player.studies[i - 1];
    },
    isBuyable() {
      return !this.isBought() && Studies.unspentTheorems() >= this.cost();
    },
    cost(x) {
      return 2 * (1 + this.row() + Studies.boughtThatAreNotOnRow(this.row()));
    },
    row() {
      return Math.floor((i + 3) / 4);
    },
    rawEffect() {
      return STUDY_EFFECTS[i - 1]();
    },
    effect() {
      // Most but not all studies have Decimal effect, but
      // in one case (extra boost mult) the effect has to be
      // a number, and it never has to be a Decimal.
      // So we use 1 as the default value.
      return this.isBought() ? this.rawEffect() : 1;
    },
    buy() {
      if (this.isBuyable()) {
        player.unspentTheorems -= this.cost();
        player.studies[i - 1] = true;
      }
    },
    className() {
      let infix = ['normal', 'infinity', 'time'][this.row() - 1];
      let suffix = this.isBought() ? 'bought' : (this.isBuyable() ? 'buyable' : 'unbuyable');
      return 'study' + infix + suffix;
    }
  }
}

let Studies = {
  list: [...Array(12)].map((_, i) => Study(i + 1)),
  get: function (x) {
    return this.list[x - 1];
  },
  totalTheorems() {
    return player.boughtTheorems.reduce((a, b) => a + b) + Boost.extraTheorems();
  },
  unspentTheorems() {
    return player.unspentTheorems;
  },
  isRespecOn() {
    return player.respecStudies;
  },
  toggleRespec() {
    player.respecStudies = !player.respecStudies;
  },
  respec() {
    for (let i = 0; i < 12; i++) {
      player.studies[i] = false;
    }
    player.unspentTheorems = this.totalTheorems();
  },
  maybeRespec() {
    if (this.isRespecOn()) {
      this.respec();
    }
    player.respecStudies = false;
  },
  boughtThatAreNotOnRow(x) {
    return this.list.filter(y => y.isBought() && y.row() !== x).length;
  },
  costPow(n) {
    // Should only be called in getting the cost, otherwise
    // what it does probably isn't what you think it does.
    return n > 3 ? Math.pow(2, (n + 1) / 2) : n + 1;
  },
  theoremsFrom(x) {
    // Only used for boost power.
    return Math.floor(x > 4 ? 2 * Math.log2(x) : x)
  },
  cost(x) {
    return Decimal.pow(2, Math.pow(256, 2 - x) * this.costPow(player.boughtTheorems[x])).floor();
  },
  canBuy(x) {
    return player[['stars', 'infinityPoints', 'eternityPoints'][x]].gte(this.cost(x)) && (x !== 2 || EternityGenerator(1).bought() > 0);
  },
  getStat(x) {
    return player[['stars', 'infinityPoints', 'eternityPoints'][x]];
  },
  setStat(x, y) {
    player[['stars', 'infinityPoints', 'eternityPoints'][x]] = y;
  },
  buy(x) {
    if (this.canBuy(x)) {
      this.setStat(x, this.getStat(x).minus(this.cost(x)));
      player.boughtTheorems[x] += 1;
      player.unspentTheorems += 1;
    }
  },
  buyMax(x) {
    while (this.canBuy(x)) {
      this.setStat(x, this.getStat(x).minus(this.cost(x)));
      player.boughtTheorems[x] += 1;
      player.unspentTheorems += 1;
    }
  }
}
