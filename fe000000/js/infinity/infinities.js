let Infinities = {
  amount() {
    return player.infinities;
  },
  increment() {
    player.infinities++;
  },
  infinityGeneratorMultiplier() {
    // This is intentionally always at most 1, and often less.
    return Math.min(1, this.amount() / 256);
  }
}
