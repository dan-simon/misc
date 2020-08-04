let NOTATION_LIST = ['Scientific', 'Engineering', 'Letters', 'Standard', 'Cancer',
'Mixed scientific', 'Mixed engineering', 'Logarithm', 'Brackets', 'Infinity',
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
  nextNotation() {
    player.options.notation = NOTATION_LIST[(NOTATION_LIST.indexOf(player.options.notation) + 1) % NOTATION_LIST.length];
  }
}
