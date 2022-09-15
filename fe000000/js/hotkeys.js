let toggleDown = false;
let globalShiftDown = false;
let lastHotkeyUse = {
  'infinity': -Infinity,
  'eternity': -Infinity,
  'complexity': -Infinity,
  'finality': -Infinity
}

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

// We need to avoid referencing things that might not exist yet due to not all scripts having run.
let HotkeyMaxAll = {
  things: [
    {
      purchase: list => MaxAll.maxAll(list),
      generators: [1, 2, 3, 4, 5, 6, 7, 8],
      upgrades: [9],
      tab: 'main'
    },
    {
      purchase: list => InfinityMaxAll.maxAll(list),
      generators: [1, 2, 3, 4, 5, 6, 7, 8],
      upgrades: [9, 10],
      tab: 'infinity'
    },
    // This is mostly irrelevant since we only show the player this once they reach infinity,
    // and they can easily buy all slow generators by then (and never lose them),
    // but we include it for completeness.
    {
      purchase: function (list) {
        for (let i of list) {
          Autobuyer(i).unlockSlow();
        }
      },
      unlocks: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      tab: 'autobuyers'
    },
    {
      purchase: list => EternityMaxAll.maxAll(list),
      generators: [1, 2, 3, 4, 5, 6, 7, 8],
      upgrades: [9, 10, 11],
      tab: 'eternity'
    },
    // We deviate slightly from tab order to do things in the same order
    // as the autobuyer code.
    {
      purchase: list => EternityMaxAll.maxAll(list),
      upgrades: [12, 13],
      tab: 'eternity-producer'
    },
    {
      purchase: list => EternityMaxAll.maxAll(list),
      upgrades: [14, 15, 16],
      tab: 'studies'
    },
    {
      purchase: list => EternityMaxAll.maxAll(list),
      upgrades: [17, 18, 19, 20],
      tab: 'eternity-producer'
    },
    // This "true" means "via autobuyer". It's likely that,
    // if a player is using this, they're just mindlessly holding M,
    // so we should treat this similarly to an automatic unlock.
    {
      purchase: () => EternityProducer.unlock(true),
      type: 'unlock',
      tab: 'eternity-producer'
    },
    {
      purchase: function (list) {
        for (let i of list) {
          Chroma.unlockColor(i, true);
        }
      },
      unlocks: [1, 2, 3, 4, 5, 6],
      tab: 'chroma'
    },
    {
      purchase: list => ComplexityMaxAll.maxAll(list),
      generators: [1, 2, 3, 4, 5, 6, 7, 8],
      tab: 'complexity'
    },
    {
      purchase: list => ComplexityMaxAll.maxAll(list),
      upgrades: [9, 10, 11, 12, 13, 14, 15],
      tab: 'powers'
    },
    {
      purchase: () => Powers.unlock(true),
      type: 'unlock',
      tab: 'powers'
    },
    {
      purchase: () => Oracle.unlock(true),
      type: 'unlock',
      tab: 'oracle'
    },
    {
      purchase: () => Galaxy.unlock(true),
      type: 'unlock',
      tab: 'galaxies'
    },
    {
      purchase: list => FinalityMaxAll.maxAll(list),
      generators: [1, 2, 3, 4, 5, 6, 7, 8],
      tab: 'finality'
    },
    {
      purchase: list => FinalityShards.maxAll(list),
      upgrades: [1, 2, 3, 4, 5, 6, 7, 8],
      tab: 'finality-shards'
    },
  ],
  trigger(fullMaxAll) {
    let types = fullMaxAll ?
      (Options.maxAllMode() === 'All generators, upgrades, and unlocks' ?
      ['generators', 'upgrades', 'unlocks'] : ['generators', 'upgrades']) :
      ['generators'];
    let tabs = {
      'Normal generators and boosts': ['main'],
      'Generators and upgrades in current tab': [Tabs.currentTab()],
      'Both': ['main', Tabs.currentTab()],
      'All generators and upgrades': 'all',
      'All generators, upgrades, and unlocks': 'all'
    }[Options.maxAllMode()];
    for (let i of this.things) {
      if (tabs === 'all' || tabs.includes(i.tab)) {
        if ('type' in i) {
          if (types.includes(i.type + 's')) {
            i.purchase();
          }
        } else {
          let l = [];
          for (let t of types) {
            if (t in i) {
              l = l.concat(i[t]);
            }
          }
          // This needs to go outside the above for loop to stop intermediate buying of things
          // (e.g. buying generators before boosts, when generators are generally less valuable than boosts).
          // You might think this would go without saying, but apparently it was originally in the for loop, which
          // unsurprisingly caused bugs.
          // I'm not sure if not sorting would lead to buying things in the wrong order, but better safe than sorry.
          l.sort();
          i.purchase(l);
        }
      }
    }
  }
}

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
    
    case 37: // left
      Tabs.move(false, globalShiftDown);
    break;
    
    case 39: // right
      Tabs.move(true, globalShiftDown);
    break;
    
    case 65: // A
      if (shiftDown) {
        Autobuyers.toggleAll();
      } else {
        Autobuyers.turnAllOnOrOff();
      }
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
      lastHotkeyUse.complexity = Date.now() / 1000;
    break;

    case 69: // E, also, nice
      if (shiftDown) {
        EternityChallenge.respecAndReset();
      } else {
        EternityPrestigeLayer.eternity(true);
      }
      lastHotkeyUse.eternity = Date.now() / 1000;
    break;

    case 70: // F
      if (shiftDown) {
        FinalityShardPresets.respecAndReset();
      } else {
        FinalityPrestigeLayer.finality(true);
      }
      lastHotkeyUse.finality = Date.now() / 1000;
    break;
    
    case 71: // G
      HotkeyMaxAll.trigger(false);
    break;

    case 73: // I
      InfinityPrestigeLayer.infinity(true, null);
      lastHotkeyUse.infinity = Date.now() / 1000;
    break;

    case 77: // M
      HotkeyMaxAll.trigger(true);
    break;

    case 79: // O
      Oracle.invoke();
    break;

    case 80: // P
      if (shiftDown) {
        Powers.respecAndReset();
      } else {
        Prestige.prestige(true);
      }
    break;
    
    case 82: // R
      Permanence.gainPermanence(true);
    break;

    case 83: // S
      if (shiftDown) {
        Studies.respecAndReset();
      } else {
        Sacrifice.sacrifice(true);
      }
    break;
    
    case 84: // T
      toggleDown = true;
    break;
    
    case 8 * 11: // X
      ChallengeExitOrRestart.exitChallenge();
    break;
    
    case 89: // Y
      ChallengeExitOrRestart.restartChallenge();
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
      true, SpecialDivs.isDivVisible('boosts'), SpecialDivs.isDivVisible('sacrifice'), SpecialDivs.isDivVisible('prestige'),
      PrestigeLayerProgress.hasReached('infinity') || InfinityPrestigeLayer.canInfinity(),
      PrestigeLayerProgress.hasReached('eternity') || EternityPrestigeLayer.canEternity(),
      PrestigeLayerProgress.hasReached('eternity'),
      PrestigeLayerProgress.hasReached('complexity') || EternityProducer.isUnlocked(),
      PrestigeLayerProgress.hasReached('complexity') || EternityChallenge.areEternityChallengesVisible(),
      PrestigeLayerProgress.hasReached('complexity') || ComplexityPrestigeLayer.canComplexity(),
      PrestigeLayerProgress.hasReached('finality') || Powers.isUnlocked(),
      PrestigeLayerProgress.hasReached('finality') || Oracle.isUnlocked(),
      PrestigeLayerProgress.hasReached('finality') || FinalityPrestigeLayer.canFinality(),
      PrestigeLayerProgress.hasReached('finality')
    ];
  },
  eachText: function () {
    let oneToEight = formatOrdinalInt(1) + '-' + formatOrdinalInt(8);
    return [
      '1-8 to buy max of Generator ' + oneToEight + ' respectively, shift+1-8 to buy one of ' +
      'Generator ' + oneToEight + ' respectively, G to max all ~g~, M to max all ~g~ and boosts, ' +
      'A to turn all autobuyers on/off, shift+A to toggle all autobuyers',
      'B to buy max boosts, shift+B to buy a boost', 'S to sacrifice', 'P to prestige',
      'I to infinity, X to exit challenge, Y to restart challenge (exit and start again)',
      'E to eternity', 'shift+S to respec studies and eternity',
      'R to gain permanence', 'shift+E to respec eternity challenge and eternity', 'C to complexity',
      'shift+P to unequip equipped powers and complexity', 'O to get a prediction from the Oracle',
      'F to finality', 'shift+F to respec finality shard upgrades and finality'
    ];
  },
  listText: function () {
    let criteria = this.criteria();
    // This join-then-split thing is very important if the first item of the list,
    // which has commas in it, is the only item (that is, before you can prestige).
    let parts = this.eachText().filter((_, i) => criteria[i]).join(', ').split(', ');
    parts[parts.length - 1] = 'and ' + parts[parts.length - 1];
    return parts.join(', ').replace(/~g~/g, Generators.term());
  }
};
