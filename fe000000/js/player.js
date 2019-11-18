function initialGenerators() {
  return [...Array(8)].map(_ => ({amount: new Decimal(0), bought: 0}));
}

function initialInfinityGenerators() {
  return [...Array(8)].map(_ => ({amount: new Decimal(0), bought: 0}));
}

let initialPlayer = {
  stars: new Decimal(2),
  boost: {bought: 0},
  generators: initialGenerators(),
  highestGenerator: 0,
  prestigePower: new Decimal(1),
  infinityPoints: new Decimal(0),
  infinities: 0,
  infinityStars: new Decimal(1),
  infinityGenerators: initialInfinityGenerators(),
  highestInfinityGenerator: 0,
  infinityUpgrades: [0, 0],
  options: {
    notation: 'Scientific',
    offlineProgress: true,
    hotkeys: true,
  },
  currentTab: 'main',
  version: 1.25,
}

let player;
