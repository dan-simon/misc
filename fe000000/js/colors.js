let Colors = {
  makeColor(x, dimmed) {
    // Handle true and false properly.
    x = +x;
    let r = x <= 1 / 4 ? 1 - x * 8 / 5 : (1 - x) * 4 / 5;
    let g = x * 4 / 5;
    return 'rgb(' + [255 * r * dimmed, 255 * g * dimmed, 0].map(Math.floor).join(', ') + ')';
  },
  makeStyle(x, isChallenge) {
    if (player.options.completionColors === 'Off') {
      return '#000000';
    } else if (player.options.completionColors === 'On (uniform)') {
      return this.makeColor(x, 0.5);
    } else if (player.options.completionColors === 'On (gradient)') {
      let a = isChallenge ? '#000000' : this.makeColor(x, 1);
      let b = isChallenge ? this.makeColor(x, 1) : '#000000';
      return 'radial-gradient(' + a + ', ' + b + ')';
    }
  }
}
