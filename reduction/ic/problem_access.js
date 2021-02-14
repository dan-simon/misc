let choice = function (x) {
  return x[Math.floor(Math.random() * x.length)]
}

let hasText = function (a, b) {
  for (let i of [...b]) {
    if (!(a.includes(i))) {
      return false;
    }
    a = a.slice(a.indexOf(i) + 1);
  }
  return true;
}

let pickSubIndices = function (x, answer) {
  let possIndices = [...answer].map(i => [...x].map((item, j) => [item, j]).filter(j => j[0] === i).map(j => j[1] + 1));
  for (let tryCount = 0; tryCount < 10000; tryCount++) {
    let indices = possIndices.map(choice);
    if ([...Array(indices.length - 1)].every((_, i) => indices[i] < indices[i + 1])) {
      return indices;
    }
  }
  indices = [x.indexOf(answer[0]) + 1];
  for (let i of answer.slice(1)) {
    let last = indices[indices.length - 1];
    indices.push(x.slice(last).indexOf(i) + last + 1);
  }
  return indices;
}

let getAnswer = function (indices, answer) {
  let options = indices.map(i => [i, problems[i].filter(j => hasText(j.a, answer) && j.a.length <= 16 && !(j.a.startsWith(answer)))]);
  let optionGroup = choice(options.filter(i => i[1].length > 0));
  let index = optionGroup[0];
  let option = choice(optionGroup[1]);
  let subIndices = pickSubIndices(option.a, answer);
  return {
    type: index,
    q: option.q + ' (' + subIndices.map(i => smallNumbers[i]).join(', ') + ')',
    a: option.a
  }
}

let getNormalPuzzle = function (index) {
  let option = choice(problems[index]);
  return {type: index, q: option.q, a: option.a};
}

let getSomeNormalPuzzle = function (bestTime) {
  let types = Math.max(1, Math.min(7, Math.floor((startingTime - bestTime) / timePerPhase) + 1));
  return getNormalPuzzle(Math.floor(Math.random() * types));
}

let smallNumbers = ['8', 'C', 'E', 'E8', 'F', 'F18', 'F2', 'F3', 'F4', 'F48', 'F5', 'F58', 'F6', 'F68', 'F7', 'F74', 'F8'];

let answerBits = ['E', 'F48', 'F3', 'E8', 'F87', 'F876', 'F7', 'E8', 'F4'];

let answerIndices = [[1], [2], [3], [4], [5], [6], [4, 5, 6], [4, 5, 6], [4, 5, 6]];
