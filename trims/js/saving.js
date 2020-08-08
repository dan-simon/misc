let Saving = {
  saveGame () {
    localStorage.setItem('trims-save', btoa(JSON.stringify(player)))
  },
  loadGame(s, offlineProgress, isOracle) {
    // offlineProgress = null means leave it up to the save.
    player = JSON.parse(atob(s));
    if (offlineProgress === null) {
      offlineProgress = player.options.offlineProgress;
    }
    this.fixPlayer();
    this.convertSaveToDecimal();
    if (!isOracle) {
      // We can do this after fixing Decimal.
      let now = Date.now();
      if (offlineProgress) {
        this.simulateTime((now - player.lastUpdate) / 1000);
      }
      player.lastUpdate = now;
      this.saveGame();
      updateDisplaySaveLoadSetup();
    }
  },
  simulateTime(totalDiff) {
    let baseTickLength = 1 / 20;
    let ticks = Math.ceil(Math.min(totalDiff / baseTickLength, 1000));
    let tickLength = totalDiff / ticks;
    for (let i = 0; i < ticks; i++) {
      gameLoop(tickLength, false);
    }
  },
  oracleSimulateTime(totalDiff) {
    this.simulateTime(Math.max(0, totalDiff - 16));
    this.simulateTime(Math.min(16, totalDiff));
  },
  fixPlayer() {
    // No versions, no problems.
  },
  convertSaveToDecimal() {
    // Guess what? Nothing is Decimal! Nothing!
  },
  loadGameStorage () {
    if (!localStorage.getItem('trims-save')) {
      // The save doesn't exist.
      this.resetGame();
    } else {
      try {
        // We're loading from storage, player.options.offlineProgress isn't set yet.
        this.loadGame(localStorage.getItem('trims-save'), null);
      } catch (ex) {
        console.log('Error while loading game, please report this.', ex);
        alert('There was an error while loading the game, please report this. ' +
        'If the game seems broken, export your save (and reset if you want). ' +
        'More detail on error: ' + ex.toString() + ', stack: ' + ex.stack.toString());
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
    parent.style.display = '';
    output.value = btoa(JSON.stringify(player));
    output.select();
    try {
      document.execCommand('copy');
    } catch(ex) {
      alert('Copying to clipboard failed.');
    }
    if (!player.options.exportDisplay) {
      parent.style.display = 'none';
      document.getElementsByClassName('export-button')[0].focus();
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
