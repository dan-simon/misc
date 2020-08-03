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
  lowRarityThreshold() {
    return 1 / 4;
  },
  rarity(real) {
    let r = this.uniform(real);
    if (player.powers.lastData.lowRarity) {
      r = (1 - this.lowRarityThreshold()) * r + this.lowRarityThreshold();
    }
    if (real) {
      player.powers.lastData.lowRarity = r < this.lowRarityThreshold();
    }
    return Math.min(Powers.maximumRarity(), Math.sqrt(Math.pow(Powers.minimumRarity(), 2) - Math.log2(1 - r)));
  },
  randomType(real) {
    let type = ['normal', 'infinity', 'eternity', 'complexity'].filter(
      i => i !== player.powers.lastData.type)[Math.floor(3 * this.uniform(real))];
    if (real) {
      player.powers.lastData.type = type;
    }
    return type;
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
