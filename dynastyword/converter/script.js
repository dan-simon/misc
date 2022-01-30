function decrypt_data(puzdata) {
    var ab = atob(puzdata);
    ab = Uint8Array.from(ab.split(""), e => e.charCodeAt(0));
    var inflate = new Zlib.RawInflate(ab);
    var plain = inflate.decompress();
    let decrypted = new TextDecoder().decode(plain);
    return decrypted;
}

function c(x) {
  if (x >= 52) {
    throw new Error();
  }
  let v = String.fromCharCode('A'.charCodeAt(0) + (x % 26));
  if (x >= 26) {
    v = v.toLowerCase();
  }
  return v;
}

function f(x) {
  let d = decrypt_data(x.split('?')[1].split('&').filter(i => i.startsWith('p='))[0].slice(2));
  let y = d.split('\n').filter(i => i.includes('zN'))[0];
  let z = JSON.parse(y.replace(/([{,])([A-Za-z0-9_]+):/g, '$1"$2":')).zN;
  // This should be numbers with digits from 2 to (base - 3) inclusive in base (grid size + 4, but why check this).
  let s = Object.keys(z);
  s.sort((a, b) => (+a) - (+b));
  s = s.map(i => z[i][0]);
  if (s.includes('\u30fc') || s.includes('\u30f3')) {
    let r = [];
    let d = {};
    let count = 0;
    for (let i of s) {
      if (i === '\u30fc') {
        r.push('1');
      } else if (i === '\u30f3') {
        r.push('2');
      } else if (i in d) {
        r.push(d[i]);
      } else {
        d[i] = c(count);
        r.push(d[i]);
        count += 1;
      }
    }
    return r.join('');
  } else {
    return s.join('');
  }
}

function convert() {
  let text = document.getElementById('in').value;
  let res = 'https://dan-simon.github.io/misc/dynastyword?grid=' + f(text);
  document.getElementById('out').value = res;
  document.getElementById('out').select();
  document.execCommand('copy');
  document.getElementById('copied').innerText = '(copied!)';
}
