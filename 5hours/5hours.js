function loadGame (s, offlineProgress) {
  // offlineProgress = null means leave it up to the save.
  player = JSON.parse(atob(s));
  if (offlineProgress === null) {
    offlineProgress = player.options.offlineProgress;
  }
  fixPlayer();
  convertSaveToDecimal();
  // We can do this after fixing Decimal.
  let now = Date.now();
  if (offlineProgress) {
    simulateTime((now - player.lastUpdate) / 1000);
  }
  player.lastUpdate = now;
  saveGame();
  fillInInputs();
  updateTabDisplay();
  updateCompletionMilestoneDisplay();
  updateAchievementDisplay();
  updateLoreDisplay();
}

function simulateTime(totalDiff) {
  let baseTickLength = 0.05;
  let ticks = Math.ceil(Math.min(totalDiff / baseTickLength, 1000));
  let tickLength = totalDiff / ticks;
  for (let i = 0; i < ticks; i++) {
    gameCode(tickLength);
  }
}

function fixPlayer () {
  if (!('enlightened' in player)) {
    player.enlightened = 0;
  }
  if (!('updates' in player)) {
    player.updatePoints = new Decimal(0);
    player.updates = 0;
    player.experience = [new Decimal(0), new Decimal(0), new Decimal(0)];
    player.power = [new Decimal(0), new Decimal(0), new Decimal(0)];
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
        update: true,
        enterChallenge: true,
        exitChallenge: true
      },
      offlineProgress: true,
      updateChallenge: true,
      hardMode: false
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
  if (!('offlineProgress' in player.options)) {
    player.options.offlineProgress = true;
  }
  if (!('dilation' in player)) {
    player.dilation = 0;
  }
  if (!('last' in player.stats)) {
    player.stats.last = {
      enlightened: Date.now(),
      prestige: Date.now(),
      update: Date.now(),
      update: Date.now(),
      prestigeType: null,
      updatePointGain: new Decimal(0)
    }
  }
  if (!('enlightened' in player.auto)) {
    player.auto.enlightened = {
      setting: 'total times enlightened',
      value: new Decimal(0),
      displayValue: '0',
      on: false
    };
    player.auto.prestige = {
      setting: 'development',
      value: new Decimal(0),
      displayValue: '0',
      initial: 5,
      alternate: true,
      on: false
    };
    player.auto.update = {
      setting: 'development',
      value: new Decimal(0),
      displayValue: '0',
      on: false
    };
  }
  if (!('updateChallenge' in player.options)) {
    player.options.updateChallenge = true;
  }
  if (!('achievements' in player)) {
    player.achievements = {
      list: [
        false, false, false, false, false, false, false, false, false,
        false, false, false, false, false, false, false, false, false,
        false, false, false, false, false, false, false, false, false
      ],
      number: 0,
      stats: {
        savingTokens: true,
        noDevsForThat: true
      }
    }
  }
  if (!('lore' in player)) {
    player.lore = [];
  }
  for (let i in player.auto) {
    if (player.auto[i].setting && i in AUTO_SETTINGS && AUTO_SETTINGS[i].indexOf(player.auto[i].setting) === -1) {
      alert('Your ' + i + ' auto setting\'s name is no longer a possible setting. It has been reset.');
      player.auto[i].setting = AUTO_SETTINGS[i][0];
    }
  }
  if (!('hardMode' in player.options)) {
    player.options.hardMode = false;
  }
  if (!('completionMilestones' in player)) {
    player.completionMilestones = 0;
    player.auto.assignUpdatePoints = {
      settings: [0, 0, 0],
      on: false
    }
  }
  if (!('dilationUpgradesBought' in player)) {
    player.dilationUpgradesBought = 0;
  }
}

function convertSaveToDecimal () {
  player.updatePoints = new Decimal(player.updatePoints);
  for (let i = 0; i <= 2; i++) {
    player.experience[i] = new Decimal(player.experience[i]);
    player.power[i] = new Decimal(player.power[i]);
  }
  for (let i = 0; i <= 2; i++) {
    player.auto[AUTO_LIST[i]].value = new Decimal(player.auto[AUTO_LIST[i]].value);
  }
}

function loadGameStorage () {
  if (!localStorage.getItem('5hours-save')) {
    resetGame();
  } else {
    try {
      // We're loading from storage, player.options.offlineProgress isn't set yet.
      loadGame(localStorage.getItem('5hours-save'), null);
    } catch (ex) {
      console.log('Exception while loading game, please report this.', ex);
      resetGame();
    }
  }
}

function loadGamePrompt() {
  try {
    loadGame(prompt('Enter your save:'), player.options.offlineProgress);
  } catch(ex) {
    alert('The save you entered does not seem to be valid. The error was ' + ex);
  }
}

function saveGame () {
  localStorage.setItem('5hours-save', btoa(JSON.stringify(player)))
}

function exportGame () {
  let output = document.getElementById('export-output');
  let parent = output.parentElement;
  parent.style.display = "";
  output.value = btoa(JSON.stringify(player));
  output.focus();
  output.select();
  try {
    document.execCommand('copy');
  } catch(ex) {
    alert('Copying to clipboard failed.');
  }
}

let initialPlayer = {
  progress: [0, 0, 0, 0, 0, 0, 0, 0], // in seconds, or for the last from 0 to 1
  devs: [0, 0, 0, 0, 0],
  milestones: 0,
  enlightened: 0,
  updatePoints: new Decimal(0),
  updates: 0,
  experience: [new Decimal(0), new Decimal(0), new Decimal(0)],
  power: [new Decimal(0), new Decimal(0), new Decimal(0)],
  upgrades: [[false, false, false], [false, false, false]],
  auto: {
    dev: {
      settings: [0, 0, 0, 0, 0],
      on: false
    },
    enlightened: {
      setting: 'total times enlightened',
      value: new Decimal(0),
      displayValue: '0',
      on: false
    },
    prestige: {
      setting: 'development',
      value: new Decimal(0),
      displayValue: '0',
      initial: 5,
      alternate: true,
      on: false
    },
    update: {
      setting: 'development',
      value: new Decimal(0),
      displayValue: '0',
      on: false
    },
    assignUpdatePoints: {
      settings: [0, 0, 0],
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
    },
    offlineProgress: true,
    updateChallenge: true,
    hardMode: false
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
    },
    last: {
      enlightened: Date.now(),
      prestige: Date.now(),
      update: Date.now(),
      update: Date.now(),
      prestigeType: null,
      updatePointGain: new Decimal(0)
    }
  },
  achievements: {
    list: [
      false, false, false, false, false, false, false, false, false,
      false, false, false, false, false, false, false, false, false,
      false, false, false, false, false, false, false, false, false
    ],
    number: 0,
    stats: {
      savingTokens: true,
      noDevsForThat: true
    }
  },
  lore: [],
  dilation: 0,
  dilationUpgradesBought: 0,
  completionMilestones: 0,
  lastUpdate: Date.now()
}

function resetGame() {
  // The false here sets Date.now() to when the game was reset
  // rather than when the window was loaded.
  loadGame(btoa(JSON.stringify(initialPlayer)), false);
}

function resetGameWithConfirmation() {
  if (confirm('Do you really want to reset the game? You will lose all your progress, and get no benefit.')) {
    resetGame();
  }
}

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
  if (i === 0 && updateUpgradeActive(1, 2)) {
    return player.devs[i] + getTotalDevs();
  } else {
    return player.devs[i];
  }
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
  return maybeLog(getEffect(1).times(getEffect(5)).times(getMilestoneEffect()).times(getUpdatePowerEffect(0)).times(challengeReward('inefficient'))).times(getAchievementsEffect());
}

function addToProgress(diff) {
  let perDev = new Decimal(diff).times(getTotalProductionMultiplier());
  let scaling = getScaling();
  for (let i = 0; i <= 4; i++) {
    player.progress[i] = addProgress(player.progress[i], perDev.times(devsWorkingOn(i)), scaling);
  }
}

function getPatienceMeterEffect(x, enlights) {
  return 1 + softcapPatienceMeter(x) * (0.5 + 0.05 * enlights);
}

function getTimeForPatienceMeterToMaxOut(patience, enlights) {
  if (player.currentChallenge === 'impatient') {
    return Infinity;
  } else {
    let base = getBasePatienceMeterTime(patience);
    return base / (getUpdatePowerEffect(1) * challengeReward('impatient') * Math.pow(1.1, player.dilationUpgradesBought)) * Math.pow(getEnlightenedSlowFactor(), enlights);
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

function checkForMilestones() {
  player.milestones = Math.max(player.milestones, Math.floor(player.progress[0] / 1800));
}

const COMPLETION_MILESTONES = [2, 4, 8, 16];

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

function autoAssignDevs() {
  for (let i = 0; i <= 4; i++) {
    player.devs[i] = 0;
  }
  for (let i = 0; i <= 4; i++) {
    let askedFor = Math.floor(getTotalDevs() * player.auto.dev.settings[i]);
    let maxAllowed = getUnassignedDevs();
    setDevs(i, Math.min(askedFor, maxAllowed));
  }
}

function autoAssignUpdatePoints() {
  // This is built to approximate what would happen given that
  // unspent update points are assigned every tick. Given this,
  // if update points are assigned to anything, they'll eventually
  // all be assigned.
  let unspentUpdatePoints = player.updatePoints;
  if (player.auto.assignUpdatePoints.settings.every(x => x === 0)) {
    return;
  }
  // This is so we don't mar the runs of crazy people who are trying to
  // do without one of the three types of experience entirely.
  let lastNonZero = player.auto.assignUpdatePoints.settings.map(x => x !== 0).lastIndexOf(true);
  let total = Math.min(1, player.auto.assignUpdatePoints.settings.reduce((a, b) => a + b));
  for (let i = 0; i <= 2; i++) {
    let askedFor = Decimal.floor(unspentUpdatePoints.times(player.auto.assignUpdatePoints.settings[i]).div(total));
    let maxAllowed = player.updatePoints;
    let x = Decimal.min(askedFor, maxAllowed);
    if (i === lastNonZero) {
      x = maxAllowed;
    }
    player.experience[i] = player.experience[i].plus(x);
    player.updatePoints = player.updatePoints.minus(x);
  }
}

let AUTO_SETTINGS = {
  'enlightened': [
    'total times enlightened',
    'real seconds since last time enlightened',
    'time to max out patience meter',
    'optimal for X-second-long prestige'
  ],
  'prestige': [
    'development',
    '+X time improvement over current',
    '+X time improvement over better',
    'real seconds since last prestige'
  ],
  'update': [
    'development',
    'update points',
    'X times last update points',
    'real seconds since last update'
  ]
}

function shouldEnlightened(x) {
  let realSecondsAlready = (Date.now() - player.stats.last.enlightened) / 1000;
  let gameSecondsRemaining = Math.max(0, realTimeToGameTime(x - realSecondsAlready));
  let valueIfNot = getPatienceMeterNewValue(player.progress[7], gameSecondsRemaining, player.progress[4], player.enlightened);
  let valueIfSo = getPatienceMeterNewValue(0, gameSecondsRemaining, player.progress[4], player.enlightened + 1);
  let effectIfNot = getPatienceMeterEffect(valueIfNot, getTotalEnlightened());
  let effectIfSo = getPatienceMeterEffect(valueIfSo, getTotalEnlightened() + 1);
  return effectIfSo >= effectIfNot;
}

function checkForAutoEnlightened() {
  let table = {
    'total times enlightened': x => getTotalEnlightened() < x,
    'real seconds since last time enlightened': x => Date.now() - player.stats.last.enlightened >= x * 1000,
    'time to max out patience meter': x => x >= getEffect(4),
    'optimal for X-second-long prestige': x => shouldEnlightened(x)
  }
  if (table[player.auto.enlightened.setting](player.auto.enlightened.value.toNumber())) {
    enlightened();
  }
}

function getCurrentAutoPrestigeType() {
  if (player.stats.last.prestigeType === null) {
    return player.auto.prestige.initial;
  } else {
    return 5 + (player.stats.last.prestigeType + player.auto.prestige.alternate - 5) % 2;
  }
}

function getBetterPrestigeValue() {
  return Math.max(player.progress[5], player.progress[6]);
}

function checkForAutoPrestige() {
  let type = getCurrentAutoPrestigeType();
  let table = {
    'development': x => player.progress[0] >= x,
    '+X time improvement over current': x => newValueFromPrestige() - player.progress[type] >= x,
    '+X time improvement over better': x => newValueFromPrestige() - getBetterPrestigeValue() >= x,
    'real seconds since last prestige': x => Date.now() - player.stats.last.prestige >= x * 1000
  }
  if (table[player.auto.prestige.setting](player.auto.prestige.value.toNumber())) {
    prestige(type, true);
  }
}

function checkForAutoUpdate() {
  let table = {
    'development': x => player.progress[0] >= x.toNumber(),
    'update points': x => getUpdateGain().gte(x),
    'X times last update points': x => player.stats.last.updatePointGain >= x.toNumber(),
    'real seconds since last update': x => Date.now() - player.stats.last.update >= x.toNumber() * 1000
  }
  if (table[player.auto.update.setting](player.auto.update.value)) {
    update(true);
  }
}

function gameCode(diff) {
  let now = Date.now();
  if (diff === undefined) {
    diff = (now - player.lastUpdate) / 1000;
  }
  if (isNaN(diff)) {
    diff = 0;
  }
  diff = realTimeToGameTime(diff);
  player.lastUpdate = now;
  if (updateUpgradeActive(0, 2) && player.auto.dev.on) {
    autoAssignDevs();
  }
  if (hasAuto('update') && player.auto.update.on) {
    checkForAutoUpdate();
  }
  if (hasAuto('prestige') && player.auto.prestige.on) {
    checkForAutoPrestige();
  }
  if (hasAuto('enlightened') && player.auto.enlightened.on) {
    checkForAutoEnlightened();
  }
  if (hasAuto('assign-update-points') && player.auto.assignUpdatePoints.on) {
    autoAssignUpdatePoints();
  }
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

function format(x, n) {
  x = new Decimal(x);
  if (n === undefined) {
    n = 2;
  }
  let es = 0;
  while (x.gte(Decimal.pow(10, 1e6))) {
    x = x.log(10);
    es++;
  }
  let result;
  if (x.gte(1e6)) {
    let e = Math.floor(x.log(10).toNumber());
    let m = x.div(Decimal.pow(10, e)).toNumber();
    result = m.toFixed(n) + 'e' + e;
  } else if (x.equals(Math.round(x.toNumber()))) {
    result = '' + Math.round(x.toNumber());
  } else {
    result = x.toFixed(n);
  }
  return 'e'.repeat(es) + result;
}

function toTime(x, options) {
  if (x === Infinity) {
    return Infinity;
  }
  if (!options) {
    options = {};
  }
  if (x < 1 && options.secondFractions) {
    if (x < 1e-12) {
      let exponent = Math.floor(Math.log10(x));
      let mantissa = x / Math.pow(10, exponent);
      return m.toFixed(n) + 'e' + exponent + ' seconds';
    }
    let level = -Math.floor(Math.log10(x) / 3);
    x *= Math.pow(1000, level)
    let prefixes = [null, 'milli', 'micro', 'nano', 'pico'];
    return x.toFixed(2) + ' ' + prefixes[level] + 'seconds';
  }
  return [x / 3600, x / 60 % 60, Math.floor(x % 60)].map((i) => Math.floor(i).toString().padStart(2, '0')).join(':');
}

function baseDevs() {
  if (updateUpgradeActive(0, 2)) {
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

function getEffect(i) {
  let x = player.progress[i];
  if (i === 1 || i === 5) {
    if (player.currentChallenge === 'inefficient') {
      return new Decimal(1);
    } else {
      return dilationBoost(Decimal.pow(2, x / 1800 * getEffect(7)));
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
    return getTimeForPatienceMeterToMaxOut(x, player.enlightened)
  } else if (i === 7) {
    return getPatienceMeterEffect(x, getTotalEnlightened());
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

function givePrestigeAchievementsAndLore(i, oldProgress) {
  giveAchievement(2);
  giveLore(7);
  if (player.progress[i] - oldProgress >= 3600) {
    giveAchievement(6);
  }
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
    player.progress[7] = 0;
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

function subtractDev(i) {
  tryToChangeDevs(i, -1)
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

function canUpdate() {
  return player.progress[0] >= getChallengeGoal(player.currentChallenge);
}

const CHALLENGE_GOALS = {
  '': 18000,
  'logarithmic': 18000,
  'inefficient': 21600,
  'ufd': 6000,
  'lonely': 86400,
  'impatient': 43200,
  'unprestigious': 86400,
  'slow': 259200,
  'powerless': 345600,
  'upgradeless': 32400
}

function getChallengeGoal(x) {
  let hardModeTable = {
    'ufd': 7200,
    'lonely': 129600
  }
  if (player.options.hardMode && x in hardModeTable) {
    return hardModeTable[x];
  } else {
    return CHALLENGE_GOALS[x];
  }
}

function challengeCompletions(x) {
  let result = player.stats.recordDevelopment[x] / getChallengeGoal(x);
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
  let pastCompletion = player.stats.recordDevelopment[x] - getChallengeGoal(x);
  let table = {
    'inefficient': [new Decimal(1), x => Decimal.pow(2, 1 + x / 1800)],
    'ufd': [0, x => 1 + x / 3600],
    'lonely': [1, x => 2 + x / 3600],
    'impatient': [1, x => 2 + x / 3600],
    'unprestigious': [0, x => 1800 + x / 4],
    'slow': [1, x => 1.5 + x / 86400],
    'powerless': [new Decimal(1), x => Decimal.pow(2, 1 + x / 3600)],
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
      'ufd': x => '+' + format(x) + ' slower scaling',
      'lonely': x => format(x) + 'x dev gain from recruitment',
      'impatient': x => format(x) + 'x patience meter gain',
      'unprestigious': x => toTime(x) + ' extra time when prestiging',
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
  'ufd': 144000,
  'lonely': 216000,
  'impatient': 432000,
  'unprestigious': 648000,
  'slow': 864000,
  'powerless': 1296000,
  'upgradeless': 1728000
}

function getChallengeUnlock(x) {
  if (player.options.hardMode && x !== 'logarithmic') {
    return CHALLENGE_UNLOCKS[x] * 1.2;
  } else {
    return CHALLENGE_UNLOCKS[x];
  }
}

function isChallengeUnlocked(x) {
  return getChallengeUnlock(x) <= player.stats.recordDevelopment[''] || player.stats.recordDevelopment[x] > 0;
}

function sortedChallenges() {
  return Object.keys(CHALLENGE_UNLOCKS).sort((x, y) => CHALLENGE_UNLOCKS[x] - CHALLENGE_UNLOCKS[y]);
}

function nextChallengeUnlock() {
  let locked = sortedChallenges().filter(x => !isChallengeUnlocked(x));
  if (locked.length === 0) {
    return 'All challenges are unlocked.';
  } else {
    return 'Next challenge unlocks at ' + toTime(getChallengeUnlock(locked[0])) + ' development.';
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
    let gain = null;
    if (player.options.updateChallenge && canUpdate()) {
      gain = getUpdateGain();
      player.updatePoints = player.updatePoints.plus(gain);
      player.updates++;
    }
    let oldChallenge = player.currentChallenge;
    player.currentChallenge = x;
    let now = Date.now();
    updateCore(now, gain, oldChallenge);
  }
}

function exitChallenge() {
  if (player.currentChallenge !== '' && confirmExitChallenge()) {
    let gain = null;
    if (player.options.updateChallenge && canUpdate()) {
      gain = getUpdateGain();
      player.updatePoints = player.updatePoints.plus(gain);
      player.updates++;
    }
    let oldChallenge = player.currentChallenge;
    player.currentChallenge = '';
    let now = Date.now();
    updateCore(now, gain, oldChallenge);
  }
}

function giveUpdateAchievementsAndLore(now, gain, oldChallenge) {
  giveAchievement(8);
  giveLore(11);
  if (now - player.stats.last.update <= 3600000) {
    giveAchievement(10);
  }
  if (gain.gte(2)) {
    giveAchievement(11);
    giveLore(12);
  }
  if (now - player.stats.last.update <= 60000) {
    giveAchievement(13);
  }
  if (player.achievements.stats.savingTokens) {
    giveAchievement(14);
  }
  if (now - player.stats.last.update <= 1000) {
    giveAchievement(16);
  }
  if (oldChallenge === 'logarithmic') {
    giveAchievement(18);
    giveLore(23);
  }
  if (player.achievements.stats.noDevsForThat) {
    giveAchievement(21);
  }
}

function updateCore(now, gain, oldChallenge) {
  for (let i = 0; i <= 7; i++) {
    player.progress[i] = 0;
    player.devs[i] = 0;
  }
  player.milestones = 0;
  player.enlightened = 0;
  for (let i = 0; i <= 2; i++) {
    player.power[i] = new Decimal(0);
  }
  if (gain !== null) {
    giveUpdateAchievementsAndLore(now, gain, oldChallenge);
  }
  player.stats.last.update = now;
  player.stats.last.prestige = now;
  player.stats.last.enlightened = now;
  player.stats.last.prestigeType = null;
  if (gain !== null) {
    player.stats.last.updatePointGain = gain;
  }
  player.achievements.stats.savingTokens = true;
  player.achievements.stats.noDevsForThat = true;
}

function getUpgradeGainBase() {
  if (updateUpgradeActive(1, 0)) {
    return challengeReward('upgradeless');
  } else {
    return 2;
  }
}

function getUpdateGain() {
  let base = getUpgradeGainBase();
  return Decimal.floor(Decimal.pow(base, player.progress[0] / 3600 - 5));
}

function confirmUpdate() {
  let whatWillReset = 'meta-efficiency, meta-refactoring, and progress milestones, along with everything prestige resets,';
  if (player.updates > 0) {
    whatWillReset = whatWillReset.replace('and progress milestones', 'progress milestones, and endgame/patience/headstart power')
  }
  if (player.options.confirmations.update) {
    return confirm('Are you sure you want to update? Your ' + whatWillReset + ' will reset.');
  } else {
    return true;
  }
}

function confirmEnterChallenge (x) {
  if (player.options.confirmations.enterChallenge) {
    return confirm('Are you sure you want to enter the \'' + getChallengeForDisplay(x) + '\' challenge? ' +
    'The described special conditions will apply, and everything update resets will reset.');
  } else {
    return true;
  }
}

function confirmExitChallenge() {
  if (player.options.confirmations.exitChallenge) {
    return confirm('Are you sure you want to exit the \'' + getChallengeForDisplay(player.currentChallenge) + '\' challenge? ' +
    'You will not get further in it than you are now until you enter it again, and everything update resets will reset.');
  } else {
    return true;
  }
}

function update(noConfirm) {
  if (canUpdate() && (noConfirm || confirmUpdate())) {
    let gain = getUpdateGain();
    player.updatePoints = player.updatePoints.plus(gain);
    player.updates++;
    let oldChallenge = player.currentChallenge;
    player.currentChallenge = '';
    let now = Date.now();
    updateCore(now, gain, oldChallenge);
  }
}

function getPowerGainPerExperience() {
  if (player.currentChallenge === 'powerless') {
    return new Decimal(0);
  } else {
    return Decimal.max(0, (1 + Math.log2(player.updates)) / 100).times(challengeReward('powerless'));
  }
}

function assignAll(i) {
  player.experience[i] = player.experience[i].plus(player.updatePoints);
  player.updatePoints = new Decimal(0);
}

function assignThird(i) {
  let x = Decimal.floor(player.updatePoints.div(3));
  if (player.updatePoints.gt(0) && x.eq(0)) {
    x = new Decimal(1);
  }
  player.experience[i] = player.experience[i].plus(x);
  player.updatePoints = player.updatePoints.minus(x);
}

function assignOne(i) {
  let x = Decimal.min(1, player.updatePoints);
  player.experience[i] = player.experience[i].plus(x);
  player.updatePoints = player.updatePoints.minus(x);
}

function getUpdatePowerEffect(i) {
  if (i === 0) {
    return Decimal.sqrt(player.power[i].plus(1));
  } else {
    return Decimal.log2(player.power[i].plus(2)).toNumber();
  }
}

const UPGRADE_COSTS = [5, 1e4];

const HARD_MODE_UPGRADE_COSTS = [10, 1e6];

function getUpgradeCost(x) {
  if (player.options.hardMode) {
    return HARD_MODE_UPGRADE_COSTS[x];
  } else {
    return UPGRADE_COSTS[x];
  }
}

function updateUpgradeBought(i, j) {
  return player.upgrades[i][j];
}

function updateUpgradeActive(i, j) {
  return player.currentChallenge !== 'upgradeless' && player.upgrades[i][j];
}

function canBuyUpdateUpgrade(i, j) {
  return !updateUpgradeBought(i, j) && player.experience[j].gte(getUpgradeCost(i));
}

function buyUpdateUpgrade(i, j) {
  if (!canBuyUpdateUpgrade(i, j)) {
    return false;
  }
  player.experience[j] = player.experience[j].minus(getUpgradeCost(i));
  player.upgrades[i][j] = true;
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

function diminishingReturns(x) {
  return 1 / 10 - 1 / (10 + x);
}

function getDilationEffect() {
  return 1 + diminishingReturns(Math.log10(1 + player.dilation));
}

function dilationBoost(x) {
  return Decimal.pow(10, Math.max(x.log10(), Math.pow(x.log10(), getDilationEffect())))
}

function buyDilationUpgrade() {
  if (player.dilation < 10 * Math.pow(2, player.dilationUpgradesBought)) {
    return false;
  }
  player.dilation -= 10 * Math.pow(2, player.dilationUpgradesBought);
  player.dilationUpgradesBought++;
}

function fillInInputs() {
  fillInAutoDev();
  fillInAutoOther();
  fillInAutoAssignUpdatePoints();
  fillInOptions();
  fillInConfirmations();
}

function fillInAutoDev () {
  for (let i = 0; i <= 4; i++) {
    document.getElementById('auto-dev-' + i).value = player.auto.dev.settings[i];
  }
  document.getElementById('auto-dev-on').checked = player.auto.dev.on;
}

let AUTO_LIST = ['enlightened', 'prestige', 'update'];

function fillInAutoOther () {
  for (let i = 0; i <= 2; i++) {
    document.getElementById('auto-' + AUTO_LIST[i] + '-setting').innerHTML = player.auto[AUTO_LIST[i]].setting;
    document.getElementById('auto-' + AUTO_LIST[i] + '-value').value = player.auto[AUTO_LIST[i]].displayValue;
    document.getElementById('auto-' + AUTO_LIST[i] + '-on').checked = player.auto[AUTO_LIST[i]].on;
  }
  document.getElementById('auto-prestige-initial').innerHTML = 'meta-' + ['efficiency', 'refactoring'][player.auto.prestige.initial - 5];
  document.getElementById('auto-prestige-alternate').checked = player.auto.prestige.alternate;
}

function fillInAutoAssignUpdatePoints() {
  for (let i = 0; i <= 2; i++) {
    document.getElementById('auto-assign-update-points-' + i).value = player.auto.assignUpdatePoints.settings[i];
  }
  document.getElementById('auto-assign-update-points-on').checked = player.auto.assignUpdatePoints.on;
}

function fillInOptions() {
  document.getElementById('offline-progress').checked = player.options.offlineProgress;
  document.getElementById('update-challenge').checked = player.options.updateChallenge;
}

function fillInConfirmations() {
  document.getElementById('prestige-confirmation').checked = player.options.confirmations.prestige;
  document.getElementById('prestige-without-gain-confirmation').checked = player.options.confirmations.prestigeWithoutGain;
  document.getElementById('update-confirmation').checked = player.options.confirmations.update;
  document.getElementById('enter-challenge-confirmation').checked = player.options.confirmations.enterChallenge;
  document.getElementById('exit-challenge-confirmation').checked = player.options.confirmations.exitChallenge;
}

function toggleAutoOn(x) {
  player.auto[x].on = !player.auto[x].on;
}

function updateAutoDev(i) {
  player.auto.dev.settings[i] = +document.getElementById('auto-dev-' + i).value || 0;
}

function updateAutoAssignUpdatePoints(i) {
  player.auto.assignUpdatePoints.settings[i] = +document.getElementById('auto-assign-update-points-' + i).value || 0;
}

function nextAutoSetting(x) {
  player.auto[x].setting = AUTO_SETTINGS[x][(AUTO_SETTINGS[x].indexOf(player.auto[x].setting) + 1) % AUTO_SETTINGS[x].length];
  document.getElementById('auto-' + x + '-setting').innerHTML = player.auto[x].setting;
}

function parseAutoValue(x) {
  try {
    let parts = x.split(':');
    let result = parts.map((i, index) => new Decimal(i).times(Decimal.pow(60, parts.length - index - 1))).reduce((a, b) => a.plus(b));
    if (isNaN(result)) {
      return new Decimal(0);
    } else {
      return result;
    }
  } catch (e) {
    return new Decimal(0);
  }
}

function updateAutoValue(x) {
  let value = document.getElementById('auto-' + x + '-value').value;
  player.auto[x].value = parseAutoValue(value);
  player.auto[x].displayValue = value;
}

function toggleAutoPrestigeInitial() {
  player.auto.prestige.initial = 5 + player.auto.prestige.initial % 2;
  document.getElementById('auto-prestige-initial').innerHTML = 'meta-' + ['efficiency', 'refactoring'][player.auto.prestige.initial - 5];
}

function toggleAutoPrestigeAlternate() {
  player.auto.prestige.alternate = !player.auto.prestige.alternate;
}

function hasAuto(x) {
  let table = {
    'enlightened': 0,
    'prestige': 1,
    'update': 2,
    'assign-update-points': 3
  }
  return player.completionMilestones > table[x];
}

function getAchievementsEffect() {
  return Math.pow(1.1, player.achievements.number);
}

function giveAchievement(i) {
  if (!player.achievements.list[i]) {
    player.achievements.list[i] = true;
    player.achievements.number++;
    updateAchievementDisplay();
  }
}

function giveLore(i) {
  if (player.lore.indexOf(i) === -1) {
    player.lore.push(i);
    updateLoreDisplay();
  }
}

function checkForAchievementsAndLore() {
  let progress = player.progress.slice(0, 5);
  let devs = player.devs.slice(0, 5);
  let loreFarthest = Math.max(
    Math.max.apply(null, progress), player.stats.recordDevelopment['']);
  giveLore(0);
  if (devs.some(i => i !== 0)) {
    giveAchievement(0);
    giveLore(1);
  }
  if (loreFarthest >= 120) {
    giveLore(2);
  }
  if (loreFarthest >= 180) {
    giveLore(3);
  }
  if (getTotalDevs() > 1) {
    giveLore(4);
  }
  if (devs.every(i => i !== 0)) {
    giveAchievement(1);
  }
  if (getEffect(1).gte(1.2)) {
    giveLore(5);
  }
  if (getEffect(2) >= 0.5) {
    giveLore(6);
  }
  if (devs.every(i => i === 0) && progress.every(x => x >= 3600)) {
    giveAchievement(3);
  }
  if (Math.max.apply(null, progress) - Math.min.apply(null, progress) <= 60 && progress.every(x => x >= 3600)) {
    giveAchievement(4);
  }
  if (getEffect(1).gt(getTotalDevs()) && getTotalDevs() > 1) {
    giveAchievement(5);
  }
  if (loreFarthest >= 12600) {
    giveLore(8);
  }
  if (loreFarthest >= 16200) {
    giveLore(9);
  }
  if (getTotalEnlightened() > 0) {
    giveAchievement(7);
    giveLore(10);
  }
  if (player.experience.every(i => i.neq(0))) {
    giveAchievement(9);
  }
  if (player.stats.recordDevelopment[''] >= 43200) {
    giveLore(13);
  }
  if (player.upgrades.every(i => i.every(j => j))) {
    giveAchievement(12);
  }
  if (player.stats.recordDevelopment[''] >= 86400) {
    giveAchievement(15);
  }
  let challenges = sortedChallenges();
  for (let i = 0; i <= 8; i++) {
    if (isChallengeUnlocked(challenges[i])) {
      giveLore(14 + i);
    }
  }
  if (getTotalDevs() >= 50000) {
    giveAchievement(17);
  }
  if (getTotalChallengeCompletions() >= 12) {
    giveAchievement(19);
  }
  if (getTotalChallengeCompletions() >= 20) {
    giveAchievement(20);
  }
  if (player.dilation > 0) {
    giveAchievement(22);
    giveLore(24);
  }
  if (player.dilation >= 100 / 3) {
    giveAchievement(23);
    giveLore(25);
  }
  if (getTotalEnlightened() >= 40) {
    giveAchievement(24);
    giveLore(26);
  }
  if (getTotalDevs() >= 1e9) {
    giveAchievement(25);
    giveLore(27);
  }
  if (player.updatePoints.gte(Number.MAX_VALUE)) {
    giveAchievement(26);
    giveLore(28);
  }
  if (player.achievements.list.every(x => x)) {
    giveLore(29);
  }
  if (player.lore.length >= LORE_LIST.length - 3) {
    for (let i = 3; i > 0; i--) {
      giveLore(LORE_LIST.length - i);
    }
  }
}

const LORE_LIST = [
  'You just got a game idea and you\'re excited to start working on it. It seems simple enough that it should only take 5 hours to finish.',
  'You started working. Everything seems fairly reasonable so far.',
  'Weird, you\'ve only made two minutes of progress on what you\'re working on, but you think it\'s been a bit longer than that.',
  'The oddly-slow progress thing is still happening. Is time itself bending? Probably not: it\'s just that you had unrealistic expectations. You hope this doesn\'t get worse.',
  'You manage to recruit another developer to help. They seem to be just as effective as you.',
  'Your study of efficiency is paying off. You\'re now 20% as effective at getting stuff done, and it\'s only getting better.',
  'It seems that most of the unexpected slowdown in progress is due to bad coding style, and by refactoring the code you\'ve managed to significantly improve the ease of progress.',
  'The efficiency and refactoring weren\'t enough. You decided to restart the project from scratch, taking advantage of what you\'d learned.',
  'Progress seems to be slowing down, even given everything you\'ve learned from restarting the project. Perhaps you need more patience, though.',
  'Patience alone didn\'t seem to help quite enough to finish; you\'re close, but not there. Maybe there\'s something you can do to enlighten the situation.',
  'You\'re now enlightened. Apart from the mystical aspects, this seems to make patience a little stronger. You feel that restarting the project will cause you to lose your enlightenment, though',
  'You finally made a game which was basically what you wanted, but you\'ve thought of a bunch of cool stuff you can add. Maybe you can release another update with that.',
  'You\'ve gotten enough experience from past updates that now you can make bigger updates. How far will this go?',
  'You seem to be getting the hang of this. It\'s a bit monotonous, but maybe that will change soon. Maybe at 24:00:00, that seems significant.',
  'You decide that for some update soon, you\'re going to start programming in a new language. All your skills in it are terrible, but you\'ve heard that the new paradigm might give you enlightenment, so you try it anyway.',
  'One of the people working with you tells you that efficiency is overrated. You decide that you\'ll try not working on it while making some update soon.',
  'OK, efficiency is more useful than you thought. In that case, as suggested by someone else, refactoring must be what\'s overrated. You decide to try going without that.',
  'Going without efficiency and without refactoring turned out to both be terrible ideas. You decide that to avoid such bad ideas from other people, you\'ll just work alone.',
  'This is all so slow! You decide that you\'re going to stop waiting for patience. You have a bunch of enlightenment even without patience, so what\'s the point of patience anyway?',
  'Restarting development over and over without even releasing an update is so annoying! You decide to try to release an update without starting over for once.',
  'You\'re planning on taking a vacation, along with everyone else. You all won\'t be able to dedicate quite as much time to updating the game then, but it will still be fine, right?',
  'What was the use of experience anyway? It\'s said that it gives you some kind of "power", but that power doesn\'t seem that powerful. You\'ll just go without it.',
  'There\'s some other stuff you did with your experience, but in retrospect it couldn\'t have been worth it. You decide to do without that instead.',
  'Wow, you understand that other language now. That wasn\'t too bad.',
  'Maybe you spoke too soon. You\'ve kept programming in that other language and now you\'re getting some "dilation", whatever that is. Even though it\'s right in front of you, it seems hard to describe to anyone else.',
  'You still don\'t really know what this "dilation" stuff is, but it seems useful. You think you probably have enough of it for now, though.',
  'You are extremely enlightened right now, but it doesn\'t actually seem to be helping in development that much.',
  'There are a lot of people working on this game. You decide to not think about whether anyone is actually playing it.',
  'Well, you\'ve done it. You\'ve made so many great updates that your game is recognized as the best game in the world. You still feel like you could add more to it, but you\'re not sure what the point would be.',
  'Not only is your game the best ever, but you\'ve done everything that could be expected of you in its development, even some things that were considered unrelated (e.g., that "dilation" was apparently an important new substance in physics). You\'re not really sure what to do next.',
  'You feel something in your mind saying "Yeah, that\'s it, you\'ve reached the end of the game." You\'re not sure what that means; you still have more ideas for your game. "You can either keep going (but nothing really new happens) or hard reset." Huh? "In any case, congratulations, thanks for playing, and I hope you enjoyed."',
  'Not that long later, you meet someone who looks surprised to see you. She says she just finished your game and wonders what she can do next. You say, "Well of course you can keep going or hard reset" (and you suddenly understand the voice in your mind a bit better) "but you can also make your own game. Maybe it will catch on."',
  'As you say this, you remember how far you\'ve gone in your quest to make a game, and how far you\'ve come since you\'ve started. You also recall how, in playing, the person you\'re talking to must have gone through a similar journey. You hear the voice in your mind say "So did I" [not really, making this game was rather easy, but please ignore this bracketed part OK?], and you smile.'
]

const TAB_LIST = ['main', 'achievements', 'lore', 'update', 'challenges', 'completion-milestones'];

function updateTabButtonDisplay () {
  if (player.updates > 0) {
    document.getElementById('update-tab-button').style.display = '';
  } else {
    document.getElementById('update-tab-button').style.display = 'none';
  }
  if (player.stats.recordDevelopment[''] >= 86400) {
    document.getElementById('challenges-tab-button').style.display = '';
    document.getElementById('completion-milestones-tab-button').style.display = '';
  } else {
    document.getElementById('completion-milestones-tab-button').style.display = 'none';
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
    document.getElementById('dilation-text').innerHTML = 'You have ' + format(player.dilation, 4) + ' dilation, ' + format(getDilationPerSecond(), 4) + ' dilation per second, with effect x^' + format(getDilationEffect(), 4) + '.';
    document.getElementById('dilation-upgrade-button').innerHTML = 'Multiply patience meter speed by 1.1. Currently: ' + format(Math.pow(1.1, player.dilationUpgradesBought)) + 'x, Cost: ' + format(10 * Math.pow(2, player.dilationUpgradesBought)) + ' dilation';
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

function updateAchievementDisplay() {
  document.getElementById('total-achievements').innerHTML = player.achievements.number;
  document.getElementById('total-achievements-plural').innerHTML = (player.achievements.number === 1) ? '' : 's';
  document.getElementById('achievements-effect').innerHTML = format(getAchievementsEffect());
  for (let i = 0; i <= 26; i++) {
    if (player.achievements.list[i]) {
      document.getElementById('ach-status-' + i).innerHTML = '&#x2714;';
    } else {
      document.getElementById('ach-status-' + i).innerHTML = '&#x2718;';
    }
  }
}

function updateLoreDisplay() {
  let loreShown = LORE_LIST.map((lore, i) => (player.lore.indexOf(i) === -1) ? '' : lore);
  while (loreShown[loreShown.length - 1] === '') {
    loreShown.pop();
  }
  document.getElementById('lore-div').innerHTML = loreShown.join('<br/>') + '<hr/>';
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

function updateDisplay () {
  updateTabButtonDisplay();
  for (let i = 0; i <= 6; i++) {
    document.getElementById("progress-span-" + i).innerHTML = toTime(player.progress[i]);
  }
  document.getElementById("progress-span-7").innerHTML = format(player.progress[7], 4);
  for (let i = 1; i <= 7; i++) {
    if (i === 2 || i === 6) {
      document.getElementById("effect-span-" + i).innerHTML = format(getEffect(i));
    } else if (i === 4) {
      document.getElementById("effect-span-" + i).innerHTML = toTime(getEffect(i), {secondFractions: true});
    } else {
      document.getElementById("effect-span-" + i).innerHTML = format(getEffect(i));
    }
  }
  for (let i = 0; i <= 4; i++) {
    document.getElementById("devs-" + i).innerHTML = format(player.devs[i]);
  }
  for (let i = 5; i <= 6; i++) {
    let el = document.getElementById('prestige-' + i);
    let btn = document.getElementById('prestige-' + i + '-button');
    if (canPrestigeWithoutGain(i)) {
      el.innerHTML = '(' + toTime(player.progress[i]) + ' -> ' + toTime(player.progress[i]) + ')<br/>(no gain)';
      btn.style.backgroundColor = '#F0F020';
    } else if (canPrestige(i)) {
      el.innerHTML = '(' + toTime(player.progress[i]) + ' -> ' + toTime(newValueFromPrestige()) + ')';
      btn.style.backgroundColor = '#20F020';
    } else if (player.currentChallenge === 'unprestigious') {
      el.innerHTML = '(disabled in this challenge)';
      btn.style.backgroundColor = '#F02020';
    } else {
      el.innerHTML = '(requires ' + toTime(1800) + ' development)';
      btn.style.backgroundColor = '#F02020';
    }
  }
  if (player.progress[7] >= 1) {
    document.getElementById('enlightened-desc').innerHTML = 'make patience meter slower, but slightly stronger';
    document.getElementById('enlightened-button').style.backgroundColor = '#20F020';
  } else {
    document.getElementById('enlightened-desc').innerHTML = 'requires max patience meter';
    document.getElementById('enlightened-button').style.backgroundColor = '#F02020';
  }
  if (canUpdate()) {
    let gain = getUpdateGain();
    document.getElementById('update-gain').innerHTML = 'gain ' + format(gain) + ' update point' + (gain.eq(1) ? '' : 's');
    document.getElementById('update-button').style.backgroundColor = '#20F020';
  } else {
    document.getElementById('update-gain').innerHTML = 'requires ' + toTime(getChallengeGoal(player.currentChallenge)) + ' development';
    document.getElementById('update-button').style.backgroundColor = '#F02020';
  }
  document.getElementById('update-points').innerHTML = format(player.updatePoints);
  document.getElementById('updates').innerHTML = player.updates;
  document.getElementById('power-gain-per-experience').innerHTML = format(getPowerGainPerExperience());
  for (let i = 0; i <= 2; i++) {
    document.getElementById('update-experience-span-' + i).innerHTML = format(player.experience[i]);
    document.getElementById('update-power-span-' + i).innerHTML = format(player.power[i]);
    document.getElementById('update-effect-span-' + i).innerHTML = format(getUpdatePowerEffect(i));
    for (let j = 0; j <= 1; j++) {
      document.getElementById('up-' + j + '-' + i + '-cost').innerHTML = format(getUpgradeCost(j));
      document.getElementById('up-' + j + '-' + i + '-bought').innerHTML = updateUpgradeBought(j, i) ? ' (bought)' : '';
      let btn = document.getElementById('up-' + j + '-' + i + '-button');
      if (updateUpgradeActive(j, i)) {
        btn.style.backgroundColor = '#2020F0';
      } else if (updateUpgradeBought(j, i)) {
        btn.style.backgroundColor = '#F020F0';
      } else if (canBuyUpdateUpgrade(j, i)) {
        btn.style.backgroundColor = '#20F020';
      } else {
        btn.style.backgroundColor = '#F02020';
      }
    }
  }
  if (updateUpgradeActive(0, 2)) {
    document.getElementById('auto-dev-row').style.display = '';
    document.getElementById('auto-dev-span').style.display = '';
  } else {
    document.getElementById('auto-dev-row').style.display = 'none';
    document.getElementById('auto-dev-span').style.display = 'none';
  }
  for (let i = 0; i <= 2; i++) {
    if (hasAuto(AUTO_LIST[i])) {
      document.getElementById('auto-' + AUTO_LIST[i] + '-span').style.display = '';
    } else {
      document.getElementById('auto-' + AUTO_LIST[i] + '-span').style.display = 'none';
    }
  }
  if (hasAuto('assign-update-points')) {
    document.getElementById('auto-assign-update-points-row').style.display = '';
    document.getElementById('auto-assign-update-points-span').style.display = '';
  } else {
    document.getElementById('auto-assign-update-points-row').style.display = 'none';
    document.getElementById('auto-assign-update-points-span').style.display = 'none';
  }
  if (hasAuto(AUTO_LIST[0])) {
    document.getElementById('auto-help-span').style.display = '';
  } else {
    document.getElementById('auto-help-span').style.display = 'none';
  }
  updateChallengeDisplay();
  // One line of code, it can go here.
  document.getElementById('total-challenge-completions-milestone-tab').innerHTML = format(getTotalChallengeCompletions());
  document.getElementById('record-development').innerHTML = toTime(player.stats.recordDevelopment['']);
  document.getElementById('unassigned-devs').innerHTML = format(getUnassignedDevs());
  document.getElementById('progress-milestones').innerHTML = player.milestones;
  document.getElementById('progress-milestones-effect').innerHTML = getMilestoneEffect();
  document.getElementById('enlightened').innerHTML = getTotalEnlightened();
  if (player.options.hardMode) {
    document.getElementById('hard-mode-span').innerHTML = 'Hard mode: on';
  } else {
    document.getElementById('hard-mode-span').innerHTML = 'Hard mode: off';
  }
  document.getElementById('devs-plural').innerHTML = (getTotalDevs() === 1) ? '' : 's';
  document.getElementById('unassigned-devs-plural').innerHTML = (getUnassignedDevs() === 1) ? '' : 's';
  document.getElementById('progress-milestones-plural').innerHTML = (player.milestones === 1) ? '' : 's';
  document.getElementById('update-points-plural').innerHTML = (player.updatePoints.eq(1)) ? '' : 's';
  document.getElementById('updates-plural').innerHTML = (player.updates === 1) ? '' : 's';
  document.getElementById('enlightened-plural').innerHTML = (getTotalEnlightened() === 1) ? '' : 's';
}

window.onload = function () {
  loadGameStorage();
  setInterval(tick, 50);
  setInterval(saveGame, 10000);
}
