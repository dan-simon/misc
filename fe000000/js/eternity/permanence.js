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
    // We don't use Permanence.getRequiredEternities() since that's often rounded to
    // the leftover eternities with good enough conversion.
    return EternityProducer.isUnlocked() && Eternities.amount().minus(this.getLeftoverEternities()).gte(this.getEternitiesPerPermanence());
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
  gainPermanenceConfirmationMessage() {
    return 'Are you sure you want to gain ' + format(Permanence.permanenceGain()) +
    ' permanence? You will lose all but ' + formatInt(Permanence.getLeftoverEternities()) +
    ' eternities, but you will not lose anything else.';
  },
  gainPermanence(manual) {
    if (!this.canGainPermanence()) return;
    if (manual && Options.confirmation('permanence') && !confirm(this.gainPermanenceConfirmationMessage())) return;
    Achievements.checkForAchievements('permanence');
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
    generalMaxAll(list);
  }
}
