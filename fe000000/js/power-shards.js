let PowerShardUpgrade = function (i) {
  if (defined.powerShardUpgrades) {
    return PowerShardUpgrades.get(i);
  }
  return {
    bought() {
      return player.powers.shardUpgrades[i - 1];
    },
    addBought(n) {
      player.powers.shardUpgrades[i - 1] += n;
    },
    boughtLimit() {
      // This should never really matter, but we put it in to be safe.
      return Powers.isUnlocked() ? Infinity : 0;
    },
    costIncreasePer() {
      return 2;
    },
    effectIncreasePer() {
      return 0.125;
    },
    initialEffect() {
      return 0;
    },
    initialCost() {
      return 1;
    },
    cost() {
      return this.initialCost() * Math.pow(this.costIncreasePer(), this.bought());
    },
    costFor(n) {
      return this.cost() * (Math.pow(this.costIncreasePer(), n) - 1) / (this.costIncreasePer() - 1);
    },
    effect() {
      return this.initialEffect() + this.effectIncreasePer() * this.bought();
    },
    nextEffect() {
      return this.initialEffect() + this.effectIncreasePer() * (this.bought() + 1);
    },
    atBoughtLimit() {
      return this.bought() >= this.boughtLimit();
    },
    canBuy(n) {
      if (n === undefined) {
        n = 1;
      }
      return n <= this.maxBuyable();
    },
    newAutobuyerStart: 0,
    newAutobuyerScale: 1,
    newAutobuyerCapLoc: Infinity,
    isGenerallyBuyable() {
      return Powers.isUnlocked();
    },
    maxBuyable(fraction) {
      if (!this.isGenerallyBuyable()) return 0;
      if (fraction === undefined) {
        fraction = 1;
      }
      let num = Math.floor(Math.log(player.powers.shards * fraction / this.cost() * (this.costIncreasePer() - 1) + 1) / Math.log(this.costIncreasePer()));
      num = Math.min(num, this.boughtLimit() - this.bought());
      num = Math.max(num, 0);
      return num;
    },
    buy(n, guaranteedBuyable, free) {
      if (n === undefined) {
        n = 1;
      }
      if (n === 0 || (!guaranteedBuyable && !this.canBuy(n))) return;
      if (!free) {
        player.powers.shards = player.powers.shards - this.costFor(n);
      }
      this.addBought(n);
    },
    buyMax(fraction) {
      this.buy(this.maxBuyable(fraction), true);
    }
  }
}

let PowerShardUpgrades = {
  list: [1, 2, 3, 4].map((x) => PowerShardUpgrade(x)),
  get: function (x) {
    return this.list[x - 1];
  },
}

let PowerShards = {
  hasGainedShards() {
    return player.powers.hasGainedShards;
  },
  amount() {
    return player.powers.shards;
  },
  shardGain(p) {
    return 1 + Powers.rarity(p) * Powers.strength(p);
  },
  shardGainStored(i) {
    if (Powers.canAccessStored(i)) {
      return this.shardGain(Powers.accessPower('stored', i));
    }
  },
  gainShards(p) {
    player.powers.shards += this.shardGain(p);
    player.powers.hasGainedShards = true;
  },
  gainPowerShards(x) {
    player.powers.shards += x;
    player.powers.hasGainedShards = true;
  },
  gainShardsStored(i) {
    if (Powers.canAccessStored(i)) {
      this.gainShards(Powers.accessPower('stored', i));
    }
  },
  anythingToBuy() {
    return PowerShardUpgrades.list.some(x => x.canBuy());
  },
  safeSubtract(x) {
    player.powers.shards -= Math.min(player.powers.shards, x.toNumber());
  },
  maxAll() {
    this.buyMaxOf([1, 2, 3, 4])
  },
  buyMaxOf(ids) {
    let list = ids.map(x => PowerShardUpgrades.list[x - 1]);
    generalMaxAll(list, PowerShards);
  },
  setCraftedType(x) {
    player.powers.craft.type = x;
  },
  setCraftedRarity(x) {
    player.powers.craft.rarity = (x === 'max' || x === 'min') ? x : Math.max(x || 0, 0);
  },
  craftedType() {
    return player.powers.craft.type;
  },
  craftedStrength() {
    return Powers.newStrength();
  },
  craftedRarity() {
    if (player.powers.craft.rarity === 'min') {
      return Powers.minimumRarity();
    }
    if (player.powers.craft.rarity === 'max') {
      return Powers.maximumRarity();
    }
    return Math.min(Powers.maximumRarity(), player.powers.craft.rarity);
  },
  craftedRarityDisplay() {
    return player.powers.craft.rarity;
  },
  craftedPower(rarity) {
    if (rarity === undefined) {
      rarity = this.craftedRarity();
    }
    return {
      'id': [player.finalities, null],
      'type': this.craftedType(),
      'strength': this.craftedStrength(),
      'rarity': rarity,
    }
  },
  craftedPowerCost(rarity) {
    if (rarity === undefined) {
      rarity = this.craftedRarity();
    }
    return Math.max(
      2 * this.shardGain(this.craftedPower(rarity)),
      4 * Math.pow(2, Math.pow(rarity, 2) - Math.pow(Powers.minimumRarity(), 2)));
  },
  craftSafetyMargin() {
    return 1e-10;
  },
  canCraft() {
    return player.powers.shards >= this.craftedPowerCost() - this.craftSafetyMargin();
  },
  canCraftAny() {
    return player.powers.shards >= this.craftedPowerCost(0) - this.craftSafetyMargin();
  },
  maxCraftRarity() {
    return Math.min(
      Powers.maximumRarity(),
      (this.amount() / 2 - 1) / this.craftedStrength(),
      Math.sqrt(Math.log2(this.amount() / 4) + Math.pow(Powers.minimumRarity(), 2)));
  },
  maxCraftRarityText() {
    return this.canCraftAny() ? formatPrecisely(this.maxCraftRarity()) : 'cannot craft any rarity';
  },
  setCraftRarityToMax() {
    if (!this.canCraftAny()) return;
    let max = this.maxCraftRarity();
    PowerShards.setCraftedRarity(max);
    document.getElementsByClassName('craft-rarity')[0].value = NotationOptions.format('craft-rarity');
  },
  craft() {
    if (!this.canCraft()) return;
    Achievements.checkForAchievements('craft');
    player.powers.shards -= this.craftedPowerCost();
    player.powers.stored.push(this.craftedPower());
    Powers.cleanStored();
    Powers.autoSort();
  }
}

defined.powerShardUpgrades = true;
