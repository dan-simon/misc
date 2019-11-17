let MaxAll = {
  anythingToBuy() {
    return Boost.canBuy() || Generators.list.some(x => x.canBuy());
  },
  maxAll() {
    while (Generators.highest() && Generators.highest().canBuy()) {
      Generators.highest().buy();
    }
    Boost.buyMax();
    Generators.list.forEach(x => x.buyMax());
  }
}
