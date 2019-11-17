let Saving = {
  saveGame () {
    localStorage.setItem('fe000000-save', btoa(JSON.stringify(player)))
  },
  loadGame(s, offlineProgress) {
    // offlineProgress = null means leave it up to the save.
    player = JSON.parse(atob(s));
    if (offlineProgress === null) {
      offlineProgress = player.options.offlineProgress;
    }
    this.fixPlayer();
    this.convertSaveToDecimal();
    // We can do this after fixing Decimal.
    let now = Date.now();
    if (offlineProgress) {
      this.simulateTime((now - player.lastUpdate) / 1024);
    }
    player.lastUpdate = now;
    this.saveGame();
  },
  simulateTime(totalDiff) {
    let baseTickLength = 1 / 16;
    let ticks = Math.ceil(Math.min(totalDiff / baseTickLength, 1024));
    let tickLength = totalDiff / ticks;
    for (let i = 0; i < ticks; i++) {
      gameLoop(tickLength, false);
    }
  },
  fixPlayer() {
    // no fixes needed yet
  },
  convertSaveToDecimal() {
    player.stars = new Decimal(player.stars);
    for (let i = 0; i < 8; i++) {
      player.generators[i].amount = new Decimal(player.generators[i].amount);
    }
    player.prestigePower = new Decimal(player.prestigePower);
  },
  loadGameStorage () {
    if (!localStorage.getItem('fe000000-save')) {
      this.resetGame();
    } else {
      try {
        // We're loading from storage, player.options.offlineProgress isn't set yet.
        this.loadGame(localStorage.getItem('fe000000-save'), null);
      } catch (ex) {
        console.log('Exception while loading game, please report this.', ex);
        this.resetGame();
      }
    }
  },
  loadGamePrompt() {
    try {
      let save = prompt('Enter your save:');
      if (save && !(/^\s+$/.test(save))) {
        this.loadGame(save, player.options.offlineProgress);
      } else if (save !== null) {
        alert('The save you entered appears to be empty.');
      }
    } catch(ex) {
      alert('The save you entered does not seem to be valid. The error was ' + ex);
    }
  },
  exportGame () {
    let output = document.getElementById('export-output');
    let parent = output.parentElement;
    parent.style.display = "";
    output.value = btoa(JSON.stringify(player));
    output.focus();
    output.select();
    try {
      document.execCommand('copy');
    } catch(ex) {
      alert('Copying to clipboard failed.');
    }
  },
  resetGame() {
    // The false here sets Date.now() to when the game was reset
    // rather than when the window was loaded.
    this.loadGame(btoa(JSON.stringify(initialPlayer)), false);
  },
  resetGameWithConfirmation() {
    if (confirm('Do you really want to reset the game? You will lose all your progress, and get no benefit.')) {
      this.resetGame();
    }
  }
}
