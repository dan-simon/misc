let RNG = {
  seed: null,
  uniform(real) {
    let result = (real ? player.powers.seed : this.seed) / Math.pow(2, 32);
    this.advanceSeed(real);
    return result;
  },
  createSeed() {
    return Math.floor(Date.now() * Math.random() % Math.pow(2, 32)) || 1;
  },
  advanceSeed(real) {
    let x = real ? player.powers.seed : this.seed;
    x ^= x << 13;
  	x ^= x >> 17;
  	x ^= x << 5;
    x = (x + Math.pow(2, 32)) % Math.pow(2, 32);
    if (real) {
      player.powers.seed = x;
    } else {
      this.seed = x;
    }
  },
  rarity(real) {
    return Math.sqrt(Math.pow(Powers.minimumRarity(), 2) - Math.log2(this.uniform(real)));
  },
  randomType(real) {
    return ['normal', 'infinity', 'eternity', 'complexity'][Math.floor(4 * this.uniform(real))]
  },
  randomPower(real) {
    this.seed = player.powers.seed;
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
