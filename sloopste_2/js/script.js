let initialProgress = function () {
  return {
    loops: [],
    cells: 0,
    sections: [],
    subsections: [],
    bonus: [],
    big: []
  }
};

let player = {
  grid: {},
  parity: {
    subsection: [[1], [2], [1, 2]],
    loop: [[1], [2], [1, 2]]
  },
  parityProgress: {
    subsection: {
      '1': [],
      '2': [],
      '12': []
    },
    bonus: {
      '1': [],
      '2': [],
      '12': []
    }
  },
  position: [null, 0],
  options: {
    allowedParity: 'Default',
    audio: false,
    checkerboard: false,
    hover: 'None',
    pause: false,
    skipMode: 'Default',
    timer: false,
  },
  time: {
    time: 0,
    lastUpdate: Date.now()
  },
  progress: initialProgress(),
  data: {
    unlocks: null,
    loops: null,
  },
  version: 1,
};

let getRandomColorParams = function () {
  return [0, 1, 2].map(() => [10 + Math.floor(Math.random() * 180), 201 + 2 * Math.floor(Math.random() * 5)]);
}

let Misc = {
  colorParams: getRandomColorParams(),
  generateColorParams() {
    this.colorParams = getRandomColorParams();
  }
}

let Grid = {
    initialize(cellStates) {
        player.grid.cells = cellStates;
        player.grid.edges = this.initialEdges();
        player.grid.highlightedSubset = new Set();
        this.setup();
    },
    
    cellCount() {
      return player.grid.cells.length * player.grid.cells[0].length;
    },
    
    initialEdges() {
        const rows = player.grid.cells.length;
        const cols = player.grid.cells[0].length;
        let res = {};
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (c < cols - 1) {
                    const edgeState = player.grid.cells[r][c] || player.grid.cells[r][c + 1] ? "unused" : "unknown";
                    res[JSON.stringify([[r, c], [r, c + 1]])] = edgeState;
                }
                if (r < rows - 1) {
                    const edgeState = player.grid.cells[r][c] || player.grid.cells[r + 1][c] ? "unused" : "unknown";
                    res[JSON.stringify([[r, c], [r + 1, c]])] = edgeState;
                }
            }
        }
        return res;
    },
    
    setup() {
        let res = this.initialEdges();
        this.unshadedCount = player.grid.cells.flat().filter(cell => !cell).length;
        this.displayedEdges = new Set(Object.keys(res).filter(i => res[i] === "unused"));
        this.setupTable();
        this.local();
    },
    
    getColor(parity, cell, highlighted) {
        if (Options.getOption('checkerboard')) {
            return cell ? (parity ? 'black' : '#404040') :
            (highlighted ? (parity ? '#00c000' : 'lime') : (parity ? '#c0c0c0' : ''));
        } else {
            return cell ? 'black' : (highlighted ? 'lime' : '');
        }
    },
    
    recolorCheckerboard() {
        player.grid.cells.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            const st = JSON.stringify([rowIndex, colIndex]);
            document.getElementById(st).style.backgroundColor = this.getColor((rowIndex + colIndex) % 2, cell, player.grid.highlightedSubset.has(st));
          });
        });
    },
    
    setupTable() {
        this.edgeEls = {};
        const table = document.getElementById('gridTable');
        table.replaceChildren();
        table.style.height = (1 + 33 * player.grid.cells.length) + 'px';
        table.style.width = (1 + 33 * player.grid.cells[0].length) + 'px';

        // Create table rows and cells based on the grid cell states
        player.grid.cells.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');
            row.forEach((cell, colIndex) => {
                const td = document.createElement('td');
                const st = JSON.stringify([rowIndex, colIndex]);
                td.id = st;
                td.style.backgroundColor = this.getColor((rowIndex + colIndex) % 2, cell, player.grid.highlightedSubset.has(st));
                if (!cell) {
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
                if (rowIndex < player.grid.cells.length - 1) {
                    const edge = document.createElement('div');
                    edge.id = JSON.stringify([[rowIndex, colIndex], [rowIndex + 1, colIndex]]);
                    edge.classList.add('edge', 'vertical');
                    td.appendChild(edge);
                    this.edgeEls[edge.id] = edge;
                }
            });
            table.appendChild(tr);
        });
    },
    
    updateAllEdgesDisplay() {
      let newNodes = new Set();
      for (let edgeId in player.grid.edges) {
        if (this.displayedEdges.has(edgeId) || player.grid.edges[edgeId] === 'unknown') continue;
        this.displayedEdges.add(edgeId);
        let edge = this.edgeEls[edgeId];
        if (player.grid.edges[edgeId] === 'used') {
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
    },
    
    recolorComponents(used) {
      for (let i of used) {
        let color = this.getCCColor(i);
        for (let j of i) {
          for (let [_, k] of this.neighbors(j)) {
            if (player.grid.edges[k] === 'used' && this.edgeEls[k].style.backgroundColor !== color) {
              this.edgeEls[k].style.backgroundColor = color;
            }
          }
        }
      }
    },
    
    getCCColor(a) {
      let v = Infinity;
      for (let i of a.map(i => i[0] * 1000 + i[1])) {
        v = Math.min(i, v);
      }
      return 'rgb(' + Misc.colorParams.map(i => (i[0] * v) % i[1]).join(', ') + ')';
    },
    
    recolor() {
      Misc.generateColorParams();
      this.recolorComponents(this.buildConnectedComponents());
    },
    
    toggleHighlightedSubsetMethod(cell) {
      return (event) => {
        Options.setOption('hover', 'None');
        if (event.shiftKey) {
          this.toggleHighlightedComponent(cell);
        } else {
          this.toggleHighlightedSubset(cell);
        }
      }
    },
    
    hoverMethod(cell) {
      return (event) => {
        if (Options.getOption('hover') === 'None') {
          return;
        }
        if (event.shiftKey) {
          this.toggleHighlightedComponent(cell, {'Highlight': true, 'Unhighlight': false}[Options.getOption('hover')]);
        } else {
          this.toggleHighlightedSubset(cell, {'Highlight': true, 'Unhighlight': false}[Options.getOption('hover')]);
        }
      }
    },
    
    toggleHighlightedSubset(cell, newVal) {
        if (!player.grid.cells[cell[0]][cell[1]] && !Options.getOption('pause')) {
            const c = JSON.stringify(cell);
            const cellElement = document.getElementById(c);
            newVal ??= !player.grid.highlightedSubset.has(c);
            cellElement.style.backgroundColor = this.getColor((cell[0] + cell[1]) % 2, false, newVal);
            if (newVal) {
                player.grid.highlightedSubset.add(c);
            } else {
                player.grid.highlightedSubset.delete(c);
            }
        }
    },
    
    toggleHighlightedComponent(startingCell, newVal) {
        if (!player.grid.cells[startingCell[0]][startingCell[1]] && !Options.getOption('pause')) {
            newVal ??= !player.grid.highlightedSubset.has(JSON.stringify(startingCell));
            const component = this.getConnectedComponent(startingCell);
            for (const cell of component) {
                const c = JSON.stringify(cell);
                const cellElement = document.getElementById(c);
                cellElement.style.backgroundColor = this.getColor((cell[0] + cell[1]) % 2, false, newVal);
                if (newVal) {
                    player.grid.highlightedSubset.add(c);
                } else {
                    player.grid.highlightedSubset.delete(c);
                }
            }
        }
    },
    
    neighbors(cell) {
        const [r, c] = cell;
        const rows = player.grid.cells.length;
        const cols = player.grid.cells[0].length;
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
    },
    
    clearHighlightedSubset(manual) {
        if (Options.getOption('pause')) {
            if (manual) {
                alert('Paused!');
            }
            return;
        }
        player.grid.highlightedSubset.forEach(cellStr => {
            const [rowIndex, colIndex] = JSON.parse(cellStr);
            document.getElementById(cellStr).style.backgroundColor = this.getColor((rowIndex + colIndex) % 2, player.grid.cells[rowIndex][colIndex], false);
        });
        player.grid.highlightedSubset.clear();
    },
    
    getConnectedComponent(cell) {
        const rows = player.grid.cells.length;
        const cols = player.grid.cells[0].length;
        const component = [];
        const visited = new Set();
        const stack = [cell];

        while (stack.length > 0) {
            const cell = stack.pop();
            const cellStr = JSON.stringify(cell);
            if (visited.has(cellStr)) continue;
            visited.add(cellStr);
            component.push(cell);

            for (let [[i, j], _] of this.neighbors(cell).filter(([_, edge]) => player.grid.edges[edge] === 'used')) {
              stack.push([i, j]);
            }
        }
        return component;
    },

    buildConnectedComponents() {
        const rows = player.grid.cells.length;
        const cols = player.grid.cells[0].length;
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
    },
    
    getParityInfo(subset) {
        let totalParity = 0;
        const exitingEdges = { used: { 0: 0, 1: 0 }, unknown: { 0: 0, 1: 0 } };
        const exitingEdgesParity = {};
        
        Array.from(subset).forEach(cellStr => {
            const cell = JSON.parse(cellStr);
            totalParity += Math.pow(-1, cell.reduce((a, b) => a + b, 0));
            const neighbors = this.neighbors(cell);
            neighbors.forEach(([neighbor, edge]) => {
                if (!subset.has(JSON.stringify(neighbor)) && player.grid.edges[edge] !== "unused") {
                    const edgeParity = cell.reduce((a, b) => a + b, 0) % 2;
                    exitingEdges[player.grid.edges[edge]][edgeParity]++;
                    exitingEdgesParity[edge] = edgeParity;
                }
            });
        });

        return [totalParity, exitingEdgesParity, exitingEdges.used, exitingEdges.unknown];
    },
    
    isSafeSubset(subset) {
      if (subset.size === 1) {
          return true;
      }
      // This is a copy of getConnectedComponent
      const rows = player.grid.cells.length;
      const cols = player.grid.cells[0].length;
      const component = [];
      const visited = new Set();
      const stack = [JSON.parse(Array.from(subset)[0])];

      while (stack.length > 0) {
          const cell = stack.pop();
          const cellStr = JSON.stringify(cell);
          if (visited.has(cellStr)) continue;
          visited.add(cellStr);
          component.push(cell);

          for (let [[i, j], _] of this.neighbors(cell).filter(([_, edge]) => player.grid.edges[edge] === 'used')) {
            stack.push([i, j]);
            if (!subset.has(JSON.stringify([i, j]))) {
              return false;
            }
          }
      }
      return subset.size === visited.size;
    },
    
    parityCalc(manual) {
      if (Options.getOption('pause')) {
        if (manual) {
          alert('Paused!');
        }
        return;
      }
      this.adjustEdges(player.grid.highlightedSubset, manual);
    },
    
    getUsedParityTypes(totalParity, usedExits, unknownExits, allowed) {
      // Doesn't handle errors
      const canApplyParity1 = allowed.includes(1) && [0, 1].some(parity => unknownExits[parity] > 0) && [0, 1].some(
        parity => 2 * totalParity === Math.pow(-1, parity) * (usedExits[parity] - usedExits[1 - parity] + unknownExits[parity]));
      const canApplyParity2 = allowed.includes(2) && totalParity === 0 && [0, 1].some(
        parity => usedExits[parity] === 0 && unknownExits[parity] === 1);
      // The effect of allowed.includes(1) || allowed.includes(2) is that if parity does nothing (i.e. both parts of the or are false),
      // nothing will happen.
      const canApplyEither = (allowed.includes(1) || allowed.includes(2)) && totalParity === 0 && [0, 1].some(
        parity => unknownExits[1 - parity] === 0 && unknownExits[parity] === 1 && usedExits[1 - parity] === usedExits[parity] + 1);
      if (canApplyEither) {
        return [1, 2];
      } else if (canApplyParity1) {
        return [1];
      } else if (canApplyParity2) {
        return [2];
      } else {
        return null;
      }
    },
    
    adjustEdges(subset, manual) {
        if (subset.size === 0 || subset.size === this.unshadedCount) {
            return;
        }
        
        // In case we want to pass parity info into something directly (e.g. a deduction legality check)
        const parityInfo = this.getParityInfo(subset);
        
        const [totalParity, exitParity, usedExits, unknownExits] = parityInfo;
        
        const safe =  this.isSafeSubset(subset);
        
        const allowed = safe ? [1, 2] : {
          'Default': [1, 2], '1-less': [2], '2-less': [1], '12-less': []
        }[Options.getOption('allowedParity')];
        
        if (!safe) {
          ParityTracker.merge(this.getUsedParityTypes(totalParity, usedExits, unknownExits, allowed));
        }
        
        if (allowed.includes(1)) {
            [0, 1].forEach(parity => {
                const x = Math.pow(-1, parity) * (usedExits[parity] - usedExits[1 - parity] + unknownExits[parity]);
                if ((parity === 0 && x < 2 * totalParity) || (parity === 1 && x > 2 * totalParity)) {
                    throw new Error("Inconsistent edge states detected.");
                }
                if (2 * totalParity === x) {
                    Object.keys(exitParity).forEach(edge => {
                        const state = player.grid.edges[edge];
                        if (state === "unknown") {
                            const edgeParity = exitParity[edge];
                            player.grid.edges[edge] = edgeParity === parity ? "used" : "unused";
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
                            const state = player.grid.edges[edge];
                            if (state === "unknown" && exitParity[edge] === parity) {
                                player.grid.edges[edge] = "used";
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
    },
    
    localInclude(r, c, handled) {
        if (player.grid.cells[r][c] || handled.has(JSON.stringify([r, c]))) {
          return false;
        }
        let possible = this.neighbors([r, c]).filter(([node, edge]) => player.grid.edges[edge] !== "unused");
        let used = possible.filter(([node, edge]) => player.grid.edges[edge] === "used");
        return (used.length < possible.length) && (possible.length <= 2 || used.length >= 2);
    },
    
    local() {
        const rows = player.grid.cells.length;
        const cols = player.grid.cells[0].length;
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
          State.nextTimeout();
        }
    },
    
    isCompletedState() {
        if (Object.values(player.grid.edges).some(state => state === "unknown")) {
            return false;
        }

        const graph = {};
        Object.entries(player.grid.edges).forEach(([edge, state]) => {
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

let ParityTracker = {
  merge(x) {
    if (x !== null) {
      for (let i in player.parity) {
        player.parity[i] = player.parity[i].filter(j => x.some(k => !j.includes(k)));
      }
    }
  },
  resetLoop() {
    player.parity.loop = [[1], [2], [1, 2]];
  },
  resetSubsection() {
    player.parity.loop = [[1], [2], [1, 2]];
    player.parity.subsection = [[1], [2], [1, 2]];
  }
}

let Options = {
  getOption(x) {
    return player.options[x];
  },
  setOption(x, y) {
    player.options[x] = y;
  },
  advanceOption(x, l) {
    player.options[x] = l[(l.indexOf(player.options[x]) + 1) % l.length];
  },
  advanceDescription(x, l) {
    return player.options[x] + ' → ' + l[(l.indexOf(player.options[x]) + 1) % l.length];
  },
  toggleOption(x) {
    player.options[x] = !player.options[x];
  },
  toggleDescription(x) {
    return player.options[x] ? 'on → off' : 'off → on';
  }
}

let State = {
  jumps: 0,
  initializeLoops(x) {
    let data = Parser.parse(x);
    player.grid = {};
    player.position = [null, 1];
    player.time = {
      time: 0,
      lastUpdate: Date.now()
    };
    player.progress = initialProgress();
    player.data = data;
    State.setupNames();
  },
  jump() {
    this.jumps++;
  },
  paused() {
    return player.position[0] === null || Options.getOption('pause');
  },
  tick() {
    let now = Date.now();
    if (!this.paused()) {
      player.time.time += now - player.time.lastUpdate;
    }
    player.time.lastUpdate = now;
  },
  stat(x) {
    return Array.isArray(x) ? x.length : x;
  },
  backgroundColor(i, j) {
    let completed = player.progress.subsections.includes([i, j].join(','));
    let allBerries = player.data.loops[i][j].every((it, k) => it[1] === 'cells' || player.progress.loops.includes([i, j, k].join(',')));
    return completed ? (allBerries ? 'lime' : 'cyan') : (allBerries ? 'yellow' : '');
  },
  isUnlocked(i, j) {
    if (j === 0) {
      let crit = player.data.unlocks[i];
      if (crit[1] === 'always') {
        return true;
      } else {
        return this.stat(player.progress[crit[1]]) >= crit[0];
      }
    } else {
      return player.progress.subsections.includes(i + ',' + (j - 1));
    }
  },
  chapterName(i, j) {
    return ['1', '2', '3', '4', '5', '6', '7', '8', '10'][i] + '-' + ['a', 'b', 'c'][j]
  },
  jumpToSubsection(i, j, conf) {
    let res = this.isUnlocked(i, j);
    if (res) {
      if (conf && !confirm('Are you sure you want to jump to ' + this.chapterName(i, j) + '?')) {
        return;
      }
      this.jump();
      player.position = [i, j, 0];
      ParityTracker.resetSubsection();
      this.setupLoop();
    } else {
      alert(this.unlockMessage(i, j));
    }
  },
  unlockMessage(i, j) {
    if (j === 0) {
      if (i === 0 || this.isUnlocked(i - 1, 0)) {
        let crit = this.unlocks[i];
        let display = {
          'always': 'ERROR',
          'cells': 'cells',
          'bonus': '🍓',
          'big': '🍓🍓'
        }
        return 'Get ' + crit[0] + ' ' + display[crit[1]] + ' first.';
      } else {
        return 'Get ??? first.';
      }
    } else {
      return 'Finish ' + this.chapterName(i, j - 1) + ' first.';
    }
  },
  setupLoop() {
    if (player.position[0] !== null) {
      Grid.initialize(player.data.loops[player.position[0]][player.position[1]][player.position[2]][0]);
    }
  },
  setupNames() {
    let table = {
      'cells': '',
      'bonus': '🍓',
      'big': '🍓🍓'
    };
    let end = (l, i) => table[i] + ((i === 'big') ? '' : l.filter(it => it[1] == i).length);
    this.names = player.data.loops.map((i, ind) => i.map((j, jnd) => j.map((k, knd) => this.chapterName(ind, jnd) + '-' + end(j.slice(0, knd + 1), k[1]))));
  },
  nextTimeout() {
    this.complete();
    let jumps = this.jumps;
    setTimeout(() => {
      if (this.jumps > jumps) return;
      this.jump();
      this.incrementPosition();
      this.setupLoop();
    }, 500);
  },
  
  checkAutoSkip() {
    if (Options.getOption('skipMode') === 'Auto') {
      this.skip(false);
    }
  },
  
  skip(manual) {
    if (Options.getOption('pause')) {
        if (manual) {
            alert('Paused!');
        }
        return;
    }
    let t = this.getType();
    // Catches null case
    if (t !== 'bonus' && t !== 'big') {
      if (manual) {
        alert('Only 🍓 can be skipped!');
      }
      return;
    }
    if (Options.getOption('skipMode') === 'Disabled') {
      if (manual) {
        alert('Skipping 🍓 is disabled!');
      }
      return;
    }
    if (Options.getOption('skipMode') === 'Confirmation' && !confirm('Are you sure you want to skip ' + this.getName() + '?')) {
      return;
    }
    this.jump();
    this.completeForUnlock();
    this.incrementPosition();
    this.setupLoop();
  },
  
  quit() {
    if (player.position[0] === null || !confirm('Are you sure you want to return to level select?')) {
      return;
    }
    this.jump();
    player.position = [null, 1];
    this.setupLoop();
  },
  
  completeForUnlock() {
    let id = player.position.join(',');
    let a = player.data.loops[player.position[0]];
    let b = a[player.position[1]];
    if (player.position[1] === a.length - 1 && player.position[2] === b.length - 1 &&
    !player.progress.sections.includes(player.position.slice(0, 1).join(','))) {
      player.progress.sections.push(player.position.slice(0, 1).join(','));
    }
    if (player.position[2] === b.length - 1 &&
    !player.progress.subsections.includes(player.position.slice(0, 2).join(','))) {
      player.progress.subsections.push(player.position.slice(0, 2).join(','));
    }
    if (player.position[2] === b.length - 1) {
      for (let i of player.parity.subsection) {
        if (!player.parityProgress.subsection[i.join('')].includes(player.position.slice(0, 2).join(','))) {
          player.parityProgress.subsection[i.join('')].push(player.position.slice(0, 2).join(','));
        }
      }
    }
  },
  
  complete() {
    // this should only be called when the loop is guaranteed to be complete
    if (Options.getOption('audio')) {
      new Audio('spheal.mp3').play();
    }
    let id = player.position.join(',');
    let type = this.getType();
    // Parity handling
    if (type === 'bonus' || type === 'big') {
      for (let i of player.parity.loop) {
        if (!player.parityProgress.bonus[i.join('')].includes(id)) {
          player.parityProgress.bonus[i.join('')].push(id);
        }
      }
    }
    if (player.progress.loops.includes(id)) {
      return;
    }
    player.progress.loops.push(id);
    if (type === 'cells') {
      player.progress.cells += Grid.cellCount();
    } else if (type === 'bonus') {
      player.progress.bonus.push(id);
    } else if (type === 'big') {
      player.progress.bonus.push(id);
      player.progress.big.push(id);
    }
    this.completeForUnlock();
  },
  
  incrementPosition() {
    for (let i of [2, 1, 0]) {
      if (i === 0) {
        player.position = [null, 1];
        return;
      }
      player.position[i]++;
      if (!this.inRange(player.position, player.data.loops)) {
        player.position[i] = 0;
      } else {
        if (i === 2) {
          ParityTracker.resetLoop();
        } else {
          ParityTracker.resetSubsection();
        }
        break;
      }
    }
  },
  
  getType() {
    if (player.position[0] === null) {
      return null;
    }
    return player.data.loops[player.position[0]][player.position[1]][player.position[2]][1];
  },
  
  getName() {
    if (player.position[0] === null) {
      return null;
    }
    return State.names[player.position[0]][player.position[1]][player.position[2]];
  },
  
  inRange(x, y) {
    return x.length ? 0 <= x[0] && x[0] < y.length && this.inRange(x.slice(1), y[x[0]]) : true;
  }
}

let Parser = {
  parse(x) {
    let parts = x.split('www');
    let start = parts[0];
    return {
      unlocks: this.parseStart(start),
      loops: parts.slice(1).map(i => i.split('ww').map(i => i.split('w').map(i => this.parseLoop(i))))
    }
  },
  
  parseStart(x) {
    let table = {
      'x': 'cells',
      'y': 'bonus',
      'z': 'big'
    }
    return [[0, 'always']].concat(x.split('w').map(i => [+i.slice(0, -1), table[i[i.length - 1]]]));
  },
  
  parseLoop(x) {
    let table = {
      'x': 'cells',
      'y': 'bonus',
      'z': 'big'
    }
    let parts = x.split(/[xyz]/g);
    let type = table[x[parts[0].length]];
    let data = parts[1];
    return [urlToNestedArray('https://puzz.link/p?simpleloop/' + parts[0] + '/' + parts[0] + '/' + parts[1]), type];
  }
}

let Headers = {
  levelString() {
    if (player.position[0] === null) {
      return ['Use "Load" with a level string', 'Main'][player.position[1]];
    }
    return State.getName();
  },
  progressInfo() {
    if (player.position[0] === null && player.position[1] === 0) {
      return '';
    }
    return 'Cells: ' + State.stat(player.progress.cells) + ' ' +
    'Chapters: ' + State.stat(player.progress.sections) + ' ' +
    '🍓: ' + State.stat(player.progress.bonus) + ' ' +
    '🍓🍓: ' + State.stat(player.progress.big);
  },
  time() {
    if ((player.position[0] === null && player.position[1] === 0) || !Options.getOption('timer')) {
      return '';
    }
    let time = player.time.time;
    let parts = [Math.floor(time / 3.6e6), Math.floor(time / 6e4) % 60, Math.floor(time / 1000) % 60, time % 1000];
    return (parts[0] ? (parts[0] + ':' + ('' + ('' + parts[1]).padStart(2, '0'))) : parts[1]) + ':' +
    ('' + parts[2]).padStart(2, '0') + '.' + ('' + parts[3]).padStart(3, '0') + (Options.getOption('pause') ? ' (paused)' : '');
  }
}

let Display = {
  displayLevelSelect() {
    return player.position[0] === null && player.position[1] === 1;
  },
  displayGrid() {
    return player.position[0] !== null;
  }
}

let Saving = {
  h(s) {
    let x = [...s.toLowerCase().replace(/[^0-9a-z]/g, '')].map(i => parseInt(i, 36));
    let r = 0;
    for (let i of x) {
      r += i;
      r *= 42;
      r %= 1e12;
    }
    return r;
  },
  encoder: new TextEncoder(),
  decoder: new TextDecoder(),
  startString: 'SloopsteSaveStart',
  endString: 'SloopsteSaveEnd',
  steps: [
    {
      encode: x => JSON.stringify(x, (key, value) => value instanceof Set ? ['__set'].concat(Array.from(value)) : value),
      decode: x => JSON.parse(x, (key, value) => (Array.isArray(value) && value[0] === '__set') ? new Set(value.slice(1)) : value)
    },
    { encode: x => Saving.encoder.encode(x), decode: x => Saving.decoder.decode(x) },
    { encode: x => pako.deflate(x), decode: x => pako.inflate(x) },
    {
      encode: x => Array.from(x).map(i => String.fromCharCode(i)).join(""),
      decode: x => Uint8Array.from(Array.from(x).map(i => i.charCodeAt(0)))
    },
    { encode: x => btoa(x), decode: x => atob(x) },
    {
      encode: x => x.replace(/=+$/g, "").replace(/0/g, "0a").replace(/\+/g, "0b").replace(/\//g, "0c"),
      decode: x => x.replace(/0b/g, "+").replace(/0c/g, "/").replace(/0a/g, "0")
    },
    {
      encode: x => Saving.startString + x + Saving.endString,
      decode: x => x.slice(Saving.startString.length, -Saving.endString.length),
    }
  ],
  encode(s) {
    return this.steps.reduce((x, f) => f.encode(x), s);
  },
  decode(s) {
    if (s.startsWith(Saving.startString)) {
      return this.steps.reduceRight((x, f) => f.decode(x), s);
    } else {
      return JSON.parse(atob(s));
    }
  },
  save() {
    return this.encode(player);
  },
  loadPrompt() {
    this.load(prompt('Level string/save:'));
  },
  load(x) {
    if ('0123456789'.includes(x[0])) {
      State.initializeLoops(x);
      return;
    }
    player = this.decode(x);
    player.time.lastUpdate = Date.now();
    this.fixPlayer();
    this.convertSave();
    this.misc();
    updateDisplaySaveLoadSetup();
  },
  fixPlayer() {
    // add changes here
  },
  convertSave() {

  },
  misc() {
    State.jump();
    State.setupNames();
    if (player.position[0] !== null) {
      Grid.setup();
    }
  }
}

let gameLoop = function () {
  State.checkAutoSkip();
  State.tick();
  updateDisplay();
}

window.addEventListener('keydown', function(event) {
  switch (event.key.toLowerCase()) {
    case 'x': Grid.clearHighlightedSubset(true); break;
    case 'p': Grid.parityCalc(true); break;
    case 'y': Options.advanceOption('hover', ['None', 'Highlight', 'Unhighlight']); break;
    case 'z': Grid.recolor(); break;
    case 'k': Options.toggleOption('checkerboard'); break;
    case 'm': Options.toggleOption('audio'); break;
    case 't': Options.toggleOption('timer'); break;
    case 'q': State.quit(); break;
    case 's': State.skip(true); break;
    case ' ': Options.toggleOption('pause'); break;
  }
});

window.onload = function () {
  updateDisplayPageLoadSetup();
  updateDisplaySaveLoadSetup();
  setInterval(gameLoop, 64);
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

