function updateAchievementDisplay() {
  document.getElementById('total-normal-achievements').innerHTML = player.achievements.normal.number;
  document.getElementById('total-normal-achievements-plural').innerHTML = (player.achievements.normal.number === 1) ? '' : 's';
  document.getElementById('normal-achievements-effect').innerHTML = format(getNormalAchievementsEffect());
  document.getElementById('normal-achievements-patience-effect').innerHTML = format(getNormalAchievementsPatienceEffect());
  for (let i = 0; i <= 26; i++) {
    if (player.achievements.normal.list[i]) {
      document.getElementById('normal-ach-status-' + i).innerHTML = '&#x2714;';
    } else {
      document.getElementById('normal-ach-status-' + i).innerHTML = '&#x2718;';
    }
  }
  document.getElementById('total-lategame-achievements').innerHTML = player.achievements.lategame.number;
  document.getElementById('total-lategame-achievements-plural').innerHTML = (player.achievements.lategame.number === 1) ? '' : 's';
  document.getElementById('lategame-achievements-patience-effect').innerHTML = format(getLategameAchievementsPatienceEffect());
  document.getElementById('lategame-achievements-completions-effect').innerHTML = format(getLategameAchievementsCompletionsEffect());
  for (let i = 0; i <= 8; i++) {
    if (player.achievements.lategame.list[i]) {
      document.getElementById('lategame-ach-status-' + i).innerHTML = '&#x2714;';
    } else {
      document.getElementById('lategame-ach-status-' + i).innerHTML = '&#x2718;';
    }
  }
}
