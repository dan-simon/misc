window.onload = function () {
  try {
    player = JSON.parse(atob(localStorage.getItem('fe000000-save'), null));
  } catch (ex) {
    player = {options: {notation: 'Scientific', theme: 'Dark'}};
  }
  Colors.updateColors();
  updateDisplayPageLoadSetup();
  updateDisplay();
  setInterval(updateDisplay, 16384);
}

let randomMessageList = [
  'Do you really need a guide for this?',
  'This guide currently covers only a small fraction of the game.',
  'Nothing in here is necessarily optimal, but it\'s probably fairly close.',
  'Feel free to make suggestions to improve this guide.',
  'Did you know that some stars in the sky are dead, but we still see their ancient image?',
  'Don\'t hex the moon, hex the stars.',
  'What are these messages, a news ticker or something?',
]

let getRandomMessage = function () {
  return randomMessageList[Math.floor(Math.random() * randomMessageList.length)]
}