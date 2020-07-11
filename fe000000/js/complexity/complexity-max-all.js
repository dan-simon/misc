let ComplexityMaxAll = {
  anythingToBuy() {
    return ComplexityGenerators.list.some(x => x.canBuy());
  },
  maxAll() {
    while (ComplexityGenerators.highest() && ComplexityGenerators.highest().canBuy()) {
      ComplexityGenerators.highest().buy();
    }
    ComplexityGenerators.list.forEach(x => x.buyMax());
  }
}
