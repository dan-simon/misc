let initialPlayer = {
  stuff: 10,
  equip: {
    trap: [],
    tent: [],
    cottage: [],
    villa: [],
    castle: [],
    dart: [],
    arrow: [],
    cannon: [],
    unicimhorn: [],
    tshirt: []
  },
  trapping: true,
  trapFraction: 0,
  shrinkLevel: 0,
  trims: 0,
  zone: 1,
  cell: 1,
  upgrades: {},
  fight: {
    time: 0,
    trim: {
      count: 0,
      attack: 0,
      health: 0,
      maxHealth: 20,
    },
    enemy: {
      attack: 5,
      health: 25,
      maxHealth: 25,
    }
  },
  options: {
    notation: 'Scientific',
    offlineProgress: true,
    buildAmount: 1,
    autoFight: false
  },
  version: 0.01
}

let player;
