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
  localStorage.setItem('save', btoa(JSON.stringify(player, function(k, v) {return (v === Infinity) ? "Infinity" : v})));
}

function loadGame(save) {
  if (save === undefined) {
    save = localStorage.getItem('save');
  }
  if (save) {
    player = JSON.parse(atob(save), revive);
  }
}

function revive(k, v) {
  if (v === 'Infinity') {
    return Infinity;
  } else if (typeof v === 'string' && !isNaN(v)) {
    return new Decimal(v);
  } else {
    return v;
  }
}

loadGame();
setInterval(saveGame, 10000);
setInterval(gameLoop, 50);
