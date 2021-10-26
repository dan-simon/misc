let PrestigeLayerNames = {
  layers: ['prestige', 'infinity', 'eternity', 'complexity', 'finality'],
  highestLayer() {
    if (player.finalities > 0) {
      return 'finality';
    } else if (player.complexities > 0) {
      return 'complexity';
    } else if (player.eternities.gt(0)) {
      return 'eternity';
    } else if (player.infinities > 0) {
      return 'infinity';
    } else {
      return 'prestige';
    }
  },
  layersAboveDisplay(x) {
    let hl = this.highestLayer();
    if (Options.showAllTabs()) {
      hl = 'finality';
    }
    let layers = this.layers.slice(this.layers.indexOf(x), this.layers.indexOf(hl) + 1);
    return coordinate('*', '', layers);
  }
}
