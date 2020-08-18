let PowerShardUpgrade = function (i) {
  if ('PowerShardUpgrades' in window) {
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
    maxBuyable() {
      let num = Math.floor(Math.log(player.powers.shards / this.cost() * (this.costIncreasePer() - 1) + 1) / Math.log(this.costIncreasePer()));
      num = Math.min(num, this.boughtLimit() - this.bought());
      num = Math.max(num, 0);
      return num;
    },
    buy(n, guaranteedBuyable) {
      if (n === undefined) {
        n = 1;
      }
      if (n === 0 || (!guaranteedBuyable && !this.canBuy(n))) return;
      player.powers.shards = player.powers.shards - this.costFor(n);
      this.addBought(n);
    },
    buyMax() {
      this.buy(this.maxBuyable(), true);
    },
    buyShortOfMax(n) {
      this.buy(Math.max(0, this.maxBuyable() - n), true);
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
  maxAll() {
    this.buyMaxOf([1, 2, 3, 4])
  },
  buyMaxOf(ids) {
    let list = ids.map(x => PowerShardUpgrades.list[x - 1]);
    // Buying short of max
    list.forEach(x => x.buyShortOfMax(3));
    while (list.some(x => x.canBuy())) {
      // We copy it so that sorting doesn't rearrange the list, which would be a subtle source of bugs
      // (letting current costs influence future buy order even after costs change).
      // Note: This nonly buys in the expected order if sort is stable.
      [...list].sort((x, y) => x.bought() - y.bought())[0].buy();
    }
  },
  setCraftedType(x) {
    player.powers.craft.type = x;
  },
  setCraftedRarity(x) {
    player.powers.craft.rarity = (x === 'max' || x === 'min') ? x : Math.max(+x || 0, 0);
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
  craftedPower() {
    return {
      'type': this.craftedType(),
      'strength': this.craftedStrength(),
      'rarity': this.craftedRarity(),
    }
  },
  craftedPowerCost() {
    return Math.max(
      2 * this.shardGain(this.craftedPower()),
      4 * Math.pow(2, Math.pow(this.craftedRarity(), 2) - Math.pow(Powers.minimumRarity(), 2)));
  },
  canCraft() {
    return player.powers.shards >= this.craftedPowerCost();
  },
  craft() {
    if (!this.canCraft()) return;
    player.powers.shards -= this.craftedPowerCost();
    player.powers.stored.push(this.craftedPower());
    Powers.cleanStored();
    Powers.autoSort();
  }
}
