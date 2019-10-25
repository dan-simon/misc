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
    x => challengeCompletions(x)).reduce((a, b) => a + b) *
    getLategameAchievementsCompletionsEffect();
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
      'upgradeless': x => format(x) + ' per 01:00:00 for second endgame upgrade'
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
