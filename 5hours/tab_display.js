const TAB_LIST = ['main', 'achievements', 'lore', 'update', 'challenges', 'completion-milestones'];

function updateTabButtonDisplay () {
  if (player.updates > 0) {
    document.getElementById('update-tab-button').style.display = '';
  } else {
    document.getElementById('update-tab-button').style.display = 'none';
  }
  if (player.stats.recordDevelopment[''] >= 86400) {
    document.getElementById('challenges-tab-button').style.display = '';
    document.getElementById('completion-milestones-tab-button').style.display = '';
  } else {
    document.getElementById('challenges-tab-button').style.display = 'none';
    document.getElementById('completion-milestones-tab-button').style.display = 'none';
  }
}

function updateTabDisplay() {
  for (let i = 0; i < TAB_LIST.length; i++) {
    if (player.tab === TAB_LIST[i]) {
      document.getElementById(TAB_LIST[i] + '-div').style.display = '';
    } else {
      document.getElementById(TAB_LIST[i] + '-div').style.display = 'none';
    }
  }
}

function setTab(x) {
  player.tab = x;
  updateTabDisplay();
}
