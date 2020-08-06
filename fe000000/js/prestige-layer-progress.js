let PrestigeLayerProgress = {
  criteria: {
    'infinity': () => player.infinities > 0 || player.eternities.gt(0) || player.complexities > 0 || player.finalities > 0,
    'eternity': () => player.eternities.gt(0) || player.complexities > 0 || player.finalities > 0,
    'complexity': () => player.complexities > 0 || player.finalities > 0,
    'finality': () => player.finalities > 0
  },
  hasReached(x) {
    return this.criteria[x]();
  }
}
