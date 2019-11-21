window.onload = function () {
  Saving.loadGameStorage();
  updateDisplaySetup();
  setInterval(gameLoop, 64);
  setInterval(() => Saving.saveGame(), 16384);
}
