let inFocus = true;

let state = {
  started: false,
  unsolvedProblems: [],
  bestTime: startingTime,
  currentTime: startingTime,
  askedStage: 0,
  timeUntilProblem: 5,
  problemId: 1
}

let isDone = function () {
  return state.bestTime <= 0;
}

let nextProblem = function () {
  if (state.askedStage < Math.min(9, Math.floor((startingTime - state.bestTime) / timePerPhase))) {
    state.askedStage++;
    return [true, getAnswer(answerIndices[state.askedStage - 1], answerBits[state.askedStage - 1])];
  } else {
    return [false, getSomeNormalPuzzle(state.bestTime)];
  }
}

let checkAnswer = function (id) {
  let p = state.unsolvedProblems.filter(x => x.id === id)[0];
  let answer = document.getElementById('input-problem-' + id).value.toUpperCase().replace(/[^0-9A-F]/g, '').replace(/0+^/g, '');
  if (!answer) return;
  let correct = answer === p.a;
  if (correct) {
    document.body.removeChild(document.getElementById('problem-' + id));
    state.unsolvedProblems = state.unsolvedProblems.filter(x => x.id !== id);
  } else {
    let extra = 0.25 * p.startingTimeLeft;
    state.currentTime = Math.min(startingTime, state.currentTime + extra);
  }
  let e = document.createElement('div');
  let shortAnswer = (answer.length > 16) ? answer.slice(0, 16) + '... (length ' + answer.length + ')' : answer;
  e.style = 'position: relative; top: 0px; right: 0px; margin: 4px; padding: 2px; text-align: right; border-radius: 6px; z-index: 1;';
  e.style.color = correct ? 'green' : 'red';
  e.innerText = p.q + ': ' + shortAnswer + ' is ' + (correct ? 'correct' : 'incorrect');
  document.getElementById('notifications').appendChild(e);
  let remove = function() {
    if (document.body.contains(e)) {
      document.getElementById('notifications').removeChild(e);
    }
  };
  e.onclick = remove;
  setTimeout(remove, 5000);
}

let createProblemElement = function (p) {
  let e = document.createElement('div');
  e.style = 'border-style: solid; border-color: ' + (p.isSpecial ? 'gold' : 'black') + '; padding: 4px;'
  e.id = 'problem-' + p.id;
  let e1 = document.createElement('span');
  e1.innerHTML = p.q + ' ';
  let e2 = document.createElement('input');
  e2.id = 'input-problem-' + p.id;
  e2.onkeydown = e => {if (e.key === 'Enter') {checkAnswer(p.id)}};
  let e3 = document.createElement('button');
  e3.innerHTML = 'Submit'
  e3.onclick = () => checkAnswer(p.id);
  let e4 = document.createElement('br');
  let e5 = document.createElement('span');
  e5.id = 'time-problem-' + p.id;
  e5.innerHTML = format(p.timeLeft) + ' left / ' + format(p.startingTimeLeft) + ' total';
  e.appendChild(e1);
  e.appendChild(e2);
  e.appendChild(e3);
  e.appendChild(e4);
  e.appendChild(e5);
  return e;
}

let giveNextProblem = function () {
  if (isDone()) return;
  let sp = nextProblem();
  let special = sp[0];
  var audio = new Audio(special ? 'next_problem_special.wav' : 'next_problem.wav');
  audio.play();
  let p = sp[1];
  let t = 30 * (p.type + 2);
  p.isSpecial = special;
  p.startingTimeLeft = t;
  p.timeLeft = t;
  p.id = state.problemId;
  state.problemId++;
  document.body.appendChild(createProblemElement(p));
  state.unsolvedProblems.push(p);
}

let getSpeed = function () {
  return baseSpeed / (1 + state.unsolvedProblems.length);
}

let removeProblem = function (i) {
  let extra = 0.75 * state.unsolvedProblems[i].startingTimeLeft;
  state.currentTime = Math.min(startingTime, state.currentTime + extra);
  document.body.removeChild(document.getElementById('problem-' + state.unsolvedProblems[i].id));
  state.unsolvedProblems = state.unsolvedProblems.slice(0, i).concat(state.unsolvedProblems.slice(i + 1));
}

let updateStuff = function () {
  if (!inFocus) return;
  let wasDone = isDone();
  if (!state.started) return;
  if (state.timeUntilProblem <= 0) {
    giveNextProblem();
    state.timeUntilProblem = timePerProblem;
  }
  state.currentTime = Math.max(0, state.currentTime - 0.1 * getSpeed());
  state.timeUntilProblem = Math.max(0, state.timeUntilProblem - 0.1);
  state.bestTime = Math.min(state.currentTime, state.bestTime);
  if (isDone() && !wasDone) {
    finishStuff();
  }
  for (let i = 0; i < state.unsolvedProblems.length; i++) {
    state.unsolvedProblems[i].timeLeft -= 0.1;
    if (state.unsolvedProblems[i].timeLeft < 0) {
      removeProblem(i);
      i--;
    }
  }
  updateUI();
}

let rot13 = function (x) {
  return [...x].map(i => String.fromCharCode((i.charCodeAt(0) - 'A'.charCodeAt(0) + 13) % 26 + 'A'.charCodeAt(0))).join('');
}

let startStuff = function () {
  for (let i of [...document.body.children]) {
    document.body.removeChild(i);
  }
  document.title = 'Cafe F18';
  let e0 = document.createElement('div');
  e0.id = 'notifications';
  e0.style = 'position: fixed; top: 0px; right: 0px; z-index: 1;';
  let e1 = document.createElement('h2');
  e1.innerHTML = 'Cafe F18';
  let e2 = document.createElement('h4');
  e2.id = 'time';
  document.body.appendChild(e0);
  document.body.appendChild(e1);
  document.body.appendChild(e2);
  state.started = true;
  updateUI();
}

let finishStuff = function () {
  for (let i of state.unsolvedProblems) {
    document.body.removeChild(document.getElementById('problem-' + i.id));
  }
  state.unsolvedProblems = [];
  let e1 = document.createElement('span');
  e1.innerHTML = 'You kept Cafe F18 open for ' + format(startingTime) +
  '! You were expecting some type of solution or at least some token reward to show up ' +
  'at the end, but that doesn\'t seem to have happened. Suddenly, you hear a noise, and ' +
  'though it\'s not out of place, it gives you an idea for solving the problem.';
  document.body.appendChild(e1);
  document.body.appendChild(document.createElement('br'));
  document.body.appendChild(document.createElement('br'));
  let e2 = document.createElement('span');
  e2.style.fontStyle = 'italic';
  e2.innerHTML = 'What\'s a better way to fix the IC?';
  document.body.appendChild(e2);
  document.body.appendChild(document.createElement('br'));
  let e3 = document.createElement('span');
  let checkFinalAnswer = function (x) {
    if (rot13(x.toUpperCase().replace(/[^A-Z]/g, '')) === 'OVTPEHAPU') {
      e6.innerHTML = 'Correct! Congratulations, and please let me know if you have any feedback. ' +
      'In case you didn\'t know, this puzzle and its loose theme were based on Cafe Five in the 2021 MIT Mystery Hunt, which was great. ' + 
      'Thanks to Nathan and everyone else who worked on making that puzzle. Also thanks more generally to everyone who worked on other aspects ' +
      'of the Infinite Corridor round.';
      e6.style.color = 'green';
    } else {
      e6.innerHTML = 'Incorrect! (But feel free to try guessing again.)';
      e6.style.color = 'red';
    }
  }
  let e4 = document.createElement('input');
  e4.onkeydown = e => {if (e.key === 'Enter') {checkFinalAnswer(e4.value)}};
  let e5 = document.createElement('button');
  e5.innerHTML = 'Submit'
  e5.onclick = () => checkFinalAnswer(e4.value);
  e3.appendChild(e4);
  e3.appendChild(e5);
  document.body.appendChild(e3);
  document.body.appendChild(document.createElement('br'));
  let e6 = document.createElement('span');
  document.body.appendChild(e6);
}

let format = function (time) {
  let t = Math.floor(time);
  return Math.floor(t / 60) + ':' + ((t % 60 < 10) ? '0' : '') + t % 60
}

let updateUI = function() {
  if (isDone()) {
    document.getElementById('time').innerHTML = format(state.currentTime) + ' (done)';
  } else {
    document.getElementById('time').innerHTML = format(state.currentTime) + ', ' + getSpeed().toFixed(2) + 'x time speed (higher with fewer unserved customers), ' + format(state.timeUntilProblem) + ' until next customer';
  }
  for (let p of state.unsolvedProblems) {
    document.getElementById('time-problem-' + p.id).innerHTML = format(p.timeLeft) + ' left / ' + format(p.startingTimeLeft) + ' total';
    document.getElementById('time-problem-' + p.id).style.color = (p.timeLeft < 30) ? 'red' : 'black';
  }
}

window.blur(() => inFocus = false);
window.focus(() => inFocus = true);

window.onload = function () {
  setInterval(updateStuff, 100);
}
