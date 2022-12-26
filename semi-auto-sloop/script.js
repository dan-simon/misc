// OK it's plausibly best to write most of this from scratch

let size = 5;
let spaces;
let tds = [];
let state = [];
let solving = false;
let hover = 0;
let checkerboard = false;
let edges = {};
let edgeEl = {};

let press = function (key) {
  if (key.length === 1) {
    key = 'Key' + key.toUpperCase();
  }
  if (key === 'KeyL') {
    checkNumberOfConnections();
  }
  if (key === 'KeyP') {
    parityCalc();
  }
  if (key === 'KeyE') {
    expand();
  }
  if (key === 'KeyH') {
    clearHighlighting();
  }
  if (key === 'KeyO') {
    alterHover();
  }
  if (key === 'KeyS') {
    toggleShading();
  }
}

window.onload = function () {
  window.addEventListener("keydown", function(event) {
    if (event.defaultPrevented) return;
    press(event.code);
    event.preventDefault();
  }, true);
  initGrid(size);
}

let recolorGrid = function () {
  if (checkerboard) {
    for (let i = 0; i < tds.length; i++) {
      for (let j = 0; j < tds[i].length; j++) {
        tds[i][j].style.backgroundColor = [['#aaaaaa', '#000000', '#33cc33'], ['#ffffff', '#000000', '#55ff55']][(i + j) % 2][+state[i][j]];
      }
    }
  } else {
    for (let i = 0; i < tds.length; i++) {
      for (let j = 0; j < tds[i].length; j++) {
        tds[i][j].style.backgroundColor = ['#ffffff', '#000000', '#55ff55'][+state[i][j]];
      }
    }
  }
}

let redrawEdges = function () {
  for (let i in edges) {
    if (edges[i] < 1) {
      edgeEl[i].style.backgroundColor = '';
      edgeEl[i].innerText = '';
    } else if (edges[i] === 1) {
      edgeEl[i].style.backgroundColor = '#55aaaa';
      edgeEl[i].innerText = '';
    } else if (edges[i] === 2) {
      edgeEl[i].style.backgroundColor = '';
      edgeEl[i].innerText = '\u00d7';
    }
  }
}

let checkNumberOfConnections = function () {
  if (!solving) {
    alert('Not solving!');
    return;
  }
  let u = {};
  for (let ind of inds()) {
    if (at(state, ind) === 1) {
      continue;
    }
    let e = edgesFrom(ind);
    let v = e.map(i => edges[i]);
    if (v.filter(i => i === 1).length > 2 || v.filter(i => i === 2).length > v.length - 2) {
      alert('Contradiction!');
      return;
    }
    if (v.filter(i => i === 1).length === 2) {
      for (let i of e) {
        if (edges[i] === 0) {
          if (u[i] !== undefined && u[i] !== 2) {
            alert('Contradiction!');
            return;
          }
          u[i] = 2;
        }
      }
    }
    if (v.filter(i => i === 2).length === v.length - 2) {
      for (let i of e) {
        if (edges[i] === 0) {
          if (u[i] !== undefined && u[i] !== 1) {
            alert('Contradiction!');
            return;
          }
          u[i] = 1;
        }
      }
    }
  }
  for (let i in u) {
    edges[i] = u[i];
  }
  redrawEdges();
}

let parity = i => (i[0] + i[1]) % 2;

let rawParityCalc = function (rawCells, notify) {
  if (rawCells.length === spaces) {
    if (notify) {
      alert('Full region!');
    }
    return;
  }
  if (rawCells.length === 0) {
    if (notify) {
      alert('Empty region!');
    }
    return;
  }
  let cellSet = {};
  for (let [i, j] of rawCells) {
    cellSet[i + ',' + j] = true;
  }
  let cells = rawCells.map(parity);
  let cross = rawCells.flatMap(i => edgesFrom(i).map(e => [parity(i), e])).filter(
    i => [0, 1].includes(edges[i[1]]) && i[1].split('-').some(j => !(j in cellSet))).map(
    i => i.concat([edges[i[1]]]));
  let requiredParity = 2 * cells.map(i => 2 * i - 1).reduce((a, b) => a + b, 0);
  let usedParity = cross.filter(i => i[2] === 1).map(i => 2 * i[0] - 1).reduce((a, b) => a + b, 0);
  let extraParity = requiredParity - usedParity;
  let c0 = cross.filter(i => i[0] === 0 && i[2] === 0);
  let c1 = cross.filter(i => i[0] === 1 && i[2] === 0);
  if (notify) {
    document.getElementById('parity').innerText = requiredParity + ' required parity, ' + usedParity + ' used, ' + extraParity + ' remaining. Options: ' + c0.length + ' minus, ' + c1.length + ' plus';
  }
  if (requiredParity === 0) {
    if (cross.filter(i => i[0] === 0).length === 0 || cross.filter(i => i[0] === 1).length === 0) {
      alert('Contradiction!');
      return;
    }
    if (cross.filter(i => i[0] === 0).length === 1) {
      let c = cross.filter(i => i[0] === 0)[0];
      if (c[2] !== 1) {
        edges[c[1]] = 1;
      }
    }
    if (cross.filter(i => i[0] === 1).length === 1) {
      let c = cross.filter(i => i[0] === 1)[0];
      if (c[2] !== 1) {
        edges[c[1]] = 1;
      }
    }
  }
  if (c0.length < -extraParity || c1.length < extraParity) {
    alert('Contradiction!');
    return;
  }
  if (c0.length === -extraParity ) {
    for (let i of cross.filter(i => i[2] === 0)) {
      edges[i[1]] = (i[0] === 0) ? 1 : 2;
    }
  }
  if (c1.length === extraParity ) {
    for (let i of cross.filter(i => i[2] === 0)) {
      edges[i[1]] = (i[0] === 1) ? 1 : 2;
    }
  }
}

let parityCalc = function () {
  let rawCells = inds().filter(i => at(state, i) == 2);
  rawParityCalc(rawCells, true);
  redrawEdges();
}

let getClickFunction = function (i, j) {
  return function (e) {
    hover = 0;
    clickCell(i, j, e.shiftKey);
  }
}

let getMouseoverFunction = function (i, j) {
  return function (e) {
    if (hover !== 0 && solving) {
      clickCell(i, j, e.shiftKey, [null, 2, 0][hover]);
    }
  }
}

let expand = function () {
  let r = getAllCC();
  // This somewhat depends on order, but not if you hold it
  for (let i of r) {
    rawParityCalc(i, false);
  }
  redrawEdges();
}

let getAllCC = function () {
  let r = [];
  let allSeen = {};
  for (let [i, j] of inds()) {
    if (state[i][j] === 1 || i + ',' + j in allSeen) {
      continue;
    }
    let seen = getCC(i, j);
    r.push(Object.keys(seen).map(i => i.split(',').map(n => +n)));
    for (let k in seen) {
      allSeen[k] = true;
    }
  }
  return r;
}

let getCC = function (i, j) {
  let seenCells = {};
  let lastCells = {};
  lastCells[i + ',' + j] = true;
  let thisCells = {};
  while (true) {
    if (Object.keys(lastCells).length === 0) {
      break;
    }
    for (let i in lastCells) {
      seenCells[i] = true;
    }
    thisCells = {};
    for (let i in lastCells) {
      for (let j of edgesFrom(i.split(',').map(n => +n)).filter(e => edges[e] === 1)) {
        for (let k of j.split('-')) {
          if (!(k in seenCells)) {
            thisCells[k] = true;
          }
        }
      }
    }
    lastCells = thisCells;
    thisCells = {};
  }
  return seenCells;
}

let clickCell = function (i, j, shiftKey, val) {
  if (solving) {
    if (state[i][j] === 1) {
      return;
    }
    if (shiftKey) {
      let v = (val !== undefined) ? val : (2 - state[i][j]);
      let seenCells = getCC(i, j);
      for (let i in seenCells) {
        let ind = i.split(',').map(n => +n);
        state[ind[0]][ind[1]] = v;
      }
    } else {
      state[i][j] = (val !== undefined) ? val : (2 - state[i][j]);
    }
  } else {
    state[i][j] = (val !== undefined) ? val : (1 - state[i][j]);
  }
  recolorGrid();
}

let neighbors = function (x) {
  let r = [[x[0] - 1, x[1]], [x[0] + 1, x[1]], [x[0], x[1] - 1], [x[0], x[1] + 1]];
  return r.filter(i => i.every(j => 0 <= j && j < size));
}

let inds = function () {
  return [...Array(size)].flatMap((_, i) => [...Array(size)].map((_, j) => [i, j]));
}

let allEdges = function () {
  let a = inds();
  let pairs = a.flatMap(i => neighbors(i).map(j => [i, j])).filter(i => i[0][0] * size + i[0][1] < i[1][0] * size + i[1][1]);
  return pairs.map(i => i.map(j => j.join(',')).join('-'));
}

let edgesFrom = function (x) {
  let pairs = neighbors(x).map(i => [x, i]).map(i => (i[0][0] * size + i[0][1] < i[1][0] * size + i[1][1]) ? [i[0], i[1]] : [i[1], i[0]]);
  return pairs.map(i => i.map(j => j.join(',')).join('-')).filter(i => edges[i] !== -1);
}

let getPos = function (e) {
  let nums = e.split('-').map(i => i.split(','));
  return [0, 1].flatMap(i => [Math.min(...nums.map(j => j[i])) * 30 + 16 - 5, (size - 1 - Math.max(...nums.map(j => j[i]))) * 30 + 16 - 5]).concat([nums[0][0] === nums[1][0]])
}

let at = function (a, v) {
  return a[v[0]][v[1]];
}

let usedEdges = function () {
  let e = allEdges();
  return e.filter(i => i.split('-').every(j => at(state, j.split(',')) !== 1));
}

let rawClearHighlighting = function () {
  for (let i = 0; i < tds.length; i++) {
    for (let j = 0; j < tds[i].length; j++) {
      state[i][j] = state[i][j] === 1 ? 1 : 0;
    }
  }
}

let clearHighlighting = function () {
  rawClearHighlighting();
  recolorGrid();
}

let alterHover = function () {
  hover = (hover + 1) % 3;
}

let toggleShading = function () {
  checkerboard = !checkerboard;
  recolorGrid();
}

let toggleSolving = function () {
  if (solving) {
    solving = false;
    rawClearHighlighting();
    for (let i of allEdges()) {
      edges[i] = -1;
    }
  } else {
    solving = true;
    spaces = inds().filter(i => state[i[0]][i[1]] !== 1).length;
    for (let i of usedEdges()) {
      edges[i] = 0;
    }
  }
  recolorGrid();
  redrawEdges();
}

let changeSize = function () {
  initGrid(+prompt('New size?'));
}

let importPuzzle = function () {
  let r = prompt('Puzzle url?');
  let parts = r.split('/').filter(i => i).slice(-3);
  if (parts.length === 0) {
    alert('Must be nonempty!');
    return;
  }
  let newSize;
  if (parts.length === 1) {
    newSize = size;
  } else if (parts.length === 2) {
    newSize = +parts[0];
  } else {
    if (+parts[0] !== +parts[1]) {
      alert('Height and width must be equal (for now)!');
      return;
    }
    newSize = +parts[0];
  }
  initGrid(newSize);
  let data = [...parts[parts.length - 1]].flatMap(i => [...(parseInt(i, 32) + 32).toString(2).slice(1)]).map(i => +i);
  if (data.slice(newSize * newSize).some(i => i === 1)) {
    alert('Too much data!');
    return;
  }
  for (let i = 0; i < Math.min(data.length, newSize * newSize); i++) {
    state[Math.floor(i / size)][i % size] = data[i];
  }
  toggleSolving();
  recolorGrid();
}

let initGrid = function (n) {
  size = n;
  state = [...Array(n)].map(() => [...Array(n)].map(() => false));
  tds = [...Array(n)].map(() => [...Array(n)].map(() => null));
  let d = document.getElementById('d');
  while (d.children.length > 0) {
    d.removeChild(d.children[0]);
  }
  let tbody = document.createElement('tbody');
  for (let i = 0; i < size; i++) {
    let tr = document.createElement('tr');
    for (let j = 0; j < size; j++) {
      let td = document.createElement('td');
      tds[i][j] = td;
      td.style.height = '30px';
      td.style.width = '26px';
      td.style.border = '2px solid black';
      td.style.margin = '0px';
      td.onclick = getClickFunction(i, j);
      td.onmouseover = getMouseoverFunction(i, j);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  let table = document.createElement('table');
  table.style.borderCollapse = 'collapse';
  table.style.textAlign = 'center';
  table.style.fontSize = '20px';
  table.style.height = (30 * size + 2) + 'px';
  table.style.width = (30 * size + 2) + 'px';
  table.style.position = 'relative';
  table.appendChild(tbody);
  d.appendChild(table);
  for (let i of allEdges()) {
    // Create a bunch of edge HTML elements
    let e = document.createElement('div');
    e.style.position = 'absolute';
    let pos = getPos(i);
    e.style.top = pos[0] + 'px';
    e.style.bottom = pos[1] + 'px';
    e.style.left = pos[2] + 'px';
    e.style.right = pos[3] + 'px';
    e.style.lineHeight = (30 * size + 2 - pos[0] - pos[1] - 5) + 'px';
    e.style.color = '#55aaaa';
    e.style.pointerEvents = 'none';
    edgeEl[i] = e;
    table.appendChild(e);
  }
  solving = true;
  toggleSolving();
};
