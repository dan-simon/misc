function initialGenerators() {
  return [...Array(8)].map(_ => ({amount: new Decimal(0), bought: 0}));
}

function initialInfinityGenerators() {
  return [...Array(8)].map(_ => ({amount: new Decimal(0), bought: 0}));
}

function initialEternityGenerators() {
  return [...Array(8)].map(_ => ({amount: new Decimal(0), bought: 0}));
}

function initialAutobuyers() {
  return [
    {isOn: true, mode: 'Buy max', priority: 1}, {isOn: true, mode: 'Buy max', priority: 2},
    {isOn: true, mode: 'Buy max', priority: 3}, {isOn: true, mode: 'Buy max', priority: 4},
    {isOn: true, mode: 'Buy max', priority: 5}, {isOn: true, mode: 'Buy max', priority: 6},
    {isOn: true, mode: 'Buy max', priority: 7}, {isOn: true, mode: 'Buy max', priority: 8},
    {isOn: true, mode: 'Buy max', priority: 9}, {isOn: true, mode: 'Multiplier', priority: new Decimal(2)},
    {isOn: true, mode: 'Multiplier', priority: new Decimal(2)}, {isOn: true, mode: 'Amount', priority: new Decimal(2)},
    {isOn: true, mode: 'Amount', priority: new Decimal(2)},
  ];
}

function initialLastTenInfinities() {
  return [
    [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
    [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
    [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
    [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
    [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
  ];
}

function initialLastTenEternities() {
  return [
    [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
    [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
    [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
    [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
    [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
  ];
}

let initialPlayer = {
  stars: new Decimal(2),
  boost: {bought: 0},
  boostPower: 1,
  bestBoostPowerEver: 1,
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
  slowAutobuyers: [
    false, false, false, false, false, false, false, false, false,
  ],
  slowAutobuyersTimer: 0,
  fastAutobuyersTimer: 0,
  autobuyersTimerLength: 0,
  currentInfinityChallenge: 0,
  infinityChallengesCompleted: [
    false, false, false, false, false, false, false, false,
  ],
  breakInfinity: false,
  autobuyers: initialAutobuyers(),
  eternityPoints: new Decimal(0),
  eternities: 0,
  eternityStars: new Decimal(2),
  eternityGenerators: initialEternityGenerators(),
  highestEternityGenerator: 0,
  eternityUpgrades: [0, 0, 0],
  eternityMilestonesOn: [true, true],
  infinityAutobuyers: [
    true, true, true, true, true, true, true, true, true, true,
  ],
  boughtTheorems: [0, 0, 0],
  unspentTheorems: 0,
  studies: [
    false, false, false, false, false, false,
    false, false, false, false, false, false,
    0, 0, 0, 0
  ],
  eternityProducer: {
    unlocked: false,
    upgrades: [0, 0]
  },
  unlockedEternityChallenge: 0,
  currentEternityChallenge: 0,
  eternityChallengeCompletions: [0, 0, 0, 0, 0, 0, 0, 0],
  respecEternityChallenge: false,
  permanence: 0,
  permanenceUpgrades: [0, 0, 0, 0],
  hasGainedPermanence: false,
  chroma: {
    colors: [0, 0, 0, 0, 0, 0],
    unlocked: [false, false, false, false, false, false],
    current: 0,
    next: 0
  },
  options: {
    notation: 'Scientific',
    offlineProgress: true,
    hotkeys: true,
  },
  stats: {
    totalStarsProduced: new Decimal(0),
    totalStarsProducedThisEternity: new Decimal(0),
    totalIPProduced: new Decimal(0),
    totalIPProducedThisEternity: new Decimal(0),
    totalEPProduced: new Decimal(0),
    timeSincePurchase: 0,
    timeSinceSacrifice: 0,
    timeSincePrestige: 0,
    timeSinceInfinity: 0,
    timeSinceEternity: 0,
    timeSinceGameStart: 0,
    timeSinceLastPeakIPPerSec: Math.pow(2, 256),
    timeSinceLastPeakEPPerSec: Math.pow(2, 256),
    fastestInfinity: Math.pow(2, 256),
    fastestEternity: Math.pow(2, 256),
    peakIPPerSec: new Decimal(0),
    peakEPPerSec: new Decimal(0),
    purchasesThisInfinity: 0,
    purchasesThisInfinityByType: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    prestigesThisInfinity: 0,
    lastTenInfinities: initialLastTenInfinities(),
    lastTenEternities: initialLastTenEternities()
  },
  cheats: {
    gameSpeed: 1,
  },
  currentTab: 'main',
  version: 1.6875
}

let player;
