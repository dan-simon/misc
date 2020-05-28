let Eternities = {
  amount() {
    return player.eternities;
  },
  add(x) {
    player.eternities += x;
  },
  setAmount(x) {
    player.eternities = x;
  },
  commonEternityGainMultiplier() {
    return EternityChallenge.getTotalCompletionsRewardEffect(2) * PermanenceUpgrade(1).effect();
  },
  eternityGeneratorMultiplier() {
    // This is intentionally always at most 1, and often less.
    return Math.min(1, Math.max(1, this.amount()) / 256);
  }
}
