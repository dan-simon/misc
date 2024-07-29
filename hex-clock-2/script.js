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

let parseColor = function (x) {
  let digs = [...x.toUpperCase()].filter(j => '0123456789ABCDEF'.includes(j)).join('');
  if (digs.length === 6) {
    return '#' + digs;
  } else if (digs.length === 0) {
    return '';
  } else {
    return null; 
  }
}

let isValidColor = function (x) {
  return x !== null && (x.length === 0 || (x.length === 7 && x[0] === '#' && [...x[1]].every(j => '0123456789ABCDEF'.includes(j))));
}

let getColor = function (c, x) {
  if (!c) {
    let rgb = colors.map(f => f(x));
    return 'rgb(' + rgb.map(x => Math.round(255 * ((1 + x) / 2))).join(', ') + ')';
  } else {
    return c;
  }
}

let [start, unit, digits, textColor, backgroundColor] = [0, 1, 12, '', '#FFFFFF'];

let loadState = function () {
  if (localStorage.getItem('state') !== null) {
    [start, unit, digits, textColor, backgroundColor] = localStorage.getItem('state').split(',').map((i, ind) => ind < 3 ? +i : i);
  }
  document.getElementById('start').value = start;
  document.getElementById('unit').value = unit;
  document.getElementById('digits').value = digits;
  document.getElementById('textColor').value = textColor;
  document.getElementById('backgroundColor').value = backgroundColor;
}

let updateState = function () {
  let newStart = +document.getElementById('start').value;
  let newUnit = +document.getElementById('unit').value;
  let newDigits = +document.getElementById('digits').value;
  let newTextColor = parseColor(document.getElementById('textColor').value);
  let newBackgroundColor = parseColor(document.getElementById('backgroundColor').value);
  if (isFinite(newStart)) {
    start = newStart;
  }
  if (isFinite(newUnit)) {
    unit = newUnit;
  }
  if (isFinite(newDigits)) {
    digits = newDigits;
  }
  if (isValidColor(newTextColor)) {
    textColor = newTextColor;
  }
  if (isValidColor(newBackgroundColor)) {
    backgroundColor = newBackgroundColor;
  }
  localStorage.setItem('state', [start, unit, digits, textColor, backgroundColor].join(','));
}

window.onload = function () {
  loadState();
  setInterval(function () {
    let x = (Date.now() / 1000 - start) / (unit || 1);
    let num = document.getElementById('num');
    num.textContent = hex(x, digits);
    num.style.color = getColor(textColor, x);
    document.body.style.backgroundColor = getColor(backgroundColor, x);
  }, interval);
}
