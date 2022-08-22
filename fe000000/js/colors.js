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
      let buttonColor = this.getButtonColorAltered(true, i === 'chroma' ? 'studies' : i);
      document.documentElement.style.setProperty('--study-' + i + '-color', buttonColor);
    }
    for (let i of ['grey', 'purple', 'orange', 'cyan', 'green', 'red']) {
      let nextColor = this.interpolate(this.backgroundColor(), this.colorToRgb(this.getStringToColorCode(i, 'Vibrant')), 0.5);
      document.documentElement.style.setProperty('--next-' + i + '-color', 'rgb(' + nextColor.map(Math.floor).join(', ') + ')');
    }
    for (let i of ['yellow', 'grey', 'purple', 'orange', 'cyan', 'green', 'red', 'magenta', 'brown', 'gold']) {
      document.documentElement.style.setProperty('--' + i + '-text-color', this.adjust(this.getStringToColorCode(i, 'Vibrant')));
    }
    // Red and gold are never rotated
    for (let i of ['yellow', 'grey', 'purple', 'orange', 'cyan', 'green', 'magenta', 'brown']) {
      document.documentElement.style.setProperty('--' + i + '-altered-text-color', this.adjust(this.rotate(this.getStringToColorCode(i, 'Vibrant'))));
    }
  },
  colorToRgb(x) {
    return [parseInt(x.slice(1, 3), 16), parseInt(x.slice(3, 5), 16), parseInt(x.slice(5, 7), 16)];
  },
  adjust(x) {
    if (!Options.adjustColors()) {
      return x;
    }
    let y = this.colorToRgb(x);
    if (y[0] === 255 && y[1] === 255 && Options.background() === 'Light') {
      return '#' + [y[0] - 51, y[1] - 51, Math.min(y[2] + 51, 255)].map(i => (i + 256).toString(16).slice(1)).join('');
    } else if (y[0] === 0 && y[1] === 0 && Options.background() === 'Dark') {
      return '#' + [y[0] + 51, y[1] + 51, Math.max(y[2] - 51, 0)].map(i => (i + 256).toString(16).slice(1)).join('');
    } else {
      return x;
    }
  },
  rotate(x) {
    let y = this.colorToRgb(x);
    let z = [0, 1, 2].map(i => y[(i + Options.colorChangeNumber()) % 3]);
    return '#' + z.map(i => (i + 256).toString(16).slice(1)).join('');
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
      if (gradientOnEdge && player.options.theme.edgeGradients === 'Small') {
        return 'radial-gradient(' + a + ', ' + a + ' 75%,' + b + ')';
      }
      return 'radial-gradient(' + a + ', ' + b + ')';
    }
  },
  colorNameToPlayerAlias(color) {
    // This can return undefined (e.g., for colors like challengered) but given where it's used, that's OK.
    return {
      'normal': 'yellow',
      'yellow': 'yellow',
      'infinity': 'magenta',
      'magenta': 'magenta',
      'eternity': 'cyan',
      'cyan': 'cyan',
      'complexity': 'brown',
      'brown': 'brown',
      'finality': 'gold',
      'gold': 'gold',
      'grey': 'grey',
      'eternity-producer': 'purple',
      'purple': 'purple',
      'chroma': 'orange',
      'orange': 'orange',
      'studies': 'green',
      'green': 'green',
      'red': 'red',
    }[color];
  },
  getStringToColorCode(color, buttonColor) {
    let dullOrVibrant = buttonColor || Options.usualButtonColor();
    return Options.colorSetting(color, dullOrVibrant, true);
  },
  displayStringToColorCode(color, buttonColor) {
    let original = this.getStringToColorCode(color, buttonColor);
    let adjusted = this.adjust(original );
    if (original === adjusted) {
      return original;
    } else {
      return original + ' → ' + adjusted;
    }
  },
  getStringToColorCodeAltered(color, buttonColor) {
    let res = this.getStringToColorCode(color, buttonColor);
    if (color !== 'finality' && color !== 'chroma') {
      res = this.rotate(res);
    }
    return res;
  },
  getButtonColorAltered(hasColor, colorType) {
    if (!hasColor) {
      return 'var(--button-color)';
    }
    if (typeof colorType === 'string') {
      return this.getStringToColorCodeAltered(colorType);
    } else {
      return 'linear-gradient(90deg, ' + colorType.map(x => this.getStringToColorCodeAltered(x)).join(', ') + ')';
    }
  },
  rewardClass(hasReward) {
    if (player.options.completionColors === 'Off') return '';
    return hasReward ? 'greenspan' : 'redspan';
  }
}

let ColorPreset = {
  colorList: ['brown', 'cyan', 'gold', 'green', 'grey', 'magenta', 'orange', 'purple', 'red', 'yellow'],
  exportString() {
    return this.colorList.map(i => i + ':' + Options.colorSetting(i, 'Dull') + '&' + Options.colorSetting(i, 'Vibrant')).join(',');
  },
  export() {
    let output = document.getElementById('colors-export-output');
    let parent = output.parentElement;
    let colorPresetBr = document.getElementsByClassName('colorpresetbr')[0];
    parent.style.display = '';
    colorresetBr.style.display = '';
    output.value = this.exportString();
    output.select();
    if (player.options.exportCopy) {
      output.select();
      try {
        document.execCommand('copy');
      } catch(ex) {
        alert('Copying to clipboard failed.');
      }
    }
    if (!player.options.exportShow) {
      parent.style.display = 'none';
      colorPresetBr.style.display = 'none';
      document.getElementsByClassName('colors-export-button')[0].focus();
    }
  },
  importString(importString) {
    let presetsWithName = player.colorPresets.filter(x => x.name === importString);
    if (presetsWithName.length > 0) {
      this.importStringFromPreset(presetsWithName[0].colors);
    } else {
      this.importStringFromPreset(importString);
    }
  },
  importStringFromPreset(importString) {
    importString = importString.toLowerCase().replace(/[ \t\n]/g, '');
    for (let i of importString.split(',')) {
      let parts = i.split(':');
      let color = parts[0];
      if (this.colorList.includes(color)) {
        let dull = parts[1].split('&')[0];
        let vibrant = parts[1].split('&')[1] || '';
        Options.setColorSetting(color, 'Dull', dull, true);
        Options.setColorSetting(color, 'Vibrant', vibrant, true);
      }
    }
    Colors.updateColors();
  },
  import() {
    this.importString(prompt('Enter color scheme (as previously exported):'));
  },
  hasPreset(x) {
    return player.colorPresets.length >= x;
  },
  presetName(x) {
    if (!this.hasPreset(x)) return 'Untitled';
    return player.colorPresets[x - 1].name;
  },
  presetColors(x) {
    if (!this.hasPreset(x)) return '';
    return player.colorPresets[x - 1].colors;
  },
  setPresetName(x, name) {
    player.colorPresets[x - 1].name = name;
  },
  setPresetColors(x, colors) {
    player.colorPresets[x - 1].colors = colors;
  },
  presetSetToCurrentColors(x) {
    if (Options.confirmation('presetChange') && !confirm('Are you sure you want to change this color preset?')) {
      return;
    }
    this.setPresetColors(x, this.exportString());
    this.redisplayPresetColors(x);
  },
  isLastPresetIndex(x) {
    return player.lastPresetIndices[0] === x;
  },
  setLastPresetIndex(x) {
    player.lastPresetIndices[0] = x;
  },
  updateLastPresetIndexFromDeletion(x) {
    if (player.lastPresetIndices[1] === x) {
      player.lastPresetIndices[0] = 0;
    }
    if (player.lastPresetIndices[1] > x) {
      player.lastPresetIndices[0]--;
    }
  },
  presetClass(x) {
    return (Options.presetHighlightColors() && this.isLastPresetIndex(x)) ? 'softlyhighlighted' : '';
  },
  presetLoad(x) {
    this.importStringFromPreset(this.presetColors(x));
    this.setLastPresetIndex(x);
  },
  presetDelete(x) {
    if (Options.confirmation('presetDeletion') && !confirm('Are you sure you want to delete this color preset?')) {
      return;
    }
    player.colorPresets = player.colorPresets.slice(0, x - 1).concat(player.colorPresets.slice(x));
    this.updateLastPresetIndexFromDeletion(x);
    for (let i = x; i <= player.colorPresets.length; i++) {
      this.redisplayPreset(i);
    }
  },
  presetCreate() {
    if (!this.hasPreset(32)) {
      player.colorPresets.push({'name': 'Untitled', 'colors': this.exportString()});
      this.redisplayPreset(player.colorPresets.length);
    }
  },
  presetSort() {
    player.colorPresets.sort((a, b) => presetSortFunction(a.name, b.name));
    for (let i = 1; i <= player.colorPresets.length; i++) {
      this.redisplayPreset(i);
    }
  },
  redisplayPreset(x) {
    this.redisplayPresetName(x);
    this.redisplayPresetColors(x);
  },
  redisplayPresetName(x) {
    document.getElementsByClassName('presetcolorname' + x)[0].value = this.presetName(x);
  },
  redisplayPresetColors(x) {
    document.getElementsByClassName('presetcolorscheme' + x)[0].value = this.presetColors(x);
  },
  returnToDefault() {
    for (let color of this.colorList) {
      Options.setColorSetting(color, 'Dull', '', true);
      Options.setColorSetting(color, 'Vibrant', '', true);
    }
    Colors.updateColors();
  }
}
