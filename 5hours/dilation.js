function addToDilation(diff) {
  player.dilation = player.dilation + diff * getDilationPerSecond();
}

function getDilationBase() {
  return Math.max(2, getTotalChallengeCompletions() / 10);
}

function getDilationPerSecond() {
  if (player.currentChallenge !== 'logarithmic') {
    return 0;
  }
  return Math.max(0, Math.pow(getDilationBase(), player.progress[0] / 3600 - 12) - 1) / 1000;
}

function getDilationEffect() {
  return 1 + diminishingReturns(Math.log10(1 + player.dilation));
}

function dilationBoost(x) {
  return Decimal.pow(10, Math.max(x.log10(), Math.pow(x.log10(), getDilationEffect())))
}

let DILATION_UPGRADE_BASE_COSTS = [10, 1e10];

let DILATION_UPGRADE_COST_INCREASES = [2, 10];

function getDilationUpgradeCost(i) {
  return DILATION_UPGRADE_BASE_COSTS[i] * Math.pow(DILATION_UPGRADE_COST_INCREASES[i], player.dilationUpgradesBought[i])
}

function getDilationUpgradeEffect(i) {
  let x = player.dilationUpgradesBought[i];
  if (i === 0) {
    return Math.pow(1.1, x);
  }
}

function buyDilationUpgrade(i) {
  if (player.dilation < getDilationUpgradeCost(i)) {
    return false;
  }
  player.dilation -= getDilationUpgradeCost(i);
  player.dilationUpgradesBought[i]++;
  fillInDilationUpgrades();
}
