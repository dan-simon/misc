let Saving = {
  saveGame () {
    localStorage.setItem('smirt-save', btoa(JSON.stringify(player)))
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
      this.simulateTime((now - player.lastUpdate) / 1000);
    }
    player.lastUpdate = now;
    this.saveGame();
    updateDisplaySaveLoadSetup();
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
    if (player.version < 0.02) {
      player.perks.push(0);
      player.currentChallenge = -1;
      player.challengesCompleted = [false];
      player.highestZone = player.zone;
      player.version = 0.02;
    }
    if (player.version < 0.03) {
      player.aether = new Decimal(0);
      player.importance.aether = 0;
      player.vm = {
        total: 0,
        ran: 0
      }
      player.map.mapType = player.map.inMap ? 'normal' : null;
      player.aetherUpgrades = 0;
      player.aetherAttack = 0;
      player.stats.highestZone = player.highestZone;
      player.stats.highestMapThisPortal = 0;
      delete player.highestZone;
      player.version = 0.03;
    }
    if (player.version < 0.04) {
      player.perks.push(0);
      player.challengesCompleted.push(false);
    }
  },
  convertSaveToDecimal() {
    player.metal = new Decimal(player.metal);
    player.stone = new Decimal(player.stone);
    player.wood = new Decimal(player.wood);
    player.aether = new Decimal(player.aether);
  },
  loadGameStorage () {
    if (!localStorage.getItem('smirt-save')) {
      // The save doesn't exist.
      this.resetGame();
    } else {
      try {
        // We're loading from storage, player.options.offlineProgress isn't set yet.
        this.loadGame(localStorage.getItem('smirt-save'), null);
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
