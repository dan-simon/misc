let ComplexityMaxAll = {
  anythingToBuy() {
    return ComplexityGenerators.list.some(x => x.canBuy());
  },
  maxAll(types) {
    if (types === undefined) {
      types = [1, 2, 3, 4, 5, 6, 7, 8];
    }
    generalHighestSweep(() => ComplexityGenerators.highest(), types);
    generalMaxAll(types.filter(x => x <= 8).map(x => ComplexityGenerator(x)));
    generalMaxAll(types.filter(x => x > 8 && x <= 11).map(x => PowerUpgrade(x - 8)));
    generalMaxAll(types.filter(x => x > 11).map(x => PowerShardUpgrade(x - 11)));
  },
  maxUpgrades() {
    this.maxAll([9, 10, 11]);
  },
  maxGenerators() {
    this.maxAll([1, 2, 3, 4, 5, 6, 7, 8]);
  }
}
