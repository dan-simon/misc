let Options = {
  toggleOfflineProgress() {
    player.options.offlineProgress = !player.options.offlineProgress;
  },
  setNotation(x) {
    player.options.notation = x;
  },
  notation() {
    return player.options.notation;
  }
}
