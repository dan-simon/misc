let controlDown = false;
let shiftDown = false;

window.addEventListener('keydown', function(event) {
  if (event.keyCode === 17) controlDown = true;
  if (event.keyCode === 16) shiftDown = true;
  if (!player.options.hotkeys || controlDown === true || document.activeElement.type === "text") return false
  const tmp = event.keyCode;
  if ((tmp >= 49 && tmp <= 56) || (tmp >= 97 && tmp <= 104)) {
    let gen = tmp % 48;
    if (shiftDown) {
      Generator(gen).buy();
    } else {
      Generator(gen).buyMax();
    }
    return false;
  }
  switch (event.keyCode) {
    case 66: // B
      if (shiftDown) {
        Boost.buy();
      } else {
        Boost.buyMax();
      }
    break;

    case 69: // E, also, nice
      EternityPrestigeLayer.eternity();
    break;

    case 73: // I
      InfinityPrestigeLayer.infinity();
    break;

    case 77: // M
      MaxAll.maxAll();
    break;

    case 80: // P
      Prestige.prestige();
    break;

    case 83: // S
      Sacrifice.sacrifice();
    break;
  }
}, false);

window.addEventListener('keyup', function(event) {
  if (event.keyCode === 17) controlDown = false;
  if (event.keyCode === 16) shiftDown = false;
  if (!player.options.hotkeys || controlDown === true || document.activeElement.type === "text") return false;
}, false);
