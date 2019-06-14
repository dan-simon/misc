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
  // Version changes, etc.
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
      list: [false, false, false, null],
      baseCost: 100,
      baseCostMult: 1
    }
  },
  aether: 0,
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

let elementNames = ['Earth', 'Water', 'Air', 'Fire']

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
}

function getEarthPerSecond() {
  return Math.pow(1.2, player.upgrades.speedEarth.total);
}

function convert(i) {
  if (1 <= i && i <= 3) {
    player.elementAmounts[i] += player.elementAmounts[i - 1] * Math.pow(1.1, player.upgrades.convertImprovement.total) / 4;
    player.elementAmounts[i - 1] = 0;
  } else {
    throw new Error('Cannot convert to index ' + i + '!');
  }
}

function formatValue(x) {
  return x.toFixed(2);
}

function updateElementDisplay() {
  for (let row = 1; row <= 3; row++) {
    if (player.upgrades.unlocks.list[row - 1]) {
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

function updateDisplay() {
  updateElementDisplay();
  updateElementAmountDisplay();
  updateUpgradeDisplay();
  document.getElementById('earth-production').innerHTML = formatValue(getEarthPerSecond());
}

function fillInOptions() {
  document.getElementById('offline-progress').checked = player.options.offlineProgress;
}

function toggleOption(x) {
  player.options[x] = !player.options[x];
}
