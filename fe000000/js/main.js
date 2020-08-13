window.onload = function () {
  updateDisplayPageLoadSetup();
  let didLoadWork = Saving.loadGameStorage();
  setInterval(gameLoop, 64);
  setInterval(() => Saving.saveGame(), 16384);
  if (didLoadWork) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('main').style.display = '';
  } else {
    // No, don't format in this case. For all we know our formatting is down too.
    document.getElementById('script-count').innerHTML = document.getElementsByTagName('script').length;
  }
}
