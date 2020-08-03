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
  colorEffectFormulas: [
    null,
    x => Math.pow(1 + x / 1024, 2.5),
    x => Decimal.pow(1 + x / 64, 0.5),
    x => Decimal.pow(Math.max(EternityPoints.totalEPProducedThisComplexity().log2() / 4096, 1),
      Math.log2(1 + x / 256) / 4),
    x => Decimal.pow(EternityGenerator(8).amount().max(1), 2 * Math.sqrt(x)),
    x => Math.floor(Math.pow(16 * Math.log2(1 + x / 4096), ComplexityAchievements.effect(3, 4))),
    x => 1 + 3 * Math.pow(Math.log2(x / Math.pow(2, 18) + 1) * Eternities.totalEternitiesProducedThisComplexity().div(Math.pow(2, 54)).plus(1).log2(), 0.75) / 32
  ],
  amount() {
    if (!this.isUnlocked()) {
      return 0;
    }
    if (this.chromaSpeedMultiplier().gte(Decimal.pow(2, 256))) {
      return this.cap();
    }
    let t = player.stats.timeSinceEternity * this.chromaSpeedMultiplier().toNumber();
    let cap = this.cap();
    return cap * (1 - Math.exp(-t / cap));
  },
  cap() {
    return Math.pow(Math.max(EternityPoints.totalEPProducedThisComplexity().log2(), 1) *
      ComplexityChallenge.getComplexityChallengeReward(4) * ComplexityAchievements.effect(4, 3), Galaxy.effect());
  },
  chromaSpeedMultiplier() {
    let factors = [
      this.effectOfColor(3), EternityChallenge.getTotalCompletionsRewardEffect(4),
      Study(16).effect(), Complexities.chromaMultiplier(), ComplexityAchievements.effect(2, 3)
    ];
    return factors.reduce((a, b) => a.times(b));
  },
  extraTheoremsRaw() {
    return this.effectOfColor(5);
  },
  extraTheoremsIndex() {
    return 2;
  },
  extraTheoremsActualAndDisplay() {
    if (ComplexityAchievements.hasComplexityAchievement(4, 4)) {
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
    if (this.producingAll()) {
      for (let color = 1; color <= 6; color++) {
        if (this.isColorUnlocked(color)) {
          this.setColorAmount(color, Math.max(this.colorAmount(color), this.amount()));
        }
      }
     } else {
      let color = player.chroma.current;
      if (color === 0) return;
      this.setColorAmount(color, Math.max(this.colorAmount(color), this.amount()));
    }
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
    return x !== 6 || ComplexityAchievements.isAchievementsUnlockedRewardActive(3);
  },
  canUnlockColor(x) {
    // You can't unlock any colors but the first without unlocking the first (that is, unlocking chroma) first.
    // Also, the Complexity Challenge 4 safeguard prevents any colors from being unlocked.
    return !this.isColorUnlocked(x) && player.eternityPoints.gte(this.getUnlockColorCost(x)) &&
      !ComplexityChallenge.isSafeguardOn(4) && (x === 1 || this.isUnlocked()) &&
      this.canSeeThatColorExists(x);
  },
  unlockColor(x) {
    if (!this.canUnlockColor(x)) return;
    player.eternityPoints = player.eternityPoints.minus(this.getUnlockColorCost(x));
    player.chroma.unlocked[x - 1] = true;
    if (player.chroma.current === 0) {
      player.chroma.current = x;
    }
    if (player.chroma.next === 0) {
      player.chroma.next = x;
    }
    if (x === 1) {
      ComplexityChallenge.exitComplexityChallenge(4);
      ComplexityAchievements.checkForComplexityAchievements('chroma');
    }
  },
  updateChromaOnEternity() {
    player.chroma.current = player.chroma.next;
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
  isProducing() {
    return this.amount() >= this.colorAmount(player.chroma.current);
  },
  nextExtraTheorem() {
    return 4096 * (Math.pow(2, Math.pow(1 + this.extraTheoremsActualAndDisplay(), 1 / ComplexityAchievements.effect(3, 4)) / 16) - 1);
  },
  timeUntilProduction() {
    if (this.chromaSpeedMultiplier().gte(Decimal.pow(2, 256))) {
      return 0;
    }
    let c = this.colorAmount(player.chroma.current);
    let cap = this.cap();
    let t = -cap * Math.log(1 - c / cap);
    return t / this.chromaSpeedMultiplier() - player.stats.timeSinceEternity;
  },
  currentProductionText() {
    if (this.amount() === this.cap()) {
      return 'would be producing ' + this.currentColorName() + ' but are at the chroma cap';
    } else if (this.colorAmount(player.chroma.current) === this.cap()) {
      return 'would produce ' + Chroma.currentColorName() + ' except that it\'s already at the chroma cap';
    } else if (this.isProducing()) {
      return 'are currently producing ' + this.currentColorName();
    } else {
      return 'will start to produce ' + Chroma.currentColorName() + ' in ' + format(Chroma.timeUntilProduction()) + ' seconds';
    }
  },
  producingAll() {
    return ComplexityAchievements.hasComplexityAchievement(3, 3);
  }
}
