let Finalities = {
  amount() {
    return player.finalities;
  },
  increment() {
    player.finalities++;
  },
  finalityGeneratorMultiplier() {
    // This is intentionally always at most 1, and often less.
    return Math.min(1, Math.max(1, this.amount()) / 256);
  },
  finalityGeneratorPerPurchaseMultiplier() {
    return Math.pow(2, Math.min(16, Math.max(1, Math.sqrt(player.finalities))) / 8);
  },
  autoECCompletionTime() {
    return 4096 / Math.min(this.amount(), 256);
  }
}
