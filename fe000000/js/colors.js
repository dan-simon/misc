let Colors = {
  backgroundColors: {
    'Dark': {
      '--background-color': '#000000',
      '--text-color': '#ffffff',
    },
    'Light': {
      '--background-color': '#ffffff',
      '--text-color': '#000000',
    }
  },
  stringToColorCode: {
    'Dull': {
      'normal': '#cccc33',
      'yellow': '#cccc33',
      'infinity': '#cc33cc',
      'magenta': '#cc33cc',
      'eternity': '#33cccc',
      'cyan': '#33cccc',
      'complexity': '#aa7777',
      'brown': '#aa7777',
      'finality': '#ccaa33',
      'gold': '#ccaa33',
      'grey': '#aaaaaa',
      'eternity-producer': '#aa99ff',
      'purple': '#aa99ff',
      'chroma': '#cc6633',
      'orange': '#cc6633',
      'studies': '#33cc33',
      'green': '#33cc33',
      'red': '#cc3333',
    },
    'Vibrant': {
      'challengered': '#ff0000',
      'challengeorange': '#ff9933',
      'challengeyellow': '#ffff00',
      'challengegreen': '#00cc00',
      'normal': '#ffff00',
      'yellow': '#ffff00',
      'yellowtext': {
        'Dark': '#ffff00',
        'Light': '#cccc33'
      },
      'infinity': '#ff00ff',
      'magenta': '#ff00ff',
      'eternity': '#00ffff',
      'cyan': '#00ffff',
      'complexity': '#aa7777',
      'brown': '#aa7777',
      'finality': '#ccaa33',
      'gold': '#ccaa33',
      'grey': '#aaaaaa',
      'eternity-producer': '#aa99ff',
      'purple': '#aa99ff',
      'chroma': '#ff9933',
      'orange': '#ff9933',
      'studies': '#33ff33',
      'green': '#33ff33',
      'red': '#ff0000',
    }
  },
  updateColors() {
    let table = this.backgroundColors[Options.background()];
    for (let i in table) {
      document.documentElement.style.setProperty(i, table[i]);
    }
    for (let i of ['normal', 'infinity', 'eternity', 'chroma']) {
      let buttonColor = this.getButtonColor(true, i === 'chroma' ? 'studies' : i);
      document.documentElement.style.setProperty('--study-' + i + '-color', buttonColor);
    }
    for (let i of ['grey', 'purple', 'orange', 'cyan', 'green', 'red']) {
      let nextColor = this.interpolate(this.backgroundColor(), this.colorToRgb(this.getStringToColorCode(i, 'Vibrant')), 0.5);
      document.documentElement.style.setProperty('--next-' + i + '-color', 'rgb(' + nextColor.map(Math.floor).join(', ') + ')');
    }
    document.documentElement.style.setProperty('--yellow-text-color', this.getStringToColorCode('yellowtext', 'Vibrant'));
  },
  colorToRgb(x) {
    return [parseInt(x.slice(1, 3), 16), parseInt(x.slice(3, 5), 16), parseInt(x.slice(5, 7), 16)];
  },
  backgroundColor() {
    return this.colorToRgb(this.backgroundColors[Options.background()]['--background-color']);
  },
  interpolate(a, b, dimmed) {
    return [0, 1, 2].map(i => a[i] * (1 - dimmed) + b[i] * dimmed);
  },
  makeColor(x, dimmed) {
    if (typeof x === 'string') {
      let colorCode = this.getStringToColorCode(x, 'Vibrant');
      return 'rgb(' + this.interpolate(this.backgroundColor(), this.colorToRgb(colorCode), dimmed).map(Math.floor).join(', ') + ')';
    }
    // Handle true and false properly.
    x = +x;
    let r = x <= 1 / 4 ? 1 - x * 8 / 5 : (1 - x) * 4 / 5;
    let g = x * 4 / 5;
    return 'rgb(' + this.interpolate(this.backgroundColor(), [255 * r, 255 * g, 0], dimmed).map(Math.floor).join(', ') + ')';
  },
  interpolationFactor(isChallenge) {
    return {'Dull': 0.5, 'Dull on challenges': isChallenge ? 0.5 : 1, 'Vibrant': 1}[Options.buttonColor()];
  },
  makeStyle(x, isChallenge) {
    if (player.options.completionColors === 'Off') {
      return 'var(--background-color)';
    } else if (player.options.completionColors === 'On (uniform)') {
      let interpolationFactor = this.interpolationFactor(isChallenge);
      return this.makeColor(x, interpolationFactor);
    } else if (player.options.completionColors === 'On (gradient)') {
      let interpolationFactor = this.interpolationFactor(isChallenge);
      let gradientOnEdge = {'Edge': true, 'Center': false, 'Default': isChallenge, 'Reversed': !isChallenge}[
        Options.completionGradients()];
      let a = gradientOnEdge ? 'var(--background-color)' : this.makeColor(x, interpolationFactor);
      let b = gradientOnEdge ? this.makeColor(x, interpolationFactor) : 'var(--background-color)';
      return 'radial-gradient(' + a + ', ' + b + ')';
    }
  },
  getStringToColorCode(color, buttonColor) {
    let res = this.stringToColorCode[buttonColor || Options.usualButtonColor()][color];
    return (typeof res === 'string') ? res : res[Options.background()];
  },
  getButtonColor(hasColor, colorType) {
    if (!hasColor) {
      return '#aaaaaa';
    }
    if (typeof colorType === 'string') {
      return this.getStringToColorCode(colorType);
    } else {
      return 'linear-gradient(90deg, ' + colorType.map(x => this.getStringToColorCode(x)).join(', ') + ')';
    }
  },
  rewardClass(hasReward) {
    if (player.options.completionColors === 'Off') return '';
    return hasReward ? 'greenspan' : 'redspan';
  }
}
