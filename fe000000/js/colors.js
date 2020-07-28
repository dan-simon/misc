let Colors = {
  makeColor(x) {
    // Handle true and false properly.
    x = +x;
    let r = x <= 1 / 4 ? 1 - x * 8 / 5 : (1 - x) * 4 / 5;
    let g = x * 4 / 5;
    return 'rgb(' + [255 * r, 255 * g, 0].map(Math.floor).join(', ') + ')';
  }
}
