let FinalityMilestones = {
  finalityMilestoneRequirements: [2, 4, 6, 8, 10, 12, 14, 16, 32, 64],
  getFinalityMilestoneRequirement(x) {
    return this.finalityMilestoneRequirements[x - 1];
  },
  hasFinalityMilestone(x) {
    return player.finalities >= this.getFinalityMilestoneRequirement(x);
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
  freeTimeInComplexity() {
    return FinalityMilestones.isFinalityMilestoneActive(9) ? this.rawFreeTimeInComplexity() : 0;
  },
  rawFreeTimeInComplexity() {
    return Math.min(16, Math.max(1, Math.sqrt(player.finalities)));
  },
  color(x) {
    return Colors.makeStyle(this.milestoneStatusNumber(x), false);
  }
}
