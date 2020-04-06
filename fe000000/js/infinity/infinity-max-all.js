let InfinityMaxAll = {
  anythingToBuy() {
    return InfinityUpgrades.list.some(x => x.canBuy()) || InfinityGenerators.list.some(x => x.canBuy());
  },
  maxAll() {
    while (InfinityGenerators.highest() && InfinityGenerators.highest().canBuy()) {
      InfinityGenerators.highest().buy();
    }
    InfinityUpgrades.list.forEach(x => x.buyMax());
    InfinityGenerators.list.forEach(x => x.buyMax());
  }
}
