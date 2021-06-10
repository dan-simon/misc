let scale = function (steps, stepsPerDouble) {
  if (steps < stepsPerDouble - 1) {
    return new Decimal(1 + steps);
  } else {
    let s = steps - (stepsPerDouble - 1);
    return new Decimal((stepsPerDouble + s % stepsPerDouble) * Math.pow(2, Math.floor(s / stepsPerDouble)));
  }
}

let logMult = function (a, b) {
  let a1 = logBin(a);
  let b1 = logBin(b);
  let c1 = a1 + b1;
  return Decimal.pow(2, Math.floor(c1)).times(c1 - Math.floor(c1) + 1).round();
}

let logInv = function (a) {
  let a1 = logBin(a);
  return Decimal.pow(0.5, Math.ceil(a1)).times(Math.ceil(a1) - a1 + 1);
}

let logBin = function (a) {
  return Math.floor(a.log2()) + a.div(Decimal.pow(2, Math.floor(a.log2()))).toNumber() - 1;
}

let zoneToCost = function (zone) {
  let adjZone = Math.ceil(zone * logInv(new Decimal(1 + Perks.amount(5) / 16)).toNumber());
  return logMult(new Decimal(16), scale(adjZone - 1, 2));
}
