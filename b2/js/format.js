function format(amount) {
  let power = amount.exponent;
  let mantissa = amount.mantissa;
  if (power < 3) return amount.toFixed(1)
  return mantissa.toFixed(2) + "e" + power
}
