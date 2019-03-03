let buyEpsilon = new Decimal(1e-20);

function safeSubtract(i, j) {
  let oldAmount = player.generators[i].prestigeAmount;
  player.generators[i].prestigeAmount = oldAmount.minus(j);
  // 1e(1 million) is a lot
  if (oldAmount.exponent >= 1e6) {
    player.generators[i].prestigeAmount = player.generators[i].prestigeAmount.max(oldAmount.times(buyEpsilon));
  }
}

function buyGenerator(i, j) {
  let g = player.generators[i].list[j];
  if (g.cost.gt(player.generators[i].prestigeAmount)) return false;
  if (player.generators[i].list.length === j + 1 && !isLiquified(i)) initializeGenerator(i);
  safeSubtract(i, g.cost);
  g.cost = g.cost.times(Decimal.pow(10, Math.pow(2, j)));
  g.mult = g.mult.times(2);
  g.amount = g.amount.plus(1);
  g.bought += 1;
  return true;
}

function buyMaxGenerator(i, j) {
  // If we take the log of (money / cost) with base costIncrease,
  // then floor, and call that x, we can buy at most x + 1
  // and at fewest x.
  let money = player.generators[i].prestigeAmount;
  let g = player.generators[i].list[j];
  let costIncreaseLog = Math.pow(2, j);
  let costIncrease = Decimal.pow(10, costIncreaseLog);
  let x = Math.floor(money.div(g.cost).log(10) / costIncreaseLog);
  // We're not going to buy any.
  if (x < 0) return;
  // We have to initialize the next generator.
  if (x > 0 && player.generators[i].list.length === j + 1 && !isLiquified(i)) initializeGenerator(i);
  let totalCost = g.cost.times(costIncrease.pow(x).minus(1).div(costIncrease.minus(1)));
  safeSubtract(i, totalCost);
  g.cost = g.cost.times(Decimal.pow(10, x * Math.pow(2, j)));
  g.mult = g.mult.times(Decimal.pow(2, x));
  g.amount = g.amount.plus(x);
  g.bought += x;
  // In case we need to buy one more.
  buyGenerator(i, j);
}

function maxAll(i) {
  if (i < player.generators.length - 1) {
    for (let j = 0; j < player.generators[i].list.length; j++) {
      buyMaxGenerator(i, j);
    }
  }
}
