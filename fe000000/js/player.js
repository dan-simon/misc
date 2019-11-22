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
  breakInfinity: false,
  options: {
    notation: 'Scientific',
    offlineProgress: true,
    hotkeys: true,
  },
  stats: {
    totalStarsProduced: new Decimal(0),
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
    lastTenInfinities: [
      [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
      [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
      [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
      [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
      [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
    ],
  },
  currentTab: 'main',
  version: 1.40625,
}

let player;
