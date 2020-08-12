window.onload = function () {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('main').style.display = '';
  updateDisplayPageLoadSetup();
  Saving.loadGameStorage();
  setInterval(gameLoop, 64);
  setInterval(() => Saving.saveGame(), 16384);
}
