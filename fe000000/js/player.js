function initialGenerators() {
  return [...Array(8)].map(_ => ({amount: new Decimal(0), bought: 0}));
}

let initialPlayer = {
  stars: new Decimal(2),
  boost: {bought: 0},
  generators: initialGenerators(),
  highestGenerator: 0,
  prestigePower: new Decimal(0),
  options: {
    notation: 'Hex',
    offlineProgress: true,
    hotkeys: true,
  },
  currentTab: 'main',
  version: 1,
}

let player;
