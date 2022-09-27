let MaxAll = {
  anythingToBuy() {
    return Boost.canBuy() || Generators.list.some(x => x.canBuy());
  },
  maxAll(types, singles) {
    if (types === undefined) {
      types = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }
    if (singles === undefined) {
      singles = [];
    }
    let bought = generalHighestSweep(() => Generators.highest(), types);
    if (types.includes(9)) {
      if (singles.includes(9)) {
        Boost.buy();
      } else {
        Boost.buyMax();
      }
    }
    let typesMultiple = types.filter(x => x <= 8 && !singles.includes(x));
    let typesSingle = types.filter(x => x <= 8 && singles.includes(x) && !bought.includes(x));
    for (let i of typesSingle) {
      Generator(i).buy();
    }
    generalMaxAll(typesMultiple.map(x => Generator(x)), Stars);
  }
}

let generalHighestSweep = function (highestGetter, allowed) {
  let bought = [];
  while (true) {
    let h = highestGetter();
    if (h && allowed.includes(h.tier()) && h.canBuy()) {
      h.buy();
      bought.push(h.tier());
    } else {
      return bought;
    }
  }
}

let generalMaxAll = function (things, currency) {
  if (things.every(i => !(i.isSpecial && i.isSpecial()))) {
    generalMaxAllFast(things, currency);
    return;
  }
  let safetyMargin = 1e-6;
  things.forEach(x => x.buyMax(1 / (2 * things.length)));
  let bought = 0;
  while (things.some(x => x.canBuy()) && bought < 256) {
    let legalThings = things.filter(x => x.canBuy())
    let minCost = legalThings.map(x => x.cost()).reduce((a, b) => Decimal.min(a, b));
    // Do this multiplication to avoid rounding errors
    // making costs that should be equal unequal.
    // Note: In retrospect, this did not work fully; when raising numbers to powers,
    // the difference becomes greater than this safety margin in many cases.
    // But it doesn't matter much, especially since basically nothing calls this function anymore.
    // I'm increasing the safety margin slightly anyway (it was 1e-10).
    let safeMinCost = Decimal.times(minCost, 1 + safetyMargin);
    let toBuy = legalThings.filter(x => Decimal.lte(x.cost(), safeMinCost))[0];
    // This should always buy at least one, and increase number bought
    // (which are the same thing if you can't buy huge amounts, but diverge if you can).
    toBuy.buy();
    bought += 1;
  }
}

let generalMaxAllFast = function (rawThings, currency) {
  let things = rawThings.filter(x => x.isGenerallyBuyable());
  if (things.length === 0 || Decimal.eq(currency.amount(), 0)) {
    return;
  }
  let starts = things.map(x => x.newAutobuyerStart + x.bought() * x.newAutobuyerScale);
  let scales = things.map(x => x.newAutobuyerScale);
  let caps = things.map(x => x.newAutobuyerCapLoc);
  let len = things.length;
  let sx = Math.floor(Decimal.log2(currency.amount())) - 4;
  let purchases = range(0, len - 1).map(i => Math.max(0, Math.floor((Math.min(caps[i], sx) - starts[i]) / scales[i]) + 1));
  let costs = range(0, len - 1).map(i => Math.pow(2, starts[i] + purchases[i] * scales[i] - sx) /
  (Math.pow(2, scales[i]) - 1) * (1 - Math.pow(2, -purchases[i] * scales[i])));
  // Convert to number, both to round to integer where relevant (not foolproof, but pretty often works)
  // and to fix other potential Decimal/number arithmetic issues.
  let start = Decimal.div(currency.amount(), Decimal.pow(2, sx)).toNumber();
  let left = start;
  for (let i of costs) {
    left -= i;
  }
  for (let j = 1; j <= 4; j++) {
    let c = Math.pow(2, j);
    let x = sx + j;
    for (let i = 0; i < len; i++) {
      if (x >= starts[i] && x <= caps[i] && x % scales[i] === 0) {
        if (left >= c) {
          purchases[i] += 1;
          left -= c;
        } else {
          break;
        }
      }
    }
  }
  things.forEach((thing, i) => thing.buy(purchases[i], true, true));
  currency.safeSubtract(Decimal.times(start - left, Decimal.pow(2, sx)));
}
