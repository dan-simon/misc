function saveText(player) {
  let p = saveObject(player);
  return btoa(JSON.stringify(p, function(k, v) {
    if (v === Infinity) {
      return "Infinity";
    } else if (typeof v === 'string') {
      for (let i = 0; i < superscripts.length; i++) {
        v = v.replace(superscripts[i], '^' + i,);
      }
      return v;
    } else {
      return v;
    }
  }));
}

function saveObject(player) {
  let p = {};
  for (let i in player) {
    if (i !== 'generators') {
      p[i] = player[i];
    } else {
      p.generators = [];
      for (let i = 0; i < player.generators.length; i++) {
        if (i < player.generators.length - 3 && player.saveType === 'short') {
          p.generators.push(getInitialTier(i));
        } else {
          p.generators.push(player.generators[i]);
        }
      }
    }
  }
  return p;
}

function toggleSaveType() {
  if (player.saveType === 'full') {
    player.saveType = 'short';
  } else if (player.saveType === 'short') {
    player.saveType = 'full';
  }
}

function saveGame() {
  localStorage.setItem('save-infinite-layers', saveText(player));
}

function loadGame(save) {
  if (save === undefined) {
    save = localStorage.getItem('save-infinite-layers');
    if (!save) {
      save = localStorage.getItem('save');
    }
  }
  if (save) {
    proposedPlayer = JSON.parse(atob(save), revive);
    if (proposedPlayer.assTime === undefined) {
      if (!proposedPlayer.version) {
        proposedPlayer.version = 0;
      }
      for (let i in proposedPlayer) {
        Vue.set(player, i, proposedPlayer[i]);
      }
    }
  }
  saveFix();
  setTheme(player.currentTheme);
}

function exportGame() {
  let output = document.getElementById('exportOutput');
  let parent = output.parentElement;
  parent.style.display = "";
  output.value = saveText(player);
  output.onblur = function() {
    parent.style.display = "none";
  }
  output.focus();
  output.select();
  try {
    document.execCommand('copy');
    output.blur();
  } catch(ex) {}
}

function resetGameWithConfirmation() {
  if (confirm('Are you sure you want to reset the game?')) {
    resetGame();
  }
}

function resetGame() {
  player = {
    lastUpdate: Date.now(),
    lowTiers: Infinity,
    highTiers: Infinity,
    singularity: {
      unlocked: false,
      currencyAmount: new Decimal(1)
    },
    incrementali: initialIncrementali(),
    generators: [],
    currentTheme: 'default',
    metaDisplay: true,
    saveType: 'full',
    version: 3
  }
  initializeTier();
  saveGame();
  window.location.reload(true);
}

function revive(k, v) {
  if (v === 'Infinity') {
    return Infinity;
  } else if (typeof v === 'string' && (!isNaN(v) || (v[0] === 'e' && !isNaN(v.slice(1))))) {
    return new Decimal(v);
  } else if (typeof v === 'string') {
    for (let i = 0; i < superscripts.length; i++) {
      v = v.replace('^' + i, superscripts[i]);
    }
    return v;
  } else {
    return v;
  }
}

function saveFix () {
  for (let i of player.generators) {
    if (typeof i.display !== 'boolean') {
      i.display = true;
    }
  }
  if (player.version < 1) {
    player.version = 1;
    player.singularity.currencyAmount = Decimal.min(player.singularity.currencyAmount, 1e70);
    player.incrementali.costs[1] = 1e27;
    player.incrementali.upgrades[1] = 0;
    player.incrementali.costIncreases[1] = 1e3;
    alert('Unfortunately, for balancing purposes, your singularity power has been reduced to 1e70 (if it was more than that), and your second incrementali upgrade has been reset.')
  }
  if (player.version < 2) {
    player.version = 2;
    player.singularity.currencyAmount = new Decimal(player.singularity.currencyAmount);
    let initial = initialIncrementali();
    for (let key of ['costs', 'upgrades', 'costIncreases']) {
      if (player.incrementali[key].length < initial[key].length) {
        for (let i = player.incrementali[key].length; i < initial[key].length; i++) {
          player.incrementali[key].push(initial[key][i]);
        }
      }
    }
    for (let i = 0; i < player.incrementali.costs.length; i++) {
      player.incrementali.costs[i] = new Decimal(player.incrementali.costs[i]);
    }
  }
  if (player.version < 3) {
    player.version = 3;
    for (let i = 0; i < player.incrementali.costs.length; i++) {
      player.incrementali.costs[i] = new Decimal(player.incrementali.costs[i]);
    }
  }
  if (player.version < 4) {
    player.version = 4;
    for (let i = 0; i < player.incrementali.costs.length; i++) {
      player.incrementali.costs[i] = new Decimal(player.incrementali.costs[i]);
    }
  }
  if (player.version < 5) {
    player.version = 5;
    let unlocked = player.incrementali.unlocked;
    player.incrementali = initialIncrementali();
    player.incrementali.unlocked = unlocked;
    alert('Unfortunately, as part of an attempted rebalance, your incrementali have been completely reset.');
  }
  if (player.version < 6) {
    player.version = 6;
    player.lowLayers = Infinity;
    player.highLayers = Infinity;
  }
}
