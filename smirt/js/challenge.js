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
  isUnlocked(x) {
    return player.stats.highestZone >= [64][x];
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
    return ['Crowded'][x];
  },
  goal() {
    if (this.isSomeChallengeRunning()) {
      return [32][player.currentChallenge];
    } else {
      return 0;
    }
  }
}
