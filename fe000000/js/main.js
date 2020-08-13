window.onload = function () {
  updateDisplayPageLoadSetup();
  let didLoadWork = Saving.loadGameStorage();
  setInterval(gameLoop, 64);
  setInterval(() => Saving.saveGame(), 16384);
  if (didLoadWork) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('main').style.display = '';
  }
}
