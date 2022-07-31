let FinalityMilestones = {
  finalityMilestoneRequirements: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 32, 64],
  getFinalityMilestoneRequirement(x) {
    return this.finalityMilestoneRequirements[x - 1];
  },
  hasFinalityMilestone(x) {
    return player.finalities >= this.getFinalityMilestoneRequirement(x);
  },
  hasAllFinalityMilestones() {
    return this.hasFinalityMilestone(16);
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
    return this.isFinalityMilestoneActive(3) ? this.rawStartingComplexityPoints() : new Decimal(0);
  },
  rawStartingComplexityPoints() {
    return new Decimal(2);
  },
  keptComplexityChallenges() {
    return this.isFinalityMilestoneActive(4) ? this.rawKeptComplexityChallenges() : 0;
  },
  rawKeptComplexityChallenges() {
    return Math.floor(Math.pow(2, Math.min(16, player.finalities) / 2));
  },
  freeTimeInComplexity() {
    return FinalityMilestones.isFinalityMilestoneActive(15) ? this.rawFreeTimeInComplexity() : 0;
  },
  rawFreeTimeInComplexity() {
    // This only takes effect once you get 32 finalities, making it unclear why
    // it's always at least 1. But it doesn't matter so I'm not planning on changing it.
    return Math.min(16, Math.max(1, Math.sqrt(player.finalities)));
  },
  color(x) {
    return Colors.makeStyle(this.milestoneStatusNumber(x), false);
  }
}
