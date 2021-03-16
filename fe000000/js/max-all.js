let MaxAll = {
  anythingToBuy() {
    return Boost.canBuy() || Generators.list.some(x => x.canBuy());
  },
  maxAll(types) {
    if (types === undefined) {
      types = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }
    generalHighestSweep(() => Generators.highest(), types);
    if (types.includes(9)) {
      Boost.buyMax();
    }
    generalMaxAll(types.filter(x => x <= 8).map(x => Generator(x)));
  },
  maxAllGenerators() {
    this.maxAll([1, 2, 3, 4, 5, 6, 7, 8]);
  }
}

let generalHighestSweep = function (highestGetter, allowed) {
  while (true) {
    let h = highestGetter();
    if (h && allowed.includes(h.tier()) && h.canBuy()) {
      h.buy();
    } else {
      break;
    }
  }
}

let generalMaxAll = function (things) {
  things.forEach(x => x.buyMax(1 / (2 * things.length)));
  let bought = 0;
  while (things.some(x => x.canBuy()) && bought < 256) {
    let legalThings = things.filter(x => x.canBuy())
    let minCost = legalThings.map(x => x.cost()).reduce((a, b) => Decimal.min(a, b));
    let toBuy = legalThings.filter(x => Decimal.eq(x.cost(), minCost))[0];
    toBuy.buy();
    bought += 1;
  }
  if (!window.a) {
    window.a = {};
  }
  window.a[things.length + ',' + bought] = (window.a[things.length + ',' + bought] || 0) + 1;
}
