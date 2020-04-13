let Eternities = {
  amount() {
    return player.eternities;
  },
  increment() {
    player.eternities++;
  },
  add(x) {
    player.eternities += x;
  },
  eternityGeneratorMultiplier() {
    // This is intentionally always at most 1, and often less.
    return Math.min(1, Math.max(1, this.amount()) / 256);
  }
}
