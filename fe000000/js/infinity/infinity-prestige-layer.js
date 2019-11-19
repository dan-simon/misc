let InfinityPrestigeLayer = {
  canInfinityBeBroken() {
    return Challenge.areAllChallengesCompleted();
  },
  isInfinityBroken() {
    return this.canInfinityBeBroken() && player.breakInfinity;
  },
  breakInfinityButtonText() {
    return player.breakInfinity ?
      `Fix infinity: force infinity at ${format(Decimal.pow(2, 256))} stars` :
      `Break infinity: allow stars to go beyond ${format(Decimal.pow(2, 256))}, with greater IP gain`;
  },
  toggleBreakInfinity() {
    if (player.canInfinityBeBroken()) {
      player.breakInfinity = !player.breakInfinity;
    }
  },
  canInfinity() {
    return Stars.amount().log(2) >= 256;
  },
  mustInfinity() {
    return this.canInfinity() && !this.isInfinityBroken();
  },
  infinityPointGain() {
    let oom = this.isInfinityBroken() ? Stars.amount().log(2) / 256 : 1;
    return Decimal.pow(2, oom).floor();
  },
  currentIPPerSec() {
    return this.infinityPointGain().div(player.stats.timeSinceInfinity);
  },
  peakIPPerSec() {
    return player.stats.peakIPPerSec;
  },
  updatePeakIPPerSec() {
    if (this.canInfinity()) {
      player.stats.peakIPPerSec = player.stats.peakIPPerSec.max(this.currentIPPerSec());
    }
  },
  infinity() {
    if (!this.canInfinity()) return;
    InfinityPoints.addAmount(this.infinityPointGain());
    Infinities.increment();
    Challenge.checkForChallengeCompletion();
    Challenge.setChallenge(0);
    this.infinityReset();
  },
  infinityReset() {
    Prestige.prestigeReset();
    player.prestigePower = new Decimal(1);
    player.infinityStars = new Decimal(1);
    InfinityGenerators.list.forEach(x => x.resetAmount());
    player.timeSinceInfinity = 0;
    player.peakIPPerSec = new Decimal(0);
  }
}
