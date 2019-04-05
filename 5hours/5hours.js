function loadGame (s) {
  player = JSON.parse(atob(s));
  fixPlayer();
  saveGame();
  fillInInputs();
  updateTabDisplay();
}

function fixPlayer () {
  if (!('enlightened' in player)) {
    player.enlightened = 0;
  }
  if (!('updates' in player)) {
    player.updatePoints = 0;
    player.updates = 0;
    player.experience = [0, 0, 0];
    player.power = [0, 0, 0];
  }
  if (!('upgrades' in player)) {
    player.upgrades = [[false, false, false], [false, false, false]];
    player.auto = {
      dev: {
        settings: [0, 0, 0, 0, 0],
        on: false
      }
    }
  }
  if (!('options' in player)) {
    player.options = {
      confirmations: {
        prestige: true,
        prestigeWithoutGain: true,
        update: true
      }
    }
  }
  if (!('tab' in player)) {
    player.tab = 'main';
  }
  if (!('stats' in player)) {
    player.stats = {
      'recordDevelopment': 0
    }
  }
  if (!('currentChallenge' in player)) {
    player.currentChallenge = '';
    player.stats.recordDevelopment = {
      '': player.stats.recordDevelopment,
      'logarithmic': 0,
      'inefficient': 0,
      'ufd': 0,
      'lonely': 0,
      'impatient': 0,
      'unprestigious': 0,
      'slow': 0,
      'powerless': 0,
      'upgradeless': 0
    };
    player.options.confirmations.enterChallenge = true;
    player.options.confirmations.exitChallenge = true;
  }
}

function loadGameStorage () {
  try {
    loadGame(localStorage.getItem('5hours-save'));
  } catch (ex) {
    resetGame();
  }
}

function loadGamePrompt() {
  try {
    loadGame(prompt('Enter your save:'))
  } catch(ex) {}
}

function saveGame () {
  localStorage.setItem('5hours-save', btoa(JSON.stringify(player)))
}

function exportGame () {
  let output = document.getElementById('export-output');
  let parent = output.parentElement;
  parent.style.display = "";
  output.value = btoa(JSON.stringify(player));
  output.onblur = function() {
    parent.style.display = "none";
  }
  output.focus();
  output.select();
  try {
    document.execCommand('copy');
    output.blur();
  } catch(ex) {}
}

let initialPlayer = {
  progress: [0, 0, 0, 0, 0, 0, 0, 0], // in seconds, or for the last from 0 to 1
  devs: [0, 0, 0, 0, 0],
  milestones: 0,
  enlightened: 0,
  updatePoints: 0,
  updates: 0,
  experience: [0, 0, 0],
  power: [0, 0, 0],
  upgrades: [[false, false, false], [false, false, false]],
  auto: {
    dev: {
      settings: [0, 0, 0, 0, 0],
      on: false
    }
  },
  options: {
    confirmations: {
      prestige: true,
      prestigeWithoutGain: true,
      update: true,
      enterChallenge: true,
      exitChallenge: true
    }
  },
  tab: 'main',
  currentChallenge: '',
  stats: {
    'recordDevelopment': {
      '': 0,
      'logarithmic': 0,
      'inefficient': 0,
      'ufd': 0,
      'lonely': 0,
      'impatient': 0,
      'unprestigious': 0,
      'slow': 0,
      'powerless': 0,
      'upgradeless': 0
    }
  },
  lastUpdate: Date.now()
}

function resetGame() {
  loadGame(btoa(JSON.stringify(initialPlayer)));
}

function endgameUpg0Formula(x) {
  if (upgradeActive(0, 0) && x > 2) {
    // Don't take x^3 for small x.
    return Math.min(Math.exp(x), 2 * Math.pow(x, 2.5));
  } else {
    return Math.exp(x);
  }
}

function endgameUpg0FormulaInverse(x) {
  if (upgradeActive(0, 0)) {
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
  return 3600 * endgameUpg0FormulaInverse(c * Decimal.ln(x.div(600).plus(1)) / 6 + 1);
}

function addProgress(orig, change, c) {
  let real = centralFormula(orig, c);
  return invertCentralFormula(real.plus(change), c);
}

function getScaling() {
  return maybeLog(1 + getEffect(2) + getEffect(6) + challengeReward('ufd'));
}

function devsWorkingOn(i) {
  if (i === 0 && upgradeActive(1, 2)) {
    return player.devs[i] + getTotalDevs();
  } else {
    return player.devs[i];
  }
}

function maybeLog(x) {
  if (player.currentChallenge === 'logarithmic') {
    let pow = 1 + getTotalChallengeCompletions() / 4;
    if (x instanceof Decimal) {
      return Decimal.pow(1 + Decimal.ln(x), pow);
    } else {
      return Math.pow(1 + Math.log(x), pow);
    }
  } else {
    return x;
  }
}

function getTotalProductionMultiplier() {
  return maybeLog(getEffect(1).times(getEffect(5)).times(getMilestoneEffect()).times(getUpdatePowerEffect(0)).times(challengeReward('inefficient')));
}

function addToProgress(diff) {
  let perDev = new Decimal(diff).times(getTotalProductionMultiplier());
  let scaling = getScaling();
  for (let i = 0; i <= 4; i++) {
    player.progress[i] = addProgress(player.progress[i], perDev.times(devsWorkingOn(i)), scaling);
  }
}

function addToPatience(diff) {
  player.progress[7] = player.progress[7] + diff / getEffect(4);
  if (!upgradeActive(1, 1)) {
    player.progress[7] = Math.min(1, player.progress[7]);
  }
}

function checkForMilestones() {
  player.milestones = Math.max(player.milestones, Math.floor(player.progress[0] / 1800));
}

function addToUpdatePower(diff) {
  for (let i = 0; i <= 2; i++) {
    player.power[i] += diff * player.experience[i] * getPowerGainPerExperience();
  }
}

function autoAssignDevs() {
  for (let i = 0; i <= 4; i++) {
    player.devs[i] = 0;
  }
  for (let i = 0; i <= 4; i++) {
    let askedFor = Math.floor(getTotalDevs() * player.auto.dev.settings[i]);
    let maxAllowed = getUnassignedDevs();
    player.devs[i] = Math.min(askedFor, maxAllowed);
  }
}

function gameCode() {
  let now = Date.now();
  diff = (now - player.lastUpdate) / 1000;
  if (isNaN(diff)) {
    diff = 0;
  }
  if (player.currentChallenge === 'slow') {
    diff /= 1000;
  }
  diff *= challengeReward('slow');
  player.lastUpdate = now;
  if (upgradeActive(0, 2) && player.auto.dev.on) {
    autoAssignDevs();
  }
  addToProgress(diff);
  addToPatience(diff);
  addToUpdatePower(diff);
  checkForMilestones();
  checkForRecordDevelopement();
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

function format(x) {
  x = new Decimal(x);
  if (x.gte(1e6)) {
    let e = x.exponent;
    let m = x.mantissa;
    return m.toFixed(2) + 'e' + e;
  } else if (x.equals(Math.floor(x))) {
    return '' + x.toNumber();
  } else {
    return x.toFixed(2);
  }
}

function toTime(x) {
  if (x === Infinity) {
    return Infinity;
  }
  return [x / 3600, x / 60 % 60, Math.floor(x % 60)].map((i) => Math.floor(i).toString().padStart(2, '0')).join(':');
}

function baseDevs() {
  if (upgradeActive(0, 2)) {
    return 10;
  } else {
    return 1;
  }
}

function getTotalDevs () {
  return getEffect(3);
}

function getUnassignedDevs () {
  return getTotalDevs() - player.devs.reduce((a, b) => a + b);
}

function patienceMeterScaling () {
  if (upgradeActive(0, 1)) {
    return 2.5;
  } else {
    return 2;
  }
}

function patienceMeterMinTime () {
  if (upgradeActive(0, 1)) {
    return 10;
  } else {
    return 60;
  }
}

function getBasePatienceMeterTime (x) {
  let result = 86400 / Math.pow(patienceMeterScaling(), x / 1800);
  let minTime = patienceMeterMinTime();
  if (result < minTime) {
    result = minTime / (1 + Math.log(minTime / result));
  }
  return result;
}

function softcapPatienceMeter(x) {
  if (x <= 1) {
    return x;
  } else {
    return 1 + Math.log(x) / 10;
  }
}

function getEffect(i) {
  let x = player.progress[i];
  if (i === 1 || i === 5) {
    if (player.currentChallenge === 'inefficient') {
      return new Decimal(1);
    } else {
      return Decimal.pow(2, x / 1800 * getEffect(7));
    }
  } else if (i === 2 || i === 6) {
    if (player.currentChallenge === 'ufd') {
      return 0;
    } else {
      return x / 1800 * getEffect(7);
    }
  } else if (i === 3) {
    if (player.currentChallenge === 'lonely') {
      return 1;
    } else {
      return Math.floor(maybeLog(baseDevs() + x * getUpdatePowerEffect(2) * challengeReward('lonely') / 300));
    }
  } else if (i === 4) {
    if (player.currentChallenge === 'impatient') {
      return Infinity;
    } else {
      let base = getBasePatienceMeterTime(x);
      return base / (getUpdatePowerEffect(1) * challengeReward('impatient')) * Math.pow(getEnlightenedSlowFactor(), player.enlightened);
    }
  } else if (i === 7) {
    return 1 + softcapPatienceMeter(x) * (0.5 + 0.05 * getTotalEnlightened());
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

function toggleConfirmation(x) {
  player.options.confirmations[x] = !player.options.confirmations[x];
}

function canPrestigeWithoutGain(i) {
  return canPrestige(i) && player.progress[0] <= player.progress[i];
}

function canPrestige(i) {
  return player.currentChallenge !== 'unprestigious' && player.progress[0] >= 1800;
}

function confirmPrestige(i) {
  let whatWillReset = 'development, efficiency, refactoring, recruitment, patience, patience meter, and times enlightened';
  if (canPrestigeWithoutGain(i) &&
  player.options.confirmations.prestigeWithoutGain &&
  !confirm('Are you sure you want to prestige? You will gain nothing, and your ' + whatWillReset + ' will reset.')) {
    return false;
  } else if (player.options.confirmations.prestige &&
  !confirm('Are you sure you want to prestige? Your ' + whatWillReset + ' will reset.')) {
    return false;
  } else {
    return true;
  }
}

function prestige(i) {
  if (canPrestige(i) && confirmPrestige(i)) {
    player.progress[i] = player.progress[0] + challengeReward('unprestigious');
    for (let j = 0; j <= 4; j++) {
      player.progress[j] = 0;
      player.devs[j] = 0;
    }
    player.progress[7] = 0;
    player.enlightened = 0;
  }
}

function enlightened() {
  if (player.progress[7] >= 1) {
    player.progress[7] = 0;
    player.enlightened++;
  }
}

function getMilestoneEffect() {
  return 1 + player.milestones;
}

function tryToChangeDevs(i, change) {
  if (player.devs.reduce((a, b) => a + b) + change <= getTotalDevs() && player.devs[i] + change >= 0) {
    player.devs[i] += change;
  }
}

function addDev(i) {
  tryToChangeDevs(i, 1)
}

function subtractDev(i) {
  tryToChangeDevs(i, -1)
}

function maxDev(i) {
  player.devs[i] += getTotalDevs() - player.devs.reduce((a, b) => a + b);
}

function zeroDev(i) {
  player.devs[i] = 0;
}

function canUpdate() {
  return player.progress[0] >= CHALLENGE_GOALS[player.currentChallenge];
}

const CHALLENGE_GOALS = {
  '': 18000,
  'logarithmic': 18000,
  'inefficient': 18000,
  'ufd': 9000,
  'lonely': 86400,
  'impatient': 43200,
  'unprestigious': 18000,
  'slow': 86400,
  'powerless': 43200,
  'upgradeless': 28800
}

function challengeCompletions(x) {
  let result = player.stats.recordDevelopment[x] / CHALLENGE_GOALS[x];
  if (result < 1) {
    return 0;
  } else {
    return 1 + Math.log(result);
  }
}

function getTotalChallengeCompletions() {
  return Object.keys(CHALLENGE_GOALS).filter(x => x !== '').map(
    x => challengeCompletions(x)).reduce((a, b) => a + b);
}

function challengeReward(x) {
  let pastCompletion = player.stats.recordDevelopment[x] - CHALLENGE_GOALS[x];
  let table = {
    'inefficient': [new Decimal(1), x => Decimal.pow(2, 1 + x / 1800)],
    'ufd': [0, x => 1 + x / 900],
    'lonely': [1, x => 2 + x / 3600],
    'impatient': [1, x => 2 + x / 3600],
    'unprestigious': [0, x => 1800 + x],
    'slow': [1, x => 1.5 + x / 43200],
    'powerless': [1, x => Math.pow(2, x / 3600)],
    'upgradeless': [2.2, x => 2.4 + x / 18000]
  }
  if (pastCompletion < 0) {
    return table[x][0];
  } else {
    return table[x][1](pastCompletion);
  }
}

function describeChallengeReward(x) {
  if (x === 'logarithmic') {
    return getPermaEnlightened() + ' permanent time' + ((getPermaEnlightened() === 1) ? '' : 's') + ' enlightened<br/>Patience meter is ' + format(getEnlightenedSlowFactor()) + 'x slower per time enlightened';
  } else {
    let table = {
      'inefficient': x => format(x) + 'x multiplier to all production',
      'ufd': x => format(1 + x) + 'x slower scaling (additive)',
      'lonely': x => format(x) + 'x dev gain from recruitment',
      'impatient': x => format(x) + ' patience meter gain',
      'unprestigious': x => toTime(x) + ' extra minutes when prestiging',
      'slow': x => 'Everything (including patience and power gain)<br/>is ' + format(x) + 'x faster',
      'powerless': x => format(x) + 'x power production',
      'upgradeless': x => format(x) + ' base for second endgame upgrade'
    }
    return table[x](challengeReward(x));
  }
}

function describeChallengeCompleted(x) {
  let cc = challengeCompletions(x);
  if (cc === 0) {
    return 'You have not yet completed this challenge.';
  } else {
    return 'You have completed this challenge ' + format(cc) + ' times.';
  }
}

const CHALLENGE_UNLOCKS = {
  'logarithmic': 86400,
  'inefficient': 108000,
  'ufd': 129600,
  'lonely': 172800,
  'impatient': 216000,
  'unprestigious': 259200,
  'slow': 345600,
  'powerless': 432000,
  'upgradeless': 518400
}

function isChallengeUnlocked(x) {
  return CHALLENGE_UNLOCKS[x] <= player.stats.recordDevelopment[''];
}

function nextChallengeUnlock() {
  let locked = Object.keys(CHALLENGE_UNLOCKS).filter(x => !isChallengeUnlocked(x)).sort((x, y) => CHALLENGE_UNLOCKS[x] - CHALLENGE_UNLOCKS[y]);
  if (locked.length === 0) {
    return 'All challenges are unlocked.';
  } else {
    return 'Next challenge unlocks at ' + toTime(CHALLENGE_UNLOCKS[locked[0]]) + ' development.';
  }
}

function getChallengeForDisplay(challenge) {
  if (challenge === '') {
    return 'no challenge';
  } else if (challenge === 'ufd') {
    return 'UFD';
  } else {
    return challenge[0].toUpperCase() + challenge.slice(1).toLowerCase();
  }
}

function enterChallenge(x) {
  if (confirmEnterChallenge(x)) {
    player.currentChallenge = x;
    for (let i = 0; i <= 7; i++) {
      player.progress[i] = 0;
      player.devs[i] = 0;
    }
    player.milestones = 0;
    player.enlightened = 0;
    for (let i = 0; i <= 3; i++) {
      player.power[i] = 0;
    }
  }
}

function exitChallenge() {
  if (player.currentChallenge !== '' && confirmExitChallenge()) {
    player.currentChallenge = '';
    for (let i = 0; i <= 7; i++) {
      player.progress[i] = 0;
      player.devs[i] = 0;
    }
    player.milestones = 0;
    player.enlightened = 0;
    for (let i = 0; i <= 3; i++) {
      player.power[i] = 0;
    }
  }
}

function getUpgradeGainBase() {
  if (upgradeActive(1, 0)) {
    return challengeReward('upgradeless');
  } else {
    return 2;
  }
}

function getUpdateGain() {
  let base = getUpgradeGainBase();
  return Math.floor(Math.pow(base, player.progress[0] / 3600 - 5));
}

function confirmUpdate() {
  let whatWillReset = 'meta-efficiency, meta-refactoring, and progress milestones, along with everything prestige resets';
  if (player.updates > 0) {
    whatWillReset = whatWillReset.replace('and progress milestones', 'progress milestones, and endgame/patience/headstart power')
  }
  if (player.options.confirmations.update &&
  !confirm('Are you sure you want to update? Your ' + whatWillReset + ' will reset.')) {
    return false;
  } else {
    return true;
  }
}

function confirmEnterChallenge (x) {
  if (player.options.confirmations.enterChallenge &&
  !confirm('Are you sure you want to enter the \'' + getChallengeForDisplay(x) + '\' challenge? ' +
  'The described special conditions will apply, and everything update resets will reset.')) {
    return false;
  } else {
    return true;
  }
}

function confirmExitChallenge() {
  if (player.options.confirmations.exitChallenge &&
  !confirm('Are you sure you want to exit the \'' + getChallengeForDisplay(player.currentChallenge) + '\' challenge? ' +
  'You will not get further in it than you are now until you enter it again, and everything update resets will reset.')) {
    return false;
  } else {
    return true;
  }
}

function update() {
  if (canUpdate() && confirmUpdate()) {
    player.updatePoints += getUpdateGain();
    player.updates++;
    for (let i = 0; i <= 7; i++) {
      player.progress[i] = 0;
      player.devs[i] = 0;
    }
    player.milestones = 0;
    player.enlightened = 0;
    for (let i = 0; i <= 3; i++) {
      player.power[i] = 0;
    }
  }
}

function getPowerGainPerExperience() {
  if (player.currentChallenge === 'powerless') {
    return 0;
  } else {
    return Math.max(0, (1 + Math.log2(player.updates)) / 100) * challengeReward('powerless');
  }
}

function assignAll(i) {
  player.experience[i] += player.updatePoints;
  player.updatePoints = 0;
}

function getUpdatePowerEffect(i) {
  if (i === 0) {
    return Math.sqrt(player.power[i] + 1);
  } else {
    return Math.log2(player.power[i] + 2)
  }
}

const UPGRADE_COSTS = [5, 1e4];

function upgradeBought(i, j) {
  return player.upgrades[i][j];
}

function upgradeActive(i, j) {
  return player.currentChallenge !== 'upgradeless' && player.upgrades[i][j];
}

function buyUpdateUpgrade(i, j) {
  if (upgradeBought(i, j) || player.experience[j] < UPGRADE_COSTS[i]) {
    return false;
  }
  player.experience[j] -= UPGRADE_COSTS[i];
  player.upgrades[i][j] = true;
}

function fillInInputs() {
  fillInAutoDev();
  fillInConfirmations();
}

function fillInAutoDev () {
  for (let i = 0; i <= 4; i++) {
    document.getElementById('auto-dev-' + i).value = player.auto.dev.settings[i];
  }
  document.getElementById('auto-dev-on').checked = player.auto.dev.on;
}

function fillInConfirmations() {
  document.getElementById('prestige-confirmation').checked = player.options.confirmations.prestige;
  document.getElementById('prestige-without-gain-confirmation').checked = player.options.confirmations.prestigeWithoutGain;
  document.getElementById('update-confirmation').checked = player.options.confirmations.update;
  document.getElementById('enter-challenge-confirmation').checked = player.options.confirmations.enterChallenge;
  document.getElementById('exit-challenge-confirmation').checked = player.options.confirmations.exitChallenge;
}

function toggleAutoDev() {
  player.auto.dev.on = !player.auto.dev.on;
}

function updateAutoDev(i) {
  player.auto.dev.settings[i] = +document.getElementById("auto-dev-" + i).value || 0;
}

const TAB_LIST = ['main', 'update', 'challenges'];

function updateTabButtonDisplay () {
  if (player.updates > 0) {
    document.getElementById('update-button').style.display = '';
  } else {
    document.getElementById('update-button').style.display = 'none';
  }
  if (player.stats.recordDevelopment[''] >= 86400) {
    document.getElementById('challenges-button').style.display = '';
  } else {
    document.getElementById('challenges-button').style.display = 'none';
  }
}

function updateTabDisplay() {
  for (let i = 0; i < TAB_LIST.length; i++) {
    if (player.tab === TAB_LIST[i]) {
      document.getElementById(TAB_LIST[i] + '-div').style.display = '';
    } else {
      document.getElementById(TAB_LIST[i] + '-div').style.display = 'none';
    }
  }
}

function setTab(x) {
  player.tab = x;
  updateTabDisplay();
}

function updateChallengeDisplay () {
  document.getElementById('total-challenge-completions').innerHTML = format(getTotalChallengeCompletions());
  document.getElementById('current-challenge').innerHTML = getChallengeForDisplay(player.currentChallenge);
  document.getElementById('next-challenge-unlock').innerHTML = nextChallengeUnlock();
  for (let i in CHALLENGE_UNLOCKS) {
    if (isChallengeUnlocked(i)) {
      document.getElementById(i + '-td').style.display = '';
    } else {
      document.getElementById(i + '-td').style.display = 'none';
    }
    document.getElementById('record-development-in-' + i).innerHTML = toTime(player.stats.recordDevelopment[i]);
    document.getElementById(i + '-reward-description').innerHTML = describeChallengeReward(i);
    document.getElementById(i + '-completed-description').innerHTML = describeChallengeCompleted(i);
  }
}

function updateDisplay () {
  updateTabButtonDisplay();
  for (let i = 0; i <= 6; i++) {
    document.getElementById("progress-span-" + i).innerHTML = toTime(player.progress[i]);
  }
  document.getElementById("progress-span-7").innerHTML = player.progress[7].toFixed(4);
  for (let i = 1; i <= 7; i++) {
    if (i === 2 || i === 6) {
      document.getElementById("effect-span-" + i).innerHTML = format(1 + getEffect(i));
    } else if (i === 4) {
      document.getElementById("effect-span-" + i).innerHTML = toTime(getEffect(i));
    } else {
      document.getElementById("effect-span-" + i).innerHTML = format(getEffect(i));
    }
  }
  for (let i = 0; i <= 4; i++) {
    document.getElementById("devs-" + i).innerHTML = player.devs[i];
  }
  for (let i = 5; i <= 6; i++) {
    if (canPrestigeWithoutGain(i)) {
      document.getElementById("prestige-" + i).innerHTML = '(' + toTime(player.progress[i]) + ' -> ' + toTime(player.progress[i]) + ') (no gain)';
    } else if (canPrestige(i)) {
      document.getElementById("prestige-" + i).innerHTML = '(' + toTime(player.progress[i]) + ' -> ' + toTime(player.progress[0]) + ')';
    } else if (player.currentChallenge === 'unprestigious') {
      document.getElementById("prestige-" + i).innerHTML = '(disabled in this challenge)';
    } else {
      document.getElementById("prestige-" + i).innerHTML = '(requires ' + toTime(1800) + ' development)';
    }
  }
  if (player.progress[7] >= 1) {
    document.getElementById('enlightened-desc').innerHTML = 'make patience meter slower, but slightly stronger';
  } else {
    document.getElementById('enlightened-desc').innerHTML = 'requires max patience meter';
  }
  if (canUpdate()) {
    let gain = getUpdateGain();
    document.getElementById('update-gain').innerHTML = 'gain ' + format(gain) + ' update point' + (gain === 1 ? '' : 's');
  } else {
    document.getElementById('update-gain').innerHTML = 'requires ' + toTime(CHALLENGE_GOALS[player.currentChallenge]) + ' development';
  }
  document.getElementById('update-points').innerHTML = format(player.updatePoints);
  document.getElementById('updates').innerHTML = player.updates;
  document.getElementById('power-gain-per-experience').innerHTML = format(getPowerGainPerExperience());
  for (let i = 0; i <= 2; i++) {
    document.getElementById('update-experience-span-' + i).innerHTML = format(player.experience[i]);
    document.getElementById('update-power-span-' + i).innerHTML = format(player.power[i]);
    document.getElementById('update-effect-span-' + i).innerHTML = format(getUpdatePowerEffect(i));
    for (let j = 0; j <= 1; j++) {
      document.getElementById('up-' + j + '-' + i + '-bought').innerHTML = upgradeBought(j, i) ? ' (bought)' : '';
    }
  }
  if (upgradeActive(0, 2)) {
    document.getElementById('auto-dev-row').style.display = '';
    document.getElementById('auto-dev-span').style.display = '';
  } else {
    document.getElementById('auto-dev-row').style.display = 'none';
    document.getElementById('auto-dev-span').style.display = 'none';
  }
  updateChallengeDisplay();
  document.getElementById('record-development').innerHTML = toTime(player.stats.recordDevelopment['']);
  document.getElementById('unassigned-devs').innerHTML = getUnassignedDevs();
  document.getElementById('progress-milestones').innerHTML = player.milestones;
  document.getElementById('progress-milestones-effect').innerHTML = getMilestoneEffect();
  document.getElementById('enlightened').innerHTML = getTotalEnlightened();
  document.getElementById('devs-plural').innerHTML = (getTotalDevs() === 1) ? '' : 's';
  document.getElementById('unassigned-devs-plural').innerHTML = (getUnassignedDevs() === 1) ? '' : 's';
  document.getElementById('progress-milestones-plural').innerHTML = (player.milestones === 1) ? '' : 's';
  document.getElementById('update-points-plural').innerHTML = (player.updatePoints === 1) ? '' : 's';
  document.getElementById('updates-plural').innerHTML = (player.updates === 1) ? '' : 's';
  document.getElementById('enlightened-plural').innerHTML = (getTotalEnlightened() === 1) ? '' : 's';
}

window.onload = function () {
  loadGameStorage();
  setInterval(tick, 50);
  setInterval(saveGame, 10000);
}
