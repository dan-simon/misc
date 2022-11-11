let TextBoxes = {
  data: {
    'boost-power': {
      'condition': () => player.boostPower > 1,
      'text': () => ('You\'ve started to produce boost power! Boost power production is based on number of boosts above ' +
      formatInt(Boost.boostPowerStart()) + '. Boost power resets on eternity but not on infinity. Boost power provides ' +
      'a multiplier to boosts based on its amount, and gives theorems (kept on eternity). ' +
      'You can view your boost power in the Main tab.')
    },
    'ec-4-exit': {
      'condition': () => false,
      'text': (completions) => ('You were about to get too many infinities to stay in Eternity Challenge ' +
      formatOrdinalInt(4) + ', so you exited it ' + ((completions > 0) ?
      (EternityChallenge.canCompleteMultipleTiersAtOnce() ?
      '(completing ' + completions + ' EC' + formatOrdinalInt(4) + ' tier' + pluralize(completions, '', 's') + ').' :
      '(completing it).') : '(not completing it).'))
    }
  },
  create(rawText, data) {
    // It's rare enough for two text boxes to be created at once that we can just remove the existing one.
    // It's probably best not to have two at once?
    for (let i of document.getElementsByClassName('box')) {
      if (i.parentElement === document.body) {
        document.body.removeChild(i);
      }
    }
    let text = typeof rawText === 'function' ? rawText(data) : rawText;
    let box = document.createElement('div');
    box.className = 'box';
    let textSpan = document.createElement('span');
    textSpan.className = 'box-text';
    textSpan.innerText = text;
    box.appendChild(textSpan);
    box.appendChild(document.createElement('br'));
    let close = document.createElement('button');
    close.onclick = function () {
      document.body.removeChild(box);
    }
    close.innerText = 'Close this';
    box.appendChild(close);
    document.body.appendChild(box);
  },
  checkDisplay() {
    for (let i in this.data) {
      if (!player.hasSeenTextBox[i] && this.data[i].condition()) {
        this.display(i);
      }
    }
  },
  display(i, data) {
    // Note that this will always redisplay the text box whether or not it's been shown.
    // Data can be undefined.
    player.hasSeenTextBox[i] = true;
    this.create(this.data[i].text, data);
  }
}
