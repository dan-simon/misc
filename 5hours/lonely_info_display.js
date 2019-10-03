function updateLonelyInfoDisplay() {
  if (player.currentChallenge === 'lonely') {
    document.getElementById('additional-devs-due-to-updates-info').innerHTML = ' (This does not apply in the Lonely challenge.)';
    document.getElementById('auto-dev-lonely-info').innerHTML = ' (basically useless in the Lonely challenge)';
  } else {
    document.getElementById('additional-devs-due-to-updates-info').innerHTML = '';
    document.getElementById('auto-dev-lonely-info').innerHTML = '';
  }
}
