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
  advanceSeedCalculation(x) {
    x ^= x << 13;
  	x ^= x >>> 17;
  	x ^= x << 5;
    return (x + Math.pow(2, 32)) % Math.pow(2, 32);
  },
  advanceSeed(real) {
    let x = real ? player.powers.seed : this.seed;
    x = this.advanceSeedCalculation(x);
    if (real) {
      player.powers.seed = x;
    } else {
      this.seed = x;
    }
  },
  bitAt(x, i) {
    return x % Math.pow(2, i + 1) >= Math.pow(2, i) ? 1 : 0;
  },
  toBits(x) {
    return [...Array(32)].map((_, i) => this.bitAt(x, i));
  },
  fromBits(b) {
    return b.map((x, i) => x * Math.pow(2, i)).reduce((a, b) => a + b);
  },
  getAdvancementMatrix() {
    if (!this.advancementMatrix) {
      this.advancementMatrix = [...Array(32)].map((_, row) => [...Array(32)].map(
        (_, column) => this.bitAt(this.advanceSeedCalculation(Math.pow(2, column)), row)));
    }
    return this.advancementMatrix;
  },
  multiply(matrix, vector) {
    return [...Array(matrix.length)].map((_, row) => [...Array(vector.length)].map(
      (_, column) => matrix[row][column] * vector[column]).reduce((a, b) => a + b) % 2);
  },
  square(matrix) {
    return [...Array(matrix.length)].map((_, row) => [...Array(matrix.length)].map(
      (_, column) => [...Array(matrix.length)].map((_, k) => matrix[row][k] * matrix[k][column]).reduce((a, b) => a + b) % 2));
  },
  getAdvancementMatrixSquare(i) {
    if (!this.advancementMatrixSquares) {
      this.advancementMatrixSquares = [...Array(32)].reduce(a => a.concat([this.square(a[a.length - 1])]), [this.getAdvancementMatrix()]);
    }
    return this.advancementMatrixSquares[i];
  },
  jump(steps) {
    steps %= Math.pow(2, 32) - 1;
    let bitSeed = this.toBits(player.powers.seed);
    let bitSteps = this.toBits(steps);
    let newBitSeed = bitSteps.reduce((x, b, i) => b ? this.multiply(
      this.getAdvancementMatrixSquare(i), x) : x, bitSeed);
    player.powers.seed = this.fromBits(newBitSeed);
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
    return this.rarityFromRandom(r);
  },
  rarityFromRandom(r) {
    return Math.min(Powers.maximumRarity(), Math.sqrt(Math.pow(Powers.minimumRarity(), 2) - Math.log2(1 - r)));
  },
  averagePowerShardValue() {
    if (Powers.minimumRarity() !== this.cachedMinimumRarity) {
      let powers = [...Array(256)].map((_, i) => this.powerWithRarity((2 * i + 1) / 512));
      let a = powers.slice(0, 64).map(p => PowerShards.shardGain(p)).reduce((a, b) => a + b);
      let b = powers.slice(64).map(p => PowerShards.shardGain(p)).reduce((a, b) => a + b);
      let average = a / 320 + b / 240;
      this.cachedMinimumRarity = Powers.minimumRarity();
      this.cachedAverage = average;
    }
    return this.cachedAverage;
  },
  randomType(real) {
    let options = ['normal', 'infinity', 'eternity', 'complexity'].filter(
      i => i !== player.powers.lastData.type);
    let type = options[Math.floor(options.length * this.uniform(real))];
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
  powerWithRarity(r) {
    // Note that r here is a number.
    return {
      'type': 'normal',
      'strength': Powers.newStrength(),
      'rarity': this.rarityFromRandom(r)
    };
  },
  initialPowers() {
    return Powers.typeList.map(x => ({
      'type': x,
      'strength': Powers.newStrength(),
      'rarity': 1,
    }));
  }
}
