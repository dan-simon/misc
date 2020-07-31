let RNG = {
  uniform(real) {
    let result = player.powers.seed / Math.pow(2, 32);
    if (real) {
      this.advanceSeed();
    }
    return result;
  },
  createSeed() {
    return Math.floor(Date.now() * Math.random() % Math.pow(2, 32)) || 1;
  },
  advanceSeed() {
    let x = player.powers.seed;
    x ^= x << 13;
  	x ^= x >> 17;
  	x ^= x << 5;
    x = (x + Math.pow(2, 32)) % Math.pow(2, 32);
    player.powers.seed = x;
  },
  rarity(real) {
    return Math.sqrt(Math.pow(Powers.minimumRarity(), 2) - Math.log2(this.uniform(real))) + Prism.getAmountRewardEffect(2);
  },
  randomType(real) {
    return ['normal', 'infinity', 'eternity', 'complexity'][Math.floor(4 * this.uniform(real))]
  },
  randomPower(real) {
    return {
      'type': this.randomType(real),
      'strength': Powers.newStrength(),
      'rarity': this.rarity(real),
    };
  },
  initialPower() {
    return {
      'type': 'normal',
      'strength': 1,
      'rarity': 1,
    };
  }
}
