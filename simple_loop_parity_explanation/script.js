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
                } else {
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
        if (event.shiftKey) {
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

        const dfs = (r, c) => {
            const cell = [r, c];
            const cellStr = JSON.stringify(cell);
            if (visited.has(cellStr)) return;
            visited.add(cellStr);
            component.push(cell);

            for (let [[i, j], _] of this.neighbors(cell).filter(([_, edge]) => this.edges[edge] === 'used')) {
              dfs(i, j);
            }
        };

        dfs(cell[0], cell[1]);
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
      const edgeStates = {};
      let ev = assignEdgeValues(this.cells);
      for (const edge in ev) {
          let converted = convertToUndirectedEdge(JSON.parse(edge), [m, n]);
          edgeStates[edge] = (converted === null) ? -1 : {'used': 1, 'unknown': 0, 'unused': -1}[this.edges[JSON.stringify(converted)]];
      }
      const [used, unused] = parity1(edgeStates, ev);
      for (let edge of used) {
        let undirectedEdge = JSON.stringify(convertToUndirectedEdge(JSON.parse(edge), [m, n]));
        this.edges[undirectedEdge] = "used";
        this.updateEdgeDisplay(undirectedEdge);
      }
      for (let edge of unused) {
        let undirectedEdge = JSON.stringify(convertToUndirectedEdge(JSON.parse(edge), [m, n]));
        this.edges[undirectedEdge] = "unused";
        this.updateEdgeDisplay(undirectedEdge);
      }
    }
    
    parity2() {
      let m = this.cells.length;
      let n = this.cells[0].length;
      let ev = assignEdgeValues(this.cells);
      const edgeStates = {};
      for (const edge in ev) {
          let converted = convertToUndirectedEdge(JSON.parse(edge), [m, n]);
          edgeStates[edge] = (converted === null) ? -1 : {'used': 1, 'unknown': 0, 'unused': -1}[this.edges[JSON.stringify(converted)]];
      }
      const [used, unused] = parity2(edgeStates, ev);
      for (let edge of used) {
        let undirectedEdge = JSON.stringify(convertToUndirectedEdge(JSON.parse(edge), [m, n]));
        this.edges[undirectedEdge] = "used";
        this.updateEdgeDisplay(undirectedEdge);
      }
      for (let edge of unused) {
        let undirectedEdge = JSON.stringify(convertToUndirectedEdge(JSON.parse(edge), [m, n]));
        this.edges[undirectedEdge] = "unused";
        this.updateEdgeDisplay(undirectedEdge);
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
    grid.initialize([[false, false], [false, false]]);
    document.body.appendChild(document.createElement('br'));
    createButton('Load puzzle', function () {
        grid.initialize(urlToNestedArray(prompt('Puzzle url?')));
    });
    
    createButton('Clear (x)', function () {
        grid.clearHighlightedSubset();
    }, 'x');

    createButton('Parity on selected region (p)', function () {
        grid.adjustEdges(grid.highlightedSubset);
    }, 'p');
    
    createButton('Parity on each cell (l)', function () {
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
    
    createButton('Parity 1 (1)', function () {
        grid.parity1();
    }, '1');
    
    createButton('Parity 2 (2)', function () {
        grid.parity2();
    }, '2');

    createButton('Complete? (c)', function () {
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

function calculateAreaLeftOfEdge(grid, i, j) {
    let area = 0;
    for (let y = 0; y < j; y++) {
        if (!grid[i][y]) {
            if ((i + y) % 2 === 0) {
                area += 1;
            } else {
                area -= 1;
            }
        }
    }
    return area;
}

function assignEdgeValues(grid) {
    let m = grid.length;
    let n = grid[0].length;
    let edgeValues = {};

    for (let i = 0; i <= m; i++) {
        for (let j = 0; j <= n; j++) {
            if (i < m) {
                let areaLeft = calculateAreaLeftOfEdge(grid, i, j);
                let value = i < m ? areaLeft : -areaLeft;
                let keyForward = JSON.stringify([[i, j], [i + 1, j]]);
                let keyBackward = JSON.stringify([[i + 1, j], [i, j]]);
                edgeValues[keyForward] = value;
                edgeValues[keyBackward] = -value;
            }
            if (j < n) {
                let keyRight = JSON.stringify([[i, j], [i, j + 1]]);
                let keyLeft = JSON.stringify([[i, j + 1], [i, j]]);
                edgeValues[keyRight] = 0;
                edgeValues[keyLeft] = 0;
            }
        }
    }

    return edgeValues;
}

function bellmanFord(edgeValues, source, target, dist) {
    let graph = Object.keys(edgeValues).map(JSON.parse).flat();
    graph = [...new Set(graph.map(JSON.stringify))].map(JSON.parse); 
    let V = graph.length;

    let distances = {};
    graph.forEach(vertex => distances[JSON.stringify(vertex)] = Infinity);
    distances[JSON.stringify(source)] = 0;

    for (let _ = 0; _ < V - 1; _++) {
        let updated = false;
        for (let [edge, weight] of Object.entries(edgeValues)) {
            let [u, v] = JSON.parse(edge);
            if (JSON.stringify([u, v]) === JSON.stringify([source, target]) || JSON.stringify([u, v]) === JSON.stringify([target, source])) {
                continue;
            }
            if (distances[JSON.stringify(u)] !== Infinity && distances[JSON.stringify(u)] + weight < distances[JSON.stringify(v)]) {
                distances[JSON.stringify(v)] = distances[JSON.stringify(u)] + weight;
                updated = true;
            }
        }

        if (!updated || distances[JSON.stringify(target)] < dist) {
            break;
        }
    }

    return distances[JSON.stringify(target)] < dist ? -1 : distances[JSON.stringify(target)] > dist ? 1 : 0;
}

function convertToUndirectedEdge(edge, gridShape) {
    let [[i1, j1], [i2, j2]] = edge;
    let [m, n] = gridShape;

    if (i1 !== i2) {
        if (j1 === 0 || j1 === n) {
            return null;
        }
        return [[Math.min(i1, i2), j1-1], [Math.min(i1, i2), j1]];
    } else if (j1 !== j2) {
        if (i1 === 0 || i1 === m) {
            return null;
        }
        return [[i1-1, Math.min(j1, j2)], [i1, Math.min(j1, j2)]];
    } else {
        return null;
    }
}

function adjacentPairs(m, n) {
    let pairs = [];
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (j + 1 < n) {
                pairs.push([[i, j], [i, j + 1]]);
            }
            if (i + 1 < m) {
                pairs.push([[i, j], [i + 1, j]]);
            }
        }
    }
    return pairs;
}

function edgeParity(edge) {
    return (edge[0].reduce((a, b) => a + b) + (edge[0][1] === edge[1][1])) % 2;
}

function parity1(edgeStates, ev) {
    let candidates = Object.keys(ev).filter(i => edgeStates[i] === 0);
    let graph = {};
    for (let i in ev) {
        graph[i] = 2 * ev[i] + ((edgeParity(JSON.parse(i)) === 0 && edgeStates[i] === 1) ? -1 : (edgeParity(JSON.parse(i)) === 1 && edgeStates[i] !== -1) ? 1 : 0);
    };

    let used = [];
    let unused = [];
    candidates.forEach(i => {
        let b = bellmanFord(graph, JSON.parse(i)[1], JSON.parse(i)[0], -graph[i]);
        if (b === -1) {
            throw new Error('Contradiction!');
        }
        if (b === 0) {
            if (edgeParity(JSON.parse(i)) === 0) {
                unused.push(i);
            } else {
                used.push(i);
            }
        }
    });
    return [used, unused];
}

function parity2(edgeStates, ev) {
    let candidates = Object.keys(ev).filter(i => edgeParity(JSON.parse(i)) === 1 && edgeStates[i] === 0);
    let graph = {};
    for (let i in ev) {
        if (edgeParity(JSON.parse(i)) === 0 || edgeStates[i] === -1) {
            graph[i] = ev[i];
        }
    };

    let used = [];
    let unused = [];
    candidates.forEach(i => {
        let b = bellmanFord(graph, JSON.parse(i)[1], JSON.parse(i)[0], -ev[i]);
        if (b === -1) {
            throw new Error('Contradiction!');
        }
        if (b === 0) {
            used.push(i);
        }
    });
    return [used, unused];
}
