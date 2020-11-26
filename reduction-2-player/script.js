let TOTAL_CANVAS_SIZE = 600;
let USABLE_CANVAS_SIZE = 560;
let OFFSET = 20;

let globalState = {
  boardSize: null,
  maxChangeCount: null,
  maxUndos: null,
  confirmMoves: null,
  challengesAllowed: null,
  board: null,
  player: null,
  challenging: null,
  changeLists: null,
  undos: null,
  winner: -1
};

let startGame = function() {
  globalState.boardSize = +document.getElementById('size').value;
  globalState.maxChangeCount = +document.getElementById('changes').value;
  globalState.maxUndos = +document.getElementById('max-undos').value;
  globalState.confirmMoves = document.getElementById('confirm').checked;
  globalState.challengesAllowed = document.getElementById('allow-challenge').checked;
  globalState.board = [...Array(globalState.boardSize)].map(() => [...Array(globalState.boardSize)].map(coin));
  globalState.player = 1;
  globalState.challenging = false;
  globalState.changeLists = [null, []];
  globalState.undos = 0;
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
  document.getElementById('challenge').innerHTML = globalState.challenging ? 'Undo challenge' : 'Challenge your opponent\'s last turn' ;
  document.getElementById('undo').style.display = (canNothingBeDone() || currentChangeList().length === 0 || remainingUndos() === 0) ? 'none' : '';
  document.getElementById('reset').style.display = (canNothingBeDone() || currentChangeList().length === 0 || remainingUndos() < currentChangeList().length) ? 'none' : '';
  document.getElementById('challenge').style.display = (canNothingBeDone() || !globalState.challengesAllowed || globalState.changeLists[0] === null || (globalState.challenging && remainingUndos() === 0)) ? 'none' : '';
  document.getElementById('complete').style.display = (canNothingBeDone() || !canMoveBeCompleted()) ? 'none' : '';
  document.getElementById('concede').style.display = canNothingBeDone() ? 'none' : '';
}

let updateGameState = function () {
  drawBoard();
  updateGameText();
  updateButtonVisibility();
}

let getGameText = function () {
  let text;
  if (globalState.winner === -1) {
    text = 'Game not started';
  } else if (globalState.winner > 0) {
    text = 'Player ' + globalState.winner + ' won';
  } else {
    text = 'Player ' + globalState.player + '\'s turn';
  }
  if (globalState.challenging === true) {
    text += ', challenging previous turn'
  }
  if (globalState.winner) {
    return text + '!';
  }
  text += ', ' + filledSquares(boardAtStartOfMove()) + ' to ' + filledSquares(globalState.board) + ' filled square' + (filledSquares(globalState.board) === 1 ? '' : 's') +
    ', ' + currentChangeList().length + ' of ' + lengthLimit() + ' change' + (lengthLimit() === 1 ? '' : 's') +
    (globalState.maxUndos > 0 ? ', ' + remainingUndos() + ' of ' + globalState.maxUndos + ' undo' + (globalState.maxUndos === 1 ? '' : 's') + ' left': '');
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
  return globalState.changeLists[1];
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
  if (globalState.challenging) {
    return globalState.changeLists[0].length - 1;
  } else {
    return globalState.maxChangeCount;
  }
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

let concedeGame = function() {
  if (canNothingBeDone()) return;
  if (confirm('Are you sure you want to concede? The other player will win!')) {
    win(3 - globalState.player);
    updateGameState();
  }
}

let completeTurn = function() {
  if (canNothingBeDone() || !canMoveBeCompleted()) return;
  if (globalState.challenging || filledSquares(globalState.board) === 0) {
    win(globalState.player);
  } else {
    globalState.player = 3 - globalState.player;
    globalState.changeLists = [currentChangeList(), []];
    globalState.undos = 0;
  }
  updateGameState();
}

let challenge = function() {
  if (canNothingBeDone() || !globalState.challengesAllowed || globalState.changeLists[0] === null || (globalState.challenging && remainingUndos() === 0)) return;
  if (globalState.challenging) {
    player.undos++;
  }
  reset(true);
  let a = globalState.changeLists[0].map(x => x);
  // When challenging, do the moves in reverse order
  // (to undo them and get back to the previous game state).
  if (!globalState.challenging) {
    a.reverse();
  }
  for (let i of a) {
    move(globalState.board, i);
  }
  globalState.challenging = !globalState.challenging;
  updateGameState();
}

let checkForMoveCompletion = function () {
  if (canMoveBeCompleted()) {
    // Yes, in the case of a challenge, if the player says yes then they just win.
    // Also, technically, you could make a move after using all your undos with confirm on and challenges on
    // (but not currently be making a challenge) and then be unable to challenge, because the game assumed
    // you were done with your move. But if you were going to challenge, why not at the start of your move?
    // There's a similar thing below, where once you make all the changes for your move, if you didn't
    // reduce full squares you just lose.
    // This seems like a rare enough case to be ignored (though it should be domcumented).
    if (!globalState.confirmMoves || remainingUndos() === 0 || confirm('This change will complete your ' + (globalState.challenging ? 'challenge' : 'turn') + '. Do you want to do that?')) {
      completeTurn();
    } else {
      undo();
    }
  } else if (currentChangeList().length >= lengthLimit() && remainingUndos() === 0) {
    win(3 - globalState.player);
  }
}

let remainingUndos = function () {
  return globalState.allowedUndos = globalState.undos;
}

let undo = function () {
  if (canNothingBeDone() || remainingUndos() === 0) return;
  globalState.undos++;
  let ccl = currentChangeList();
  if (ccl.length > 0) {
    move(globalState.board, ccl.pop());
  }
  updateGameState();
}

let reset = function (free) {
  let ccl = currentChangeList();
  if (canNothingBeDone() || (!free && remainingUndos() < ccl.length)) return;
  if (!free) {
    globalState.undos += ccl.length;
  }
  while (ccl.length > 0) {
    move(globalState.board, ccl.pop());
  }
  updateGameState();
}

let press = function (key) {
  if (key.length === 1) {
    key = 'Key' + key.toUpperCase();
  }
  if (key === 'KeyU') {
    undo();
  }
  if (key === 'KeyR') {
    reset();
  }
}

window.onload = function() {
  updateGameState();
  window.addEventListener("keydown", function(event) {
    if (event.defaultPrevented) return;
    press(event.code);
    event.preventDefault();
  }, true);
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
