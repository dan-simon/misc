window.onload = function () {
  updateDisplayPageLoadSetup();
  Saving.loadGameStorage();
  setInterval(gameLoop, 50);
  setInterval(() => Saving.saveGame(), 10000);
}
