let EXPERIENCE_TYPES = ['endgame', 'patience', 'headstart'];

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

function canUpdate() {
  return player.progress[0] >= getChallengeGoal(player.currentChallenge);
}

function getUpdateGainBase() {
  if (updateUpgradeActive(1, 0)) {
    return challengeReward('upgradeless');
  } else {
    return 2;
  }
}

function getUpdateGain() {
  let base = getUpdateGainBase();
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
  if (!player.options.confirmations.turnAllUpdatePointsIntoExperience ||
  confirm('Are you sure you want to turn all your update points into ' + EXPERIENCE_TYPES[i] + ' experience?')) {
    player.experience[i] = player.experience[i].plus(player.updatePoints);
    player.updatePoints = new Decimal(0);
  }
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
