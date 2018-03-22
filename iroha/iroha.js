function bin_log (n) {
  let r = Math.floor(n.log2());
  return BiDecimal.plus(r, n.shift(-r).sub(1));
}

function bin_inv (n) {
  let r = Math.ceil(n.log2());
  let x = BiDecimal.shift(1, r);
  let diff = x.sub(n);
  return new BiDecimal(1).plus(diff.shift(1 - r)).shift(-r);
}

let iroha_zero = '日';

let iroha_one = '山';

let iroha_nan = '今';

let iroha_negate = function (x) {return '見' + x}

let iroha_invert = function (x) {return '世' + x}

let iroha_special = 'いろはにほへとちりぬるをわかよたれそつねならむうのおくやまけふこえてあさきゆめみしひもせす' +
'アイウエオカキクケコサシスセソタチツテト';

function iroha (n, depth, japanese) {
  if (!(n instanceof BiDecimal)) {
    n = new BiDecimal(n);
  }
  if (n.isNaN()) {
    return japanese ? iroha_nan : 'NaN';
  }
  if (depth === 0) {
    return '';
  }
  if (n.eq(0)) {
    return japanese ? iroha_zero : '0';
  }
  if (n.eq(1)) {
    return japanese ? iroha_one : '1';
  }
  if (n.lt(0)) {
    return (japanese ? iroha_negate : ((x) => '-' + x))(iroha(n.negate(), depth, japanese));
  }
  if (n.lt(1)) {
    return (japanese ? iroha_invert : ((x) => '/' + x))(iroha(bin_inv(n), depth, japanese));
  }
  let log = bin_log(bin_log(n));
  let neg = log.lt(0);
  let start_of_negs = 27;
  let iroha_prefix = neg ? ((x) => x + start_of_negs) : ((x) => x < start_of_negs ? x : 1000);
  let paren_surround = (x) => '(' + x + ')';
  let normal_prefix = (x) => (neg ? '~' : '') + paren_surround(x);
  log = log.abs();
  let num = Math.floor(log.toNumber());
  let rem = log.sub(num);
  let rec = bin_inv(BiDecimal.sub(1, rem));
  return (japanese ? (iroha_special[iroha_prefix(num)] ||
  paren_surround(iroha(num * (neg ? -1 : 1), Infinity, japanese))) : normal_prefix(num)) +
  (rec.eq(1) ? '' : iroha(rec, depth - 1, japanese));
}
