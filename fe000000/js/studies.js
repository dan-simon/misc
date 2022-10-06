let STUDY_EFFECTS = [
  () => 2,
  () => Decimal.pow(4, Math.pow(Prestige.prestigePower().log2(), 0.5)),
  () => Decimal.pow(2, Math.pow(player.stats.totalStarsProducedThisComplexity.max(1).log2(), 0.5) / 2),
  () => Decimal.pow(2, 16 * Studies.totalTheorems()),
  () => Decimal.pow(2, Math.pow(Boost.bought(), 1.75) / 1024),
  () => Decimal.pow(2, Math.pow(4 * Prestige.prestigePower().log2(), 0.875) / 1024),
  () => Decimal.pow(2, Math.pow(Math.max(0, Decimal.log2(Eternities.amount())), 2) / 4),
  () => Decimal.pow(2, Math.pow(Studies.totalTheorems(), 2) / 16),
  () => Decimal.pow(Boost.multiplierPer(), InfinityChallenge.isInfinityChallengeRunning(7) ? 0.5 : 1),
  () => Decimal.pow(Math.max(1, Math.log2(Prestige.prestigePower().log2())), 3),
  () => Decimal.pow(2, Math.pow(Math.log2(
    1 + player.stats.timeSinceEternity * (1 + EternityStars.amount().max(1).log2() / 1024) / 64), 4 / 3)),
  () => Decimal.pow(Math.max(1, Studies.totalTheorems()), 2),
  x => Decimal.pow(2, 4096 * x),
  x => Decimal.pow(2, x * Math.sqrt(Chroma.totalColorAmount()) / 2),
  x => Decimal.pow(Math.max(Chroma.amount(), 1), x),
  x => 1 + x * Studies.totalTheorems() / 1024,
]

let Study = function (i) {
  if (defined.studies) {
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
    isBuyable(requiredExtra) {
      if (ComplexityChallenge.isSafeguardOn(6)) return false;
      if (i <= 12) {
        return !this.isBought() && Studies.unspentTheorems(requiredExtra) >= this.cost();
      } else {
        return range(1, 12).every(i => Study(i).isBought()) && Studies.unspentTheorems(requiredExtra) >= this.cost();
      }
    },
    cost() {
      if (this.row() === 4) {
        return this.costAtBought(this.timesBought());
      } else {
        return 2 * (1 + this.row() + Studies.boughtThatAreNotOnRow(this.row()));
      }
    },
    displayCost() {
      if (!player.studySettings.studyDisplayCostWhenBought || this.row() === 4 || !this.isBought()) {
        return this.cost();
      } else {
        return 2 * (1 + this.row() + Studies.boughtPreviouslyThatAreNotOnRow(this.row(), i));
      }
    },
    costAtBought(x) {
      if (this.row() !== 4) return;
      return Math.floor(Math.pow(2, x / 2));
    },
    costSoFar() {
      if (this.row() !== 4) return;
      return this.costUpTo(this.timesBought());
    },
    costUpTo(x) {
      if (this.row() !== 4) return;
      if (x > 1e4) {
        return Infinity;
      }
      return [...Array(x)].map((_, i) => this.costAtBought(i)).reduce((a, b) => a + b, 0);
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
        if (ComplexityAchievements.isComplexityAchievementActive(2, 4)) {
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
      return (i === 7 || i === 11) && !ComplexityAchievements.isComplexityAchievementActive(2, 4) &&
        STUDY_EFFECTS[i - 1]().gte(Math.pow(2, {7: 64, 11: 16}[i]));
    },
    cappedText() {
      return this.isCapped() ? 'Capped' : 'Currently';
    },
    buy(requiredExtra) {
      if (this.isBuyable(requiredExtra)) {
        if (this.row() === 4) {
          player.studies[i - 1]++;
        } else {
          player.studies[i - 1] = true;
          player.studySettings.firstTwelveStudyPurchaseOrder.push(i);
        }
        ComplexityChallenge.exitComplexityChallenge(6);
      }
    },
    refundText() {
      return 'Are you sure you want to refund ' + (this.row() === 4 ? 'one purchase of ' : '') +
        'Study ' + i + ' and ' + EternityPrestigeLayer.resetText() + '?';
    },
    refundImpossibleText() {
      return 'Only fourth-row studies, not Study ' + i + ', can be refunded ' +
        'if any fourth-row study is bought.';
    },
    refund() {
      if (!this.isBought()) return;
      if (this.row() !== 4 && Studies.anyFourthRowStudiesBought()) {
        alert(this.refundImpossibleText());
        return;
      }
      if (Options.confirmation('singleStudyRefund') && !confirm(this.refundText())) return;
      if (this.row() === 4) {
        player.studies[i - 1]--;
      } else {
        player.studies[i - 1] = false;
        player.studySettings.firstTwelveStudyPurchaseOrder = player.studySettings.firstTwelveStudyPurchaseOrder.filter(j => j !== i);
      }
      if (EternityPrestigeLayer.canEternity()) {
        EternityPrestigeLayer.eternity(false);
      } else {
        EternityPrestigeLayer.eternityReset(false);
      }
    },
    click() {
      if (Studies.mode() === 'Buy') {
        this.buy();
      } else if (Studies.mode() === 'Refund') {
        this.refund();
      }
    },
    className() {
      let infix = ['normal', 'infinity', 'eternity', 'chroma'][this.row() - 1];
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
    return this.boughtTheorems() + this.extraTheorems();
  },
  boughtTheoremsList() {
    return player.boughtTheorems;
  },
  boughtTheorems() {
    return this.boughtTheoremsList().reduce((a, b) => a + b);
  },
  extraTheoremsList() {
    if (ComplexityAchievements.isComplexityAchievementActive(4, 4)) {
      return player.extraTheorems;
    } else {
      return this.extraTheoremsByType();
    }
  },
  extraTheorems() {
    return this.extraTheoremsList().reduce((a, b) => a + b);
  },
  extraTheoremsByType() {
    return [Boost.extraTheoremsRaw(), EternityChallenge.extraTheoremsRaw(), Chroma.extraTheoremsRaw(), ComplexityChallenge.extraTheoremsRaw()];
  },
  updateExtraTheorems() {
    if (ComplexityAchievements.isComplexityAchievementActive(4, 4)) {
      let extraTheoremsByType = this.extraTheoremsByType();
      for (let i = 0; i < 4; i++) {
        player.extraTheorems[i] = Math.max(player.extraTheorems[i], extraTheoremsByType[i]);
      }
    }
  },
  extraTheoremsBreakdownText() {
    let extraTheoremsList = this.extraTheoremsList();
    let extraTheorems = this.extraTheorems();
    let conditions = [
      Boost.isBestBoostPowerVisible() || PrestigeLayerProgress.hasReached('complexity'), EternityChallenge.areEternityChallengesVisible(),
      Chroma.isColorUnlocked(5) || PrestigeLayerProgress.hasReached('complexity'), PrestigeLayerProgress.hasReached('complexity')
    ];
    let sources = [
      'boost power (see Main tab)', 'EC completions', 'green chroma', 'ℂC6'
    ];
    // If the player hasn't reached eternity yet but has boost power and has all tabs shown,
    // seeing Main tab won't help. So we say something else.
    if (!PrestigeLayerProgress.hasReached('eternity')) {
      sources[0] = 'boost power (after eternity, you\'ll get theorems from boost power)';
    }
    let conditionsCount = conditions.filter(x => x).length;
    if (conditionsCount === 0) {
      return formatInt(extraTheorems) + ' (progress further to unlock ways to get extra theorems)';
    } else if (conditionsCount === 1) {
      return formatInt(extraTheorems) + ' (from ' + sources[conditions.indexOf(true)] + ')';
    } else {
      return [0, 1, 2, 3].filter(i => conditions[i]).map(
        i => formatInt(extraTheoremsList[i]) + ' (from ' + sources[i] + ')'
      ).join(' + ') + ' = ' + formatInt(extraTheorems);
    }
  },
  unspentTheorems(extraSpentOnEC) {
    return this.totalTheorems() - this.spentTheorems(extraSpentOnEC);
  },
  studiesCost(studies) {
    // This function is a mess that hopefully both works and is decently quick.
    let rowCounts = [0, 1, 2].map(x => [4 * x + 1, 4 * x + 2, 4 * x + 3, 4 * x + 4].filter(y => studies[y - 1]).length);
    let firstThreeRowsInitial = rowCounts.map((x, i) => x * (2 * i + 4)).reduce((a, b) => a + b);
    let firstThreeRowsExtra = 2 * (rowCounts[0] * rowCounts[1] + rowCounts[0] * rowCounts[2] + rowCounts[1] * rowCounts[2]);
    let fourthRow = studies.slice(12).map(x => [...Array(x)].map((_, y) => Math.floor(Math.pow(2, y / 2))).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b);
    return firstThreeRowsInitial + firstThreeRowsExtra + fourthRow;
  },
  spentOnStudiesTheorems() {
    return this.studiesCost(player.studies);
  },
  spentTheorems(extraSpentOnEC) {
    let eternityChallengeCost = EternityChallenge.getUnlockedEternityChallengeCost();
    if (extraSpentOnEC !== undefined) {
      eternityChallengeCost = Math.max(extraSpentOnEC, eternityChallengeCost);
    }
    return this.spentOnStudiesTheorems() + eternityChallengeCost;
  },
  isRespecOn() {
    return player.studySettings.respecStudies;
  },
  toggleRespec() {
    player.studySettings.respecStudies = !player.studySettings.respecStudies;
  },
  presetRespec() {
    return globalShiftDown !== player.studySettings.presetRespecStudies;
  },
  togglePresetRespec() {
    player.studySettings.presetRespecStudies = !player.studySettings.presetRespecStudies;
  },
  respec() {
    if (ComplexityAchievements.isComplexityAchievementActive(4, 4) && !Studies.areStudiesInitialStudies()) {
      Studies.setStudiesBeforeLastRespec();
    }
    for (let i = 0; i < 12; i++) {
      player.studies[i] = false;
    }
    player.studySettings.firstTwelveStudyPurchaseOrder = [];
    this.setLastPresetIndex(0);
    this.respecFourthRow();
  },
  setStudiesBeforeLastRespec() {
    player.studySettings.studiesBeforeLastRespec = [...player.studies];
    player.studySettings.firstTwelveStudyPurchaseOrderBeforeLastRespec = [...player.studySettings.firstTwelveStudyPurchaseOrder];
  },
  respecFourthRow() {
    for (let i = 12; i < 16; i++) {
      player.studies[i] = 0;
    }
  },
  maybeRespec() {
    if (this.isRespecOn()) {
      this.respec();
    }
    player.studySettings.respecStudies = false;
  },
  canRespec() {
    // This checks if the player has any studies (pre-fourth-row or fourth-row).
    return player.studies.some(x => x);
  },
  respecAndReset() {
    // We return true because if we can't respec, it's because respec does nothing.
    if (!this.canRespec()) {
      return true;
    }
    if (Options.confirmation('studiesRespec') && !confirm(
      'Are you sure you want to respec your studies and ' +
      EternityPrestigeLayer.resetText() + '?')) return false;
    this.respec();
    if (EternityPrestigeLayer.canEternity()) {
      EternityPrestigeLayer.eternity(false);
    } else {
      EternityPrestigeLayer.eternityReset(false);
    }
    return true;
  },
  canRespecFourthRow() {
    // This checks if the player has any fourth-row studies.
    return player.studies.slice(12).some(x => x);
  },
  respecFourthRowAndReset() {
    // We return true because if we can't respec, it's because respec does nothing.
    if (!this.canRespecFourthRow()) {
      return true;
    }
    if (Options.confirmation('studiesRespec') && !confirm(
      'Are you sure you want to respec your fourth-row studies and ' +
      EternityPrestigeLayer.resetText() + '?')) return false;
    this.respecFourthRow();
    if (EternityPrestigeLayer.canEternity()) {
      EternityPrestigeLayer.eternity(false);
    } else {
      EternityPrestigeLayer.eternityReset(false);
    }
    return true;
  },
  boughtThatAreNotOnRow(x) {
    return this.list.slice(0, 12).filter(y => y.isBought() && y.row() !== x).length;
  },
  boughtPreviouslyThatAreNotOnRow(x, z) {
    let order = player.studySettings.firstTwelveStudyPurchaseOrder;
    return order.slice(0, order.indexOf(z)).filter(y => Study(y).row() !== x).length;
  },
  exportString() {
    let extraList = [13, 14, 15, 16].map(x => Study(x).timesBought());
    let extraString = extraList.some(x => x !== 0) ? '&s' + extraList.join(',') : '';
    let unlockedEternityChallenge = EternityChallenge.getUnlockedEternityChallenge();
    let currentEternityChallenge = EternityChallenge.currentEternityChallenge();
    let eternityChallengeString = '';
    if (currentEternityChallenge !== 0) {
      eternityChallengeString = '|c' + currentEternityChallenge + '!!';
    } else if (unlockedEternityChallenge !== 0) {
      eternityChallengeString = '|c' + unlockedEternityChallenge + '!';
    }
    return (player.studySettings.firstTwelveStudyPurchaseOrder.join(',') || 'none') + extraString + eternityChallengeString;
  },
  export() {
    let output = document.getElementById('study-export-output');
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
      document.getElementsByClassName('studies-export-button')[0].focus();
    }
  },
  toNumber(x) {
    let result = Math.max(0, Math.floor(+x));
    return Number.isFinite(result) ? result : 0;
  },
  // We're just doing this separate id-to-string function in this file, because here we also need it for costs.
  presetIdToPresetString(id) {
    let presetsWithName = player.presets.filter(x => x.name === id);
    if (presetsWithName.length > 0) {
      return presetsWithName[0].studies;
    } else {
      return id
    }
  },
  importString(importString) {
    this.importStringFromPreset(this.presetIdToPresetString(importString));
  },
  getUnspentEternityChallenge(x) {
    // Note: x can be null.
    if (x === null || x[0] !== 'c') {
      return 0;
    }
    let ec = this.toNumber(x.slice(1));
    if (ec < 1 || ec > 8) {
      return 0;
    }
    return ec;
  },
  getUnspent(x) {
    // Note: x can be null.
    if (x === null) {
      return 0;
    }
    if (x[0] === 'u') {
      return this.toNumber(x.slice(1));
    } else if (x[0] === 'c') {
      return EternityChallenge.getEternityChallengeCost(this.getUnspentEternityChallenge(x));
    } else {
      return 0;
    }
  },
  splitImportString(importString) {
    let exclamations = [...importString].filter(i => i === '!').length;
    importString = importString.replace(/!/g, '');
    let parts = importString.split(/[&|]/g);
    let conj = importString.match(/[&|]/g) || [];
    return [
      parts[0],
      (conj.includes('&') ? parts[conj.indexOf('&') + 1] : null),
      (conj.includes('|') ? parts[conj.indexOf('|') + 1] : null),
      exclamations
    ];
  },
  importStringFromPreset(importString) {
    if (!importString) return;
    let split = this.splitImportString(importString);
    let mainPart = split[0];
    let fourthRowPart = split[1];
    let eternityChallengePart = split[2];
    let exclamations = split[3];
    let unspent = this.getUnspent(eternityChallengePart);
    let presetEternityChallenge = this.getUnspentEternityChallenge(eternityChallengePart);
    if (presetEternityChallenge !== 0) {
      if (exclamations >= 1 && EternityChallenge.canEternityChallengeBeUnlocked(presetEternityChallenge)) {
        EternityChallenge.unlockEternityChallenge(presetEternityChallenge);
      }
      if (exclamations >= 2 && EternityChallenge.canEternityChallengeBeStarted(presetEternityChallenge)) {
        EternityChallenge.startEternityChallenge(presetEternityChallenge);
      }
    }
    // You can put any study id between 1 and 16 in the initial part of the import list; this is intended.
    // Also, none should be handled as buying no studies based on current code even without a special case,
    // but best to not rely on that.
    if (mainPart !== null && mainPart !== 'none') {
      for (let i of mainPart.split(',').map(x => this.toNumber(x)).filter(x => 1 <= x && x <= 16)) {
        Study(i).buy(unspent);
      }
    }
    if (fourthRowPart !== null) {
      let startsWithS = fourthRowPart[0] === 's';
      if (startsWithS) {
        fourthRowPart = fourthRowPart.slice(1);
      }
      let counts = fourthRowPart.split(',').map(x => this.toNumber(x));
      if (startsWithS) {
        let costs = counts.map((x, j) => Study(13 + j).costUpTo(x));
        let studies = [0, 1, 2, 3].map(j => ({'study': Study(13 + j), 'cost': costs[j]}));
        let f = x => x.cost / x.study.costSoFar() || 0;
        while (studies.some(x => x.study.isBuyable(unspent) && x.cost > 0)) {
          [...studies.filter(x => x.study.isBuyable(unspent) && x.cost > 0)].sort((a, b) => f(b) - f(a))[0].study.buy(unspent);
        }
      } else {
        for (let j = 0; j < 4; j++) {
          let times = counts[j] - Study(13 + j).timesBought();
          for (let k = 0; k < times; k++) {
            Study(13 + j).buy(unspent);
          }
        }
      }
    }
  },
  studyListCostText(importString) {
    if (!importString) return formatInt(0);
    let split = this.splitImportString(importString);
    let mainPart = split[0];
    let fourthRowPart = split[1];
    let eternityChallengePart = split[2];
    let unspent = this.getUnspent(eternityChallengePart);
    let eternityChallenge = this.getUnspentEternityChallenge(eternityChallengePart)
    let eternityChallengeText = (eternityChallenge !== 0) ? ' for EC' + eternityChallenge : '';
    let atLeast = fourthRowPart !== null && fourthRowPart[0] === 's';
    let studies = initialStudies();
    for (let i of mainPart.split(',').map(x => this.toNumber(x)).filter(x => 1 <= x && x <= 16)) {
      if (i <= 12) {
        studies[i - 1] = true;
      } else {
        studies[i - 1]++;
      }
    }
    if (fourthRowPart !== null && !atLeast) {
      let counts = fourthRowPart.split(',').map(x => this.toNumber(x));
      for (let j = 0; j < 4; j++) {
        studies[12 + j] += counts[j];
      }
    }
    let cost = this.studiesCost(studies);
    let atLeastText = atLeast ? 'at least ' : '';
    if (unspent > 0) {
      return atLeastText + formatInt(cost) + ' (studies) + ' + formatInt(unspent) +
      ' (required unspent' + eternityChallengeText + ') = ' + formatInt(cost + unspent) + '.';
    } else {
      return atLeastText + formatInt(cost);
    }
  },
  presetCostText(x) {
    return this.studyListCostText(this.presetStudyList(x));
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
  couldEverAccessFourthRow() {
    // Technically, you could reach complexity without adding a fourth row,
    // but then you deserve to hear about it.
    return this.canAccessFourthRow() || PrestigeLayerProgress.hasReached('complexity');
  },
  anyFourthRowStudiesBought() {
    return [13, 14, 15, 16].some(i => Study(i).isBought());
  },
  chromaCapMultiplier() {
    return 1 + [13, 14, 15, 16].map(i => Study(i).timesBought()).reduce((a, b) => a + b) / 1024;
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
  canSeeTab() {
    // This is only used to determine if the player can buy theorems,
    // and for that purpose it works as intended in replay mode
    // (you can't buy theorems before reaching eternity).
    return PrestigeLayerProgress.hasReached('eternity');
  },
  canBuy(x) {
    return player[['stars', 'infinityPoints', 'eternityPoints'][x]].gte(this.cost(x)) &&
      this.canSeeTab() && this.canBuyGenerally() && (x !== 2 || EternityGenerator(1).bought() > 0);
  },
  getStat(x) {
    return player[['stars', 'infinityPoints', 'eternityPoints'][x]];
  },
  setStat(x, y) {
    player[['stars', 'infinityPoints', 'eternityPoints'][x]] = y;
  },
  buy(x) {
    if (this.canBuy(x)) {
      this.setStat(x, this.getStat(x).safeMinus(this.cost(x)));
      player.boughtTheorems[x] += 1;
      player.studySettings.boughtTheoremsThisComplexity = true;
    }
  },
  buyMax(x) {
    while (this.canBuy(x)) {
      this.setStat(x, this.getStat(x).safeMinus(this.cost(x)));
      player.boughtTheorems[x] += 1;
      player.studySettings.boughtTheoremsThisComplexity = true;
    }
  },
  canMaxFourthRowStudies() {
    return [13, 14, 15, 16].some(x => Study(x).isBuyable());
  },
  maxFourthRowStudies() {
    // Yes, we are calling import.
    this.importString('&s1,1,1,1');
  },
  mode() {
    return globalShiftDown ? this.otherMode(player.studySettings.studyMode) : player.studySettings.studyMode;
  },
  otherMode(x) {
    return ['Buy', 'Refund'][(['Buy', 'Refund'].indexOf(x) + 1) % 2]
  },
  changeMode() {
    player.studySettings.studyMode = this.otherMode(player.studySettings.studyMode);
  },
  costDisplayMode() {
    return player.studySettings.studyDisplayCostWhenBought ? 'Cost when study was bought' : 'Cost if study were most recent bought';
  },
  changeCostDisplayMode() {
    player.studySettings.studyDisplayCostWhenBought = !player.studySettings.studyDisplayCostWhenBought
  },
  rebuyAfterComplexityChallenge6() {
    return player.studySettings.rebuyAfterComplexityChallenge6;
  },
  toggleRebuyAfterComplexityChallenge6() {
    player.studySettings.rebuyAfterComplexityChallenge6 = !player.studySettings.rebuyAfterComplexityChallenge6;
  },
  showPresetExplanation() {
    return player.studySettings.showPresetExplanation;
  },
  toggleShowPresetExplanation() {
    player.studySettings.showPresetExplanation = !player.studySettings.showPresetExplanation;
  },
  areStudiesInitialStudies() {
    return player.studies.join(',') === initialStudies().join(',');
  },
  canBuyGenerally() {
    return player.studySettings.canBuyStudies;
  },
  toggleCanBuyGenerally() {
    player.studySettings.canBuyStudies = !player.studySettings.canBuyStudies;
  },
  boughtTheoremsThisComplexity() {
    return player.studySettings.boughtTheoremsThisComplexity;
  },
  isAutoLoadUnlocked() {
    return FinalityMilestones.isFinalityMilestoneActive(6);
  },
  isAutoLoadActive() {
    return this.isAutoLoadUnlocked() && this.isAutoLoadOn();
  },
  autoLoadStudyList() {
    if (!this.isAutoLoadActive()) return;
    this.importString(this.studyListToAutoLoad());
  },
  studyListToAutoLoad() {
    return player.studyListAutoLoad.studyList;
  },
  setStudyListToAutoLoad(x) {
    player.studyListAutoLoad.studyList = x;
  },
  isAutoLoadOn() {
    return player.studyListAutoLoad.on;
  },
  toggleAutoLoad() {
    player.studyListAutoLoad.on = !player.studyListAutoLoad.on;
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
    if (Options.confirmation('presetChange') && !confirm('Are you sure you want to change this study preset?')) {
      return;
    }
    this.setPresetStudyList(x, this.exportString());
    this.redisplayPresetStudyList(x);
  },
  isLastPresetIndex(x) {
    return player.lastPresetIndices[1] === x;
  },
  setLastPresetIndex(x) {
    player.lastPresetIndices[1] = x;
  },
  updateLastPresetIndexFromDeletion(x) {
    if (player.lastPresetIndices[1] === x) {
      player.lastPresetIndices[1] = 0;
    }
    if (player.lastPresetIndices[1] > x) {
      player.lastPresetIndices[1]--;
    }
  },
  updateLastPresetIndexFromSwap(x, y) {
    if (player.lastPresetIndices[1] === x) {
      player.lastPresetIndices[1] = y;
    } else if (player.lastPresetIndices[1] === y) {
      player.lastPresetIndices[1] = x;
    }
  },
  presetClass(x) {
    return (Options.presetHighlightColors() && this.isLastPresetIndex(x)) ? 'softlyhighlighted' : '';
  },
  presetLoad(x) {
    if (this.presetRespec() && !this.respecAndReset()) return;
    this.importStringFromPreset(this.presetStudyList(x));
    this.setLastPresetIndex(x);
  },
  presetMoveUp(x) {
    this.presetSwap(x - 1, x);
  },
  presetMoveDown(x) {
    this.presetSwap(x, x + 1);
  },
  presetSwap(x, y) {
    if (x === y || !([x, y].every(z => this.hasPreset(z) && 1 <= z && z <= 64))) {
      return;
    }
    let temp = player.presets[x - 1];
    player.presets[x - 1] = player.presets[y - 1];
    player.presets[y - 1] = temp;
    this.updateLastPresetIndexFromSwap(x, y);
    this.redisplayPreset(x);
    this.redisplayPreset(y);
  },
  presetDelete(x) {
    if (Options.confirmation('presetDeletion') && !confirm('Are you sure you want to delete this study preset?')) {
      return;
    }
    player.presets = player.presets.slice(0, x - 1).concat(player.presets.slice(x));
    this.updateLastPresetIndexFromDeletion(x);
    for (let i = x; i <= player.presets.length; i++) {
      this.redisplayPreset(i);
    }
  },
  presetCreate() {
    if (!this.hasPreset(64)) {
      player.presets.push({'name': 'Untitled', 'studies': this.exportString()});
      this.redisplayPreset(player.presets.length);
    }
  },
  presetSort() {
    player.presets.sort((a, b) => presetSortFunction(a.name, b.name));
    for (let i = 1; i <= player.presets.length; i++) {
      this.redisplayPreset(i);
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

defined.studies = true;
