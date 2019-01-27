function gameLoop () {
  let now = Date.now();
  let diff = (now - player.lastUpdate) / 1000;
  for (let i = 0; i < player.generators.length; i++) {
    for (let j = 0; j < player.generators[i].list.length; j++) {
      let gain = player.generators[i].list[j].amount.times(getMult(i, j)).times(diff);
      if (j === 0) {
        if (i === 0) {
          player.generators[i].prestigeAmount = player.generators[i].prestigeAmount.plus(gain);
        } else {
          player.generators[i].currencyAmount = player.generators[i].currencyAmount.plus(gain);
        }
      } else {
        player.generators[i].list[j - 1].amount = player.generators[i].list[j - 1].amount.plus(gain);
      }
    }
    if (player.generators[i].autoMaxAll) {
      maxAll(i);
    }
    if (player.generators[i].prestigeGain) {
      player.generators[i + 1].prestigeAmount = player.generators[i + 1].prestigeAmount.plus(getPrestigeGain(player.generators[i].prestigeAmount).times(diff));
    }
  }
  player.lastUpdate = now;
}

function saveGame() {
  localStorage.setItem('save', btoa(JSON.stringify(player)));
}

function loadGame(save) {
  if (save === undefined) {
    save = localStorage.getItem('save');
  }
  if (save) {
    player = JSON.parse(atob(save));
    convertDecimals(player);
  }
}

function convertDecimals(y) {
  if (y === null || (typeof y !== 'object' && typeof y !== 'array')) {
    return;
  } else if (typeof y === 'array') {
    for (let i = 0; i < y.length; i++) {
      if (typeof y[i] === 'string' && !isNaN(y[i])) {
        y[i] = new Decimal(y[i]);
      } else {
        convertDecimals(y[i]);
      }
    }
  } else {
    for (let i in y) {
      if (typeof y[i] === 'string' && !isNaN(y[i])) {
        y[i] = new Decimal(y[i]);
      } else {
        convertDecimals(y[i]);
      }
    }
  }
}

loadGame();
setInterval(saveGame, 10000);
setInterval(gameLoop, 50);
