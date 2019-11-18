let InfinityPrestigeLayer = {
  isInfinityBroken() {
    return false;
  },
  canInfinity() {
    return Stars.amount().log(2) >= 256;
  },
  mustInfinity() {
    return this.canInfinity() && !this.isInfinityBroken();
  },
  infinityPointGain() {
    let oom = this.isInfinityBroken() ? Stars.amount().log(2) / 256 : 1;
    return Decimal.pow(2, oom).floor();
  },
  infinity() {
    if (!this.canInfinity()) return;
    InfinityPoints.addAmount(this.infinityPointGain());
    Infinities.increment();
    this.infinityReset();
  },
  infinityReset() {
    Prestige.prestigeReset();
    player.prestigePower = new Decimal(1);
    player.infinityStars = new Decimal(1);
    InfinityGenerators.list.forEach(x => x.resetAmount());
  }
}
