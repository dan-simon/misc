const prestigeThreshold = Decimal.pow(10, 24);

function getPrestigeGain (x) {
  x = x.max(1e3);
  let steps = x.log(prestigeThreshold) - 1;
  let gens = Math.log2(x.log(10));
  let pow = 9.5 * steps / gens;
  return Decimal.floor(Decimal.pow(10, pow));
}

function getCurrencyEffect (i) {
  return player.generators[i].currencyAmount;
}

function getMult (i, j) {
  let x = (player.generators.length === i + 1) ? new Decimal(1) : getCurrencyEffect(i + 1);
  return player.generators[i].list[j].mult.times(x);
}

function initializeTier () {
  player.generators.push(getInitialTier(player.generators.length));
}

function resetTier (i) {
  player.generators[i] = getInitialTier(i);
}

function partialResetTier (i) {
  player.generators[i].currencyAmount = new Decimal(1);
  for (let j = 0; j < player.generators[i].list.length; j++) {
    player.generators[i].list[j].amount = new Decimal(player.generators[i].list[j].bought);
  }
}

function getInitialTier (i) {
  let r = {
    prestigeAmount: (i === 0) ? new Decimal(1) : new Decimal(0),
    prestigeName: getPrestigeCurrencyName(i),
    nextPrestigeName: getPrestigeCurrencyName(i + 1),
    list: [getInitialGenerator(i, 0)]
  }
  if (i !== 0) {
    r.currencyAmount = new Decimal(1);
    r.currencyName = getProducedCurrencyName(i);
  }
  return r;
}

function initializeGenerator (i) {
  player.generators[i].list.push(getInitialGenerator(i, player.generators[i].list.length));
}

function getInitialGenerator (i, j) {
  return {
    cost: Decimal.pow(10, (j === 0) ? 0 : Math.pow(2, j)),
    mult: new Decimal(1),
    amount: new Decimal(0),
    bought: 0,
    generatorName: ((i === 0) ? '' : (getPrestigeName(i, title=true))) + ' Dimension ' + (j + 1)
  }
}

let prestiges = ['Infinity', 'Eternity', 'Quantum', 'Reality'];

function getPrestigeCurrencyName (i) {
  if (i === 0) {
    return 'money';
  } else {
    return getPrestigeName(i) + ' points';
  }
}

function getProducedCurrencyName (i) {
  return getPrestigeName(i) + ' power';
}

function getPrestigeName (i, title=false) {
  let main = prestiges[(i + 3) % 4];
  let metaLevel = Math.floor((i - 1) / 4);
  let r;
  if (metaLevel === 0) {
    r = main;
  } else if (metaLevel === 1) {
    r = 'Meta-' + main;
  } else {
    r = 'Meta^' + metaLevel + '-' + main;
  }
  if (!title) {
    r = r.toLowerCase();
  }
  return r;
}

let player = {lastUpdate: Date.now(), generators: []}

initializeTier();
