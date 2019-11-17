window.onload = function () {
  Saving.loadGameStorage();
  setInterval(gameLoop, 64);
  setInterval(() => Saving.saveGame(), 16384);
}
