function format(amount) {
  let power = amount.exponent;
  let mantissa = amount.mantissa;
  if (power < 3) return amount.toFixed(1)
  if (power >= 1e6) return "e" + format(new Decimal(amount.log(10)))
  return mantissa.toFixed(2) + "e" + power
}
