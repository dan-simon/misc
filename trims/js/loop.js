function gameLoop(diff, display) {
  if (typeof diff !== 'number') {
    let now = Date.now();
    diff = Math.max(0, (now - player.lastUpdate) / 1000);
    player.lastUpdate = now;
  }
  Stuff.gatherBase(diff);
  Traps.trap(diff);
  Trims.gather(diff);
  Trims.breed(diff);
  Zone.maybeAutoSendGroupToFight();
  Zone.fight(diff);
  updateDisplay();
}
