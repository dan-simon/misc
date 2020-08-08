let Stuff = {
  amount() {
    return player.stuff;
  },
  add(x) {
    player.stuff += x;
  },
  perSecond() {
    return 0;
  },
  gatherBase(diff) {
    this.add(diff / 2);
  }
}
