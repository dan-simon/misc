let Finalities = {
  amount() {
    return player.complexities;
  },
  increment() {
    player.complexities++;
  },
  finalityGeneratorMultiplier() {
    // This is intentionally always at most 1, and often less.
    return Math.min(1, Math.max(1, this.amount()) / 256);
  },
  finalityGeneratorPerPurchaseMultiplier() {
    return Math.pow(2, Math.min(16, Math.max(1, Math.sqrt(player.finalities))) / 8);
  }
}
