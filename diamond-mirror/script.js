'use strict';

class Puzzle {
  constructor(pn, num, data, state, checkOn) {
    this.name = pn;
    this.grid = document.getElementById(pn);
    this.init(num, data, state, checkOn);
  }
  reset() {
    while (this.grid.children.length > 0) {
      this.grid.removeChild(this.grid.children[0]);
    }
  }
  init(num, data, state, checkOn) {
    this.solved = false;
    this.fullyInitialized = false;
    this.stateChanged = false;
    this.state = state;
    this.num = num;
    this.data = data;
    this.checkOn = checkOn;
    this.grid.style.height = `${data.size * 50 + (hasBottomText(data) ? 185 : 150)}px`;
    this.grid.style.width = `${data.size * 50 + 150}px`;
    this.size = data.size;
    this.used = [];
    this.els = {};
    this.makeExtraInfo();
    this.createGridEdges();
    this.grid.onclick = e => this.diamondManip(...coords(this.grid, e));
    this.grid.oncontextmenu = e => {
      e.preventDefault();
      this.addX(...coords(this.grid, e));
    }
    this.initState();
    this.fullyInitialized = true;
    this.recomputeEdgePaths();
    if (this.check()) {
      this.solvePuzzle();
      this.recomputeEdgePaths();
    }
  }
  save() {
    if (this.stateChanged) {
      savePuzzle(this.num, this.state);
      this.stateChanged = false;
    }
  }
  initState() {
    this.state.used.forEach(i => this.createDiamond(i[0], i[1], true));
    this.state.xs.forEach(i => this.addX(i[0], i[1]));
  }
  createDiamond(x, y, removable) {
    let xe = this.els[`x,${x},${y}`];
    if (xe !== undefined) {
      xe.parentNode.removeChild(xe);
      delete this.els[`x,${x},${y}`]
    }
    let d = document.createElement('div');
    d.className = 'overlay diamond';
    if (!removable) {
      d.style.backgroundColor = 'gray';
    }
    d.style.left = `${50 * x + 50}px`;
    d.style.top = `${50 * y + 50}px`;
    if (removable) {
      d.onclick = e => {
        if (this.solved) return;
        e.stopPropagation();
        d.parentNode.removeChild(d);
        this.used = this.used.filter(i => i[0] !== x || i[1] !== y);
        this.state.used = this.state.used.filter(i => i[0] !== x || i[1] !== y);
        this.stateChanged = true;
        this.recomputeEdgePaths();
      }
      d.oncontextmenu = e => {
        if (this.solved) return;
        e.preventDefault();
        d.parentNode.removeChild(d);
        this.used = this.used.filter(i => i[0] !== x || i[1] !== y);
        this.state.used = this.state.used.filter(i => i[0] !== x || i[1] !== y);
        this.stateChanged = true;
        this.recomputeEdgePaths();
      }
    }
    this.grid.appendChild(d);
    this.used.push([x, y]);
    if (this.fullyInitialized) {
      this.state.used.push([x, y]);
      this.stateChanged = true;
      this.recomputeEdgePaths();
    }
  }
  recomputeEdgePaths () {
    this.edgePaths = {};
    let r = [];
    let used = []
    for (let i of this.perimeter) {
      if (used.includes(i)) {
        continue;
      }
      used.push(i);
      let l = [i, adj(i, this.size, this.used)[0]];
      while (!this.perimeter.includes(l[l.length - 1]) && l.length < 100) {
        l.push(adj(l[l.length - 1], this.size, this.used).filter(j => j !== l[l.length - 2])[0]);
      }
      used.push(l[l.length - 1]);
      r.push(l);
    }
    this.edgePathList = r;
    for (let i of r) {
      for (let j of i) {
        this.edgePaths[j] = i;
      }
    }
    if (!this.fullyInitialized) {
      return;
    }
    for (let i of this.edgePathList) {
      let color = getColor(i[0], i[i.length - 1], this.colorTable, this.secColorTable, this.solved);
      if (color !== undefined) {
        for (let c of i) {
          let e = this.els[c];
          e.style.backgroundColor = color;
          e.style.zIndex = (color === 'black' || color === 'lime') ? 0 : 1;
          e.style.display = '';
        }
      }
    }
    for (let i of this.used) {
      for (let c of getEdgesUnder(...i)) {
        this.els[c].style.display = 'none';
      }
    }
  }
  addHoverProps(e, k) {
    e.addEventListener('mouseenter', () => {
      if (k in this.edgePaths) {
        this.edgePaths[k].forEach(i => this.els[i].classList.add('highlight'));
      }
    });
    e.addEventListener('mouseleave', () => {
      this.grid.querySelectorAll(':scope > .highlight').forEach(i => i.classList.remove('highlight'));
    });
  }
  createGridEdges() {
    this.perimeter = [];
    for (let x = -1; x <= this.size; x++) {
      for (let y = 0; y <= this.size; y++) {
        let e = document.createElement('div');
        e.id = `${this.name},horizontal,${x},${y}`;
        if (x === -1 || x === this.size) {
          this.perimeter.push(`horizontal,${x},${y}`);
        }
        e.className = (x === -1 || x === this.size) ? 'overlay horizontal-half' : 'overlay horizontal';
        e.style.left = x == -1 ? '50px' : `${50 * x + 75 - 2}px`;
        e.style.top = `${50 * y + 75 - 2}px`;
        e.onclick = ev => ev.stopPropagation();
        this.addHoverProps(e, `horizontal,${x},${y}`);
        this.grid.appendChild(e);
        this.els[`horizontal,${x},${y}`] = e;
      }
    }
    for (let x = 0; x <= this.size; x++) {
      for (let y = -1; y <= this.size; y++) {
        let e = document.createElement('div');
        e.id = `${this.name},vertical,${x},${y}`;
        if (y === -1 || y === this.size) {
          this.perimeter.push(`vertical,${x},${y}`);
        }
        e.className = (y === -1 || y === this.size) ? 'overlay vertical-half' : 'overlay vertical';
        e.style.left = `${50 * x + 75 - 2}px`;
        e.style.top = y == -1 ? '50px' : `${50 * y + 75 - 2}px`;
        e.onclick = ev => ev.stopPropagation();
        this.addHoverProps(e, `vertical,${x},${y}`);
        this.grid.appendChild(e);
        this.els[`vertical,${x},${y}`] = e;
      }
    }
  }
  check() {
    if (!this.checkOn) {
      return false;
    }
    if (this.used.length !== this.size) {
      return false;
    }
    let firsts = this.used.map(i => i[0]);
    let seconds = this.used.map(i => i[1]);
    if (new Set(firsts).size !== this.size || new Set(seconds).size !== this.size) {
      return false;
    }
    if (this.data.given.some(i => !this.used.some(j => j[0] === i[0] && j[1] === i[1]))) {
      return false;
    }
    let byEnd = {};
    for (let i of this.edgePathList) {
      byEnd[i[0]] = i;
      byEnd[i[i.length - 1]] = i;
    }
    for (let i of this.data.turns) {
      if (turns(byEnd[i[0]]) !== i[1]) {
        return false;
      }
    }
    for (let i of this.data.pairs) {
      // List equality by literally the same list is good here
      if (byEnd[i[0]] !== byEnd[i[1]]) {
        return false;
      }
    }
    let turnCounts = this.edgePathList.map(turns);
    for (let i of this.data.turnCounts) {
      if (turnCounts.filter(j => j === i[0]).length !== i[1]) {
        return false;
      }
    }
    for (let i of this.data.pairCounts) {
      if (new Set(i[0].map(j => byEnd[j])).size !== i[0].length - i[1]) {
        return false;
      }
    }
    return true;
  }
  placeText(x, y, text, color, id) {
    let e = document.createElement('span');
    if (id) {
      e.id = id;
    }
    e.style.color = color;
    e.style.left = `${x * 50 + 75}px`;
    e.style.top = `${y * 50 + 75}px`;
    e.textContent = text;
    e.style.fontSize = text === '⬤' ? '24px' : '30px';
    e.style.position = 'absolute';
    e.style.transform = 'translate(-50%, -50%)';
    e.style.textAlign = 'center';
    this.grid.appendChild(e);
    return e;
  }
  placeRectangle(a, b, color) {
    let o = 2;
    let e = document.createElement('div');
    e.style.position = 'absolute';
    e.style.left = `${a[0] * 50 + 75 - o}px`;
    e.style.top = `${a[1] * 50 + 75 - o}px`;
    e.style.width = `${(b[0] - a[0]) * 50 + 2 * o}px`;
    e.style.height = `${(b[1] - a[1]) * 50 + 2 * o}px`;
    e.style.backgroundColor = color;
    this.grid.appendChild(e);
  }
  // You need to be careful when defining puzzles to not cover stuff up.
  addRegionOutside(cells, color, used, placed) {
    let stretches = [];
    let s = new Set(cells);
    for (let i of cells) {
      if (s.has(i)) {
        stretches.push([reachBack(i, s), reachForward(i, s)]);
      }
    }
    for (let i of stretches) {
      if (i[0] === i[1]) {
        if (i[0] in placed && !placed[i[0]][1]) {
          placed[i[0]][0].style.color = color;
        } else if (used.includes(i[0])) {
          this.placeRectangle(position(adjDown(i[0]), 2, this.size), position(adjUp(i[0]), 2, this.size), color);
        } else {
          this.placeText(...position(i[0], 0, this.size), '⬤', color);
        }
      } else {
        this.placeRectangle(position(i[0], 2, this.size), position(i[1], 2, this.size), color);
      }
    }
  }
  makeExtraInfo() {
    this.colorTable = {};
    this.secColorTable = {};
    this.data.given.forEach(i => this.createDiamond(i[0], i[1], false));
    let cellsInPairCounts = this.data.pairCounts.map(i => i[0]).flatMap(i => i);
    let cellsInNormalClues = this.data.pairs.flatMap(i => i).concat(this.data.turns.map(i => i[0]));
    let turnNums = Object.fromEntries(this.data.turns);
    let labeled = [];
    let colNum = 0;
    let alreadyPlaced = {};
    for (let i of this.data.turns) {
      alreadyPlaced[i[0]] = [this.placeText(...position(i[0], cellsInPairCounts.includes(i[0]) ? 1 : 0, this.size), i[1], 'black'), false];
    }
    for (let i of this.data.pairs) {
      for (let it of i) {
        if (it in alreadyPlaced) {
          alreadyPlaced[it][0].style.color = colors[colNum];
          alreadyPlaced[it][1] = true;
        } else {
          this.placeText(...position(it, cellsInPairCounts.includes(it) ? 1 : 0, this.size), '⬤', colors[colNum]);
        }
        this.colorTable[it] = colors[colNum];
      }
      colNum++;
    }
    let num = this.data.turnCounts.length + this.data.pairCounts.length;
    let hor = this.size / 2 - (num - 1);
    for (let i of this.data.turnCounts) {
      this.placeText(hor, this.size + 1.55, `${i[0]} ×${i[1]}`, 'black');
      hor += 2;
    }
    for (let i of this.data.pairCounts) {
      this.addRegionOutside(i[0], colors[colNum], cellsInNormalClues, alreadyPlaced);
      for (let j of i[0]) {
        if (i[0].length !== 2 * i[1] || j in this.colorTable) {
          this.secColorTable[j] = colors[colNum];
        } else {
          this.colorTable[j] = colors[colNum];
        }
      }
      if (i[0].length !== 2 * i[1]) {
        this.placeText(hor, this.size + 1.55, `×${i[1]}`, colors[colNum]);
      }
      colNum++;
      hor += 2;
    }
  }
  addX(rx, ry) {
    if (this.solved) return;
    let x = Math.round(rx);
    let y = Math.round(ry);
    if (Math.min(x, y) < 0 || Math.max(x, y) >= this.size) return;
    // Something has gone wrong, this should remove the diamond
    // Unless it's not removable in which case we don't want an x.
    if (this.used.some(i => i[0] === x && i[1] === y)) return;
    let xe = this.els[`x,${x},${y}`];
    if (xe !== undefined) {
      xe.parentNode.removeChild(xe);
      delete this.els[`x,${x},${y}`];
      this.state.xs = this.state.xs.filter(i => i[0] !== x || i[1] !== y);
      this.stateChanged = true;
    } else {
      this.els[`x,${x},${y}`] = this.placeText(x + 0.5, y + 0.45, '×', 'red', `${this.name},x,${x},${y}`);
      this.els[`x,${x},${y}`].className = 'x';
      this.state.xs.push([x, y]);
      this.stateChanged = true;
    }
  }
  solvePuzzle() {
    this.solved = true;
    this.state.solved = true;
    let u = document.getElementById(`u${this.num}`);
    if (u !== null) {
      u.style.backgroundColor = 'lime';
    }
    for (let i in this.els) {
      if (i.startsWith('x')) {
        let xe = this.els[i];
        xe.parentNode.removeChild(xe);
        delete this.els[i];
      }
    }
  }
  diamondManip(rx, ry) {
    if (this.solved) return;
    let x = Math.round(rx);
    let y = Math.round(ry);
    if (Math.min(x, y) < 0 || Math.max(x, y) >= this.size) return;
    if (this.used.some(i => i[0] === x || i[1] === y)) return;
    this.createDiamond(x, y, true);
    if (this.check()) {
      this.solvePuzzle();
      this.recomputeEdgePaths();
      this.save();
    }
  }
}

let adj = function (s, size, used) {
  let r = [];
  let parts = s.split(',');
  let x = +parts[1];
  let y = +parts[2];
  if (parts[0] === 'horizontal') {
    let prev = used.filter(i => i[0] === x - 1);
    if (prev.length > 0 && prev[0][1] === y - 1) {
      r.push(`vertical,${x},${y}`);
    } else if (prev.length > 0 && prev[0][1] === y) {
      r.push(`vertical,${x},${y - 1}`);
    } else {
      r.push(`horizontal,${x - 1},${y}`);
    }
    let next = used.filter(i => i[0] === x + 1);
    if (next.length > 0 && next[0][1] === y - 1) {
      r.push(`vertical,${x + 1},${y}`);
    } else if (next.length > 0 && next[0][1] === y) {
      r.push(`vertical,${x + 1},${y - 1}`);
    } else {
      r.push(`horizontal,${x + 1},${y}`);
    }
  } else if (parts[0] === 'vertical') {
    let prev = used.filter(i => i[1] === y - 1);
    if (prev.length > 0 && prev[0][0] === x - 1) {
      r.push(`horizontal,${x},${y}`);
    } else if (prev.length > 0 && prev[0][0] === x) {
      r.push(`horizontal,${x - 1},${y}`);
    } else {
      r.push(`vertical,${x},${y - 1}`);
    }
    let next = used.filter(i => i[1] === y + 1);
    if (next.length > 0 && next[0][0] === x - 1) {
      r.push(`horizontal,${x},${y + 1}`);
    } else if (next.length > 0 && next[0][0] === x) {
      r.push(`horizontal,${x - 1},${y + 1}`);
    } else {
      r.push(`vertical,${x},${y + 1}`);
    }
  }
  return r.filter(i => -1 <= +i.split(',')[1] && +i.split(',')[1] <= size &&
  -1 <= +i.split(',')[2] && +i.split(',')[2] <= size);
}

let getColor = function (p, q, colorTable, secColorTable, solved) {
  let a = colorTable[p];
  let b = colorTable[q];
  if (a !== undefined && b !== undefined) {
    return a === b ? b : 'brown';
  }
  if (a !== undefined || b !== undefined) {
    return a || b;
  }
  let a2 = secColorTable[p];
  let b2 = secColorTable[q];
  if (a2 !== undefined && a2 === b2) {
    return a2;
  }
  return solved ? 'lime' : 'black';
}

let getEdgesUnder = function (x, y) {
  return [`horizontal,${x},${y}`, `horizontal,${x},${y + 1}`, `vertical,${x},${y}`, `vertical,${x + 1},${y}`];
}

let puzzles = [
  {
    size: 1,
    given: [],
    turns: [],
    pairs: [],
    turnCounts: [],
    pairCounts: []
  },
  {
    size: 2,
    given: [[0, 0]],
    turns: [],
    pairs: [],
    turnCounts: [],
    pairCounts: []
  },
  {
    size: 3,
    given: [],
    turns: [['horizontal,-1,1', 3]],
    pairs: [],
    turnCounts: [],
    pairCounts: []
  },
  {
    size: 3,
    given: [],
    turns: [],
    pairs: [['horizontal,-1,2', 'vertical,2,-1']],
    turnCounts: [],
    pairCounts: []
  },
  {
    size: 3,
    given: [[0, 0]],
    turns: [],
    pairs: [],
    turnCounts: [[3, 0]],
    pairCounts: []
  },
  {
    size: 3,
    given: [],
    turns: [],
    pairs: [],
    turnCounts: [],
    pairCounts: [[['horizontal,-1,0', 'horizontal,-1,1', 'vertical,0,-1', 'vertical,2,-1'], 2]]
  },
  {
    size: 3,
    given: [],
    turns: [['horizontal,-1,1', 1]],
    pairs: [['horizontal,-1,0', 'vertical,1,-1']],
    turnCounts: [],
    pairCounts: []
  },
  {
    size: 3,
    given: [],
    turns: [],
    pairs: [],
    turnCounts: [],
    pairCounts: [[['horizontal,-1,0', 'horizontal,-1,1', 'horizontal,-1,2', 'horizontal,-1,3',
    'vertical,0,-1', 'vertical,1,-1', 'vertical,2,-1', 'vertical,3,-1'], 3]]
  },
  {
    size: 4,
    given: [],
    turns: [['vertical,1,-1', 2]],
    pairs: [],
    turnCounts: [],
    pairCounts: []
  },
  {
    size: 4,
    given: [],
    turns: [['vertical,1,-1', 4]],
    pairs: [],
    turnCounts: [],
    pairCounts: []
  },
  {
    size: 4,
    given: [],
    turns: [],
    pairs: [],
    turnCounts: [],
    pairCounts: [[['horizontal,-1,0', 'horizontal,4,0', 'horizontal,4,3', 'vertical,1,-1', 'vertical,2,-1', 'vertical,3,4'], 3]],
  },
  {
    size: 4,
    given: [],
    turns: [],
    pairs: [],
    turnCounts: [],
    pairCounts: [[['horizontal,-1,0', 'horizontal,4,0', 'horizontal,4,3', 'vertical,1,-1', 'vertical,2,-1', 'vertical,3,4'], 0]],
  },
  {
    size: 4,
    given: [],
    turns: [],
    pairs: [],
    turnCounts: [],
    pairCounts: [[['horizontal,-1,1', 'vertical,1,-1', 'horizontal,4,1', 'vertical,2,4'], 2]]
  },
  {
    size: 5,
    given: [[0, 1]],
    turns: [],
    pairs: [],
    turnCounts: [[1, 8]],
    pairCounts: []
  },
  {
    size: 5,
    given: [[1, 1]],
    turns: [],
    pairs: [],
    turnCounts: [[5, 1]],
    pairCounts: []
  },
  {
    size: 5,
    given: [],
    turns: [['vertical,2,-1', 3], ['vertical,4,-1', 4]],
    pairs: [],
    turnCounts: [],
    pairCounts: []
  },
  {
    size: 5,
    given: [],
    turns: [['horizontal,-1,1', 3]],
    pairs: [['vertical,4,5', 'horizontal,-1,2']],
    turnCounts: [],
    pairCounts: []
  },
  {
    size: 6,
    given: [],
    turns: [['horizontal,-1,4', 3], ['vertical,4,-1', 3]],
    pairs: [['horizontal,-1,4', 'vertical,4,-1'], ['horizontal,-1,5', 'vertical,5,-1']],
    turnCounts: [],
    pairCounts: [],
  },
  {
    size: 6,
    given: [[3, 0]],
    turns: [],
    pairs: [['vertical,2,-1', 'horizontal,-1,2']],
    turnCounts: [],
    pairCounts: [[['vertical,0,-1', 'vertical,1,-1', 'vertical,2,-1', 'vertical,3,-1',
    'vertical,4,-1', 'vertical,5,-1', 'vertical,6,-1',
    'vertical,0,6', 'vertical,1,6', 'vertical,2,6', 'vertical,3,6',
    'vertical,4,6', 'vertical,5,6', 'vertical,6,6',
    ], 2]]
  },
  {
    size: 6,
    given: [],
    turns: [],
    pairs: [],
    turnCounts: [],
    pairCounts: [[['horizontal,-1,4', 'horizontal,6,3', 'vertical,5,-1', 'vertical,2,6'], 2]]
  },
  {
    size: 6,
    given: [],
    turns: [['vertical,4,6', 1], ['horizontal,-1,2', 1], ['horizontal,-1,5', 3]],
    pairs: [['vertical,4,6', 'horizontal,-1,2']],
    turnCounts: [],
    pairCounts: []
  },
  {
    size: 7,
    given: [[3, 3]],
    turns: [['horizontal,-1,2', 1], ['horizontal,-1,5', 1], ['vertical,2,-1', 1], ['vertical,5,-1', 1]],
    pairs: [],
    turnCounts: [],
    pairCounts: [[['horizontal,-1,2', 'horizontal,-1,5', 'vertical,2,-1', 'vertical,5,-1'], 2]],
  },
  {
    size: 7,
    given: [],
    turns: [],
    pairs: [],
    turnCounts: [],
    pairCounts: [[['vertical,4,7', 'horizontal,-1,1', 'vertical,3,-1', 'horizontal,7,6'], 2]],
  },
  {
    size: 7,
    given: [],
    turns: [['horizontal,-1,1', 4], ['horizontal,7,5', 4], ['vertical,2,-1', 4]],
    pairs: [['horizontal,-1,1', 'horizontal,7,5']],
    turnCounts: [],
    pairCounts: [],
  },
  {
    size: 8,
    given: [[2, 2]],
    turns: [['vertical,1,-1', 2], ['vertical,3,-1', 2], ['vertical,5,-1', 2]],
    pairs: [],
    turnCounts: [],
    pairCounts: []
  },
  {
    size: 8,
    given: [],
    turns: [['vertical,1,-1', 2], ['vertical,2,-1', 2], ['vertical,3,-1', 2]],
    pairs: [],
    turnCounts: [],
    pairCounts: []
  },
  {
    size: 8,
    given: [],
    turns: [],
    pairs: [],
    turnCounts: [[3, 7]],
    pairCounts: [[['horizontal,-1,1', 'vertical,3,-1', 'vertical,2,8', 'horizontal,8,2'], 2]]
  },
  {
    size: 9,
    given: [],
    turns: [],
    pairs: [],
    turnCounts: [],
    pairCounts: [[['vertical,2,-1', 'vertical,4,-1', 'vertical,8,-1', 'vertical,6,9', 'horizontal,9,7', 'horizontal,9,8'], 3]]
  },
  {
    size: 9,
    given: [],
    turns: [['horizontal,-1,1', 4], ['horizontal,9,4', 4], ['vertical,2,-1', 4], ['vertical,4,9', 4]],
    pairs: [],
    turnCounts: [],
    pairCounts: [[['horizontal,-1,1', 'horizontal,9,4', 'vertical,2,-1', 'vertical,4,9'], 2]]
  },
  {
    size: 9,
    given: [[1, 1]],
    turns: [],
    pairs: [],
    turnCounts: [[5, 4]],
    pairCounts: []
  },
  {
    size: 10,
    given: [],
    turns: [['vertical,8,-1', 6], ['vertical,9,-1', 7]],
    pairs: [],
    turnCounts: [],
    pairCounts: [],
  },
  {
    size: 10,
    given: [],
    turns: [['horizontal,-1,2', 1], ['vertical,2,-1', 1], ['horizontal,-1,7', 2], ['horizontal,10,4', 2],
    ['horizontal,10,5', 3], ['vertical,5,10', 3]],
    pairs: [['horizontal,-1,2', 'vertical,2,-1'], ['horizontal,-1,7', 'horizontal,10,4'],
    ['horizontal,10,5', 'vertical,5,10']],
    turnCounts: [],
    pairCounts: [],
  }
];

let makeInit = function (p, n, x) {
  return () => {
    if (n === p.num) {
      return;
    }
    let ol = document.getElementById(`u${p.num}`);
    let ne = document.getElementById(`u${n}`);
    ol.innerText = ol.innerText.slice(1);
    ne.innerText = '*' + ne.innerText;
    if (!p.solved) {
      ol.style.backgroundColor = '';
    }
    p.save();
    savePuzzle(-2, n);
    let c = loadPuzzle(-1);
    let d = loadPuzzle(n);
    p.reset();
    p.init(n, x, d, c);
    if (!p.solved) {
      ne.style.backgroundColor = 'yellow';
    }
  }
}

let loadPuzzle = function (x) {
  return JSON.parse(atob(localStorage.getItem('mirror-puzzles')))[x + 2];
}

let savePuzzle = function (x, d) {
  let states = JSON.parse(atob(localStorage.getItem('mirror-puzzles')));
  states[x + 2] = d;
  localStorage.setItem('mirror-puzzles', btoa(JSON.stringify(states)));
}

window.onload = function () {
  if (localStorage.getItem('mirror-puzzles') === null) {
    localStorage.setItem('mirror-puzzles', btoa(JSON.stringify(
      [0, true].concat([...Array(puzzles.length)].map(() => ({used: [], xs: [], solved: false}))))));
  }
  let pz = JSON.parse(atob(localStorage.getItem('mirror-puzzles')));
  let c = pz[0];
  let p = new Puzzle('grid', c, puzzles[c], pz[c + 2], pz[1]);
  for (let i = 0; i < puzzles.length; i++) {
    let d = document.createElement('button');
    d.id = `u${i}`;
    d.style.backgroundColor = pz[i + 2].solved ? 'lime' : (i === c) ? 'yellow' : '';
    d.innerText = ((i === c) ? '*' : '') + `${i + 1} [${puzzles[i].size}]`;
    d.onclick = makeInit(p, i, puzzles[i]);
    document.body.appendChild(d);
    if ([7, 20].includes(i)) {
      document.body.appendChild(document.createElement('br'));
    }
  }
  document.body.appendChild(document.createElement('br'));
  let check = document.createElement('span');
  check.appendChild(document.createTextNode('✔'));
  let cbox = document.createElement('input');
  cbox.style.marginRight = '20px';
  cbox.type = 'checkbox';
  cbox.checked = pz[1];
  cbox.addEventListener('change', function() {
    // Check if the checkbox is checked or unchecked
    p.checkOn = this.checked;
    if (p.checkOn && p.check()) {
      p.solvePuzzle();
      p.recomputeEdgePaths();
      p.save();
    }
    savePuzzle(-1, p.checkOn);
  });
  check.appendChild(cbox);
  document.body.appendChild(check);
  let help = document.createElement('a');
  help.innerText = '?';
  help.href = 'help.html';
  help.target = '_blank';
  check.appendChild(help);
  /*document.body.appendChild(document.createElement('br'));
  document.body.appendChild(document.createElement('br'));
  let d = document.createElement('button');
  d.innerText = 'Reset';
  // This is the right type of way to reset, or change the state generally.
  d.onclick = () => {
    p.state.used = [];
    p.state.xs = [];
    p.stateChanged = true;
    p.save();
    let n = loadPuzzle(-2);
    let d = loadPuzzle(n);
    p.reset();
    p.init(n, puzzles[n], d);
  }
  document.body.appendChild(d);
  */
  setInterval(() => {
    p.save();
  }, 10000)
}

let turns = function (x) {
  return x.filter((i, ind) => ind > 0 && i[0] !== x[ind - 1][0]).length;
}

let colors = ['red', 'blue', 'orange', 'purple'];

let position = function (s, rect, size) {
  let c = rect ? [null, 1, 0.65][rect] : 0.85;
  let parts = s.split(',');
  let x = +parts[1];
  let y = +parts[2];
  if (parts[0] === 'horizontal') {
    if (x === -1) {
      x = -c;
    } else if (x === size) {
      x = size + c;
    }
  }
  if (parts[0] === 'vertical') {
    if (y === -1) {
      y = -c;
    } else if (y === size) {
      y = size + c;
    }
  }
  return [x, y];
}

let hasBottomText = function (data) {
  return data.turnCounts.length > 0 || data.pairCounts.filter(i => i[0].length !== 2 * i[1]).length > 0;
}

let reachBack = function (v, s) {
  let p = v.split(',');
  p[1] = +p[1];
  p[2] = +p[2];
  let ind = ['vertical', 'horizontal'].indexOf(p[0]) + 1;
  while (true) {
    s.delete(p.join(','));
    p[ind]--;
    if (!s.has(p.join(','))) {
      p[ind]++;
      return p.join(',');
    }
  }
}

let reachForward = function (v, s) {
  let p = v.split(',');
  p[1] = +p[1];
  p[2] = +p[2];
  let ind = ['vertical', 'horizontal'].indexOf(p[0]) + 1;
  while (true) {
    s.delete(p.join(','));
    p[ind]++;
    if (!s.has(p.join(','))) {
      p[ind]--;
      return p.join(',');
    }
  }
}

let adjDown = function (v) {
  let p = v.split(',');
  p[1] = +p[1];
  p[2] = +p[2];
  let ind = ['vertical', 'horizontal'].indexOf(p[0]) + 1;
  p[ind] -= 0.5;
  return p.join(',');
}

let adjUp = function (v) {
  let p = v.split(',');
  p[1] = +p[1];
  p[2] = +p[2];
  let ind = ['vertical', 'horizontal'].indexOf(p[0]) + 1;
  p[ind] += 0.5;
  return p.join(',');
}

let coords = function (grid, e) {
  let rect = grid.getBoundingClientRect();
  return [(e.clientX - rect.left) / 50 - 2, (e.clientY - rect.top) / 50 - 2];
}

