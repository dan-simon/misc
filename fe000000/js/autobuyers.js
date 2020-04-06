let Autobuyer = function (i) {
  if ('Autobuyers' in window) {
    return Autobuyers.get(i);
  }
  return {
    hasAutobuyer() {
      if (i === 13) {
        return EternityMilestones.isEternityMilestoneActive(16);
      } else {
        return Challenge.isChallengeCompleted(i);
      }
    },
    isOn() {
      return player.autobuyers[i - 1].isOn;
    },
    isActive() {
      return this.isOn() && this.hasAutobuyer();
    },
    mode() {
      return player.autobuyers[i - 1].mode;
    },
    priority() {
      return player.autobuyers[i - 1].priority;
    },
    setIsOn(x) {
      player.autobuyers[i - 1].isOn = x;
    },
    setMode(x) {
      player.autobuyers[i - 1].mode = x;
    },
    setPriority(x) {
      player.autobuyers[i - 1].priority = x;
    },
    checkbox() {
      return document.getElementsByClassName('autobuyer-checkbox-' + i)[0];
    },
    target() {
      if (i <= 8) {
        return Generator(i);
      } else if (i === 9) {
        return Boost;
      }
    },
    targetMethod() {
      if (this.mode() === 'Buy singles') {
        return 'buy';
      } else if (this.mode() === 'Buy max') {
        return 'buyMax';
      }
    },
    tick() {
      if (!this.isActive()) return;
      if (i <= 9) {
        this.target()[this.targetMethod()]();
      }
    }
  }
}

let Autobuyers = {
  list: [...Array(12)].map((_, i) => Autobuyer(i + 1)),
  get: function (x) {
    return this.list[x - 1];
  },
  numberOfAutobuyers() {
    // There's auto-conversion of Boolean to number here.
    return Challenge.numberOfChallengesCompleted() + EternityMilestones.isEternityMilestoneActive(16);
  },
  setAll(x) {
    for (let autobuyer of this.list) {
      if (autobuyer.hasAutobuyer()) {
        autobuyer.setIsOn(x);
        autobuyer.checkbox().checked = x;
      }
    }
  },
  priorityOrder() {
    function cmp(a, b) {
      return (a < b) ? -1 : ((a > b) ? 1 : 0);
    }
    return [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(
      (a, b) => cmp(Autobuyer(a).priority(), Autobuyer(b).priority()) || cmp(a, b)).map(x => Autobuyer(x));
  },
  sacrifice() {
    if (!Autobuyer(10).isActive() || !Sacrifice.canSacrifice()) return;
    let shouldSacrifice;
    let mode = Autobuyer(10).mode();
    let priority = Autobuyer(10).priority();
    if (mode === 'Multiplier') {
      shouldSacrifice = Sacrifice.sacrificeMultiplierMultGain().gte(priority);
    } else if (mode === 'Time') {
      shouldSacrifice = player.stats.timeSinceSacrifice >= priority.toNumber();
    }
    if (shouldSacrifice) {
      Sacrifice.sacrifice();
    }
  },
  prestige() {
    if (!Autobuyer(11).isActive() || !Prestige.canPrestige()) return;
    let shouldPrestige;
    let mode = Autobuyer(11).mode();
    let priority = Autobuyer(11).priority();
    if (mode === 'Multiplier') {
      shouldPrestige = Prestige.prestigePowerMultGain().gte(priority);
    } else if (mode === 'Time') {
      shouldPrestige = player.stats.timeSincePrestige >= priority.toNumber();
    }
    if (shouldPrestige) {
      Prestige.prestige();
    }
  },
  infinity() {
    if (!Autobuyer(12).isActive() || !InfinityPrestigeLayer.canInfinity()) return;
    let shouldInfinity;
    let mode = Autobuyer(12).mode();
    let priority = Autobuyer(12).priority();
    if (mode === 'Amount') {
      shouldInfinity = InfinityPrestigeLayer.infinityPointGain().gte(priority);
    } else if (mode === 'Time') {
      shouldInfinity = player.stats.timeSinceInfinity >= priority.toNumber();
    } else if (mode === 'X times last') {
      shouldInfinity = InfinityPrestigeLayer.infinityPointGain().gte(player.stats.lastTenInfinities[0][1].times(priority));
    } else if (mode === 'Time past peak/sec') {
      shouldInfinity = player.stats.timeSinceLastPeakIPPerSec >= priority.toNumber();
    } else if (mode === 'Fraction of peak/sec') {
      shouldInfinity = InfinityPrestigeLayer.currentIPPerSec().lte(InfinityPrestigeLayer.peakIPPerSec().times(priority));
    }
    if (shouldInfinity) {
      InfinityPrestigeLayer.infinity();
    }
  },
  eternity() {
    if (!Autobuyer(13).isActive() || !EternityPrestigeLayer.canEternity()) return;
    let shouldEternity;
    let mode = Autobuyer(13).mode();
    let priority = Autobuyer(13).priority();
    if (mode === 'Amount') {
      shouldEternity = EternityPrestigeLayer.eternityPointGain().gte(priority);
    } else if (mode === 'Time') {
      shouldEternity = player.stats.timeSinceEternity >= priority.toNumber();
    } else if (mode === 'X times last') {
      shouldEternity = EternityPrestigeLayer.eternityPointGain().gte(player.stats.lastTenEternities[0][1].times(priority));
    } else if (mode === 'Time past peak/sec') {
      shouldEternity = player.stats.timeSinceLastPeakEPPerSec >= priority.toNumber();
    } else if (mode === 'Fraction of peak/sec') {
      shouldEternity = EternityPrestigeLayer.currentEPPerSec().lte(EternityPrestigeLayer.peakEPPerSec().times(priority));
    }
    if (shouldEternity) {
      EternityPrestigeLayer.eternity();
    }
  },
  tick() {
    Autobuyers.eternity();
    Autobuyers.infinity();
    Autobuyers.prestige();
    Autobuyers.sacrifice();
    for (let autobuyer of this.priorityOrder()) {
      autobuyer.tick();
    }
  }
}
