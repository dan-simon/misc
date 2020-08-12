let ComplexityAutobuyer = function (i) {
  if ('ComplexityAutobuyers' in window) {
    return ComplexityAutobuyers.get(i);
  }
  return {
    hasComplexityAutobuyer() {
      return (i <= 11 && (Galaxy.isUnlocked() || FinalityMilestones.isFinalityMilestoneActive(1))) ||
        (i > 11 && FinalityMilestones.isFinalityMilestoneActive(4));
    },
    isOn() {
      return player.complexityAutobuyers[i - 1];
    },
    isActive() {
      return this.isOn() && this.hasComplexityAutobuyer();
    },
    setIsOn(x) {
      player.complexityAutobuyers[i - 1] = x;
    },
    toggle() {
      this.setIsOn(!this.isOn());
    },
    target() {
      if (i <= 8) {
        return ComplexityGenerator(i);
      } else if (i <= 11) {
        return PowerUpgrade(i - 8);
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

let ComplexityAutobuyers = {
  complexityList: [...Array(15)].map((_, i) => ComplexityAutobuyer(i + 1)),
  get: function (x) {
    return this.list[x - 1];
  },
  tick() {
    while (ComplexityGenerators.highest() && ComplexityGenerators.highest().canBuy()) {
      let highest = ComplexityGenerators.highest();
      if (highest && highest.canBuy() && ComplexityAutobuyer(highest.tier()).isActive()) {
        ComplexityAutobuyer(highest.tier()).tickBuyOne();
      } else {
        break;
      }
    }
    for (let i = 0; i < 11; i++) {
      // This could be simpler, but the order might change later.
      ComplexityAutobuyer([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11][i]).tick();
    }
    PowerShards.buyMaxOf([1, 2, 3, 4].filter(i => ComplexityAutobuyer(i + 11).isActive()));
    if (FinalityMilestones.isFinalityMilestoneActive(8)) {
      Powers.unlock(true);
      Oracle.unlock(true);
      Galaxy.unlock(true);
    }
    Powers.autoLoadPowerList();
  }
}
