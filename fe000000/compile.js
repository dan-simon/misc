let fs = require('fs');

let preprocessorVars = {
  colors: ['brown', 'cyan', 'gold', 'green', 'grey', 'magenta', 'orange', 'purple', 'red', 'yellow'],
  titleColors: ['Brown', 'Cyan', 'Gold', 'Green', 'Grey', 'Magenta', 'Orange', 'Purple', 'Red', 'Yellow'],
  specialColors: ['background', 'text', 'button', 'button-disabled'],
  titleSpecialColors: ['Background', 'Text', 'Buttons', 'Unclickable'],
  numbers: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']
};

let access = (x, l) => (l.length > 0) ? access(x[l[0]], l.slice(1)) : x;

function preprocess(x) {
  let parts = x.split('loop');
  let res = [null, null, null, parts[0].replace(/\n *<\/?$/, '')];
  let key = [];
  for (let i = 1; i < parts.length; i++) {
    let a = access(res, key);
    if (parts[i - 1].endsWith('"js/')) {
      a[a.length - 1] += 'loop' + parts[i].replace(/\n *<\/?$/, '');
    } else if (parts[i - 1].endsWith('<')) {
      if (parts[i][0] !== ' ') {
        throw new Error('Bad input');
      }
      let ind = parts[i].indexOf('>');
      if (parts[i][ind + 1] !== '\n') {
        throw new Error('Bad input');
      }
      let m = parts[i].slice(1, ind).split(' ');
      if (m.length !== 3) {
        throw new Error('Bad input');
      }
      let n = [m[0], +m[1], +m[2], parts[i].slice(ind + 1).replace(/\n *<\/?$/, '')];
      key.push(a.length);
      a.push(n);
    } else if (parts[i - 1].endsWith('</')) {
      key.pop();
      if (parts[i][0] !== '>') {
        throw new Error('Bad input');
      }
      access(res, key).push(parts[i].slice(1).replace(/\n *<\/?$/, ''));
    }
  }
  if (key.length > 0) {
    throw new Error('Bad input');
  }
  return res;
}

function preprocessString(s) {
  return s.replace(/% [^%]+ %/g, x => eval(x.slice(2, -2).replace(/@/g, 'preprocessorVars.')));
}

function preprocessFinal(x) {
  if (typeof x === 'string') {
    return preprocessString(x);
  } else if (x[0] === null) {
    return x.slice(3).map(preprocessFinal).join('');
  } else {
    if (x[0] in preprocessorVars) {
      throw new Error('Already-used variable ' + x[0]);
    }
    let r = [];
    for (let i = x[1]; i <= x[2]; i++) {
      preprocessorVars[x[0]] = i;
      r.push(x.slice(3).map(preprocessFinal).join(''));
    }
    delete preprocessorVars[x[0]];
    return r.join('');
  }
}

function extractCode(x) {
  if (x[1] === 'f') {
    return 'format(' + x.slice(3, -2) + ')';
  } else if (x[1] === 'i') {
    return 'formatInt(' + x.slice(3, -2) + ')';
  } else if (x[1] === 'o') {
    return 'formatOrdinalInt(' + x.slice(3, -2) + ')';
  } else if (x[1] === 'q') {
    return 'formatMaybeInt(' + x.slice(3, -2) + ')';
  } else if (x[1] === 'r') {
    return x.slice(3, -2);
  } else if (x[1] === 's') {
    return 'pluralize(' + x.slice(3, -2) + ', \'\', \'s\')';
  } else if (x[1] === 't') {
    if (x[2] === ' ') {
      return 'formatTime(' + x.slice(3, -2) + ', {seconds: {f: formatTimeNum, s: false}, larger: {f: formatTimeNum, s: false}})';
    } else if (x[2] === 'i') {
      return 'formatTime(' + x.slice(4, -2) + ', {seconds: {f: formatTimeInt, s: true}, larger: {f: formatTimeNum, s: false}})';
    } else if (x[2] === 'q') {
      return 'formatTime(' + x.slice(4, -2) + ', {seconds: {f: formatTimeMaybeInt, s: true}, larger: {f: formatTimeNum, s: false}})';
    } else if (x[2] === 's') {
      return 'formatTime(' + x.slice(4, -2) + ', {seconds: {f: formatTimeMaybeInt, s: true}, larger: {f: formatTimeMaybeInt, s: true}})';
    }
  } else if (x[1] === 'y') {
    return 'pluralize(' + x.slice(3, -2) + ', \'y\', \'ies\')';
  }
}

function updateDisplaySet(l, ind, prop, val) {
  let access = l + '[' + ind + '].' + prop;
  return 'let v = ' + val + '; if (' + access + ' !== v) {' + access + ' = v};'
}

function updateDisplayOneElement(x, i) {
  return 'if (shouldUpdate("e' + i + '")) {' + updateDisplaySet('e', i, 'textContent', extractCode(x)) + '};'
}

function styleNameToJsName(x) {
  if (x === 'class') {
    return 'className';
  }
  return x.replace(/-[a-z]/g, (y) => y[1].toUpperCase());
}

function updateDisplayOneStyle(x, i) {
  return x.match(/ ~[-!.a-z]+=[^~]+~/g).map(function (y, j) {
    let property = y.split('=')[0].slice(2).split('.').map(styleNameToJsName).join('.');
    let head = '';
    if (property[0] === '!') {
      property = property.slice(1);
      head = '!';
    }
    return head + 'if (shouldUpdate("b' + i + '")) {' + updateDisplaySet('b', i, property, y.split('=').slice(1).join('=').slice(0, -1)) + '};';
  });
}

function cmp(a, b) {
  return (a < b) ? -1 : ((a > b) ? 1 : 0);
}

function flatten(l) {
  return [].concat.apply([], l.map(i => Array.isArray(i) ? i : [i]));
}

function getUntabbed(inTabs) {
  let untabbed = {};
  for (let i = 0; i < el1Number; i++) {
    untabbed['e' + i] = true;
  }
  for (let i = 0; i < el2Number; i++) {
    untabbed['b' + i] = true;
  }
  for (let i of inTabs) {
    for (let j of i[1]) {
      delete untabbed[j];
    }
  }
  return Object.keys(untabbed).sort((a, b) => (-cmp(a[0], b[0])) || cmp(+a.slice(1), +b.slice(1)));
}

function makeUpdateDisplaySetup(setupList) {
  return 'let e;\nlet b;\nlet majorDivs;\nlet majorDivTable;\nlet tickMap;\n\nlet shouldUpdate = x => majorDivTable[x].every(' +
  'y => {if (!(y in tickMap)) {tickMap[y] = document.getElementById(y).style.display !== "none"}; ' +
  'return tickMap[y]});\n\nfunction updateDisplayPageLoadSetup() {\n  e = [' +
  [...Array(el1Number)].map((_, i) => 'document.getElementById("e' + i + '")').join(', ') + '];\n  b = [' +
  [...Array(el2Number)].map((_, i) => 'document.getElementById("b' + i + '")').join(', ') + '];\n  let majorDivsOrig = ' +
  '[...document.getElementsByClassName("major-div")];\n  majorDivs = majorDivsOrig.map(x => x.id);\n  majorDivTable = {};\n  for (let i of e.concat(b)) {' +
  'majorDivTable[i.id] = majorDivsOrig.filter(j => j.contains(i) && !i.contains(j)).map(j => j.id)}' +
  ';\n}\n\nfunction updateDisplaySaveLoadSetup() {\n' + g(setupList, '  ') + '\n}';
}

let g = (l, s) => l.map(i => s + i).join('\n');

function makeUpdateDisplay(el1CodeList, el2CodeList, setupList, inTabs) {
  let f = x => [el1CodeList, el2CodeList]['eb'.indexOf(x[0])][+x.slice(1)];
  let untabbed = getUntabbed(inTabs);
  let setupCode = makeUpdateDisplaySetup(setupList);
  let updateDisplayCode = 'function updateDisplay() {' + (cache ? '\n  Cache.clearDisplayCaches();' : '') + '\n  tickMap = {};\n' + g(flatten(untabbed.map(f)), '  ') + '\n' +
  inTabs.map(x => '  if (' + x[0][0] + '[' + x[0].slice(1) + '].style.display !== "none") {\n' +
  g(flatten(x[1].map(f)), '    ') + '\n  }').join('\n') + '\n}';
  return setupCode + '\n\n' + updateDisplayCode;
}

let el1Number = 0;
let el2Number = 0;

function dealWithElement(x) {
  return x.includes('~') ? x.replace(/^<[-a-z]+/, (y) => y + ' id="b' + el2Number++ + '"').replace(/ ~[-!.a-z]+=[^~]+~/g, '') : x;
}

let files = process.argv.length > 2 ? process.argv.slice(2) : ['index-template.html', 'index.html', 'js/update-display.js']

let time = Date.now();

if (!(files[0].endsWith('.html') && files[1].endsWith('.html') && files[2].endsWith('.js'))) {
  throw new Error('Wrong file types. Files should be (1) input html file you\'re editing directly, (2) output html file, (3) output JS file.');
}

if (files[0] === files[1]) {
  throw new Error('Input HTML file and output HTML file have same name. This is almost certainly a typo.');
}

let cache = files.length <= 3 || files[3] !== 'no-cache';

if (cache && process.argv.length > 2) {
  console.log('Didn\'t specify cache. Are you sure? Use no-cache to disable cache.');
}

fs.readFile(files[0], 'utf8', function(err, rawContents) {
  let trueContents = preprocessFinal(preprocess(rawContents.replace(/%time%/g, time)));
  let newContents = trueContents.replace(
    /<[-a-z]+( [-a-z]+="[^"]+"| ~[-!.a-z]+=[^~]+~)*\/?>/g, dealWithElement).replace(
    /~([fioqrsy]|t[iqs]?) [^~]+ ~/g, (x) => '<span id="e' + el1Number++ + '"></span>');
  let el1CodeList = (trueContents.match(/~([fioqrsy]|t[iqs]?) [^~]+ ~/g) || []).map(updateDisplayOneElement);
  let el2CodeList = (trueContents.match(/<[-a-z]+( [-a-z]+="[^"]+"| ~[-!.a-z]+=[^~]+~)*\/?>/g) || []).filter(x => x.includes('~')).map(updateDisplayOneStyle);
  let setupList = flatten(el2CodeList.map(x => x.filter(y => y[0] === '!').map(y => y.slice(1))));
  el2CodeList = el2CodeList.map(x => x.filter(y => y[0] !== '!'));
  let inTabs = (newContents.match(/<tab .*?<\/tab>/gs) || []).map(
    x => x.match(/id="[be]\d+"/g).map(y => y.slice(4, -1))).map(x => [x[0], x.slice(1)]);
  let updateDisplay = makeUpdateDisplay(el1CodeList, el2CodeList, setupList, inTabs);
  newContents = newContents.replace(/<tab /g, '<div ').replace(/<\/tab>/g, '</div>');
  if (newContents.includes('~')) {
    let index = newContents.indexOf('~')
    console.log('context for first tilde:\n' + newContents.slice(Math.max(0, index - 100), index + 100));
    throw new Error('tilde found in output, check above for context');
  }
  fs.writeFile(files[1], newContents, function (err) {console.log(err)});
  fs.writeFile(files[2], updateDisplay, function (err) {console.log(err)});
});
