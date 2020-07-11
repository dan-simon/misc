let Complexities = {
  amount() {
    return player.complexities;
  },
  increment() {
    player.complexities++;
  },
  complexityGeneratorMultiplier() {
    // This is intentionally always at most 1, and often less.
    return Math.min(1, Math.max(1, this.amount()) / 256);
  },
  permanenceMultiplier() {
    return this.permanenceAndChromaMultiplier();
  },
  chromaMultiplier() {
    return this.permanenceAndChromaMultiplier();
  },
  permanenceAndChromaMultiplier() {
    return Math.pow(4, Math.pow(Math.min(this.amount(), 256), 0.25));
  },
  autoECCompletionTime() {
    return 8192 / Math.min(this.amount(), 256);
  }
}
