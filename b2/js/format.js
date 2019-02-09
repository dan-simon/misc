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

function numberToSuperscript(x) {
  x = x + '';
  let s = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  for (let i = 0; i < s.length; i++) {
    x = x.replace(i + '', s[i]);
  }
  return x;
}
