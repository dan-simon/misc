let Gold = {
  isVisible() {
    return Zone.worldZone() > 32 || this.getPortals() > 0;
  },
  canPortal() {
    return Zone.worldZone() > 32;
  },
  hasPortaled() {
    return this.getPortals() > 0;
  },
  portal(manual) {
    if (!this.canPortal()) {
      return false;
    }
    if (manual && !confirm('Are you sure you want to portal?')) {
      return false;
    }
    player.gold.total += player.gold.gain;
    player.gold.portals++;
    this.portalReset();
  },
  portalReset() {
    player.currentChallenge = -1;
    player.gold.gain = 0;
    player.metal = new Decimal(0);
    player.stone = new Decimal(0);
    player.wood = new Decimal(0);
    player.aether = new Decimal(0);
    player.map = {
      createdZone: player.map.createdZone,
      inMap: false,
      mapType: null,
      zone: null,
      cell: null,
      explorationAttack: 0
    };
    player.vm = {
      total: 0,
      ran: 0
    }
    player.aetherUpgrades = 0;
    player.aetherAttack = 0;
    player.upgrades = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];
    player.zone = 1;
    player.cell = 1;
    player.fight = {
      timer: 1,
      health: 1,
      maxHealth: 1,
      defense: 1,
    };
    player.stats.highestMapThisPortal = 0;
    player.stats.timeSincePortal = 0;
  },
  getPortals() {
    return player.gold.portals;
  },
  total() {
    return player.gold.total;
  },
  amount() {
    return this.total() - this.spent();
  },
  spent() {
    return Perks.totalCost();
  },
  gain() {
    return player.gold.gain;
  },
  gainFromZone(z) {
    if (z < 32) {
      return 0;
    } else if (z === 32) {
      return 32;
    } else {
      return z - 32;
    }
  },
  addToGain(x) {
    player.gold.gain += x;
  }
}
