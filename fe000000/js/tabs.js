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
      'infinity': () => player.infinities > 0 || player.eternities.gt(0),
      'challenges': () => player.infinities > 0 || player.eternities.gt(0),
      'autobuyers': () => true,
      'infinity-challenges': () => InfinityPrestigeLayer.canInfinityBeBroken() || player.eternities.gt(0),
      'eternity': () => player.eternities.gt(0),
      'eternity-milestones': () => player.eternities.gt(0),
      'studies': () => player.eternities.gt(0),
      'eternity-producer': () => player.eternities.gt(0),
      'eternity-challenges': () => player.eternities.gt(0),
      'chroma': () => player.eternities.gt(0),
      'statistics': () => true,
      'options': () => true,
    }[x]();
  }
}
