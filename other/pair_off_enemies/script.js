// What type of state do we have?
// Either true, or false + timestamp, or null

let letterToName = {a: 'Anastasia', b: 'Beckham', c: 'Cindy', d: 'Dante', e: 'Ethan'};

let init = [[-1, '', null], [-1, '', null], [-1, '', null], [-1, '', null], [-1, '', null],
[-1, '', null], [-1, '', null], [-1, '', null], [-1, '', null], [-1, '', null],
[-1, '', null]];

let getData = function () {
  return localStorage.getItem('poe') ? JSON.parse(localStorage.getItem('poe')) : init;
}

// these numbers might not be exact

let correct = [[504, 0, 0, 0, 0], [0, 0, 200, 200, 0], [0, 0, 0, 0, 369], [1, 0, 0, 0, 0], [60, 0, 0, 576, 0], [37, 37, 37, 37, 37], [11, 5, 5, 5, 5], [0, 0, 0, 0, 25], [30, 30, 70, 50, 50], [1, 1, 1, 1, 0], ['Beckham', 'Dante', 'Cindy', 'Ethan', 'Anastasia']];

let data;

let check = function (n) {
  if (data[n - 1][2] !== null && data[n - 1][2] > Date.now()) {
    return;
  }
  let vals = [1, 2, 3, 4, 5].map(i => document.getElementById(n + '-' + i).value).map(i => (n === 11) ? letterToName[i] : +i);
  if ((n === 11) ? new Set(vals).size !== 5 : vals.some(i => Math.floor(i) !== i)) {
    data[n - 1][0] = -2;
    data[n - 1][1] = (n === 11) ? 'Match the weapons with the enemies!' : 'Inputs must be rounded!';
  } else if ([0, 1, 2, 3, 4].every(i => vals[i] === correct[n - 1][i])) {
    data[n - 1][0] = true;
    data[n - 1][1] = (n === 11) ? 'Correct! Extraction unlocked!' : 'Correct!';
    replaceInputs();
  } else {
    data[n - 1][0] = false;
    data[n - 1][1] = (n === 11) ? 'Not all the enemies are defeated!' : 'Incorrect.';
    data[n - 1][2] = Date.now() + 6e5;
  }
  localStorage.setItem('poe', JSON.stringify(data));
}

let replaceInputs = function () {
  for (let n = 1; n <= 11; n++) {
    if (data[n - 1][0] !== true) continue;
    for (let i = 1; i <= 5; i++) {
      let e = document.getElementById(n + '-' + i);
      if (e) {
        let p = e.parentNode;
        p.removeChild(e);
        p.appendChild(document.createTextNode(correct[n - 1][i - 1]));
      }
    }
    let e = document.getElementById('check-' + n);
    if (e) {
      e.parentNode.removeChild(e);
    }
    if (n === 11) {
      document.getElementById('extraction').style.display = '';
      for (let i of [...document.getElementsByTagName('img')]) {
        if (['amulet_1', 'body_armour_1', 'boots_1', 'helmet_1', 'weapon_1'].includes(i.src.split('/')[i.src.split('/').length - 1].split('.')[0])) {
          i.src = i.src.slice(0, -6) + '_3.png';
        }
      }
    }
  }
}

let countdown = function (x) {
  if (x === null || x <= Date.now()) {
    return '';
  }
  let secs = Math.round((x - Date.now()) / 1000);
  return ' (' + Math.floor(secs / 60) + ':' + ('' + (100 + secs % 60)).slice(1) + ')';
}

let updateFeedback = function () {
  for (let n = 1; n <= 11; n++) {
    let e = document.getElementById('status-' + n);
    let nt = data[n - 1][1] + countdown(data[n - 1][2]);
    let nc = (data[n - 1][0] === true) ? 'green' : 'red';
    if (e.innerText !== nt) {
      e.innerText = nt;
    }
    if (e.style.color !== nc) {
      e.style.color = nc;
    }
  }
}

window.onload = function () {
  data = getData();
  replaceInputs();
  updateFeedback();
  setInterval(updateFeedback, 500);
}