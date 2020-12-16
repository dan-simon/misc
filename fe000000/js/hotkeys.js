let toggleDown = false;
let globalShiftDown = false;

let codeToAutobuyers = {
  49: 1,
  50: 2,
  51: 3,
  52: 4,
  53: 5,
  54: 6,
  55: 7,
  56: 8,
  97: 1,
  98: 2,
  99: 3,
  100: 4,
  101: 5,
  102: 6,
  103: 7,
  104: 8,
  65: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  66: 9,
  67: 15,
  69: 13,
  70: 16,
  71: [1, 2, 3, 4, 5, 6, 7, 8],
  73: 12,
  77: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  80: 11,
  82: 14,
  83: 10,
};

window.addEventListener('keydown', function(event) {
  let controlDown = event.ctrlKey || event.metaKey;
  let shiftDown = event.shiftKey;
  if ((player && !player.options.hotkeys) || controlDown || (document.activeElement && document.activeElement.type === 'text')) return false;
  const tmp = event.keyCode;
  if (toggleDown) {
    if (tmp in codeToAutobuyers) {
      Autobuyers.toggleSome(codeToAutobuyers[tmp]);
    }
    return;
  }
  if ((tmp >= 49 && tmp <= 56) || (tmp >= 97 && tmp <= 104)) {
    let gen = tmp % 48;
    if (shiftDown) {
      Generator(gen).buy();
    } else {
      Generator(gen).buyMax();
    }
    return false;
  }
  switch (tmp) {
    case 16: // shift
      globalShiftDown = true;
    break;
    
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
    
    case 71: // G
      MaxAll.maxAllGenerators();
    break;

    case 73: // I
      InfinityPrestigeLayer.infinity(true, null);
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
    
    case 82: // R
      Permanence.gainPermanence();
    break;

    case 83: // S
      Sacrifice.sacrifice(true);
    break;
    
    case 84: // T
      toggleDown = true;
    break;
  }
}, false);

window.addEventListener('keyup', function(event) {
  // This is slightly over-engineered, but it's for symmetry.
  let controlDown = event.ctrlKey || event.metaKey;
  let shiftDown = event.shiftKey;
  if ((player && !player.options.hotkeys) || controlDown || (document.activeElement && document.activeElement.type === 'text')) return false;
  const tmp = event.keyCode;
  switch (tmp) {
    case 16: // shift
      globalShiftDown = false;
    break;
    
    case 84: // T
      toggleDown = false;
    break;
  }
}, false);

let Hotkeys = {
  criteria: function() {
    // There's some inconsistency here, in that the prestige hotkey is visible as soon as prestige is visible
    // (even if not reached), but later hotkeys are only visible when reached. I think it's justifiable,
    // because in the early game it's good to show future content (unless there's so much it will scare people,
    // which isn't the case here) and to show that there are hotkeys for it.
    return [
      true, SpecialDivs.isDivVisible('prestige'),
      PrestigeLayerProgress.hasReached('infinity') || InfinityPrestigeLayer.canInfinity(),
      PrestigeLayerProgress.hasReached('eternity') || EternityPrestigeLayer.canEternity(),
      PrestigeLayerProgress.hasReached('complexity') || EternityProducer.isUnlocked(),
      PrestigeLayerProgress.hasReached('complexity') || ComplexityPrestigeLayer.canComplexity(),
      PrestigeLayerProgress.hasReached('finality') || Oracle.isUnlocked(),
      PrestigeLayerProgress.hasReached('finality') || FinalityPrestigeLayer.canFinality()
    ];
  },
  eachText: [
    '1-8 to buy max of Generator 1-8 respectively, shift+1-8 to buy one of ' +
    'Generator 1-8 respectively, B to buy max boosts, shift+B to buy a boost, ' +
    'G to max all ~g~, M to max all ~g~ and boosts, A to toggle all autobuyers, S to sacrifice',
    'P to prestige', 'I to infinity', 'E to eternity', 'R to gain permanence', 'C to complexity',
    'O to get a prediction from the oracle', 'F to finality'
  ],
  listText: function () {
    let criteria = this.criteria();
    // This join-then-split thing is very important if the first item of the list,
    // which has commas in it, is the only item (that is, before you can prestige).
    let parts = this.eachText.filter((_, i) => criteria[i]).join(', ').split(', ');
    parts[parts.length - 1] = 'and ' + parts[parts.length - 1];
    return parts.join(', ').replace(/~g~/g, Generators.term());
  }
};
