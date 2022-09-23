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
  hasPassiveProduction() {
    return FinalityMilestones.isFinalityMilestoneActive(5);
  },
  productionPerSecondText() {
    let template;
    let perSecond;
    if (this.hasPassiveProduction()) {
      template = 'You get * from Finality Milestone ' + formatInt(5) + '.';
      perSecond = this.permanenceGain();
    } else {
      template = 'Your eternity generation rate translates to *.';
      perSecond = EternityProducer.productionPerSecond().div(this.getEternitiesPerPermanence());
    }
    let perSecondText;
    if (perSecond.gte(1) || perSecond.eq(0)) {
      perSecondText = format(perSecond) + ' permanence per second';
    } else {
      // Note that perSecond can't ever be small enough for this to convert a Decimal
      // to Infinity without being actually 0 (it's not even close;
      // perSecond's minimum is something like 1e-7).
      perSecondText = formatInt(1) + ' permanence per ' + formatTime(Decimal.div(1, perSecond).toNumber(),
        {seconds: {f: formatTimeNum, s: false}, larger: {f: formatTimeNum, s: false}});
    }
    return template.replace('*', perSecondText);
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
  safeSubtract(x) {
    player.permanence = player.permanence.safeMinus(x);
  },
  anythingToBuy() {
    return PermanenceUpgrades.list.some(x => x.canBuy());
  },
  maxAll() {
    this.buyMaxOf([1, 2, 3, 4])
  },
  buyMaxOf(ids) {
    let list = ids.map(x => PermanenceUpgrades.list[x - 1]);
    generalMaxAll(list, Permanence);
  }
}
