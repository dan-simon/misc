let Sacrifice = {
  sacrificeMultiplier() {
    return player.sacrificeMultiplier;
  },
  setSacrificeMultiplier(x) {
    player.sacrificeMultiplier = x;
  },
  hasStrongerSacrifice() {
    return InfinityChallenge.isInfinityChallengeRunning(2) || InfinityChallenge.isInfinityChallengeCompleted(2);
  },
  sacrificeExponent() {
    if (InfinityChallenge.isInfinityChallengeRunning(2)) {
      return 1 / 8;
    } else if (InfinityChallenge.isInfinityChallengeCompleted(2)) {
      return 1 / 64;
    } else {
      return 0;
    }
  },
  sacrificeRequirement() {
    // Decimal.pow(2, Infinity) is 0, but Decimal.pow(2, 1e20) isn't,
    // so we take the min with 1e20 in case this.sacrificeMultiplier()
    // is too big to be converted to number.
    let req = Decimal.pow(2, 16 * (Challenge.isChallengeEffectActive(10) ? 1 : this.sacrificeMultiplier().min(1e20).toNumber()));
    if (this.hasStrongerSacrifice()) {
      req = req.min(this.sacrificeMultiplier().pow(1 / this.sacrificeExponent()));
    }
    return req;
  },
  bestStarsThisSacrifice() {
    return player.stats.bestStarsThisSacrifice;
  },
  canSacrifice() {
    return Generator(8).amount().gt(0) && this.bestStarsThisSacrifice().gte(this.sacrificeRequirement()) && Stars.canBuyThings();
  },
  sacrificeRequirementText() {
    // Note that without an intervening sacrifice (or prestige, etc.)
    // only one of the last two requirement conditions (stars and
    // at least one Generator 8) should be visible.
    // If initially the player has no Generator 8, when they can buy a Generator 8
    // their best stars will increase to enough that they can sacrifice,
    // so the star requirement will disappear at that point.
    if (!Stars.canBuyThings()) {
      return Stars.cannotBuyThingsReason();
    } else if (Generator(8).amount().gt(0)) {
      return format(this.sacrificeRequirement()) + ' stars';
    } else {
      return 'at least one of Generator ' + formatOrdinalInt(8);
    }
  },
  updateSacrificePossible() {
    if (!this.canSacrifice()) {
      player.stats.timeSinceSacrificePossible = 0;
    }
  },
  isVisible() {
    // This basically used to be as follows: this.canSacrifice() || this.sacrificeMultiplier().gt(1) || player.infinities > 0 || player.eternities.gt(0);
    // Seeing that things are possible probably isn't too intimidating, so I'm experimenting with making it always true.
    // Actually let's hide it if G8 is impossible to get (also covers IC1).
    // Note: Long after the above comments were written, made this stricter (you can basically only see it once you can do it).
    return !Challenge.isChallengeEffectActive(6) && SpecialDivs.isDivVisible('sacrifice');
  },
  newSacrificeMultiplier() {
    let stars = this.bestStarsThisSacrifice();
    let mult = new Decimal(stars.log(2) / 16);
    if (this.hasStrongerSacrifice()) {
      mult = mult.max(stars.pow(this.sacrificeExponent()));
    }
    if (Challenge.isChallengeEffectActive(10)) {
      mult = mult.times(this.sacrificeMultiplier());
    }
    return this.canSacrifice() ? mult : this.sacrificeMultiplier();
  },
  sacrificeMultiplierGain() {
    return this.newSacrificeMultiplier().minus(this.sacrificeMultiplier());
  },
  sacrificeMultiplierMultGain() {
    return this.newSacrificeMultiplier().div(this.sacrificeMultiplier());
  },
  sacrificeConfirmationMessage() {
    return 'Are you sure you want to sacrifice to increase your sacrifice multiplier from ' +
      format(this.sacrificeMultiplier()) + ' to ' + format(this.newSacrificeMultiplier()) + '?';
  },
  sacrifice(manual) {
    if (!this.canSacrifice()) return;
    if (manual && Options.confirmation('sacrifice') && !confirm(this.sacrificeConfirmationMessage())) return;
    Achievements.checkForAchievements('sacrifice');
    this.setSacrificeMultiplier(this.newSacrificeMultiplier());
    player.stats.sacrificesThisInfinity++;
    Goals.recordPrestige('sacrifice');
    this.sacrificeReset();
  },
  sacrificeReset() {
    if (Challenge.isChallengeEffectActive(10)) {
      // Challenge 10 overrides Eternity Milestone 4.
      Stars.setAmount(Stars.startingAmount(), null);
      player.boost = {bought: 0};
      player.generators = initialGenerators();
      player.highestGenerator = 0;
    } else if (!EternityMilestones.isEternityMilestoneActive(6)) {
      Generators.resetAmounts(7);
    }
    // Sacrificing still resets times (this matters in a few challenges
    // and in stats tab). It also still resets best stars.
    player.stats.bestStarsThisSacrifice = Stars.amount();
    player.stats.timeSincePurchase = 0;
    player.stats.timeSinceSacrifice = 0;
    player.stats.timeSinceSacrificePossible = 0;
  }
}
