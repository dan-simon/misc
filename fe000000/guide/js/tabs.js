let Tabs = {
  currentTab() {
    return temporarySettings.currentTab;
  },
  setTab(x) {
    temporarySettings.currentTab = x;
    updateDisplay();
  },
  isTabVisible(x) {
    return temporarySettings.viewAll || x === 1 || player.goals.slice(x - 2).some(x => x);
  },
  displayTabRow(i) {
    return this.isTabVisible([1, 5, 7, 9, 11, 13, 15][i - 1]);
  },
  setViewAll(x) {
    temporarySettings.viewAll = x;
    updateDisplay();
  }
}
