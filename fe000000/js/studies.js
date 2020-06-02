let STUDY_EFFECTS = [
  () => 2,
  () => Decimal.pow(4, Math.pow(Prestige.prestigePower().log2(), 0.5)),
  () => Decimal.pow(2, Math.pow(player.stats.totalStarsProduced.log2(), 0.5) / 2),
  () => Decimal.pow(2, 16 * Studies.totalTheorems()),
  () => Decimal.pow(2, Math.pow(Boost.bought(), 1.75) / 1024),
  () => Decimal.pow(2, Math.pow(4 * Prestige.prestigePower().log2(), 0.875) / 1024),
  // We can use Math.pow() because it's small, this simplifies an isCapped() check later.
  () => Math.pow(2, Math.pow(Math.min(16, Math.max(0, Math.log2(Eternities.amount()))), 2) / 4),
  () => Decimal.pow(2, Math.pow(Studies.totalTheorems(), 2) / 16),
  () => Math.pow(Boost.multiplierPer(), InfinityChallenge.isInfinityChallengeRunning(7) ? 0.5 : 1),
  () => Math.pow(Math.max(1, Math.log2(Prestige.prestigePower().log2())), 3),
  () => Math.pow(2, Math.min(16, Math.pow(Math.log2(
    1 + player.stats.timeSinceEternity * (1 + EternityStars.amount().max(1).log2() / 1024) / 64), 4 / 3))),
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
      if (this.row() === 3) {
        return Math.pow(STUDY_EFFECTS[i - 1](), PermanenceUpgrade(3).effect());
      } else {
        return STUDY_EFFECTS[i - 1]();
      }
    },
    rawTotalEffect() {
      // This only exists for display of the Study 1 effect.
      return (i === 1) ? Decimal.pow(this.rawEffect(), Boost.bought()) : this.rawEffect();
    },
    effect() {
      // Most but not all studies have Decimal effect, but
      // in one case (extra boost mult) the effect has to be
      // a number, and it never has to be a Decimal.
      // So we use 1 as the default value.
      return this.isBought() ? this.rawEffect() : 1;
    },
    isCapped() {
      // Note that this technique only works if the effect is a number and not a Decimal.
      // Note also that we use STUDY_EFFECTS[i - 1]() directly since the raw effect of study 11
      // is modified by an upgrade that boosts third-row studies.
      return (i === 7 || i === 11) &&
        STUDY_EFFECTS[i - 1]() === {7: Math.pow(2, 64), 11: Math.pow(2, 16)}[i];
    },
    cappedText() {
      return this.isCapped() ? 'Capped' : 'Currently';
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
    return player.boughtTheorems.reduce((a, b) => a + b) + Boost.extraTheorems() + Chroma.extraTheorems() + EternityChallenge.extraTheorems();
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
    player.unspentTheorems = this.totalTheorems() - EternityChallenge.getUnlockedEternityChallengeCost();
  },
  maybeRespec() {
    if (this.isRespecOn()) {
      this.respec();
    }
    player.respecStudies = false;
  },
  respecAndReset() {
    this.respec();
    EternityPrestigeLayer.eternityReset();
  },
  boughtThatAreNotOnRow(x) {
    return this.list.filter(y => y.isBought() && y.row() !== x).length;
  },
  costPow(n, type) {
    // Should only be called in getting the cost, otherwise
    // what it does probably isn't what you think it does.
    return Math.pow(n > 3 ? Math.pow(2, (n + 1) / 2) : n + 1, this.costExponent(type));
  },
  theoremsFrom(x, type) {
    // Only used for boost power.
    let y = Math.pow(x, 1 / this.costExponent(type));
    return Math.floor((y > 4 ? 2 * Math.log2(y) : y));
  },
  costExponent(type) {
    return Math.min(1, 0.875 + type / 16);
  },
  cost(x) {
    return Decimal.pow(2, Math.pow(256, 2 - x) * this.costPow(player.boughtTheorems[x], x)).floor();
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
