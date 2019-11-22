window.onload = function () {
  updateDisplayPageLoadSetup();
  Saving.loadGameStorage();
  setInterval(gameLoop, 64);
  setInterval(() => Saving.saveGame(), 16384);
}
