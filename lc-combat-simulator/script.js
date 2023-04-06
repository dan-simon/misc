function parse(n) {
  return parseInt(n.replace(/,/g, '.').replace(/[^0-9.]/g, ''));
}

function parseFrac(n) {
  let s = n.replace(/,/g, '.').replace(/[^0-9.]/g, '');
  if (s === '') {
    return 0.5;
  }
  let r = parseFloat(s);
  if (r > 1) {
    return r / 100;
  } else {
    return r;
  }
}

let computed = {};

function winChance(yb, yp, yc, yh, ob, op, oc, oh) {
  if ((yc === 0 && oc === 0) || (yb === ob && yp === 0 && op === 0)) {
    return null;
  }
  if (yc === 0) {
    return 0;
  } else if (oc === 0) {
    return 1;
  }
  if ([yb, yp, yc, yh, ob, op, oc, oh].join(',') in computed) {
    return computed[[yb, yp, yc, yh, ob, op, oc, oh].join(',')];
  }
  let ychance = [1];
  for (let i = 0; i < yc; i++) {
    ychance = [...Array(i + 2)].map((_, i) => (ychance[i - 1] || 0) * yh + (ychance[i] || 0) * (1 - yh));
  }
  let ochance = [1];
  for (let i = 0; i < oc; i++) {
    ochance = [...Array(i + 2)].map((_, i) => (ochance[i - 1] || 0) * oh + (ochance[i] || 0) * (1 - oh));
  }
  let win = ychance.flatMap((v, i) => ochance.map((w, j) => ((yb + yp * i) > (ob + op * j)) ? v * w : 0)).reduce((a, b) => a + b, 0);
  let loss = ychance.flatMap((v, i) => ochance.map((w, j) => ((yb + yp * i) < (ob + op * j)) ? v * w : 0)).reduce((a, b) => a + b, 0);
  let factor = 1 / (win + loss);
  let r = factor * (win * winChance(yb, yp, yc, yh, ob, op, oc - 1, oh) + loss * winChance(yb, yp, yc - 1, yh, ob, op, oc, oh));
  computed[[yb, yp, yc, yh, ob, op, oc, oh].join(',')] = r;
  return r;
}

function main() {
  let yb = parse(document.getElementById('yb').value);
  let yp = parse(document.getElementById('yp').value);
  let yc = parse(document.getElementById('yc').value);
  let yh = parseFrac(document.getElementById('yh').value);
  let ob = parse(document.getElementById('ob').value);
  let op = parse(document.getElementById('op').value);
  let oc = parse(document.getElementById('oc').value);
  let oh = parseFrac(document.getElementById('oh').value);
  let res = winChance(yb, yp, yc, yh, ob, op, oc, oh);
  document.getElementById('ret').innerHTML = (res === null) ? 'invalid' : (res * 100).toFixed(2) + '%';
}

function munge() {
  let mod = document.getElementById('mod').checked ? 0.45 : 0;
  let wholeData = document.getElementById('data').value.split('\n').map(i => i.split('\t').filter(j => j));
  let first = [];
  for (let i of wholeData) {
    if (i.length === 12) {
      first.push(i[0]);
    } else {
      first.push(first[first.length - 1]);
    }
  }
  let heads = wholeData.map((i, ind) => [ind + 1, i[i.length - 10], first[ind], i[i.length - 11]]);
  let nums = wholeData.map(i => i.slice(-9).map(x => +x));
  let decks = nums.map(i => [0, 3, 6].flatMap(j => Array(3 - j / 3).fill(i.slice(j, j + 3))));
  let cards = decks.flat();
  let scoreDeck = deck => deck.map(score).reduce((a, b) => a + b) / deck.length;
  let score = card => cards.map(i => winChance(...card, 0.5 + mod, ...i, 0.5)).reduce((a, b) => a + b) / cards.length;
  let x = decks.map(i => [scoreDeck(i), score(i[0]), score(i[3]), score(i[5])]);
  document.getElementById('result').innerText = heads.map((i, ind) => i.concat(x[ind].map(j => (j * 100).toFixed(2) + '%')).join(',')).join('\n');
}
