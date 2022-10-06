let Autobuyer = function (i) {
  if (defined.autobuyers) {
    return Autobuyers.get(i);
  }
  return {
    hasAutobuyer() {
      if (i === 13) {
        return EternityMilestones.isEternityMilestoneActive(16);
      } else if (i === 14) {
        return ComplexityAchievements.isComplexityAchievementActive(2, 2);
      } else if (i === 15) {
        return ComplexityAchievements.isAchievementsUnlockedRewardActive(4);
      } else if (i === 16) {
        return FinalityMilestones.isFinalityMilestoneActive(14);
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
      // As with boosts, we could use safeMinus here in theory, but the cost calculation should be as accurate as possible.
      return i <= 9 && !this.hasAutobuyer() && player.stars.minus(this.unlockSlowCost()).gte(Stars.requiredUnspent());
    },
    unlockSlow() {
      if (!this.canUnlockSlow()) return;
      player.slowAutobuyers[i] = true;
      player.stars = player.stars.safeMinus(this.unlockSlowCost());
    },
    unlockSlowCost() {
      return Decimal.pow(2, 2 * Math.pow(i, 2));
    },
    hasReachedDisplayThreshold() {
      return player.stats.totalStarsProduced.gte(this.unlockSlowCost().pow(0.875)) || i === 1 ||
        (i === 9 ? SpecialDivs.isDivVisible('boosts') : (Generator(i).isVisible() || PrestigeLayerProgress.hasReached('sacrifice')));
    },
    isOn() {
      return player.autobuyers[i - 1].isOn;
    },
    hasGeneration() {
      if (i < 12) {
        return false;
      }
      return [
        EternityChallenge.isTotalCompletionsRewardActive(3),
        Powers.isUnlocked() || FinalityMilestones.isFinalityMilestoneActive(8),
        Permanence.hasPassiveProduction(),
        FinalityMilestones.isFinalityMilestoneActive(16),
        false
      ][i - 12];
    },
    isActive() {
      // change to
      // return this.hasAutobuyer() && (this.hasGeneration() ? this.isOnDespiteSuspended() : this.isOn());
      // if people want change back
      return this.hasAutobuyer() && this.isOn() && (this.hasGeneration() ? this.isOnDespiteSuspended() : true);
    },
    isOnDespiteSuspended() {
      return 12 <= i && i <= 15 && player.options.autobuyers.isOnDespiteSuspended[i - 12];
    },
    setIsOnDespiteSuspended(x) {
      player.options.autobuyers.isOnDespiteSuspended[i - 12] = x;
    },
    mode() {
      return player.autobuyers[i - 1].mode;
    },
    displayMode() {
      let m = this.mode();
      if (m === 'X times best of last ten') {
        return 'X times best of last ' + numbers[Stats.lastRunsToShow()];
      } else {
        return m;
      }
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
      if ([10, 11, 12, 13, 14, 15].includes(i)) {
        NotationOptions.notationChangeAutobuyers([i]);
      }
    },
    setPriority(x) {
      player.autobuyers[i - 1].priority = x || 0;
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
    canTick(triggerSlowAutobuyers, triggerFastAutobuyers) {
      return this.isActive() && (this.isSlow() ? triggerSlowAutobuyers : triggerFastAutobuyers);
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
  turnAllOnOrOff() {
    let values = this.list.filter(x => x.hasAutobuyer()).map(x => x.isOn());
    // If at most half are on, turn all on. Otherwise, turn all off.
    this.setAll(values.filter(x => x).length <= values.length / 2);
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
  toggleSome(x) {
    if (typeof x === 'number') {
      x = [x];
    }
    for (let i of x) {
      let autobuyer = this.list[i - 1];
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
  anyNonGeneratorAndBoostDisplay() {
    // This is only used for showing the option to hide generator and boost autobuyers.
    return this.list.slice(9).some(i => i.hasAutobuyer()) || PrestigeLayerProgress.hasReached('eternity');
  },
  showGeneratorAndBoost() {
    return player.options.autobuyers.showGeneratorAndBoostAutobuyers;
  },
  toggleShowGeneratorAndBoost() {
    player.options.autobuyers.showGeneratorAndBoostAutobuyers = !player.options.autobuyers.showGeneratorAndBoostAutobuyers;
  },
  areNewlyUnlockedAutobuyersOn() {
    return player.options.autobuyers.areNewlyUnlockedAutobuyersOn;
  },
  setAreNewlyUnlockedAutobuyersOn(x) {
    player.options.autobuyers.areNewlyUnlockedAutobuyersOn = x;
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
    return player.options.autobuyers.disableAutobuyersWhenStarting.challenge;
  },
  setDisableWhenStartingChallenge() {
    player.options.autobuyers.disableAutobuyersWhenStarting.challenge = !player.options.autobuyers.disableAutobuyersWhenStarting.challenge;
  },
  disableWhenStartingInfinityChallenge() {
    return player.options.autobuyers.disableAutobuyersWhenStarting.infinityChallenge;
  },
  setDisableWhenStartingInfinityChallenge() {
    player.options.autobuyers.disableAutobuyersWhenStarting.infinityChallenge = !player.options.autobuyers.disableAutobuyersWhenStarting.infinityChallenge;
  },
  isLockedResetAutobuyer(x) {
    if (x < 12) return false;
    let layer = ['infinity', 'eternity', 'complexity', 'complexity', 'finality'][x - 12];
    return !Autobuyer(x).hasAutobuyer() && PrestigeLayerProgress.hasReached(layer);
  },
  anyLockedResetAutobuyers() {
    return [12, 13, 14, 15, 16].some(x => this.isLockedResetAutobuyer(x));
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
    } else if (mode === 'Time since possible') {
      Sacrifice.updateSacrificePossible();
      shouldSacrifice = Sacrifice.canSacrifice() && player.stats.timeSinceSacrificePossible >= priority.toNumber();
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
    } else if (mode === 'Time since possible') {
      Prestige.updatePrestigePossible();
      shouldPrestige = Prestige.canPrestige() && player.stats.timeSincePrestigePossible >= priority.toNumber();
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
      shouldInfinity = InfinityPrestigeLayer.infinityPointGain().gte(player.stats.lastTenInfinities.slice(0, Stats.lastRunsToShow()).map(x => x[1]).reduce(Decimal.max, new Decimal(0)).times(priority));
    } else if (mode === 'Time past peak/sec') {
      InfinityPrestigeLayer.updatePeakIPPerSec();
      shouldInfinity = player.stats.timeSinceLastPeakIPPerSec >= priority.toNumber();
    } else if (mode === 'Fraction of peak/sec') {
      InfinityPrestigeLayer.updatePeakIPPerSec();
      shouldInfinity = InfinityPrestigeLayer.currentIPPerSec().lte(InfinityPrestigeLayer.peakIPPerSec().times(priority));
    } else if (mode === 'Time past peak log/sec') {
      InfinityPrestigeLayer.updatePeakLogIPPerSec();
      shouldInfinity = player.stats.timeSinceLastPeakLogIPPerSec >= priority.toNumber();
    } else if (mode === 'Fraction of peak log/sec') {
      InfinityPrestigeLayer.updatePeakLogIPPerSec();
      let current = InfinityPrestigeLayer.currentLogIPPerSec();
      shouldInfinity = 0 < current && current <= InfinityPrestigeLayer.peakLogIPPerSec() * priority;
    } else if (mode === 'Time since gain was amount') {
      InfinityPrestigeLayer.compareIPGain();
      shouldInfinity = InfinityPrestigeLayer.infinityPointGain().gte(InfinityPrestigeLayer.infinityPoints()) && player.stats.timeSinceIPGainWasAmount >= priority.toNumber();
    } else if (mode === 'Time since gain was total') {
      InfinityPrestigeLayer.compareIPGain();
      shouldInfinity = InfinityPrestigeLayer.infinityPointGain().gte(InfinityPrestigeLayer.totalInfinityPoints()) && player.stats.timeSinceIPGainWasTotal >= priority.toNumber();
    }
    if (shouldInfinity) {
      InfinityPrestigeLayer.infinity(false, null);
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
      shouldEternity = EternityPrestigeLayer.eternityPointGain().gte(player.stats.lastTenEternities.slice(0, Stats.lastRunsToShow()).map(x => x[1]).reduce(Decimal.max, new Decimal(0)).times(priority));
    } else if (mode === 'Time past peak/sec') {
      EternityPrestigeLayer.updatePeakEPPerSec();
      shouldEternity = player.stats.timeSinceLastPeakEPPerSec >= priority.toNumber();
    } else if (mode === 'Fraction of peak/sec') {
      EternityPrestigeLayer.updatePeakEPPerSec();
      shouldEternity = EternityPrestigeLayer.currentEPPerSec().lte(EternityPrestigeLayer.peakEPPerSec().times(priority));
    } else if (mode === 'Time past peak log/sec') {
      EternityPrestigeLayer.updatePeakLogEPPerSec();
      shouldEternity = player.stats.timeSinceLastPeakLogEPPerSec >= priority.toNumber();
    } else if (mode === 'Fraction of peak log/sec') {
      EternityPrestigeLayer.updatePeakLogEPPerSec();
      let current = EternityPrestigeLayer.currentLogEPPerSec();
      shouldEternity = 0 < current && current <= EternityPrestigeLayer.peakLogEPPerSec() * priority;
    } else if (mode === 'Time since gain was amount') {
      EternityPrestigeLayer.compareEPGain();
      shouldEternity = EternityPrestigeLayer.eternityPointGain().gte(EternityPrestigeLayer.eternityPoints()) && player.stats.timeSinceEPGainWasAmount >= priority.toNumber();
    } else if (mode === 'Time since gain was total') {
      EternityPrestigeLayer.compareEPGain();
      shouldEternity = EternityPrestigeLayer.eternityPointGain().gte(EternityPrestigeLayer.totalEternityPoints()) && player.stats.timeSinceEPGainWasTotal >= priority.toNumber();
    } else if (mode === 'Chroma amount') {
      // We use display amount here because colors were just updated,
      // potentially increasing the chroma amount (through orange, for example)
      // but not increasing the color amounts (or the display amount).
      // And if the player asked for x chroma, they probably wanted x of
      // whatever color they were producing, too.
      shouldEternity = Chroma.displayAmount() >= priority.toNumber();
    } else if (mode === 'Chroma as fraction of cap') {
      shouldEternity = Chroma.displayAmount() >= Chroma.cap() * priority.toNumber();
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
      Permanence.gainPermanence(false);
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
    } else if (mode === 'X times best of last ten') {
      shouldComplexity = ComplexityPrestigeLayer.complexityPointGain().gte(player.stats.lastTenComplexities.slice(0, Stats.lastRunsToShow()).map(x => x[1]).reduce(Decimal.max, new Decimal(0)).times(priority));
    } else if (mode === 'Time past peak/sec') {
      ComplexityPrestigeLayer.updatePeakCPPerSec();
      shouldComplexity = ComplexityPrestigeLayer.complexityPointGain().gte(ComplexityPrestigeLayer.complexityPoints()) && player.stats.timeSinceLastPeakCPPerSec >= priority.toNumber();
    } else if (mode === 'Fraction of peak/sec') {
      ComplexityPrestigeLayer.updatePeakCPPerSec();
      shouldComplexity = ComplexityPrestigeLayer.complexityPointGain().gte(ComplexityPrestigeLayer.totalComplexityPoints()) && ComplexityPrestigeLayer.currentCPPerSec().lte(ComplexityPrestigeLayer.peakCPPerSec().times(priority));
    } else if (mode === 'Time past peak log/sec') {
      ComplexityPrestigeLayer.updatePeakLogCPPerSec();
      shouldComplexity = player.stats.timeSinceLastPeakLogCPPerSec >= priority.toNumber();
    } else if (mode === 'Fraction of peak log/sec') {
      ComplexityPrestigeLayer.updatePeakLogCPPerSec();
      let current = ComplexityPrestigeLayer.currentLogCPPerSec();
      shouldComplexity = 0 < current && current <= ComplexityPrestigeLayer.peakLogCPPerSec() * priority;
    } else if (mode === 'Time since gain was amount') {
      ComplexityPrestigeLayer.compareCPGain();
      shouldComplexity = player.stats.timeSinceCPGainWasAmount >= priority.toNumber();
    } else if (mode === 'Time since gain was total') {
      ComplexityPrestigeLayer.compareCPGain();
      shouldComplexity = player.stats.timeSinceCPGainWasTotal >= priority.toNumber();
    } else if (mode === 'Eternity power extra multiplier') {
      shouldComplexity = Powers.getExtraMultiplier('eternity') >= priority.toNumber();
    } else if (mode === 'Galaxy effect (0 means cap)') {
      // If priority is 0, this uses Galaxy.effectCap() instead.
      shouldComplexity = Galaxy.effect() >= (priority.toNumber() || Galaxy.effectCap());
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
    let autobuyers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => Autobuyer(x).canTick(triggerSlowAutobuyers, triggerFastAutobuyers));
    let singles = autobuyers.filter(x => Autobuyer(x).mode() === 'Buy singles');
    MaxAll.maxAll(autobuyers, singles);
  }
}

defined.autobuyers = true;
