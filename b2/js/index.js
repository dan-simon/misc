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
        resetTier(i);
      }
      partialResetTier(i + 1);
    },
    buyGenerator(i, j) {
      let g = player.generators[i].list[j];
      if (g.cost.gt(player.generators[i].prestigeAmount)) return false;
      if (player.generators[i].list.length === j + 1) initializeGenerator(i);
      player.generators[i].prestigeAmount = player.generators[i].prestigeAmount.minus(g.cost);
      g.cost = g.cost.times(Decimal.pow(10, Math.round((j + 1) * (j + 2) / 2)));
      g.mult = g.mult.times(2);
      g.amount = g.amount.plus(1);
      g.bought += 1;
      return true;
    },
    buyMaxGenerator(i, j) {
      while (this.buyGenerator(i, j)) {
        continue;
      }
    },
    maxAll(i) {
      for (let j = 0; j < player.generators[i].list.length; j++) {
        this.buyMaxGenerator(i, j);
      }
    },
    format(x) {
      return format(x);
    },
    getMult(i, j) {
      return getMult(i, j);
    },
    getPrestigeGain(x) {
      return getPrestigeGain(x);
    }
  }
})
