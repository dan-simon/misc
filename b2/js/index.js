var app = new Vue({
  el: "#app",
  data: {
    player: player
  },
  methods: {
    prestige(i) {
      if (player.generators[i].prestigeAmount.lt(prestigeThreshold)) {
        return false;
      }
      if (player.generators.length === i + 1) {
        initializeTier();
      }
      player.generators[i + 1].prestigeAmount = player.generators[i + 1].prestigeAmount.plus(
        getPrestigeGain(player.generators[i].prestigeAmount));
      for (let k = 0; k <= i; k++) {
        resetTier(k);
      }
      partialResetTier(i + 1);
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
    }
  }
})
