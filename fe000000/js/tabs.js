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
      'infinity': () => PrestigeLayerProgress.hasReached('infinity'),
      'challenges': () => PrestigeLayerProgress.hasReached('infinity'),
      'autobuyers': () => true,
      'infinity-challenges': () => InfinityPrestigeLayer.canInfinityBeBroken() || PrestigeLayerProgress.hasReached('eternity'),
      'eternity': () => PrestigeLayerProgress.hasReached('eternity'),
      'eternity-milestones': () => PrestigeLayerProgress.hasReached('eternity'),
      'studies': () => PrestigeLayerProgress.hasReached('eternity'),
      'eternity-producer': () => PrestigeLayerProgress.hasReached('eternity'),
      'eternity-challenges': () => PrestigeLayerProgress.hasReached('eternity'),
      'chroma': () => PrestigeLayerProgress.hasReached('eternity'),
      'complexity': () => PrestigeLayerProgress.hasReached('complexity'),
      'complexity-challenges': () => PrestigeLayerProgress.hasReached('complexity'),
      'complexity-achievements': () => PrestigeLayerProgress.hasReached('complexity'),
      'powers': () => PrestigeLayerProgress.hasReached('complexity'),
      'oracle': () => PrestigeLayerProgress.hasReached('complexity'),
      'galaxies': () => PrestigeLayerProgress.hasReached('complexity'),
      'statistics': () => true,
      'options': () => true,
    }[x]();
  }
}
