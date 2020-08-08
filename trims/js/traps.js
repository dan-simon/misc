let Traps = {
  isTrapping() {
    return player.trapping;
  },
  toggleTrapping() {
    player.trapping = !player.trapping;
  },
  trapSpeed() {
    return 1;
  },
  hasAnyTraps() {
    return player.equip.trap.some(x => x > 0);
  },
  removeTrap() {
    player.equip.trap[player.equip.trap.map(x => x > 0).indexOf(true)]--;
  },
  trap(diff) {
    if (this.isTrapping()) {
      player.trapFraction = Math.min(player.trapFraction + diff * this.trapSpeed(), 1);
      if (player.trapFraction === 1 && this.hasAnyTraps() && Trims.amount() < Trims.capacity()) {
        Trims.add(1);
        this.removeTrap();
        player.trapFraction = 0;
      }
    }
  }
}
