// Leave only 8 tiers unliquified.
function isLiquified(i) {
  return i < player.generators.length - 8;
}

function getEffectiveLayers(i) {
  return 1 + Math.log2(player.generators[i].prestigeAmount.max(10).log(10));
}

function getLiquifiedMult(i) {
  let c = getEffectiveLayers(i);
  return player.generators[i].list[0].mult.pow(2).times(getBoost(i).pow(c)).times(getIncrementaliEffect().pow(c)).pow(getSingularityPowerEffect()).pow(1.0001);
}
