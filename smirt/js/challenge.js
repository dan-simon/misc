let Challenge = {
  isCompleted(x) {
    return player.challengesCompleted[x];
  },
  isRunning(x) {
    return player.currentChallenge === x;
  },
  isSomeChallengeRunning() {
    return player.currentChallenge !== -1;
  },
  doSomething(x) {
    if (!this.isUnlocked(x)) {
      return false;
    }
    if (this.isRunning(x)) {
      player.currentChallenge = -1;
    } else {
      if (Gold.canPortal()) {
        Gold.portal();
      } else {
        Gold.portalReset();
      }
      player.currentChallenge = x;
    }
  },
  checkCompletion() {
    // We only call this when we finish a zone.
    if (this.isSomeChallengeRunning() && player.zone >= this.goal(player.currentChallenge)) {
      player.challengesCompleted[player.currentChallenge] = true;
      player.currentChallenge = -1;
    }
  },
  unlockRequirement(x) {
    return [64, 160][x];
  },
  nextUnlockRequirement() {
    return [64, 160].filter(x => player.stats.highestZone <= x)[0] || Infinity;
  },
  isUnlocked(x) {
    return player.stats.highestZone > this.unlockRequirement(x);
  },
  text(x) {
    if (this.isRunning(x)) {
      return 'Exit';
    } else {
      return 'Start';
    }
  },
  name() {
    if (this.isSomeChallengeRunning()) {
      return this.nameOf(player.currentChallenge);
    } else {
      return null;
    }
  },
  nameOf(x) {
    return ['Crowded', 'Prestigeless'][x];
  },
  goal() {
    if (this.isSomeChallengeRunning()) {
      return [32, 40][player.currentChallenge];
    } else {
      return 0;
    }
  },
  nextChallengeText() {
    let req = this.nextUnlockRequirement();
    return (req === Infinity) ? 'You have unlocked all challenges!' :
      'Complete Zone ' + formatInt(req) + ' to unlock a challenge.';
  }
}
