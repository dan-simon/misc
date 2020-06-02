let Chroma = {
  colorEffectFormulas: [
    null,
    x => Math.pow(1 + x / 1024, 2),
    x => Math.pow(1 + x / 64, 0.5),
    x => 1 + x / 1024,
    x => Decimal.pow(2, 256 * Math.sqrt(x)),
    x => Math.floor(16 * Math.log2(1 + x / 4096)),
    x => 1 + Math.log2(1 + Math.log2(1 + x / Math.pow(2, 16))) / 16
  ],
  amount() {
    let t = player.stats.timeSinceEternity * this.chromaSpeedMultiplier();
    let cap = this.rawCap();
    return Math.pow(cap * (1 - Math.exp(-t / cap)), this.exponent());
  },
  rawCap() {
    return Math.max(EternityPoints.totalEPProduced().log2(), 1);
  },
  actualCap() {
    return Math.pow(this.rawCap(), this.exponent());
  },
  chromaSpeedMultiplier() {
    return this.effectOfColor(2);
  },
  extraTheorems() {
    return this.effectOfColor(5);
  },
  exponent() {
    return this.effectOfColor(6);
  },
  effectOfColor(x) {
    return this.colorEffectFormulas[x](this.colorAmount(x));
  },
  colorAmount(x) {
    return player.chroma.colors[x - 1];
  },
  setColorAmount(x) {
    player.chroma.colors[x - 1] = x;
  },
  updateColors() {
    let color = player.chroma.current;
    let oldExtraTheorems = this.extraTheorems();
    this.setColorAmount(color, Math.max(this.colorAmount(color), this.amount()));
    let newExtraTheorems = this.extraTheorems();
    player.unspentTheorems += newExtraTheorems - oldExtraTheorems;
  },
  updateChromaOnEternity() {
    player.chroma.current = player.chroma.next;
  }
}