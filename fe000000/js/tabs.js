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
      'infinity': () => player.infinities > 0 || player.eternities.gt(0) || player.complexities > 0,
      'challenges': () => player.infinities > 0 || player.eternities.gt(0) || player.complexities > 0,
      'autobuyers': () => true,
      'infinity-challenges': () => InfinityPrestigeLayer.canInfinityBeBroken() || player.eternities.gt(0),
      'eternity': () => player.eternities.gt(0) || player.complexities > 0,
      'eternity-milestones': () => player.eternities.gt(0) || player.complexities > 0,
      'studies': () => player.eternities.gt(0) || player.complexities > 0,
      'eternity-producer': () => player.eternities.gt(0) || player.complexities > 0,
      'eternity-challenges': () => player.eternities.gt(0) || player.complexities > 0,
      'chroma': () => player.eternities.gt(0) || player.complexities > 0,
      'complexity': () => player.complexities > 0,
      'complexity-challenges': () => player.complexities > 0,
      'complexity-achievements': () => player.complexities > 0,
      'powers': () => player.complexities > 0,
      'statistics': () => true,
      'options': () => true,
    }[x]();
  }
}
