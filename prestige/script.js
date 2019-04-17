let originalPlayer = {
  money: new Decimal(10),
  generators: getGenerators(),
  multUpg: {
    amount: 0,
    cost: new Decimal(1000)
  },
  prestige: new Decimal(0),
  tickspeed: {
    amount: new Decimal(1),
    cost: new Decimal(Infinity)
  },
  prestigeUpgrades: {
    has: [null, false, false, false],
    cost: [null, new Decimal(5), new Decimal(1000), new Decimal(5e5)]
  },
  infinityPoints: new Decimal(0),
  infinityPower: new Decimal(0),
  infinityGenerators: getInfinityGenerators(),
  infinityUpgrades: {
    amount: [0, 0],
    cost: [new Decimal(10), new Decimal(10)]
  },
  incrementali: {
    unlocked: false,
    amount: 1,
    galaxies: 0,
    upgrades: {
      amount: [0, 0],
      cost: [new Decimal(1e40), new Decimal(1e80)]
    }
  },
  auto: {
    maxall: false,
    prestige: {
      amount: '',
      time: '',
      xtimes: '',
      freqIncrease: '',
      setting: 'any'
    },
    infinity: {
      amount: '',
      time: '',
      xtimes: '',
      setting: 'any'
    }
  },
  lastUpdate: Date.now(),
  prestigeTime: 0,
  infinityTime: 0,
  totalTime: 0,
  currentTab: 'generators'
}

let player = deepcopy(originalPlayer);

function getGenerators () {
  let generators = [null];
  for (let i = 1; i <= 10; i++) {
    let generator = {
      cost: Decimal.pow(10, Math.pow(i - 1, 2) + 1),
      bought: 0,
      amount: new Decimal(0),
      mult: new Decimal(1)
    }
    generators.push(generator);
  }
  return generators;
}

function getInfinityGenerators () {
  let infGenerators = [null];
  for (let i = 1; i <= 10; i++) {
    let infGenerator = {
      cost: Math.pow(10, Math.pow(i - 1, 2)),
      bought: 0,
      amount: 0,
      mult: 1
    }
    infGenerators.push(infGenerator);
  }
  return infGenerators;
}

function format(amount) {
  if (!(amount instanceof Decimal)) {
    amount = new Decimal(amount);
  }
  if (amount.eq(Infinity)) {
    return 'Infinity';
  }
  let power = Math.floor(Decimal.log10(amount));
  let mantissa = Decimal.div(amount, Decimal.pow(10, power));
  if (Decimal.eq(0, amount) || (power >= 0 && power < 3)) {
    return amount.toFixed(2)
  } else {
    return mantissa.toFixed(2) + 'e' + power;
  }
}

function formatInt(amount) {
  if (amount.eq(Infinity)) {
    return 'Infinity';
  }
  let power = Math.floor(Decimal.log10(amount));
  let mantissa = Decimal.div(amount, Decimal.pow(10, power));
  if (Decimal.eq(0, amount) || (power >= 0 && power < 3)) {
    return amount;
  } else {
    return mantissa.toFixed(2) + 'e' + power;
  }
}

function canBuyGenerator(i) {
  return player.generators[i].cost.lte(player.money);
}

function buyGenerator(i) {
  if (!canBuyGenerator(i)) {
    return;
  }
  let g = player.generators[i];
  player.money = player.money.minus(g.cost);
  g.amount = g.amount.plus(1);
  g.bought += 1;
  g.mult = g.mult.times(1.03);
  g.cost = g.cost.times(1.5);
}

function canBuyMultUpg() {
  return player.multUpg.cost.lte(player.money);
}

function buyMultUpg() {
  if (!canBuyMultUpg()) {
    return;
  }
  player.money = player.money.minus(player.multUpg.cost);
  player.multUpg.amount += 1;
  player.multUpg.cost = player.multUpg.cost.times(10);
}

function getMultUpgEffect() {
  let r = new Decimal(player.multUpg.amount + 1);
  if (player.prestigeUpgrades.has[2]) {
    r = r.pow(getPrestigeUpgradeEffect(2))
  }
  return r;
}

function maxall() {
  while (canBuyMultUpg()) {
    buyMultUpg();
  }
  while (canBuyTickspeed()) {
    buyTickspeed();
  }
  for (let i = 1; i <= 10; i++) {
    while (canBuyGenerator(i)) {
      buyGenerator(i);
    }
  }
}

function tickspeedUnlocked () {
  return player.prestige.gt(0);
}

function canBuyTickspeed () {
  return tickspeedUnlocked() && player.tickspeed.cost.lte(player.money);
}

function buyTickspeed() {
  if (!canBuyTickspeed()) {
    return;
  }
  player.money = player.money.minus(player.tickspeed.cost);
  player.tickspeed.amount = player.tickspeed.amount.times(.9);
  player.tickspeed.cost = player.tickspeed.cost.times(getTickspeedCostIncrease());
}

function getTickspeedCostIncrease(x) {
  if (x === undefined) {
    x = player.prestige;
  }
  if (x.eq(0)) {
    return new Decimal(Infinity);
  }
  return new Decimal(100).plus(x.pow(-0.3).times(9850)).plus(x.pow(-1 / 1000).times(50));
}

function canPrestige() {
  return player.money.gte(Decimal.pow(2, 128))
}

function getPrestigeGain() {
  let r = Decimal.pow(10, player.money.log(2) / 128 - 1);
  if (player.prestigeUpgrades.has[3]) {
    r = r.times(getPrestigeUpgradeEffect(3));
  }
  return Decimal.floor(r);
}

function getPrestigeUpgradeEffect (x) {
  if (x === 1) {
    return Math.pow(player.prestige.plus(1).log10() + 1, Math.log10(player.prestigeTime / 60 + 1));
  } else if (x === 2) {
    return 1 + Math.log10(1 - player.tickspeed.amount.log(10)) / 5;
  } else if (x === 3) {
    return 1 - player.tickspeed.amount.log(10);
  }
}

function canBuyPrestigeUpgrade (x) {
  return player.prestige.gte(player.prestigeUpgrades.cost[x]);
}

function buyPrestigeUpgrade (x) {
  if (!canBuyPrestigeUpgrade(x) || player.prestigeUpgrades.has[x]) {
    return;
  }
  player.prestige = player.prestige.minus(player.prestigeUpgrades.cost[x]);
  player.prestigeUpgrades.has[x] = true;
}

function prestige() {
  if (!canPrestige()) {
    return;
  }
  player.prestige = player.prestige.plus(getPrestigeGain());
  player.money = new Decimal(10);
  player.generators = getGenerators();
  player.multUpg = {
    amount: 0,
    cost: new Decimal(1000)
  };
  player.tickspeed = {
    amount: new Decimal(1),
    cost: getTickspeedCostIncrease()
  };
  player.prestigeTime = 0;
}

function setTab(x) {
  player.currentTab = x;
}

function updateGUI() {
  document.getElementById('currencyAmount').textContent = format(player.money);
  for (let i = 1; i <= 10; i++) {
    let g = player.generators[i];
    document.getElementById('gen' + i + 'Amount').textContent = format(g.amount);
    document.getElementById('gen' + i + 'Bought').textContent = g.bought;
    document.getElementById('gen' + i + 'Mult').textContent = format(getGeneratorMult(i));
    document.getElementById('gen' + i + 'Cost').textContent = format(g.cost);
    if (!canBuyGenerator(i)) {
      document.getElementById('gen' + i).classList.add('locked');
    } else {
      document.getElementById('gen' + i).classList.remove('locked');
    }
  }
  document.getElementById('multUpgAmount').textContent = format(getMultUpgEffect());
  document.getElementById('multUpgCost').textContent = format(player.multUpg.cost);
  if (!canBuyMultUpg()) {
    document.getElementById('multUpg').classList.add('locked');
  } else {
    document.getElementById('multUpg').classList.remove('locked');
  }
  document.getElementById('tickspeedAmount').textContent = format(player.tickspeed.amount);
  document.getElementById('tickspeedCost').textContent = format(player.tickspeed.cost);
  document.getElementById('tickspeedCostIncrease').textContent = format(getTickspeedCostIncrease());
  if (!tickspeedUnlocked()) {
    document.getElementById('tickspeed').style.display = 'none';
  } else if (!canBuyTickspeed()) {
    document.getElementById('tickspeed').style.display = '';
    document.getElementById('tickspeed').classList.add('locked');
  } else {
    document.getElementById('tickspeed').style.display = '';
    document.getElementById('tickspeed').classList.remove('locked');
  }
  updateStats();
  for (let i of document.getElementsByClassName('tab')) {
    if (i.id === player.currentTab + '-tab') {
      i.style.display = '';
    } else {
      i.style.display = 'none';
    }
  }
  if (player.prestige.gt(0)) {
    document.getElementById('prestige-upgrades-tab-button').style.display = '';
  } else {
    document.getElementById('prestige-upgrades-tab-button').style.display = 'none';
  }
  updatePrestigeButton();
  updatePrestigeUpgrades();
}

function updatePrestigeButton () {
  let part1;
  if (canPrestige()) {
    part1 = "Get " + formatInt(getPrestigeGain()) + " prestige points.";
  } else {
    part1 = "Get " + format(Decimal.pow(2, 128)) + " money to prestige.";
  }
  let part2;
  if (canPrestige()) {
    part2 = "Prestige points: " + formatInt(player.prestige) + ' -> ' + formatInt(player.prestige.plus(getPrestigeGain()));
  } else {
    part2 = "Current prestige points: " + formatInt(player.prestige);
  }
  let part3;
  if (canPrestige()) {
    part3 = "Tickspeed cost increase: " + format(getTickspeedCostIncrease()) + ' -> ' + format(getTickspeedCostIncrease(player.prestige.plus(getPrestigeGain())));
  } else {
    part3 = "Tickspeed cost increase: " + format(getTickspeedCostIncrease());
  }
  document.getElementById('prestige').innerHTML = [part1, part2, part3].join('</br>')
}

function updatePrestigeUpgrades () {
  for (let i = 1; i <= 3; i++) {
    document.getElementById('prestigeUpg' + i + 'Effect').textContent = format(getPrestigeUpgradeEffect(i));
    document.getElementById('prestigeUpg' + i + 'Cost').textContent = format(player.prestigeUpgrades.cost[i]);
    if (player.prestigeUpgrades.has[i]) {
      document.getElementById('prestigeUpg' + i).classList.add('bought');
    } else {
      document.getElementById('prestigeUpg' + i).classList.remove('bought');
      if (!canBuyPrestigeUpgrade(i)) {
        document.getElementById('prestigeUpg' + i).classList.add('locked');
      } else {
        document.getElementById('prestigeUpg' + i).classList.remove('locked');
      }
    }
  }
}

function updateStats () {
  document.getElementById('prestigeStat').textContent = formatInt(player.prestige);
  document.getElementById('infinityPointsStat').textContent = formatInt(player.infinityPoints);
  document.getElementById('prestigeTimeStat').textContent = player.prestigeTime.toFixed(2);
  document.getElementById('infinityTimeStat').textContent = player.infinityTime.toFixed(2);
  document.getElementById('totalTimeStat').textContent = player.totalTime.toFixed(2);
}

function getGeneratorMult(i) {
  let r = player.generators[i].mult.times(getMultUpgEffect()).times(player.infinityPower.max(1));
  if (player.prestigeUpgrades.has[1]) {
    r = r.times(getPrestigeUpgradeEffect(1));
  }
  return r;
}

function getGeneratorProduction(i) {
  return player.generators[i].amount.times(getGeneratorMult(i)).div(player.tickspeed.amount);
}

function productionLoop(diff) {
  player.money = player.money.plus(getGeneratorProduction(1).times(diff));
  for (let i = 2; i <= 10; i++) {
    player.generators[i - 1].amount = player.generators[i - 1].amount.plus(getGeneratorProduction(i).times(diff));
  }
  player.prestigeTime += diff;
  player.infinityTime += diff;
  player.totalTime += diff;
}

function mainLoop() {
  let diff = (Date.now() - player.lastUpdate) / 1000;
  productionLoop(diff);
  updateGUI();
  player.lastUpdate = Date.now();
}

function saveGame() {
  localStorage.setItem('save-prestige-get', btoa(JSON.stringify(player)));
}

function loadGame(save) {
  if (save === undefined) {
    save = localStorage.getItem('save-prestige-get');
    if (!save) {
      save = localStorage.getItem('save');
    }
  }
  if (save) {
    proposedPlayer = JSON.parse(atob(save));
    if (proposedPlayer.prestigeTime !== undefined) {
      player = proposedPlayer;
      addProperties(originalPlayer, player);
      convertDecimals(originalPlayer, player);
    }
  }
}

function exportGame() {
  let output = document.getElementById('exportOutput');
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

function resetGame () {
  if (confirm('Are you sure you want to do this? All of your progress will be lost!')) {
    player = deepcopy(originalPlayer);
    player.lastUpdate = Date.now();
    saveGame();
  }
}

function deepcopy (x) {
  if (x === null || (typeof x !== 'object' && typeof x !== 'array')) {
    return x;
  } else if (x instanceof Decimal) {
    let r = new Decimal(0);
    for (let i in x) {
      r[i] = x[i];
    }
    return r;
  } else if (typeof x === 'array') {
    let r = [];
    for (let i of x) {
      r.push(deepcopy(i));
    }
    return r;
  } else {
    let r = {};
    for (let i in x) {
      r[i] = deepcopy(x[i]);
    }
    return r;
  }
}

function addProperties(x, y) {
  if (y === null || (typeof y !== 'object' && typeof y !== 'array')) {
    return;
  } else if (typeof y === 'array') {
    if (x.length > y.length) {
      for (let i = y.length; i < x.length; i++) {
        y.push(deepcopy(x[i]))
      }
    }
  } else {
    for (let i in x) {
      if (!(i in y)) {
        y[i] = deepcopy(x[i]);
      }
    }
  }
}

function convertDecimals(x, y) {
  if (y === null || (typeof y !== 'object' && typeof y !== 'array')) {
    return;
  } else if (typeof y === 'array') {
    for (let i = 0; i < y.length; i++) {
      if (x[i] instanceof Decimal) {
        y[i] = new Decimal(y[i]);
      } else {
        convertDecimals(x[i], y[i])
      }
    }
  } else {
    for (let i in y) {
      if (x[i] instanceof Decimal) {
        y[i] = new Decimal(y[i]);
      } else {
        convertDecimals(x[i], y[i])
      }
    }
  }
}

setInterval(mainLoop, 50);

setInterval(saveGame, 10000)

loadGame();

updateGUI();

window.addEventListener('keydown', function(event) {
  if (event.keyCode === 77) {
    maxall();
  }
});
