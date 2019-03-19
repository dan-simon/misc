var app = new Vue({
  el: "#app",
  data: {
    player: player
  },
  methods: {
    prestige(i) {
      return prestige(i);
    },
    getSingularityPowerEffect() {
      return getSingularityPowerEffect();
    },
    buyGenerator(i, j) {
      return buyGenerator(i, j);
    },
    buyMaxGenerator(i, j) {
      buyMaxGenerator(i, j);
    },
    maxAll(i) {
      maxAll(i);
    },
    format(x) {
      return format(x);
    },
    formatLong(x) {
      return formatLong(x);
    },
    getMult(i, j) {
      return getMult(i, j);
    },
    getPrestigeGain(x) {
      return getPrestigeGain(x);
    },
    buyIncrementaliUpgrade(i) {
      return buyIncrementaliUpgrade(i);
    },
    maxAllIncrementaliUpgrades() {
      return maxAllIncrementaliUpgrades();
    },
    getIncrementaliEffect() {
      return getIncrementaliEffect();
    },
    getIncrementaliUpgradeEffect(i) {
      return getIncrementaliUpgradeEffect(i);
    },
    getSingularityPowerCap() {
      return getSingularityPowerCap();
    },
    toggleAutoMaxAll(i) {
      if (i < player.generators.length - 2) {
        player.generators[i].autoMaxAll = !player.generators[i].autoMaxAll;
      }
    },
    togglePrestigeGain(i) {
      if (i < player.generators.length - 3) {
        player.generators[i].prestigeGain = !player.generators[i].prestigeGain;
      }
    },
    toggleDisplay(i) {
      player.generators[i].display = !player.generators[i].display;
    },
    toggleMetaDisplay() {
      player.metaDisplay = !player.metaDisplay;
    }
  }
})
