function gameLoop () {
  let now = Date.now();
  let diff = (now - player.lastUpdate) / 1000;
  if (player.generators[0].prestigeAmount.exponent >= singularityUnlockExp) {
    player.singularity.unlocked = true;
  }
  if (player.singularity.unlocked) {
    var singularityExp = 3 + Math.max(0,(Decimal.log10(player.incrementali.currencyAmount.plus(1))-30)/100)
    player.singularity.currencyAmount = player.singularity.currencyAmount.plus(
      Decimal.pow(player.generators[0].prestigeAmount.max(1).log(10) / singularityUnlockExp, singularityExp).times(getIncrementaliUpgradeEffect(2)).times(diff));
  }
  if (player.singularity.currencyAmount.gte(1e24)) {
    player.incrementali.unlocked = true;
  }
  if (player.incrementali.unlocked) {
    incrementaliTick(diff);
  }
  for (let i = player.generators.length - 1; i >= 0; i--) {
    for (let j = player.generators[i].list.length - 1; j >= 0; j--) {
      let gain = player.generators[i].list[j].amount.times(getMult(i, j)).times(diff);
      if (j === 0) {
        if (i === 0) {
          player.generators[i].prestigeAmount = player.generators[i].prestigeAmount.plus(gain);
        } else {
          player.generators[i].currencyAmount = player.generators[i].currencyAmount.plus(gain);
        }
      } else {
        player.generators[i].list[j - 1].amount = player.generators[i].list[j - 1].amount.plus(gain);
      }
    }
    if (player.generators[i].autoMaxAll) {
      maxAll(i);
    }
    if (player.generators[i].prestigeGain) {
      player.generators[i + 1].prestigeAmount = player.generators[i + 1].prestigeAmount.plus(getPrestigeGain(player.generators[i].prestigeAmount).times(diff));
    }
  }
  player.lastUpdate = now;
}

loadGame();
setInterval(saveGame, 10000);
setInterval(gameLoop, 50);
