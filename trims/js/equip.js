let Equip = {
  amount(x, shrinkLevel) {
    return player.equip[x][shrinkLevel] || 0;
  },
  space(x, shrinkLevel) {
    return this.baseSpace(x) * Math.pow(this.shrinkRatio(x), shrinkLevel);
  },
  spaceDisplay(x, shrinkLevel) {
    let space = this.space(x, shrinkLevel);
    if (space >= 0.1) {
      return formatMaybeInt(space) + ' space per';
    } else {
      return formatMaybeInt(1 / space) + ' per ' + formatInt(1) + ' space';
    }
  },
  totalSpaceOfEquip(x) {
    return player.equip[x].map((n, i) => n * this.space(x, i)).reduce((a, b) => a + b, 0);
  },
  totalSpaceOfType(x) {
    return this.allOfType(x).map(y => this.totalSpaceOfEquip(y)).reduce((a, b) => a + b);
  },
  fractionSpaceOfType(x) {
    return this.totalSpaceOfType(x) / this.spacePerType();
  },
  spacePerType() {
    return 10;
  },
  totalResourceProvidedOfEquip(x) {
    return this.resourceProvided(x) * player.equip[x].reduce((a, b) => a + b, 0);
  },
  totalResourceProvidedOfType(x) {
    return this.allOfType(x).map(y => this.totalResourceProvidedOfEquip(y)).reduce((a, b) => a + b);
  },
  totalCost(x, shrinkLevel) {
    return this.baseCost(x) * Math.pow(this.shrinkCostIncrease(x), shrinkLevel);;
  },
  shrinkCost(x, shrinkLevel) {
    return this.totalCost(x, shrinkLevel) - this.totalCost(x, shrinkLevel - 1);
  },
  costForAll(x, shrinkLevel) {
    return this.buildAmount(x, shrinkLevel) * this.totalCost(x, shrinkLevel);
  },
  costForAllDisplay(x, shrinkLevel) {
    return Math.max(1, this.buildAmount(x, shrinkLevel)) * this.totalCost(x, shrinkLevel);
  },
  rawBuildAmount() {
    return Options.buildAmount();
  },
  buildAmount(x, shrinkLevel) {
    return Math.floor(Math.min(
      this.rawBuildAmount(),
      Stuff.amount() / this.totalCost(x, shrinkLevel),
      (this.spacePerType() - this.totalSpaceOfType(this.type(x))) / this.space(x, shrinkLevel),
    ));
  },
  build(x, shrinkLevel) {
    while (player.equip[x].length <= shrinkLevel) {
      player.equip[x].push(0);
    }
    let build = this.buildAmount(x, shrinkLevel);
    player.stuff -= this.costForAll(x, shrinkLevel);
    player.equip[x][shrinkLevel] += build;
  },
  type(x) {
    return {
      'trap': 'trap',
      'tent': 'housing',
      'cottage': 'housing',
      'villa': 'housing',
      'castle': 'housing',
      'dart': 'weapon',
      'arrow': 'weapon',
      'cannon': 'weapon',
      'unicimhorn': 'weapon',
      'tshirt': 'armor'
    }[x];
  },
  allOfType(x) {
    return {
      'trap': ['trap'],
      'housing': ['tent', 'cottage', 'villa', 'castle'],
      'weapon': ['dart', 'arrow', 'cannon', 'unicimhorn'],
      'armor': ['tshirt']
    }[x];
  },
  baseSpace(x) {
    return {
      'trap': 1,
      'tent': 1,
      'cottage': 2,
      'villa': 3,
      'castle': 4,
      'dart': 1,
      'arrow': 2,
      'cannon': 3,
      'unicimhorn': 4,
      'tshirt': 1
    }[x];
  },
  baseCost(x) {
    return {
      'trap': 10,
      'tent': 1000,
      'cottage': 1e4,
      'villa': 1e5,
      'castle': 1e6,
      'dart': 1000,
      'arrow': 1e4,
      'cannon': 1e5,
      'unicimhorn': 1e6,
      'tshirt': 1000
    }[x];
  },
  resourceProvided(x) {
    return {
      'tent': 3,
      'cottage': 10,
      'villa': 100,
      'castle': 1000,
      'dart': 3,
      'arrow': 10,
      'cannon': 100,
      'unicimhorn': 1000,
      'tshirt': 15
    }[x];
  },
  shrinkRatio(x) {
    return {
      'trap': 0.5,
      'tent': 0.4,
      'cottage': 0.5,
      'villa': 0.6,
      'castle': 0.7,
      'dart': 0.4,
      'arrow': 0.5,
      'cannon': 0.6,
      'unicimhorn': 0.7,
      'tshirt': 0.4
    }[x];
  },
  shrinkCostIncrease(x) {
    return 4;
  }
}
