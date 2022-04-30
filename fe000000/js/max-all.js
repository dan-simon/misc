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
    generalMaxAll(typesMultiple.map(x => Generator(x)));
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

let generalMaxAll = function (things) {
  let safetyMargin = 1e-10;
  things.forEach(x => x.buyMax(1 / (2 * things.length)));
  let bought = 0;
  while (things.some(x => x.canBuy()) && bought < 256) {
    let legalThings = things.filter(x => x.canBuy())
    let minCost = legalThings.map(x => x.cost()).reduce((a, b) => Decimal.min(a, b));
    // Do this multiplication to avoid rounding errors
    // making costs that should be equal unequal.
    let safeMinCost = Decimal.times(minCost, 1 + safetyMargin);
    let toBuy = legalThings.filter(x => Decimal.lte(x.cost(), safeMinCost))[0];
    // This should always buy at least one, and increase number bought
    // (which are the same thing if you can't buy huge amounts, but diverge if you can).
    toBuy.buy();
    bought += 1;
  }
}
