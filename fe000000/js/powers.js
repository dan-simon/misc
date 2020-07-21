let PowersUpgrade = function (i) {
  if ('Powers' in window) {
    return Powers.getUpgrade(i);
  }
  return {
    bought() {
      return player.powers.upgrades[i - 1];
    },
    addBought(n) {
      player.powers.upgrades[i - 1] += n;
    },
    boughtLimit() {
      return Powers.isUnlocked() ? [5, Infinity, Infinity][i - 1] : 0;
    },
    costIncreasePer() {
      return [Decimal.pow(2, 16), Decimal.pow(2, 64), null][i - 1];
    },
    effectIncreasePer() {
      return 1;
    },
    initialEffect() {
      return [0, 1, 1][i - 1];
    },
    initialCost() {
      return Decimal.pow(2, 64);
    },
    cost() {
      if (i === 3) {
        return this.initialCost().pow(Math.pow(4, this.bought));
      }
      return this.initialCost().times(Decimal.pow(this.costIncreasePer(), this.bought()));
    },
    costFor(n) {
      // The cost increase for this one is so rapid, it's clearly not an issue to just say "The only one that matters is the most expensive".
      if (i === 3) {
        return this.initialCost().pow(Math.pow(4, this.bought));
      }
      return this.cost().times(Decimal.pow(this.costIncreasePer(), n).minus(1)).div(Decimal.minus(this.costIncreasePer(), 1));
    },
    processEffect(x) {
      if (i === 1) {
        return 1 + Math.log2(1 + x / 8);
      } else {
        return x;
      }
    },
    rawEffect() {
      return this.processEffect(this.initialEffect() + this.effectIncreasePer() * this.bought());
    },
    nextRawEffect() {
      return this.processEffect(this.initialEffect() + this.effectIncreasePer() * (this.bought() + 1));
    },
    effect() {
      if (!Powers.isUnlocked() && i === 2) {
        return 0;
      }
      return this.rawEffect();
    },
    nextEffect() {
      if (!Powers.isUnlocked() && i === 2) {
        return 0;
      }
      return this.nextRawEffect();
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
      if (i === 3) {
        // This is a messy log4 implementation, which may fail due to precision
        // if the player has barely not enough CP.
        return Math.log2(player.complexityPoints.log2() / this.initialCost.log2()) / 2;
      }
      let num = Math.floor(player.complexityPoints.div(this.cost()).times(
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
      player.eternityPoints = player.eternityPoints.minus(this.costFor(n));
      this.addBought(n);
    },
    buyMax() {
      this.buy(this.maxBuyable(), true);
    }
  }
}

let Powers = {
  upgradeList: [1, 2, 3].map((x) => PowersUpgrade(x)),
  getUpgrade: function (x) {
    return this.upgradeList[x - 1];
  },
  isUnlocked() {
    return player.powers.unlocked;
  },
  unlockCost() {
    return Math.pow(2, 48);
  },
  canUnlock() {
    return player.complexityPoints.gte(this.unlockCost());
  },
  unlock() {
    if (!this.canUnlock()) return;
    player.complexityPoints = player.complexityPoints.minus(this.unlockCost());
    player.powers.unlocked = true;
    player.powers.list.push(RNG.initialPower());
  },
  strength() {
    return PowersUpgrade(1).effect();
  },
  effectMultipliers() {
    return [
      1,
      Math.log2(1 + InfinityStars.amount().log2() / Math.pow(2, 30)),
      Math.log2(1 + Math.log2(1 + player.stats.timeSinceComplexity * (1 + ComplexityStars.amount().max(1).log2() / 1024) / 64) / 4),
      1,
    ]
  },
  anythingToBuy() {
    return this.upgradeList.some(x => x.canBuy());
  },
  maxAll() {
    this.upgradeList.forEach(x => x.buyMax());
  }
}
