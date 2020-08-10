let FinalityMilestones = {
  hasFinalityMilestone(x) {
    return player.finalities >= 2 * x;
  },
  hasAllFinalityMilestones() {
    return this.hasEternityMilestone(8);
  },
  isFinalityMilestoneActive(x) {
    return this.hasFinalityMilestone(x);
  },
  milestoneStatusDescription(x) {
    if (this.isFinalityMilestoneActive(x)) {
      return 'Active';
    } else if (!this.hasFinalityMilestone(x)) {
      return 'Locked';
    } else {
      return 'Disabled';
    }
  },
  milestoneStatusNumber(x) {
    if (this.isFinalityMilestoneActive(x)) {
      return 1;
    } else if (!this.hasFinalityMilestone(x)) {
      return 0;
    } else {
      return 0.5;
    }
  },
  startingComplexityPoints() {
    return this.isFinalityMilestoneActive(2) ? this.rawStartingComplexityPoints() : new Decimal(0);
  },
  rawStartingComplexityPoints() {
    return new Decimal(2);
  },
  keptComplexityChallenges() {
    return this.isFinalityMilestoneActive(2) ? this.rawKeptComplexityChallenges() : 0;
  },
  rawKeptComplexityChallenges() {
    return Math.floor(Math.pow(2, Math.min(16, player.finalities) / 2));
  },
  color(x) {
    return Colors.makeStyle(this.milestoneStatusNumber(x), false);
  }
}
