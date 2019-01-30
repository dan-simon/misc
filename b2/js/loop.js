function gameLoop () {
  let now = Date.now();
  let diff = (now - player.lastUpdate) / 1000;
  if (player.generators[0].prestigeAmount.exponent >= singularityUnlockExp) {
    player.singularity.unlocked = true;
  }
  if (player.singularity.unlocked) {
    player.singularity.currencyAmount += Math.pow(player.generators[0].prestigeAmount.max(1).log(10) / singularityUnlockExp, 3) * diff;
  }
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
  localStorage.setItem('save-infinite-layers', btoa(JSON.stringify(player, function(k, v) {return (v === Infinity) ? "Infinity" : v})));
}

function loadGame(save) {
  if (save === undefined) {
    save = localStorage.getItem('save-infinite-layers');
    if (!save) {
      save = localStorage.getItem('save');
    }
  }
  if (save) {
    if (save) {
      proposedPlayer = JSON.parse(atob(save), revive);
      if (proposedPlayer.assTime === undefined) {
        player = proposedPlayer;
      }
    }
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
