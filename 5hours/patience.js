
function patienceMeterScaling () {
  if (updateUpgradeActive(0, 1)) {
    return 2.5;
  } else {
    return 2;
  }
}

function patienceMeterMinTime () {
  if (updateUpgradeActive(0, 1)) {
    return 10;
  } else {
    return 60;
  }
}

function getBasePatienceMeterTime (x) {
  // We really didn't need Decimal anyway.
  let scaling = patienceMeterScaling();
  let stepsTaken = x / 1800;
  let minTime = patienceMeterMinTime();
  let stepsNeededForMin = Math.log(86400 / minTime) / Math.log(scaling);
  if (stepsTaken > stepsNeededForMin) {
    return minTime / (1 + Math.log(scaling) * (stepsTaken - stepsNeededForMin))
  } else {
    return 86400 / Math.pow(scaling, stepsTaken);
  }
}

function softcapPatienceMeter(x) {
  if (x <= 1) {
    return x;
  } else {
    return 1 + Math.log(x) / 10;
  }
}

function getTotalEnlightened() {
  return player.enlightened + getPermaEnlightened();
}

function getLogarithmicMilestones() {
  return Math.min(Math.max(player.stats.recordDevelopment.logarithmic / 1800 - 1, 0), 9);
}

function getPermaEnlightened() {
  return Math.floor(getLogarithmicMilestones());
}

function getEnlightenedSlowFactor() {
  return 2 - Math.floor(getLogarithmicMilestones() / 3) / 10;
}

function getPatienceMeterEffect(x, enlights) {
  return 1 + softcapPatienceMeter(x) * (0.5 + 0.05 * enlights);
}

function getTimeForPatienceMeterToMaxOut(patience, enlights) {
  if (player.currentChallenge === 'impatient') {
    return Infinity;
  } else {
    let base = getBasePatienceMeterTime(patience);
    return base / (getUpdatePowerEffect(1) * challengeReward('impatient') * getDilationUpgradeEffect(0) *
    getNormalAchievementsPatienceEffect() * getLategameAchievementsPatienceEffect()) * Math.pow(getEnlightenedSlowFactor(), enlights);
  }
}

function getPatienceMeterNewValue(old, diff, patience, enlights) {
  let result = old + diff / getTimeForPatienceMeterToMaxOut(patience, enlights);
  if (!updateUpgradeActive(1, 1)) {
    result = Math.min(1, result);
  }
  return result;
}

function addToPatience(diff) {
  player.progress[7] = getPatienceMeterNewValue(player.progress[7], diff, player.progress[4], player.enlightened);
}
