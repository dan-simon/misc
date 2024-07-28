let interval = 32;

let colors = [
  x => Math.cos(Math.PI * x / Math.log2(Math.abs(x))),
  x => Math.cos(Math.PI * Math.sqrt(Math.abs(x))),
  x => Math.cos(Math.PI * Math.log2(Math.abs(x))),
];

let ln = x => Math.floor(Math.log2(x)) + x / Math.pow(2, Math.floor(Math.log2(x))) - 1

let hexDig = function (x, bits) {
  let dig = [];
  while (x !== 0 && dig.length < bits) {
    dig.push((x < 0) ? 0 : 1);
    x = (x < 0) ? -ln(-x) : ln(x);
  }
  if (x === 0 && dig.length < bits) {
    dig.push(1);
  }
  while (dig.length < bits) {
    dig.push(0);
  }
  if ((x === 0 && dig[bits - 1] === 1) || x > 0) {
    for (let i = bits - 1; i >= 0; i--) {
      dig[i] = 1 - dig[i];
      if (dig[i] === 1) {
        break;
      }
    }
  }
  return dig;
}

let hex = function (x, digits) {
  let dig = hexDig(x, digits * 4);
  return [...Array(digits)].map((_, i) => '0123456789ABCDEF'[
    8 * dig[4 * i] + 4 * dig[4 * i + 1] + 2 * dig[4 * i + 2] + dig[4 * i + 3]]).join('');
}

let [start, unit, digits, useColor] = [0, 1, 12, true];

let loadState = function () {
  if (localStorage.getItem('state') !== null) {
    [start, unit, digits, useColor] = localStorage.getItem('state').split(',').map(i => +i);
  }
  document.getElementById('start').value = start;
  document.getElementById('unit').value = unit;
  document.getElementById('digits').value = digits;
  document.getElementById('colors').checked = !!useColor;
}

let updateState = function () {
  let newStart = +document.getElementById('start').value;
  let newUnit = +document.getElementById('unit').value;
  let newDigits = +document.getElementById('digits').value;
  let newUseColor = document.getElementById('colors').checked;
  if (isFinite(newStart)) {
    start = newStart;
  }
  if (isFinite(newUnit)) {
    unit = newUnit;
  }
  if (isFinite(newDigits)) {
    digits = newDigits;
  }
  useColor = newUseColor;
  localStorage.setItem('state', start + ',' + unit + ',' + digits + ',' + (+useColor));
}

window.onload = function () {
  loadState();
  setInterval(function () {
    let x = (Date.now() / 1000 - start) / (unit || 1);
    let num = document.getElementById('num');
    num.textContent = hex(x, digits);
    if (useColor) {
      rgb = colors.map(f => f(x));
      num.style.color = 'rgb(' + rgb.map(x => Math.round(255 * ((1 + x) / 2))).join(', ') + ')';
    } else {
      num.style.color = '';
    }
  }, interval);
}
