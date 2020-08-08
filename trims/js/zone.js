let Zone = {
  getCellColor(a, b) {
    return this.cell() > 8 * (a - 1) + b ? 'green' : (this.cell() === 8 * (a - 1) + b ? 'yellow' : 'grey');
  },
  book(x) {
    let upgrade;
    if (x === 1) {
      upgrade = x <= 9;
    } else if (x === 2) {
      upgrade = x / 2 === 0 && x >= 4;
    } else if (x === 3 || x === 4) {
      upgrade = true;
    }
    return upgrade ? '📕' : '';
  },
  zone() {
    return player.zone;
  },
  cell() {
    return player.cell;
  },
  enemyNameIndex() {
    return Math.floor(this.zone() * this.cell() * Math.pow(1.1, (this.cell() + this.zone()) % 8) % 8);
  },
  enemyName() {
    return ['Butterflim', 'Cassowarim', 'Cheetim', 'Chim', 'Crocadim', 'Echidnim', 'Elephim', 'Kangarim'][this.enemyNameIndex()];
  },
  trimCount() {
    return player.fight.trim.count;
  },
  trimAttack() {
    return player.fight.trim.attack;
  },
  trimHealth() {
    return player.fight.trim.health;
  },
  trimMaxHealth() {
    return player.fight.trim.maxHealth;
  },
  enemyAttack() {
    return player.fight.enemy.attack;
  },
  enemyHealth() {
    return player.fight.enemy.health;
  },
  enemyMaxHealth() {
    return player.fight.enemy.maxHealth;
  },
  trimHealthFraction() {
    return this.trimHealth() / this.trimMaxHealth();
  },
  enemyHealthFraction() {
    return this.enemyHealth() / this.enemyMaxHealth();
  },
  antiGrace() {
    return 0.5;
  },
  advanceOneCell() {
    player.cell++;
    if (player.cell > 64) {
      player.cell = 1;
      player.zone++;
    }
  },
  giveEnemyReward() {
    Trims.gather(1);
  },
  zoneDifficultyRange() {
    let diff = 3;
    let z = this.zone();
    while (z % 10 === 0) {
      z /= 2;
      diff *= 1.5;
    }
    return diff;
  },
  newEnemy() {
    let x = Math.pow(2, this.zone() - 1) * Math.pow(this.zoneDifficultyRange(), (this.cell() - 1) / 63);
    return {
      attack: 5 * x,
      health: 25 * x,
      maxHealth: 25 * x
    }
  },
  fightingGroupSize() {
    return 1;
  },
  canSendGroupToFight() {
    return Trims.amount() >= this.fightingGroupSize() && this.trimHealth() === 0;
  },
  sendGroupToFight() {
    if (!this.canSendGroupToFight()) return;
    let count = this.fightingGroupSize();
    Trims.subtract(count)
    player.fight.trim = {
      count: count,
      attack: count * Trims.attackPer(),
      health: count * Trims.healthPer(),
      maxHealth: count * Trims.healthPer(),
    }
  },
  maybeAutoSendGroupToFight() {
    if (this.isAutoFightOn() && Trims.atCapacity()) {
      this.sendGroupToFight();
    }
  },
  isAutoFightOn() {
    return player.options.autoFight;
  },
  toggleAutoFight() {
    player.options.autoFight = !player.options.autoFight;
  },
  fight(diff) {
    if (this.trimHealth() === 0) return;
    let trimTimeUntilDamage = Math.max(this.antiGrace() - player.fight.time, 0);
    let trimDieTime = this.trimHealth() / this.enemyAttack();
    let enemyDieTime = this.enemyHealth() / this.trimAttack() + trimTimeUntilDamage;
    if (enemyDieTime <= diff && enemyDieTime <= trimDieTime) {
      player.fight.trim.health -= this.enemyAttack() * enemyDieTime;
      this.giveEnemyReward();
      this.advanceOneCell();
      player.fight.enemy = this.newEnemy();
      player.fight.time = 0;
    } else if (trimDieTime <= diff) {
      player.fight.trim.health = 0;
      player.fight.enemy.health -= this.trimAttack() * Math.max(0, trimDieTime - trimTimeUntilDamage);
      player.fight.time = 0;
    } else {
      player.fight.trim.health -= this.enemyAttack() * diff;
      player.fight.enemy.health -= this.trimAttack() * Math.max(0, diff - trimTimeUntilDamage);
      player.fight.time += diff;
    }
  }
}
