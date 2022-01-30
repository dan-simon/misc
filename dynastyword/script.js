let grid = null;
let state = null;
let tds = [];
let alreadySolved = false;

let getClickFunction = function (i) {
  return function (e) {
    clickCell(i, e.shiftKey ? 2 : 1);
  }
}

let recolorGrid = function () {
  for (let i = 0; i < tds.length; i++) {
    tds[i].style.backgroundColor = ['#ffffff', '#555555', '#80ff00'][state[i]];
  }
}

let clickCell = function (i, n) {
  state[i] = (state[i] + n) % 3;
  localStorage.setItem(grid, state.join(''));
  recolorGrid();
  checkGrid(true);
}

let digits = '0123456789';

let getLines = function () {
  let size = Math.floor(Math.sqrt(grid.length));
  let across = [...Array(size)].map((_, i) => [...Array(size)].map((_, j) => size * i + j));
  let down = [...Array(size)].map((_, j) => [...Array(size)].map((_, i) => size * i + j));
  return across.concat(down);
}

let getComponents = function (v, e) {
  let d = {};
  for (let i = 0; i < v.length; i++) {
    d[v[i]] = i;
  }
  let c = v.map(i => [i]);
  for (let i of e) {
    if (d[i[0]] === d[i[1]]) {
      continue;
    }
    let mj;
    let mn;
    if (d[i[0]].length < d[i[1]].length) {
      mj = d[i[1]];
      mn = d[i[0]];
    } else {
      mn = d[i[1]];
      mj = d[i[0]];
    }
    for (let i of c[mn]) {
      c[mj].push(i);
      d[i] = mj;
    }
  }
  let r = [];
  let s = {};
  for (let i in d) {
    if (!(d[i] in s)) {
      r.push(c[d[i]]);
      s[d[i]] = true;
    }
  }
  r.forEach(i => i.sort((i, j) => i - j));
  r.sort(sortComponents);
  return r;
}

let sortComponents = function (a, b) {
  if (a.length > b.length) {
    return 1;
  }
  if (b.length > a.length) {
    return -1;
  }
  if (a[0] > b[0]) {
    return 1;
  }
  if (b[0] > a[0]) {
    return -1;
  }
  return 0;
}

let squareName = function (n, size) {
  return 'r' + (Math.floor(n / size) + 1) + 'c' + (n % size + 1);
}

let dynastyCheck = function () {
  let size = Math.floor(Math.sqrt(grid.length));
  let lines = getLines();
  let edges = [];
  for (let i of lines) {
    for (let j = 0; j < i.length - 1; j++) {
      if (state[i[j]] === 1 && state[i[j + 1]] === 1) {
        return ['Two adjacent squares (' + squareName(i[j], size) + ' and ' + squareName(i[j + 1], size) + ') are blackened.', [i[j], i[j + 1]]];
      }
      if (state[i[j]] !== 1 && state[i[j + 1]] !== 1) {
        edges.push([i[j], i[j + 1]])
      }
    }
  }
  let unblackened = [...Array(state.length)].map((_, i) => i).filter(i => state[i] !== 1);
  let components = getComponents(unblackened, edges);
  if (components.length > 1) {
    return ['The unblackened squares do not form a connected region.', components[0]]
  }
}

let colorRed = function (x) {
  for (let i of x) {
    tds[i].style.backgroundColor = ['#ffaaaa', '#803333', '#ffff00'][state[i]];
  }
}

let getWords = function () {
  let lines = getLines();
  let r = [];
  for (let i of lines) {
    let w = [];
    for (let j of i) {
      if (state[j] === 1) {
        if (w.length > 1) {
          r.push([w.map(i => i[0]).join(''), w.map(i => i[1])]);
        }
        w = [];
      } else {
        w.push([grid[j], j]);
      }
    }
    // Word at the end of a line.
    if (w.length > 1) {
      r.push([w.map(i => i[0]).join(''), w.map(i => i[1])]);
    }
  }
  return r;
}

let invalidReason = function (x) {
  if (digits.includes(x[0])) {
    return 'A word (' + x + ') starts with a digit (' + x[0] + ').';
  }
  for (let i = 0; i < x.length - 1; i++) {
    if (digits.includes(x[i]) && digits.includes(x[i + 1]) && digits.indexOf(x[i]) >= digits.indexOf(x[i + 1])) {
      return 'A word (' + x + ') has two adjacent digits where the first (' + x[i] + ') is not strictly less than the second (' + x[i + 1] + ').';
    }
  }
  return false;
}

let getRepeats = function (words) {
  let d = {};
  let r = [];
  for (let i of words) {
    if (i[0] in d) {
      r[d[i[0]]].push(i);
    } else {
      r.push([i]);
      d[i[0]] = r.length - 1;
    }
  }
  return r.filter(i => i.length > 1);
}

let checkGrid = function (silent) {
  let dc = dynastyCheck();
  if (dc) {
    if (!silent) {
      colorRed(dc[1]);
      alert(dc[0]);
    }
    return;
  }
  let words = getWords();
  let invalid = words.filter(i => invalidReason(i[0]))[0];
  if (invalid) {
    if (!silent) {
      colorRed(invalid[1]);
      alert(invalidReason(invalid[0]));
    }
    return;
  }
  let repeats = getRepeats(words)[0];
  if (repeats) {
    if (!silent) {
      colorRed([].concat.apply([], repeats.map(i => i[1])));
      alert('A word (' + repeats[0][0] + ') appears more than once in the grid.');
    }
    return;
  }
  if (!alreadySolved || !silent) {
    alert('Solved!');
    alreadySolved = true;
  }
}

let clearGrid = function () {
  if (confirm('This will erase your progress! Are you sure!')) {
    state = [...'0'.repeat(state.length)].map(x => +x);
    localStorage.setItem(grid, state.join(''));
    recolorGrid();
  }
}

window.onload = function () {
  let g = new URLSearchParams(window.location.search).get('grid');
  if (g === null || Math.pow(Math.floor(Math.sqrt(g.length)), 2) !== g.length) {
    document.getElementById('d').innerHTML = 'Error!';
  } else {
    grid = g;
    let size = Math.floor(Math.sqrt(g.length));
    let tbody = document.createElement('tbody');
    for (let i = 0; i < size; i++) {
      let tr = document.createElement('tr');
      for (let j = 0; j < size; j++) {
        let td = document.createElement('td');
        tds.push(td);
        td.style.height = '60px';
        td.style.width = '50px';
        td.style.border = '5px solid black';
        td.style.margin = '0px';
        td.onclick = getClickFunction(size * i + j);
        td.innerText = g[size * i + j];
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    let table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.textAlign = 'center';
    table.style.fontSize = '24px';
    table.appendChild(tbody)
    document.getElementById('d').appendChild(table);
    state = [...(localStorage.getItem(g) || '0'.repeat(g.length))].map(x => +x);
    recolorGrid();
  }
};
