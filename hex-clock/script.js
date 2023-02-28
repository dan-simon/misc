let interval = 32;

let colors = [
  x => Math.cos(Math.PI * x / Math.log2(x)),
  x => Math.cos(Math.PI * Math.sqrt(x)),
  x => Math.cos(Math.PI * Math.log2(x)),
];

let useColor = true;

let digitLength = 12;

let ln = x => Math.floor(Math.log2(x)) + x / Math.pow(2, Math.floor(Math.log2(x))) - 1

let hexDig = function (x) {
  let dig = [];
  while (x !== 0 && dig.length < digitLength * 4) {
    dig.push((x < 0) ? 0 : 1);
    x = (x < 0) ? -ln(-x) : ln(x);
  }
  while (dig.length < digitLength * 4) {
    dig.push(0);
  }
  if ((x === 0 && dig[digitLength * 4 - 1] === 1) || x > 0) {
    for (let i = digitLength * 4 - 1; i >= 0; i--) {
      dig[i] = 1 - dig[i];
      if (dig[i] === 1) {
        break;
      }
    }
  }
  return dig;
}

let hex = function (x) {
  let dig = hexDig(x);
  return [...Array(digitLength)].map((_, i) => '0123456789ABCDEF'[
    8 * dig[4 * i] + 4 * dig[4 * i + 1] + 2 * dig[4 * i + 2] + dig[4 * i + 3]]).join('');
}

window.onload = function () {
  setInterval(function () {
    let x = Date.now() / 1000;
    let num = document.getElementById('num');
    num.textContent = hex(x);
    if (useColor) {
      rgb = colors.map(f => f(x));
      num.style.color = 'rgb(' + rgb.map(x => Math.round(255 * ((1 + x) / 2))).join(', ') + ')';
    }
  }, interval);
}
