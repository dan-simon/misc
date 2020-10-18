let fs = require('fs');

function extractCode(x) {
  if (x[1] === 'f') {
    return 'format(' + x.slice(3, -2) + ')';
  } else if (x[1] === 'i') {
    return 'formatInt(' + x.slice(3, -2) + ')';
  } else if (x[1] === 'q') {
    return 'formatMaybeInt(' + x.slice(3, -2) + ')';
  } else if (x[1] === 'r') {
    return x.slice(3, -2);
  } else if (x[1] === 's') {
    return 'pluralize(' + x.slice(3, -2) + ', \'\', \'s\')';
  } else if (x[1] === 't') {
    if (x[2] === ' ') {
      return 'formatTime(' + x.slice(3, -2) + ', {seconds: {f: format, s: false}, larger: {f: format, s: false}})';
    } else if (x[2] === 'i') {
      return 'formatTime(' + x.slice(4, -2) + ', {seconds: {f: formatInt, s: true}, larger: {f: format, s: false}})';
    } else if (x[2] === 'q') {
      return 'formatTime(' + x.slice(4, -2) + ', {seconds: {f: formatMaybeInt, s: true}, larger: {f: format, s: false}})';
    } else if (x[2] === 's') {
      return 'formatTime(' + x.slice(4, -2) + ', {seconds: {f: formatMaybeInt, s: true}, larger: {f: formatMaybeInt, s: true}})';
    }
  } else if (x[1] === 'y') {
    return 'pluralize(' + x.slice(3, -2) + ', \'y\', \'ies\')';
  }
}

function updateDisplayOneElement(x, i) {
  return 'e[' + i + '].textContent = ' + extractCode(x) + ';'
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
    return head + 'b[' + i + '].' + property + ' = ' + y.split('=').slice(1).join('=').slice(0, -1) + ';';
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
  return 'let e;\nlet b;\n\nfunction updateDisplayPageLoadSetup() {\n  e = [' +
  [...Array(el1Number)].map((_, i) => 'document.getElementById("e' + i + '")').join(', ') + '];\n  b = [' +
  [...Array(el2Number)].map((_, i) => 'document.getElementById("b' + i + '")').join(', ') +
  '];\n}\n\nfunction updateDisplaySaveLoadSetup() {\n' + g(setupList, '  ') + '\n}';
}

let g = (l, s) => l.map(i => s + i).join('\n');

function makeUpdateDisplay(el1CodeList, el2CodeList, setupList, inTabs) {
  let f = x => [el1CodeList, el2CodeList]['eb'.indexOf(x[0])][+x.slice(1)];
  let untabbed = getUntabbed(inTabs);
  let setupCode = makeUpdateDisplaySetup(setupList);
  let updateDisplayCode = 'function updateDisplay() {\n' + g(flatten(untabbed.map(f)), '  ') + '\n' +
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

fs.readFile(files[0], 'utf8', function(err, contents) {
  let contentsWithTime = contents.replace(/%time%/g, time);
  let newContents = contentsWithTime.replace(
    /<[-a-z]+( [-a-z]+="[^"]+"| ~[-!.a-z]+=[^~]+~)*\/?>/g, dealWithElement).replace(
    /~([fiqrsy]|t[iqs]?) [^~]+ ~/g, (x) => '<span id="e' + el1Number++ + '"></span>');
  let el1CodeList = (contents.match(/~([fiqrsy]|t[iqs]?) [^~]+ ~/g) || []).map(updateDisplayOneElement);
  let el2CodeList = (contents.match(/<[-a-z]+( [-a-z]+="[^"]+"| ~[-!.a-z]+=[^~]+~)*\/?>/g) || []).filter(x => x.includes('~')).map(updateDisplayOneStyle);
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
