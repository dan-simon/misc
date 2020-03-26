const parseWithoutE = function(value) {
  if (!value.match(/^[-+]?[,.0-9]*$/)) {
    return null;
  }
  if (value === "") {
    return new Decimal(1);
  }
  if (value === "-") {
    return new Decimal(-1);
  }
  if (!value.match(/\d/)) {
    return null;
  }
  return new Decimal(value.replace(/,/g, ""));
};

const parse = function(value) {
  const stringParts = value.split("e");
  if (!stringParts[stringParts.length - 1].match(/\d/)) {
    return null;
  }
  const numberParts = stringParts.map(parseWithoutE);
  if (numberParts.includes(null)) {
    return null;
  }
  return numberParts.reduceRight((a, b) => Decimal.pow(10, a.toNumber()).times(b));
};

let cache = {};

const el = function (x) {
  if (x in cache) {
    return cache[x];
  }
  let y = document.getElementById(x);
  let r;
  if (y.tagName.toLowerCase() === 'select' || y.type === 'text') {
    r = y.value;
  } else {
    r = y.checked;
  }
  cache[x] = r;
  return r;
}

function getBit(n) {
  let bit = (n >= 0) ? 1 : 0;
  n = Decimal.abs(n);
  let r;
  if (n.eq(Infinity)) {
    r = Infinity;
  } else if (n.eq(0)) {
    r = -Infinity;
  } else {
    let base = el('base');
    if (el('linearize')) {
      let c = Math.floor(Decimal.log(n, base));
      r = c + (n.div(Decimal.pow(base, c)) - 1) / (base - 1);
    } else {
      r = Decimal.log(n, base);
    }
  }
  if (el('-e-') && !bit) {
    r = -r;
  }
  return [r, bit];
}

function formatBitArray(bitArray) {
  let outputform = el('outputform');
  if (outputform === 'hex') {
    let chars = Math.ceil(bitArray.length / 4);
    let x = parseInt(bitArray.join('').padEnd(4 * chars, '0'), 2);
    return x.toString(16).toUpperCase().padStart(chars, '0');
  } else {
    let formatting = el('outputform').split(' and ');
    if (formatting[0] === '-e/-e-') formatting[0] = el('-e-') ? '-e-' : '-e';
    return bitArray.map(x => formatting[x]).join('');
  }
}

function compute() {
  for (let i in cache) delete cache[i];
  let n = parse(el('number'));
  let bitArray = [];
  for (let i = 0; i < el('iterations'); i++) {
    let l = getBit(n);
    n = l[0];
    bitArray.push(l[1]);
  }
  let end = el('showfinalnumber') ? n.toFixed(el('precisionfinalnumber')) : '';
  let result = formatBitArray(bitArray) + end;
  document.getElementById('output').innerHTML = result;
}

function setStuffToHexNotation() {
  document.getElementById('base').value = 2;
  document.getElementById('linearize').checked = true;
  document.getElementById('-e-').checked = true;
  document.getElementById('outputform').value = 'hex';
  document.getElementById('iterations').value = 32;
  document.getElementById('showfinalnumber').checked = false;
}
