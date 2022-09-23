let FinalityMaxAll = {
  anythingToBuy() {
    return FinalityGenerators.list.some(x => x.canBuy());
  },
  maxAll(types) {
    if (types === undefined) {
      types = [1, 2, 3, 4, 5, 6, 7, 8];
    }
    generalHighestSweep(() => FinalityGenerators.highest(), types);
    generalMaxAll(types.map(x => FinalityGenerator(x)), FinalityPoints);
  }
}
