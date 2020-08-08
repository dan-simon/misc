let Options = {
  toggleOfflineProgress() {
    player.options.offlineProgress = !player.options.offlineProgress;
  },
  setNotation(x) {
    player.options.notation = x;
  },
  notation() {
    return player.options.notation;
  },
  setBuildAmount(x) {
    player.options.buildAmount = x;
  },
  buildAmount() {
    return player.options.buildAmount;
  }
}
