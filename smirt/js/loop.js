function gameLoop(diff, display) {
  if (typeof diff !== 'number') {
    let now = Date.now();
    diff = Math.max(0, (now - player.lastUpdate) / 1000);
    player.lastUpdate = now;
  }
  gatherAll(diff);
  Zone.fight(diff);
  player.stats.timeSincePortal += diff;
  player.stats.timeSinceGameStart += diff;
  updateDisplay();
}
