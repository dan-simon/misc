let GAME_SIZE = 9;

let SPACE_LIST = [].concat(...[...Array(GAME_SIZE)].map((_, i) => [...Array(GAME_SIZE)].map((_, j) => [i, j])));

let initialState = {
  board: [...Array(GAME_SIZE)].map(() => [...Array(GAME_SIZE)].map(() => -1)),
  groups: [],
  liberties: [],
  groupIds: [...Array(GAME_SIZE)].map(() => [...Array(GAME_SIZE)].map(() => -1)),
}

let uniq = function (x) {
  let d = {};
  let r = [];
  for (let i of x) {
    if (!(i in d)) {
      r.push(i);
      d[i] = true;
    }
  }
  return r;
}

let at = (space, state) => state.board[space[0]][space[1]];

let groupAt = (space, state) => state.groupIds[space[0]][space[1]];

let neighbors = space => [
  [space[0] - 1, space[1]], [space[0] + 1, space[1]],
  [space[0], space[1] - 1], [space[0], space[1] + 1]
].filter(x => x.every(i => 0 <= i && i < GAME_SIZE));

let allowsMove = (neighbor, player, state) => at(neighbor, state) === -1 ||
  (at(neighbor, state) === player && state.liberties[groupAt(neighbor, state)].length > 1)

let isLegal = (space, player, state) => at(space, state) === -1 && neighbors(space).some(
  x => allowsMove(x, player, state));

let canMove = (player, state) => SPACE_LIST.some(x => isLegal(x, player, state));

let mergeGroups = function (groups, state) {
  if (groups.length === 0) {
    state.groups.push([]);
    state.liberties.push([]);
    return state.groups.length - 1;
  }
  groups = uniq(groups);
  let combinedGroup = groups[0];
  for (let laterGroup of groups.slice(1)) {
    for (let i of state.groups[laterGroup]) {
      state.groupIds[i[0]][i[1]] = combinedGroup;
    }
    state.groups[combinedGroup].push(...state.groups[laterGroup]);
    state.liberties[combinedGroup].push(...state.liberties[laterGroup]);
    state.groups[laterGroup] = null;
    state.liberties[laterGroup] = null;
  }
  state.liberties[combinedGroup] = uniq(state.liberties[combinedGroup]);
  return combinedGroup;
}

let addToGroup = function (space, newGroup, player, state) {
  state.board[space[0]][space[1]] = player;
  state.groupIds[space[0]][space[1]] = newGroup;
  state.groups[newGroup].push(space);
  state.liberties[newGroup].push(...neighbors(space).filter(
    x => at(x, state) === -1 && neighbors(x).filter(
      y => groupAt(y, state) === newGroup).length === 1));
  state.liberties[newGroup] = state.liberties[newGroup].filter(
    j => j[0] !== space[0] || j[1] !== space[1]);
  for (let i of neighbors(space).filter(x => at(x, state) !== -1)) {
    state.liberties[groupAt(i, state)] = state.liberties[groupAt(i, state)].filter(
      j => j[0] !== space[0] || j[1] !== space[1]);
  }
}

let deleteGroup = function(group, state) {
  for (let i of state.groups[group]) {
    for (let group of uniq(neighbors(i).filter(
      x => at(x, state) === 1 - at(i, state)).map(x => groupAt(x, state)))) {
      state.liberties[group].push(i);
    }
    state.board[i[0]][i[1]] = -1;
    state.groupIds[i[0]][i[1]] = -1;
  }
  state.groups[group] = null;
  state.liberties[group] = null;
}

let deleteGroups = function (groups, state) {
  for (let group of uniq(groups)) {
    deleteGroup(group, state);
  }
}

let removeNeighbor = function (space, groups, state) {
  for (let group of uniq(groups)) {
    state.liberties[group] = state.liberties[group].filter(
      i => i[0] !== space[0] || i[1] !== space[1]);
  }
}

let play = function (space, player, state) {
  if (!isLegal(space, player, state)) {
    return false;
  }
  let newGroup = mergeGroups(neighbors(space).filter(
    x => at(x, state) === player).map(x => groupAt(x, state)), state);
  addToGroup(space, newGroup, player, state);
  deleteGroups(neighbors(space).filter(
    x => at(x, state) === 1 - player && state.liberties[groupAt(x, state)].length === 0).map(
      x => groupAt(x, state)), state);
  removeNeighbor(space, neighbors(space).filter(x => at(x, state) === 1 - player).map(
    x => groupAt(x, state)), state)
  return true;
}

let copy = function (state) {
  return JSON.parse(JSON.stringify(state));
}

let rs = function () {
  return SPACE_LIST.map(i => [i, Math.random()]).sort((a, b) => a[1] - b[1]).map(i => i[0]);
}

let rn = function (x) {
  return neighbors(x).map(i => [i, Math.random()]).sort((a, b) => a[1] - b[1]).map(i => i[0]);
}

let mc = function (mainState, pl, upd) {
  let state = copy(mainState);
  let r = [];
  let p = pl;
  while (true) {
    let spaces = rs();
    let played = false;
    for (let space of spaces) {
      if (isLegal(space, p, state)) {
        play(space, p, state);
        r.push(space);
        played = true;
        break;
      }
    }
    p = (p + 1) % 2;
    if (!played) {
      return [p, r];
    }
  }
}

let mcBot = function (mainState, pl, iter, drop, upd) {
  let results = [...Array(iter)].map(() => mc(mainState, pl));
  let scores = {};
  for (let i of SPACE_LIST) {
    scores[i] = 0;
  }
  for (let i of results) {
    let pull = pl === i[0] ? 1 : -1;
    for (let j = 0; j < i[1].length; j += 2) {
      scores[i[1][j]] += pull * Math.pow(drop, j);
    }
  }
  for (let i of SPACE_LIST) {
    if (!isLegal(i, pl, mainState)) {
      delete scores[i];
    }
  }
  // console.log(SPACE_LIST.map(i => [i, scores[i]]));
  let best = Math.max(...Object.values(scores));
  let moves = Object.keys(scores).filter(j => scores[j] === best);
  console.log(pl, best, results.filter(i => pl === i[0]).length, moves);
  return moves[0].split(',').map(x => +x);
}

let globalState = initialState;
let globalPlayer = 0;

let drawBoard = function (board) {
  let c = document.getElementById('board').getContext('2d');
  c.clearRect(0, 0, GAME_SIZE * 80, GAME_SIZE * 80);
  c.fillStyle = "#E0E0C0";
  c.fillRect(0, 0, GAME_SIZE * 80, GAME_SIZE * 80);
  c.strokeStyle = 'black';
  for (let i = 0; i < GAME_SIZE; i++) {
    c.beginPath();
    c.moveTo(i * 80 + 40, 40);
    c.lineTo(i * 80 + 40, GAME_SIZE * 80 - 40);
    c.stroke();
    c.beginPath();
    c.moveTo(40, i * 80 + 40);
    c.lineTo(GAME_SIZE * 80 - 40, i * 80 + 40);
    c.stroke();
  }
  for (let i = 0; i < GAME_SIZE; i++) {
    for (let j = 0; j < GAME_SIZE; j++) {
      if (board[i][j] !== -1) {
        c.fillStyle = ['black', 'white'][board[i][j]];
        c.beginPath();
        c.arc(i * 80 + 40, j * 80 + 40, 28, 0, 2 * Math.PI);
        c.fill();
      }
    }
  }
}

let wrappedMove = function (space) {
  if (!isLegal(space, globalPlayer, globalState)) return false;
  play(space, globalPlayer, globalState);
  drawBoard(globalState.board);
  globalPlayer = (globalPlayer + 1) % 2;
  if (!canMove(globalPlayer, globalState)) {
    document.getElementById('text').innerHTML = ['White', 'Black'][globalPlayer] + ' won!';
    return null;
  }
  return true;
}

let botMove = function () {
  wrappedMove(mcBot(globalState, globalPlayer, 1000, 0.9));
}

/*
window.onload = function() {
  let moving = false;
  setInterval(function () {
    if (moving) {
      return;
    }
    moving = true;
    let res = (globalPlayer === 0)
    ? wrappedMove(mcBot(globalState, globalPlayer, 1000, 0.9))
    : wrappedMove(mcBot(globalState, globalPlayer, 1000, 0.9));
    if (!res) {
      return;
    }
    moving = false;
  }, 1000);
}
*/

window.onload = function() {
  drawBoard(globalState.board);
  botMove();
  document.getElementById('board').onclick = function (event) {
    let res = wrappedMove([Math.floor(event.clientX / 80), Math.floor(event.clientY / 80)]);
    // let res = wrappedMove(mcBotRev(globalState, globalPlayer, 1000, 0.9));
    // let res = wrappedMove(mcBot(globalState, globalPlayer, 1000, 0.9));
    if (res) {
      setTimeout(botMove(), 10);
    }
  }
}
