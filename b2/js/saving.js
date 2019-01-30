function saveText(player) {
  return btoa(JSON.stringify(player, function(k, v) {return (v === Infinity) ? "Infinity" : v}));
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
  } else if (typeof v === 'string' && !isNaN(v)) {
    return new Decimal(v);
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
}
