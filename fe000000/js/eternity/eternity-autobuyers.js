let EternityAutobuyer = function (i) {
  if (defined.eternityAutobuyers) {
    return EternityAutobuyers.get(i);
  }
  return {
    hasEternityAutobuyer() {
      return (i <= 13 && EternityChallenge.isTotalCompletionsRewardActive(4)) ||
        ComplexityAchievements.isComplexityAchievementActive(2, 2);
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
    }
  }
}

let EternityAutobuyers = {
  eternityList: [...Array(20)].map((_, i) => EternityAutobuyer(i + 1)),
  get: function (x) {
    return this.eternityList[x - 1];
  },
  hasTheoremAutobuyers() {
    return EternityAutobuyer(14).hasEternityAutobuyer();
  },
  tick() {
    EternityMaxAll.maxAll([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].filter(i => EternityAutobuyer(i).isActive()));
    if (ComplexityAchievements.isComplexityAchievementActive(1, 3)) {
      EternityProducer.unlock(true);
      for (let i = 1; i <= 6; i++) {
        Chroma.unlockColor(i, true);
      }
    }
    Studies.autoLoadStudyList();
  }
}

defined.eternityAutobuyers = true;
