function loadGame (s) {
  player = JSON.parse(atob(s));
  fixPlayer();
  saveGame();
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
  lastUpdate: Date.now()
}

function resetGame() {
  loadGame(btoa(JSON.stringify(initialPlayer)));
}

function endgameUpg0Formula(x) {
  if (player.upgrades[0][0] && x > 2) {
    // Don't take x^3 for small x.
    return Math.min(Math.exp(x), Math.pow(x, 3));
  } else {
    return Math.exp(x);
  }
}

function endgameUpg0FormulaInverse(x) {
  if (player.upgrades[0][0]) {
    let options = [Math.ln(x), Math.pow(x, 1 / 3)];
    let checkOption = (i) => Math.abs(endgameUpg0Formula(i) / x - 1) < 1e-9;
    return options.filter(checkOption)[0];
  } else {
    return Math.log(x);
  }
}

function centralFormula(x, c) {
  return 600 * (Math.exp(6 * (endgameUpg0Formula(x / 3600) - 1) / c) - 1);
}

function invertCentralFormula(x, c) {
  return 3600 * endgameUpg0FormulaInverse(c * Math.log(x / 600 + 1) / 6 + 1);
}

function addProgress(orig, change, c) {
  let real = centralFormula(orig, c);
  return invertCentralFormula(real + change, c);
}

function getScaling() {
  return 1 + getEffect(2) + getEffect(6);
}

function devsWorkingOn(i) {
  if (i === 0 && player.upgrades[1][2]) {
    return player.devs[i] + getTotalDevs();
  } else {
    return player.devs[i];
  }
}

function addToProgress(diff) {
  let perDev = diff * getEffect(1) * getEffect(5) * getMilestoneEffect() * getUpdatePowerEffect(0);
  let scaling = getScaling();
  for (let i = 0; i <= 4; i++) {
    player.progress[i] = addProgress(player.progress[i], devsWorkingOn(i) * perDev, scaling);
  }
}

function addToPatience(diff) {
  player.progress[7] = player.progress[7] + diff / getEffect(4);
  if (!player.upgrades[1][1]) {
    player.progress[7] = Math.min(1, player.progress[7]);
  }
}

function checkForMilestones() {
  player.milestones = Math.max(player.milestones, Math.floor(player.progress[0] / 1800));
}

function addToUpdatePower(diff) {
  for (let i = 0; i <= 2; i++) {
    player.power[i] += diff * player.experience[i] * getUpdatesEffect();
  }
}

function gameCode() {
  let now = Date.now();
  diff = (now - player.lastUpdate) / 1000;
  if (isNaN(diff)) {
    diff = 0;
  }
  player.lastUpdate = now;
  addToProgress(diff);
  addToPatience(diff);
  addToUpdatePower(diff);
  checkForMilestones();
}

function tick() {
  gameCode();
  updateDisplay();
}

function format(x) {
  if (x === Math.floor(x)) {
    return '' + x;
  } else {
    return x.toFixed(2);
  }
}

function toTime(x) {
  return [x / 3600, x / 60 % 60, Math.floor(x % 60)].map((i) => Math.floor(i).toString().padStart(2, '0')).join(':');
}

function getTotalDevs () {
  return getEffect(3);
}

function patienceMeterScaling () {
  if (player.upgrades[1][1]) {
    return 2.5;
  } else {
    return 2;
  }
}

function patienceMeterMinTime () {
  if (player.upgrades[1][1]) {
    return 10;
  } else {
    return 60;
  }
}

function getBasePatienceMeterTime (x) {
  let result = 86400 / Math.pow(patienceMeterScaling(), x / 1800);
  let minTime = patienceMeterMinTime();
  if (result < minTime) {
    result = minTime / (1 + Math.ln(minTime / result));
  }
  return result;
}

function softcapPatienceMeter(x) {
  if (x <= 1) {
    return x;
  } else {
    return 1 + Math.ln(x) / 10;
  }
}

function getEffect(i) {
  let x = player.progress[i];
  if (i === 1 || i === 5) {
    return Math.pow(2, x / 1800 * getEffect(7));
  } else if (i === 2 || i === 6) {
    return x / 1800 * getEffect(7);
  } else if (i === 3) {
    return 1 + Math.floor(x * getUpdatePowerEffect(2) / 300);
  } else if (i === 4) {
    let base = getBasePatienceMeterTime(x);
    return base / getUpdatePowerEffect(1) * Math.pow(2, player.enlightened);
  } else if (i === 7) {
    return 1 + softcapPatienceMeter(x) * (0.5 + 0.05 * player.enlightened);
  }
}

function canPrestige(i) {
  return player.progress[0] >= Math.max(1800, player.progress[i]);
}

function prestige(i) {
  if (canPrestige(i)) {
    player.progress[i] = player.progress[0];
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
  return player.progress[0] >= 18000;
}

function getUpgradeGainBase() {
  if (player.upgrades[1][0]) {
    return 3;
  } else {
    return 2;
  }
}

function getUpdateGain() {
  let base = getUpgradeGainBase();
  return Math.floor(Math.pow(base, player.progress[0] / 3600 - 5));
}

function update() {
  if (canUpdate()) {
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

function getUpdatesEffect() {
  return Math.max(0, (1 + Math.log2(player.updates)) / 100);
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

const UPGRADE_COSTS = [5, 100];

function buyUpdateUpgrade(i, j) {
  if (player.upgrades[i][j] || player.experience[j] < UPGRADE_COSTS[i]) {
    return false;
  }
  player.experience[j] -= UPGRADE_COSTS[i];
  player.upgrades[i][j] = true;
}

function updateDisplay () {
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
    if (canPrestige(i)) {
      document.getElementById("prestige-" + i).innerHTML = toTime(player.progress[i]) + ' -> ' + toTime(player.progress[0]);
    } else {
      document.getElementById("prestige-" + i).innerHTML = 'requires ' + toTime(1800) + ' development';
    }
  }
  if (player.progress[7] >= 1) {
    document.getElementById('enlightened-desc').innerHTML = 'make patience meter slower, but slightly stronger';
  } else {
    document.getElementById('enlightened-desc').innerHTML = 'requires max patience meter';
  }
  if (canUpdate()) {
    let gain = getUpdateGain();
    document.getElementById('update-gain').innerHTML = 'gain ' + gain + ' update point' + (gain === 1 ? '' : 's');
  } else {
    document.getElementById('update-gain').innerHTML = 'requires ' + toTime(18000) + ' development';
  }
  if (player.updates > 0) {
    document.getElementById('update-div').style.display = '';
  } else {
    document.getElementById('update-div').style.display = 'none';
  }
  document.getElementById('update-points').innerHTML = player.updatePoints;
  document.getElementById('updates').innerHTML = player.updates;
  document.getElementById('updates-effect').innerHTML = format(getUpdatesEffect());
  for (let i = 0; i <= 2; i++) {
    document.getElementById('update-experience-span-' + i).innerHTML = player.experience[i];
    document.getElementById('update-power-span-' + i).innerHTML = format(player.power[i]);
    document.getElementById('update-effect-span-' + i).innerHTML = format(getUpdatePowerEffect(i));
    for (let j = 0; j <= 1; j++) {
      document.getElementById('up-' + j + '-' + i + '-bought').innerHTML = player.upgrades[j][i] ? ' (bought)' : '';
    }
  }
  document.getElementById('progress-milestones').innerHTML = player.milestones;
  document.getElementById('progress-milestones-effect').innerHTML = getMilestoneEffect();
  document.getElementById('enlightened').innerHTML = player.enlightened;
  document.getElementById('devs-plural').innerHTML = (getTotalDevs() === 1) ? '' : 's';
  document.getElementById('progress-milestones-plural').innerHTML = (player.milestones === 1) ? '' : 's';
  document.getElementById('update-points-plural').innerHTML = (player.updatePoints === 1) ? '' : 's';
  document.getElementById('updates-plural').innerHTML = (player.updates === 1) ? '' : 's';
  document.getElementById('enlightened-plural').innerHTML = (player.enlightened === 1) ? '' : 's';
}

window.onload = function () {
  loadGameStorage();
  setInterval(tick, 50);
  setInterval(saveGame, 10000);
}
