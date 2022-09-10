let ComplexityChallenge = {
  goals: [Infinity,
    Decimal.pow(2, Math.pow(2, 32)), Decimal.pow(2, 4096),
    Decimal.pow(2, Math.pow(2, 24)), Decimal.pow(2, Math.pow(2, 29)),
    Decimal.pow(2, Math.pow(2, 32)), Decimal.pow(2, Math.pow(2, 24)),
  ],
  baseRequirements: [Infinity, 0, 2, 4, 6, 8, 12],
  rewards: [
    null,
    x => Decimal.pow(2, x * Math.pow(Stars.amount().max(1).log2(), 0.5) / 2),
    x => 1 / Math.log2(2 + x / 256),
    x => Decimal.pow(2, Math.sqrt(x) / 2),
    x => 1 + x / 64,
    x => 1 + x / 8,
    x => Math.floor(x / 2),
  ],
  colors: [null, 'yellow', 'grey', 'purple', 'orange', 'cyan', 'green'],
  complexityChallengeUpdateState(x, isFinality) {
    // Should never be called for CC1, be defensive.
    if (x === 1) {
      return;
    }
    if (player.cc.isComplexityChallengeRunning[x - 1] || !this.isComplexityChallengeUnlocked(x) || isFinality) {
      // Exit, or if finality, don't enter no matter what.
      // We need to check it's unlocked because the player could do a complexity reset to get here,
      // and have one fewer complexity than they'd need.
      let running = player.cc.isComplexityChallengeRunning[x - 1];
      player.cc.isComplexityChallengeRunning[x - 1] = false;
      // This code would otherwise restore theorems on finality, which we don't want.
      if (running && !isFinality) {
        this.specialExit(x);
      }
    } else if (this.isComplexityChallengeUnlocked(x)) {
      // Enter if it's to be entered now.
      player.cc.isComplexityChallengeRunning[x - 1] = player.cc.isComplexityChallengeNext[x - 1];
    }
    player.cc.isComplexityChallengeConditionSatisfied[x - 1] = true;
    player.cc.isComplexityChallengeNext[x - 1] = false;
  },
  isComplexityChallengeRunning(x) {
    return player.cc.isComplexityChallengeRunning[x - 1];
  },
  isComplexityChallengeNext(x) {
    return player.cc.isComplexityChallengeNext[x - 1];
  },
  pressComplexityChallengeButton(x) {
    // More defensiveness on 1
    if (x === 1) {
      return;
    }
    if (player.cc.isComplexityChallengeRunning[x - 1]) {
      // Exit
      player.cc.isComplexityChallengeRunning[x - 1] = false;
      this.specialExit(x);
    } else if (this.isComplexityChallengeUnlocked(x) && player.cc.isComplexityChallengeConditionSatisfied[x - 1]) {
      // Enter
      player.cc.isComplexityChallengeRunning[x - 1] = true;
    } else if (this.willComplexityChallengeBeUnlockedNext(x)) {
      // Enter next (also catches the case when you can't enter yet but can enter next, even if condition is satisfied).
      player.cc.isComplexityChallengeNext[x - 1] = !player.cc.isComplexityChallengeNext[x - 1];
    }
  },
  canPressComplexityChallengeButton(x) {
    // Being in the challenge before it'll be unlocked next is an impossible state.
    return x !== 1 && this.willComplexityChallengeBeUnlockedNext(x);
  },
  complexityChallengeButtonText(x) {
    if (!this.canPressComplexityChallengeButton(x)) {
      return 'Requires more complexities'
    }
    if (player.cc.isComplexityChallengeRunning[x - 1]) {
      return 'Exit challenge'
    } else if (this.isComplexityChallengeUnlocked(x) && player.cc.isComplexityChallengeConditionSatisfied[x - 1]) {
      return 'Start challenge'
    } else if (this.willComplexityChallengeBeUnlockedNext(x)) {
      if (player.cc.isComplexityChallengeNext[x - 1]) {
        return 'Start challenge next complexity: currently on';
      } else {
        return 'Start challenge next complexity: currently off'
      }
    }
  },
  breakComplexityChallengeCondition(x) {
    // This should be impossible if the complexity challenge is running.
    // I'm sure there's some weird edge case I'm not thinking of, so I'll be defensive here.
    player.cc.isComplexityChallengeConditionSatisfied[x - 1] = false;
    if (player.cc.isComplexityChallengeRunning[x - 1]) {
      // Exit (this should never happen but who knows).
      player.cc.isComplexityChallengeRunning[x - 1] = false;
      this.specialExit(x);
    }
  },
  specialExit(x) {
    // Should only be called right after exit
    if (x === 6 && ComplexityAchievements.isComplexityAchievementActive(4, 4) && Studies.rebuyAfterComplexityChallenge6()) {
      player.studies = [...player.studySettings.studiesBeforeLastRespec];
      player.studySettings.firstTwelveStudyPurchaseOrder = [...player.studySettings.firstTwelveStudyPurchaseOrderBeforeLastRespec];
    }
  },
  getComplexityChallengeRequirement(x) {
    if (FinalityMilestones.isFinalityMilestoneActive(2)) {
      return 0;
    } else if (FinalityMilestones.isFinalityMilestoneActive(1)) {
      // All the base requirements should be even but I'm putting this in for safety.
      return Math.floor(this.baseRequirements[x] / 2);
    } else {
      return this.baseRequirements[x];
    }
  },
  isComplexityChallengeUnlocked(x) {
    // Yes, you can complete Complexity Challenge 1 before knowing that it exists.
    // Finality Milestone 2 also removes complexity requirements for unlocking complexity challenges.
    return player.complexities >= this.getComplexityChallengeRequirement(x) || FinalityMilestones.isFinalityMilestoneActive(2);
  },
  willComplexityChallengeBeUnlockedNext(x) {
    // Similar to above except for a +1 because maybe you want to enter it next.
    return player.complexities + 1 >= this.getComplexityChallengeRequirement(x) || FinalityMilestones.isFinalityMilestoneActive(2);
  },
  numberUnlocked() {
    return [1, 2, 3, 4, 5, 6].filter(i => this.isComplexityChallengeUnlocked(i)).length;
  },
  getComplexityChallengeGoal(x) {
    return this.goals[x].pow(Math.pow(2, this.getComplexityChallengeCompletions(x) / 4));
  },
  getComplexityChallengeCompletionsAt(x, stars) {
    return 1 + Math.floor(4 * Math.log2(stars.max(1).log2() / this.goals[x].log2()));
  },
  getComplexityChallengeReward(x) {
    return this.rewards[x](this.getComplexityChallengeCompletions(x) * ComplexityStars.complexityChallengeRewardMultiplier(x));
  },
  getComplexityChallengeNextReward(x) {
    return this.rewards[x]((1 + this.getComplexityChallengeCompletions(x)) * ComplexityStars.complexityChallengeRewardMultiplier(x));
  },
  getComplexityChallengeCompletions(x) {
    return player.complexityChallengeCompletions[x - 1];
  },
  getTotalComplexityChallengeCompletions() {
    return [1, 2, 3, 4, 5, 6].map(x => this.getComplexityChallengeCompletions(x)).reduce((a, b) => a + b);
  },
  getAllComplexityChallengeCompletions() {
    return [1, 2, 3, 4, 5, 6].map(x => this.getComplexityChallengeCompletions(x));
  },
  extraTheoremsRaw() {
    return this.getComplexityChallengeReward(6);
  },
  extraTheoremsIndex() {
    return 3;
  },
  extraTheoremsActualAndDisplay() {
    if (ComplexityAchievements.isComplexityAchievementActive(4, 4)) {
      return player.extraTheorems[this.extraTheoremsIndex()];
    } else {
      return this.extraTheoremsRaw();
    }
  },
  showActualExtraTheorems() {
    return this.extraTheoremsRaw() < this.extraTheoremsActualAndDisplay();
  },
  extraComplexityStarsForNextExtraTheorem() {
    let cc6 = this.getComplexityChallengeCompletions(6);
    if (cc6 === 0 || !ComplexityStars.doComplexityStarsDoAnything()) {
      return new Decimal(Infinity);
    }
    return Decimal.pow(2, Math.pow(2 * (this.extraTheoremsActualAndDisplay() + 1) / cc6, 2));
  },
  complexityChallengeStatusDescription(x) {
    if (!this.isComplexityChallengeUnlocked(x)) {
      let requirement = this.getComplexityChallengeRequirement(x);
      return 'Locked (requires ' + formatInt(requirement) + ' complexit' + pluralize(requirement, 'y', 'ies') + ')';
    }
    let description = formatInt(this.getComplexityChallengeCompletions(x)) + ' completion' +
      pluralize(this.getComplexityChallengeCompletions(x), '', 's');
    if (this.isComplexityChallengeRunning(x)) {
      description += ', running';
    }
    if (this.isComplexityChallengeNext(x)) {
      description += ', will run next complexity';
    }
    return description;
  },
  showComplexityChallengeLastCompletionDescription(x) {
    return this.getComplexityChallengeCompletions(x) > 0;
  },
  complexityChallengeLastCompletionDescription(x) {
    if (player.complexityChallengeLastCompletion[x - 1][0] < 0) {
      return 'Not completed this finality';
    } else {
      let complexities = Complexities.amount() - player.complexityChallengeLastCompletion[x - 1][0];
      let times = player.complexityChallengeLastCompletion[x - 1][1];
      if (complexities === 0) {
        return 'Completed ' + formatInt(times) + ' time' + pluralize(times, '', 's') + ' this complexity'
      } else {
        return 'Last completed ' + formatInt(complexities) + ' complexit' + pluralize(complexities, 'y', 'ies') + ' ago, ' + formatInt(times) + ' time' + pluralize(times, '', 's');
      }
    }
  },
  checkForComplexityChallengeCompletions() {
    for (let cc = 1; cc <= 6; cc++) {
      if (this.isComplexityChallengeRunning(cc)) {
        this.makeComplexityChallengeCompletionsAtLeast(
          cc, this.getComplexityChallengeCompletionsAt(cc, Stars.amount()));
      }
    }
  },
  makeComplexityChallengeCompletionsAtLeast(x, completions) {
    if (player.complexityChallengeCompletions[x - 1] < completions) {
      let lastData = player.complexityChallengeLastCompletion[x - 1];
      let extra = completions - player.complexityChallengeCompletions[x - 1];
      let current = lastData[0] === Complexities.amount() ? lastData[1] : 0;
      player.complexityChallengeLastCompletion[x - 1] = [Complexities.amount(), current + extra];
    }
    player.complexityChallengeCompletions[x - 1] = Math.max(player.complexityChallengeCompletions[x - 1], completions);
  },
  complexityReset(manual) {
    // It's easy to imagine wanting something else here (for example, because certain things
    // disqualify you from complexity challenges), which is why this is its own method.
    ComplexityPrestigeLayer.complexityReset(manual);
  },
  isSafeguardOn(x) {
    // This function now does the same check that running does
    return player.cc.isComplexityChallengeRunning[x - 1];
  },
  addToTimeStats(diff) {
    for (let i = 1; i <= 6; i++) {
      if (this.isComplexityChallengeRunning(i)) {
        player.complexityChallengeTimeSpent[i - 1] += diff;
      } else {
        player.complexityChallengeTimeSpent[i - 1] = 0;
      }
    }
  },
  longTimeThreshold() {
    return Math.pow(2, 16);
  },
  longTimeOn(x) {
    return this.isComplexityChallengeRunning(x) && player.complexityChallengeTimeSpent[x - 1] >= this.longTimeThreshold();
  },
  anyLongTime() {
    return [2, 3, 4, 5, 6].some(x => this.longTimeOn(x));
  },
  longTimeText() {
    let complexityChallenges = [2, 3, 4, 5, 6].filter(x => this.longTimeOn(x));
    return 'Complexity Challenge' + pluralize(complexityChallenges.length, '', 's') + ' ' + coordinate('*', '', complexityChallenges);
  },
  removeLongTimeMessage() {
    for (let i = 2; i <= 6; i++) {
      if (this.longTimeOn(i)) {
        player.complexityChallengeTimeSpent[i - 1] = 0
      }
    }
  },
  isExplanationMovedDown() {
    return player.isComplexityChallengeExplanationMovedDown;
  },
  moveExplanation() {
    player.isComplexityChallengeExplanationMovedDown = !player.isComplexityChallengeExplanationMovedDown;
  },
  color(x) {
    if (Options.complexityChallengeRunningColors()) {
      let running = this.isComplexityChallengeRunning(x);
      let next = (x === 1) ? running : this.isComplexityChallengeNext(x);
      return Colors.makeStyle('challenge' + ['red', 'yellow', 'green'][running ? 2 : (next ? 1 : 0)], true);
    } else {
      return Colors.makeStyle(1 - 2 / (2 + Math.log2(1 + this.getComplexityChallengeCompletions(x) / 2)), true);
    }
  }
}
