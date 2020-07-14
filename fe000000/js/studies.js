let STUDY_EFFECTS = [
  () => 2,
  () => Decimal.pow(4, Math.pow(Prestige.prestigePower().log2(), 0.5)),
  () => Decimal.pow(2, Math.pow(player.stats.totalStarsProducedThisComplexity.log2(), 0.5) / 2),
  () => Decimal.pow(2, 16 * Studies.totalTheorems()),
  () => Decimal.pow(2, Math.pow(Boost.bought(), 1.75) / 1024),
  () => Decimal.pow(2, Math.pow(4 * Prestige.prestigePower().log2(), 0.875) / 1024),
  () => Decimal.pow(2, Math.pow(Math.max(0, Decimal.log2(Eternities.amount())), 2) / 4),
  () => Decimal.pow(2, Math.pow(Studies.totalTheorems(), 2) / 16),
  () => Decimal.pow(Boost.multiplierPer(), InfinityChallenge.isInfinityChallengeRunning(7) ? 0.5 : 1),
  () => Decimal.pow(Math.max(1, Math.log2(Prestige.prestigePower().log2())), 3),
  () => Decimal.pow(2, Math.pow(Math.log2(
    1 + player.stats.timeSinceEternity * (1 + EternityStars.amount().max(1).log2() / 1024) / 64), 4 / 3)),
  () => Decimal.pow(Studies.totalTheorems(), 2),
  x => Decimal.pow(2, 4096 * x),
  x => Decimal.pow(2, x * Math.sqrt(Chroma.totalColorAmount()) / 2),
  x => Decimal.pow(Math.max(Chroma.amount(), 1), x),
  x => 1 + x * Studies.totalTheorems() / 1024,
]

let Study = function (i) {
  if ('Studies' in window) {
    return Studies.get(i);
  }
  return {
    isBought() {
      // Works even for the rebuyable studies.
      return player.studies[i - 1];
    },
    timesBought() {
      return player.studies[i - 1];
    },
    isBuyable() {
      if (ComplexityChallenge.isSafeguardOn(6)) return false;
      if (i <= 12) {
        return !this.isBought() && Studies.unspentTheorems() >= this.cost();
      } else {
        return Studies.list.slice(0, 12).every(i => i.isBought()) && Studies.unspentTheorems() >= this.cost();
      }
    },
    cost() {
      if (this.row() === 4) {
        return Math.floor(Math.pow(2, this.timesBought() / 2));
      } else {
        return 2 * (1 + this.row() + Studies.boughtThatAreNotOnRow(this.row()));
      }
    },
    row() {
      return Math.floor((i + 3) / 4);
    },
    rawEffect() {
      let effect;
      if (this.row() === 4) {
        effect = STUDY_EFFECTS[i - 1](this.timesBought());
      } else {
        effect = STUDY_EFFECTS[i - 1]();
      }
      if (i === 7 || i === 11) {
        if (ComplexityAchievements.hasComplexityAchievement(2, 4)) {
          effect = effect.pow(ComplexityAchievements.effect(2, 4));
        } else {
          effect = effect.min(Math.pow(2, {7: 64, 11: 16}[i]));
        }
      }
      if (this.row() === 3) {
        effect = Decimal.pow(effect, PermanenceUpgrade(3).effect());
      }
      if (this.row() === 4) {
        effect = Decimal.pow(effect, ComplexityAchievements.effect(1, 4));
      }
      return effect;
    },
    rawTotalEffect() {
      // This only exists for display of the Study 1 effect.
      return (i === 1) ? Decimal.pow(this.rawEffect(), Boost.bought()) : this.rawEffect();
    },
    effect() {
      // Most but not all studies have Decimal effect, but
      // in some cases (extra boost mult, chroma buildup mult)
      // the effect has to be a number, and it never has to be
      // a Decimal. So we use 1 as the default value. Note that
      // this works fine for the fourth-row studies even though
      // they're rebuyable.
      return this.isBought() ? this.rawEffect() : 1;
    },
    nextEffect() {
      // This should only ever be called on fourth-row studies.
      // However, it's coded as it is just to be safe.
      let effect = STUDY_EFFECTS[i - 1](this.timesBought() + 1);
      if (this.row() === 4) {
        effect = Decimal.pow(effect, ComplexityAchievements.effect(1, 4));
      }
      return effect;
    },
    isCapped() {
      // Note that if a third study gets capped this won't handle it.
      // Note also that we use STUDY_EFFECTS[i - 1]() directly since the raw effect of study 11
      // is modified by an upgrade that boosts third-row studies.
      return (i === 7 || i === 11) && !ComplexityAchievements.hasComplexityAchievement(2, 4) &&
        STUDY_EFFECTS[i - 1]().gte(Math.pow(2, {7: 64, 11: 16}[i]));
    },
    cappedText() {
      return this.isCapped() ? 'Capped' : 'Currently';
    },
    buy() {
      if (this.isBuyable()) {
        if (this.row() === 4) {
          player.studies[i - 1]++;
        } else {
          player.studies[i - 1] = true;
        }
        ComplexityChallenge.exitComplexityChallenge(6);
      }
    },
    className() {
      let infix = ['normal', 'infinity', 'time', 'chroma'][this.row() - 1];
      // For the rebuyable studies this order is very important.
      let suffix =  this.isBuyable() ? 'buyable' : (this.isBought() ? 'bought' : 'unbuyable');
      return 'study' + infix + suffix;
    }
  }
}

let Studies = {
  list: [...Array(16)].map((_, i) => Study(i + 1)),
  get: function (x) {
    return this.list[x - 1];
  },
  totalTheorems() {
    return player.boughtTheorems.reduce((a, b) => a + b) + this.extraTheorems();
  },
  extraTheorems() {
    if (ComplexityAchievements.hasComplexityAchievement(4, 4)) {
      return player.extraTheorems.reduce((a, b) => a + b);
    } else {
      return this.extraTheoremsByType().reduce((a, b) => a + b);
    }
  },
  extraTheoremsByType() {
    return [Boost.extraTheoremsRaw(), EternityChallenge.extraTheoremsRaw(), Chroma.extraTheoremsRaw(), ComplexityChallenge.extraTheoremsRaw()];
  },
  updateExtraTheorems() {
    if (ComplexityAchievements.hasComplexityAchievement(4, 4)) {
      let extraTheoremsByType = this.extraTheoremsByType();
      for (let i = 0; i < 4; i++) {
        player.extraTheorems[i] = Math.max(player.extraTheorems[i], extraTheoremsByType[i]);
      }
    }
  },
  unspentTheorems() {
    return this.totalTheorems() - this.spentTheorems();
  },
  spentTheorems() {
    /// This function is a mess that hopefully both works and is decently quick.
    let rowCounts = [0, 1, 2].map(x => this.list.slice(4 * x, 4 * (x + 1)).filter(y => y.isBought()).length);
    let firstThreeRowsInitial = rowCounts.map((x, i) => x * (2 * i + 4)).reduce((a, b) => a + b);
    let firstThreeRowsExtra = 2 * (rowCounts[0] * rowCounts[1] + rowCounts[0] * rowCounts[2] + rowCounts[1] * rowCounts[2]);
    let fourthRow = this.list.slice(12).map(x => [...Array(x.timesBought())].map((_, y) => Math.floor(Math.pow(2, y / 2))).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b);
    let cc = EternityChallenge.getUnlockedEternityChallenge();
    let eternityChallenge = cc === 0 ? 0 : EternityChallenge.getEternityChallengeCost(cc);
    return firstThreeRowsInitial + firstThreeRowsExtra + fourthRow + eternityChallenge;
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
    for (let i = 12; i < 16; i++) {
      player.studies[i] = 0;
    }
  },
  maybeRespec() {
    if (this.isRespecOn()) {
      this.respec();
    }
    player.respecStudies = false;
  },
  respecAndReset() {
    this.respec();
    if (EternityPrestigeLayer.canEternity()) {
      EternityPrestigeLayer.eternity();
    } else {
      EternityPrestigeLayer.eternityReset();
    }
  },
  boughtThatAreNotOnRow(x) {
    return this.list.slice(0, 12).filter(y => y.isBought() && y.row() !== x).length;
  },
  tryToBuyFirstTwelve() {
    for (let study of this.list.slice(0, 12)) {
      study.buy();
    }
  },
  exportString() {
    let extraList = [13, 14, 15, 16].map(x => Study(x).timesBought());
    let extraString = extraList.some(x => x !== 0) ? '&' + extraList.join(',') : '';
    return ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter(x => Study(x).isBought()).join(',') || 'none') + extraString;
  },
  export() {
    let output = document.getElementById('study-export-output');
    let parent = output.parentElement;
    parent.style.display = "";
    output.value = this.exportString();
    output.focus();
    output.select();
    try {
      document.execCommand('copy');
    } catch(ex) {
      alert('Copying to clipboard failed.');
    }
  },
  toNumber(x) {
    let result = Math.max(0, Math.floor(+x));
    return Number.isFinite(result) ? result : 0;
  },
  importString(importString) {
    let parts = importString.split('&');
    // You can put any study id between 1 and 16 in the initial part of the import list; this is intended.
    // Also, none should be handled as buying no studies based on current code even without a special case,
    // but best to not rely on that.
    if (parts[0] !== 'none') {
      for (let i of parts[0].split(',').map(x => this.toNumber(x)).filter(x => 1 <= x && x <= 16)) {
        Study(i).buy();
      }
    }
    if (parts.length > 1) {
      for (let j = 0; j < 4; j++) {
        let times = this.toNumber(parts[1].split(',')[j]) - Study(13 + j).timesBought();
        for (let k = 0; k < times; k++) {
          Study(13 + j).buy();
        }
      }
    }
  },
  import() {
    this.importString(prompt('Enter your studies (as previously exported):'));
  },
  totalStudyCost() {
    return 168;
  },
  canAccessFourthRow() {
    return this.totalTheorems() >= this.totalStudyCost();
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
      player.boughtTheoremsThisComplexity = true;
    }
  },
  buyMax(x) {
    while (this.canBuy(x)) {
      this.setStat(x, this.getStat(x).minus(this.cost(x)));
      player.boughtTheorems[x] += 1;
      player.boughtTheoremsThisComplexity = true;
    }
  },
  boughtTheoremsThisComplexity() {
    return player.boughtTheoremsThisComplexity;
  },
  hasPreset(x) {
    return player.presets.length >= x;
  },
  presetName(x) {
    if (!this.hasPreset(x)) return 'Untitled';
    return player.presets[x - 1].name;
  },
  presetStudyList(x) {
    if (!this.hasPreset(x)) return '';
    return player.presets[x - 1].studies;
  },
  setPresetName(x, name) {
    player.presets[x - 1].name = name;
  },
  setPresetStudyList(x, studyList) {
    player.presets[x - 1].studies = studyList;
  },
  presetSetToCurrentStudies(x) {
    this.setPresetStudyList(x, this.exportString());
    this.redisplayPresetStudyList(x);
  },
  presetLoad(x) {
    this.importString(this.presetStudyList(x));
  },
  presetDelete(x) {
    player.presets = player.presets.slice(0, x - 1).concat(player.presets.slice(x));
    for (let i = x; i <= player.presets.length; i++) {
      this.redisplayPreset(i);
    }
  },
  presetCreate() {
    if (!this.hasPreset(32)) {
      player.presets.push({'name': 'Untitled', 'studies': this.exportString()});
      this.redisplayPreset(player.presets.length);
    }
  },
  redisplayPreset(x) {
    this.redisplayPresetName(x);
    this.redisplayPresetStudyList(x);
  },
  redisplayPresetName(x) {
    document.getElementsByClassName('presetname' + x)[0].value = this.presetName(x);
  },
  redisplayPresetStudyList(x) {
    document.getElementsByClassName('presetstudylist' + x)[0].value = this.presetStudyList(x);
  }
}
