let Goals = {
  goalText: [
    'Sacrifice.', 'Prestige.', 'Infinity.', 'Break infinity.',
    'Complete an infinity challenge.', 'Eternity.', 'Complete all eternity milestones.', 'Unlock the Eternity Producer.',
    'Complete an eternity challenge.', 'Unlock chroma.', 'Complexity.', 'Complete all complexity achievements.',
    'Unlock powers.', 'Unlock galaxies.', 'Finality.', 'Buy the maximum possible of all finality shard upgrades.'
  ],
  goalConditions: [
    null, null, null, () => InfinityPrestigeLayer.isBreakInfinityOn(),
    () => InfinityChallenge.numberOfInfinityChallengesCompleted() > 0, null,
    () => EternityMilestones.hasAllEternityMilestones(), () => EternityProducer.isUnlocked(),
    () => EternityChallenge.getTotalEternityChallengeCompletions() > 0, () => Chroma.isUnlocked(),
    null, () => ComplexityAchievements.getTotalAchievementsUnlocked() >= 16,
    () => Powers.isUnlocked(), () => Galaxy.isUnlocked(), null, () => FinalityShards.areAllUpgradesCapped()
  ],
  prestigeNameToGoalNumber: {
    'sacrifice': 1,
    'prestige': 2,
    'infinity': 3,
    'eternity': 6,
    'complexity': 11,
    'finality': 15
  },
  checkForGoals() {
    for (let i = 1; i <= 16; i++) {
      if (this.goalConditions[i - 1] !== null && this.goalConditions[i - 1]()) this.giveGoal(i);
    }
  },
  recordPrestige(x) {
    this.giveGoal(this.prestigeNameToGoalNumber[x]);
  },
  numberOfGoals() {
    return 16;
  },
  giveGoal(i) {
    if (!player.goals[i - 1]) {
      player.goals[i - 1] = true;
      player.goalTimes[i - 1] = [player.stats.timeSinceGameStart, player.stats.onlineTimeSinceGameStart];
    }
  },
  hasGoal(i) {
    return player.goals[i - 1];
  },
  highestGoalReached() {
    // Since -1 + 1 = 0, this happens to be correct even if none of the goals
    // are reached.
    return player.goals.lastIndexOf(true) + 1;
  },
  displayAllGoals() {
    // Note that if the player has gotten far enough, this might be false
    // despite all goals being displayed.
    return player.displayAllGoals;
  },
  displayGoal(i) {
    return i <= this.highestGoalReached() + 1 || player.displayAllGoals;
  },
  toggleDisplayAllGoals() {
    player.displayAllGoals = !player.displayAllGoals;
  },
  showTimes() {
    return player.showGoalTimes;
  },
  toggleTimes() {
    player.showGoalTimes = !player.showGoalTimes;
  },
  showTotalTime(x) {
    let t = player.goalTimes[x - 1][0];
    if (t === null) {
      return 'unknown';
    } else {
      return formatTime(t, {seconds: {f: formatTimeNum, s: false}, larger: {f: formatTimeNum, s: false}});
    }
  },
  showOnlineTime(x) {
    let t = player.goalTimes[x - 1][1];
    if (t === null) {
      return 'unknown';
    } else {
      return formatTime(t, {seconds: {f: formatTimeNum, s: false}, larger: {f: formatTimeNum, s: false}});
    }
  },
  numberOfGoalsCompleted() {
    return player.goals.reduce((a, b) => a + b)
  },
  areAllGoalsCompleted() {
    return this.numberOfGoalsCompleted() === 16;
  },
  getGoalText(i) {
    if (this.displayGoal(i)) {
      return this.goalText[i - 1].replace(/\d+/g, x => formatInt(+x));
    } else {
      // This is not a placeholder.
      return '???';
    }
  },
  getGoalTooltip(i) {
    // Can assume goal is displayed
    // This is used on goals so we don't want it to update if the player is e.g. in an infinity challenge.
    // Thus we use raw numbers rather than methods.
    if (i === 1) {
      return 'Sacrifice requires at least one of Generator ' + formatOrdinalInt(8) + ' (costing ' + format(Decimal.pow(2, 64)) + ' stars).';
    } else if (i == 2) {
      return 'Prestige requires ' + format(Decimal.pow(2, 128)) + ' stars.';
    } else if (i === 3) {
      return 'Infinity requires ' + format(Decimal.pow(2, 256)) + ' stars.';
    }
  },
  getGoalStatusDescription(i) {
    if (this.hasGoal(i)) {
      return 'Reached';
    } else {
      return 'Not reached'
    }
  },
  color(x) {
    return Colors.makeStyle(this.hasGoal(x), false);
  }
}
