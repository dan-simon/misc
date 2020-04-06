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
      'infinity': () => player.infinities > 0 || player.eternities > 0,
      'challenges': () => player.infinities > 0 || player.eternities > 0,
      'autobuyers': () => player.infinities > 0 || player.eternities > 0,
      'infinity-challenges': () => player.infinities > 0 || player.eternities > 0,
      'eternity': () => player.eternities > 0,
      'eternity-milestones': () => player.eternities > 0,
      'statistics': () => true,
      'options': () => true,
    }[x]();
  }
}
