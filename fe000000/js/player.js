function initialGenerators() {
  return [...Array(8)].map(_ => ({amount: new Decimal(0), bought: 0}));
}

function initialInfinityGenerators() {
  return [...Array(8)].map(_ => ({amount: new Decimal(0), bought: 0}));
}

function initialEternityGenerators() {
  return [...Array(8)].map(_ => ({amount: new Decimal(0), bought: 0}));
}

function initialComplexityGenerators() {
  return [...Array(8)].map(_ => ({amount: new Decimal(0), bought: 0}));
}

function initialFinalityGenerators() {
  return [...Array(8)].map(_ => ({amount: new Decimal(0), bought: 0}));
}

function initialAutobuyers() {
  return [
    {isOn: true, mode: 'Buy max'}, {isOn: true, mode: 'Buy max'},
    {isOn: true, mode: 'Buy max'}, {isOn: true, mode: 'Buy max'},
    {isOn: true, mode: 'Buy max'}, {isOn: true, mode: 'Buy max'},
    {isOn: true, mode: 'Buy max'}, {isOn: true, mode: 'Buy max'},
    {isOn: true, mode: 'Buy max'}, {isOn: true, mode: 'Multiplier', priority: new Decimal(2)},
    {isOn: true, mode: 'Multiplier', priority: new Decimal(2)},
    {isOn: true, mode: 'Amount', priority: new Decimal(2)}, {isOn: true, mode: 'Amount', priority: new Decimal(2)},
    {isOn: true, mode: 'X times last', priority: new Decimal(2)}, {isOn: false, mode: 'Amount', priority: new Decimal(2)},
    {isOn: true, mode: 'none', priority: 'none'}
  ];
}

function initialStudies() {
  return [
    false, false, false, false, false, false,
    false, false, false, false, false, false,
    0, 0, 0, 0
  ];
}

function initialLastTenInfinities() {
  return [...Array(20)].map(() => [-1, new Decimal(-1), new Decimal(-1), new Decimal(-1)]);
}

function initialLastTenEternities() {
  return [...Array(20)].map(() => [-1, new Decimal(-1), new Decimal(-1), new Decimal(-1)]);
}

function initialLastTenComplexities() {
  return [...Array(20)].map(() => [-1, new Decimal(-1), new Decimal(-1), new Decimal(-1)]);
}

function initialLastTenFinalities() {
  return [...Array(20)].map(() => [-1, new Decimal(-1), -1, new Decimal(-1)]);
}

let initialSeed = RNG.createSeed();

let initialPlayer = {
  stars: new Decimal(2),
  boost: {bought: 0},
  boostPower: 1,
  bestBoostPower: 1,
  highestBoostsBoughtThisEternity: 0,
  highestBoostsBought: 0,
  generators: initialGenerators(),
  highestGenerator: 0,
  sacrificeMultiplier: new Decimal(1),
  prestigePower: new Decimal(1),
  infinityPoints: new Decimal(0),
  infinities: 0,
  realInfinities: 0,
  infinityStars: new Decimal(1),
  infinityGenerators: initialInfinityGenerators(),
  highestInfinityGenerator: 0,
  infinityUpgrades: [0, 0],
  currentChallenge: 0,
  challengesCompleted: [
    false, false, false, false, false, false,
    false, false, false, false, false, false,
  ],
  challengeRestartOnCompletion: false,
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
  infinityChallengeRestartOnCompletion: false,
  breakInfinity: false,
  autobuyers: initialAutobuyers(),
  eternityPoints: new Decimal(0),
  eternities: new Decimal(0),
  eternityStars: new Decimal(2),
  eternityGenerators: initialEternityGenerators(),
  highestEternityGenerator: 0,
  eternityUpgrades: [0, 0, 0],
  eternityMilestonesEnabled: [true, true],
  infinityAutobuyers: [
    true, true, true, true, true, true, true, true, true, true,
  ],
  boughtTheorems: [0, 0, 0],
  extraTheorems: [0, 0, 0, 0],
  studies: initialStudies(),
  studySettings: {
    firstTwelveStudyPurchaseOrder: [],
    respecStudies: false,
    presetRespecStudies: false,
    studyMode: 'Buy',
    studyDisplayCostWhenBought: false,
    boughtTheoremsThisComplexity: false,
    rebuyAfterComplexityChallenge6: true,
    showPresetExplanation: false,
    canBuyStudies: true,
    studiesBeforeLastRespec: initialStudies(),
    firstTwelveStudyPurchaseOrderBeforeLastRespec: []
  },
  presets: [],
  lastPresetIndices: [0, 0, 0, 0, 0],
  eternityProducer: {
    unlocked: false,
    upgrades: [0, 0]
  },
  studyListAutoLoad: {
    studyList: '',
    on: true
  },
  unlockedEternityChallenge: 0,
  currentEternityChallenge: 0,
  eternityChallengeCompletions: [0, 0, 0, 0, 0, 0, 0, 0],
  respecEternityChallenge: false,
  isEternityChallengeRequirementDisplayOn: true,
  autoECCompletion: true,
  usedAutoECCompletionThisComplexity: false,
  permanence: new Decimal(0),
  permanenceUpgrades: [0, 0, 0, 0],
  hasGainedPermanence: false,
  chroma: {
    colors: [0, 0, 0, 0, 0, 0],
    unlocked: [false, false, false, false, false, false],
    current: 0,
    next: 0,
    displayAmount: 0,
    timeForChromaValue: {
      amount: 3584,
      capFraction: 0.875, 
    },
    timeForChromaMode: 'fraction of chroma cap'
  },
  complexityPoints: new Decimal(0),
  complexities: 0,
  complexityStars: new Decimal(2),
  complexityGenerators: initialComplexityGenerators(),
  highestComplexityGenerator: 0,
  complexityChallengeCompletions: [0, 0, 0, 0, 0, 0],
  isComplexityChallengeRunning: [true, true, true, true, true, true],
  complexityChallengeSafeguards: [false, false, false, false, false],
  complexityChallengeLastCompletion: [[-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1]],
  complexityChallengeTimeSpent: [0, 0, 0, 0, 0, 0],
  complexityAchievements: [
    [false, false, false, false],
    [false, false, false, false],
    [false, false, false, false],
    [false, false, false, false]
  ],
  complexityAchievementsEnabled: [true],
  eternityAutobuyers: [
    true, true, true, true, true, true, true, true,
    true, true, true, true, true, true, true, true,
    true, true, true, true,
  ],
  powers: {
    seed: initialSeed,
    initialSeed: initialSeed,
    id: 1,
    unlocked: false,
    upgrades: [0, 0, 0],
    equipped: [],
    stored: [],
    gain: true,
    respec: false,
    presetRespec: false,
    hasGainedShards: false,
    shards: 0,
    shardUpgrades: [0, 0, 0, 0],
    presets: [],
    craft: {
      type: 'normal',
      rarity: 1,
    },
    lastData: {
      lowRarity: false,
      type: 'none'
    }
  },
  powerListAutoLoad: {
    powerList: '',
    on: true
  },
  oracle: {
    unlocked: false,
    isPredicting: false,
    time: 256,
    timeSimulated: 256,
    ticks: 1024,
    ticksSimulated: 1024,
    complexityPoints: new Decimal(0),
    complexityPointGain: new Decimal(0),
    complexityChallengeCompletions: [0, 0, 0, 0, 0, 0],
    originalComplexityChallengeCompletions: [0, 0, 0, 0, 0, 0],
    powerShards: 0,
    originalPowerShards: 0,
    galaxies: 0,
    originalGalaxies: 0,
    finalities: 0,
    originalFinalities: 0,
    finalityShards: 0,
    originalFinalityShards: 0,
    used: false,
    alert: false,
    powerGainInPredictions: 'Same',
    powerDisplay: true,
    powerFutureExtraMultipliers: true,
    equippedPowers: [],
    powers: [],
    extraMultipliers: {
      normal: 1,
      infinity: 1,
      eternity: 1,
      complexity: 1
    }
  },
  galaxies: {
    unlocked: false,
    dilated: 0,
    undilated: 0,
    nextDilatedMode: 'Amount',
    nextDilatedAmount: 0,
    resetNextDilatedOnFinality: true
  },
  finalityPoints: new Decimal(0),
  totalFinalityShards: 0,
  respecFinalityShards: false,
  presetRespecFinalityShards: false,
  finalities: 0,
  finalityStars: new Decimal(1),
  finalityGenerators: initialFinalityGenerators(),
  highestFinalityGenerator: 0,
  finalityShardUpgrades: [0, 0, 0, 0, 0, 0, 0, 0],
  finalityShardUpgradePresets: [],
  complexityAutobuyers: [
    true, true, true, true, true, true, true, true,
    true, true, true, true, true, true, true
  ],
  goals: [
    false, false, false, false, false, false, false, false,
    false, false, false, false, false, false, false, false
  ],
  achievements: {
    table: [
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
    ],
    beyondHighest: 2,
    active: true,
    requirementDescriptions: true,
    showFullyFarRows: true,
    showCompletedRows: true
  },
  displayAllGoals: false,
  showGoalTimes: false,
  goalTimes: [
    [null, null], [null, null], [null, null], [null, null],
    [null, null], [null, null], [null, null], [null, null],
    [null, null], [null, null], [null, null], [null, null],
    [null, null], [null, null], [null, null], [null, null],
  ],
  hasSeenTextBox: {
    'boost-power': false
  },
  isTabVisible: {
    'infinity-challenges': false,
    'eternity-producer': false,
    'eternity-challenges': false,
    'chroma': false,
    'powers': false,
    'oracle': false,
    'galaxies': false,
  },
  isDivVisible: {
    'prestige': false,
    'infinity': false,
    'boost-power': false,
    'softcap': false,
    'hardcap': false,
  },
  tabOptions: {
    'main': true,
    'infinity': true,
    'normal-challenges': true,
    'autobuyers': true,
    'infinity-challenges': true,
    'goals': true,
    'achievements': true,
    'statistics': true,
    'last-ten-runs': true,
    'options': true,
    'eternity': true,
    'eternity-milestones': true,
    'studies': true,
    'eternity-producer': true,
    'eternity-challenges': true,
    'chroma': true,
    'complexity': true,
    'complexity-challenges': true,
    'complexity-achievements': true,
    'powers': true,
    'oracle': true,
    'galaxies': true,
    'finality': true,
    'finality-shards': true,
    'finality-milestones': true,
  },
  colorPresets: [],
  tabPresets: [],
  options: {
    notation: {
      notation: 'Scientific',
      lowerPrecision: 3,
      higherPrecision: 5,
      displayDigits: 10,
      exponentBase: 10,
      alphabet: 'abcdefghijklmnopqrstuvwxyz',
      formatOrdinals: false,
      parseAutobuyersInCurrentBase: false,
      parseInputsInCurrentBase: false,
      inputPrecision: 3
    },
    timeDisplay: 'Seconds',
    notationOnTimes: false,
    offlineProgress: true,
    offlineTicks: 1024,
    hotkeys: true,
    colorChange: 'None',
    completionColors: 'On (gradient)',
    resetColors: true,
    tabColors: true,
    presetHighlightColors: false,
    adjustColors: true,
    colorData: {
      'Dull': {
        'yellow': '',
        'grey': '',
        'purple': '',
        'orange': '',
        'cyan': '',
        'green': '',
        'red': '',
        'magenta': '',
        'brown': '',
        'gold': '',
      },
      'Vibrant': {
        'yellow': '',
        'grey': '',
        'purple': '',
        'orange': '',
        'cyan': '',
        'green': '',
        'red': '',
        'magenta': '',
        'brown': '',
        'gold': '',
      }
    },
    exportCopy: true,
    exportDownload: false,
    exportShow: false,
    exportNotificationFrequency: Math.pow(2, 16),
    theme: {
      background: 'Dark',
      buttonColor: 'Vibrant',
      completionGradients: 'Default',
      edgeGradients: 'Default',
    },
    fitToWidth: true,
    showLog: {
      resetButtons: 'Default',
      lastTen: 'Default'
    },
    showFullOptions: {
      studies: false,
      powers: false,
      finality: false,
    },
    notifications: {
      saveLoad: true,
      achievements: true,
      complexityAchievements: true
    },
    largerCheckboxes: false,
    buttonOutlines: 'None',
    viewAllGenerators: {
      normal: true,
      infinity: false,
      eternity: false,
      complexity: false,
      finality: false,
    },
    viewGeneratorsWhenStarsAtLimit: false,
    maxAllMode: 'Normal generators and boosts',
    showAllTabs: false,
    headerSettings: {
      showCurrentChallenges: true,
      showNextCCCompletion: true,
      showResetButtonsForHiddenTabs: true,
      smallerHeader: false,
    },
    complexityChallengeRunningColors: false,
    exitComplexityChallengesOnComplexity: false,
    news: false,
    optionTypeShown: 'saving',
    autobuyers: {
      areNewlyUnlockedAutobuyersOn: true,
      disableAutobuyersWhenStarting: {
        challenge: false,
        infinityChallenge: false,
      },
      showGeneratorAndBoostAutobuyers: true,
      isOnDespiteSuspended: [false, false, false, false],
    },
    explanations: {
      'autobuyers': '',
      'eternity-milestones': 'main',
      'complexity-challenges': 'main',
      'powers': 'main',
      'options': ''
    }
  },
  confirmations: {
    sacrifice: true,
    prestige: true,
    infinity: true,
    eternity: true,
    permanence: true,
    complexity: true,
    complexityReset: true,
    finality: true,
    singleStudyRefund: true,
    studiesRespec: true,
    eternityChallengeRespec: true,
    complexityChallengeEntering: true,
    powerDeletionMode: 'Confirmation',
    powerUnequipMode: 'Confirmation',
    powersUnequip: true,
    finalityShardUpgradesRespec: true,
    presetChange: true,
    presetDeletion: true,
  },
  stats: {
    totalStarsProduced: new Decimal(0),
    bestStarsThisSacrifice: new Decimal(2),
    bestStarsThisPrestige: new Decimal(2),
    bestStarsThisInfinity: new Decimal(2),
    totalStarsProducedThisEternity: new Decimal(0),
    totalStarsProducedThisComplexity: new Decimal(0),
    totalStarsProducedThisFinality: new Decimal(0),
    totalIPProduced: new Decimal(0),
    totalIPProducedThisEternity: new Decimal(0),
    totalInfinityStarsProducedThisFinality: new Decimal(0),
    totalEPProduced: new Decimal(0),
    totalEPProducedThisComplexity: new Decimal(0),
    totalEternitiesProducedThisComplexity: new Decimal(0),
    totalEternityStarsProducedThisFinality: new Decimal(0),
    totalCPProduced: new Decimal(0),
    totalCPProducedThisFinality: new Decimal(0),
    totalComplexityStarsProducedThisFinality: new Decimal(0),
    totalFPProduced: new Decimal(0),
    timeSincePurchase: 0,
    timeSinceSacrifice: 0,
    timeSincePrestige: 0,
    timeSinceInfinity: 0,
    timeSinceEternity: 0,
    timeSinceComplexity: 0,
    timeSinceFinality: 0,
    timeSinceAutoECCompletion: 0,
    timeSincePermanenceGain: 0,
    timeSincePowerGain: 0,
    timeSinceOraclePrediction: 0,
    timeSinceGameStart: 0,
    timeSinceExport: 0,
    timeSinceLastPeakIPPerSec: Math.pow(2, 256),
    timeSinceLastPeakEPPerSec: Math.pow(2, 256),
    timeSinceLastPeakCPPerSec: Math.pow(2, 256),
    timeSinceLastPeakLogIPPerSec: Math.pow(2, 256),
    timeSinceLastPeakLogEPPerSec: Math.pow(2, 256),
    timeSinceLastPeakLogCPPerSec: Math.pow(2, 256),
    timeSinceSacrificePossible: 0,
    timeSincePrestigePossible: 0,
    timeSinceIPGainWasAmount: 0,
    timeSinceEPGainWasAmount: 0,
    timeSinceCPGainWasAmount: 0,
    timeSinceIPGainWasTotal: 0,
    timeSinceEPGainWasTotal: 0,
    timeSinceCPGainWasTotal: 0,
    onlineTimeSinceGameStart: 0,
    fastestInfinity: Math.pow(2, 256),
    fastestEternity: Math.pow(2, 256),
    fastestComplexity: Math.pow(2, 256),
    fastestFinality: Math.pow(2, 256),
    peakIPPerSec: new Decimal(0),
    peakEPPerSec: new Decimal(0),
    peakCPPerSec: new Decimal(0),
    peakLogIPPerSec: 0,
    peakLogEPPerSec: 0,
    peakLogCPPerSec: 0,
    purchasesThisInfinity: 0,
    purchasesThisInfinityByType: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    sacrificesThisInfinity: 0,
    prestigesThisInfinity: 0,
    lastTenInfinities: initialLastTenInfinities(),
    lastTenEternities: initialLastTenEternities(),
    lastTenComplexities: initialLastTenComplexities(),
    lastTenFinalities: initialLastTenFinalities(),
    lastPermanenceGain: new Decimal(0),
    lastRunsToShow: 10,
    lastRunTypesToShow: {
      infinity: true,
      eternity: true,
      complexity: true,
      finality: true
    },
    hasSeenPowerWarningMessage: {},
  },
  cheats: {
    gameSpeed: 1,
    extraAchievements: 0,
    achievementExtraMultiplier: 1
  },
  currentTabGroup: 'normal',
  currentTabInGroup: {
    'normal': 'main',
    'infinity': 'infinity',
    'eternity': 'eternity',
    'complexity': 'complexity',
    'finality': 'finality',
    'miscellaneous': 'options'
  },
  usingTabGroups: false,
  currentTab: 'main',
  version: 2.20703125
}

let player;
