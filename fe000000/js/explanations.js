let Explanations = {
  isVisible(type, x) {
    return {
      'autobuyers': {
        'any': [10, 11, 12].some(x => Autobuyer(x).hasAutobuyer()) || PrestigeLayerProgress.hasReached('eternity'),
        'basic': [10, 11, 12].some(x => Autobuyer(x).hasAutobuyer()) || PrestigeLayerProgress.hasReached('eternity'),
        'per-sec': Autobuyer(12).hasAutobuyer() || PrestigeLayerProgress.hasReached('eternity')
      },
      'eternity-milestones': {
        'main': PrestigeLayerProgress.hasReached('complexity')
      },
      'complexity-challenges': {
        'main': true
      },
      'powers': {
        'main': true
      },
      'options': {
        'offline': Options.isOptionTypeShown('saving')
      }
    }[type][x];
  },
  isShown(type, x) {
    return this.isVisible(type, x) && player.options.explanations[type] === x;
  },
  showOrHide(type, x) {
    if (player.options.explanations[type] === x) {
      player.options.explanations[type] = '';
    } else {
      player.options.explanations[type] = x;
    }
  }
}