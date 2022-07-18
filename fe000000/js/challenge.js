let Challenge = {
  challengeButtonText(x) {
    if (this.isChallengeRunning(x)) {
      return "Exit challenge"
    } else if (PrestigeLayerProgress.hasReached('infinity')) {
      return "Start challenge";
    } else {
      // Not sure what the best wording is on this
      // (it'll appear when all tabs are revealed).
      return "Requires infinity";
    }
  },
  exitChallengeHeaderButtonText() {
    let challenge = this.currentChallenge();
    if (challenge !== 0) {
      if (this.isChallengeCompleted(challenge)) {
        return 'already completed';
      } else {
        return 'this will ' + (InfinityPrestigeLayer.canInfinity() ? '' : 'not ') + 'complete it';
      }
    }
  },
  startOrExitChallenge(x) {
    if (this.isChallengeRunning(x)) {
      this.exitChallenge();
    } else if (PrestigeLayerProgress.hasReached('infinity')) {
      this.startChallenge(x);
    }
  },
  restartChallenge() {
    let running = this.currentChallenge();
    if (running !== 0) {
      this.exitChallenge();
      this.startChallenge(running);
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
    let newLimit = Decimal.pow(2, 256);
    if (InfinityPrestigeLayer.canInfinity()) {
      InfinityPrestigeLayer.infinity(false, newLimit);
    } else {
      InfinityPrestigeLayer.infinityReset(false, newLimit);
    }
    if (Autobuyers.disableWhenStartingChallenge()) {
      Autobuyers.setAll(false);
    }
    this.setChallenge(x);
    InfinityChallenge.setInfinityChallenge(0);
  },
  exitChallenge() {
    if (InfinityPrestigeLayer.canInfinity()) {
      // Finish the challenge.
      InfinityPrestigeLayer.infinity(false, null);
    } else {
      this.setChallenge(0);
      InfinityPrestigeLayer.infinityReset(false, null);
    }
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
      return 'Normal Challenge ' + formatOrdinalInt(2) + ' multiplier: ' + formatMaybeInt(this.challenge2Mult());
    } else if (cc === 3) {
      return 'Normal Challenge ' + formatOrdinalInt(3) + ' multiplier: ' + formatPrecisely(this.challenge3Mult());
    } else if (cc === 7) {
      return 'Normal Challenge ' + formatOrdinalInt(7) + ' purchases left: ' + formatInt(this.challenge7PurchasesLeft());
    } else if (ic === 1) {
      return 'Normal Challenge ' + formatOrdinalInt(2) + ' multiplier: ' + formatMaybeInt(this.challenge2Mult()) + ', ' +
      'Normal Challenge ' + formatOrdinalInt(3) + ' multiplier: ' + formatPrecisely(this.challenge3Mult()) + ', ' +
      'Normal Challenge ' + formatOrdinalInt(7) + ' purchases left: ' + formatInt(this.challenge7PurchasesLeft());
    } else if (ic === 3) {
      return 'Infinity Challenge ' + formatOrdinalInt(3) + ' prestige power exponent: ' +
      formatMaybeInt(InfinityChallenge.infinityChallenge3PrestigePowerExponent());
    } else if (ic === 4) {
      return 'Infinity Challenge ' + formatOrdinalInt(4) + ' multiplier exponent: ' +
      formatMaybeInt(InfinityChallenge.infinityChallenge4Pow());
    } else if (ic === 5) {
      return 'Infinity Challenge ' + formatOrdinalInt(5) + ' multiplier exponent: ' +
      formatMaybeInt(InfinityChallenge.infinityChallenge5Pow());
    } else if (ic === 6) {
      return 'Infinity Challenge ' + formatOrdinalInt(6) + ' prestige power exponent: ' +
      formatMaybeInt(InfinityChallenge.infinityChallenge6PrestigePowerExponent());
    } else if (ic === 8) {
      return 'Infinity Challenge ' + formatOrdinalInt(8) + ' purchases left: ' +
      formatInt(InfinityChallenge.infinityChallenge8PurchasesLeft());
    } else {
      return 'This text should never appear.';
    }
  },
  color(x) {
    return Colors.makeStyle(this.isChallengeCompleted(x), true);
  }
}
