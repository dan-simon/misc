let RNG = {
  uniform() {
    let result = player.powers.seed / Math.pow(2, 32);
    this.advanceSeed();
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
  rarity() {
    return Math.sqrt(-Math.log2(this.uniform()));
  },
  randomType() {
    return ['normal', 'infinity', 'eternity', 'complexity'][Math.floor(4 * this.uniform())]
  },
  randomPower() {
    return {
      'type': this.randomType(),
      'strength': Powers.newStrength(),
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
