function initialGenerators() {
  return [...Array(8)].map(_ => ({amount: new Decimal(0), bought: 0}));
}

function initialInfinityGenerators() {
  return [...Array(8)].map(_ => ({amount: new Decimal(0), bought: 0}));
}

function initialAutobuyers() {
  return [
    {on: false, mode: 'Buy singles', priority: 1}, {on: false, mode: 'Buy singles', priority: 2},
    {on: false, mode: 'Buy singles', priority: 3}, {on: false, mode: 'Buy singles', priority: 4},
    {on: false, mode: 'Buy singles', priority: 5}, {on: false, mode: 'Buy singles', priority: 6},
    {on: false, mode: 'Buy singles', priority: 7}, {on: false, mode: 'Buy singles', priority: 8},
    {on: false, mode: 'Buy singles', priority: 9}, {on: false, mode: 'Multiplier', priority: new Decimal(2)},
    {on: false, mode: 'Multiplier', priority: new Decimal(2)}, {on: false, mode: 'Amount', priority: new Decimal(2)},
  ];
}

let initialPlayer = {
  stars: new Decimal(2),
  boost: {bought: 0},
  generators: initialGenerators(),
  highestGenerator: 0,
  sacrificeMultiplier: new Decimal(1),
  prestigePower: new Decimal(1),
  infinityPoints: new Decimal(0),
  infinities: 0,
  infinityStars: new Decimal(1),
  infinityGenerators: initialInfinityGenerators(),
  highestInfinityGenerator: 0,
  infinityUpgrades: [0, 0],
  currentChallenge: 0,
  challengesCompleted: [
    false, false, false, false, false, false,
    false, false, false, false, false, false,
  ],
  currentInfinityChallenge: 0,
  infinityChallengesCompleted: [
    false, false, false, false, false, false, false, false,
  ],
  breakInfinity: false,
  autobuyers: initialAutobuyers(),
  options: {
    notation: 'Scientific',
    offlineProgress: true,
    hotkeys: true,
  },
  stats: {
    totalStarsProduced: new Decimal(0),
    totalStarsProducedThisEternity: new Decimal(0),
    totalIPProduced: new Decimal(0),
    timeSincePurchase: 0,
    timeSinceSacrifice: 0,
    timeSincePrestige: 0,
    timeSinceInfinity: 0,
    timeSinceGameStart: 0,
    timeSinceLastPeakIPPerSec: Math.pow(2, 256),
    fastestInfinity: Math.pow(2, 256),
    peakIPPerSec: new Decimal(0),
    purchasesThisInfinity: 0,
    prestigesThisInfinity: 0,
    lastTenInfinities: [
      [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
      [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
      [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
      [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
      [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
    ],
  },
  cheats: {
    gameSpeed: 1,
  },
  currentTab: 'main',
  version: 1.4609375,
}

let player;
