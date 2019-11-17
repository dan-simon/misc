let NOTATION_LIST = ['Scientific', 'Engineering', 'Letters', 'Standard', 'Cancer',
'Mixed scientific', 'Mixed engineering', 'Logarithm', 'Brackets', 'Infinity',
'Roman', 'Dots', 'Zalgo', 'Hex', 'Imperial', 'Clock', 'Prime', 'Bar', 'Shi', 'Blind']

let Options = {
  toggleOfflineProgress() {
    player.options.offlineProgress = !player.options.offlineProgress;
  },
  toggleHotkeys() {
    player.options.hotkeys = !player.options.hotkeys;
  },
  nextNotation() {
    player.options.notation = NOTATION_LIST[(NOTATION_LIST.indexOf(player.options.notation) + 1) % NOTATION_LIST.length];
  }
}
