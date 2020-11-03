let COMPLETION_GRADIENT_LIST = ['Default', 'Center', 'Edge', 'Reversed']

let COMPLETION_COLOR_LIST = ['On (gradient)', 'On (uniform)', 'Off'];

let TIME_DISPLAY_LIST = ['Seconds', 'D:H:M:S', 'D:H:M:S with notation', 'Largest unit'];

let Options = {
  toggleOfflineProgress() {
    player.options.offlineProgress = !player.options.offlineProgress;
  },
  displayOfflineTicks() {
    return player.options.offlineTicks;
  },
  offlineTicks() {
    return Math.min(Math.max(1, Math.floor(player.options.offlineTicks)), this.maxTicks());
  },
  setOfflineTicks(x) {
    player.options.offlineTicks = x || 1;
  },
  maxTicks() {
    return Math.pow(2, 16);
  },
  toggleHotkeys() {
    player.options.hotkeys = !player.options.hotkeys;
  },
  toggleExportDisplay() {
    player.options.exportDisplay = !player.options.exportDisplay;
  },
  nextCompletionColors() {
    player.options.completionColors = COMPLETION_COLOR_LIST[(COMPLETION_COLOR_LIST.indexOf(player.options.completionColors) + 1) % COMPLETION_COLOR_LIST.length];
  },
  resetColors() {
    return player.options.resetColors;
  },
  toggleResetColors() {
    player.options.resetColors = !player.options.resetColors;
  },
  tabColors() {
    return player.options.tabColors;
  },
  toggleTabColors() {
    player.options.tabColors = !player.options.tabColors;
  },
  notation() {
    return player.options.notation;
  },
  setNotation(x) {
    player.options.notation = x;
  },
  nextTimeDisplay() {
    player.options.timeDisplay = TIME_DISPLAY_LIST[(TIME_DISPLAY_LIST.indexOf(player.options.timeDisplay) + 1) % TIME_DISPLAY_LIST.length];
  },
  background() {
    return player.options.theme.background;
  },
  nextBackground() {
    player.options.theme.background = ['Dark', 'Light'][
      (['Dark', 'Light'].indexOf(player.options.theme.background) + 1) % 2];
    Colors.updateColors();
  },
  buttonColor() {
    return player.options.theme.buttonColor;
  },
  nextButtonColor() {
    player.options.theme.buttonColor = ['Dull', 'Vibrant'][
      (['Dull', 'Vibrant'].indexOf(player.options.theme.buttonColor) + 1) % 2];
    Colors.updateColors();
  },
  completionGradients() {
    return player.options.theme.completionGradients;
  },
  nextCompletionGradients() {
    let list = PrestigeLayerProgress.hasReached('infinity') ? COMPLETION_GRADIENT_LIST : ['Default', 'Reversed'];
    player.options.theme.completionGradients = list[(list.indexOf(player.options.theme.completionGradients) + 1) % list.length];
  },
  fitToWidth() {
    return player.options.fitToWidth;
  },
  toggleFitToWidth() {
    player.options.fitToWidth = !player.options.fitToWidth;
  },
  largerCheckboxes() {
    return player.options.largerCheckboxes;
  },
  toggleLargerCheckboxes() {
    player.options.largerCheckboxes = !player.options.largerCheckboxes;
    this.updateCheckboxSize();
  },
  updateCheckboxSize() {
    document.documentElement.style.setProperty('--checkbox-scale', player.options.largerCheckboxes ? 3 : 1);
  },
  confirmation(x) {
    return player.confirmations[x];
  },
  setConfirmation(x, y) {
    player.confirmations[x] = y;
  }
}
