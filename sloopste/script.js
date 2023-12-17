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
        this.displayedEdges = new Set(Object.keys(this.edges).filter(i => this.edges[i] === "unused"));
        this.setupTable();
        this.local();
    }
    
    setupTable() {
        this.edgeEls = {};
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
                } else {
                    // Add click event listener to toggle highlighted status
                    td.addEventListener('click', this.toggleHighlightedSubsetMethod([rowIndex, colIndex]));
                    td.addEventListener('mouseover', this.hoverMethod([rowIndex, colIndex]));
                }
                tr.appendChild(td);

                // Add edge elements
                if (colIndex < row.length - 1) {
                    const edge = document.createElement('div');
                    edge.id = JSON.stringify([[rowIndex, colIndex], [rowIndex, colIndex + 1]]);
                    edge.classList.add('edge', 'horizontal');
                    td.appendChild(edge);
                    this.edgeEls[edge.id] = edge;
                }
                if (rowIndex < this.cells.length - 1) {
                    const edge = document.createElement('div');
                    edge.id = JSON.stringify([[rowIndex, colIndex], [rowIndex + 1, colIndex]]);
                    edge.classList.add('edge', 'vertical');
                    td.appendChild(edge);
                    this.edgeEls[edge.id] = edge;
                }
            });
            table.appendChild(tr);
        });
    }
    
    updateAllEdgesDisplay() {
      let newNodes = new Set();
      for (let edgeId in this.edges) {
        if (this.displayedEdges.has(edgeId) || this.edges[edgeId] === 'unknown') continue;
        this.displayedEdges.add(edgeId);
        let edge = this.edgeEls[edgeId];
        if (this.edges[edgeId] === 'used') {
          edge.classList.add('used');
          for (let i of JSON.parse(edgeId)) {
            newNodes.add(JSON.stringify(i));
          }
        } else {
          let div = document.createElement('div');
          div.style.transform = 'translateY(-1.5px)';
          div.style.userSelect = 'none';
          div.innerText = '×';
          edge.appendChild(div);
        }
      }
      let used = this.buildConnectedComponents().filter(i => i.some(j => newNodes.has(JSON.stringify(j))));
      this.recolorComponents(used);
    }
    
    recolorComponents(used) {
      for (let i of used) {
        let color = this.getCCColor(i);
        for (let j of i) {
          for (let [_, k] of this.neighbors(j)) {
            if (this.edges[k] === 'used' && this.edgeEls[k].style.backgroundColor !== color) {
              this.edgeEls[k].style.backgroundColor = color;
            }
          }
        }
      }
    }
    
    getCCColor(a) {
      let v = Infinity;
      for (let i of a.map(i => i[0] * 1000 + i[1])) {
        v = Math.min(i, v);
      }
      return 'rgb(' + this.colorParams.map(i => (i[0] * v) % i[1]).join(', ') + ')';
    };
    
    generateColorParams() {
      this.colorParams = [0, 1, 2].map(() => [10 + Math.floor(Math.random() * 180), 201 + 2 * Math.floor(Math.random() * 5)])
    }
    
    recolor() {
      this.generateColorParams();
      this.recolorComponents(this.buildConnectedComponents());
    }
    
    changeHoverMode() {
      this.hoverMode = (this.hoverMode + 1) % 3;
    }
    
    toggleHighlightedSubsetMethod(cell) {
      return (event) => {
        this.hoverMode = 0;
        if (event.shiftKey) {
          this.toggleHighlightedComponent(cell);
        } else {
          this.toggleHighlightedSubset(cell);
        }
      }
    }
    
    hoverMethod(cell) {
      return (event) => {
        if (this.hoverMode === 0) {
          return;
        }
        if (event.shiftKey) {
          this.toggleHighlightedComponent(cell, [null, true, false][this.hoverMode]);
        } else {
          this.toggleHighlightedSubset(cell, [null, true, false][this.hoverMode]);
        }
      }
    }
    
    toggleHighlightedSubset(cell, newVal) {
        if (!this.cells[cell[0]][cell[1]]) {
            const c = JSON.stringify(cell);
            const cellElement = document.getElementById(c);
            newVal ??= !this.highlightedSubset.has(c);
            if (newVal) {
                this.highlightedSubset.add(c);
                cellElement.classList.add('highlighted');
            } else {
                this.highlightedSubset.delete(c);
                cellElement.classList.remove('highlighted');
            }
        }
    }
    
    toggleHighlightedComponent(startingCell, newVal) {
        if (!this.cells[startingCell[0]][startingCell[1]]) {
            newVal ??= !this.highlightedSubset.has(JSON.stringify(startingCell));
            const component = this.getConnectedComponent(startingCell);
            for (const cell of component) {
                const c = JSON.stringify(cell);
                const cellElement = document.getElementById(c);
                if (newVal) {
                    this.highlightedSubset.add(c);
                    cellElement.classList.add('highlighted');
                } else {
                    this.highlightedSubset.delete(c);
                    cellElement.classList.remove('highlighted');
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
    
    isSafeSubset(subset) {
      if (subset.size === 1) {
          return true;
      }
      // This is a copy of getConnectedComponent
      const rows = this.cells.length;
      const cols = this.cells[0].length;
      const component = [];
      const visited = new Set();
      const stack = [JSON.parse(Array.from(subset)[0])];

      while (stack.length > 0) {
          const cell = stack.pop();
          const cellStr = JSON.stringify(cell);
          if (visited.has(cellStr)) continue;
          visited.add(cellStr);
          component.push(cell);

          for (let [[i, j], _] of this.neighbors(cell).filter(([_, edge]) => this.edges[edge] === 'used')) {
            stack.push([i, j]);
            if (!subset.has(JSON.stringify([i, j]))) {
              return false;
            }
          }
      }
      return subset.size === visited.size;
    }
    
    adjustEdges(subset, manual) {
        if (subset.size === 0 || subset.size === this.unshadedCount) {
            return;
        }
        
        // In case we want to pass parity info into something directly (e.g. a deduction legality check)
        const parityInfo = this.getParityInfo(subset);
        
        const [totalParity, exitParity, usedExits, unknownExits] = parityInfo;
        
        const allowed = this.isSafeSubset(subset) ? [1, 2] : this.allowedParity;
        
        if (allowed.includes(1)) {
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
                        }
                    });
                }
            });
        }
        
        if (allowed.includes(2) && totalParity === 0) {
            [0, 1].forEach(parity => {
                if (usedExits[parity] === 0) {
                    if (unknownExits[parity] === 1) {
                        Object.keys(exitParity).forEach(edge => {
                            const state = this.edges[edge];
                            if (state === "unknown" && exitParity[edge] === parity) {
                                this.edges[edge] = "used";
                            }
                        });
                    } else if (unknownExits[parity] === 0) {
                        throw new Error("Inconsistent edge states detected.");
                    }
                }
            });
        }
        if (manual) {
          this.local();
        }
        return true;
    }
    
    localInclude(r, c, handled) {
        if (this.cells[r][c] || handled.has(JSON.stringify([r, c]))) {
          return false;
        }
        let possible = this.neighbors([r, c]).filter(([node, edge]) => this.edges[edge] !== "unused");
        let used = possible.filter(([node, edge]) => this.edges[edge] === "used");
        return (used.length < possible.length) && (possible.length <= 2 || used.length >= 2);
    }
    
    local() {
        const rows = this.cells.length;
        const cols = this.cells[0].length;
        const stack = [];
        const handled = new Set();
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (this.localInclude(r, c, handled)) {
                    stack.push([r, c]);
                    handled.add(JSON.stringify([r, c]));
                }
            }
        }
        while (stack.length > 0) {
            let [r, c] = stack.pop();
            this.adjustEdges(new Set([JSON.stringify([r, c])]), false);
            for (let [[nr, nc], _] of this.neighbors([r, c])) {
                if (this.localInclude(nr, nc, handled)) {
                    stack.push([nr, nc]);
                    handled.add(JSON.stringify([nr, nc]));
                }
            }
        }
        this.updateAllEdgesDisplay();
        if (this.isCompletedState()) {
          this.state.nextTimeout();
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

class State {
    initialize(urls) {
      let data = this.parse(urls);
      this.unlocks = data[0];
      this.loops = data[1];
      this.position = [0, 0, 0];
      this.jumps = 0;
      this.setupLoop();
    }
    
    nextTimeout() {
      let jumps = this.jumps;
      setTimeout(() => {
        if (this.jumps > jumps) return;
        this.next();
      }, 500);
    }
    
    next() {
      this.jumps++;
      this.incrementPosition();
      this.setupLoop();
    }
    
    setupLoop() {
      if (this.getLoop() !== null) {
        this.grid.initialize(this.getLoop());
      } else {
        alert('Finished!');
      }
    }
    
    incrementPosition() {
      for (let i of [2, 1, 0, -1]) {
        if (i === -1) {
          this.position = null;
          return;
        }
        this.position[i]++;
        if (this.getLoop() === null) {
          this.position[i] = 0;
        } else {
          break;
        }
      }
    }
    
    getLoop() {
      if (this.position === null) {
        return null;
      }
      let loop = this.loops;
      for (let i of this.position) {
        if (i >= loop.length) {
          return null;
        }
        loop = loop[i];
      }
      console.log(loop[0]);
      return loop[0];
    }
    
    parse(x) {
      let parts = x.split('www');
      let start = parts[0];
      return [this.parseStart(start), parts.slice(1).map(i => i.split('ww').map(i => i.split('w').map(i => this.parseLoop(i))))];
    }
    
    parseStart(x) {
      let table = {
        'x': 'cell',
        'y': 'bonus',
        'z': 'big'
      }
      return [[0, 'always']].concat(x.split('w').map(i => [+i.slice(0, -1), table[i[i.length - 1]]]));
    }
    
    parseLoop(x) {
      let table = {
        'x': 'cell',
        'y': 'bonus',
        'z': 'big'
      }
      let parts = x.split(/[xyz]/g);
      let type = table[x[parts[0].length]];
      let data = parts[1];
      return [urlToNestedArray('https://puzz.link/p?simpleloop/' + parts[0] + '/' + parts[0] + '/' + parts[1]), type];
    }
}

function createButton(text, onClick, key) {
    const button = document.createElement('button');
    button.innerText = text;
    button.onclick = onClick;
    document.body.appendChild(button);
    if (typeof key === 'string') {
        document.addEventListener('keydown', function (event) {
            if (event.key.toLowerCase() === key) {
                button.click();
            }
        });
    }
}

function createSelect(options, onSelect) {
    const select = document.createElement('select');
    for (let i of options) {
      const o = document.createElement('option');
      o.innerText = i;
      select.appendChild(o);
    }
    select.onchange = () => onSelect(select.value);
    document.body.appendChild(select);
}

window.onload = function () {
    // Initialize a grid with some cell states
    const grid = new Grid();
    grid.hoverMode = 0;
    grid.allowedParity = [1, 2];
    grid.generateColorParams();
    const state = new State();
    state.grid = grid;
    grid.state = state;
    
    document.body.appendChild(document.createElement('br'));
    createButton('Load puzzles', function () {
        state.initialize(prompt('Puzzle urls?'));
    });
    
    createButton('Clear (x)', function () {
        grid.clearHighlightedSubset();
    }, 'x');

    createButton('Parity on selected region (p)', function () {
        grid.adjustEdges(grid.highlightedSubset, true);
    }, 'p');
    
    document.body.appendChild(document.createElement('br'));
    
    createButton('Change hover mode (y)', function () {
        grid.changeHoverMode();
    }, 'y');
    
    createButton('Recolor (z)', function () {
        grid.recolor();
    }, 'z');
    
    let table = {
      'Mode: Default': [1, 2],
      'Mode: 1-less': [2],
      'Mode: 2-less': [1],
      'Mode: 12-less': []
    }
    
    createSelect(['Mode: Default', 'Mode: 1-less', 'Mode: 2-less', 'Mode: 12-less'], function (x) {
      grid.allowedParity = table[x];
    });
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
