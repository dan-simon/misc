function loadGame(s, offlineProgress) {
  // offlineProgress = null means leave it up to the save.
  player = JSON.parse(atob(s));
  if (offlineProgress === null) {
    offlineProgress = player.options.offlineProgress;
  }
  fixPlayer();
  convertSaveToDecimal();
  // We can do this after fixing Decimal.
  let now = Date.now();
  if (offlineProgress) {
    simulateTime((now - player.lastUpdate) / 1000);
  }
  player.lastUpdate = now;
  saveGame();
  fillInInputs();
  updateTabDisplay();
  updateCompletionMilestoneDisplay();
  updateAchievementDisplay();
  updateLoreDisplay();
  updateOtherDisplay();
}

function simulateTime(totalDiff) {
  let baseTickLength = 0.05;
  let ticks = Math.ceil(Math.min(totalDiff / baseTickLength, 1000));
  let tickLength = totalDiff / ticks;
  for (let i = 0; i < ticks; i++) {
    gameCode(tickLength);
  }
}

function fixPlayer () {
  if (!('enlightened' in player)) {
    player.enlightened = 0;
  }
  if (!('updates' in player)) {
    player.updatePoints = new Decimal(0);
    player.updates = 0;
    player.experience = [new Decimal(0), new Decimal(0), new Decimal(0)];
    player.power = [new Decimal(0), new Decimal(0), new Decimal(0)];
  }
  if (!('upgrades' in player)) {
    player.upgrades = [[false, false, false], [false, false, false]];
    player.auto = {
      dev: {
        settings: [0, 0, 0, 0, 0],
        on: false
      }
    }
  }
  if (!('options' in player)) {
    player.options = {
      confirmations: {
        prestige: true,
        prestigeWithoutGain: true,
        update: true,
        enterChallenge: true,
        exitChallenge: true
      },
      offlineProgress: true,
      updateChallenge: true,
      hardMode: false
    }
  }
  if (!('tab' in player)) {
    player.tab = 'main';
  }
  if (!('stats' in player)) {
    player.stats = {
      'recordDevelopment': 0
    }
  }
  if (!('currentChallenge' in player)) {
    player.currentChallenge = '';
    player.stats.recordDevelopment = {
      '': player.stats.recordDevelopment,
      'logarithmic': 0,
      'inefficient': 0,
      'ufd': 0,
      'lonely': 0,
      'impatient': 0,
      'unprestigious': 0,
      'slow': 0,
      'powerless': 0,
      'upgradeless': 0
    };
    player.options.confirmations.enterChallenge = true;
    player.options.confirmations.exitChallenge = true;
  }
  if (!('offlineProgress' in player.options)) {
    player.options.offlineProgress = true;
  }
  if (!('dilation' in player)) {
    player.dilation = 0;
  }
  if (!('last' in player.stats)) {
    player.stats.last = {
      enlightened: Date.now(),
      prestige: Date.now(),
      update: Date.now(),
      prestigeType: null,
      updatePointGain: new Decimal(0)
    }
  }
  if (!('enlightened' in player.auto)) {
    player.auto.enlightened = {
      setting: 'total times enlightened',
      value: new Decimal(0),
      displayValue: '0',
      on: false
    };
    player.auto.prestige = {
      setting: 'development',
      value: new Decimal(0),
      displayValue: '0',
      initial: 5,
      alternate: true,
      on: false
    };
    player.auto.update = {
      setting: 'development',
      value: new Decimal(0),
      displayValue: '0',
      on: false
    };
  }
  if (!('updateChallenge' in player.options)) {
    player.options.updateChallenge = true;
  }
  if (!('achievements' in player)) {
    player.achievements = {
      list: [
        false, false, false, false, false, false, false, false, false,
        false, false, false, false, false, false, false, false, false,
        false, false, false, false, false, false, false, false, false
      ],
      number: 0,
      stats: {
        savingTokens: true,
        noDevsForThat: true
      }
    }
  }
  if (!('lore' in player)) {
    player.lore = [];
  }
  for (let i in player.auto) {
    if (player.auto[i].setting && i in AUTO_SETTINGS && AUTO_SETTINGS[i].indexOf(player.auto[i].setting) === -1) {
      alert('Your ' + i + ' auto setting\'s name is no longer a possible setting. It has been reset.');
      player.auto[i].setting = AUTO_SETTINGS[i][0];
    }
  }
  if (!('hardMode' in player.options)) {
    player.options.hardMode = false;
  }
  if (!('completionMilestones' in player)) {
    player.completionMilestones = 0;
    player.auto.assignUpdatePoints = {
      settings: [0, 0, 0],
      on: false
    }
  }
  if (!('dilationUpgradesBought' in player)) {
    player.dilationUpgradesBought = 0;
  }
  if (typeof player.dilationUpgradesBought === 'number') {
    player.dilationUpgradesBought = [player.dilationUpgradesBought];
  }
  if (!('normal' in player.achievements)) {
    player.achievements = {
      normal: {
        list: player.achievements.list,
        number: player.achievements.number
      },
      lategame: {
        list: [false, false, false, false, false, false, false, false, false],
        number: 0
      },
      stats: player.achievements.stats
    }
  }
  if (!('yoDawg' in player.achievements.stats)) {
    player.achievements.stats.yoDawg = 0;
  }
  if (!('turnAllUpdatePointsIntoExperience' in player.options.confirmations)) {
    player.options.confirmations.turnAllUpdatePointsIntoExperience = true;
  }
}

function convertSaveToDecimal () {
  player.updatePoints = new Decimal(player.updatePoints);
  for (let i = 0; i <= 2; i++) {
    player.experience[i] = new Decimal(player.experience[i]);
    player.power[i] = new Decimal(player.power[i]);
  }
  for (let i = 0; i <= 2; i++) {
    player.auto[AUTO_LIST[i]].value = new Decimal(player.auto[AUTO_LIST[i]].value);
  }
  player.stats.last.updatePointGain = new Decimal(player.stats.last.updatePointGain);
}

function loadGameStorage () {
  if (!localStorage.getItem('5hours-save')) {
    resetGame();
  } else {
    try {
      // We're loading from storage, player.options.offlineProgress isn't set yet.
      loadGame(localStorage.getItem('5hours-save'), null);
    } catch (ex) {
      console.log('Exception while loading game, please report this.', ex);
      resetGame();
    }
  }
}

function loadGamePrompt() {
  try {
    let save = prompt('Enter your save:');
    if (save && !(/^\s+$/.test(save))) {
      loadGame(save, player.options.offlineProgress);
    } else if (save !== null) {
      alert('The save you entered appears to be empty.');
    }
  } catch(ex) {
    alert('The save you entered does not seem to be valid. The error was ' + ex);
  }
}

function saveGame () {
  localStorage.setItem('5hours-save', btoa(JSON.stringify(player)))
}

function exportGame () {
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
}

let initialPlayer = {
  progress: [0, 0, 0, 0, 0, 0, 0, 0], // in seconds, or for the last from 0 to 1
  devs: [0, 0, 0, 0, 0],
  milestones: 0,
  enlightened: 0,
  updatePoints: new Decimal(0),
  updates: 0,
  experience: [new Decimal(0), new Decimal(0), new Decimal(0)],
  power: [new Decimal(0), new Decimal(0), new Decimal(0)],
  upgrades: [[false, false, false], [false, false, false]],
  auto: {
    dev: {
      settings: [0, 0, 0, 0, 0],
      on: false
    },
    enlightened: {
      setting: 'total times enlightened',
      value: new Decimal(0),
      displayValue: '0',
      on: false
    },
    prestige: {
      setting: 'development',
      value: new Decimal(0),
      displayValue: '0',
      initial: 5,
      alternate: true,
      on: false
    },
    update: {
      setting: 'development',
      value: new Decimal(0),
      displayValue: '0',
      on: false
    },
    assignUpdatePoints: {
      settings: [0, 0, 0],
      on: false
    }
  },
  options: {
    confirmations: {
      prestige: true,
      prestigeWithoutGain: true,
      turnAllUpdatePointsIntoExperience: true,
      update: true,
      enterChallenge: true,
      exitChallenge: true
    },
    offlineProgress: true,
    updateChallenge: true,
    hardMode: false
  },
  tab: 'main',
  currentChallenge: '',
  stats: {
    'recordDevelopment': {
      '': 0,
      'logarithmic': 0,
      'inefficient': 0,
      'ufd': 0,
      'lonely': 0,
      'impatient': 0,
      'unprestigious': 0,
      'slow': 0,
      'powerless': 0,
      'upgradeless': 0
    },
    last: {
      enlightened: Date.now(),
      prestige: Date.now(),
      update: Date.now(),
      prestigeType: null,
      updatePointGain: new Decimal(0)
    }
  },
  achievements: {
    normal: {
      list: [
        false, false, false, false, false, false, false, false, false,
        false, false, false, false, false, false, false, false, false,
        false, false, false, false, false, false, false, false, false
      ],
      number: 0
    },
    lategame: {
      list: [false, false, false, false, false, false, false, false, false],
      number: 0
    },
    stats: {
      savingTokens: true,
      noDevsForThat: true,
      yoDawg: 0
    }
  },
  lore: [],
  dilation: 0,
  dilationUpgradesBought: [0],
  completionMilestones: 0,
  lastUpdate: Date.now()
}

function resetGame() {
  // The false here sets Date.now() to when the game was reset
  // rather than when the window was loaded.
  loadGame(btoa(JSON.stringify(initialPlayer)), false);
}

function resetGameWithConfirmation() {
  if (confirm('Do you really want to reset the game? You will lose all your progress, and get no benefit.')) {
    resetGame();
  }
}
