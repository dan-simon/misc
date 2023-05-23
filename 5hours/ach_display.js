function updateAchievementDisplay() {
  document.getElementById('total-normal-achievements').innerHTML = player.achievements.normal.number;
  document.getElementById('total-normal-achievements-plural').innerHTML = (player.achievements.normal.number === 1) ? '' : 's';
  document.getElementById('normal-achievements-effect').innerHTML = format(getNormalAchievementsEffect());
  document.getElementById('normal-achievements-patience-effect').innerHTML = format(getNormalAchievementsPatienceEffect());
  document.getElementById('normal-achievements-patience-kept-effect').innerHTML = format(getNormalAchievementsPatienceKeptEffect());
  for (let i = 0; i <= 26; i++) {
    if (player.achievements.normal.list[i]) {
      document.getElementById('normal-ach-status-' + i).innerHTML = '&#x2714;';
      document.getElementById('normal-ach-status-' + i).style.color = 'green';
    } else {
      document.getElementById('normal-ach-status-' + i).innerHTML = '&#x2718;';
      document.getElementById('normal-ach-status-' + i).style.color = 'red';
    }
  }
  document.getElementById('total-lategame-achievements').innerHTML = player.achievements.lategame.number;
  document.getElementById('total-lategame-achievements-plural').innerHTML = (player.achievements.lategame.number === 1) ? '' : 's';
  document.getElementById('lategame-achievements-patience-effect').innerHTML = format(getLategameAchievementsPatienceEffect());
  document.getElementById('lategame-achievements-completions-effect').innerHTML = format(getLategameAchievementsCompletionsEffect());
  document.getElementById('lategame-achievements-patience-kept-effect').innerHTML = format(getLategameAchievementsPatienceKeptEffect());
  for (let i = 0; i <= 8; i++) {
    if (player.achievements.lategame.list[i]) {
      document.getElementById('lategame-ach-status-' + i).innerHTML = '&#x2714;';
      document.getElementById('lategame-ach-status-' + i).style.color = 'green';
    } else {
      document.getElementById('lategame-ach-status-' + i).innerHTML = '&#x2718;';
      document.getElementById('lategame-ach-status-' + i).style.color = 'red';
    }
  }
}
