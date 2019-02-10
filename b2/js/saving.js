function saveText(player) {
  return btoa(JSON.stringify(player, function(k, v) {
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
  let initial = initialIncrementali();
  for (let key of ['costs', 'upgrades', 'costIncreases']) {
    if (player.incrementali[key].length < initial[key].length) {
      for (let i = player.incrementali[key].length; i < initial[key].length; i++) {
        player.incrementali[key].push(initial[key][i]);
      }
    }
  }
}
