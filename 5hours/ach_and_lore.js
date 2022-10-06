function getNormalAchievementsEffect() {
  return Math.pow(1.1, player.achievements.normal.number);
}

function getNormalAchievementsPatienceEffect() {
  return Math.pow(1.01, player.achievements.normal.number);
}

function getNormalAchievementsPatienceKeptEffect() {
  return 0.01 * player.achievements.normal.number;
}

function getLategameAchievementsPatienceEffect() {
  return Math.pow(1.1, player.achievements.lategame.number);
}

function getLategameAchievementsCompletionsEffect() {
  return Math.pow(1.01, player.achievements.lategame.number);
}

function getLategameAchievementsPatienceKeptEffect() {
  return 0.01 * player.achievements.lategame.number;
}

function giveNormalAchievement(i) {
  if (!player.achievements.normal.list[i]) {
    player.achievements.normal.list[i] = true;
    player.achievements.normal.number++;
    updateAchievementDisplay();
  }
}

function giveLategameAchievement(i) {
  if (!player.achievements.lategame.list[i]) {
    player.achievements.lategame.list[i] = true;
    player.achievements.lategame.number++;
    updateAchievementDisplay();
  }
}

function giveLore(i) {
  if (player.lore.indexOf(i) === -1) {
    player.lore.push(i);
    updateLoreDisplay();
  }
}

function givePrestigeAchievementsAndLore(i, oldProgress) {
  giveNormalAchievement(2);
  giveLore(7);
  if (player.progress[i] - oldProgress >= 3600) {
    giveNormalAchievement(6);
  }
  if (player.progress[i] - oldProgress >= 15778800) {
    giveLategameAchievement(2);
  }
}

function giveUpdateAchievementsAndLore(now, gain, oldChallenge) {
  giveNormalAchievement(8);
  giveLore(11);
  if (now - player.stats.last.update <= 3600000) {
    giveNormalAchievement(10);
  }
  if (gain.gte(2)) {
    giveNormalAchievement(11);
    giveLore(12);
  }
  if (now - player.stats.last.update <= 60000) {
    giveNormalAchievement(13);
  }
  if (player.achievements.stats.savingTokens) {
    giveNormalAchievement(14);
  }
  if (now - player.stats.last.update <= 1000) {
    giveNormalAchievement(16);
  }
  if (oldChallenge === 'logarithmic') {
    giveNormalAchievement(18);
    giveLore(23);
  }
  if (player.achievements.stats.noDevsForThat) {
    giveNormalAchievement(21);
  }
  if (gain.gte(Number.MAX_VALUE)) {
    giveNormalAchievement(26);
    giveLore(28);
  }
  // Include "previous updates"
  if (gain.gte(player.stats.last.updatePointGain.times(Number.MAX_VALUE)) && gain.gt(0)) {
    player.achievements.stats.yoDawg++;
    if (player.achievements.stats.yoDawg >= 10) {
      giveLategameAchievement(1);
    }
  } else {
    player.achievements.stats.yoDawg = 0;
  }
}

function checkForAchievementsAndLore() {
  let progress = player.progress.slice(0, 5);
  let devs = player.devs.slice(0, 5);
  let loreFarthest = Math.max(
    Math.max.apply(null, progress), player.stats.recordDevelopment['']);
  giveLore(0);
  if (devs.some(i => i !== 0)) {
    giveNormalAchievement(0);
    giveLore(1);
  }
  if (loreFarthest >= 120) {
    giveLore(2);
  }
  if (loreFarthest >= 180) {
    giveLore(3);
  }
  if (getTotalDevs() > baseDevs()) {
    giveLore(4);
  }
  if (devs.every(i => i !== 0)) {
    giveNormalAchievement(1);
  }
  if (getEffect(1).gte(1.2)) {
    giveLore(5);
  }
  if (getEffect(2) >= 0.5) {
    giveLore(6);
  }
  if (devs.every(i => i === 0) && progress.every(x => x >= 3600)) {
    giveNormalAchievement(3);
  }
  if (Math.max.apply(null, progress) - Math.min.apply(null, progress) <= 60 && progress.every(x => x >= 3600)) {
    giveNormalAchievement(4);
  }
  // No longer need the > 1 total devs clause now that it starts at 5
  if (getEffect(1).gt(getTotalDevs())) {
    giveNormalAchievement(5);
  }
  if (loreFarthest >= 12600) {
    giveLore(8);
  }
  if (loreFarthest >= 16200) {
    giveLore(9);
  }
  if (getTotalEnlightened() > 0) {
    giveNormalAchievement(7);
    giveLore(10);
  }
  if (player.experience.every(i => i.neq(0))) {
    giveNormalAchievement(9);
  }
  if (player.stats.recordDevelopment[''] >= 43200) {
    giveLore(13);
  }
  if (player.upgrades.every(i => i.every(j => j))) {
    giveNormalAchievement(12);
  }
  if (player.stats.recordDevelopment[''] >= 86400) {
    giveNormalAchievement(15);
  }
  let challenges = sortedChallenges();
  for (let i = 0; i <= 8; i++) {
    if (isChallengeUnlocked(challenges[i])) {
      giveLore(14 + i);
    }
  }
  if (getTotalDevs() >= 50000) {
    giveNormalAchievement(17);
  }
  if (getTotalChallengeCompletions() >= 12) {
    giveNormalAchievement(19);
  }
  if (getTotalChallengeCompletions() >= 20) {
    giveNormalAchievement(20);
  }
  if (player.dilation > 0) {
    giveNormalAchievement(22);
    giveLore(24);
  }
  if (player.dilation >= 100 / 3) {
    giveNormalAchievement(23);
    giveLore(25);
  }
  if (getTotalEnlightened() >= 40) {
    giveNormalAchievement(24);
    giveLore(26);
  }
  if (getTotalDevs() >= 1e9) {
    giveNormalAchievement(25);
    giveLore(27);
  }
  if (player.achievements.normal.list.every(x => x)) {
    giveLategameAchievement(0);
    giveLore(29);
  }
  if (player.lore.length >= LORE_LIST.length - 3) {
    for (let i = 3; i > 0; i--) {
      giveLore(LORE_LIST.length - i);
    }
  }
  if (getEffect(7) >= 10) {
    giveLategameAchievement(3);
  }
  if (getTotalChallengeCompletions() >= 42) {
    giveLategameAchievement(4);
  }
  if (player.dilation >= 1e12) {
    giveLategameAchievement(5);
  }
  if (getTotalEnlightened() >= 80) {
    giveLategameAchievement(6);
  }
  if (getTotalDevs() >= 1e13) {
    giveLategameAchievement(7);
  }
  if (player.stats.recordDevelopment[''] >= 63115200) {
    giveLategameAchievement(8);
  }
}
