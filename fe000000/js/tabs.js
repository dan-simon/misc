let Tabs = {
  currentTab() {
    return player.currentTab;
  },
  setTab(x) {
    player.currentTab = x;
  },
  isTabVisible(x) {
    return {
      'main': () => true,
      'infinity': () => player.infinities > 0,
      'challenges': () => player.infinities > 0,
      'statistics': () => true,
      'options': () => true,
    }[x]();
  }
}
