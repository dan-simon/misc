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

function updateAutoDisplay() {
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
}
