let PrestigeLayerProgress = {
  conditions: [
    () => player.stats.sacrificesThisInfinity > 0,
    () => player.stats.prestigesThisInfinity > 0,
    () => player.infinities > 0,
    () => player.eternities.gt(0),
    () => player.complexities > 0,
    () => player.finalities > 0
  ],
  // If you've prestiged, you're considered to have reached sacrifice
  // even if you've never sacrificed. For most purposes this might be used for,
  // this is pretty good, but it's worth being careful
  // about PrestigeLayerProgress.hasReached('sacrifice').
  criteria: {
    'sacrifice': c => c.slice(0).some(x => x()),
    'prestige': c => c.slice(1).some(x => x()),
    'infinity': c => c.slice(2).some(x => x()),
    'eternity': c => c.slice(3).some(x => x()),
    'complexity': c => c.slice(4).some(x => x()),
    'finality': c => c.slice(5).some(x => x()),
  },
  hasReached(x) {
    return this.criteria[x](PrestigeLayerProgress.conditions);
  }
}
