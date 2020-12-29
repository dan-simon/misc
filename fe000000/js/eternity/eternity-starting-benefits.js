let EternityStartingBenefits = {
  stars() {
    if (EternityMilestones.isEternityMilestoneActive(1)) {
      return this.rawStars();
    } else {
      return new Decimal(2);
    }
  },
  rawStars() {
    // This is written this way for consistency with starting IP.
    return Decimal.pow(2, Math.min(128, 2 * player.eternities.toNumber()));
  },
  infinityPoints() {
    if (EternityMilestones.isEternityMilestoneActive(3)) {
      return this.rawInfinityPoints();
    } else {
      return new Decimal(0);
    }
  },
  rawInfinityPoints() {
    return Decimal.pow(2, Math.min(128, player.eternities.toNumber() / 2)).floor();
  },
  infinities() {
    if (EternityMilestones.isEternityMilestoneActive(5)) {
      return this.rawInfinities();
    } else {
      return 0;
    }
  },
  rawInfinities() {
    return Math.pow(Math.min(16, player.eternities.toNumber()), 2);
  },
  infinityChallenges() {
    if (EternityMilestones.isEternityMilestoneActive(4)) {
      return this.rawInfinityChallenges();
    } else {
      return 0;
    }
  },
  rawInfinityChallenges() {
    return Math.min(8, Math.floor(player.eternities.toNumber()));
  },
  rawInfinityChallengesText() {
    let x = this.rawInfinityChallenges();
    if (x === 1) {
      return 'the first infinity challenge';
    } else if (x === 8) {
      return 'all ' + formatInt(8) + ' infinity challenges';
    } else {
      return 'the first ' + formatInt(x) + ' infinity challenges';
    }
  }
}
