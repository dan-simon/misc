let ComplexityAutobuyer = function (i) {
  if (defined.complexityAutobuyers) {
    return ComplexityAutobuyers.get(i);
  }
  return {
    hasComplexityAutobuyer() {
      return (i <= 11 && (Galaxy.isUnlocked() || FinalityMilestones.isFinalityMilestoneActive(2))) ||
        (i > 11 && FinalityMilestones.isFinalityMilestoneActive(7));
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
    }
  }
}

let ComplexityAutobuyers = {
  complexityList: [...Array(15)].map((_, i) => ComplexityAutobuyer(i + 1)),
  get: function (x) {
    return this.complexityList[x - 1];
  },
  tick() {
    ComplexityMaxAll.maxAll([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].filter(i => ComplexityAutobuyer(i).isActive()));
    if (FinalityMilestones.isFinalityMilestoneActive(10)) {
      Powers.unlock(true);
    }
    if (FinalityMilestones.isFinalityMilestoneActive(12)) {
      Oracle.unlock(true);
      Galaxy.unlock(true);
    }
    Powers.autoLoadPowerList();
  }
}

defined.complexityAutobuyers = true;
