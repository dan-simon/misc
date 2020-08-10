let Goals = {
  goalText: [
    'Sacrifice.', 'Prestige.', 'Infinity.', 'Break infinity.',
    'Complete an infinity challenge.', 'Eternity.', 'Complete all eternity milestones.', 'Unlock the Eternity Producer.',
    'Complete an eternity challenge.', 'Unlock chroma.', 'Complexity.', 'Complete all complexity achievements.',
    'Unlock powers.', 'Unlock galaxies.', 'Finality.', 'Buy the maximum possible of all finality upgrades.'
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
    player.goals[i - 1] = true;
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
