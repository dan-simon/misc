let PowerUpgrade = function (i) {
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
      return Powers.isUnlocked() ? [Infinity, Infinity, 5][i - 1] : 0;
    },
    costIncreasePer() {
      return [Decimal.pow(2, 16), Decimal.pow(2, 64), null][i - 1];
    },
    effectIncreasePer() {
      return 1;
    },
    initialEffect() {
      return [0, 1, 2][i - 1];
    },
    initialCost() {
      return Decimal.pow(2, 64);
    },
    cost() {
      if (i === 3) {
        return this.initialCost().pow(Math.pow(4, this.bought()));
      }
      return this.initialCost().times(Decimal.pow(this.costIncreasePer(), this.bought()));
    },
    costFor(n) {
      // The cost increase for this one is so rapid, it's clearly not an issue to just say "The only one that matters is the most expensive".
      if (i === 3) {
        return this.initialCost().pow(Math.pow(4, this.bought()));
      }
      return this.cost().times(Decimal.pow(this.costIncreasePer(), n).minus(1)).div(Decimal.minus(this.costIncreasePer(), 1));
    },
    processEffect(x) {
      if (i === 1) {
        return 1 + Math.sqrt(Math.log2(1 + x / 4));
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
        return Math.max(Math.floor(1 + Math.log2(player.complexityPoints.log2() / this.initialCost().log2()) / 2) - this.bought(), 0);
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
      player.complexityPoints = player.complexityPoints.minus(this.costFor(n));
      this.addBought(n);
      if (i === 1) {
        Powers.next().strength = Powers.newStrength();
      }
    },
    buyMax() {
      this.buy(this.maxBuyable(), true);
    }
  }
}

let Powers = {
  extraMultipliers: {
    'normal': () => 1,
    'infinity': () => Math.sqrt(Math.log2(1 + InfinityStars.amount().log2() / Math.pow(2, 32))),
    'eternity': () => Math.log2(1 + player.stats.timeSinceComplexity * (1 + ComplexityStars.amount().max(1).log2() / 1024) / 64) / 4,
    'complexity': () => Math.sqrt(Powers.active().map(p => Powers.strength(p) * Powers.rarity(p)).reduce((a, b) => a + b, 0))
  },
  baseEffects: {
    'normal': 1 / 512,
    'infinity': 1 / 64,
    'eternity': 1 / 16,
    'complexity': 1 / 16,
  },
  colorData: {
    'normal': 'yellow',
    'infinity': 'magenta',
    'eternity': 'cyan',
    'complexity': 'brown',
  },
  descriptionData: {
    'normal': 'Normal generator multiplier power',
    'infinity': 'Infinity generator multiplier power based on infinity stars',
    'eternity': 'Eternity generator multiplier power based on complexity stars and time in complexity',
    'complexity': 'Complexity generator multiplier power based on total strength and rarity of active powers',
  },
  shortDescriptionData: {
    'normal': 'Normal generator multiplier power',
    'infinity': 'Infinity generator multiplier power',
    'eternity': 'Eternity generator multiplier power',
    'complexity': 'Complexity generator multiplier power',
  },
  upgradeList: [1, 2, 3].map((x) => PowerUpgrade(x)),
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
    this.gainNewPower();
    player.stats.timeSincePowerGain = 0;
  },
  isPowerGainOn() {
    return player.powers.gain;
  },
  togglePowerGain() {
    player.powers.gain = !player.powers.gain;
  },
  isPowerGainActive() {
    return this.isUnlocked() && this.isPowerGainOn();
  },
  timeSincePowerGain() {
    return player.stats.timeSincePowerGain;
  },
  imminentPowerGain() {
    return Math.floor(player.stats.timeSincePowerGain / this.interval());
  },
  checkForPowerGain() {
    if (this.isPowerGainActive()) {
      let timePer = this.interval();
      let newPowers = this.imminentPowerGain();
      player.stats.timeSincePowerGain -= newPowers * timePer;
      for (let i = 0; i < newPowers; i++) {
        this.gainNewPower();
      }
      this.cleanStored();
    }
  },
  gainNewPower() {
    player.powers.stored.push(this.next());
    player.powers.next = RNG.randomPower();
  },
  cleanStored() {
    let cutoffs = {};
    for (let x of ['normal', 'infinity', 'eternity', 'complexity']) {
      cutoffs[x] = this.active().concat(this.stored()).filter(p => p.type === x).map(
        p => this.strength(p) * this.rarity(p)).sort((a, b) => b - a)[
          this.maximumActivatedLimit() - 1] || 0;
    }
    player.powers.stored = this.stored().filter(p => this.strength(p) * this.rarity(p) >= cutoffs[p.type]);
  },
  nextKept() {
    let cutoff = this.active().concat(this.stored()).filter(p => p.type === this.next().type).map(
      p => this.strength(p) * this.rarity(p)).sort((a, b) => b - a)[
        this.maximumActivatedLimit() - 1] || 0;
    return this.strength(this.next()) * this.rarity(this.next()) >= cutoff;
  },
  sortActive() {
    // Put higher strength and rarity on the top.
    let f = p => 1000 * ['normal', 'infinity', 'eternity', 'complexity'].indexOf(p.type) - this.strength(p) * this.rarity(p);
    player.powers.active.sort((a, b) => f(a) - f(b));
  },
  sortStored() {
    let f = p => 1000 * ['normal', 'infinity', 'eternity', 'complexity'].indexOf(p.type) - this.strength(p) * this.rarity(p);
    player.powers.stored.sort((a, b) => f(a) - f(b));
  },
  canAccessPower(type, i) {
    if (type === 'active') {
      return this.canAccessActive(i);
    } else if (type === 'stored') {
      return this.canAccessStored(i);
    } else if (type === 'next') {
      return this.isUnlocked()
    }
  },
  accessPower(type, i) {
    if (type === 'active') {
      return this.active()[i - 1];
    } else if (type === 'stored') {
      return this.stored()[i - 1];
    } else if (type === 'next') {
      return this.next();
    }
  },
  color(type, i) {
    if (this.canAccessPower(type, i)) {
      return this.colorData[this.accessPower(type, i).type] + 'span';
    }
  },
  description(type, i) {
    if (this.canAccessPower(type, i)) {
      let power = this.accessPower(type, i);
      return this.descriptionData[power.type] + ': ^' + formatWithPrecision(this.getEffect(power), 5);
    }
  },
  details(type, i) {
    if (this.canAccessPower(type, i)) {
      let power = this.accessPower(type, i);
      return '(strength ' + format(this.strength(power)) + ', rarity ' + format(this.rarity(power)) +
      ', extra multiplier ' + format(this.extraMultiplier(power)) + 'x, total multiplier ' + format(this.getOverallMultiplier(power)) + 'x)'
    }
  },
  totalEffectDescription(type) {
    return this.shortDescriptionData[type] + ': ^' + formatWithPrecision(this.getTotalEffect(type), 5);
  },
  canActivate(i) {
    return this.stored().length >= i && this.active().length < this.activatedLimit();
  },
  activate(i) {
    if (this.canActivate(i)) {
      player.powers.active.push(player.powers.stored[i - 1]);
      player.powers.stored = player.powers.stored.slice(0, i - 1).concat(player.powers.stored.slice(i));
    }
  },
  canDelete(i) {
    return this.stored().length >= i;
  },
  delete(i) {
    if (this.canDelete(i) && confirm('Are you sure you want to delete this power?')) {
      player.powers.stored = player.powers.stored.slice(0, i - 1).concat(player.powers.stored.slice(i));
    }
  },
  canAccessActive(i) {
    return this.active().length >= i;
  },
  canAccessStored(i) {
    return this.stored().length >= i;
  },
  isRespecOn() {
    return player.powers.respec;
  },
  toggleRespec() {
    player.powers.respec = !player.powers.respec;
  },
  respec() {
    player.powers.stored = this.stored().concat(this.active());
    this.cleanStored();
    player.powers.active = [];
  },
  maybeRespec() {
    if (this.isRespecOn()) {
      this.respec();
    }
    player.powers.respec = false;
  },
  respecAndReset() {
    this.respec();
    if (ComplexityPrestigeLayer.canComplexity()) {
      ComplexityPrestigeLayer.complexity();
    } else {
      ComplexityPrestigeLayer.complexityReset();
    }
  },
  newStrength() {
    return PowerUpgrade(1).effect();
  },
  speed() {
    return PowerUpgrade(2).effect();
  },
  activatedLimit() {
    return PowerUpgrade(3).effect();
  },
  interval() {
    return 4096 / this.speed();
  },
  maximumActivatedLimit() {
    return PowerUpgrade(3).initialEffect() + PowerUpgrade(3).effectIncreasePer() * PowerUpgrade(3).boughtLimit()
  },
  active() {
    return player.powers.active;
  },
  stored() {
    return player.powers.stored;
  },
  next() {
    return player.powers.next;
  },
  getExtraMultiplier(x) {
    return this.extraMultipliers[x]();
  },
  rarity(p) {
    return p.rarity;
  },
  strength(p) {
    return p.strength;
  },
  extraMultiplier(p) {
    return this.getExtraMultiplier(p.type);
  },
  getOverallMultiplier(p) {
    return this.rarity(p) * this.strength(p) * this.extraMultiplier(p);
  },
  getEffect(p) {
    return 1 + this.baseEffects[p.type] * this.getOverallMultiplier(p);
  },
  getTotalEffect(x) {
    return this.active().filter(p => p.type === x).map(p => this.getEffect(p)).reduce((a, b) => a + b - 1, 1);
  },
  anythingToBuy() {
    return this.upgradeList.some(x => x.canBuy());
  },
  maxAll() {
    this.upgradeList.forEach(x => x.buyMax());
  }
}
