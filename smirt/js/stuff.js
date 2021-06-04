let Metal = {
  amount() {
    return player.metal;
  },
  isUnlocked() {
    return true;
  },
  add(x) {
    player.metal = player.metal.plus(x);
  },
  subtract(x) {
    player.metal = player.metal.minus(x);
  },
  perSecond() {
    return divvy(Zone.production()).metal;
  },
  gather(diff) {
    this.add(this.perSecond().times(diff));
  },
  getImportance() {
    return player.importance.metal;
  },
  setImportance(x) {
    player.importance.metal = x;
  }
}

let Stone = {
  amount() {
    return player.stone;
  },
  isUnlocked() {
    return true;
  },
  add(x) {
    player.stone = player.stone.plus(x);
  },
  subtract(x) {
    player.stone = player.stone.minus(x);
  },
  perSecond() {
    return divvy(Zone.production()).stone;
  },
  gather(diff) {
    this.add(this.perSecond().times(diff));
  },
  getImportance() {
    return player.importance.stone;
  },
  setImportance(x) {
    player.importance.stone = x;
  }
}

let Wood = {
  amount() {
    return player.wood;
  },
  isUnlocked() {
    return Zone.worldZone() > 16;
  },
  add(x) {
    player.wood = player.wood.plus(x);
  },
  subtract(x) {
    player.wood = player.wood.minus(x);
  },
  perSecond() {
    // Needed for potentially non-unlocked resources.
    return divvy(Zone.production()).wood || new Decimal(0);
  },
  gather(diff) {
    this.add(this.perSecond().times(diff));
  },
  getImportance() {
    return player.importance.wood;
  },
  setImportance(x) {
    player.importance.wood = x;
  }
}

let Aether = {
  amount() {
    return player.aether;
  },
  isUnlocked() {
    return player.vm.ran > 0;
  },
  add(x) {
    player.aether = player.aether.plus(x);
  },
  subtract(x) {
    player.aether = player.aether.minus(x);
  },
  baseProduction() {
    return (player.vm.ran > 0) ? scale(player.vm.ran - 1, 4) : new Decimal(0);
  },
  perSecond() {
    // Needed for potentially non-unlocked resources.
    let p = Zone.production();
    let b = this.baseProduction();
    let r = divvy(Zone.production()).aether || new Decimal(0);
    return r.div(p).times(b);
  },
  gather(diff) {
    this.add(this.perSecond().times(diff));
  },
  getImportance() {
    return player.importance.aether;
  },
  setImportance(x) {
    player.importance.aether = x;
  }
}

let gatherAll = function (diff) {
  Metal.gather(diff);
  Stone.gather(diff);
  Wood.gather(diff);
  Aether.gather(diff);
}

let divvy = function (x) {
  let lookup = {
    'metal': Metal,
    'stone': Stone,
    'wood': Wood,
    'aether': Aether
  }
  let types = ['metal', 'stone', 'wood', 'aether'].filter(i => lookup[i].isUnlocked());
  for (let i in lookup) {
    if (!(types.includes(i))) {
      delete lookup[i];
    }
  }
  let totalImportance = Object.values(lookup).map(x => x.getImportance()).reduce((a, b) => a + b);
  let production = {};
  let extra = {};
  for (let i in lookup) {
    let y = x.times(lookup[i].getImportance() / totalImportance);
    production[i] = Decimal.floor(y);
    extra[i] = y.minus(Decimal.floor(y)).toNumber();
  }
  let totalProduction = Object.values(production).reduce((a, b) => a.plus(b));
  let excess = Math.min(types.length, x.minus(totalProduction).toNumber());
  // Earlier = better
  let mostDeserving = types.sort(function (a, b) {
    if (extra[a] < extra[b]) {
      return 1;
    } else if (extra[b] < extra[a]) {
      return -1;
    } else {
      return 0;
    }
  });
  for (let i of mostDeserving.slice(0, excess)) {
    production[i] = production[i].plus(1);
  }
  return production;
}
