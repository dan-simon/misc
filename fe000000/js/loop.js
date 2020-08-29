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
    FinalityGenerator(i).produce(diff);
  }
  for (let i = 8; i >= 1; i--) {
    ComplexityGenerator(i).produce(diff);
  }
  for (let i = 8; i >= 1; i--) {
    EternityGenerator(i).produce(diff);
  }
  for (let i = 8; i >= 1; i--) {
    InfinityGenerator(i).produce(diff);
  }
  if (!Stars.atLimit()) {
    for (let i = 8; i >= 1; i--) {
      Generator(i).produce(diff);
    }
  }
  Stats.addToTimeStats(diff);
  // Why is this here? Because otherwise the eternity time will be out of sync with chroma when the UI updates.
  Chroma.updateColors();
  Autobuyers.tick(diff);
  InfinityAutobuyers.tick();
  EternityAutobuyers.tick();
  ComplexityAutobuyers.tick();
  if (EternityMilestones.isEternityMilestoneActive(6)) {
    InfinityChallenge.checkForAllAutoInfinityChallengeCompletions();
  }
  if (EternityChallenge.isTotalCompletionsRewardActive(3)) {
    InfinityPoints.addAmount(InfinityPrestigeLayer.infinityPointGain().times(diff));
  }
  if (Powers.isUnlocked() || FinalityMilestones.isFinalityMilestoneActive(6)) {
    EternityPoints.addAmount(EternityPrestigeLayer.eternityPointGain().times(diff));
  }
  if (FinalityMilestones.isFinalityMilestoneActive(4)) {
    Permanence.add(Permanence.permanenceGain().times(diff));
  }
  if (FinalityMilestones.isFinalityMilestoneActive(10)) {
    ComplexityPoints.addAmount(ComplexityPrestigeLayer.complexityPointGain().times(diff));
  }
  Studies.updateExtraTheorems();
  EternityChallenge.checkForAutoEternityChallengeCompletions();
  ComplexityChallenge.checkForComplexityChallengeCompletions();
  ComplexityAchievements.checkForComplexityAchievements();
  // Why are these here? Because these are used mainly for display, and we want 
  // displayed peak to be at most current. Why so late? Because theoretically
  // a complexity achievement could give you EP, which might mess up stuff.
  // Autobuyers also use these but they compute them at the time if needed.
  InfinityPrestigeLayer.updatePeakIPPerSec();
  EternityPrestigeLayer.updatePeakEPPerSec();
  ComplexityPrestigeLayer.updatePeakCPPerSec();
  Powers.checkForPowerGain();
  Goals.checkForGoals();
  SpecialTabs.makeTabsVisible();
  SpecialDivs.makeDivsVisible();
  if (display !== false) {
    maybeFitToWidth();
    updateDisplay();
  }
}
