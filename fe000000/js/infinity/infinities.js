let Infinities = {
  amount() {
    return player.infinities;
  },
  realAmount() {
    return player.realInfinities;
  },
  increment() {
    player.infinities++;
    player.realInfinities++;
  },
  add(x) {
    // Only call this when adding starting infinities.
    player.infinities += x;
  },
  infinityGeneratorMultiplier() {
    // This is intentionally always at most 1, and often less.
    // The max with 1 allows for infinity generators to produce
    // on first infinity if you have IP to buy them with,
    // which is useful for the start-with IP milestone.
    return Math.min(1, Math.max(1, this.amount()) / 256);
  }
}
