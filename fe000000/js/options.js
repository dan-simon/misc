let NOTATION_LIST = ['Scientific', 'Engineering', 'Letters', 'Standard', 'Cancer',
'Mixed scientific', 'Mixed engineering', 'Logarithm', 'Binary', 'Hexadecimal', 'Evil', 'Brackets', 'Infinity',
'Roman', 'Dots', 'Zalgo', 'Hex', 'Imperial', 'Clock', 'Prime', 'Bar', 'Shi', 'Blind'];

let COMPLETION_COLOR_LIST = ['On (gradient)', 'On (uniform)', 'Off']

let Options = {
  toggleOfflineProgress() {
    player.options.offlineProgress = !player.options.offlineProgress;
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
  notation() {
    return player.options.notation;
  },
  setNotation(x) {
    player.options.notation = x;
  }
}
