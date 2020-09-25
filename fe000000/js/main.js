let blocked = false;

let blockableGameLoop = function () {
  if (!blocked) {
    gameLoop();
  }
}

window.onload = function () {
  updateDisplayPageLoadSetup();
  Saving.loadGameStorage(function (success) {
    if (success) {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('main').style.display = '';
    } else {
      // No, don't format in this case. For all we know our formatting is down too.
      document.getElementById('script-count').innerHTML = document.getElementsByTagName('script').length;
    }
  });
  setInterval(blockableGameLoop, 64);
  setInterval(() => Saving.saveGame(true), Math.pow(2, 14));
}
