function format(amount, places=2) {
  amount = new Decimal(amount);
  let power = amount.exponent;
  let mantissa = amount.mantissa;
  if (power < places + 1) return amount.toFixed(places)
  if (power >= 1e6) return "e" + format(new Decimal(amount.log(10)))
  return mantissa.toFixed(places) + "e" + power
}

function formatLong(x) {
  return format(x, places=5);
}

let superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';

function numberToSuperscript(x) {
  x = x + '';
  for (let i = 0; i < superscripts.length; i++) {
    x = x.replace(new RegExp(i + '', 'g'), superscripts[i]);
  }
  return x;
}
