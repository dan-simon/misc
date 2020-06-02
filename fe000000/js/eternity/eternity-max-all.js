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
  maxAll() {
    while (EternityGenerators.highest() && EternityGenerators.highest().canBuy()) {
      EternityGenerators.highest().buy();
    }
    EternityUpgrades.list.forEach(x => x.buyMax());
    EternityGenerators.list.forEach(x => x.buyMax());
  },
  maxUpgrades() {
    EternityUpgrades.list.forEach(x => x.buyMax());
  },
  maxGenerators() {
    while (EternityGenerators.highest() && EternityGenerators.highest().canBuy()) {
      EternityGenerators.highest().buy();
    }
    EternityGenerators.list.forEach(x => x.buyMax());
  }
}
