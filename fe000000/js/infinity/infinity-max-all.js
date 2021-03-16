let InfinityMaxAll = {
  anythingToBuy() {
    return this.anyUpgradesToBuy() || this.anyGeneratorsToBuy();
  },
  anyUpgradesToBuy() {
    return InfinityUpgrades.list.some(x => x.canBuy());
  },
  anyGeneratorsToBuy() {
    return InfinityGenerators.list.some(x => x.canBuy());
  },
  maxAll(types) {
    if (types === undefined) {
      types = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    }
    generalHighestSweep(() => InfinityGenerators.highest(), types);
    generalMaxAll(types.filter(x => x > 8).map(x => InfinityUpgrade(x - 8)));
    generalMaxAll(types.filter(x => x <= 8).map(x => InfinityGenerator(x)));
  },
  maxUpgrades() {
    this.maxAll([9, 10]);
  },
  maxGenerators() {
    this.maxAll([1, 2, 3, 4, 5, 6, 7, 8]);
  }
}
