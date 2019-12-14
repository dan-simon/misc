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
  isChallengeEffectActive(x) {
    return this.isChallengeRunning(x) || (2 <= x && x <= 7 && InfinityChallenge.isInfinityChallengeRunning(1));
  },
  isSomeChallengeRunning(x) {
    return this.currentChallenge() !== 0;
  },
  isNoChallengeRunning() {
    return this.currentChallenge() === 0;
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
    InfinityChallenge.setInfinityChallenge(0);
    InfinityPrestigeLayer.infinityReset();
  },
  exitChallenge() {
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
  numberOfChallengesCompleted() {
    return player.challengesCompleted.reduce((a, b) => a + b);
  },
  multiplier() {
    return Decimal.pow(2, this.numberOfChallengesCompleted() / 4);
  },
  areAllChallengesCompleted() {
    return this.numberOfChallengesCompleted() === 12;
  },
  isThereChallengeText() {
    return [2, 3, 7].indexOf(this.currentChallenge()) !== -1
    || [1, 3, 4, 5, 6, 8].indexOf(InfinityChallenge.currentInfinityChallenge()) !== -1;
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
  challengeText() {
    let cc = this.currentChallenge();
    let ic = InfinityChallenge.currentInfinityChallenge();
    if (cc === 2) {
      return 'Challenge 2 multiplier: ' + format(this.challenge2Mult());
    } else if (cc === 3) {
      return 'Challenge 3 multiplier: ' + format(this.challenge3Mult());
    } else if (cc === 7) {
      return 'Challenge 7 purchases left: ' + format(this.challenge7PurchasesLeft());
    } else if (ic === 1) {
      return 'Challenge 2 multiplier: ' + format(this.challenge2Mult()) + ', ' +
      'Challenge 3 multiplier: ' + format(this.challenge3Mult()) + ', ' +
      'Challenge 7 purchases left: ' + format(this.challenge7PurchasesLeft());
    } else if (ic === 3) {
      return 'Infinity Challenge 3 prestige power exponent: ' +
      format(InfinityChallenge.infinityChallenge3PrestigePowerExponent());
    } else if (ic === 4) {
      return 'Infinity Challenge 4 multiplier exponent: ' +
      format(InfinityChallenge.infinityChallenge4Pow());
    } else if (ic === 5) {
      return 'Infinity Challenge 5 multiplier exponent: ' +
      format(InfinityChallenge.infinityChallenge5Pow());
    } else if (ic === 6) {
      return 'Infinity Challenge 6 prestige power exponent: ' +
      format(InfinityChallenge.infinityChallenge6PrestigePowerExponent());
    } else if (ic === 8) {
      return 'Infinity Challenge 8 purchases left: ' +
      format(InfinityChallenge.infinityChallenge8PurchasesLeft());
    } else {
      return 'This text should never appear.';
    }
  }
}
