let Challenge = {
  startOrExitChallenge(x) {
    if (this.isChallengeRunning(x)) {
      this.exitChallenge();
    } else {
      this.startChallenge(x);
    }
  },
  currentChallenge() {
    return player.currentChallenge;
  },
  isChallengeRunning(x) {
    return this.currentChallenge() === x;
  },
  challengeStatusDescription(x) {
    if (this.isChallengeCompleted(x)) {
      if (this.isChallengeRunning(x)) {
        return 'Completed, running';
      } else {
        return 'Completed';
      }
    } else {
      if (this.isChallengeRunning(x)) {
        return 'Running';
      } else {
        return '';
      }
    }
  },
  setChallenge(x) {
    player.currentChallenge = x;
  },
  startChallenge(x) {
    this.setChallenge(x);
    InfinityPrestigeLayer.infinityReset();
  },
  exitChallenge(x) {
    this.setChallenge(0);
    InfinityPrestigeLayer.infinityReset();
  },
  checkForChallengeCompletion() {
    let cc = this.currentChallenge();
    if (cc !== 0) {
      this.completeChallenge(cc);
    }
  },
  completeChallenge(x) {
    player.challengesCompleted[x - 1] = true;
  },
  isChallengeCompleted(x) {
    return player.challengesCompleted[x - 1];
  },
  getChallengesCompleted() {
    return player.challengesCompleted.reduce((a, b) => a + b);
  },
  multiplier() {
    return Decimal.pow(2, this.getChallengesCompleted() / 4);
  },
  areAllChallengesCompleted() {
    return this.getChallengesCompleted() === 12;
  },
  isThereChallengeText() {
    return [2, 3, 7].indexOf(this.currentChallenge()) !== -1;
  },
  challenge2Mult() {
    return Math.min(player.stats.timeSincePurchase / 256, 1);
  },
  challenge3Mult() {
    return Decimal.pow(2, player.stats.timeSincePrestige / 256 - 8);
  },
  challenge7PurchasesLeft() {
    return 343 - player.stats.purchasesThisInfinity;
  },
  allPurchasesUsed() {
    return this.isChallengeRunning(7) && this.challenge7PurchasesLeft() <= 0;
  },
  challengeText() {
    let cc = this.currentChallenge();
    if (cc === 2) {
      return 'Challenge 2 multiplier: ' + format(this.challenge2Mult());
    } else if (cc === 3) {
      return 'Challenge 3 multiplier: ' + format(this.challenge3Mult());
    } else if (cc === 7) {
      return 'Challenge 7 purchases left: ' + format(this.challenge7PurchasesLeft());
    } else {
      return 'This text should never appear.';
    }
  }
}
