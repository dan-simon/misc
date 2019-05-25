function initialIncrementali() {
  return {
    unlocked: false,
    currencyAmount: new Decimal(1),
    galaxies: 0,
    nextGalaxy: new Decimal(100),
    costs: [new Decimal(1e24), new Decimal(1e27), new Decimal(1e30),
      new Decimal(1e32), new Decimal(1e34)],
    upgrades: [0, 0, 0, 0, 0],
    initialCostIncreases: [10, 1e3, 1e5, 1e6, 1e8],
    costIncreases: [10, 1e3, 1e5, 1e6, 1e8]
  };
}

function getIncrementaliEffect() {
  return Decimal.pow(player.incrementali.currencyAmount, getIncrementaliUpgradeEffect(1));
}

function getIncrementaliUpgradeEffect(i) {
  let amount = getIncrementaliUpgradeAmount(i);
  if (i === 0) {
    return Decimal.pow(getIncrementaliUpgradeEffect(3), amount).div(100);
  } else if (i === 1) {
    return Decimal.pow(getIncrementaliUpgradeEffect(4), amount);
  } else if (i === 2) {
    return Decimal.pow(Decimal.log10(player.incrementali.currencyAmount) + 1, amount);
  } else if (i === 3) {
    return 1.2 + 0.1 * Math.log(1 + 0.1 * amount * Decimal.log10(player.incrementali.currencyAmount));
  } else if (i === 4) {
    return 1.2 + 0.1 * Math.log(1 + 0.1 * amount * player.incrementali.galaxies);
  }
}

function getIncrementaliUpgradeAmount(i) {
  var singularityGrowthStart = 600; // in case you want to change when it starts
  return player.incrementali.upgrades[i] + player.incrementali.galaxies + (Math.max(0,(Decimal.log10(player.singularity.currencyAmount)-singularityGrowthStart))**.5/4);
}

function buyIncrementaliUpgrade(i) {
  if (player.incrementali.costs[i].gte(player.singularity.currencyAmount)) {
    return false;
  }
  player.singularity.currencyAmount = player.singularity.currencyAmount.minus(player.incrementali.costs[i]);
  player.incrementali.costs[i] = player.incrementali.costs[i].times(player.incrementali.costIncreases[i]);
  player.incrementali.upgrades[i]++;
  player.incrementali.costIncreases[i] = player.incrementali.initialCostIncreases[i] * Math.pow(10, Math.floor(player.incrementali.upgrades[i] / 15));
  return true;
}

function maxAllIncrementaliUpgrades() {
  for (let i = 0; i < 5; i++) {
    while (buyIncrementaliUpgrade(i)) {};
  }
}

function getSingularityPowerCap() {
  return 1.069 - 0.009 * Math.pow(0.95, player.incrementali.galaxies);
}

function incrementaliTick(diff) {
  player.incrementali.currencyAmount = player.incrementali.currencyAmount.plus(getIncrementaliUpgradeEffect(0).times(diff));
  while (player.incrementali.nextGalaxy.lte(player.incrementali.currencyAmount)) {
    player.incrementali.galaxies++;
    player.incrementali.nextGalaxy = Decimal.pow(100, 1 + Math.pow(player.incrementali.galaxies, 1.2));
  }
}
