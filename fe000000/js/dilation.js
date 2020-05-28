let DilationUpgrade = function (i) {
  if ('Dilation' in window) {
    return Dilation.getUpgrade(i);
  }
  return {
    bought() {
      return player.dilation.upgrades[i - 1];
    },
    addBought(n) {
      player.dilation.upgrades[i - 1] += n;
    },
    boughtLimit() {
      return Infinity;
    },
    costIncreasePer() {
      return Math.pow(2, i + 2);
    },
    effectIncreasePer() {
      return [1, 1, 0.25][i - 1];
    },
    initialEffect() {
      return [0, 0, 1][i - 1];
    },
    initialCost() {
      return Decimal.pow(this.costIncreasePer(), 3);
    },
    cost() {
      return this.initialCost().times(Decimal.pow(this.costIncreasePer(), this.bought()));
    },
    costFor(n) {
      return this.cost().times(Decimal.pow(this.costIncreasePer(), n).minus(1)).div(Decimal.minus(this.costIncreasePer(), 1));
    },
    processEffect(x) {
      if (i < 3) {
        return Decimal.pow([2, 16][i - 1], x);
      } else {
        return x;
      }
    },
    effect() {
      return this.processEffect(this.initialEffect() + this.effectIncreasePer() * this.bought());
    },
    nextEffect() {
      return this.processEffect(this.initialEffect() + this.effectIncreasePer() * (this.bought() + 1));
    },
    atBoughtLimit() {
      return this.bought() >= this.boughtLimit();
    },
    canBuy(n) {
      if (n === undefined) {
        n = 1;
      }
      return n <= this.maxBuyable();
    },
    maxBuyable() {
      let num = Math.floor(player.dilatedTime.div(this.cost()).times(
        Decimal.minus(this.costIncreasePer(), 1)).plus(1).log(this.costIncreasePer()));
      num = Math.min(num, this.boughtLimit() - this.bought());
      num = Math.max(num, 0);
      return num;
    },
    buy(n, guaranteedBuyable) {
      if (n === undefined) {
        n = 1;
      }
      if (n === 0 || (!guaranteedBuyable && !this.canBuy(n))) return;
      player.dilatedTime = player.dilatedTime.minus(this.costFor(n));
      this.addBought(n);
    },
    buyMax() {
      this.buy(this.maxBuyable(), true);
    }
  }
}

let Dilation = {
  // Obviously needs a fix.
  upgradeList: [1, 2, 3].map((x) => null),
  getUpgrade: function (x) {
    return this.upgradeList[x - 1];
  },
  isUnlocked() {
    return player.dilation.unlocked;
  },
  unlockCost() {
    return Math.pow(2, 4096);
  },
  canUnlock() {
    return player.eternityPoints.gte(this.unlockCost());
  },
  unlock() {
    if (!this.canUnlock()) return;
    player.eternityPoints = player.eternityPoints.minus(this.unlockCost());
    player.dilation.unlocked = true;
  },
  isActive() {
    return player.dilation.active;
  },
  dilationNerf() {
    if (!this.isActive()) {
      return 1;
    }
    return 1 - 1 / (1 + Math.log2(Math.log2(player.dilation.buildup)));
  },
  tick(diff) {
    if (this.isActive()) {
      player.dilation.maxStarsDilated = player.dilation.maxStarsDilated.max(Stars.amount());
      player.dilation.buildup = player.dilation.buildup.plus(this.dilationBuildupPerSecond().times(diff));
    }
    player.dilation.dilatedTime = player.dilation.dilatedTime.plus(this.dilatedTimePerSecond().times(diff));
  },
  dilationBuildupPerSecond() {
    return DilationUpgrade(2).effect().times(Stars.amount().max(1).log2());
  },
  newTachyonParticles() {
    return new Decimal(Math.pow(player.stats.totalStarsProducedThisEternity.log2() / Math.pow(2, 16), 4));
  },
  dilatedTimePerSecond() {
    return DilationUpgrade(1).effect().times(player.dilation.tachyonParticles);
  },
  dilate(x) {
    return Decimal.pow(2, Math.pow(x.log2(), this.dilationNerf()));
  },
  multiplier() {
    return Decimal.pow(player.dilation.dilatedTime, 1024 * DilationUpgrade(3).effect());
  },
  anythingToBuy() {
    return this.upgradeList.some(x => x.canBuy());
  },
  maxAll() {
    this.upgradeList.forEach(x => x.buyMax());
  }
}
