let player;
let temporarySettings;

window.onload = function () {
  try {
    player = JSON.parse(atob(localStorage.getItem('fe000000-save'), null));
  } catch (ex) {
    player = {
      options: {
        notation: 'Scientific',
        timeDisplay: 'Seconds',
        theme: {background: 'Dark', buttonColor: 'Vibrant'}
      },
      goals: [
        false, false, false, false,
        false, false, false, false,
        false, false, false, false,
        false, false, false, false
      ],
      displayAllGoals: false
    };
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
  'This guide does not yet cover the entire game.',
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