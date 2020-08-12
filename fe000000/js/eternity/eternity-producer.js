let EternityProducerUpgrade = function (i) {
  if ('EternityProducer' in window) {
    return EternityProducer.getUpgrade(i);
  }
  return {
    bought() {
      return player.eternityProducer.upgrades[i - 1];
    },
    addBought(n) {
      player.eternityProducer.upgrades[i - 1] += n;
    },
    boughtLimit() {
      return EternityProducer.isUnlocked() ? Infinity : 0;
    },
    costIncreasePer() {
      return 16;
    },
    effectIncreasePer() {
      return 1;
    },
    initialEffect() {
      return 1;
    },
    initialCost() {
      return Decimal.pow(2, 24);
    },
    cost() {
      return this.initialCost().times(Decimal.pow(this.costIncreasePer(), this.bought()));
    },
    costFor(n) {
      return this.cost().times(Decimal.pow(this.costIncreasePer(), n).minus(1)).div(Decimal.minus(this.costIncreasePer(), 1));
    },
    processEffect(x) {
      if (i === 2) {
        return Decimal.pow(Math.max(1, 16 * Math.pow(x, 2)),
          PermanenceUpgrade(2).effect() * Math.sqrt(Eternities.amount().div(Math.pow(2, 16)).plus(1).log2()));
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
      if (!EternityProducer.isUnlocked()) {
        return this.processEffect(0);
      }
      return this.rawEffect();
    },
    nextEffect() {
      if (!EternityProducer.isUnlocked()) {
        return this.processEffect(0);
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
      let num = Math.floor(player.eternityPoints.div(this.cost()).times(
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
      player.eternityPoints = player.eternityPoints.safeMinus(this.costFor(n));
      this.addBought(n);
    },
    buyMax() {
      this.buy(this.maxBuyable(), true);
    }
  }
}

let EternityProducer = {
  upgradeList: [1, 2].map((x) => EternityProducerUpgrade(x)),
  getUpgrade: function (x) {
    return this.upgradeList[x - 1];
  },
  isUnlocked() {
    return player.eternityProducer.unlocked;
  },
  unlockCost() {
    return Math.pow(2, 20);
  },
  canUnlock() {
    return !this.isUnlocked() && player.eternityPoints.gte(this.unlockCost()) && !ComplexityChallenge.isSafeguardOn(3);
  },
  unlock(auto) {
    if (!this.canUnlock() || (
      auto && player.eternityPoints.minus(this.unlockCost()).lt(2) && EternityGenerator(1).bought() === 0)) return;
    player.eternityPoints = player.eternityPoints.safeMinus(this.unlockCost());
    player.eternityProducer.unlocked = true;
    ComplexityChallenge.exitComplexityChallenge(3);
  },
  productionPerSecond() {
    return Eternities.commonEternityGainMultiplier().times(EternityProducerUpgrade(1).effect());
  },
  produce(diff) {
    Eternities.addSudden(this.productionPerSecond().times(diff));
  },
  multiplier() {
    return EternityProducerUpgrade(2).effect();
  },
  rawProductionPerSecond() {
    return EternityProducerUpgrade(1).rawEffect();
  },
  rawMultiplier() {
    return EternityProducerUpgrade(2).rawEffect();
  },
  anythingToBuy() {
    return this.upgradeList.some(x => x.canBuy());
  },
  maxAll() {
    this.upgradeList.forEach(x => x.buyMax());
  }
}
