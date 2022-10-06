function endgameUpg0Formula(x) {
  if (updateUpgradeActive(0, 0) && x > 2) {
    // Don't take 2*x^2.5 for small x.
    return Math.min(Math.exp(x), 2 * Math.pow(x, 2.5));
  } else {
    return Math.exp(x);
  }
}

function endgameUpg0FormulaInverse(x) {
  if (updateUpgradeActive(0, 0)) {
    let options = [Math.log(x), Math.pow(x / 2, 0.4)];
    let checkOption = (i) => Math.abs(endgameUpg0Formula(i) / x - 1) < 1e-9;
    return options.filter(checkOption)[0];
  } else {
    return Math.log(x);
  }
}

function centralFormula(x, c) {
  return Decimal.exp(6 * (endgameUpg0Formula(x / 3600) - 1) / c).minus(1).times(600);
}

function invertCentralFormula(x, c) {
  return 3600 * endgameUpg0FormulaInverse(c * Decimal.ln(x.div(600).plus(1)).toNumber() / 6 + 1);
}

function addProgress(orig, change, c) {
  let real = centralFormula(orig, c);
  return invertCentralFormula(real.plus(change), c);
}

function getScaling() {
  return maybeLog(1 + getEffect(2) + getEffect(6) + challengeReward('ufd'));
}

function devsWorkingOn(i) {
  let result = player.devs[i];
  if (i === 0 && updateUpgradeActive(1, 2)) {
    result += getTotalDevs();
  }
  if (hasAuto('dev-one-percent')) {
    result += getTotalDevs() / 100;
  }
  return result;
}

function maybeLog(x) {
  if (player.currentChallenge === 'logarithmic') {
    let pow = Math.min(3, 1 + getTotalChallengeCompletions() / 4);
    if (x instanceof Decimal) {
      return Decimal.pow(1 + Decimal.ln(x).toNumber(), pow);
    } else {
      return Math.pow(1 + Math.log(x), pow);
    }
  } else {
    return x;
  }
}

function getTotalProductionMultiplier() {
  return maybeLog(getEffect(1).times(getEffect(5)).times(getMilestoneEffect()).times(getUpdatePowerEffect(0)).times(challengeReward('inefficient'))).times(getNormalAchievementsEffect());
}

function addToProgress(diff) {
  let perDev = new Decimal(diff).times(getTotalProductionMultiplier());
  let scaling = getScaling();
  for (let i = 0; i <= 4; i++) {
    player.progress[i] = addProgress(player.progress[i], perDev.times(devsWorkingOn(i)), scaling);
  }
}

function checkForMilestones() {
  player.milestones = Math.max(player.milestones, Math.floor(player.progress[0] / 1800));
}

const COMPLETION_MILESTONES = [2, 4, 8, 16, 32];

function checkForCompletionMilestones() {
  while (player.completionMilestones < COMPLETION_MILESTONES.length &&
    getTotalChallengeCompletions() >= COMPLETION_MILESTONES[player.completionMilestones]) {
    player.completionMilestones++;
    updateCompletionMilestoneDisplay();
  }
}

function addToUpdatePower(diff) {
  for (let i = 0; i <= 2; i++) {
    player.power[i] = player.power[i].plus(new Decimal(diff).times(player.experience[i]).times(getPowerGainPerExperience()));
  }
}

function addToDilation(diff) {
  player.dilation = player.dilation + diff * getDilationPerSecond();
}

function getGameSpeed() {
  let speed = 1;
  if (player.currentChallenge === 'slow') {
    speed /= 1000;
  }
  speed *= challengeReward('slow');
  return speed;
}

function realTimeToGameTime(diff) {
  return diff * getGameSpeed();
}

function gameCode(diff) {
  let now = Date.now();
  if (diff === undefined) {
    diff = (now - player.lastUpdate) / 1000;
  }
  if (isNaN(diff)) {
    diff = 0;
  }
  realDiff = diff;
  diff = realTimeToGameTime(diff);
  player.lastUpdate = now;
  doAutoThings();
  addToProgress(diff);
  addToPatience(diff);
  addToUpdatePower(diff);
  addToDilation(diff);
  checkForMilestones();
  checkForCompletionMilestones();
  checkForRecordDevelopement();
  checkForAchievementsAndLore();
}

function checkForRecordDevelopement() {
  player.stats.recordDevelopment[''] = Math.max(
    player.progress[0], player.stats.recordDevelopment['']);
  if (player.currentChallenge !== '') {
    player.stats.recordDevelopment[player.currentChallenge] = Math.max(
      player.progress[0], player.stats.recordDevelopment[player.currentChallenge]);
  }
}

function tick() {
  gameCode();
  updateDisplay();
}

function baseDevs() {
  if (updateUpgradeActive(0, 2)) {
    return 20;
  } else {
    return 5;
  }
}

function getAdditionalDevsDueToUpdates() {
  return Math.max(0, Math.round(1 + Math.log2(player.updates)));
}

function getTotalDevs () {
  return getEffect(3);
}

function getUnassignedDevs () {
  return getTotalDevs() - player.devs.reduce((a, b) => a + b);
}

function toggleOption(x) {
  player.options[x] = !player.options[x];
}

function toggleConfirmation(x) {
  player.options.confirmations[x] = !player.options.confirmations[x];
}

function newValueFromPrestige() {
  return player.progress[0] + challengeReward('unprestigious');
}

function canPrestigeWithoutGain(i) {
  return canPrestige(i) && player.progress[i] >= newValueFromPrestige();
}

function canPrestige(i) {
  return player.currentChallenge !== 'unprestigious' && player.progress[0] >= 1800;
}

function confirmPrestige(i) {
  let whatWillReset = 'development, efficiency, refactoring, recruitment, patience, patience meter, and times enlightened';
  if (canPrestigeWithoutGain(i) &&
  player.options.confirmations.prestigeWithoutGain) {
    return confirm('Are you sure you want to prestige? You will gain nothing, and your ' + whatWillReset + ' will reset.');
  } else if (player.options.confirmations.prestige) {
    return confirm('Are you sure you want to prestige? Your ' + whatWillReset + ' will reset.');
  } else {
    return true;
  }
}

function prestigeCore(i, now, oldProgress) {
  for (let j = 0; j <= 4; j++) {
    player.progress[j] = 0;
    player.devs[j] = 0;
  }
  player.progress[7] = 0;
  player.enlightened = 0;
  givePrestigeAchievementsAndLore(i, oldProgress);
  player.stats.last.prestige = now;
  player.stats.last.enlightened = now;
  player.stats.last.prestigeType = i;
}

function prestige(i, noConfirm) {
  if (canPrestige(i) && (noConfirm || confirmPrestige(i))) {
    let oldProgress = player.progress[i];
    player.progress[i] = Math.max(player.progress[i], newValueFromPrestige());
    let now = Date.now();
    prestigeCore(i, now, oldProgress);
  }
}

function enlightened() {
  if (player.progress[7] >= 1) {
    player.progress[7] = getPatienceMeterAfterEnlightened();
    player.enlightened++;
    player.stats.last.enlightened = Date.now();
    player.achievements.stats.savingTokens = false;
  }
}

function getMilestoneEffect() {
  return 1 + player.milestones;
}

function tryToChangeDevs(i, change) {
  if (player.devs.reduce((a, b) => a + b) + change <= getTotalDevs() && player.devs[i] + change >= 0) {
    setDevs(i, player.devs[i] + change);
  }
}

function addDev(i) {
  tryToChangeDevs(i, 1)
}

function addDevs(i, n) {
  setDevs(i, Math.min(player.devs[i] + n, player.devs[i] + getTotalDevs() - player.devs.reduce((a, b) => a + b)));
}

function subtractDev(i) {
  tryToChangeDevs(i, -1)
}

function subtractDevs(i, n) {
  setDevs(i, Math.max(player.devs[i] - n, 0));
}

function maxDev(i) {
  setDevs(i, player.devs[i] + getTotalDevs() - player.devs.reduce((a, b) => a + b));
}

function zeroDev(i) {
  setDevs(i, 0);
}

function setDevs(i, x) {
  player.devs[i] = x;
  if (x !== 0) {
    player.achievements.stats.noDevsForThat = false;
  }
}

function diminishingReturns(x) {
  return 1 / 10 - 1 / (10 + x);
}

function updateOtherDisplay() {
  // Add other stuff here if needed.
  fillInDilationUpgrades();
}

function updateChallengeDisplay() {
  document.getElementById('total-challenge-completions').innerHTML = format(getTotalChallengeCompletions());
  document.getElementById('current-challenge').innerHTML = getChallengeForDisplay(player.currentChallenge);
  document.getElementById('next-challenge-unlock').innerHTML = nextChallengeUnlock();
  for (let i in CHALLENGE_UNLOCKS) {
    if (isChallengeUnlocked(i)) {
      document.getElementById(i + '-td').style.display = '';
    } else {
      document.getElementById(i + '-td').style.display = 'none';
    }
    if (challengeCompletions(i) >= 1) {
      document.getElementById(i + '-button').style.backgroundColor = '#20F020';
    } else {
      document.getElementById(i + '-button').style.backgroundColor = '#F02020';
    }
    document.getElementById(i + '-goal').innerHTML = toTime(getChallengeGoal(i));
    document.getElementById('record-development-in-' + i).innerHTML = toTime(player.stats.recordDevelopment[i]);
    document.getElementById(i + '-reward-description').innerHTML = describeChallengeReward(i);
    document.getElementById(i + '-completed-description').innerHTML = describeChallengeCompleted(i);
  }
  if (player.dilation > 0) {
    document.getElementById('dilation').style.display = '';
    document.getElementById('dilation-text').innerHTML = 'You have ' + format(player.dilation, 4) + ' dilation, ' + format(getDilationPerSecond(), 4) + ' dilation per second, raising the exponents of efficiency and meta-efficiency ^' + format(getDilationEffect(), 4) + '.';
  } else {
    document.getElementById('dilation').style.display = 'none';
  }
}

function updateCompletionMilestoneDisplay() {
  for (let i = 0; i < COMPLETION_MILESTONES.length; i++) {
    if (player.completionMilestones > i) {
      document.getElementById('milestone-status-' + i).innerHTML = '&#x2714;';
    } else {
      document.getElementById('milestone-status-' + i).innerHTML = '&#x2718;';
    }
  }
}

function confirmToggleHardMode() {
  if (player.options.hardMode) {
    return confirm(
      'Turning hard mode off will make various things easier again. ' +
      'This includes upgrade costs, challenge requirements, and some challenge goals being lowered. ' +
      'Are you sure you want to do this?');
  } else {
    return confirm(
      'Turning hard mode on will make various things harder. ' +
      'This includes upgrade costs, challenge requirements, and some challenge goals being increased. ' +
      'Also note that the intended default mode is non-hard-mode. Are you sure you want to do this?');
  }
}

function toggleHardMode() {
  if (confirmToggleHardMode()) {
    player.options.hardMode = !player.options.hardMode;
  }
}

window.onload = function () {
  loadGameStorage();
  setInterval(tick, 50);
  setInterval(saveGame, 10000);
}
