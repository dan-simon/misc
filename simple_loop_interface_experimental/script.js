class Grid {
    initialize(cellStates) {
        this.cells = cellStates;
        const rows = cellStates.length;
        const cols = cellStates[0].length;
        
        this.edges = {};
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (c < cols - 1) {
                    const edgeState = cellStates[r][c] || cellStates[r][c + 1] ? "unused" : "unknown";
                    this.edges[JSON.stringify([[r, c], [r, c + 1]])] = edgeState;
                }
                if (r < rows - 1) {
                    const edgeState = cellStates[r][c] || cellStates[r + 1][c] ? "unused" : "unknown";
                    this.edges[JSON.stringify([[r, c], [r + 1, c]])] = edgeState;
                }
            }
        }
        
        this.highlightedSubset = new Set();
        this.unshadedCount = rows * cols - cellStates.flat().filter(cell => cell).length;
        this.setupTable();
    }
    
    toggleSolveMode() {
      this.solveMode = !this.solveMode;
      this.initialize(this.cells);
    }
    
    setupTable() {
        const table = document.getElementById('gridTable');
        table.replaceChildren();
        table.style.height = (1 + 33 * this.cells.length) + 'px';
        table.style.width = (1 + 33 * this.cells[0].length) + 'px';

        // Create table rows and cells based on the grid cell states
        this.cells.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');
            row.forEach((cell, colIndex) => {
                const td = document.createElement('td');
                td.id = JSON.stringify([rowIndex, colIndex])
                if (cell) {
                    td.classList.add('black');
                }
                if (!cell || !this.solveMode) {
                    // Add click event listener to toggle highlighted status
                    td.addEventListener('click', this.toggleHighlightedSubsetMethod([rowIndex, colIndex]));
                }
                tr.appendChild(td);

                // Add edge elements
                if (colIndex < row.length - 1) {
                    const edge = document.createElement('div');
                    edge.id = JSON.stringify([[rowIndex, colIndex], [rowIndex, colIndex + 1]]);
                    edge.classList.add('edge', 'horizontal');
                    td.appendChild(edge);
                }
                if (rowIndex < this.cells.length - 1) {
                    const edge = document.createElement('div');
                    edge.id = JSON.stringify([[rowIndex, colIndex], [rowIndex + 1, colIndex]]);
                    edge.classList.add('edge', 'vertical');
                    td.appendChild(edge);
                }
            });
            table.appendChild(tr);
        });
    }
    
    updateEdgeDisplay(edgeId) {
      let edge = document.getElementById(edgeId);
      if (this.edges[edgeId] === 'used') {
        edge.classList.add('used');
      } else {
        let div = document.createElement('div');
        div.style.transform = 'translateY(-1.5px)';
        div.style.userSelect = 'none';
        div.innerText = '×';
        edge.appendChild(div);
      }
    }
    
    toggleHighlightedSubsetMethod(cell) {
      return (event) => {
        if (!this.solveMode) {
          this.cells[cell[0]][cell[1]] = !this.cells[cell[0]][cell[1]];
          this.initialize(this.cells);
        } else if (event.shiftKey) {
          this.toggleHighlightedComponent(cell);
        } else {
          this.toggleHighlightedSubset(cell);
        }
      }
    }
    
    toggleHighlightedSubset(cell) {
        if (!this.cells[cell[0]][cell[1]]) {
            const c = JSON.stringify(cell);
            const cellElement = document.getElementById(c);
            if (this.highlightedSubset.has(c)) {
                this.highlightedSubset.delete(c);
                cellElement.classList.remove('highlighted');
            } else {
                this.highlightedSubset.add(c);
                cellElement.classList.add('highlighted');
            }
        }
    }
    
    toggleHighlightedComponent(startingCell) {
        if (!this.cells[startingCell[0]][startingCell[1]]) {
            let isHighlighted = this.highlightedSubset.has(JSON.stringify(startingCell));
            const component = this.getConnectedComponent(startingCell);
            for (const cell of component) {
                const c = JSON.stringify(cell);
                const cellElement = document.getElementById(c);
                if (isHighlighted) {
                    this.highlightedSubset.delete(c);
                    cellElement.classList.remove('highlighted');
                } else {
                    this.highlightedSubset.add(c);
                    cellElement.classList.add('highlighted');
                }
            }
        }
    }
    
    neighbors(cell) {
        const [r, c] = cell;
        const rows = this.cells.length;
        const cols = this.cells[0].length;
        const neighbors = [];

        if (c < cols - 1) {
            neighbors.push([[r, c + 1], JSON.stringify([cell, [r, c + 1]])]);
        }
        if (r < rows - 1) {
            neighbors.push([[r + 1, c], JSON.stringify([cell, [r + 1, c]])]);
        }
        if (c > 0) {
            neighbors.push([[r, c - 1], JSON.stringify([[r, c - 1], cell])]);
        }
        if (r > 0) {
            neighbors.push([[r - 1, c], JSON.stringify([[r - 1, c], cell])]);
        }

        return neighbors;
    }
    
    clearHighlightedSubset() {
        this.highlightedSubset.forEach(cellStr => {
            document.getElementById(cellStr).classList.remove('highlighted');
        });
        this.highlightedSubset.clear();
    }
    
    getConnectedComponent(cell) {
        const rows = this.cells.length;
        const cols = this.cells[0].length;
        const component = [];
        const visited = new Set();
        const stack = [cell];

        while (stack.length > 0) {
            const cell = stack.pop();
            const cellStr = JSON.stringify(cell);
            if (visited.has(cellStr)) continue;
            visited.add(cellStr);
            component.push(cell);

            for (let [[i, j], _] of this.neighbors(cell).filter(([_, edge]) => this.edges[edge] === 'used')) {
              stack.push([i, j]);
            }
        }
        return component;
    }

    buildConnectedComponents() {
        const rows = this.cells.length;
        const cols = this.cells[0].length;
        const components = [];
        const visited = new Set();

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = [r, c];
                const cellStr = JSON.stringify(cell);
                if (!visited.has(cellStr)) {
                    const component = this.getConnectedComponent(cell);
                    components.push(component);
                    component.forEach(c => visited.add(JSON.stringify(c)));
                }
            }
        }

        return components;
    }
    
    getParityInfo(subset) {
        let totalParity = 0;
        const exitingEdges = { used: { 0: 0, 1: 0 }, unknown: { 0: 0, 1: 0 } };
        const exitingEdgesParity = {};
        
        Array.from(subset).forEach(cellStr => {
            const cell = JSON.parse(cellStr);
            totalParity += Math.pow(-1, cell.reduce((a, b) => a + b, 0));
            const neighbors = this.neighbors(cell);
            neighbors.forEach(([neighbor, edge]) => {
                if (!subset.has(JSON.stringify(neighbor)) && this.edges[edge] !== "unused") {
                    const edgeParity = cell.reduce((a, b) => a + b, 0) % 2;
                    exitingEdges[this.edges[edge]][edgeParity]++;
                    exitingEdgesParity[edge] = edgeParity;
                }
            });
        });

        return [totalParity, exitingEdgesParity, exitingEdges.used, exitingEdges.unknown];
    }
    
    adjustEdges(subset) {
        if (subset.size === 0 || subset.size === this.unshadedCount) {
            return;
        }

        const [totalParity, exitParity, usedExits, unknownExits] = this.getParityInfo(subset);
        
        [0, 1].forEach(parity => {
            const x = Math.pow(-1, parity) * (usedExits[parity] - usedExits[1 - parity] + unknownExits[parity]);
            if ((parity === 0 && x < 2 * totalParity) || (parity === 1 && x > 2 * totalParity)) {
                throw new Error("Inconsistent edge states detected.");
            }
            if (2 * totalParity === x) {
                Object.keys(exitParity).forEach(edge => {
                    const state = this.edges[edge];
                    if (state === "unknown") {
                        const edgeParity = exitParity[edge];
                        this.edges[edge] = edgeParity === parity ? "used" : "unused";
                        this.updateEdgeDisplay(edge);
                    }
                });
            }
        });
        
        if (totalParity === 0) {
            [0, 1].forEach(parity => {
                if (usedExits[parity] === 0) {
                    if (unknownExits[parity] === 1) {
                        Object.keys(exitParity).forEach(edge => {
                            const state = this.edges[edge];
                            if (state === "unknown" && exitParity[edge] === parity) {
                                this.edges[edge] = "used";
                                this.updateEdgeDisplay(edge);
                            }
                        });
                    } else if (unknownExits[parity] === 0) {
                        throw new Error("Inconsistent edge states detected.");
                    }
                }
            });
        }
        return true;
    }
    
    parity1() {
      let m = this.cells.length;
      let n = this.cells[0].length;
      let c1 = [...Array(m)].flatMap((_, i) => [...Array(n)].map((_, j) => [i, j])).filter(x => !this.cells[x[0]][x[1]] && (x[0] + x[1]) % 2 === 0).map(i => JSON.stringify(i));
      let c2 = [...Array(m)].flatMap((_, i) => [...Array(n)].map((_, j) => [i, j])).filter(x => !this.cells[x[0]][x[1]] && (x[0] + x[1]) % 2 === 1).map(i => JSON.stringify(i));
      let adj = adjacency(Object.keys(this.edges).filter(i => this.edges[i] !== 'unused').map(i => JSON.parse(i).map(j => JSON.stringify(j))), c1.concat(c2));
      let forced = adjacency(Object.keys(this.edges).filter(i => this.edges[i] === 'used').map(i => JSON.parse(i).map(j => JSON.stringify(j))), c1.concat(c2));
      let f;
      let uf;
      try {
        preliminaryCheck(adj, c1, c2);
        [f, uf] = parity1(adj, forced, c1, c2);
      } catch (e) {
        alert('The parity calculation found a contradiction!');
        return;
      }
      for (let i of f) {
        let n = JSON.stringify(i.map(j => JSON.parse(j)));
        if (n in this.edges) {
          this.edges[n] = 'used';
          this.updateEdgeDisplay(n);
        }
      }
      for (let i of uf) {
        let n = JSON.stringify(i.map(j => JSON.parse(j)));
        if (n in this.edges) {
          this.edges[n] = 'unused';
          this.updateEdgeDisplay(n);
        }
      }
    }
    
    parity2() {
      let m = this.cells.length;
      let n = this.cells[0].length;
      let c1 = [...Array(m)].flatMap((_, i) => [...Array(n)].map((_, j) => [i, j])).filter(x => !this.cells[x[0]][x[1]] && (x[0] + x[1]) % 2 === 0).map(i => JSON.stringify(i));
      let c2 = [...Array(m)].flatMap((_, i) => [...Array(n)].map((_, j) => [i, j])).filter(x => !this.cells[x[0]][x[1]] && (x[0] + x[1]) % 2 === 1).map(i => JSON.stringify(i));
      let adj = adjacency(Object.keys(this.edges).filter(i => this.edges[i] !== 'unused').map(i => JSON.parse(i).map(j => JSON.stringify(j))), c1.concat(c2));
      let forced = adjacency(Object.keys(this.edges).filter(i => this.edges[i] === 'used').map(i => JSON.parse(i).map(j => JSON.stringify(j))), c1.concat(c2));
      let f;
      try {
        preliminaryCheck(adj, c1, c2);
        f = parity2(adj, forced, c1, c2);
      } catch (e) {
        alert('The parity calculation found a contradiction!');
        return;
      }
      for (let i of f) {
        let n = JSON.stringify(i.map(j => JSON.parse(j)));
        if (n in this.edges) {
          this.edges[n] = 'used';
          this.updateEdgeDisplay(n);
        }
      }
    }
    
    dontClosePaths() {
      let m = this.cells.length;
      let n = this.cells[0].length;
      let c1 = [...Array(m)].flatMap((_, i) => [...Array(n)].map((_, j) => [i, j])).filter(x => !this.cells[x[0]][x[1]] && (x[0] + x[1]) % 2 === 0).map(i => JSON.stringify(i));
      let c2 = [...Array(m)].flatMap((_, i) => [...Array(n)].map((_, j) => [i, j])).filter(x => !this.cells[x[0]][x[1]] && (x[0] + x[1]) % 2 === 1).map(i => JSON.stringify(i));
      let adj = adjacency(Object.keys(this.edges).filter(i => this.edges[i] !== 'unused').map(i => JSON.parse(i).map(j => JSON.stringify(j))), c1.concat(c2));
      let forced = adjacency(Object.keys(this.edges).filter(i => this.edges[i] === 'used').map(i => JSON.parse(i).map(j => JSON.stringify(j))), c1.concat(c2));
      let uf;
      try {
        preliminaryCheck(adj, c1, c2);
        uf = dontClosePaths(adj, forced, c1, c2);
      } catch (e) {
        alert('The path calculation found a contradiction!');
        return;
      }
      for (let i of uf) {
        let n = JSON.stringify(i.map(j => JSON.parse(j)));
        if (n in this.edges) {
          this.edges[n] = 'unused';
          this.updateEdgeDisplay(n);
        }
      }
    }
    
    isCompletedState() {
        if (Object.values(this.edges).some(state => state === "unknown")) {
            return false;
        }

        const graph = {};
        Object.entries(this.edges).forEach(([edge, state]) => {
            if (state === "used") {
                const [a, b] = JSON.parse(edge);
                graph[JSON.stringify(a)] = graph[JSON.stringify(a)] || [];
                graph[JSON.stringify(a)].push(b);
                graph[JSON.stringify(b)] = graph[JSON.stringify(b)] || [];
                graph[JSON.stringify(b)].push(a);
            }
        });

        const visited = new Set();
        let currentNode = JSON.parse(Object.keys(graph)[0]);
        while (true) {
            visited.add(JSON.stringify(currentNode));
            const neighbors = graph[JSON.stringify(currentNode)];
            if (neighbors.length !== 2) {
                return false;
            }
            if (neighbors.every(neighbor => visited.has(JSON.stringify(neighbor)))) {
                break;
            }
            currentNode = neighbors.find(neighbor => !visited.has(JSON.stringify(neighbor)));
        }

        if (visited.size !== this.unshadedCount) {
            return false;
        }
        return true;
    }
}

function createButton(text, onClick, key) {
    const button = document.createElement('button');
    button.innerText = text;
    button.onclick = onClick;
    document.body.appendChild(button);
    if (typeof key === 'string') {
        document.addEventListener('keydown', function (event) {
            if (event.key === key) {
                button.click();
            }
        });
    }
}

window.onload = function () {
    // Initialize a grid with some cell states
    const grid = new Grid();
    grid.solveMode = true;
    grid.initialize([[false, false], [false, false]]);
    document.body.appendChild(document.createElement('br'));
    let createSolveButton = function (s, f, c) {
      createButton(s, function () {
        if (grid.solveMode) {
          f();
        }
      }, c);
    }
    createButton('Load puzzle', function () {
        grid.solveMode = false;
        grid.initialize(urlToNestedArray(prompt('Puzzle url?')));
    });
    
    createButton('Toggle solve mode (t)', function () {
        grid.toggleSolveMode();
    }, 't');
    
    createSolveButton('Clear (x)', function () {
        grid.clearHighlightedSubset();
    }, 'x');

    createSolveButton('Parity on selected region (p)', function () {
        grid.adjustEdges(grid.highlightedSubset);
    }, 'p');
    
    createSolveButton('Parity on each cell (l)', function () {
        const rows = grid.cells.length;
        const cols = grid.cells[0].length;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (!grid.cells[r][c]) {
                    grid.adjustEdges(new Set([JSON.stringify([r, c])]));
                }
            }
        }
    }, 'l');
    
    createSolveButton('Parity 1 (1)', function () {
        grid.parity1();
    }, '1');
    
    createSolveButton('Parity 2 (2)', function () {
        grid.parity2();
    }, '2');
    
    createSolveButton('Don\'t close paths (3)', function () {
        grid.dontClosePaths();
    }, '3');

    createSolveButton('Complete? (c)', function () {
        if (grid.isCompletedState()) {
            alert('Yes, complete!');
        } else {
            alert('No, not complete yet. Keep going!');
        }
    }, 'c');
}

function base32CharToBinary(c) {
  const alphabet = "0123456789abcdefghijklmnopqrstuv";
  const index = alphabet.indexOf(c);
  return index.toString(2).padStart(5, '0');
}

function base32Decode(s) {
  let binaryString = '';
  for (let i = 0; i < s.length; i++) {
    binaryString += base32CharToBinary(s[i]);
  }
  return binaryString;
}

function urlToNestedArray(url) {
  const base = 'https://puzz.link/p?simpleloop/';
  if (!url.startsWith(base)) {
    throw new Error('Invalid URL');
  }

  const parts = url.slice(base.length).split('/');
  if (parts.length !== 3) {
    throw new Error('Invalid URL format');
  }

  const width = parseInt(parts[0]);
  const height = parseInt(parts[1]);
  const encodedData = parts[2];

  const binaryString = base32Decode(encodedData);

  const nestedArray = [];
  for (let i = 0; i < height; i++) {
    const row = [];
    for (let j = 0; j < width; j++) {
      const index = i * width + j;
      row.push(index < binaryString.length ? binaryString[index] === '1' : false);
    }
    nestedArray.push(row);
  }
  return nestedArray;
}

let search = function (start, adj, adj2, forced, usage) {
  let wave = [start];
  let step = 0;
  let retrace = {[start]: null};
  while (wave.length > 0) {
    let newWave = [];
    for (let i of wave) {
      if (step % 2 === 1 && usage[i] < 2) {
        let res = [i];
        while (res.at(-1) !== start) {
          res.push(retrace[res.at(-1)]);
        }
        // Note: this modifies res but that's fine
        return res.reverse();
      }
      let opts;
      if (step % 2 === 0) {
        opts = adj[i].filter(k => !adj2[i].includes(k));
      } else {
        opts = adj2[i].filter(k => !forced[i].includes(k));
      }
      for (let j of opts) {
        if (!(j in retrace)) {
          newWave.push(j);
          retrace[j] = i;
        }
      }
    }
    wave = newWave;
    step++;
  }
  return null;
}

let findParity = function (adj, forced, c1, c2) {
  let adj2 = Object.fromEntries(c1.concat(c2).map(i => [i, forced[i].slice()]));
  if (Object.values(adj2).some(i => i.length > 2)) {
    throw new Error('Puzzle is broken');
  }
  let usage = Object.fromEntries(c1.concat(c2).map(i => [i, adj2[i].length]));
  for (let node of c1) {
    while (usage[node] < 2) {
      let addedPath = search(node, adj, adj2, forced, usage);
      usage[addedPath[0]]++;
      usage[addedPath.at(-1)]++;
      for (let i = 0; i < addedPath.length - 1; i++) {
        let n1 = addedPath[i];
        let n2 = addedPath[i + 1];
        if (i % 2 === 0) {
          adj2[n1].push(n2);
          adj2[n2].push(n1);
        } else if (i % 2 === 1) {
          adj2[n1] = adj2[n1].filter(j => j !== n2);
          adj2[n2] = adj2[n2].filter(j => j !== n1);
        }
      }
    }
  }
  return adj2;
}

let findForcedEdges = function (adj, adj2, forced, c1, c2) {
  let sc1 = new Set(c1);
  let adj3 = Object.fromEntries(c1.concat(c2).map(i => [
    i, sc1.has(i) ? adj[i].filter(k => !adj2[i].includes(k)) : adj2[i].filter(k => !forced[i].includes(k))]));
  let components = tarjan(adj3, c1.concat(c2));
  let cdict = Object.fromEntries(components.flatMap((i, ind) => i.map(j => [j, ind])));
  let known = c1.concat(c2).flatMap(i => adj[i].filter(j => cdict[i] !== cdict[j]).map(j => [i, j]));
  return [known.filter(([i, j]) => adj2[i].includes(j)), known.filter(([i, j]) => !adj2[i].includes(j))];
}

let tarjan = function (g, vertices) {
  let res = [];
  let index = 0;
  let indices = {};
  let lowLink = {};
  let s = [];
  let ss = new Set();
  let strongConnect = function (v) {
    indices[v] = index;
    lowLink[v] = index;
    index++;
    s.push(v);
    ss.add(v);
    for (let w of g[v]) {
      if (!(w in indices)) {
        strongConnect(w);
        lowLink[v] = Math.min(lowLink[v], lowLink[w]);
      } else if (ss.has(w)) {
        lowLink[v] = Math.min(lowLink[v], indices[w]);
      }
    }
    if (lowLink[v] === indices[v]) {
      let comp = [];
      while (true) {
        let w = s.pop();
        ss.delete(w);
        comp.push(w);
        if (w === v) {
          break;
        }
      }
      res.push(comp);
    }
  }
  for (let v of vertices) {
    if (!(v in indices)) {
      strongConnect(v);
    }
  }
  return res;
}

let adjacency = function (graph, vertices) {
  let adj = Object.fromEntries(vertices.map(i => [i, []]));
  for (let [i, j] of graph) {
    adj[i].push(j);
    adj[j].push(i);
  }
  return adj;
}

let preliminaryCheck = function (adj, c1, c2) {
  let sc1 = new Set(c1);
  let sc2 = new Set(c2);
  if (c1.length !== c2.length || !c1.every(i => adj[i].every(j => sc2.has(j) && adj[j].includes(i))) ||
  !c2.every(i => adj[i].every(j => sc1.has(j) && adj[j].includes(i)))) {
    throw new Error('Puzzle is broken');
  }
}

let parity1 = function (adj, forced, c1, c2) {
  let adj2 = findParity(adj, forced, c1, c2);
  return findForcedEdges(adj, adj2, forced, c1, c2);
}

let dominoData = function (p, adj) {
  let lookup = Object.fromEntries(p.flatMap((i, ind) => i.map(j => [j, ind])));
  let black = p.map(i => adj[i[0]].filter(j => j !== i[1]).map(j => lookup[j]));
  let white = p.map(i => adj[i[1]].filter(j => j !== i[0]).map(j => lookup[j]));
  return [black, white, lookup];
}

let dominoPartitions = function (adj, adj2, c1, c2) {
  let cycles = [];
  let used = new Set();
  for (let node of c1) {
    if (used.has(node)) {
      continue;
    }
    let cycle = [node];
    while (true) {
      used.add(cycle.at(-1));
      let opts = adj2[cycle.at(-1)].filter(i => !used.has(i));
      if (opts.length === 0) {
        break;
      }
      cycle.push(opts[0]);
    }
    cycles.push(cycle);
  }
  let cycles2 = cycles.map(i => [i[0]].concat(i.slice(1).reverse()));
  let pairs = [cycles, cycles2].map(c => c.flatMap(i => [...Array(i.length / 2)].map((_, ind) => i.slice(2 * ind, 2 * ind + 2))));
  return pairs.map(p => dominoData(p, adj));
}

let fullBFS = function (g) {
  let s = new Set([0]);
  let n = new Set([0]);
  while (n.size > 0) {
    n = new Set(Array.from(n).flatMap(i => g[i].filter(j => !s.has(j))));
    for (let i of n) {
      s.add(i);
    }
  }
  return s.size === g.length;
}

let isForcedParity2 = function (black, white, bn, wn) {
  let bnew = new Set(black[bn]);
  bnew.delete(wn);
  let wnew = new Set(white[wn]);
  wnew.delete(bn);
  let bs = new Set(bnew);
  bs.add(bn);
  let ws = new Set(wnew);
  ws.add(wn);
  while (true) {
    bnew = new Set(Array.from(bnew).flatMap(i => black[i].filter(j => !bs.has(j))));
    for (let i of bnew) {
      bs.add(i);
    }
    wnew = new Set(Array.from(wnew).flatMap(i => white[i].filter(j => !ws.has(j))));
    for (let i of wnew) {
      ws.add(i);
    }
    if (bs.has(wn) || ws.has(bn)) {
      return false;
    }
    if (bnew.size === 0 || wnew.size === 0) {
      return true;
    }
  }
}

let parity2 = function (adj, forced, c1, c2) {
  let adj2 = findParity(adj, forced, c1, c2);
  let [dom1, dom2] = dominoPartitions(adj, adj2, c1, c2);
  if (!fullBFS(dom1[0]) || !fullBFS(dom1[1])) {
    throw new Error('Puzzle is broken');
  }
  let newForced = [];
  let sc1 = new Set(c1);
  for (let i in adj) {
    if (!(sc1.has(i))) {
      continue;
    }
    for (let j of adj[i]) {
      if (forced[i].includes(j)) {
        continue;
      }
      let dom;
      if (dom1[2][i] === dom1[2][j]) {
        if (dom2[2][i] === dom2[2][j]) {
          throw new Error('Puzzle is broken');
        }
        dom = dom2;
      } else {
        dom = dom1;
      }
      if (isForcedParity2(dom[0], dom[1], dom[2][i], dom[2][j])) {
        newForced.push([i, j]);
        newForced.push([j, i]);
      }
    }
  }
  return newForced;
}

let findPathEndpoints = function (forced) {
  let res = [];
  let used = new Set();
  for (let node in forced) {
    if (used.has(node)) {
      continue;
    }
    let path = new Set([node]);
    let n = [node];
    while (n.length > 0) {
      n = n.flatMap(i => forced[i].filter(j => !path.has(j)));
      for (let i of n) {
        path.add(i);
      }
    }
    res.push([Array.from(path).filter(i => forced[i].length < 2), path.size]);
    for (let i of path) {
      used.add(i);
    }
  }
  return res;
}

let dontClosePaths = function (adj, forced, c1, c2) {
  let endpoints = findPathEndpoints(forced)
  let unforced = [];
  if (endpoints.length > 1) {
    for (let [i, size] of endpoints) {
      if (i.length !== Math.min(size, 2)) {
        throw new Error('Puzzle is broken');
      }
      if (size > 2 && adj[i[0]].includes(i[1])) {
        if (forced[i[0]].includes(i[1])) {
          throw new Error('Puzzle is broken');
        }
        unforced.push([i[0], i[1]]);
        unforced.push([i[1], i[0]]);
      }
    }
  }
  return unforced;
}
