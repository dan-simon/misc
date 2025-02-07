let Chroma = {
  colors: [null, 'grey', 'purple', 'orange', 'cyan', 'green', 'red'],
  colorCosts: [
    null,
    Decimal.pow(2, 4096),
    Decimal.pow(2, 8192),
    Decimal.pow(2, 12288),
    Decimal.pow(2, Math.pow(2, 14)),
    Decimal.pow(2, Math.pow(2, 15)),
    Decimal.pow(2, Math.pow(2, 17)),
  ],
  // The third color formula has a special case for x < 256 so that having more EP
  // doesn't hurt for sufficiently small x (due to the power of Math.log2(x / 256) / 4 being negative).
  colorEffectFormulas: [
    null,
    x => Math.pow(1 + x / 1024, 2.5),
    x => Decimal.pow(1 + x / 64, 0.5),
    x => Decimal.pow((x >= 256) ? Math.max(EternityPoints.totalEPProducedThisComplexity().log2() / 4096, 1) : 2,
      Math.log2(x / 256) / 4).div(2).plus(1),
    x => Decimal.pow(EternityGenerator(8).amount().max(1), 2 * Math.sqrt(x)),
    x => Math.floor(Math.pow(16 * Math.log2(1 + x / 4096), ComplexityAchievements.effect(3, 4))),
    x => 1 + 3 * Math.pow(Math.log2(x / Math.pow(2, 18) + 1) * Eternities.totalEternitiesProducedThisComplexity().div(Math.pow(2, 54)).plus(1).log2(), 0.75) / 32
  ],
  amount() {
    if (!this.isUnlocked()) {
      return 0;
    }
    if (this.isFast()) {
      return this.cap();
    }
    let t = player.stats.timeSinceEternity * this.chromaSpeedMultiplier().toNumber();
    let cap = this.cap();
    return cap * (-Math.expm1(-2 * t / cap));
  },
  displayAmount() {
    return player.chroma.displayAmount;
  },
  cap() {
    let factors = [
      Math.max(EternityPoints.totalEPProducedThisComplexity().log2(), 1),
      Studies.chromaCapMultiplier(), ComplexityChallenge.getComplexityChallengeReward(4),
      ComplexityAchievements.effect(4, 3), FinalityShardUpgrade(5).effect()
    ];
    return Math.safePow(factors.reduce((a, b) => a * b), Galaxy.effect());
  },
  chromaSpeedMultiplier() {
    let factors = [
      this.effectOfColor(3), Achievements.otherMultiplier(), EternityChallenge.getTotalCompletionsRewardEffect(4),
      Study(16).effect(), Complexities.chromaMultiplier(), ComplexityAchievements.effect(2, 3),
      FinalityShardUpgrade(4).effect()
    ];
    return factors.reduce((a, b) => a.times(b));
  },
  slowdown() {
    return this.cap() / (this.cap() - this.amount());
  },
  totalSpeed() {
    return this.chromaSpeedMultiplier().div(this.slowdown());
  },
  perSecond() {
    return this.totalSpeed().times(2);
  },
  extraTheoremsRaw() {
    return this.effectOfColor(5);
  },
  extraTheoremsIndex() {
    return 2;
  },
  extraTheoremsActualAndDisplay() {
    if (ComplexityAchievements.isComplexityAchievementActive(4, 4)) {
      return player.extraTheorems[this.extraTheoremsIndex()];
    } else {
      return this.extraTheoremsRaw();
    }
  },
  effectOfColor(x) {
    let effect = this.colorEffectFormulas[x](this.colorAmount(x));
    if (x === 2 || x === 3) {
      effect = Decimal.pow(effect, ComplexityAchievements.effect(3, 1));
    }
    return effect;
  },
  colorAmount(x) {
    return player.chroma.colors[x - 1];
  },
  totalColorAmount() {
    return player.chroma.colors.reduce((a, b) => a + b);
  },
  setColorAmount(x, value) {
    player.chroma.colors[x - 1] = value;
  },
  isColorUnlocked(x) {
    return player.chroma.unlocked[x - 1];
  },
  isUnlocked() {
    return this.isColorUnlocked(1);
  },
  updateColors() {
    let chromaAmount = this.amount();
    player.chroma.displayAmount = chromaAmount;
    if (this.producingAll()) {
      for (let color = 1; color <= 6; color++) {
        if (this.isColorUnlocked(color)) {
          this.setColorAmount(color, Math.max(this.colorAmount(color), chromaAmount));
        }
      }
     } else {
      let color = player.chroma.current;
      if (color === 0) return;
      this.setColorAmount(color, Math.max(this.colorAmount(color), chromaAmount));
    }
  },
  hasOptions() {
    return ComplexityAchievements.isComplexityAchievementActive(1, 1);
  },
  setNextColor(x) {
    if (this.isColorUnlocked(x)) {
      player.chroma.next = x;
    }
  },
  getUnlockColorCost(x) {
    return this.colorCosts[x];
  },
  canSeeThatColorExists(x) {
    // This might be a slight misnomer if we allow red to be seen in the view-everything mode,
    // but that's fine. Red can probably be set up to show up ui-wise but not be unlockable.
    return x !== 6 || ComplexityAchievements.isAchievementsUnlockedRewardActive(3);
  },
  canUnlockColor(x) {
    // You can't unlock any colors but the first without unlocking the first (that is, unlocking chroma) first.
    // Also, the Complexity Challenge 4 safeguard prevents any colors from being unlocked.
    return !this.isColorUnlocked(x) && player.eternityPoints.gte(this.getUnlockColorCost(x)) &&
      !ComplexityChallenge.isSafeguardOn(4) && (x === 1 || this.isUnlocked()) &&
      this.canSeeThatColorExists(x);
  },
  unlockColor(x, auto) {
    if (!this.canUnlockColor(x) || (
      auto && player.eternityPoints.minus(this.getUnlockColorCost(x)).lt(2) && EternityGenerator(1).bought() === 0)) return;
    player.eternityPoints = player.eternityPoints.safeMinus(this.getUnlockColorCost(x));
    player.chroma.unlocked[x - 1] = true;
    let freeSwitch = this.hasOptions() && this.startProducingWhenUnlocked();
    if (player.chroma.current === 0 || freeSwitch) {
      player.chroma.current = x;
    }
    if (player.chroma.next === 0 || freeSwitch) {
      player.chroma.next = x;
      // Since we unlocked a new color, we may want to rotate.
      this.potentiallyRotate();
    }
    if (x === 1) {
      ComplexityChallenge.exitComplexityChallenge(4);
      ComplexityAchievements.checkForComplexityAchievements('chroma');
    }
  },
  updateChromaOnEternity() {
    player.chroma.current = player.chroma.next;
    this.potentiallyRotate();
  },
  nextColor (x) {
    let c = [1, 2, 3, 4, 5, 6].filter(i => this.isColorUnlocked(i));
    return c[(x ? (c.indexOf(x) + 1) : 0) % c.length];
  },
  potentiallyRotate() {
    if (this.hasOptions() && this.rotate()) {
      player.chroma.next = this.nextColor(player.chroma.current);
    }
  },
  rotate() {
    return player.chroma.rotate;
  },
  startProducingWhenUnlocked() {
    return player.chroma.startProducingWhenUnlocked; 
  },
  setRotate(x) {
    player.chroma.rotate = x;
    this.potentiallyRotate();
  },
  setStartProducingWhenUnlocked(x) {
    player.chroma.startProducingWhenUnlocked = x;
  },
  colorName(x, title) {
    if (title) {
      return this.colors[x][0].toUpperCase() + this.colors[x].slice(1);
    } else {
      return this.colors[x];
    }
  },
  currentColorName(title) {
    return this.colorName(player.chroma.current, title);
  },
  nextColorName(title) {
    return this.colorName(player.chroma.next, title);
  },
  currentColorClass() {
    return this.currentColorName() + 'span';
  },
  nextColorClass() {
    return this.nextColorName() + 'span';
  },
  isProducing() {
    return this.amount() >= this.colorAmount(player.chroma.current);
  },
  nextExtraTheorem() {
    return 4096 * (Math.pow(2, Math.pow(1 + this.extraTheoremsActualAndDisplay(), 1 / ComplexityAchievements.effect(3, 4)) / 16) - 1);
  },
  timeUntilProduction() {
    return this.timeUntilChromaIs(this.colorAmount(player.chroma.current));
  },
  isFast() {
    return this.chromaSpeedMultiplier().gte(Decimal.pow(2, 256));
  },
  timeUntilChromaIs(c) {
    let cap = this.cap();
    if (c > cap) {
      return Infinity;
    }
    // Do this special case *after* checking for cap.
    if (this.isFast()) {
      return 0;
    }
    let t = -cap * Math.log(1 - c / cap) / 2;
    return t / this.chromaSpeedMultiplier() - player.stats.timeSinceEternity;
  },
  currentProductionText() {
    if (this.colorAmount(player.chroma.current) > this.cap()) {
      return 'would be producing ' + this.currentColorName() + ' except that it\'s already above the current chroma cap'
    } else if (this.amount() === this.cap()) {
      return 'would be producing ' + this.currentColorName() + ' but are at the chroma cap';
    } else if (this.colorAmount(player.chroma.current) === this.cap()) {
      return 'would produce ' + this.currentColorName() + ' except that it\'s already at the chroma cap';
    } else if (this.isProducing()) {
      return 'are currently producing ' + this.currentColorName();
    } else {
      return 'will start to produce ' + this.currentColorName() + ' in ' + formatTime(Chroma.timeUntilProduction(), {seconds: {f: formatTimeNum, s: false}, larger: {f: formatTimeNum, s: false}});
    }
  },
  currentProductionTextPrefix() {
    return this.currentProductionText().split(this.currentColorName())[0];
  },
  currentProductionTextSuffix() {
    return this.currentProductionText().split(this.currentColorName())[1];
  },
  colorProductionStatus(color) {
    if (this.producingAll() && this.isColorUnlocked(color)) {
      return 'Will always be produced';
    } if (color === player.chroma.current && color === player.chroma.next) {
      return 'Being produced, will be produced next';
    } else if (color === player.chroma.current) {
      return 'Being produced';
    } else if (color === player.chroma.next) {
      return 'Will be produced next';
    } else {
      return '';
    }
  },
  producingAll() {
    // Note that this can be true even if chroma isn't unlocked yet.
    return ComplexityAchievements.isComplexityAchievementActive(3, 3);
  },
  chromaDivClass(color) {
    if ((this.producingAll() && this.isColorUnlocked(color)) || color === player.chroma.current) {
      return 'chromadiv chromacurrent' + this.colorName(color) + 'div';
    } else if (color === player.chroma.next) {
      return 'chromadiv chromanext' + this.colorName(color) + 'div';
    } else {
      return 'chromadiv';
    }
  },
  timeForChromaValue() {
    return player.chroma.timeForChromaValue[this.timeForChromaValueKey()];
  },
  setTimeForChromaValue(x) {
    player.chroma.timeForChromaValue[this.timeForChromaValueKey()] = x || 0;
  },
  timeForChromaValueKey() {
    return {
      'chroma': 'amount',
      'fraction of chroma cap': 'capFraction',
    }[this.timeForChromaMode()];
  },
  timeForChromaMode() {
    return player.chroma.timeForChromaMode;
  },
  setTimeForChromaMode(x) {
    let old = player.chroma.timeForChromaMode;
    player.chroma.timeForChromaMode = x;
    if (old !== x) {
      document.getElementsByClassName('chroma-value')[0].value = NotationOptions.format('chroma-value');
    }
  },
  modeTranslationTable: {
    'chroma': 'Chroma amount',
    'fraction of chroma cap': 'Chroma as fraction of cap'
  },
  syncedWithEternityAutobuyer() {
    return Autobuyer(13).mode() === this.modeTranslationTable[player.chroma.timeForChromaMode] && Autobuyer(13).priority().eq(this.timeForChromaValue());
  },
  syncWithEternityAutobuyer() {
    Autobuyer(13).setMode(this.modeTranslationTable[player.chroma.timeForChromaMode]);
    Autobuyer(13).setPriority(new Decimal(this.timeForChromaValue()));
    Autobuyer(13).redisplayMode();
    Autobuyer(13).redisplayPriority();
  },
  timeForChromaTextMargin() {
    return this.cap() * (1 - Math.pow(2, -16));
  },
  timeForChromaTextChromaValue() {
    if (this.timeForChromaMode() === 'chroma') {
      return this.timeForChromaValue();
    } else if (this.timeForChromaMode() === 'fraction of chroma cap') {
      return this.cap() * this.timeForChromaValue();
    }
  },
  timeForChromaTextPrefix() {
    if (!this.isUnlocked()) {
      return ' will never get';
    }
    let c = this.timeForChromaTextChromaValue();
    let cap = this.cap();
    if (c > cap) {
      return 'will never get';
    }
    c = Math.min(c, this.timeForChromaTextMargin());
    let t = this.timeUntilChromaIs(c);
    if (t <= 0) {
      return 'already have';
    }
    return 'will get';
  },
  timeForChromaTextSuffix() {
    if (!this.isUnlocked()) {
      return ' (due to chroma not being unlocked yet)';
    }
    let c = this.timeForChromaTextChromaValue();
    let cap = this.cap();
    if (c > cap) {
      return '';
    }
    c = Math.min(c, this.timeForChromaTextMargin());
    let t = this.timeUntilChromaIs(c);
    if (t <= 0) {
      return '';
    }
    return ' in ' + formatTime(t, {seconds: {f: formatTimeNum, s: false}, larger: {f: formatTimeNum, s: false}});
  }
}
