let TOTAL_CANVAS_SIZE = 600;
let USABLE_CANVAS_SIZE = 560;
let OFFSET = 20;

let globalState = {
  boardSize: null,
  maxChangeCount: null,
  playerNames: null,
  board: null,
  player: null,
  changeList: null,
  winner: -1
};

let startGame = function() {
  globalState.boardSize = +document.getElementById('size').value;
  globalState.maxChangeCount = +document.getElementById('changes').value;
  globalState.playerNames = [document.getElementById('player-1-name').value, document.getElementById('player-2-name').value];
  globalState.board = [...Array(globalState.boardSize)].map(() => [...Array(globalState.boardSize)].map(coin));
  globalState.player = 1;
  globalState.changeList = []
  globalState.winner = 0;
  updateGameState();
}

let drawBoard = function () {
  let c = document.getElementById('board').getContext('2d');
  c.clearRect(0, 0, TOTAL_CANVAS_SIZE, TOTAL_CANVAS_SIZE);
  c.fillStyle = '#A0A0F0';
  c.fillRect(0, 0, TOTAL_CANVAS_SIZE, TOTAL_CANVAS_SIZE);
  if (globalState.board === null) return;
  c.strokeStyle = 'black';
  let px = USABLE_CANVAS_SIZE / globalState.boardSize;
  for (let i = 0; i < globalState.boardSize + 1; i++) {
    c.beginPath();
    c.moveTo(OFFSET + i * px, OFFSET);
    c.lineTo(OFFSET + i * px, OFFSET + USABLE_CANVAS_SIZE);
    c.stroke();
    c.beginPath();
    c.moveTo(OFFSET, OFFSET + i * px);
    c.lineTo(OFFSET + USABLE_CANVAS_SIZE, OFFSET + i * px);
    c.stroke();
  }
  for (let i = 0; i < globalState.boardSize; i++) {
    for (let j = 0; j < globalState.boardSize; j++) {
      if (globalState.board[i][j]) {
        c.fillStyle = 'black';
        c.beginPath();
        c.arc(OFFSET + (i + 1 / 2) * px, OFFSET + (j + 1 / 2) * px, px / 3, 0, 2 * Math.PI);
        c.fill();
      }
    }
  }
  for (let i = 0; i < globalState.boardSize - 1; i++) {
    for (let j = 0; j < globalState.boardSize - 1; j++) {
      c.fillStyle = isLegal(globalState.board, [i, j]) ? 'green' : 'red';
      c.beginPath();
      c.arc(OFFSET + (i + 1) * px, OFFSET + (j + 1) * px, px / 8, 0, 2 * Math.PI);
      c.fill();
    }
  }
}

let updateGameText = function () {
  document.getElementById('game-text').innerHTML = getGameText();
}

let updateButtonVisibility = function () {
  document.getElementById('start').innerHTML = globalState.winner ? (globalState.winner > 0 ? 'Start new game!' : 'Start game!') : 'Restart game!';
}

let updateGameState = function () {
  drawBoard();
  updateGameText();
  updateButtonVisibility();
}

let updateIssueText = function () {
  let issueText = getSetupIssueText();
  document.getElementById('start').style.display = issueText ? 'none' : '';
  document.getElementById('issue').innerHTML = issueText;
}

let getPlayerName = function (playerNumber) {
  return globalState.playerNames[playerNumber - 1];
}

let getSetupIssueText = function () {
  let boardSize = +document.getElementById('size').value;
  let maxChangeCount = +document.getElementById('changes').value;
  let issues = [];
  if (boardSize < 10) {
    issues.push('board size too small (must be at least 10)');
  }
  if (boardSize > 20) {
    issues.push('board size too large (must be at most 20)');
  }
  if (maxChangeCount < 5) {
    issues.push('max changes per turn too small (must be at least 5)');
  }
  if (issues.length > 0) {
    return 'Issue' + (issues.length > 1 ? 's' : '') + ': ' + issues.join(', ');
  } else {
    return '';
  }
}

let getGameText = function () {
  let text;
  if (globalState.winner === -1) {
    text = 'Game not started';
  } else if (globalState.winner > 0) {
    text = getPlayerName(globalState.winner) + ' won';
  } else {
    text = getPlayerName(globalState.player) + '\'s turn';
  }
  if (globalState.winner) {
    return text + '!';
  }
  text += ', ' + filledSquares(boardAtStartOfMove()) + ' to ' + filledSquares(globalState.board) + ' filled square' + (filledSquares(globalState.board) === 1 ? '' : 's') +
    ', ' + currentChangeList().length + ' of ' + lengthLimit() + ' change' + (lengthLimit() === 1 ? '' : 's');
  return text;
}

let coin = function () {
  return Math.random() > 0.5;
}

let isChangeInBounds = function (size, space) {
  return 0 <= space[0] && space[0] < size && 0 <= space[1] && space[1] < size;
}

let isLegal = function (board, space) {
  return [true, false].every(
    i => !!board[space[0]][space[1] + i] === !!board[space[0] + 1][space[1] + !i]);
}

let move = function (board, space) {
  for (let i of [0, 1]) {
    for (let j of [0, 1]) {
      board[space[0] + i][space[1] + j] = !board[space[0] + i][space[1] + j];
    }
  }
}

let currentChangeList = function () {
  return globalState.changeList;
}

let boardAtStartOfMove = function () {
  let b = globalState.board.map(x => x.map(y => y));
  let ccl = currentChangeList();
  for (let i = ccl.length - 1; i >= 0; i--) {
    move(b, ccl[i]);
  }
  return b;
}

let filledSquares = function (b) {
  return b.map(x => x.reduce((a, b) => a + b)).reduce((a, b) => a + b);
}

let hasMoveReducedFilledSquares = function () {
  return filledSquares(globalState.board) < filledSquares(boardAtStartOfMove());
}

let lengthLimit = function () {
  return globalState.maxChangeCount;
}

let canMoveBeCompleted = function () {
  return hasMoveReducedFilledSquares() && currentChangeList().length <= lengthLimit();
}

let canNoFurtherMoveBeMade = function () {
  return globalState.winner || hasMoveReducedFilledSquares() || currentChangeList().length >= lengthLimit();
}

let canNothingBeDone = function () {
  return globalState.winner;
}

let win = function (player) {
  globalState.winner = player;
}

let completeTurn = function() {
  if (canNothingBeDone() || !canMoveBeCompleted()) return;
  if (filledSquares(globalState.board) === 0) {
    win(globalState.player);
  } else {
    globalState.player = 3 - globalState.player;
    globalState.changeList = [];
  }
  updateGameState();
}

let checkForMoveCompletion = function () {
  if (canMoveBeCompleted()) {
    completeTurn();
  } else if (currentChangeList().length >= lengthLimit()) {
    win(3 - globalState.player);
  }
}

window.onload = function() {
  updateGameState();
  document.getElementById('size').onchange = updateIssueText;
  document.getElementById('changes').onchange = updateIssueText;
  document.getElementById('board').onclick = function (event) {
    let rect = document.getElementById('board').getBoundingClientRect();
    let coords = [event.clientX - rect.left, event.clientY - rect.top];
    let space = coords.map(x => Math.round(globalState.boardSize * (x - OFFSET) / USABLE_CANVAS_SIZE - 1));
    if (!canNoFurtherMoveBeMade() && isChangeInBounds(globalState.boardSize, space) && isLegal(globalState.board, space)) {
      move(globalState.board, space);
      currentChangeList().push(space);
      checkForMoveCompletion();
      updateGameState();
    }
  }
}
