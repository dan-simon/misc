let PowerUpgrade = function (i) {
  if (defined.powers) {
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
    displayBoughtLimit() {
      return Infinity;
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
    atDisplayBoughtLimit() {
      return this.bought() >= this.displayBoughtLimit();
    },
    canBuy(n) {
      if (n === undefined) {
        n = 1;
      }
      return n <= this.maxBuyable();
    },
    newAutobuyerStart: [64, 64, null][i - 1],
    newAutobuyerScale: [16, 64, null][i - 1],
    newAutobuyerCapLoc: Infinity,
    isGenerallyBuyable() {
      return Powers.isUnlocked();
    },
    isSpecial: (i === 3) ? (() => true) : (() => false),
    maxBuyable(fraction) {
      if (!this.isGenerallyBuyable()) return 0;
      if (fraction === undefined) {
        fraction = 1;
      }
      let num;
      if (i === 3) {
        if (player.complexityPoints.lt(this.initialCost())) {
          // This avoids issues with log of -Infinity and potentially other fun things like that.
          // We can do a fast-return in this case because there's nothing that could happen
          // to increase the number we can buy.
          return 0;
        }
        // This may fail due to precision if the player has barely not enough CP.
        num = Math.floor(1 + Math.log2(player.complexityPoints.times(fraction).log2() / this.initialCost().log2())) - this.bought();
      } else {
        num = Math.floor(player.complexityPoints.times(fraction).div(this.cost()).times(
          Decimal.minus(this.costIncreasePer(), 1)).plus(1).log(this.costIncreasePer()));
      }
      num = Math.min(num, this.boughtLimit() - this.bought());
      num = Math.max(num, 0);
      return num;
    },
    buy(n, guaranteedBuyable, free) {
      if (n === undefined) {
        n = 1;
      }
      if (n === 0 || (!guaranteedBuyable && !this.canBuy(n))) return;
      if (!free) {
        player.complexityPoints = player.complexityPoints.safeMinus(this.costFor(n));
      }
      this.addBought(n);
    },
    buyMax(fraction) {
      this.buy(this.maxBuyable(fraction), true);
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
    'complexity': (equipped) => Math.sqrt((equipped || Powers.equipped()).map(p => Powers.strength(p) * Powers.rarity(p)).reduce((a, b) => a + b, 0))
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
    'complexity': 'Complexity generator multiplier power based on total strength and rarity of equipped powers',
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
    this.setPowerGain(!player.powers.gain);
  },
  setPowerGain(x) {
    player.powers.gain = x;
    if (x === true) {
      // This limit is high enough that in practice you'll usually get
      // enough capped powers quickly enough to not get 2^20 powers,
      // and thus not reach the limit. However, without any rarity
      // improvements, it's pretty close, so it's possible someone
      // will actually see this message.
      this.checkForPowerGain(0, 'turning power gain on', Math.pow(2, 20));
    }
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
  checkForPowerGain(diff, cause, limit) {
    if (cause === undefined) {
      // Of course this is not the cause of most calls to this function
      // (generally it's called for a regular tick). However, this parameter
      // is only used (and, even then, mostly for display) when a tick
      // generates, usually, at least 1024 powers, which should only happen
      // in a few scenarios, primarily usual offline progress but perhaps
      // also a computer waking up from sleep (or a vaguely similar state)
      // and doing one super-long tick (which is close enough to usual
      // offline progress for me). In the case of turning power gain
      // back on after having it off, this parameter is not its default value.
      cause = 'offline progress';
    }
    if (limit === undefined) {
      limit = 1024;
    }
    if (this.isPowerGainActive()) {
      let timePer = this.interval();
      let newPowers = this.imminentPowerGain();
      let overproductionEfficiencyLimit = newPowers - limit;
      if (newPowers === 0) return;
      player.stats.timeSincePowerGain -= newPowers * timePer;
      let maxedPowers = ['normal', 'infinity', 'eternity', 'complexity'].map(
        x => this.equipped().concat(this.stored()).filter(y => y.type === x && this.isMaxed(y)).length);
      while (newPowers > 0 && maxedPowers.some(x => x < this.maximumEquippedLimit())) {
        if (newPowers <= overproductionEfficiencyLimit) {
          if (!(cause in player.stats.hasSeenPowerWarningMessage)) {
            alert('To avoid ' + cause + ' taking too long to process, you can get at most ' +
              formatInt(limit) + ' powers in a single tick. The rest will be converted to power shards. ' +
              'This message will not show up again.');
            player.stats.hasSeenPowerWarningMessage[cause] = true;
          }
          break;
        }
        let newPower = this.gainNewPower(true, Math.min(diff, player.stats.timeSincePowerGain + timePer * (newPowers - 1)));
        if (this.isMaxed(newPower)) {
          maxedPowers[this.index(newPower.type) - 1]++;
        }
        newPowers--;
      }
      PowerShards.gainPowerShards(RNG.averagePowerShardValue() * newPowers);
      RNG.jump(2 * newPowers);
      player.powers.id += newPowers;
      this.onPowerChange(true, true);
    }
  },
  gainNewPower(returnPower, howLongAgo) {
    let newPower = RNG.randomPower(true, howLongAgo);
    player.powers.stored.push(newPower);
    player.powers.id++;
    if (returnPower) {
      return newPower;
    }
  },
  isMaxed(p) {
    return p.strength === this.newStrength() && p.rarity === this.maximumRarity()
  },
  getUnsortedPowerList(x, includeEquipped, noIndex) {
    let startingList = includeEquipped ? this.equipped().concat(this.stored()) : this.stored();
    if (!noIndex) {
      startingList = startingList.map((p, i) => ({'index': 1 + i, ...p}));
    }
    return startingList.filter(p => p.type === x);
  },
  getSortedPowerList(x, includeEquipped, noIndex) {
    let startingList = this.getUnsortedPowerList(x, includeEquipped, noIndex);
    let f = p => this.strength(p) * this.rarity(p);
    let result = startingList.sort((a, b) => f(b) - f(a));
    return result;
  },
  cutoff(x) {
    return this.getSortedPowerList(x, true, true).map(p => this.strength(p) * this.rarity(p))[this.maximumEquippedLimit() - 1] || 0;
  },
  cutoffIndex(x, cutoff) {
    let over = this.equipped().concat(this.stored()).filter(p => p.type === x && this.strength(p) * this.rarity(p) > cutoff);
    let equal = this.getUnsortedPowerList(x, true, false).filter(p => p.type === x && this.strength(p) * this.rarity(p) === cutoff);
    // Indices start at 1 and include equipped powers.
    let equalIndex = this.maximumEquippedLimit() - over.length - 1;
    if (equalIndex < 0) {
      return -1;
    }
    if (equalIndex >= equal.length) {
      return this.stored().length;
    }
    return equal[this.maximumEquippedLimit() - over.length - 1].index - this.equipped().length - 1;
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
  canEquippedSwap() {
    return ['normal', 'infinity', 'eternity', 'complexity'].some(
      t => Math.min(...this.equipped().filter(p => p.type === t).map(p => this.strength(p) * this.rarity(p))) <
      Math.max(...this.stored().filter(p => p.type === t).map(p => this.strength(p) * this.rarity(p))));
  },
  canAutoEquippedSwap() {
    return this.canEquippedSwap() && FinalityMilestones.isFinalityMilestoneActive(11);
  },
  maybeEquippedSwap() {
    if (this.canAutoEquippedSwap()) {
      this.equippedSwap(false);
    }
  },
  equippedSwap(manual) {
    // The button to do this manually shouldn't appear if the player has Finality Milestone 11,
    // because then it's automatically happening every tick no matter what.
    // That being said, if it did appear, nothing would go wrong.
    if (!this.canEquippedSwap()) {
      return true;
    }
    if (manual && Options.confirmation('powersUnequip') && !confirm(
      'Are you sure you want to swap your equipped powers with ' +
      'better stored powers of the same type and ' +
      ComplexityPrestigeLayer.resetText() + '?')) return false;
    let counts = this.getTypeCounts();
    this.respec();
    // We check for Finality Milestone 11 above to handle the automated case.
    if (!FinalityMilestones.isFinalityMilestoneActive(11)) {
      if (ComplexityPrestigeLayer.canComplexity()) {
        ComplexityPrestigeLayer.complexity(false);
      } else {
        ComplexityPrestigeLayer.complexityReset(false, false);
      }
    }
    this.importFromCounts(counts);
  },
  swap(equippedIndex, storedIndex) {
    let temp = this.equipped()[equippedIndex];
    this.equipped()[equippedIndex] = this.stored()[storedIndex];
    this.stored()[storedIndex] = temp;
  },
  sortEquipped() {
    // Put higher strength and rarity on the top.
    let f = p => 1000 * ['normal', 'infinity', 'eternity', 'complexity'].indexOf(p.type) - this.strength(p) * this.rarity(p);
    player.powers.equipped.sort((a, b) => f(a) - f(b));
  },
  sortStored() {
    let f = p => 1000 * ['normal', 'infinity', 'eternity', 'complexity'].indexOf(p.type) - this.strength(p) * this.rarity(p);
    player.powers.stored.sort((a, b) => f(a) - f(b));
  },
  autoSort() {
    this.sortEquipped();
    this.sortStored();
  },
  onPowerChange(cleaning, potentialNewEquippedReplacements) {
    if (cleaning) {
      this.cleanStored();
    }
    if (potentialNewEquippedReplacements) {
      this.maybeEquippedSwap();
    }
    this.autoSort();
  },
  hasAnyPowers(type) {
    if (type === 'equipped') {
      return this.equipped().length > 0;
    } else if (type === 'stored') {
      return this.stored().length > 0;
    } else if (type === 'oracle') {
      return Oracle.isUnlocked() && Oracle.powers().length > 0;
    } else if (type === 'oracle-equipped') {
      return Oracle.isUnlocked() && Oracle.equippedPowers().length > 0;
    } else if (type === 'next' || type === 'crafted') {
      return this.isUnlocked();
    }
  },
  canAccessPower(type, i) {
    if (type === 'equipped') {
      return this.canAccessEquipped(i);
    } else if (type === 'stored') {
      return this.canAccessStored(i);
    } else if (type === 'oracle') {
      return Oracle.isUnlocked() && Oracle.powers().filter(p => p.type === this.typeList[(i - 1) % 4]).length > Math.floor((i - 1) / 4);
    } else if (type === 'oracle-equipped') {
      return Oracle.isUnlocked() && Oracle.equippedPowers().length >= i;
    } else if (type === 'next' || type === 'crafted') {
      return this.isUnlocked();
    }
  },
  accessPower(type, i) {
    if (type === 'equipped') {
      return this.equipped()[i - 1];
    } else if (type === 'stored') {
      return this.getUnsortedPowerList(this.typeList[(i - 1) % 4], false, true)[Math.floor((i - 1) / 4)];
    } else if (type === 'next') {
      return this.next();
    } else if (type === 'oracle') {
      return Oracle.powers().filter(p => p.type === this.typeList[(i - 1) % 4])[Math.floor((i - 1) / 4)];
    } else if (type === 'oracle-equipped') {
      return Oracle.equippedPowers()[i - 1];
    } else if (type === 'crafted') {
      return PowerShards.craftedPower();
    }
  },
  color(type, i) {
    if (this.canAccessPower(type, i)) {
      return this.colorData[this.accessPower(type, i).type] + 'alteredspan';
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
      return this.title(power.type) + ' ^' + formatPrecisely(this.getEffect(power));
    }
  },
  descriptionEffect(type, i) {
    if (this.canAccessPower(type, i)) {
      let power = this.accessPower(type, i);
      return '^' + formatPrecisely(this.getEffect(power));
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
  descriptionWait(type, i) {
    if (this.canAccessPower(type, i)) {
      let power = this.accessPower(type, i);
      if (power.id[0] < player.finalities) {
        return 'Produced in past finality';
      } else if (power.id[0] > player.finalities) {
        return 'Produced in future finalities';
      } else if (!this.isUnlocked()) {
        // This case should rarely happen, so it's probably fine to not be more precise.
        return 'Produced after power unlock';
      } else if (power.id[1] === null) {
        // It's probably OK not to be more precise
        return 'Already crafted';
      }
      let wait = (power.id[1] - player.powers.id + 1) * this.interval() - player.stats.timeSincePowerGain;
      if (wait > 0) {
        return 'Produced after ' + formatTime(wait, {seconds: {f: formatTimeNum, s: false}, larger: {f: formatTimeNum, s: false}});
      } else if (player.powers.id <= power.id[1]) {
        return 'Produced by turning on power gain';
      } else {
        return 'Already produced';
      }
    }
  },
  totalEffectDescription(type) {
    return this.shortDescriptionData[type] + ': ^' + formatPrecisely(this.getTotalEffect(type));
  },
  displayIndexToRealIndex(i) {
    return this.getUnsortedPowerList(this.typeList[(i - 1) % 4], false, false)[Math.floor((i - 1) / 4)].index - 1;
  },
  canEquip(i) {
    return this.canAccessStored(i) && this.equipped().length < this.equippedLimit();
  },
  equip(i) {
    if (this.canEquip(i)) {
      let j = this.displayIndexToRealIndex(i);
      player.powers.equipped.push(player.powers.stored[j]);
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
  canUnequip(i) {
    return this.canAccessEquipped(i) && this.powerUnequipMode() !== 'Disabled';
  },
  unequip(i) {
    if (this.canUnequip(i) && (this.powerUnequipMode() === 'No confirmation' ||
        confirm('Are you sure you want to unequip this equipped power and ' +
        ComplexityPrestigeLayer.resetText() + '?'))) {
      player.powers.stored.push(this.accessPower('equipped', i));
      player.powers.equipped = [...Array(this.equipped().length)].map((_, j) => j + 1).map(
        j => i === j ? null : this.accessPower('equipped', j)).filter(x => x !== null);
      this.onPowerChange(true, false);
      if (ComplexityPrestigeLayer.canComplexity()) {
        ComplexityPrestigeLayer.complexity(false);
      } else {
        ComplexityPrestigeLayer.complexityReset(false, false);
      }
    }
  },
  canAccessEquipped(i) {
    return this.equipped().length >= i;
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
  presetRespec() {
    return globalShiftDown !== player.powers.presetRespec;
  },
  togglePresetRespec() {
    player.powers.presetRespec = !player.powers.presetRespec;
  },
  respec() {
    player.powers.stored = this.stored().concat(this.equipped());
    player.powers.equipped = [];
    this.setLastPresetIndex(0);
    this.onPowerChange(true, false);
  },
  maybeRespec() {
    if (this.isRespecOn()) {
      this.respec();
    }
    player.powers.respec = false;
  },
  canRespec() {
    return this.equipped().length !== 0;
  },
  respecAndReset() {
    if (!this.canRespec()) {
      return true;
    }
    if (Options.confirmation('powersUnequip') && !confirm(
      'Are you sure you want to unequip your equipped powers and ' +
      ComplexityPrestigeLayer.resetText() + '?')) return false;
    this.respec();
    if (ComplexityPrestigeLayer.canComplexity()) {
      ComplexityPrestigeLayer.complexity(false);
    } else {
      ComplexityPrestigeLayer.complexityReset(false, false);
    };
    return true;
  },
  newStrength() {
    return PowerUpgrade(1).effect();
  },
  speed() {
    return PowerUpgrade(2).effect() * Achievements.otherMultiplier() * FinalityShardUpgrade(6).effect();
  },
  minimumRarity() {
    return PowerUpgrade(3).effect();
  },
  maximumRarity() {
    return 4;
  },
  equippedLimit() {
    return 3;
  },
  interval() {
    return 2048 / this.speed();
  },
  showNextPower() {
    // Don't show next power if we're doing fast finalities, to avoid it flashing.
    // Also don't show it without powers unlocked.
    return this.interval() > 1 && this.isUnlocked() && !player.stats.lastTenFinalities.map(x => x[0]).every(x => x !== -1 && x <= 1);
  },
  maximumEquippedLimit() {
    return 3;
  },
  equipped() {
    return player.powers.equipped;
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
  getExtraMultiplier(x, future, equipped) {
    if (future && Oracle.powerFutureExtraMultipliers()) {
      return Oracle.extraMultipliers()[x];
    } else {
      return this.extraMultipliers[x](equipped);
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
  extraMultiplier(p, equipped) {
    return this.getExtraMultiplier(p.type, p.future, equipped);
  },
  getOverallMultiplier(p, equipped) {
    return this.preExtraMultiplier(p) * this.extraMultiplier(p, equipped);
  },
  getEffect(p, equipped) {
    return 1 + this.baseEffects[p.type] * this.getOverallMultiplier(p, equipped);
  },
  getTotalEffect(x, equipped) {
    if (equipped === undefined) {
      equipped = Powers.equipped();
    }
    return this.getTotalEffectFrom(equipped.filter(p => p.type === x), equipped);
  },
  getTotalEffectFrom(x, equipped) {
    return x.map(p => this.getEffect(p, equipped)).reduce((a, b) => a + b - 1, 1);
  },
  anythingToBuy() {
    return this.upgradeList.some(x => x.canBuy());
  },
  maxAll() {
    this.upgradeList.forEach(x => x.buyMax());
  },
  bestComplexityPowers() {
    let bestComplexityPowers = this.getSortedPowerList('complexity', true, true).slice(0, this.equippedLimit());
    // Fill up leftover space with the best other powers we have equipped.
    let f = p => this.strength(p) * this.rarity(p);
    return bestComplexityPowers.concat(
      this.equipped().filter(x => x.type !== 'complexity').sort(
        (a, b) => f(b) - f(a)).slice(0, this.equippedLimit() - bestComplexityPowers.length));
  },
  effectOfBestComplexityPowers() {
    return Math.max(this.getTotalEffect('complexity'), this.getTotalEffect('complexity', this.bestComplexityPowers()))
  },
  powerDeletionMode() {
    return player.confirmations.powerDeletionMode;
  },
  setPowerDeletionMode(x) {
    player.confirmations.powerDeletionMode = x;
  },
  powerUnequipMode() {
    return player.confirmations.powerUnequipMode;
  },
  setPowerUnequipMode(x) {
    player.confirmations.powerUnequipMode = x;
  },
  isAutoLoadUnlocked() {
    return FinalityMilestones.isFinalityMilestoneActive(13);
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
    if (this.equipped().length === 0) {
      return 'none';
    }
    let typeCounts = this.getTypeCounts();
    return typeCounts.map((n, i) => 'NIEC'[i].repeat(n)).join('');
  },
  getTypeCounts() {
    let typeCounts = [0, 0, 0, 0];
    for (let p of this.equipped()) {
      typeCounts[this.index(p.type) - 1]++;
    }
    return typeCounts;
  },
  export() {
    let output = document.getElementById('powers-export-output');
    let parent = output.parentElement;
    parent.style.display = '';
    output.value = this.exportString();
    output.select();
    if (player.options.exportCopy) {
      output.select();
      try {
        document.execCommand('copy');
      } catch(ex) {
        alert('Copying to clipboard failed.');
      }
    }
    if (!player.options.exportShow) {
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
    let presetsWithName = player.powers.presets.filter(x => x.name === importString);
    if (presetsWithName.length > 0) {
      this.importStringFromPreset(presetsWithName[0].powers);
    } else {
      this.importStringFromPreset(importString);
    }
  },
  importStringFromPreset(importString) {
    if (!importString) return;
    let counts = this.importStringCounts(importString);
    let realCounts = [0, 1, 2, 3].map(i => Math.max(0, counts[i] - this.equipped().filter(
      x => x.type === ['normal', 'infinity', 'eternity', 'complexity'][i]).length));
    this.importFromCounts(realCounts);
  },
  importFromCounts(counts) {
    let toEquipByType = [0, 1, 2, 3].map(i => this.getSortedPowerList(['normal', 'infinity', 'eternity', 'complexity'][i], false, false).slice(0, counts[i]));
    let indicesToEquip = [].concat.apply([], toEquipByType).slice(0, this.equippedLimit() - this.equipped().length).map(x => x.index);
    player.powers.equipped = this.equipped().concat(indicesToEquip.map(i => this.stored()[i - 1]));
    player.powers.stored = this.stored().filter((_, i) => !indicesToEquip.includes(1 + i));
    // The second parameter is false here because import already selects the best powers of each type,
    // so there's no need to do any swapping.
    this.onPowerChange(false, false);
  },
  import() {
    this.importString(prompt('Enter your equipped powers (as previously exported):'));
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
  setPresetPowerList(x, equippedPowers) {
    player.powers.presets[x - 1].powers = equippedPowers;
  },
  presetSetToCurrentPowers(x) {
    if (Options.confirmation('presetChange') && !confirm('Are you sure you want to change this power preset?')) {
      return;
    }
    this.setPresetPowerList(x, this.exportString());
    this.redisplayPresetPowerList(x);
  },
  isLastPresetIndex(x) {
    return player.lastPresetIndices[2] === x;
  },
  setLastPresetIndex(x) {
    player.lastPresetIndices[2] = x;
  },
  updateLastPresetIndexFromDeletion(x) {
    if (player.lastPresetIndices[2] === x) {
      player.lastPresetIndices[2] = 0;
    }
    if (player.lastPresetIndices[2] > x) {
      player.lastPresetIndices[2]--;
    }
  },
  updateLastPresetIndexFromSwap(x, y) {
    if (player.lastPresetIndices[2] === x) {
      player.lastPresetIndices[2] = y;
    } else if (player.lastPresetIndices[2] === y) {
      player.lastPresetIndices[2] = x;
    }
  },
  presetClass(x) {
    return (Options.presetHighlightColors() && this.isLastPresetIndex(x)) ? 'softlyhighlighted' : '';
  },
  presetLoad(x) {
    if (this.presetRespec() && !this.respecAndReset()) return;
    this.importStringFromPreset(this.presetPowerList(x));
    this.setLastPresetIndex(x);
  },
  presetMoveUp(x) {
    this.presetSwap(x - 1, x);
  },
  presetMoveDown(x) {
    this.presetSwap(x, x + 1);
  },
  presetSwap(x, y) {
    if (x === y || !([x, y].every(z => this.hasPreset(z) && 1 <= z && z <= 32))) {
      return;
    }
    let temp = player.powers.presets[x - 1];
    player.powers.presets[x - 1] = player.powers.presets[y - 1];
    player.powers.presets[y - 1] = temp;
    this.updateLastPresetIndexFromSwap(x, y);
    this.redisplayPreset(x);
    this.redisplayPreset(y);
  },
  presetDelete(x) {
    if (Options.confirmation('presetDeletion') && !confirm('Are you sure you want to delete this power preset?')) {
      return;
    }
    player.powers.presets = player.powers.presets.slice(0, x - 1).concat(player.powers.presets.slice(x));
    this.updateLastPresetIndexFromDeletion(x);
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
  presetSort() {
    player.powers.presets.sort((a, b) => presetSortFunction(a.name, b.name));
    for (let i = 1; i <= player.powers.presets.length; i++) {
      this.redisplayPreset(i);
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
  },
}

defined.powers = true;
