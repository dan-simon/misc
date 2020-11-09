let Permanence = {
  getRequiredEternities() {
    return this.getEternitiesPerPermanence().plus(this.getLeftoverEternities());
  },
  getLeftoverEternities() {
    return 16;
  },
  getTotalPermanenceMultiplier() {
    return PermanenceUpgrade(4).effect().times(Complexities.permanenceMultiplier()).times(FinalityShardUpgrade(3).effect());
  },
  getEternitiesPerPermanence() {
    return Decimal.pow(2, 24).div(this.getTotalPermanenceMultiplier());
  },
  conversionText() {
    let eternitiesPer = this.getEternitiesPerPermanence();
    if (eternitiesPer.gt(1)) {
      return formatInt(1) + ' permanence per ' + format(eternitiesPer) + ' eternities';
    } else {
      return format(Decimal.div(1, eternitiesPer)) + ' permanence per eternity';
    }
  },
  canGainPermanence() {
    return EternityProducer.isUnlocked() && Eternities.amount().gte(this.getRequiredEternities());
  },
  permanenceGain() {
    if (!this.canGainPermanence()) {
      return new Decimal(0);
    }
    return Eternities.amount().minus(this.getLeftoverEternities()).div(this.getEternitiesPerPermanence());
  },
  hasGainedPermanence() {
    return player.hasGainedPermanence;
  },
  gainPermanence() {
    if (!this.canGainPermanence()) return;
    player.hasGainedPermanence = true;
    let gain = this.permanenceGain();
    player.stats.lastPermanenceGain = gain;
    player.stats.timeSincePermanenceGain = 0;
    this.add(gain);
    Eternities.setAmount(this.getLeftoverEternities());
  },
  amount() {
    return player.permanence;
  },
  add(x) {
    player.permanence = player.permanence.plus(x);
  },
  anythingToBuy() {
    return PermanenceUpgrades.list.some(x => x.canBuy());
  },
  maxAll() {
    this.buyMaxOf([1, 2, 3, 4])
  },
  buyMaxOf(ids) {
    let list = ids.map(x => PermanenceUpgrades.list[x - 1]);
    // Buying short of max
    list.forEach(x => x.buyShortOfMax(3));
    while (list.some(x => x.canBuy())) {
      // We copy it so that sorting doesn't rearrange the list, which would be a subtle source of bugs
      // (letting current costs influence future buy order even after costs change).
      // Note: This nonly buys in the expected order if sort is stable.
      [...list].sort((x, y) => x.bought() - y.bought())[0].buy();
    }
  }
}
