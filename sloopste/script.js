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
    
    getColor(parity, cell, highlighted) {
        if (this.checkerboard) {
            return cell ? (parity ? 'black' : '#404040') :
            (highlighted ? (parity ? '#00c000' : 'lime') : (parity ? '#c0c0c0' : ''));
        } else {
            return cell ? 'black' : (highlighted ? 'lime' : '');
        }
    }
    
    recolorCheckerboard() {
        this.cells.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            const st = JSON.stringify([rowIndex, colIndex]);
            document.getElementById(st).style.backgroundColor = this.getColor((rowIndex + colIndex) % 2, cell, this.highlightedSubset.has(st));
          });
        });
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
                const st = JSON.stringify([rowIndex, colIndex]);
                td.id = st;
                td.style.backgroundColor = this.getColor((rowIndex + colIndex) % 2, cell, this.highlightedSubset.has(st));
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
        if (!this.cells[cell[0]][cell[1]] && !this.state.pause) {
            const c = JSON.stringify(cell);
            const cellElement = document.getElementById(c);
            newVal ??= !this.highlightedSubset.has(c);
            cellElement.style.backgroundColor = this.getColor((cell[0] + cell[1]) % 2, false, newVal);
            if (newVal) {
                this.highlightedSubset.add(c);
            } else {
                this.highlightedSubset.delete(c);
            }
        }
    }
    
    toggleHighlightedComponent(startingCell, newVal) {
        if (!this.cells[startingCell[0]][startingCell[1]] && !this.state.pause) {
            newVal ??= !this.highlightedSubset.has(JSON.stringify(startingCell));
            const component = this.getConnectedComponent(startingCell);
            for (const cell of component) {
                const c = JSON.stringify(cell);
                const cellElement = document.getElementById(c);
                cellElement.style.backgroundColor = this.getColor((cell[0] + cell[1]) % 2, false, newVal);
                if (newVal) {
                    this.highlightedSubset.add(c);
                } else {
                    this.highlightedSubset.delete(c);
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
        if (!this.state.pause) {
            this.highlightedSubset.forEach(cellStr => {
                const [rowIndex, colIndex] = JSON.parse(cellStr);
                document.getElementById(cellStr).style.backgroundColor = this.getColor((rowIndex + colIndex) % 2, this.cells[rowIndex][colIndex], false);
            });
            this.highlightedSubset.clear();
        }
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
      this.loopNames = this.loopsToLoopNames(data[1]);
      this.position = null;
      this.jumps = 0;
      this.levelEl = document.getElementById('level');
      this.infoEl = document.getElementById('info');
      this.timeEl = document.getElementById('time');
      this.gridEl = document.getElementById('gridTable');
      this.levelSelect = document.getElementById('levelSelect');
      this.progress = {loops: [], cells: 0, sections: [], subsections: [], bonus: [], big: []};
      this.setupLevelSelectButtons();
      this.setupLoop();
      this.time = 0;
      this.lastTick = Date.now();
      setInterval(() => {
        this.checkAutoSkip();
        this.tick();
        this.timeEl.innerText = this.timer ? this.currTime() : '';
      }, 64);
    }
    
    checkAutoSkip() {
      if (this.skipMode === 'Auto') {
        this.skip(false);
      }
    }
    
    tick() {
      let now = Date.now();
      if (this.position !== null && !this.pause) {
        this.time += now - this.lastTick;
      }
      this.lastTick = now;
    }
    
    currTime() {
      let time = this.time;
      let parts = [Math.floor(time / 3.6e6), Math.floor(time / 6e4) % 60, Math.floor(time / 1000) % 60, time % 1000];
      return (parts[0] ? (parts[0] + ':' + ('' + ('' + parts[1]).padStart(2, '0'))) : parts[1]) + ':' +
      ('' + parts[2]).padStart(2, '0') + '.' + ('' + parts[3]).padStart(3, '0') + (this.pause ? ' (paused)' : '');
    }
    
    nextTimeout() {
      this.complete();
      let jumps = this.jumps;
      setTimeout(() => {
        if (this.jumps > jumps) return;
        this.jumps++;
        this.incrementPosition();
        this.setupLoop();
      }, 500);
    }
    
    skip(manual) {
      if (this.pause) {
        return;
      }
      let t = this.getType();
      if (t !== 'bonus' && t !== 'big') {
        if (manual) {
          alert('Only 🍓 can be skipped!');
        }
        return;
      }
      if (this.skipMode === 'Disabled') {
        if (manual) {
          alert('Skipping 🍓 is disabled!');
        }
        return;
      }
      if (this.skipMode === 'Confirmation' && !confirm('Are you sure you want to skip ' + this.getLoopName() + '?')) {
        return;
      }
      this.jumps++;
      this.completeForUnlock();
      this.incrementPosition();
      this.setupLoop();
    }
    
    quit() {
      if (this.position === null || !confirm('Are you sure you want to return to level select?')) {
        return;
      }
      this.jumps++;
      this.position = null;
      this.setupLoop();
    }
    
    completeForUnlock() {
      let id = this.position.join(',');
      let a = this.loops[this.position[0]];
      let b = a[this.position[1]];
      if (this.position[1] === a.length - 1 && this.position[2] === b.length - 1 &&
      !this.progress.sections.includes(this.position.slice(0, 1).join(','))) {
        this.progress.sections.push(this.position.slice(0, 1).join(','));
      }
      if (this.position[2] === b.length - 1 &&
      !this.progress.subsections.includes(this.position.slice(0, 2).join(','))) {
        this.progress.subsections.push(this.position.slice(0, 2).join(','));
      }
    }
    
    complete() {
      // this should only be called when the loop is guaranteed to be complete
      if (this.audio) {
        new Audio('spheal.mp3').play();
      }
      let id = this.position.join(',');
      if (this.progress.loops.includes(id)) {
        return;
      }
      this.progress.loops.push(id);
      let type = this.getType();
      if (type === 'cells') {
        this.progress.cells += this.grid.cells.length * this.grid.cells[0].length;
      } else if (type === 'bonus') {
        this.progress.bonus.push(id);
      } else if (type === 'big') {
        this.progress.bonus.push(id);
        this.progress.big.push(id);
      }
      this.completeForUnlock();
    }
    
    setupLoop() {
      if (this.getLoop() !== null) {
        this.gridEl.style.display = '';
        this.levelSelect.style.display = 'none';
        this.grid.initialize(this.getLoop());
        this.levelEl.innerText = this.getLoopName();
        this.infoEl.innerText = this.getInfo();
      } else {
        this.gridEl.style.display = 'none';
        this.levelSelect.style.display = '';
        this.setupLevelSelect();
        this.levelEl.innerText = 'Main';
        this.infoEl.innerText = this.getInfo();
      }
    }
    
    getInfo() {
      return 'Cells: ' + this.stat(this.progress.cells) + ' ' +
      'Chapters: ' + this.stat(this.progress.sections) + ' ' +
      '🍓: ' + this.stat(this.progress.bonus) + ' ' +
      '🍓🍓: ' + this.stat(this.progress.big);
    }
    
    setupLevelSelectButtons() {
      this.levelSelect.replaceChildren();
      this.levelButtons = [];
      for (let i = 0; i < this.loops.length; i++) {
        let a = [];
        let span = document.createElement('span');
        for (let j = 0; j < this.loops[i].length; j++) {
          let b = document.createElement('button');
          b.innerText = this.chapterName(i, j);
          b.onclick = this.jumpToSubsectionFunction(i, j);
          span.appendChild(b);
          a.push(b);
        }
        this.levelSelect.appendChild(span);
        if (i !== this.loops.length - 1) {
          this.levelSelect.appendChild(document.createElement('br'));
        }
        this.levelButtons.push(a);
      }
    }
    
    setupLevelSelect() {
      for (let i = 0; i < this.levelButtons.length; i++) {
        for (let j = 0; j < this.levelButtons[i].length; j++) {
          if (this.isUnlocked(i, j)) {
            this.levelButtons[i][j].style.display = '';
            let completed = this.progress.subsections.includes([i, j].join(','));
            let allBerries = this.loops[i][j].every((it, k) => it[1] === 'cells' || this.progress.loops.includes([i, j, k].join(',')));
            this.levelButtons[i][j].style.backgroundColor = completed ? (allBerries ? 'lime' : 'cyan') : (allBerries ? 'yellow' : '');
          } else {
            this.levelButtons[i][j].style.display = 'none';
          }
        }
      }
    }
    
    stat(x) {
      return Array.isArray(x) ? x.length : x;
    }
    
    isUnlocked(a, b) {
      if (b === 0) {
        let crit = this.unlocks[a];
        if (crit[1] === 'always') {
          return true;
        } else {
          return this.stat(this.progress[crit[1]]) >= crit[0];
        }
      } else {
        return this.progress.subsections.includes(a + ',' + (b - 1));
      }
    }
    
    unlockMessage(a, b) {
      if (b === 0) {
        if (a === 0 || this.isUnlocked(a - 1, 0)) {
          let crit = this.unlocks[a];
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
        return 'Finish ' + this.chapterName(a, b - 1) + ' first.';
      }
    }
    
    jumpToSubsectionFunction(a, b) {
      return () => this.jumpToSubsection(a, b, false);
    }
    
    jumpToSubsection(a, b, c) {
      let res = this.isUnlocked(a, b);
      if (res) {
        if (c && !confirm('Are you sure you want to jump to ' + this.chapterName(a, b) + '?')) {
          return;
        }
        this.jumps++;
        this.position = [a, b, 0];
        this.setupLoop();
      } else {
        alert(this.unlockMessage(a, b));
      }
    }
    
    incrementPosition() {
      for (let i of [2, 1, 0]) {
        if (i === 0) {
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
      // Check if the new simple loop can be skipped.
      if (this.skipMode === 'Auto') {
        this.skip(false);
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
      return loop[0];
    }
    
    getLoopName() {
      if (this.position === null) {
        return 'Level Select';
      }
      let loop = this.loopNames;
      for (let i of this.position) {
        if (i >= loop.length) {
          return null;
        }
        loop = loop[i];
      }
      return loop;
    }
    
    getType() {
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
      return loop[1];
    }
    
    parse(x) {
      let parts = x.split('www');
      let start = parts[0];
      return [this.parseStart(start), parts.slice(1).map(i => i.split('ww').map(i => i.split('w').map(i => this.parseLoop(i))))];
    }
    
    parseStart(x) {
      let table = {
        'x': 'cells',
        'y': 'bonus',
        'z': 'big'
      }
      return [[0, 'always']].concat(x.split('w').map(i => [+i.slice(0, -1), table[i[i.length - 1]]]));
    }
    
    parseLoop(x) {
      let table = {
        'x': 'cells',
        'y': 'bonus',
        'z': 'big'
      }
      let parts = x.split(/[xyz]/g);
      let type = table[x[parts[0].length]];
      let data = parts[1];
      let num = (+parts[0] >= 60) ? Math.floor(+parts[0] / 10) : +parts[0];
      return [urlToNestedArray('https://puzz.link/p?simpleloop/' + num + '/' + num + '/' + parts[1]), type];
    }
    
    chapterName(a, b) {
      return ((a === 8) ? 10 : (a + 1)) + '-' + 'abc'[b];
    }
    
    loopsToLoopNames(x) {
      let table = {
        'cells': '',
        'bonus': '🍓',
        'big': '🍓🍓'
      };
      let end = (l, i) => table[i] + ((i === 'big') ? '' : l.filter(it => it[1] == i).length);
      return x.map((i, ind) => i.map((j, jnd) => j.map((k, knd) => this.chapterName(ind, jnd) + '-' + end(j.slice(0, knd + 1), k[1]))));
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

function createToggleButton(text, getBool, onClick, key) {
    const button = document.createElement('button');
    button.innerText = text + (getBool() ? ' (on → off)' : ' (off → on)');
    button.onclick = function () {
      onClick();
      button.innerText = text + (getBool() ? ' (on → off)' : ' (off → on)');
    }
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
    grid.checkerboard = false;
    grid.allowedParity = [1, 2];
    grid.generateColorParams();
    const state = new State();
    state.audio = false;
    state.timer = false;
    state.skipMode = 'Default';
    state.pause = false;
    state.grid = grid;
    grid.state = state;
    
    document.body.appendChild(document.createElement('br'));
    createButton('Load puzzles', function () {
        state.initialize(prompt('Puzzle urls?'));
    });
    
    createButton('Clear (x)', function () {
        if (state.pause) {
          alert('Unpause first!');
          return;
        }
        grid.clearHighlightedSubset();
    }, 'x');

    createButton('Parity on selected region (p)', function () {
        if (state.pause) {
          alert('Unpause first!');
          return;
        }
        grid.adjustEdges(grid.highlightedSubset, true);
    }, 'p');
    
    document.body.appendChild(document.createElement('br'));
    
    createButton('Change hover mode (y)', function () {
        grid.changeHoverMode();
    }, 'y');
    
    createButton('Recolor (z)', function () {
        grid.recolor();
    }, 'z');
    
    createToggleButton('Toggle checkerboard shading (k)', () => grid.checkerboard, function () {
        grid.checkerboard = !grid.checkerboard;
        if (state.position !== null) {
          grid.recolorCheckerboard();
        }
    }, 'k');
    
    let table = {
      'Mode: Default': [1, 2],
      'Mode: 1-less': [2],
      'Mode: 2-less': [1],
      'Mode: 12-less': []
    }
    
    createSelect(['Mode: Default', 'Mode: 1-less', 'Mode: 2-less', 'Mode: 12-less'], function (x) {
      grid.allowedParity = table[x];
    });
    
    document.body.appendChild(document.createElement('br'));
    
    createToggleButton('Toggle audio (m)', () => state.audio, function () {
        state.audio = !state.audio;
    }, 'm');
    
    createToggleButton('Toggle timer (t)', () => state.timer, function () {
        state.timer = !state.timer;
    }, 't');
    
    document.body.appendChild(document.createElement('br'));
    
    createButton('Return to level select (q)', function () {
        state.quit();
    }, 'q');
    
    createButton('Skip 🍓 (s)', function () {
        if (state.pause) {
          alert('Unpause first!');
          return;
        }
        state.skip(true);
    }, 's');
    
    createSelect(['Skip mode: Default', 'Skip mode: Auto', 'Skip mode: Confirmation', 'Skip mode: Disabled'], function (x) {
      state.skipMode = x.split(': ')[1];
    });
    
    createToggleButton('Toggle pause (space)', () => state.pause, function () {
        state.pause = !state.pause;
    }, ' ');
    
    document.addEventListener('keydown', function (event) {
      if ('123456780'.includes(event.key)) {
        if (state.pause) {
          alert('Unpause first!');
          return;
        }
        state.jumpToSubsection('123456780'.indexOf(event.key), 0, state.position !== null);
      }
      if (event.key === '9') {
        alert('This chapter doesn\'t exist!');
      }
      if ('abc'.includes(event.key.toLowerCase()) && this.position !== null) {
        if (state.pause) {
          alert('Unpause first!');
          return;
        }
        state.jumpToSubsection(state.position[0], 'abc'.indexOf(event.key.toLowerCase()), state.position !== null);
      }
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
