let Prestige = {
  prestigePower() {
    return player.prestigePower;
  },
  setPrestigePower(x) {
    player.prestigePower = x;
  },
  multiplier() {
    return this.prestigePower();
  },
  isPrestigeDisabled() {
    return Challenge.isChallengeEffectActive(10) || EternityChallenge.isEternityChallengeRunning(3);
  },
  prestigePowerExponent() {
    if (this.isPrestigeDisabled()) {
      return 0;
    }
    let isPrestigePowerSquareRooted = [8, 11].indexOf(Challenge.currentChallenge()) !== -1 ||
      [2, 7].indexOf(InfinityChallenge.currentInfinityChallenge()) !== -1;
    let expComponents = [
      InfinityChallenge.isInfinityChallengeRunning(3) ? InfinityChallenge.infinityChallenge3PrestigePowerExponent() : 1,
      InfinityChallenge.isInfinityChallengeRunning(6) ? InfinityChallenge.infinityChallenge6PrestigePowerExponent() : 1,
      InfinityChallenge.isInfinityChallengeCompleted(6) ? InfinityChallenge.infinityChallenge6Reward() : 1,
      EternityChallenge.getEternityChallengeReward(3), isPrestigePowerSquareRooted ? 0.5 : 1
    ];
    return expComponents.reduce((a, b) => a * b);
  },
  prestigeRequirement() {
    return Decimal.pow(2, Math.max(128, 96 + 16 * Decimal.log2(this.prestigePower()) / this.prestigePowerExponent()));
  },
  bestStarsThisPrestige() {
    return player.stats.bestStarsThisPrestige;
  },
  canPrestige() {
    return this.bestStarsThisPrestige().gte(this.prestigeRequirement()) && Stars.canBuyThings() && !this.isPrestigeDisabled();
  },
  prestigeRequirementText() {
    if (this.isPrestigeDisabled()) {
      let challenges = [];
      if (Challenge.isChallengeEffectActive(10)) {
        challenges.push('Challenge ' + formatOrdinalInt(10));
      } else if (EternityChallenge.isEternityChallengeRunning(3)) {
        challenges.push('Eternity Challenge '  + formatOrdinalInt(3));
      }
      return 'to not be in ' + challenges.join(' or ');
    }
    if (!Stars.canBuyThings()) {
      return Stars.cannotBuyThingsReason();
    }
    return format(Prestige.prestigeRequirement()) + ' stars';
  },
  updatePrestigePossible() {
    if (!this.canPrestige()) {
      player.stats.timeSincePrestigePossible = 0;
    }
  },
  isVisible() {
    // This basically used to be as follows: (this.canPrestige() || this.prestigePower().gt(1) || player.infinities > 0 || player.eternities.gt(0)) && !this.isPrestigeDisabled();
    // Seeing that things are possible probably isn't too intimidating, so I'm experimenting with making it true unless prestige is disabled.
    // The above experiment has failed to some extent; it's now not visible immediately, but becomes visible long before you can do it.
    return !this.isPrestigeDisabled() && SpecialDivs.isDivVisible('prestige');
  },
  newPrestigePower() {
    return this.canPrestige() ? Decimal.pow(2, this.prestigePowerExponent() * (this.bestStarsThisPrestige().max(1).log(2) - 96) / 16) : this.prestigePower();
  },
  prestigePowerGain() {
    return this.newPrestigePower().minus(this.prestigePower());
  },
  prestigePowerMultGain() {
    return this.newPrestigePower().div(this.prestigePower());
  },
  prestigeConfirmationMessage() {
    return 'Are you sure you want to prestige to increase your prestige power from ' +
      format(this.prestigePower()) + ' to ' + format(this.newPrestigePower()) + '?';
  },
  prestige(manual) {
    if (!this.canPrestige()) return;
    if (manual && Options.confirmation('prestige') && !confirm(this.prestigeConfirmationMessage())) return;
    Achievements.checkForAchievements('prestige');
    this.setPrestigePower(this.newPrestigePower());
    player.stats.prestigesThisInfinity++;
    Goals.recordPrestige('prestige');
    this.prestigeReset(false, null);
  },
  prestigeReset(fromHigher, newLimit) {
    if (fromHigher || !EternityMilestones.isEternityMilestoneActive(8)) {
      Stars.setAmount(Stars.startingAmount(), newLimit);
      player.boost = {bought: 0};
      player.generators = initialGenerators();
      player.highestGenerator = 0;
      player.sacrificeMultiplier = new Decimal(1);
    }
    // Prestiging still resets times (this matters in a few challenges
    // and in stats tab). It also still resets best stars.
    player.stats.bestStarsThisSacrifice = Stars.amount();
    player.stats.bestStarsThisPrestige = Stars.amount();
    player.stats.timeSincePurchase = 0;
    player.stats.timeSinceSacrifice = 0;
    player.stats.timeSincePrestige = 0;
    player.stats.timeSinceSacrificePossible = 0;
    player.stats.timeSincePrestigePossible = 0;
  }
}
