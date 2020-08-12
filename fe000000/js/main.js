window.onload = function () {
  updateDisplayPageLoadSetup();
  Saving.loadGameStorage();
  setInterval(gameLoop, 64);
  setInterval(() => Saving.saveGame(), 16384);
  document.getElementById('loading').style.display = 'none';
  document.getElementById('main').style.display = '';
}
