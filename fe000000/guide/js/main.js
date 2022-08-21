let player;
let temporarySettings;

let startingPlayer = {
  options: {
    notation: {
      notation: 'Scientific',
      lowerPrecision: 3,
      higherPrecision: 5,
      displayDigits: 10,
      exponentBase: 10,
      alphabet: 'abcdefghijklmnopqrstuvwxyz'
    },
    timeDisplay: 'Seconds',
    notationOnTimes: false,
    theme: {background: 'Dark', buttonColor: 'Vibrant'},
    adjustColors: true,
    colorData: {
      'Dull': {
        'yellow': '',
        'grey': '',
        'purple': '',
        'orange': '',
        'cyan': '',
        'green': '',
        'red': '',
        'magenta': '',
        'brown': '',
        'gold': '',
      },
      'Vibrant': {
        'yellow': '',
        'grey': '',
        'purple': '',
        'orange': '',
        'cyan': '',
        'green': '',
        'red': '',
        'magenta': '',
        'brown': '',
        'gold': '',
      }
    },
  },
  goals: [
    false, false, false, false,
    false, false, false, false,
    false, false, false, false,
    false, false, false, false
  ],
  displayAllGoals: false
};

window.onload = function () {
  try {
    player = Saving.decode(localStorage.getItem('fe000000-save'));
  } catch (ex) {
    player = startingPlayer;
  }
  // Add new options (e.g. notation precision)
  for (let i in startingPlayer.options) {
    // This is here to handle notations changing from string to dictionary.
    // It's not ideal but at least it's unlikely to cause errors.
    if (!(i in player.options) || typeof player.options[i] !== typeof startingPlayer.options[i]) {
      player.options[i] = startingPlayer.options[i];
    }
  }
  temporarySettings = {
    viewAll: player.displayAllGoals,
    currentTab: 1
  };
  Options.updateCheckboxSize();
  Colors.updateColors();
  updateDisplayPageLoadSetup();
  updateDisplaySaveLoadSetup();
  updateDisplay();
  setInterval(updateDisplay, 16384);
}

let randomMessageList = [
  'Do you really need a guide for this?',
  'This guide now covers the entire game, at least if you define "cover" loosely.',
  'Nothing in here is necessarily optimal, but it\'s probably fairly close.',
  'Feel free to make suggestions to improve this guide.',
  'Did you know that some stars in the sky are dead, but we still see their ancient image?',
  'Don\'t hex the moon, hex the stars.',
  'What are these messages, a news ticker or something?',
  'Better for you if you take me off.',
]

let getRandomMessage = function () {
  return randomMessageList[Math.floor(Math.random() * randomMessageList.length)]
}