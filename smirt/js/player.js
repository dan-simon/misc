let initialPlayer = {
  metal: new Decimal(0),
  stone: new Decimal(0),
  wood: new Decimal(0),
  aether: new Decimal(0),
  importance: {
    metal: 64,
    stone: 0,
    wood: 0,
    aether: 0,
  },
  map: {
    createdZone: 8,
    inMap: false,
    mapType: null,
    zone: null,
    cell: null,
    explorationAttack: 0,
  },
  vm: {
    total: 0,
    run: 0,
  },
  aetherUpgrades: 0,
  aetherAttack: 0,
  gold: {
    gain: 0,
    total: 0,
    portals: 0
  },
  perks: [0, 0, 0, 0, 0, 0],
  upgrades: [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ],
  currentChallenge: -1,
  challengesCompleted: [false, false],
  zone: 1,
  cell: 1,
  fighting: true,
  fight: {
    timer: 1,
    health: 1,
    maxHealth: 1,
    defense: 1,
  },
  options: {
    notation: 'Scientific',
    offlineProgress: true
  },
  stats: {
    highestZone: 1,
    highestMapThisPortal: 0,
    timeSincePortal: 0,
    timeSinceGameStart: 0,
  },
  version: 0.04
}

let player;
