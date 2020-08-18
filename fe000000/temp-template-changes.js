let fs = require('fs');

fs.readFile('index-template.html', 'utf8', function(err, contents) {
  let r = /( +)<span ~class=Powers\.color\((['a-z]+), (\d+)\)~>~r Powers\.description\(['a-z]+, \d+\) ~<\/span>\n +<br\/>\n +<span ~class=Powers\.color\(['a-z]+, \d+\)~>~r Powers.details\(['a-z]+, \d+\) ~<\/span>/gm;
  let newContents = contents.replace(r, function (match, x1, x2, x3) {
    return `${x1}<span ~class=Powers.color(${x2}, ${x3})~>~r Powers.detailsFirstLine(${x2}, ${x3}) ~</span>\n${x1}<br/>\n${x1}<span ~class=Powers.color(${x2}, ${x3})~>~r Powers.detailsSecondLine(${x2}, ${x3}) ~</span>`;
  });
  fs.writeFile('new-index-template-generated.html', newContents, function (err) {console.log(err)});
});