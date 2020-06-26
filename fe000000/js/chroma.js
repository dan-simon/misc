let Chroma = {
  colors: [null, 'grey', 'purple', 'orange', 'yellow', 'green'],
  colorCosts: [
    null,
    Decimal.pow(2, 4096),
    Decimal.pow(2, 8192),
    Decimal.pow(2, 12288),
    Decimal.pow(2, Math.pow(2, 14)),
    Decimal.pow(2, Math.pow(2, 15))
  ],
  colorEffectFormulas: [
    null,
    x => Math.pow(1 + x / 1024, 2.5),
    x => Math.pow(1 + x / 64, 0.5),
    x => Math.pow(Math.max(EternityPoints.totalEPProduced().log2() / 4096, 1),
      Math.log2(1 + x / 256) / 4),
    x => Decimal.pow(EternityGenerator(8).amount().max(1), 2 * Math.sqrt(x)),
    x => Math.floor(16 * Math.log2(1 + x / 4096))
  ],
  amount() {
    if (!this.isUnlocked()) {
      return 0;
    }
    let t = player.stats.timeSinceEternity * this.chromaSpeedMultiplier();
    let cap = this.cap();
    return cap * (1 - Math.exp(-t / cap));
  },
  cap() {
    return Math.max(EternityPoints.totalEPProduced().log2(), 1);
  },
  chromaSpeedMultiplier() {
    return this.effectOfColor(3) * EternityChallenge.getTotalCompletionsRewardEffect(4) *
      Study(16).effect() * ComplexityChallenge.getComplexityChallengeReward(4);
  },
  extraTheorems() {
    return this.effectOfColor(5);
  },
  effectOfColor(x) {
    return this.colorEffectFormulas[x](this.colorAmount(x));
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
    let color = player.chroma.current;
    if (color === 0) return;
    this.setColorAmount(color, Math.max(this.colorAmount(color), this.amount()));
  },
  setNextColor(x) {
    if (this.isColorUnlocked(x)) {
      player.chroma.next = x;
    }
  },
  getUnlockColorCost(x) {
    return this.colorCosts[x];
  },
  canUnlockColor(x) {
    return !this.isColorUnlocked(x) && player.eternityPoints.gte(this.getUnlockColorCost(x));
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
    ComplexityChallenge.exitComplexityChallenge(4);
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
    return 4096 * (Math.pow(2, (1 + this.extraTheorems()) / 16) - 1);
  },
  timeUntilProduction() {
    let c = this.colorAmount(player.chroma.current);
    let cap = this.cap();
    let t = -cap * Math.log(1 - c / cap);
    return t / this.chromaSpeedMultiplier() - player.stats.timeSinceEternity;
  },
  currentProductionText() {
    if (this.amount() === this.cap()) {
      return 'would be producing ' + this.currentColorName() + ' but are at the chroma cap';
    } else if (this.isProducing()) {
      return 'are currently producing ' + this.currentColorName();
    } else {
      return 'will start to produce ' + Chroma.currentColorName() + ' in ' + format(Chroma.timeUntilProduction()) + ' seconds';
    }
  }
}
