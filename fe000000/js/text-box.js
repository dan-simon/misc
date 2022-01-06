let TextBoxes = {
  data: {
    'boost-power': {
      'condition': () => player.boostPower > 1,
      'text': () => ('You\'ve started to produce boost power! Boost power production is based on number of boosts above ' +
      formatInt(Boost.boostPowerStart()) + '. Boost power resets on eternity but not on infinity. Boost power provides ' +
      'a multiplier to boosts based on its amount, and gives theorems (kept on eternity). ' +
      'You can view your boost power in the Main tab.')
    }
  },
  create(rawText) {
    let text = typeof rawText === 'function' ? rawText() : rawText;
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
        player.hasSeenTextBox[i] = true;
        this.create(this.data[i].text);
      }
    }
  }
}
