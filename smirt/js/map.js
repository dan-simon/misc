let Map = {
  cost() {
    return zoneToCost(this.getCreatedZone());
  },
  getCreatedZone() {
    return player.map.createdZone;
  },
  setCreatedZone(x) {
    player.map.createdZone = Math.max(1, x | 0);
  },
  resourceName() {
    return 'wood';
  },
  resource() {
    return Wood;
  },
  isVisible() {
    return Wood.isUnlocked();
  },
  isAffordable() {
    return this.resource().amount().gte(this.cost());
  },
  isRunning() {
    return player.map.inMap;
  },
  canRun(x) {
    return ((x === 'void') ? this.vmCurrent() >= 1: this.isAffordable()) && !this.isRunning();
  },
  zone() {
    return player.map.zone;
  },
  highestMapThisPortal() {
    return player.stats.highestMapThisPortal;
  },
  vmProduction() {
    let x = this.highestMapThisPortal();
    if (x < 16) {
      return 0;
    } else {
      return (logBin(new Decimal(x)) / 2 - 2) / 1024;
    }
  },
  explorationAttack() {
    return player.map.explorationAttack;
  },
  vmTotal() {
    return player.vm.total;
  },
  vmRan() {
    return player.vm.ran;
  },
  vmCurrent() {
    return this.vmTotal() - this.vmRan() - ((this.isRunning() && player.map.mapType === 'void') ? 1 : 0);
  },
  run(x) {
    if (!this.canRun(x)) {
      return false;
    }
    if (x === undefined) {
      this.resource().subtract(this.cost());
      player.map.inMap = true;
      player.map.mapType = 'normal';
      player.map.zone = this.getCreatedZone();
      player.map.cell = 1;
      Zone.goToNextEnemy();
    } else if (x === 'void') {
      player.map.inMap = true;
      player.map.mapType = 'void';
      player.map.zone = Zone.worldZone() + 16;
      player.map.cell = 1;
      Zone.goToNextEnemy();
    } else {
      throw new Error('Weird map type');
    }
  },
  exit() {
    player.map.inMap = false;
    player.map.mapType = null;
    player.map.zone = null;
    player.map.cell = null;
  },
  giveFinishingBonus() {
    if (player.map.mapType === 'normal') {
      let bonus = Math.max(Math.floor(this.zone() / 2), 1);
      let cap = Math.max(player.map.explorationAttack, 4 * this.zone());
      player.map.explorationAttack = Math.min(player.map.explorationAttack + bonus, cap);
      player.stats.highestMapThisPortal = Math.max(player.stats.highestMapThisPortal, this.zone());
    } else if (player.map.mapType === 'void') {
      // We don't add to exploration bonus because that makes people not want to do more maps
      // (no clear bonus).
      Gold.addToGain(2 * Math.max(32, Gold.gainFromZone(Zone.worldZone())));
      player.vm.ran++;
    }
  }
}
