let Challenge = {
  startOrExitChallenge(x) {
    if (this.isChallengeRunning(x)) {
      this.exitChallenge();
    } else if (PrestigeLayerProgress.hasReached('infinity')) {
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
  isSomeChallengeRunning() {
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
  restartOnCompletion() {
    return player.challengeRestartOnCompletion;
  },
  toggleRestartOnCompletion() {
    player.challengeRestartOnCompletion = !player.challengeRestartOnCompletion;
  },
  startChallenge(x) {
    if (InfinityPrestigeLayer.canInfinity()) {
      InfinityPrestigeLayer.infinity(false);
    } else {
      InfinityPrestigeLayer.infinityReset(false);
    }
    if (Autobuyers.disableWhenStartingChallenge()) {
      Autobuyers.setAll(false);
    }
    this.setChallenge(x);
    InfinityChallenge.setInfinityChallenge(0);
  },
  exitChallenge() {
    this.setChallenge(0);
    InfinityPrestigeLayer.infinityReset(false);
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
      return 'Challenge 2 multiplier: ' + formatMaybeInt(this.challenge2Mult());
    } else if (cc === 3) {
      return 'Challenge 3 multiplier: ' + formatWithPrecision(this.challenge3Mult(), 5);
    } else if (cc === 7) {
      return 'Challenge 7 purchases left: ' + formatInt(this.challenge7PurchasesLeft());
    } else if (ic === 1) {
      return 'Challenge 2 multiplier: ' + formatMaybeInt(this.challenge2Mult()) + ', ' +
      'Challenge 3 multiplier: ' + formatWithPrecision(this.challenge3Mult(), 5) + ', ' +
      'Challenge 7 purchases left: ' + formatInt(this.challenge7PurchasesLeft());
    } else if (ic === 3) {
      return 'Infinity Challenge 3 prestige power exponent: ' +
      formatMaybeInt(InfinityChallenge.infinityChallenge3PrestigePowerExponent());
    } else if (ic === 4) {
      return 'Infinity Challenge 4 multiplier exponent: ' +
      formatMaybeInt(InfinityChallenge.infinityChallenge4Pow());
    } else if (ic === 5) {
      return 'Infinity Challenge 5 multiplier exponent: ' +
      formatMaybeInt(InfinityChallenge.infinityChallenge5Pow());
    } else if (ic === 6) {
      return 'Infinity Challenge 6 prestige power exponent: ' +
      formatMaybeInt(InfinityChallenge.infinityChallenge6PrestigePowerExponent());
    } else if (ic === 8) {
      return 'Infinity Challenge 8 purchases left: ' +
      formatInt(InfinityChallenge.infinityChallenge8PurchasesLeft());
    } else {
      return 'This text should never appear.';
    }
  },
  color(x) {
    return Colors.makeStyle(this.isChallengeCompleted(x), true);
  }
}
