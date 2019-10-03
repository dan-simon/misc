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

function fillInDilationUpgrades() {
  document.getElementById('dilation-upgrade-0-button').innerHTML = 'Multiply patience meter speed by 1.1. Currently: ' + format(getDilationUpgradeEffect(0)) + 'x, Cost: ' + format(getDilationUpgradeCost(0)) + ' dilation';
}

function fillInOptions() {
  document.getElementById('offline-progress').checked = player.options.offlineProgress;
  document.getElementById('update-challenge').checked = player.options.updateChallenge;
}

function fillInConfirmations() {
  document.getElementById('prestige-confirmation').checked = player.options.confirmations.prestige;
  document.getElementById('prestige-without-gain-confirmation').checked = player.options.confirmations.prestigeWithoutGain;
  document.getElementById('update-confirmation').checked = player.options.confirmations.update;
  document.getElementById('turn-all-update-points-into-experience-confirmation').checked = player.options.confirmations.turnAllUpdatePointsIntoExperience;
  document.getElementById('enter-challenge-confirmation').checked = player.options.confirmations.enterChallenge;
  document.getElementById('exit-challenge-confirmation').checked = player.options.confirmations.exitChallenge;
}
