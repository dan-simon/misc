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
  setViewAll(x) {
    temporarySettings.viewAll = x;
    updateDisplay();
  }
}
