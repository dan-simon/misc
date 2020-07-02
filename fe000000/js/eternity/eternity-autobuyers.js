let EternityAutobuyer = function (i) {
  if ('EternityAutobuyers' in window) {
    return EternityAutobuyers.get(i);
  }
  return {
    hasEternityAutobuyer() {
      return (i <= 13 && EternityChallenge.isTotalCompletionsRewardActive(4)) ||
        ComplexityUpgrades.hasComplexityUpgrade(2, 2);
    },
    isOn() {
      return player.eternityAutobuyers[i - 1];
    },
    isActive() {
      return this.isOn() && this.hasEternityAutobuyer();
    },
    setIsOn(x) {
      player.eternityAutobuyers[i - 1] = x;
    },
    toggle() {
      this.setIsOn(!this.isOn());
    },
    target() {
      if (i <= 8) {
        return EternityGenerator(i);
      } else if (i <= 11) {
        return EternityUpgrade(i - 8);
      } else if (i <= 13) {
        return EternityProducerUpgrade(i - 11);
      }
    },
    tick() {
      if (!this.isActive()) return;
      this.target().buyMax();
    },
    tickBuyOne() {
      if (!this.isActive()) return;
      this.target().buy();
    }
  }
}

let EternityAutobuyers = {
  eternityList: [...Array(17)].map((_, i) => EternityAutobuyer(i + 1)),
  get: function (x) {
    return this.list[x - 1];
  },
  tick() {
    while (EternityGenerators.highest() && EternityGenerators.highest().canBuy()) {
      let highest = EternityGenerators.highest();
      if (highest && highest.canBuy() && EternityAutobuyer(highest.tier()).isActive()) {
        EternityAutobuyer(highest.tier()).tickBuyOne();
      } else {
        break;
      }
    }
    for (let i = 0; i < 13; i++) {
      EternityAutobuyer([9, 10, 11, 1, 2, 3, 4, 5, 6, 7, 8, 12, 13][i]).tick();
    }
    Permanence.buyMaxOf([1, 2, 3, 4].filter(i => EternityAutobuyer(i + 13).isActive()));
  }
}
