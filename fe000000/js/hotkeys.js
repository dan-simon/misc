window.addEventListener('keydown', function(event) {
  let controlDown = event.ctrlKey || event.metaKey;
  let shiftDown = event.shiftKey;
  if (!player.options.hotkeys || controlDown || document.activeElement.type === "text") return false
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
    case 65: // A
      Autobuyers.toggleAll();
    break;

    case 66: // B
      if (shiftDown) {
        Boost.buy();
      } else {
        Boost.buyMax();
      }
    break;

    case 67: // C
      ComplexityPrestigeLayer.complexity(true);
    break;

    case 69: // E, also, nice
      EternityPrestigeLayer.eternity(true);
    break;

    case 70: // F
      FinalityPrestigeLayer.finality(true);
    break;

    case 73: // I
      InfinityPrestigeLayer.infinity(true);
    break;

    case 77: // M
      MaxAll.maxAll();
    break;

    case 79: // O
      Oracle.invoke();
    break;

    case 80: // P
      Prestige.prestige(true);
    break;

    case 83: // S
      Sacrifice.sacrifice(true);
    break;
  }
}, false);

