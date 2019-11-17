let fs = require('fs');

function extractCode(x) {
  if (x[1] === 'f') {
    return 'format(' + x.slice(3, -2) + ')';
  } else if (x[1] === 'r') {
    return x.slice(3, -2);
  }
}

function updateDisplayOneElement(x, i) {
  return '  document.getElementById("e' + i + '").innerHTML = ' + extractCode(x) + ';'
}

function styleNameToJsName(x) {
  if (x === 'class') {
    return 'className';
  }
  return x.replace(/-[a-z]/g, (y) => y[1].toUpperCase());
}

function updateDisplayOneStyle(x, i) {
  return x.match(/ ~[-.a-z]+=[^~]+~/).map(function (y, j) {
    let property = y.split('=')[0].slice(2).split('.').map(styleNameToJsName).join('.');
    return '  document.getElementById("b' + i + '").' + property + ' = ' + y.split('=').slice(1).join('=').slice(0, -1) + ';';
  }).join('\n');
}

let el1Number = 0;
let el2Number = 0;

function dealWithElement(x) {
  return x.includes('~') ? x.replace(/^<[-a-z]+/, (y) => y + ' id="b' + el2Number++ + '"').replace(/ ~[-.a-z]+=[^~]+~/g, '') : x;
}

fs.readFile('index-template.html', 'utf8', function(err, contents) {
  let newContents = contents.replace(
    /<[-a-z]+( [-a-z]+="[^"]+"| ~[-.a-z]+=[^~]+~)*\/?>/g, dealWithElement).replace(
    /~[fr] [^~]+ ~/g, (x) => '<span id="e' + el1Number++ + '"></span>');
  let updateDisplay = 'function updateDisplay() {\n' +
  (contents.match(/~[fr] [^~]+ ~/g) || []).map(updateDisplayOneElement).concat(
    (contents.match(/<[-a-z]+( [-a-z]+="[^"]+"| ~[-.a-z]+=[^~]+~)*\/?>/g) || []).filter(x => x.includes('~')).map(updateDisplayOneStyle)).join('\n') + '\n}';
  fs.writeFile('index.html', newContents, function (err) {console.log(err)});
  fs.writeFile('js/update-display.js', updateDisplay, function (err) {console.log(err)});
});
