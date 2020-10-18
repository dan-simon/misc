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
      return Powers.isUnlocked() ? Infinity : 0;
    },
    costIncreasePer() {
      return [Decimal.pow(2, 16), Decimal.pow(2, 64), null][i - 1];
    },
    effectIncreasePer() {
      return [1, 1 / 4, 1][i - 1];
    },
    initialEffect() {
      return [0, 1, 0][i - 1];
    },
    initialCost() {
      return Decimal.pow(2, 64);
    },
    cost() {
      if (i === 3) {
        return this.initialCost().pow(Math.pow(2, this.bought()));
      }
      return this.initialCost().times(Decimal.pow(this.costIncreasePer(), this.bought()));
    },
    costFor(n) {
      // The cost increase for these are so rapid, it's clearly not an issue to just say "The only one that matters is the most expensive".
      if (i === 3) {
        return this.initialCost().pow(Math.pow(2, this.bought()));
      }
      return this.cost().times(Decimal.pow(this.costIncreasePer(), n).minus(1)).div(Decimal.minus(this.costIncreasePer(), 1));
    },
    processEffect(x) {
      if (i === 1) {
        return 1 + Math.sqrt(Math.log2(1 + x / 4)) + Galaxy.getStrengthIncrease() + FinalityShardUpgrade(7).effect();
      } else if (i === 3) {
        return Math.sqrt(-Math.log2(4 / (4 + x)));
      } else {
        return x;
      }
    },
    effect() {
      return this.processEffect(this.initialEffect() + this.effectIncreasePer() * this.bought());
    },
    nextEffect() {
      return this.laterEffect(1);
    },
    effectDisplay() {
      // This is coded like this to make it easy to handle something later that increases rarity.
      return this.effect();
    },
    nextEffectDisplay() {
      return this.nextEffect();
    },
    laterEffect(n) {
      return this.processEffect(this.initialEffect() + this.effectIncreasePer() * (this.bought() + n));
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
      let num;
      if (i === 3) {
        if (player.complexityPoints.lt(this.initialCost())) {
          // This avoids issues with log of -Infinity and potentially other fun things like that.
          // We can do a fast-return in this case because there's nothing that could happen
          // to increase the number we can buy.
          return 0;
        }
        // This may fail due to precision if the player has barely not enough CP.
        num = Math.floor(1 + Math.log2(player.complexityPoints.log2() / this.initialCost().log2())) - this.bought();
      } else {
        num = Math.floor(player.complexityPoints.div(this.cost()).times(
          Decimal.minus(this.costIncreasePer(), 1)).plus(1).log(this.costIncreasePer()));
      }
      num = Math.min(num, this.boughtLimit() - this.bought());
      num = Math.max(num, 0);
      return num;
    },
    buy(n, guaranteedBuyable) {
      if (n === undefined) {
        n = 1;
      }
      if (n === 0 || (!guaranteedBuyable && !this.canBuy(n))) return;
      player.complexityPoints = player.complexityPoints.safeMinus(this.costFor(n));
      this.addBought(n);
    },
    buyMax() {
      this.buy(this.maxBuyable(), true);
    }
  }
}

let Powers = {
  typeList: ['normal', 'infinity', 'eternity', 'complexity'],
  indexData: {
    'normal': 1,
    'infinity': 2,
    'eternity': 3,
    'complexity': 4,
  },
  // Note that the complexity formula depends on [] being considered true in JS.
  extraMultipliers: {
    'normal': () => 1,
    'infinity': () => Math.log2(1 + InfinityStars.amount().max(1).log2() / Math.pow(2, 16)) / 16,
    'eternity': () => Math.min(3, Math.pow(Math.log2(1 + (player.stats.timeSinceComplexity + FinalityMilestones.freeTimeInComplexity()) * (1 + ComplexityStars.amount().max(1).log2() / 1024) / 64) / 4, 1.25)),
    'complexity': (active) => Math.sqrt((active || Powers.active()).map(p => Powers.strength(p) * Powers.rarity(p)).reduce((a, b) => a + b, 0))
  },
  baseEffects: {
    'normal': 1 / 512,
    'infinity': 1 / 32,
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
  upgradeList: [1, 2, 3, 4].map((x) => PowerUpgrade(x)),
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
    return !this.isUnlocked() && player.complexityPoints.gte(this.unlockCost());
  },
  unlock(auto) {
    if (!this.canUnlock() || (
      auto && player.complexityPoints.minus(this.unlockCost()).lt(2) && ComplexityGenerator(1).bought() === 0)) return;
    player.complexityPoints = player.complexityPoints.safeMinus(this.unlockCost());
    player.powers.unlocked = true;
    // I have no idea why the player would already have powers at this point,
    // but let's keep them if they do.
    player.powers.stored = player.powers.stored.concat(RNG.initialPowers());
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
  timeUntilPowerGain() {
    let timePer = this.interval();
    return timePer - this.timeSincePowerGain() % timePer;
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
      if (newPowers === 0) return;
      player.stats.timeSincePowerGain -= newPowers * timePer;
      let maxedPowers = ['normal', 'infinity', 'eternity', 'complexity'].map(
        x => this.active().concat(this.stored()).filter(y => y.type === x && this.isMaxed(y)).length);
      while (newPowers > 0 && maxedPowers.some(x => x < this.maximumActivatedLimit())) {
        let newPower = this.gainNewPower(true);
        if (this.isMaxed(newPower)) {
          maxedPowers[this.index(newPower.type) - 1]++;
        }
        newPowers--;
      }
      PowerShards.gainPowerShards(RNG.averagePowerShardValue() * newPowers);
      RNG.jump(2 * newPowers);
      this.onPowerChange(true, true);
    }
  },
  gainNewPower(returnPower) {
    let newPower = RNG.randomPower(true);
    player.powers.stored.push(newPower);
    if (returnPower) {
      return newPower;
    }
  },
  isMaxed(p) {
    return p.strength === this.newStrength() && p.rarity === this.maximumRarity()
  },
  getUnsortedPowerList(x, includeActive, noIndex) {
    let startingList = includeActive ? this.active().concat(this.stored()) : this.stored();
    if (!noIndex) {
      startingList = startingList.map((p, i) => ({'index': 1 + i, ...p}));
    }
    return startingList.filter(p => p.type === x);
  },
  getSortedPowerList(x, includeActive, noIndex) {
    let startingList = this.getUnsortedPowerList(x, includeActive, noIndex);
    let f = p => this.strength(p) * this.rarity(p);
    let result = startingList.sort((a, b) => f(b) - f(a));
    return result;
  },
  cutoff(x) {
    return this.getSortedPowerList(x, true, true).map(p => this.strength(p) * this.rarity(p))[this.maximumActivatedLimit() - 1] || 0;
  },
  cutoffIndex(x, cutoff) {
    let over = this.active().concat(this.stored()).filter(p => p.type === x && this.strength(p) * this.rarity(p) > cutoff);
    let equal = this.getUnsortedPowerList(x, true, false).filter(p => p.type === x && this.strength(p) * this.rarity(p) === cutoff);
    // Indices start at 1 and include active powers.
    let equalIndex = this.maximumActivatedLimit() - over.length - 1;
    if (equalIndex < 0) {
      return -1;
    }
    if (equalIndex >= equal.length) {
      return this.stored().length;
    }
    return equal[this.maximumActivatedLimit() - over.length - 1].index - this.active().length - 1;
  },
  cleanStored() {
    let cutoffs = {};
    let cutoffIndices = {};
    for (let x of ['normal', 'infinity', 'eternity', 'complexity']) {
      cutoffs[x] = this.cutoff(x);
      cutoffIndices[x] = this.cutoffIndex(x, cutoffs[x]);
    }
    let keep = (p, i) => this.strength(p) * this.rarity(p) > cutoffs[p.type] ||
      (this.strength(p) * this.rarity(p) === cutoffs[p.type] && i <= cutoffIndices[p.type]);
    let toRemove = this.stored().filter((p, i) => !keep(p, i));
    for (let p of toRemove) {
      PowerShards.gainShards(p);
    }
    // For symmetry, and to remember the second parameter.
    player.powers.stored = this.stored().filter((p, i) => keep(p, i));
  },
  nextKept() {
    let p = this.next();
    let cutoff = this.cutoff(p.type);
    return this.strength(p) * this.rarity(p) > cutoff;
  },
  craftedKept() {
    let p = PowerShards.craftedPower();
    let cutoff = this.cutoff(p.type);
    return this.strength(p) * this.rarity(p) > cutoff;
  },
  maybeActiveSwap() {
    if (FinalityMilestones.isFinalityMilestoneActive(6)) {
      this.activeSwap();
    }
  },
  activeSwap() {
    let numberActive = this.active().length;
    for (let x of ['normal', 'infinity', 'eternity', 'complexity']) {
      let sortedOfType = this.getSortedPowerList(x, true, false);
      let numberActiveOfType = sortedOfType.filter(i => i.index <= numberActive).length;
      let activeToReplace = sortedOfType.slice(numberActiveOfType).filter(i => i.index <= numberActive);
      let storedToReplace = sortedOfType.slice(0, numberActiveOfType).filter(i => i.index > numberActive);
      for (let i = 0; i < activeToReplace.length; i++) {
        this.swap(activeToReplace[i].index - 1, storedToReplace[i].index - numberActive - 1);
      }
    }
  },
  swap(activeIndex, storedIndex) {
    let temp = this.active()[activeIndex];
    this.active()[activeIndex] = this.stored()[storedIndex];
    this.stored()[storedIndex] = temp;
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
  autoSort() {
    this.sortActive();
    this.sortStored();
  },
  onPowerChange(cleaning, potentialNewActiveReplacements) {
    if (cleaning) {
      this.cleanStored();
    }
    if (potentialNewActiveReplacements) {
      this.maybeActiveSwap();
    }
    this.autoSort();
  },
  hasAnyPowers(type) {
    if (type === 'active') {
      return this.active().length > 0;
    } else if (type === 'stored') {
      return this.stored().length > 0;
    } else if (type === 'oracle') {
      return Oracle.isUnlocked() && Oracle.powers().length > 0;
    } else if (type === 'next' || type === 'crafted') {
      return this.isUnlocked();
    }
  },
  canAccessPower(type, i) {
    if (type === 'active') {
      return this.canAccessActive(i);
    } else if (type === 'stored') {
      return this.canAccessStored(i);
    } else if (type === 'oracle') {
      return Oracle.isUnlocked() && Oracle.powers().filter(p => p.type === this.typeList[(i - 1) % 4]).length > Math.floor((i - 1) / 4);
    } else if (type === 'next' || type === 'crafted') {
      return this.isUnlocked();
    }
  },
  accessPower(type, i) {
    if (type === 'active') {
      return this.active()[i - 1];
    } else if (type === 'stored') {
      return this.getUnsortedPowerList(this.typeList[(i - 1) % 4], false, true)[Math.floor((i - 1) / 4)];
    } else if (type === 'next') {
      return this.next();
    } else if (type === 'oracle') {
      return Oracle.powers().filter(p => p.type === this.typeList[(i - 1) % 4])[Math.floor((i - 1) / 4)];
    } else if (type === 'crafted') {
      return PowerShards.craftedPower();
    }
  },
  color(type, i) {
    if (this.canAccessPower(type, i)) {
      return this.colorData[this.accessPower(type, i).type] + 'span';
    }
  },
  title(x) {
    return x[0].toUpperCase() + x.slice(1);
  },
  lower(x) {
    return x[0].toLowerCase() + x.slice(1);
  },
  descriptionFull(type, i) {
    // WE have this conditional so that we return undefined when desired.
    if (this.canAccessPower(type, i)) {
      return [this.descriptionFullEffect(type, i), this.lower(this.descriptionStrengthRarity(type, i)), this.lower(this.descriptionMultiplier(type, i))].join(', ');
    }
  },
  descriptionFullEffect(type, i) {
    if (this.canAccessPower(type, i)) {
      let power = this.accessPower(type, i);
      return this.title(power.type) + ' ^' + formatWithPrecision(this.getEffect(power), 5);
    }
  },
  descriptionEffect(type, i) {
    if (this.canAccessPower(type, i)) {
      let power = this.accessPower(type, i);
      return '^' + formatWithPrecision(this.getEffect(power), 5);
    }
  },
  descriptionStrengthRarity(type, i) {
    if (this.canAccessPower(type, i)) {
      let power = this.accessPower(type, i);
      return 'Strength ' + format(this.strength(power)) + ', rarity ' + format(this.rarity(power));
    }
  },
  descriptionMultiplier(type, i) {
    if (this.canAccessPower(type, i)) {
      let power = this.accessPower(type, i);
      return 'Multiplier ' + format(this.preExtraMultiplier(power)) + 'x (total ' + format(this.getOverallMultiplier(power)) + ')';
    }
  },
  totalEffectDescription(type) {
    return this.shortDescriptionData[type] + ': ^' + formatWithPrecision(this.getTotalEffect(type), 5);
  },
  displayIndexToRealIndex(i) {
    return this.getUnsortedPowerList(this.typeList[(i - 1) % 4], false, false)[Math.floor((i - 1) / 4)].index - 1;
  },
  canActivate(i) {
    return this.canAccessStored(i) && this.active().length < this.activatedLimit();
  },
  activate(i) {
    if (this.canActivate(i)) {
      let j = this.displayIndexToRealIndex(i);
      player.powers.active.push(player.powers.stored[j]);
      player.powers.stored = player.powers.stored.slice(0, j).concat(player.powers.stored.slice(j + 1));
      this.onPowerChange(false, true);
    }
  },
  canDelete(i) {
    return this.canAccessStored(i) && this.powerDeletionMode() !== 'Disabled';
  },
  delete(i) {
    if (this.canDelete(i) && (this.powerDeletionMode() === 'No confirmation' ||
      confirm('Are you sure you want to delete this power for ' + format(PowerShards.shardGainStored(i)) + ' power shards?'))) {
      PowerShards.gainShardsStored(i);
      let j = this.displayIndexToRealIndex(i);
      player.powers.stored = player.powers.stored.slice(0, j).concat(player.powers.stored.slice(j + 1));
      this.onPowerChange(false, false);
    }
  },
  canDeactivate(i) {
    return this.canAccessActive(i) && this.powerDeactivationMode() !== 'Disabled';
  },
  deactivate(i) {
    if (this.canDeactivate(i) && (this.powerDeactivationMode() === 'No confirmation' ||
        confirm('Are you sure you want to deactivate this active power and ' +
        ComplexityPrestigeLayer.resetText() + '?'))) {
      player.powers.stored.push(this.accessPower('active', i));
      player.powers.active = [...Array(this.active().length)].map((_, j) => j + 1).map(
        j => i === j ? null : this.accessPower('active', j)).filter(x => x !== null);
      this.onPowerChange(true, false);
      if (ComplexityPrestigeLayer.canComplexity()) {
        ComplexityPrestigeLayer.complexity(false);
      } else {
        ComplexityPrestigeLayer.complexityReset(false);
      }
    }
  },
  canAccessActive(i) {
    return this.active().length >= i;
  },
  canAccessStored(i) {
    return this.getUnsortedPowerList(this.typeList[(i - 1) % 4], false, true).length > Math.floor((i - 1) / 4);
  },
  isRespecOn() {
    return player.powers.respec;
  },
  toggleRespec() {
    player.powers.respec = !player.powers.respec;
  },
  respec() {
    player.powers.stored = this.stored().concat(this.active());
    player.powers.active = [];
    this.onPowerChange(true, false);
  },
  maybeRespec() {
    if (this.isRespecOn()) {
      this.respec();
    }
    player.powers.respec = false;
  },
  respecAndReset() {
    if (Options.confirmation('powersRespec') && !confirm(
      'Are you sure you want to deactivate your active powers and ' +
      ComplexityPrestigeLayer.resetText() + '?')) return;
    this.respec();
    if (ComplexityPrestigeLayer.canComplexity()) {
      ComplexityPrestigeLayer.complexity(false);
    } else {
      ComplexityPrestigeLayer.complexityReset(false);
    }
  },
  newStrength() {
    return PowerUpgrade(1).effect();
  },
  speed() {
    return PowerUpgrade(2).effect() * FinalityShardUpgrade(6).effect();
  },
  minimumRarity() {
    return PowerUpgrade(3).effect();
  },
  maximumRarity() {
    return 4;
  },
  activatedLimit() {
    return 3;
  },
  interval() {
    return 2048 / this.speed();
  },
  showNextPower() {
    return this.interval() > 1;
  },
  maximumActivatedLimit() {
    return 3;
  },
  active() {
    return player.powers.active;
  },
  stored() {
    return player.powers.stored;
  },
  next() {
    return RNG.randomPower(false);
  },
  typeCap(x) {
    return x === 'eternity' ? 3 : Infinity;
  },
  isTypeAtCap(x, future) {
    return this.getExtraMultiplier(x, future) === this.typeCap(x);
  },
  index(x) {
    return this.indexData[x];
  },
  getExtraMultiplier(x, future, active) {
    if (future && Oracle.powerFutureExtraMultipliers()) {
      return Oracle.extraMultipliers()[x];
    } else {
      return this.extraMultipliers[x](active);
    }
  },
  getAllExtraMultipliers() {
    let extraMultipliers = {};
    for (let x of this.typeList) {
      extraMultipliers[x] = this.getExtraMultiplier(x);
    }
    return extraMultipliers;
  },
  rarity(p) {
    return p.rarity;
  },
  strength(p) {
    return p.strength;
  },
  powerShardBonus(p) {
    return PowerShardUpgrade(this.index(p.type)).effect();
  },
  preExtraMultiplier(p) {
    return this.rarity(p) * this.strength(p) + this.powerShardBonus(p);
  },
  extraMultiplier(p, active) {
    return this.getExtraMultiplier(p.type, p.future, active);
  },
  getOverallMultiplier(p, active) {
    return this.preExtraMultiplier(p) * this.extraMultiplier(p, active);
  },
  getEffect(p, active) {
    return 1 + this.baseEffects[p.type] * this.getOverallMultiplier(p, active);
  },
  getTotalEffect(x, active) {
    if (active === undefined) {
      active = Powers.active();
    }
    return this.getTotalEffectFrom(active.filter(p => p.type === x), active);
  },
  getTotalEffectFrom(x, active) {
    return x.map(p => this.getEffect(p, active)).reduce((a, b) => a + b - 1, 1);
  },
  makeFuture(p) {
    return {
      'type': p.type,
      'strength': p.strength,
      'rarity': p.rarity,
      'future': true
    }
  },
  anythingToBuy() {
    return this.upgradeList.some(x => x.canBuy());
  },
  maxAll() {
    this.upgradeList.forEach(x => x.buyMax());
  },
  bestComplexityPowers() {
    let bestComplexityPowers = this.getSortedPowerList('complexity', true, true).slice(0, this.activatedLimit());
    // Fill up leftover space with the best other powers we have equipped.
    let f = p => this.strength(p) * this.rarity(p);
    return bestComplexityPowers.concat(
      this.active().filter(x => x.type !== 'complexity').sort(
        (a, b) => f(b) - f(a)).slice(0, this.activatedLimit() - bestComplexityPowers.length));
  },
  effectOfBestComplexityPowers() {
    return Math.max(this.getTotalEffect('complexity'), this.getTotalEffect('complexity', this.bestComplexityPowers()))
  },
  powerDeletionMode() {
    return player.powers.powerDeletionMode;
  },
  changePowerDeletionMode() {
    let modes = ['Confirmation', 'No confirmation', 'Disabled'];
    player.powers.powerDeletionMode = modes[(modes.indexOf(player.powers.powerDeletionMode) + 1) % 3];
  },
  powerDeactivationMode() {
    return player.powers.powerDeactivationMode;
  },
  changePowerDeactivationMode() {
    let modes = ['Confirmation', 'No confirmation', 'Disabled'];
    player.powers.powerDeactivationMode = modes[(modes.indexOf(player.powers.powerDeactivationMode) + 1) % 3];
  },
  isAutoLoadUnlocked() {
    return FinalityMilestones.isFinalityMilestoneActive(7);
  },
  isAutoLoadActive() {
    return this.isAutoLoadUnlocked() && this.isAutoLoadOn();
  },
  autoLoadPowerList() {
    if (!this.isAutoLoadActive()) return;
    this.importString(this.powerListToAutoLoad());
  },
  powerListToAutoLoad() {
    return player.powerListAutoLoad.powerList;
  },
  setPowerListToAutoLoad(x) {
    player.powerListAutoLoad.powerList = x;
  },
  isAutoLoadOn() {
    return player.powerListAutoLoad.on;
  },
  toggleAutoLoad() {
    player.powerListAutoLoad.on = !player.powerListAutoLoad.on;
  },
  tabColors() {
    return ['normal', 'infinity', 'eternity', 'complexity'];
  },
  exportString() {
    if (this.active().length === 0) {
      return 'none';
    }
    let typeCount = [0, 0, 0, 0];
    for (let p of this.active()) {
      typeCount[this.index(p.type) - 1]++;
    }
    return typeCount.map((n, i) => 'NIEC'[i].repeat(n)).join('');
  },
  export() {
    let output = document.getElementById('powers-export-output');
    let parent = output.parentElement;
    parent.style.display = '';
    output.value = this.exportString();
    output.select();
    try {
      document.execCommand('copy');
    } catch(ex) {
      alert('Copying to clipboard failed.');
    }
    if (!player.options.exportDisplay) {
      parent.style.display = 'none';
      document.getElementsByClassName('powers-export-button')[0].focus();
    }
  },
  toNumber(x) {
    return Math.max(0, Math.floor(+x)) || 0;
  },
  importStringCounts(importString) {
    importString = importString.toUpperCase();
    if (importString === 'NONE') {
      return [0, 0, 0, 0];
    }
    let initialCounts = importString.replace(/[NIEC]/g, '').split(',').map(x => this.toNumber(x));
    return [0, 1, 2, 3].map(i => (importString.match(new RegExp('NIEC'[i], 'g')) || []).length + (initialCounts[i] || 0));
  },
  importString(importString) {
    if (!importString) return;
    let counts = this.importStringCounts(importString);
    let realCounts = [0, 1, 2, 3].map(i => Math.max(0, counts[i] - this.active().filter(
      x => x.type === ['normal', 'infinity', 'eternity', 'complexity'][i]).length));
    let toActivateByType = [0, 1, 2, 3].map(i => this.getSortedPowerList(['normal', 'infinity', 'eternity', 'complexity'][i], false, false).slice(0, realCounts[i]));
    let indicesToActivate = [].concat.apply([], toActivateByType).slice(0, this.activatedLimit() - this.active().length).map(x => x.index);
    player.powers.active = this.active().concat(indicesToActivate.map(i => this.stored()[i - 1]));
    player.powers.stored = this.stored().filter((_, i) => !indicesToActivate.includes(1 + i));
    // The second parameter is false here because import already selects the best powers of each type,
    // so there's no need to do any swapping.
    this.onPowerChange(false, false);
  },
  import() {
    this.importString(prompt('Enter your active powers (as previously exported):'));
  },
  hasPreset(x) {
    return player.powers.presets.length >= x;
  },
  presetName(x) {
    if (!this.hasPreset(x)) return 'Untitled';
    return player.powers.presets[x - 1].name;
  },
  presetPowerList(x) {
    if (!this.hasPreset(x)) return '';
    return player.powers.presets[x - 1].powers;
  },
  setPresetName(x, name) {
    player.powers.presets[x - 1].name = name;
  },
  setPresetPowerList(x, activePowers) {
    player.powers.presets[x - 1].powers = activePowers;
  },
  presetSetToCurrentPowers(x) {
    this.setPresetPowerList(x, this.exportString());
    this.redisplayPresetPowerList(x);
  },
  presetLoad(x) {
    this.importString(this.presetPowerList(x));
  },
  presetDelete(x) {
    player.powers.presets = player.powers.presets.slice(0, x - 1).concat(player.powers.presets.slice(x));
    for (let i = x; i <= player.powers.presets.length; i++) {
      this.redisplayPreset(i);
    }
  },
  presetCreate() {
    if (!this.hasPreset(32)) {
      player.powers.presets.push({'name': 'Untitled', 'powers': this.exportString()});
      this.redisplayPreset(player.powers.presets.length);
    }
  },
  redisplayPreset(x) {
    this.redisplayPresetName(x);
    this.redisplayPresetPowerList(x);
  },
  redisplayPresetName(x) {
    document.getElementsByClassName('presetpowername' + x)[0].value = this.presetName(x);
  },
  redisplayPresetPowerList(x) {
    document.getElementsByClassName('presetpowerlist' + x)[0].value = this.presetPowerList(x);
  }
}
