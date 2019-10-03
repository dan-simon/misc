function getEffect(i, progressOverride) {
  let x = (progressOverride === undefined) ? player.progress[i] : progressOverride;
  if (i === 1 || i === 5) {
    if (player.currentChallenge === 'inefficient') {
      return new Decimal(1);
    } else {
      return dilationBoost(Decimal.pow(2, x / 1800 * getEffect(7)));
    }
  } else if (i === 2 || i === 6) {
    if (player.currentChallenge === 'ufd') {
      return 0;
    } else {
      return x / 1800 * getEffect(7);
    }
  } else if (i === 3) {
    if (player.currentChallenge === 'lonely') {
      return 1;
    } else {
      return Math.floor(maybeLog(baseDevs() + getAdditionalDevsDueToUpdates() + x * getUpdatePowerEffect(2) * challengeReward('lonely') / 300));
    }
  } else if (i === 4) {
    return getTimeForPatienceMeterToMaxOut(x, player.enlightened)
  } else if (i === 7) {
    return getPatienceMeterEffect(x, getTotalEnlightened());
  }
}

function formatEffect(i, progressOverride) {
  let effect = getEffect(i, progressOverride);
  if (i === 1 || i === 5 || i == 7) {
    return format(effect) + 'x';
  } else if (i === 2 || i === 6) {
    return '+' + format(effect);
  } else if (i === 4) {
    return toTime(effect, {secondFractions: true});
  } else {
    return format(effect);
  }
}
