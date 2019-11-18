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
      'options': () => true,
      'infinity': () => player.infinities > 0,
    }[x]();
  }
}
