function hasAuto(x) {
  // dev-one-percent isn't really auto, except insofar as it means
  // you don't have to manually do some stuff (lonely, upgradeless).
  let table = {
    'enlightened': 0,
    'prestige': 1,
    'update': 2,
    'assign-update-points': 3,
    'dev-one-percent': 4
  }
  return player.completionMilestones > table[x];
}

function autoAssignDevs() {
  for (let i = 0; i <= 4; i++) {
    player.devs[i] = 0;
  }
  // Set total to at least 1, so that if you want to leave half your devs unused you can
  let total = Math.max(player.auto.dev.settings.reduce((a, b) => a + b), 1);
  let realSettings = player.auto.dev.settings.map(i => i / total);
  for (let i = 0; i <= 4; i++) {
    let askedFor = Math.floor(getTotalDevs() * realSettings[i]);
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
  let valueIfSo = getPatienceMeterNewValue(getPatienceMeterAfterEnlightened(), gameSecondsRemaining, player.progress[4], player.enlightened + 1);
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
  while (player.progress[7] >= 1 && table[player.auto.enlightened.setting](player.auto.enlightened.value.toNumber())) {
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
    'X times last update points': x => getUpdateGain().gte(player.stats.last.updatePointGain.times(x)),
    'real seconds since last update': x => Date.now() - player.stats.last.update >= x.toNumber() * 1000
  }
  if (table[player.auto.update.setting](player.auto.update.value)) {
    update(true);
  }
}

function doAutoThings() {
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
}
