let EternityAutobuyer = function (i) {
  if ('EternityAutobuyers' in window) {
    return EternityAutobuyers.get(i);
  }
  return {
    hasEternityAutobuyer() {
      return (i <= 13 && EternityChallenge.isTotalCompletionsRewardActive(4)) ||
        ComplexityAchievements.hasComplexityAchievement(2, 2);
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
      if (14 <= i && i <= 16) {
        Studies.buyMax(i - 14);
      } else {
        this.target().buyMax();
      }
    },
    tickBuyOne() {
      if (!this.isActive()) return;
      if (14 <= i && i <= 16) {
        Studies.buy(i - 14);
      } else {
        this.target().buy();
      }
    }
  }
}

let EternityAutobuyers = {
  eternityList: [...Array(20)].map((_, i) => EternityAutobuyer(i + 1)),
  get: function (x) {
    return this.list[x - 1];
  },
  hasTheoremAutobuyers() {
    return EternityAutobuyer(14).hasEternityAutobuyer();
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
    for (let i = 0; i < 17; i++) {
      EternityAutobuyer([9, 10, 11, 1, 2, 3, 4, 5, 6, 7, 8, 12, 13, 14, 15, 16][i]).tick();
    }
    Permanence.buyMaxOf([1, 2, 3, 4].filter(i => EternityAutobuyer(i + 16).isActive()));
    if (ComplexityAchievements.hasComplexityAchievement(1, 3)) {
      EternityProducer.unlock(true);
      for (let i = 1; i <= 6; i++) {
        Chroma.unlockColor(i, true);
      }
    }
    Studies.autoLoadStudyList();
  }
}
