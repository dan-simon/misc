function loadGame (s) {
  player = JSON.parse(atob(s));
  saveGame();
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
  lastUpdate: Date.now()
}

function resetGame() {
  loadGame(btoa(JSON.stringify(initialPlayer)));
}

// addProgress
// addToProgress

function centralFormula(x, c) {
  return 600 * (Math.exp(6 * (Math.exp(x / 3600) - 1) / c) - 1);
}

function invertCentralFormula(x, c) {
  return 3600 * Math.log(c * Math.log(x / 600 + 1) / 6 + 1);
}

function addProgress(orig, change, c) {
  let real = centralFormula(orig, c);
  return invertCentralFormula(real + change, c);
}

function getScaling() {
  return 1 + getEffect(2) + getEffect(6);
}

function getPrestigeDevProgress() {
  return centralFormula(player.progress[0], 1);
}

function addToProgress(diff) {
  let perDev = diff * getEffect(1) * getEffect(5) * getMilestoneEffect();
  let scaling = getScaling();
  for (let i = 0; i <= 4; i++) {
    player.progress[i] = addProgress(player.progress[i], player.devs[i] * perDev, scaling);
  }
}

function addToPatience(diff) {
  player.progress[7] = Math.min(1, player.progress[7] + diff / getEffect(4))
}

function checkForMilestones() {
  player.milestones = Math.max(player.milestones, Math.floor(player.progress[0] / 1800));
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

function getEffect(i) {
  let x = player.progress[i];
  if (i === 1 || i === 5) {
    return Math.pow(2, x / 1800 * getEffect(7));
  } else if (i === 2 || i === 6) {
    return x / 1800 * getEffect(7);
  } else if (i === 3) {
    return 1 + Math.floor(x / 300);
  } else if (i === 4) {
    return 86400 / Math.pow(2, x / 1800);
  } else if (i === 7) {
    return 1 + x / 2;
  }
}

function canPrestige() {
  return player.progress[0] >= 1800;
}

function progessWithPrestige(x) {
  return addProgress(player.progress[x], getPrestigeDevProgress(), 1);
}

function prestige(i) {
  if (canPrestige()) {
    player.progress[i] = progessWithPrestige(i);
    for (let j = 0; j <= 4; j++) {
      player.progress[j] = 0;
      player.devs[j] = 0;
    }
    player.progress[7] = 0;
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
  if (canPrestige()) {
    for (let i = 5; i <= 6; i++) {
      document.getElementById("prestige-" + i).innerHTML = toTime(player.progress[i]) + ' -> ' + toTime(progessWithPrestige(i));
    }
  } else {
    for (let i = 5; i <= 6; i++) {
      document.getElementById("prestige-" + i).innerHTML = 'need more development';
    }
  }
  document.getElementById('total-devs').innerHTML = getTotalDevs();
  document.getElementById('progress-milestones').innerHTML = player.milestones;
  document.getElementById('progress-milestones-effect').innerHTML = getMilestoneEffect();
}

window.onload = function () {
  loadGameStorage();
  setInterval(tick, 50);
  setInterval(saveGame, 10000);
}
