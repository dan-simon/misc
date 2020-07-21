let RNG = {
  uniform() {
    let result = player.seed / Math.pow(2, 32);
    this.advanceSeed();
    return result;
  },
  createSeed() {
    return Math.floor(Date.now() * Math.random() % Math.pow(2, 32)) || 1;
  },
  advanceSeed() {
    let x = player.seed;
    x ^= x << 13;
  	x ^= x >> 17;
  	x ^= x << 5;
    player.seed = x;
  },
  rarity() {
    return Math.sqrt(-Math.log2(this.uniform()));
  },
  randomType() {
    return ['normal', 'infinity', 'eternity', 'complexity'][Math.floor(4 * this.uniform())]
  },
  randomPower() {
    return {
      'type': this.randomType(),
      'strength': Powers.strength(),
      'rarity': this.rarity(),
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
