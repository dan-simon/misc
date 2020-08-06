let FinalityMaxAll = {
  anythingToBuy() {
    return FinalityGenerators.list.some(x => x.canBuy());
  },
  maxAll() {
    while (FinalityGenerators.highest() && FinalityGenerators.highest().canBuy()) {
      FinalityGenerators.highest().buy();
    }
    FinalityGenerators.list.forEach(x => x.buyMax());
  }
}
