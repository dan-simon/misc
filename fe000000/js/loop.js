function gameLoop(diff, display) {
  if (typeof diff !== 'number') {
    let now = Date.now();
    diff = Math.max(0, (now - player.lastUpdate) / 1000 * player.cheats.gameSpeed);
    player.lastUpdate = now;
  }
  // This order is (I think) the one giving the most stuff.
  EternityProducer.produce(diff);
  Boost.produceBoostPower(diff);
  for (let i = 8; i >= 1; i--) {
    ComplexityGenerator(i).produce(diff);
  }
  for (let i = 8; i >= 1; i--) {
    EternityGenerator(i).produce(diff);
  }
  for (let i = 8; i >= 1; i--) {
    InfinityGenerator(i).produce(diff);
  }
  if (!InfinityPrestigeLayer.mustInfinity()) {
    for (let i = 8; i >= 1; i--) {
      Generator(i).produce(diff);
    }
  }
  Stats.addToTimeStats(diff);
  // Why is this here? Because otherwise the eternity time will be out of sync with chroma when the UI updates.
  Chroma.updateColors();
  InfinityPrestigeLayer.updatePeakIPPerSec();
  EternityPrestigeLayer.updatePeakEPPerSec();
  ComplexityPrestigeLayer.updatePeakCPPerSec();
  Autobuyers.tick(diff);
  InfinityAutobuyers.tick();
  EternityAutobuyers.tick();
  if (EternityMilestones.isEternityMilestoneActive(6)) {
    InfinityChallenge.checkForAllAutoInfinityChallengeCompletions();
  }
  if (EternityChallenge.isTotalCompletionsRewardActive(3)) {
    InfinityPoints.addAmount(InfinityPrestigeLayer.infinityPointGain().times(diff));
  }
  ComplexityChallenge.checkForComplexityChallengeCompletions();
  ComplexityUpgrades.checkForComplexityUpgrades();
  if (display !== false) {
    updateDisplay();
  }
}
