let Autobuyer = function (i) {
  if ('Autobuyers' in window) {
    return Autobuyers.get(i);
  }
  return {
    hasAutobuyer() {
      if (i === 13) {
        return EternityMilestones.isEternityMilestoneActive(16);
      } else if (i === 14) {
        return ComplexityAchievements.hasComplexityAchievement(2, 2);
      } else if (i === 15) {
        return ComplexityAchievements.isAchievementsUnlockedRewardActive(4);
      } else if (i === 16) {
        return FinalityMilestones.isFinalityMilestoneActive(8);
      } else if (i > 9) {
        return Challenge.isChallengeCompleted(i);
      } else {
        return Challenge.isChallengeCompleted(i) || player.slowAutobuyers[i];
      }
    },
    isSlow() {
      return i <= 9 && this.hasAutobuyer() && !Challenge.isChallengeCompleted(i);
    },
    canUnlockSlow() {
      return i <= 9 && Generators.anyGenerators() && !this.hasAutobuyer() && player.stars.gte(this.unlockSlowCost());
    },
    unlockSlow() {
      if (!this.canUnlockSlow()) return;
      player.slowAutobuyers[i] = true;
      player.stars = player.stars.safeMinus(this.unlockSlowCost());
    },
    unlockSlowCost() {
      return Decimal.pow(2, 2 * Math.pow(i, 2));
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
      for (let checkbox of this.checkboxes()) {
        checkbox.checked = x;
      }
    },
    setMode(x) {
      player.autobuyers[i - 1].mode = x;
    },
    setPriority(x) {
      player.autobuyers[i - 1].priority = x;
    },
    checkboxes() {
      return Array.from(document.getElementsByClassName('autobuyer-checkbox-' + i));
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
    tick(triggerSlowAutobuyers, triggerFastAutobuyers) {
      if (!this.isActive()) return;
      if (this.isSlow() && !triggerSlowAutobuyers) return;
      if (!this.isSlow() && !triggerFastAutobuyers) return;
      if (i <= 9) {
        this.target()[this.targetMethod()]();
      }
    }
  }
}

let Autobuyers = {
  list: [...Array(16)].map((_, i) => Autobuyer(i + 1)),
  get: function (x) {
    return this.list[x - 1];
  },
  numberOfAutobuyers() {
    return this.list.filter(i => i.hasAutobuyer()).length;
  },
  areAnyAutobuyersSlow() {
    return this.list.some(i => i.isSlow());
  },
  areAnyAutobuyersFast() {
    return this.list.some(i => i.hasAutobuyer() && !i.isSlow());
  },
  areThereAnyAutobuyers() {
    return this.numberOfAutobuyers() > 0;
  },
  doFastAutobuyersAlwaysTrigger() {
    return this.fastAutobuyersTimerLength() <= 0;
  },
  setAll(x) {
    for (let autobuyer of this.list) {
      if (autobuyer.hasAutobuyer()) {
        autobuyer.setIsOn(x);
        for (let checkbox of autobuyer.checkboxes()) {
          checkbox.checked = x;
        }
      }
    }
  },
  toggleAll() {
    for (let autobuyer of this.list) {
      if (autobuyer.hasAutobuyer()) {
        autobuyer.setIsOn(!autobuyer.isOn());
        // Note that autobuyer.isOn() has been negated by the previous line.
        for (let checkbox of autobuyer.checkboxes()) {
          checkbox.checked = autobuyer.isOn();
        }
      }
    }
  },
  synchronize() {
    let newTimer = Math.min(player.slowAutobuyersTimer, player.fastAutobuyersTimer);
    player.slowAutobuyersTimer = newTimer;
    player.fastAutobuyersTimer = newTimer;
  },
  areNewlyUnlockedAutobuyersOn() {
    return player.areNewlyUnlockedAutobuyersOn;
  },
  setAreNewlyUnlockedAutobuyersOn(x) {
    player.areNewlyUnlockedAutobuyersOn = x;
    // This actually changes which locked autobuyers are on, behind the scenes.
    for (let i = 1; i <= 16; i++) {
      let autobuyer = this.get(i);
      // Don't touch the complexity autobuyer.
      if (!autobuyer.hasAutobuyer() && !this.isLockedResetAutobuyer(i) && i !== 15) {
        autobuyer.setIsOn(x);
        for (let checkbox of autobuyer.checkboxes()) {
          checkbox.checked = autobuyer.isOn();
        }
      }
    }
  },
  disableWhenStartingChallenge() {
    return player.disableAutobuyersWhenStarting.challenge;
  },
  setDisableWhenStartingChallenge() {
    player.disableAutobuyersWhenStarting.challenge = !player.disableAutobuyersWhenStarting.challenge;
  },
  disableWhenStartingInfinityChallenge() {
    return player.disableAutobuyersWhenStarting.infinityChallenge;
  },
  setDisableWhenStartingInfinityChallenge() {
    player.disableAutobuyersWhenStarting.infinityChallenge = !player.disableAutobuyersWhenStarting.infinityChallenge;
  },
  isLockedResetAutobuyer(x) {
    if (x < 12) return false;
    let layer = ['infinity', 'eternity', 'complexity', 'complexity', 'finality'][x - 12];
    return !Autobuyer(x).hasAutobuyer() && PrestigeLayerProgress.hasReached(layer);
  },
  anyLockedResetAutobuyers() {
    return [12, 13, 14, 15, 16].some(x => this.isLockedResetAutobuyer(x));
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
      Sacrifice.sacrifice(false);
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
      Prestige.prestige(false);
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
    } else if (mode === 'X times best of last ten') {
      shouldInfinity = InfinityPrestigeLayer.infinityPointGain().gte(player.stats.lastTenInfinities.map(x => x[1]).reduce(Decimal.max).times(priority));
    } else if (mode === 'Time past peak/sec') {
      InfinityPrestigeLayer.updatePeakIPPerSec();
      shouldInfinity = player.stats.timeSinceLastPeakIPPerSec >= priority.toNumber();
    } else if (mode === 'Fraction of peak/sec') {
      InfinityPrestigeLayer.updatePeakIPPerSec();
      shouldInfinity = InfinityPrestigeLayer.currentIPPerSec().lte(InfinityPrestigeLayer.peakIPPerSec().times(priority));
    }
    if (shouldInfinity) {
      InfinityPrestigeLayer.infinity(false);
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
    }  else if (mode === 'X times best of last ten') {
      shouldEternity = EternityPrestigeLayer.eternityPointGain().gte(player.stats.lastTenEternities.map(x => x[1]).reduce(Decimal.max).times(priority));
    } else if (mode === 'Time past peak/sec') {
      EternityPrestigeLayer.updatePeakEPPerSec();
      shouldEternity = player.stats.timeSinceLastPeakEPPerSec >= priority.toNumber();
    } else if (mode === 'Fraction of peak/sec') {
      EternityPrestigeLayer.updatePeakEPPerSec();
      shouldEternity = EternityPrestigeLayer.currentEPPerSec().lte(EternityPrestigeLayer.peakEPPerSec().times(priority));
    } else if (mode === 'Chroma amount') {
      // We use display amount here because colors were just updated,
      // potentially increasing the chroma amount (through orange, for example)
      // but not increasing the color amounts (or the display amount).
      // And if the player asked for x chroma, they probably wanted x of
      // whatever color they were producing, too.
      shouldEternity = Chroma.displayAmount() >= priority;
    } else if (mode === 'Chroma as fraction of cap') {
      shouldEternity = Chroma.displayAmount() >= Chroma.cap() * priority;
    }
    if (shouldEternity) {
      EternityPrestigeLayer.eternity(false);
    }
  },
  gainPermanence() {
    if (!Autobuyer(14).isActive() || !Permanence.canGainPermanence()) return;
    let shouldGainPermanence;
    let mode = Autobuyer(14).mode();
    let priority = Autobuyer(14).priority();
    if (mode === 'Amount') {
      shouldGainPermanence = Permanence.permanenceGain().gte(priority);
    } else if (mode === 'Time') {
      shouldGainPermanence = player.stats.timeSincePermanenceGain >= priority.toNumber();
    } else if (mode === 'X times last') {
      shouldGainPermanence = Permanence.permanenceGain().gte(player.stats.lastPermanenceGain.times(priority));
    }
    if (shouldGainPermanence) {
      Permanence.gainPermanence();
    }
  },
  complexity() {
    if (!Autobuyer(15).isActive() || !ComplexityPrestigeLayer.canComplexity()) return;
    let shouldComplexity;
    let mode = Autobuyer(15).mode();
    let priority = Autobuyer(15).priority();
    if (mode === 'Amount') {
      shouldComplexity = ComplexityPrestigeLayer.complexityPointGain().gte(priority);
    } else if (mode === 'Time') {
      shouldComplexity = player.stats.timeSinceComplexity >= priority.toNumber();
    } else if (mode === 'X times last') {
      shouldComplexity = ComplexityPrestigeLayer.complexityPointGain().gte(player.stats.lastTenComplexities[0][1].times(priority));
    }  else if (mode === 'X times best of last ten') {
      shouldComplexity = ComplexityPrestigeLayer.complexityPointGain().gte(player.stats.lastTenComplexities.map(x => x[1]).reduce(Decimal.max).times(priority));
    } else if (mode === 'Time past peak/sec') {
      ComplexityPrestigeLayer.updatePeakCPPerSec();
      shouldComplexity = player.stats.timeSinceLastPeakCPPerSec >= priority.toNumber();
    } else if (mode === 'Fraction of peak/sec') {
      ComplexityPrestigeLayer.updatePeakCPPerSec();
      shouldComplexity = ComplexityPrestigeLayer.currentCPPerSec().lte(ComplexityPrestigeLayer.peakCPPerSec().times(priority));
    }
    if (shouldComplexity) {
      ComplexityPrestigeLayer.complexity(false);
    }
  },
  finality() {
    if (!Autobuyer(16).isActive() || !FinalityPrestigeLayer.canFinality()) return;
    FinalityPrestigeLayer.finality(false);
  },
  slowAutobuyersTimerLength() {
    return Math.max(16, player.autobuyersTimerLength);
  },
  // The below two methods don't need to be separate but they sort of
  // serve slightly different functions.
  fastAutobuyersTimerLength() {
    return player.autobuyersTimerLength;
  },
  autobuyersTimerLength() {
    return player.autobuyersTimerLength;
  },
  timeUntilNextSlowTrigger() {
    return this.slowAutobuyersTimerLength() - player.slowAutobuyersTimer;
  },
  timeUntilNextFastTrigger() {
    return this.fastAutobuyersTimerLength() - player.fastAutobuyersTimer;
  },
  setAutobuyersTimerLength(x) {
    player.autobuyersTimerLength = x || 0;
  },
  mod(a, b) {
    return (b > 0) ? a % b : 0;
  },
  tick(diff) {
    player.slowAutobuyersTimer += diff;
    let triggerSlowAutobuyers = player.slowAutobuyersTimer >= this.slowAutobuyersTimerLength();
    player.slowAutobuyersTimer = this.mod(player.slowAutobuyersTimer, this.slowAutobuyersTimerLength());
    player.fastAutobuyersTimer += diff;
    let triggerFastAutobuyers = player.fastAutobuyersTimer >= this.fastAutobuyersTimerLength();
    player.fastAutobuyersTimer = this.mod(player.fastAutobuyersTimer, this.fastAutobuyersTimerLength());
    if (triggerFastAutobuyers) {
      Autobuyers.infinity();
      Autobuyers.eternity();
      Autobuyers.gainPermanence();
      Autobuyers.complexity();
      Autobuyers.finality();
      Autobuyers.prestige();
      Autobuyers.sacrifice();
    }
    for (let autobuyer of this.priorityOrder()) {
      autobuyer.tick(triggerSlowAutobuyers, triggerFastAutobuyers);
    }
  }
}
