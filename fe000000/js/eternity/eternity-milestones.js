let EternityMilestones = {
  hasEternityMilestone(x) {
    return player.eternities.gte(x);
  },
  hasAllEternityMilestones() {
    return this.hasEternityMilestone(16);
  },
  isEternityMilestoneDisabled(x) {
    if (x === 6 || x === 8) {
      return !player.eternityMilestonesEnabled[[6, 8].indexOf(x)];
    } else {
      return false;
    }
  },
  isEternityMilestoneActive(x) {
    return this.hasEternityMilestone(x) && !this.isEternityMilestoneDisabled(x);
  },
  toggleMilestone(x) {
    if (x === 6 || x === 8) {
      player.eternityMilestonesEnabled[[6, 8].indexOf(x)] = !player.eternityMilestonesEnabled[[6, 8].indexOf(x)];
    }
  },
  milestoneStatusDescription(x) {
    if (this.isEternityMilestoneActive(x)) {
      return 'Active';
    } else if (!this.hasEternityMilestone(x)) {
      return 'Locked';
    } else if (this.isEternityMilestoneDisabled(x)) {
      return 'Disabled';
    }
  },
  milestoneStatusNumber(x) {
    if (this.isEternityMilestoneActive(x)) {
      return 1;
    } else if (!this.hasEternityMilestone(x)) {
      return 0;
    } else if (this.isEternityMilestoneDisabled(x)) {
      return 0.5;
    }
  },
  isExplanationMovedDown() {
    return player.isEternityMilestoneExplanationMovedDown;
  },
  moveExplanation() {
    player.isEternityMilestoneExplanationMovedDown = !player.isEternityMilestoneExplanationMovedDown;
  },
  color(x) {
    return Colors.makeStyle(this.milestoneStatusNumber(x), false);
  }
}
