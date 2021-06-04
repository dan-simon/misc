let Zone = {
  getCellColor(a, b) {
    return this.cell() > 8 * (a - 1) + b ? 'green' : (this.cell() === 8 * (a - 1) + b ? 'yellow' : 'grey');
  },
  zone() {
    if (Map.isRunning()) {
      return Map.zone();
    } else {
      return this.worldZone();
    }
  },
  description() {
    if (Map.isRunning()) {
      return {'normal': 'Map', 'void': 'Void Map'}[player.map.mapType] + ': Zone ' + formatInt(this.zone());
    } else {
      return 'Zone ' + formatInt(this.zone());
    }
  },
  worldZone() {
    return player.zone;
  },
  cell() {
    if (Map.isRunning()) {
      return player.map.cell;
    } else {
      return player.cell;
    }
  },
  production() {
    return scale(this.worldZone() + Perks.amount(1) - 1, 4);
  },
  enemyNameIndex() {
    return Math.floor(this.zone() * this.cell() * Math.pow(1.1, (this.cell() + this.zone()) % 8) % 8);
  },
  enemyName() {
    return ['Butterflim', 'Cassowarim', 'Cheetim', 'Chim', 'Crocadim', 'Echidnim', 'Elephim', 'Kangarim'][this.enemyNameIndex()];
  },
  attack() {
    return Upgrades.totalAttack();
  },
  enemyHealth() {
    return player.fight.health;
  },
  enemyMaxHealth() {
    return player.fight.maxHealth;
  },
  enemyDefense() {
    return player.fight.defense;
  },
  enemyHealthFraction() {
    return this.enemyHealth() / this.enemyMaxHealth();
  },
  advanceOneCell() {
    if (Map.isRunning()) {
      player.map.cell++;
      if (player.map.cell > 64) {
        Map.giveFinishingBonus();
        Map.exit();
      }
    } else {
      gatherAll(Perks.amount(3) / 4);
      player.vm.total += Map.vmProduction();
      player.cell++;
      if (player.cell > 64) {
        Challenge.checkCompletion();
        Gold.addToGain(Gold.gainFromZone(this.worldZone()));
        player.cell = 1;
        player.zone++;
        player.stats.highestZone = Math.max(player.stats.highestZone, player.zone);
      }
    }
    this.goToNextEnemy();
  },
  goToNextEnemy() {
    let e = this.newEnemy();
    player.fight.health = e.health;
    player.fight.maxHealth = e.maxHealth;
    player.fight.defense = e.defense;
  },
  newEnemy() {
    let x = this.zone() * (this.zone() - 1) / 2 + Math.floor((this.cell() - 1) * this.zone() / 64) + 1;
    return {
      health: x,
      maxHealth: x,
      defense: x
    }
  },
  fighting() {
    return player.fighting;
  },
  toggleFighting() {
    player.fighting = !player.fighting;
  },
  fightInterval() {
    return logInv(new Decimal(1 + Perks.amount(2) / 8)).toNumber();
  },
  fight(diff) {
    let fightDiff = diff / this.fightInterval();
    let fights = Math.floor(fightDiff);
    player.fight.timer -= fightDiff % 1;
    if (player.fight.timer < 0) {
      player.fight.timer++;
      fights++;
    }
    if (!this.fighting()) {
      // Still had to update the timer.
      return;
    }
    while (fights > 0) {
      let attack = Math.max(this.attack() - this.enemyDefense(), 0);
      if (attack === 0) break;
      if (attack >= this.enemyHealth()) {
        while (attack >= this.enemyHealth()) {
          attack -= this.enemyHealth();
          this.advanceOneCell();
        }
        fights--;
      } else {
        // Fight as many times as possible without taking away all health.
        let thisFights = Math.min(fights, Math.floor((player.fight.health - 1) / attack));
        player.fight.health -= thisFights * attack;
        fights -= thisFights;
      }
    }
  }
}
