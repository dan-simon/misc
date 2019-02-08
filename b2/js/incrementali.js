function getIncrementaliEffect() {
  return Decimal.pow(player.incrementali.currencyAmount, getIncrementaliUpgradeEffect(1));
}

function getIncrementaliUpgradeEffect(i) {
  let amount = getIncrementaliUpgradeAmount(i);
  if (i === 0) {
    return Math.pow(1.2, amount) / 100;
  } else if (i === 1) {
    return Math.pow(1.2, amount);
  } else if (i === 2) {
    return Math.pow(Math.log10(player.incrementali.currencyAmount) + 1, amount) * Math.pow(player.incrementali.currencyAmount, 0.25 - 0.25 * Math.pow(0.9, amount));
  }
}

function getIncrementaliUpgradeAmount(i) {
  return player.incrementali.upgrades[i] + player.incrementali.galaxies;
}

function buyIncrementaliUpgrade(i) {
  if (player.incrementali.costs[i] > player.singularity.currencyAmount) {
    return false;
  }
  player.singularity.currencyAmount -= player.incrementali.costs[i];
  player.incrementali.costs[i] *= player.incrementali.costIncreases[i];
  player.incrementali.upgrades[i]++;
  return true;
}

function getSingularityPowerCap() {
  return 1.069 - 0.009 * Math.pow(0.95, player.incrementali.galaxies);
}

function incrementaliTick(diff) {
  player.incrementali.currencyAmount += getIncrementaliUpgradeEffect(0) * diff;
  while (player.incrementali.nextGalaxy <= player.incrementali.currencyAmount) {
    player.incrementali.galaxies++;
    player.incrementali.nextGalaxy *= 100;
  }
}
