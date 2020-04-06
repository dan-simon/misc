let EternityMaxAll = {
  anythingToBuy() {
    return EternityGenerators.list.some(x => x.canBuy());
  },
  maxAll() {
    while (EternityGenerators.highest() && EternityGenerators.highest().canBuy()) {
      EternityGenerators.highest().buy();
    }
    EternityGenerators.list.forEach(x => x.buyMax());
  }
}
