let GAME_SIZE = 20;
let PX = 35;

let globalState = {
  board: {},
  offsets: [0, 0]
};

let generateReducibleBoard = function () {
  while (true) {
    let board = [...Array(16)].map(() => [...Array(16)].map(() => Math.random() < 0.5 ? 0 : 1));
    for (let i = 0; i < 16; i++) {
      board[i].push(board[i].reduce((a, b) => a + b) % 2);
    }
    let row = [];
    for (let i = 0; i <= 16; i++) {
      row.push(board.map(x => x[i]).reduce((a, b) => a + b) % 2);
    }
    board.push(row);
    let rowSum = board.map((i, ind1) => i.map(
      (j, ind2) => j ? Math.pow(-1, ind1) : 0).reduce((a, b) => a + b)).reduce((a, b) => a + b);
    let columnSum = board.map((i, ind1) => i.map(
      (j, ind2) => j ? Math.pow(-1, ind2) : 0).reduce((a, b) => a + b)).reduce((a, b) => a + b);
    console.log(rowSum, columnSum);
    if (rowSum === 0 && columnSum === 0) {
      let resultBoard = {};
      for (let i = 0; i <= 16; i++) {
        for (let j = 0; j <= 16; j++) {
          resultBoard[[i + 2, j + 2]] = board[i][j];
        }
      }
      return resultBoard;
    }
  }
}

let drawBoard = function (board) {
  document.getElementById('text').innerHTML = 'Filled spaces: ' + Object.values(board).filter(i => i).length;
  let c = document.getElementById('board').getContext('2d');
  c.clearRect(0, 0, GAME_SIZE * PX, GAME_SIZE * PX);
  c.fillStyle = '#A0A0F0';
  c.fillRect(0, 0, GAME_SIZE * PX, GAME_SIZE * PX);
  c.strokeStyle = 'black';
  for (let i = 0; i < GAME_SIZE; i++) {
    c.beginPath();
    c.moveTo(i * PX + PX / 2, 0);
    c.lineTo(i * PX + PX / 2, GAME_SIZE * PX);
    c.stroke();
    c.beginPath();
    c.moveTo(0, i * PX + PX / 2);
    c.lineTo(GAME_SIZE * PX, i * PX + PX / 2);
    c.stroke();
  }
  for (let i = 0; i <= GAME_SIZE; i++) {
    for (let j = 0; j <= GAME_SIZE; j++) {
      if (board[[i + globalState.offsets[0], j + globalState.offsets[1]]]) {
        c.fillStyle = 'black';
        c.beginPath();
        c.arc(i * PX, j * PX, 10, 0, 2 * Math.PI);
        c.fill();
      }
    }
  }
  for (let i = 0; i < GAME_SIZE; i++) {
    for (let j = 0; j < GAME_SIZE; j++) {
      c.fillStyle = isLegal(board, [i + globalState.offsets[0], j + globalState.offsets[1]]) ? 'green' : 'red';
      c.beginPath();
      c.arc(i * PX + PX / 2, j * PX + PX / 2, 5, 0, 2 * Math.PI);
      c.fill();
    }
  }
}

let isLegal = function (board, space) {
  return [true, false].every(
    i => !!board[[space[0], space[1] + i]] === !!board[[space[0] + 1, space[1] + !i]]);
}

let move = function (board, space) {
  for (let i of [0, 1]) {
    for (let j of [0, 1]) {
      board[[space[0] + i, space[1] + j]] = !board[[space[0] + i, space[1] + j]];
    }
  }
}

let press = function (key) {
  if (key.length === 1) {
    key = 'Key' + key.toUpperCase();
  }
  if (key === 'KeyR') {
    globalState.board = {};
    globalState.offsets = [0, 0];
    drawBoard(globalState.board, globalState.offsets);
    return;
  }
  if (key === 'KeyG') {
    globalState.board = generateReducibleBoard();
    globalState.offsets = [0, 0];
    drawBoard(globalState.board, globalState.offsets);
    return;
  }
  let d = {
    'KeyA': [-1, 0],
    'ArrowLeft': [-1, 0],
    'KeyD': [1, 0],
    'ArrowRight': [1, 0],
    'KeyS': [0, 1],
    'ArrowDown': [0, 1],
    'KeyW': [0, -1],
    'ArrowUp': [0, -1],
  };
  if (!(key in d)) return;
  let x = d[key];
  globalState.offsets[0] += x[0];
  globalState.offsets[1] += x[1];
  drawBoard(globalState.board, globalState.offsets);
}

window.onload = function() {
  drawBoard(globalState.board, globalState.offsets);
  window.addEventListener("keydown", function(event) {
    if (event.defaultPrevented) return;
    press(event.code);
    event.preventDefault();
  }, true);
  document.getElementById('board').onclick = function (event) {
    let rect = document.getElementById('board').getBoundingClientRect();
    let coords = [event.clientX - rect.left, event.clientY - rect.top];
    let space = [Math.floor(coords[0] / PX) + globalState.offsets[0], Math.floor(coords[1] / PX) + globalState.offsets[1]];
    console.log(space);
    if (isLegal(globalState.board, space)) {
      move(globalState.board, space);
      drawBoard(globalState.board, globalState.offsets);
    }
  }
}
