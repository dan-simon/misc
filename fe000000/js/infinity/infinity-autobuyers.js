let InfinityAutobuyer = function (i) {
  if ('InfinityAutobuyers' in window) {
    return InfinityAutobuyers.get(i);
  }
  return {
    hasInfinityAutobuyer() {
      if (i <= 8) {
        return EternityMilestones.isEternityMilestoneActive(i + 8);
      } else {
        return EternityMilestones.isEternityMilestoneActive(7);
      }
    },
    isOn() {
      return player.infinityAutobuyers[i - 1];
    },
    isActive() {
      return this.isOn() && this.hasInfinityAutobuyer();
    },
    setIsOn(x) {
      player.infinityAutobuyers[i - 1] = x;
    },
    toggle() {
      this.setIsOn(!this.isOn());
    },
    target() {
      if (i <= 8) {
        return InfinityGenerator(i);
      } else {
        return InfinityUpgrade(i - 8);
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

let InfinityAutobuyers = {
  list: [...Array(10)].map((_, i) => InfinityAutobuyer(i + 1)),
  get: function (x) {
    return this.list[x - 1];
  },
  tick() {
    while (InfinityGenerators.highest() && InfinityGenerators.highest().canBuy()) {
      let highest = InfinityGenerators.highest();
      if (highest && highest.canBuy() && InfinityAutobuyer(highest.tier()).isActive()) {
        InfinityAutobuyer(highest.tier()).tickBuyOne();
      } else {
        break;
      }
    }
    for (let i = 0; i < 10; i++) {
      InfinityAutobuyer([9, 10, 1, 2, 3, 4, 5, 6, 7, 8][i]).tick();
    }
  }
}
