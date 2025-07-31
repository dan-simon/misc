function gameLoop(diff, display, isOnline) {
  // Right now display and isOnline are always the same, but who knows if that'll continue to be true?
  if (typeof diff !== 'number') {
    let now = Date.now();
    let rawDiff = (now - player.lastUpdate) / 1000;
    // Run the game loop multiple times
    if (rawDiff >= 10) {
      // This tick isn't going to happen at all. We're going to simulate time instead.
      player.lastUpdate = now;
      if (Options.offlineProgress()) {
        Saving.simulateTime(rawDiff, Saving.defaultTicks(), true, function () {});
      }
      return;
    } else if (rawDiff >= 0.128) {
      // 64 millseconds is the usual tick length.
      player.lastUpdate = now;
      let ticks = Math.floor(rawDiff / 0.064);
      for (let i = 0; i < ticks; i++) {
        gameLoop(rawDiff / ticks, display, isOnline);
      }
      return;
    }
    diff = Math.max(0, rawDiff * player.cheats.gameSpeed);
    player.lastUpdate = now;
  }
  // We cache stuff in achievements for efficiency. This deletes the cache.
  // The issue is mostly recomputation in a single tick.
  Achievements.invalidateCache();
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
  if (Stars.canBuyThings()) {
    for (let i = 8; i >= 1; i--) {
      Generator(i).produce(diff);
    }
  }
  Stats.addToTimeStats(diff, isOnline);
  // Why is this here? Because otherwise the eternity time will be out of sync with chroma when the UI updates.
  Chroma.updateColors();
  // This code purposefully gives a one-time boost of generated resources to get the player to a prestige threshold.
  // It has two functions, which are somewhat similar:
  // - Make some resets (especially infinities) one tick.
  // - Save a second on late finalities waiting for complexity points to generate.
  // It doesn't apply to permanence because permanence doesn't reset anything.
  // It doesn't apply to eternities because as a historical accident they're not in this part of the reset loop anyway,
  // so this is less of an issue and I'm worried it'd break stuff.
  if (InfinityPrestigeLayer.hasInfinityPointGeneration() &&
  !EternityPrestigeLayer.canEternity() && EternityPrestigeLayer.canEternityWith(InfinityPrestigeLayer.infinityPointGain())) {
    InfinityPoints.addAmount(InfinityPrestigeLayer.infinityPointGain());
  }
  if (EternityPrestigeLayer.hasEternityPointGeneration() &&
  !ComplexityPrestigeLayer.canComplexity() && ComplexityPrestigeLayer.canComplexityWith(EternityPrestigeLayer.eternityPointGain())) {
    EternityPoints.addAmount(EternityPrestigeLayer.eternityPointGain());
  }
  if (ComplexityPrestigeLayer.hasComplexityPointGeneration() &&
  !FinalityPrestigeLayer.canFinality() && FinalityPrestigeLayer.canFinalityWith(ComplexityPrestigeLayer.complexityPointGain())) {
    ComplexityPoints.addAmount(ComplexityPrestigeLayer.complexityPointGain());
  }
  Autobuyers.tick(diff);
  InfinityAutobuyers.tick();
  EternityAutobuyers.tick();
  ComplexityAutobuyers.tick();
  InfinityChallenge.checkForAllAutoInfinityChallengeCompletions();
  // For why this is somewhat duplicated above, see above.
  // It's not moved above because I don't want to break game loop order stuff.
  if (InfinityPrestigeLayer.hasInfinityPointGeneration()) {
    InfinityPoints.addAmount(InfinityPrestigeLayer.infinityPointGain().times(diff));
  }
  if (EternityPrestigeLayer.hasEternityPointGeneration()) {
    EternityPoints.addAmount(EternityPrestigeLayer.eternityPointGain().times(diff));
  }
  if (Permanence.hasPassiveProduction()) {
    Permanence.add(Permanence.permanenceGain().times(diff));
  }
  if (ComplexityPrestigeLayer.hasComplexityPointGeneration()) {
    ComplexityPoints.addAmount(ComplexityPrestigeLayer.complexityPointGain().times(diff));
  }
  Studies.updateExtraTheorems();
  EternityChallenge.checkForEternityChallengeRequirements();
  EternityChallenge.checkForAutoEternityChallengeCompletions();
  ComplexityChallenge.checkForComplexityChallengeCompletions();
  ComplexityAchievements.checkForComplexityAchievements();
  // We need to check every tick for new galaxies so we can possibly dilate
  // them if there are any.
  Galaxy.updateDilatedMinor();
  // Why are these here? Because these are used mainly for display, and we want 
  // displayed peak to be at most current. Why so late? Because theoretically
  // a complexity achievement could give you EP, which might mess up stuff.
  // Autobuyers also use these but they compute them at the time if needed.
  InfinityPrestigeLayer.updatePeakIPPerSec();
  EternityPrestigeLayer.updatePeakEPPerSec();
  ComplexityPrestigeLayer.updatePeakCPPerSec();
  InfinityPrestigeLayer.updatePeakLogIPPerSec();
  EternityPrestigeLayer.updatePeakLogEPPerSec();
  ComplexityPrestigeLayer.updatePeakLogCPPerSec();
  Sacrifice.updateSacrificePossible();
  Prestige.updatePrestigePossible();
  InfinityPrestigeLayer.compareIPGain();
  EternityPrestigeLayer.compareEPGain();
  ComplexityPrestigeLayer.compareCPGain();
  // Why does checkForPowerGain need diff? Because it wants to know if a bunch of new powers
  // are due to a long tick or power production suddenly becoming possible.
  Powers.checkForPowerGain(diff);
  Goals.checkForGoals();
  Achievements.checkForAchievements('loop');
  TextBoxes.checkDisplay();
  SpecialTabs.makeTabsVisible();
  SpecialDivs.makeDivsVisible();
  if (display !== false) {
    maybeFitToWidth();
    updateDisplay();
  }
}
