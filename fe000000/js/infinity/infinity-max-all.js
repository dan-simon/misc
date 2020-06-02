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
  maxAll() {
    while (InfinityGenerators.highest() && InfinityGenerators.highest().canBuy()) {
      InfinityGenerators.highest().buy();
    }
    InfinityUpgrades.list.forEach(x => x.buyMax());
    InfinityGenerators.list.forEach(x => x.buyMax());
  },
  maxUpgrades() {
    InfinityUpgrades.list.forEach(x => x.buyMax());
  },
  maxGenerators() {
    while (InfinityGenerators.highest() && InfinityGenerators.highest().canBuy()) {
      InfinityGenerators.highest().buy();
    }
    InfinityGenerators.list.forEach(x => x.buyMax());
  }
}
