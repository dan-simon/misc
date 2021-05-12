let InfinityAutobuyer = function (i) {
  if (defined.infinityAutobuyers) {
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
    }
  }
}

let InfinityAutobuyers = {
  list: [...Array(10)].map((_, i) => InfinityAutobuyer(i + 1)),
  get: function (x) {
    return this.list[x - 1];
  },
  tick() {
    InfinityMaxAll.maxAll([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(i => InfinityAutobuyer(i).isActive()));
  }
}

defined.infinityAutobuyers = true;
