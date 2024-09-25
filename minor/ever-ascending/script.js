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
  // No tabs yet, no achievements, no lore, etc.
  fillInOptions();
  fillInRespec();
  fillInAuto();
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
  if (!player.version) {
    player.upgrades.unlocks.list[3] = false;
    player.aether = 0;
    player.totalAether = 0;
    player.ascensions = 0;
    player.timeInAscension = 0;
    player.stash = 0;
    player.aetherUpgrades = {
      list: [0, 0, 0, 0],
      total: 0
    };
    player.respec = false;
    player.version = 1;
  }
  if (player.version < 1.1) {
    player.fastestTimeInAscension = 1e6;
    player.auto = [false, false, false, false];
    player.version = 1.1;
  }
}

function convertSaveToDecimal () {
  // Stuff that's decimal, doesn't exist yet.
}

function loadGameStorage () {
  if (!localStorage.getItem('ever-ascending-save')) {
    resetGame();
  } else {
    try {
      // We're loading from storage, player.options.offlineProgress isn't set yet.
      loadGame(localStorage.getItem('ever-ascending-save'), null);
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
  localStorage.setItem('ever-ascending-save', btoa(JSON.stringify(player)))
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
  elementAmounts: [0, 0, 0, 0],
  upgrades: {
    speedEarth: {
      list: [0, 0, 0, 0],
      total: 0,
      baseCost: 10,
      baseCostMult: 2
    },
    convertImprovement: {
      list: [0, 0, 0, 0],
      total: 0,
      baseCost: 30,
      baseCostMult: 3
    },
    unlocks: {
      list: [false, false, false, false],
      baseCost: 100,
      baseCostMult: 1
    }
  },
  aether: 0,
  totalAether: 0,
  ascensions: 0,
  timeInAscension: 0,
  fastestTimeInAscension: 1e6,
  auto: [false, false, false, false],
  stash: 0,
  aetherUpgrades: {
    list: [0, 0, 0, 0],
    total: 0
  },
  respec: false,
  version: 1,
  options: {
    offlineProgress: true
  },
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

function simulateTime(totalDiff) {
  let baseTickLength = 0.05;
  let ticks = Math.ceil(Math.min(totalDiff / baseTickLength, 1000));
  let tickLength = totalDiff / ticks;
  for (let i = 0; i < ticks; i++) {
    gameCode(tickLength);
  }
}

function tick() {
  gameCode();
  updateDisplay();
}

window.onload = function () {
  loadGameStorage();
  setInterval(tick, 50);
  setInterval(saveGame, 10000);
}

let elementNames = ['Earth', 'Water', 'Air', 'Fire'];

let upgradeNames = ['speedEarth', 'convertImprovement', 'unlocks'];

function gameCode(diff) {
  let now = Date.now();
  if (diff === undefined) {
    diff = (now - player.lastUpdate) / 1000;
  }
  if (isNaN(diff)) {
    diff = 0;
  }
  player.lastUpdate = now;
  player.elementAmounts[0] += diff * getEarthPerSecond();
  player.timeInAscension += diff;
  for (let i = 1; i <= 3; i++) {
    passiveConvert(i, diff * getAetherBasedPassiveConversion());
  }
  for (let i = 0; i <= 3; i++) {
    if (hasAuto(i) && player.auto[i]) {
      autoUpgrade(i);
    }
  }
}

function getSpeedEarthBase() {
  return 1.3 - 0.1 * Math.pow(0.9, player.aetherUpgrades.list[2]);
}

function getSpeedEarthEffect() {
  return Math.pow(getSpeedEarthBase(), player.upgrades.speedEarth.total);
}

function getTimeInAscensionEffect() {
  return Math.pow(1 + player.aetherUpgrades.list[1] * player.timeInAscension / 300, Math.sqrt(player.aetherUpgrades.list[1]) / 2);
}

function getEarthPerSecond() {
  return getSpeedEarthEffect() * (1 + player.aetherUpgrades.list[0]) * getTimeInAscensionEffect();
}

function convert(i) {
  if (1 <= i && i <= 3 && player.upgrades.unlocks.list[i - 1]) {
    player.elementAmounts[i] += player.elementAmounts[i - 1] * Math.pow(1.1, player.upgrades.convertImprovement.total) / 4;
    player.elementAmounts[i - 1] = 0;
  } else {
    throw new Error('Cannot convert to index ' + i + '!');
  }
}

function passiveConvert(i, r) {
  if (1 <= i && i <= 3 && player.upgrades.unlocks.list[i - 1]) {
    player.elementAmounts[i] += r * player.elementAmounts[i - 1] * Math.pow(1.1, player.upgrades.convertImprovement.total) / 4;
  }
}

function getAetherBasedPassiveConversion() {
  return Math.pow(Math.max(0, Math.log10(player.aether)), 2) / 100;
}

function hasAuto(i) {
  return player.fastestTimeInAscension < Math.pow(10, 3 - i);
}

function autoUpgrade(j) {
  for (let i = 0; i < upgradeNames.length; i++) {
    while (buyUpgrade(upgradeNames[i], j)) {}
  }
}

function getAetherGain() {
  return Math.floor(Math.pow(player.elementAmounts[3], 0.1));
}

function getStashGain() {
  if (player.aetherUpgrades.list[3] === 0) {
    return 0;
  } else {
    return Math.pow(player.elementAmounts[0], 1 - Math.pow(0.9, player.aetherUpgrades.list[3]));
  }
}

function ascend() {
  if (!player.upgrades.unlocks.list[3] || player.elementAmounts[3] < 1) {
    return false;
  }
  let gain = getAetherGain();
  player.stash += getStashGain();
  player.elementAmounts = [player.stash, 0, 0, 0];
  player.aether += gain;
  player.totalAether += gain;
  player.ascensions++;
  player.upgrades = {
    speedEarth: {
      list: [0, 0, 0, 0],
      total: 0,
      baseCost: 10,
      baseCostMult: 2
    },
    convertImprovement: {
      list: [0, 0, 0, 0],
      total: 0,
      baseCost: 30,
      baseCostMult: 3
    },
    unlocks: {
      list: [
        player.ascensions >= 2, player.ascensions >= 4,
        player.ascensions >= 8, player.ascensions >= 16
      ],
      baseCost: 100,
      baseCostMult: 1
    }
  };
  player.fastestTimeInAscension = Math.min(player.fastestTimeInAscension, player.timeInAscension);
  player.timeInAscension = 0;
  if (player.respec) {
    player.aetherUpgrades = {
      list: [0, 0, 0, 0],
      total: 0
    };
    player.aether = player.totalAether;
    player.respec = false;
    fillInRespec();
  }
}

function formatValue(x, n) {
  x = new Decimal(x);
  if (n === undefined) {
    n = 2;
  }
  if (x.gte(1e6)) {
    let e = x.exponent;
    let m = x.mantissa;
    return m.toFixed(n) + 'e' + e;
  } else if (x.equals(Math.round(x.toNumber()))) {
    return '' + Math.round(x.toNumber());
  } else {
    return x.toFixed(n);
  }
}

function updateElementDisplay() {
  for (let row = 1; row <= 4; row++) {
    if (player.upgrades.unlocks.list[row - 1] || (row === 4 && player.totalAether !== 0)) {
      document.getElementById('row-' + row).style.display = '';
    } else {
      document.getElementById('row-' + row).style.display = 'none';
    }
  }
}

function updateElementAmountDisplay() {
  for (let row = 0; row <= 3; row++) {
    document.getElementById('element-' + row).innerHTML = formatValue(player.elementAmounts[row]);
  }
}

function getUpgradeCost(i, j) {
  let bought = player.upgrades[i].list[j];
  if (bought === true || bought === null) {
    return null;
  }
  return player.upgrades[i].baseCost *
  Math.pow(player.upgrades[i].baseCostMult, (1 + j) * bought);
}

function buyUpgrade(i, j) {
  let cost = getUpgradeCost(i, j);
  if (cost === null || cost > player.elementAmounts[j]) {
    return false;
  }
  player.elementAmounts[j] -= cost;
  if (player.upgrades[i].list[j] === false) {
    player.upgrades[i].list[j] = true;
  } else {
    player.upgrades[i].list[j]++;
    player.upgrades[i].total++;
  }
}

function buyAetherUpgrade(i) {
  let cost = Math.pow(2, player.aetherUpgrades.total);
  if (cost > player.aether) {
    return false;
  }
  player.aether -= cost;
  player.aetherUpgrades.list[i]++;
  player.aetherUpgrades.total++;
}

function updateUpgradeDisplay() {
  for (let i in player.upgrades) {
    for (let j = 0; j <= 3; j++) {
      if (player.upgrades[i].list[j] === true) {
        document.getElementById('upgrade-' + i + '-' + j).innerHTML = 'Bought';
      } else if (player.upgrades[i].list[j] !== null) {
        document.getElementById('upgrade-' + i + '-' + j).innerHTML = 'Cost: ' + formatValue(getUpgradeCost(i, j)) + ' ' + elementNames[j].toLowerCase();
      }
    }
  }
}

function updateAscendButonText() {
  if (!player.upgrades.unlocks.list[3]) {
    document.getElementById('ascend').innerHTML = 'Unlock aether again to ascend.';
  } else if (player.elementAmounts[3] < 1) {
    document.getElementById('ascend').innerHTML = 'Get at least 1 fire to ascend.'
  } else {
    document.getElementById('ascend').innerHTML = 'Ascend: gain aether based on your fire (' + formatValue(getAetherGain()) + ')';
  }
}

function updateRespecSpanDisplay() {
  if (player.totalAether === 0) {
    document.getElementById('respec-span').style.display = 'none';
  } else {
    document.getElementById('respec-span').style.display = '';
  }
}

function updateAetherUpgradeSpanDisplay() {
  if (player.totalAether === 0) {
    document.getElementById('aether-upgrade-span').style.display = 'none';
  } else {
    document.getElementById('aether-upgrade-span').style.display = '';
  }
}

function updateAetherAmountDisplay() {
  document.getElementById('aether').innerHTML = formatValue(player.aether);
}

function updateAetherUpgradeDisplay() {
  for (let i = 0; i <= 3; i++) {
    document.getElementById('aether-upgrade-' + i).innerHTML = player.aetherUpgrades.list[i] + ', Cost: ' + Math.pow(2, player.aetherUpgrades.total);
  }
}

function updateAutoDisplay() {
  for (let i = 0; i <= 3; i++) {
    if (hasAuto(i)) {
      document.getElementById('auto-span-' + i).style.display = '';
    } else {
      document.getElementById('auto-span-' + i).style.display = 'none';
    }
  }
}

function updateDisplay() {
  updateElementDisplay();
  updateElementAmountDisplay();
  updateUpgradeDisplay();
  updateAscendButonText();
  updateRespecSpanDisplay();
  updateAetherUpgradeSpanDisplay();
  updateAetherAmountDisplay();
  updateAetherUpgradeDisplay();
  updateAutoDisplay();
  document.getElementById('earth-production').innerHTML = formatValue(getEarthPerSecond());
}

function fillInOptions() {
  document.getElementById('offline-progress').checked = player.options.offlineProgress;
}

function fillInRespec() {
  document.getElementById('respec').checked = player.respec;
}

function fillInAuto() {
  for (let i = 0; i <= 3; i++) {
    document.getElementById('auto-' + i).checked = player.auto[i];
  }
}

function toggleOption(x) {
  player.options[x] = !player.options[x];
}

function toggleRespec() {
  player.respec = !player.respec;
}

function toggleAuto(i) {
  player.auto[i] = !player.auto[i];
}
