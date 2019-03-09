function initialIncrementali() {
  return {
    unlocked: false,
    currencyAmount: 1,
    galaxies: 0,
    nextGalaxy: 100,
    costs: [new Decimal(1e24), new Decimal(1e27), new Decimal(1e30),
      new Decimal(1e32), new Decimal(1e34)],
    upgrades: [0, 0, 0, 0, 0],
    costIncreases: [10, 1e3, 1e5, 1e6, 1e8]
  };
}

function getIncrementaliEffect() {
  return Decimal.pow(player.incrementali.currencyAmount, getIncrementaliUpgradeEffect(1));
}

function getIncrementaliUpgradeEffect(i) {
  let amount = getIncrementaliUpgradeAmount(i);
  if (i === 0) {
    return Math.pow(getIncrementaliUpgradeEffect(3), amount) / 100;
  } else if (i === 1) {
    return Math.pow(getIncrementaliUpgradeEffect(4), amount);
  } else if (i === 2) {
    return Decimal.pow(Math.log10(player.incrementali.currencyAmount) + 1, amount).times(Decimal.pow(player.incrementali.currencyAmount, 0.25 - 0.25 * Math.pow(0.9, amount)));
  } else if (i === 3) {
    return 1.3 - 0.1 * Math.pow(0.8, amount * Math.log10(player.incrementali.currencyAmount));
  } else if (i === 4) {
    return 1.3 - 0.1 * Math.pow(0.8, amount * player.incrementali.galaxies);
  }
}

function getIncrementaliUpgradeAmount(i) {
  return player.incrementali.upgrades[i] + player.incrementali.galaxies;
}

function buyIncrementaliUpgrade(i) {
  if (player.incrementali.costs[i].gte(player.singularity.currencyAmount)) {
    return false;
  }
  player.singularity.currencyAmount = player.singularity.currencyAmount.minus(player.incrementali.costs[i]);
  player.incrementali.costs[i] = player.incrementali.costs[i].times(player.incrementali.costIncreases[i]);
  player.incrementali.upgrades[i]++;
  if (i === 1) {
    player.incrementali.costIncreases[i] = Math.pow(10, 3 + Math.floor(player.incrementali.upgrades[i] / 15));
  }
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
