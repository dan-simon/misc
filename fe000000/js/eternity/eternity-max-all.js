let EternityMaxAll = {
  anythingToBuy() {
    return this.anyUpgradesToBuy() || this.anyGeneratorsToBuy();
  },
  anyUpgradesToBuy() {
    return EternityUpgrades.list.some(x => x.canBuy());
  },
  anyGeneratorsToBuy() {
    return EternityGenerators.list.some(x => x.canBuy());
  },
  maxAll(types) {
    if (types === undefined) {
      types = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    }
    generalHighestSweep(() => EternityGenerators.highest(), types);
    generalMaxAll(types.filter(x => x > 8 && x <= 11).map(x => EternityUpgrade(x - 8)), EternityPoints);
    generalMaxAll(types.filter(x => x <= 8).map(x => EternityGenerator(x)), EternityPoints);
    generalMaxAll(types.filter(x => x > 11 & x <= 13).map(x => EternityProducerUpgrade(x - 11)), EternityPoints);
    for (let i of [0, 1, 2]) {
      if (types.includes(i + 14)) {
        Studies.buyMax(i);
      }
    }
    generalMaxAll(types.filter(x => x > 16).map(x => PermanenceUpgrade(x - 16)), Permanence);
  },
  maxUpgrades() {
    this.maxAll([9, 10, 11]);
  },
  maxGenerators() {
    this.maxAll([1, 2, 3, 4, 5, 6, 7, 8]);
  }
}
