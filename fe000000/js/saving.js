let offlineSimulationData = {active: false, globalId: 0};

let getOfflineSimulationID = function () {
  offlineSimulationData.globalId++;
  return offlineSimulationData.globalId;
}

let Saving = {
  h(s) {
    let x = [...s.toLowerCase().replace(/[^0-9a-z]/g, '')].map(i => parseInt(i, 36));
    let r = 0;
    for (let i of x) {
      r += i;
      r *= 42;
      r %= 1e12;
    }
    return r;
  },
  encoder: new TextEncoder(),
  decoder: new TextDecoder(),
  startString: 'FE000000SaveStart',
  endString: 'FE000000SaveEnd',
  steps: [
    { encode: JSON.stringify, decode: JSON.parse },
    { encode: x => Saving.encoder.encode(x), decode: x => Saving.decoder.decode(x) },
    { encode: x => pako.deflate(x), decode: x => pako.inflate(x) },
    {
      encode: x => Array.from(x).map(i => String.fromCharCode(i)).join(""),
      decode: x => Uint8Array.from(Array.from(x).map(i => i.charCodeAt(0)))
    },
    { encode: x => btoa(x), decode: x => atob(x) },
    {
      encode: x => x.replace(/=+$/g, "").replace(/0/g, "0a").replace(/\+/g, "0b").replace(/\//g, "0c"),
      decode: x => x.replace(/0b/g, "+").replace(/0c/g, "/").replace(/0a/g, "0")
    },
    {
      encode: x => Saving.startString + x + Saving.endString,
      decode: x => x.slice(Saving.startString.length, -Saving.endString.length),
    }
  ],
  encode(s) {
    return this.steps.reduce((x, f) => f.encode(x), s);
  },
  decode(s) {
    if (s.startsWith(Saving.startString)) {
      return this.steps.reduceRight((x, f) => f.decode(x), s);
    } else {
      return JSON.parse(atob(s));
    }
  },
  saveGame(isAutoLoop, isDirectlyManual) {
    // Stop the player from saving the game while time is being simulated.
    if (blocked) {
      if (!isAutoLoop) {
        alert('This is an evanescent simulation. Saving it is forbidden.');
      }
      return;
    }
    localStorage.setItem('fe000000-save', this.encode(player));
    if (isDirectlyManual) {
      Notifications.notify('Manually saved!', 'saveLoad');
    }
  },
  quickLoadIssueCheck(s) {
    let p = this.decode(s);
    for (let i of ['boost', 'currentTab', 'generators', 'lastUpdate', 'prestigePower', 'stars']) {
      if (!(i in p)) {
        // This message has additional context when shown. 
        return 'It has no "' + i + '" property.';
      }
    }
    return null;
  },
  loadGame(s, offlineProgress, minTicks, isOracle, callback) {
    if (blocked) {
      let c = confirm('Time is currently being simulated. Loading a save while time ' +
        'is being simulated may cause weird behavior, and it\'s recommended to finish the ' +
        'existing simulation first, just in case. Are you sure you want to load? ' +
        '(This message may appear if you did something that uses loading in its implementation, ' +
        'such as resetting.)');
      if (c) {
        blocked = false;
        document.getElementById('loading').style.display = 'none';
        document.getElementById('simulatetime').style.display = 'none';
        document.getElementById('main').style.display = '';
        offlineSimulationData.id = getOfflineSimulationID();
      } else {
        return;
      }
    }
    // offlineProgress = null means leave it up to the save.
    player = this.decode(s);
    if (offlineProgress === null) {
      offlineProgress = Options.offlineProgress();
    }
    let originalVersion = player.version;
    this.fixPlayer();
    this.convertSaveToDecimal();
    this.doLastFixes(originalVersion);
    let setupPageLoad = function (now) {
      player.lastUpdate = now;
      Saving.saveGame(false, false);
      Options.updateCheckboxSize();
      Options.updateButtonOutlines();
      Colors.updateColors();
      NotationOptions.basePropsChange();
      updateDisplaySaveLoadSetup();
      // We had to do this here in case we immediately start simulating time again.
      updateDisplay();
    }
    if (isOracle) {
      callback();
    } else {
      // We can do this after fixing Decimal.
      let now = Date.now();
      if (offlineProgress) {
        let realTicks = (minTicks === null) ? this.defaultTicks() :
          Math.max(minTicks, this.defaultTicks());
        this.simulateTime((now - player.lastUpdate) / 1000, realTicks, true, function () {
          setupPageLoad(now);
          callback();
        });
      } else {
        setupPageLoad(now);
        callback();
      }
    }
  },
  defaultTicks() {
    return Options.offlineTicks();
  },
  simulateTimeUpdate(time, ticks, totalTicks) {
    document.getElementById('timesimulated').innerHTML =
      formatTime(time, {seconds: {f: formatTimeNum, s: false}, larger: {f: formatTimeNum, s: false}});
    document.getElementById('tickssimulated').innerHTML = formatInt(ticks);
    document.getElementById('totaltickssimulated').innerHTML = formatInt(totalTicks);
    let expectedTotalTime = time * totalTicks / ticks;
    document.getElementById('expectedtotaltimesimulated').innerHTML = ticks === 0 ? 'unknown' :
      formatTime(expectedTotalTime, {seconds: {f: formatTimeNum, s: false}, larger: {f: formatTimeNum, s: false}});
    document.getElementById('expectedremainingtimesimulated').innerHTML = ticks === 0 ? 'unknown' :
      formatTime(expectedTotalTime - time, {seconds: {f: formatTimeNum, s: false}, larger: {f: formatTimeNum, s: false}});
    document.getElementById('bar').style.width = Math.floor(ticks / totalTicks * 512) + 'px';
  },
  simulateTime(totalDiff, maxTicks, showSimulation, callback) {
    if (totalDiff < 0) {
      alert('It appears that your save is somehow from ' +
        formatTime(-totalDiff, {seconds: {f: formatTimeNum, s: false}, larger: {f: formatTimeNum, s: false}}) +
        ' in the future. You may want to figure out what might be causing this.');
      player.lastUpdate = Date.now();
      callback();
      return;
    }
    // Add this not for any of the actual JS files, but for ease of use from console.
    if (maxTicks === undefined) {
      maxTicks = this.defaultTicks();
    }
    // And similarly
    if (callback === undefined) {
      callback = () => true;
    }
    let baseTickLength = 0.064;
    let id = getOfflineSimulationID();
    offlineSimulationData.active = true;
    offlineSimulationData.id = id;
    offlineSimulationData.ticks = Math.ceil(Math.min(totalDiff / baseTickLength, maxTicks));
    offlineSimulationData.tickLength = totalDiff / offlineSimulationData.ticks;
    let startTime = Date.now();
    let lastUpdateTime = Date.now();
    if (showSimulation) {
      document.getElementById('simulatetime').style.display = '';
      this.simulateTimeUpdate((lastUpdateTime - startTime) / 1000, 0, offlineSimulationData.ticks);
    }
    offlineSimulationData.tick = 0;
    blocked = true;
    let interval = setInterval(function() {
      // This should only happen when having loaded a save, starting a new simulation
      // and completely negating the old one.
      if (offlineSimulationData.id !== id) {
        clearInterval(interval);
      }
      let initialTick = offlineSimulationData.tick;
      while (offlineSimulationData.tick < Math.min(offlineSimulationData.ticks, initialTick + 256)) {
        gameLoop(offlineSimulationData.tickLength, false, false);
        let d = Date.now();
        offlineSimulationData.tick++;
        // This is measured in milliseconds.
        if (d - lastUpdateTime > 64) {
          lastUpdateTime = d;
          if (showSimulation) {
            Saving.simulateTimeUpdate((lastUpdateTime - startTime) / 1000, offlineSimulationData.tick, offlineSimulationData.ticks);
          }
        }
      }
      if (offlineSimulationData.tick === offlineSimulationData.ticks) {
        blocked = false;
        clearInterval(interval);
        offlineSimulationData.active = false;
        if (showSimulation) {
          document.getElementById('simulatetime').style.display = 'none';
        }
        callback();
      }
    }, 1);
  },
  speedUpOffline() {
    if (!offlineSimulationData.active) {
      return;
    }
    let oldTicks = offlineSimulationData.ticks - offlineSimulationData.tick;
    let newTicks = 1024;
    if (oldTicks <= newTicks) {
      return;
    }
    offlineSimulationData.tickLength *= oldTicks / newTicks;
    offlineSimulationData.ticks = newTicks;
    offlineSimulationData.tick = 0;
  },
  slowDownOffline() {
    if (!offlineSimulationData.active) {
      return;
    }
    let baseTickLength = 0.064;
    let oldTicks = offlineSimulationData.ticks - offlineSimulationData.tick;
    let newTicks = Math.ceil(Math.min(offlineSimulationData.tickLength * oldTicks / baseTickLength, 2 * oldTicks));
    // I think this always works; once slowDownOffline() is called enough that base tick length becomes relevant,
    // the number of ticks is always the remaining time divided by base tick length, rounded up.
    if (oldTicks >= newTicks) {
      return;
    }
    offlineSimulationData.tickLength *= oldTicks / newTicks;
    offlineSimulationData.ticks = newTicks;
    offlineSimulationData.tick = 0;
  },
  oracleSimulateTime(totalDiff, totalTicks, callback) {
    let firstDiff = Math.max(0, totalDiff - 16);
    let secondDiff = Math.min(16, totalDiff);
    Saving.simulateTime(firstDiff, totalTicks, true, function () {
      // 1024 is more than enough for max ticks however long secondDiff is
      // (since it's at most 16 seconds).
      Saving.simulateTime(secondDiff, 1024, false, callback);
    });
  },
  fixPlayer() {
    if (player.version < 1.25) {
      // The first line here fixes a bug, the rest are due to new content.
      player.prestigePower = Decimal.max(1, player.prestigePower);
      player.infinityPoints = new Decimal(0);
      player.infinities = 0;
      player.infinityStars = new Decimal(1);
      player.infinityGenerators = initialInfinityGenerators();
      player.highestInfinityGenerator = 0;
      player.infinityUpgrades = [0, 0];
      player.version = 1.25;
    }
    if (player.version < 1.3125) {
      player.sacrificeMultiplier = new Decimal(1);
      // This is done so old saves that have reached infinity won't be stuck.
      // It works because 2^256 - 2 is still 2^256 in the number library used.
      // Also, we use Decimal.minus because player.stars is usually a string here.
      player.stats = {
        totalStarsProduced: Decimal.minus(player.stars, 2).max(0),
        timeSincePurchase: 0,
        timeSinceSacrifice: 0,
        timeSincePrestige: 0,
        timeSinceInfinity: 0,
        timeSinceGameStart: 0,
        peakIPPerSec: new Decimal(0)
      };
      player.version = 1.3125;
    }
    if (player.version < 1.375) {
      player.currentChallenge = 0;
      player.challengesCompleted = [
        false, false, false, false, false, false,
        false, false, false, false, false, false,
      ];
      player.breakInfinity = false;
      player.stats.purchasesThisInfinity = 0;
      player.version = 1.375;
    }
    if (player.version < 1.40625) {
      player.stats.totalIPProduced = new Decimal(0);
      player.stats.fastestInfinity = Math.pow(2, 256);
      player.stats.timeSinceLastPeakIPPerSec = Math.pow(2, 256);
      player.stats.lastTenInfinities = [
        [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
        [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
        [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
        [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
        [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
      ];
      player.version = 1.40625;
    }
    if (player.version < 1.4375) {
      player.autobuyers = initialAutobuyers();
      // this is usable for testing and for cheaters
      player.cheats = {
        gameSpeed: 1,
      };
      player.version = 1.4375;
    }
    if (player.version < 1.453125) {
      player.currentInfinityChallenge = 0;
      player.infinityChallengesCompleted = [
        false, false, false, false, false, false, false, false,
      ];
      // Eternity hasn't been added yet, so this is clearly correct.
      player.stats.totalStarsProducedThisEternity = player.stats.totalStarsProduced;
      player.version = 1.453125;
    }
    if (player.version < 1.4609375) {
      player.stats.prestigesThisInfinity = 0;
      player.version = 1.4609375;
    }
    if (player.version < 1.46875) {
      player.stats.purchasesThisInfinityByType = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      player.version = 1.46875;
    }
    if (player.version < 1.5) {
      player.eternityPoints = new Decimal(0);
      player.eternities = 0;
      player.eternityStars = new Decimal(2);
      player.eternityGenerators = initialEternityGenerators();
      player.highestEternityGenerator = 0;
      player.eternityMilestonesOn = [true, true];
      player.autobuyers.push({on: false, mode: 'Amount', priority: new Decimal(2)});
      player.infinityAutobuyers = [
        false, false, false, false, false, false, false, false, false, false
      ];
      player.stats.totalEPProduced = new Decimal(0);
      player.stats.timeSinceEternity = player.stats.timeSinceGameStart;
      player.stats.timeSinceLastPeakEPPerSec = Math.pow(2, 256);
      player.stats.fastestEternity = Math.pow(2, 256);
      player.stats.peakEPPerSec = new Decimal(0);
      player.stats.lastTenEternities = initialLastTenEternities();
      player.version = 1.5;
    }
    if (player.version < 1.50625) {
      player.slowAutobuyers = [
        false, false, false, false, false, false, false, false, false,
      ];
      player.slowAutobuyersTimer = 0;
      player.version = 1.50625;
    }
    if (player.version < 1.515625) {
      player.boughtTheorems = [0, 0, 0];
      player.unspentTheorems = 0;
      player.studies = [
        false, false, false, false, false, false,
        false, false, false, false, false, false,
      ];
      player.version = 1.515625;
    }
    if (player.version < 1.5234375) {
      player.fastAutobuyersTimer = 0;
      player.autobuyersTimerLength = 0;
      player.version = 1.5234375;
    }
    if (player.version < 1.53125) {
      player.totalIPProducedThisEternity = player.totalIPProduced;
      player.version = 1.53125;
    }
    if (player.version < 1.546875) {
      player.eternityUpgrades = [0, 0];
      player.version = 1.546875;
    }
    if (player.version < 1.5625) {
      player.boostPower = 1;
      player.version = 1.5625;
    }
    if (player.version < 1.578125) {
      player.bestBoostPowerEver = 1;
      player.version = 1.578125;
    }
    if (player.version < 1.59375) {
      player.eternityUpgrades.push(0);
      player.version = 1.59375;
    }
    if (player.version < 1.609375) {
      player.eternityProducer = {
        unlocked: false,
        upgrades: [0, 0]
      };
      player.version = 1.609375;
    }
    if (player.version < 1.625) {
      // No Decimal conversion has happened yet.
      if (player.stars === "0" && player.generators.every(x => x.amount === "0")) {
        player.stars = new Decimal(2);
      }
      player.version = 1.625;
    }
    if (player.version < 1.640625) {
      player.unlockedEternityChallenge = 0;
      player.currentEternityChallenge = 0;
      player.eternityChallengeCompletions = [0, 0, 0, 0, 0, 0, 0, 0];
      player.respecEternityChallenge = false;
      player.version = 1.640625;
    }
    if (player.version < 1.65625) {
      player.permanence = 0;
      player.permanenceUpgrades = [0, 0, 0, 0];
      player.hasGainedPermanence = false;
      player.version = 1.65625;
    }
    if (player.version < 1.671875) {
      player.chroma = {
        colors: [0, 0, 0, 0, 0, 0],
        unlocked: [false, false, false, false, false, false],
        current: 0,
        next: 0
      };
      player.version = 1.671875;
    }
    if (player.version < 1.6875) {
      player.studies = player.studies.concat([0, 0, 0, 0]);
      player.version = 1.6875;
    }
    if (player.version < 1.703125) {
      player.chroma.colors = player.chroma.colors.slice(0, 5);
      player.chroma.unlocked = player.chroma.unlocked.slice(0, 5);
      player.version = 1.703125;
    }
    if (player.version < 1.71875) {
      // This variable was accidentally not defined in the initial save, with no consequence at all.
      // Still, best to define it.
      player.respecStudies = false;
      player.bestBoostPowerThisComplexity = player.bestBoostPowerEver;
      delete player.bestBoostPowerEver;
      delete player.unspentTheorems;
      player.eternities = new Decimal(player.eternities);
      player.permanence = new Decimal(player.permanence);
      player.complexityPoints = new Decimal(0);
      player.complexities = 0;
      player.complexityStars = new Decimal(2);
      player.complexityGenerators = initialComplexityGenerators();
      player.highestComplexityGenerator = 0;
      player.complexityChallengeCompletions = [0, 0, 0, 0, 0, 0];
      player.isComplexityChallengeRunning = [true, true, true, true, true, true];
      player.stats.totalStarsProducedThisComplexity = player.stats.totalStarsProduced;
      player.stats.totalEPProducedThisComplexity = player.stats.totalEPProduced;
      player.stats.totalCPProduced = new Decimal(0);
      player.stats.timeSinceComplexity = player.stats.timeSinceGameStart;
      player.stats.timeSinceLastPeakCPPerSec = Math.pow(2, 256);
      player.stats.fastestComplexity = Math.pow(2, 256);
      player.stats.peakCPPerSec = new Decimal(0);
      player.stats.lastTenComplexities = initialLastTenComplexities();
      player.version = 1.71875;
    }
    if (player.version < 1.734375) {
      player.complexityChallengeSafeguards = [false, false, false, false, false];
      player.version = 1.734375;
    }
    if (player.version < 1.765625) {
      player.complexityUpgrades = [
        [false, false, false, false],
        [false, false, false, false],
        [false, false, false, false],
        [false, false, false, false]
      ];
      player.version = 1.765625;
    }
    if (player.version < 1.78125) {
      player.presets = [];
      player.version = 1.78125;
    }
    if (player.version < 1.796875) {
      player.autobuyers.push({isOn: true, mode: 'X times last', priority: new Decimal(2)});
      // The loose justification for the array being arranged like this is that
      // the first 8 autobuyers are for eternity generators, and the other 9 are
      // for other things.
      player.eternityAutobuyers = [
        true, true, true, true, true, true, true, true,
        true, true, true, true, true, true, true, true, true,
      ];
      player.stats.lastPermanenceGain = new Decimal(0);
      player.stats.timeSincePermanenceGain = 0;
      player.version = 1.796875;
    }
    if (player.version < 1.8125) {
      player.stats.totalEternitiesProducedThisComplexity = player.eternities;
      player.chroma.colors.push(0);
      player.chroma.unlocked.push(false);
      player.version = 1.8125;
    }
    if (player.version < 1.828125) {
      player.isEternityChallengeRequirementDisplayOn = true;
      player.version = 1.828125;
    }
    if (player.version < 1.84375) {
      player.eternityAutobuyers = player.eternityAutobuyers.slice(0, 13).concat(
        [true, true, true], player.eternityAutobuyers.slice(13));
      player.stats.timeSinceAutoECCompletion = 0;
      player.autoECCompletion = true;
      player.usedAutoECCompletionThisComplexity = false;
      player.version = 1.84375;
    }
    if (player.version < 1.859375) {
      player.autobuyers.push({isOn: true, mode: 'Amount', priority: new Decimal(2)});
      player.bestBoostPower = player.bestBoostPowerThisComplexity;
      delete player.bestBoostPowerThisComplexity;
      player.extraTheorems = [0, 0, 0, 0];
      player.version = 1.859375;
    }
    if (player.version < 1.875) {
      player.highestBoostsBought = 0;
      player.boughtTheoremsThisComplexity = player.boughtTheorems.some(x => x !== 0);
      player.version = 1.875;
    }
    if (player.version < 1.890625) {
      player.complexityAchievements = player.complexityUpgrades;
      delete player.complexityUpgrades;
      player.version = 1.890625;
    }
    if (player.version < 1.89453125 || !player.options.completionColors) {
      player.options.completionColors = true;
      player.version = Math.max(player.version, 1.89453125);
    }
    if (player.version < 1.90625) {
      // player.powers.next will be deleted later
      player.powers = {
        seed: RNG.createSeed(),
        unlocked: false,
        upgrades: [0, 0, 0],
        active: [],
        stored: [],
        next: null,
        gain: true,
        respec: false
      };
      player.stats.timeSincePowerGain = 0;
      player.version = 1.90625;
    }
    if (player.version < 1.9140625) {
      player.powers.hasGainedShards = false;
      player.powers.shards = 0;
      player.powers.shardUpgrades = [0, 0, 0, 0];
      player.powers.powerDeletionMode = 'Confirmation';
      player.version = 1.9140625;
    }
    if (player.version < 1.921875) {
      player.powers.upgrades = player.powers.upgrades.slice(0, 2).concat([0, player.powers.upgrades[2]]);
      player.version = 1.921875;
    }
    if (player.version < 1.9296875) {
      player.powers.upgrades.pop();
      player.version = 1.9296875;
    }
    if (player.version < 1.93359375) {
      player.powers.presets = [];
      player.version = 1.93359375;
    }
    if (player.version < 1.9345703125) {
      player.stats.totalInfinityStarsProduced = player.infinityStars;
      player.stats.totalEternityStarsProduced = player.eternityStars;
      player.stats.totalComplexityStarsProduced = player.complexityStars;
      player.galaxies = {
        unlocked: false
      };
      player.version = 1.9345703125;
    }
    if (player.version < 1.935546875) {
      player.galaxies.dilated = 0;
      player.galaxies.nextDilated = 0;
      delete player.powers.next;
      player.options.completionColors = player.options.completionColors ? 'On (gradient)' : 'Off'
      player.version = 1.935546875;
    }
    if (player.version < 1.9365234375) {
      player.powers.craft = {
        type: 'normal',
        strength: 'max',
        rarity: 1,
      };
      player.version = 1.9365234375;
    }
    if (player.version < 1.9375) {
      player.powers.lastData = {
        lowRarity: false,
        type: 'normal'
      }
      player.version = 1.9375;
    }
    if (player.version < 1.9384765625) {
      delete player.powers.craft.strength;
      player.version = 1.9384765625;
    }
    if (player.version < 1.939453125) {
      player.powers.autoSort = {
        active: false,
        stored: false
      }
      player.options.exportDisplay = false;
      player.version = 1.939453125;
    }
    if (player.version < 1.9404296875) {
      player.oracle = {
        unlocked: false,
        time: 256,
        timeSimulated: 256,
        complexityPoints: new Decimal(0),
        complexityPointGain: new Decimal(0),
        used: false,
        alert: false,
        powerDisplay: true,
        powers: []
      };
      player.complexityAutobuyers = [
        true, true, true, true, true, true, true, true,
        true, true, true
      ];
      player.version = 1.9404296875;
    }
    if (player.version < 1.940673828125 || !player.firstTwelveStudyPurchaseOrder) {
      player.firstTwelveStudyPurchaseOrder = player.studies.slice(0, 12).map(
        (x, i) => x ? i + 1 : 0).filter(x => x);
      player.version = Math.max(player.version, 1.940673828125);
    }
    if (player.version < 1.94091796875 || !player.isTabVisible) {
      player.isTabVisible = {
        'infinity-challenges': false,
        'eternity-producer': false,
        'eternity-challenges': false,
        'chroma': false,
        'powers': false,
        'oracle': false,
        'galaxies': false,
      };
      player.version = Math.max(player.version, 1.94091796875);
    }
    if (player.version < 1.94140625) {
      player.finalityPoints = new Decimal(0);
      player.totalFinalityShards = 0;
      player.respecFinalityShards = false;
      player.finalities = 0;
      player.finalityStars = new Decimal(1);
      player.finalityGenerators = initialFinalityGenerators();
      player.highestFinalityGenerator = 0;
      player.finalityShardUpgrades = [0, 0, 0, 0, 0, 0, 0, 0];
      player.finalityShardUpgradePresets = [];
      player.complexityAutobuyers = player.complexityAutobuyers.concat([true, true, true, true]);
      player.goals = [
        false, false, false, false, false, false, false, false,
        false, false, false, false, false, false, false, false
      ];
      if (player.sacrificeMultiplier !== '1') {
        player.goals[0] = true;
      }
      if (player.prestigePower !== '1') {
        player.goals[1] = true;
      }
      // This works for numbers, strings (that can be converted to Decimal), and Decimals.
      // It also works for undefined, but it should never need to.
      // Why each of these things is relevant: infinities and complexities will both be numbers,
      // and eternities will be a Decimal if they weren't in the save before (default value)
      // and a string if they were (we haven't converted the save yet).
      let isPositive = function (x) {
        return Decimal.gt(x, 0);
      }
      // Is this remotely worth the optimization of not recalculating stuff? Probably not.
      // Note that finalities were added right at this time so there was no need to check for them.
      let posData = {
        'infinities': isPositive(player.infinities),
        'eternities': isPositive(player.eternities),
        'complexities': isPositive(player.complexities)
      };
      if (posData.infinities || posData.eternities || posData.complexities) {
        // We don't technically know that the player has done all these things but it's a fair guess.
        player.goals[0] = true;
        player.goals[1] = true;
        player.goals[2] = true;
      }
      if (posData.eternities || posData.complexities) {
        player.goals[5] = true;
      }
      if (posData.complexities) {
        player.goals[10] = true;
      }
      player.displayAllGoals = false;
      player.stats.totalStarsProducedThisFinality = player.stats.totalStarsProduced;
      player.stats.totalInfinityStarsProducedThisFinality = player.stats.totalInfinityStarsProduced;
      player.stats.totalEternityStarsProducedThisFinality = player.stats.totalEternityStarsProduced;
      player.stats.totalComplexityStarsProducedThisFinality = player.stats.totalComplexityStarsProduced;
      delete player.stats.totalInfinityStarsProduced;
      delete player.stats.totalEternityStarsProduced;
      delete player.stats.totalComplexityStarsProduced;
      player.stats.totalCPProducedThisFinality = player.stats.totalCPProduced;
      player.stats.totalFPProduced = new Decimal(0);
      player.stats.timeSinceFinality = player.stats.timeSinceGameStart;
      player.stats.fastestFinality = Math.pow(2, 256);
      player.stats.lastTenFinalities = initialLastTenFinalities();
      player.version = 1.94140625;
    }
    if (player.version < 1.9423828125) {
      player.galaxies.resetDilatedOnFinality = true;
      player.version = 1.9423828125;
    }
    if (player.version < 1.943359375) {
      player.studyListAutoLoad = {
        studyList: '',
        on: true
      };
      player.version = 1.943359375;
    }
    if (player.version < 1.9443359375) {
      player.powerListAutoLoad = {
        powerList: '',
        on: true
      };
      player.autobuyers.push({isOn: true, mode: 'none', priority: 'none'});
      player.version = 1.9443359375;
    }
    if (player.version < 1.9453125) {
      let newList = [];
      for (let i of player.firstTwelveStudyPurchaseOrder) {
        if (!newList.includes(i)) {
          newList.push(i);
        }
      }
      player.firstTwelveStudyPurchaseOrder = newList;
      player.version = 1.9453125;
    }
    if (player.version < 1.9462890625) {
      player.tabOptions = {
        'main': true,
        'infinity': true,
        'challenges': true,
        'autobuyers': true,
        'infinity-challenges': true,
        'goals': true,
        'statistics': true,
        'options': true,
        'eternity': true,
        'eternity-milestones': true,
        'studies': true,
        'eternity-producer': true,
        'eternity-challenges': true,
        'chroma': true,
        'complexity': true,
        'complexity-challenges': true,
        'complexity-achievements': true,
        'powers': true,
        'oracle': true,
        'galaxies': true,
        'finality': true,
        'finality-shards': true,
        'finality-milestones': true,
      };
      player.version = 1.9462890625;
    }
    if (player.version < 1.947265625) {
      player.complexityChallengeLastCompletion = [[-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1]],
      player.version = 1.947265625;
    }
    if (player.version < 1.9482421875) {
      player.oracle.complexityChallengeCompletions = [0, 0, 0, 0, 0, 0];
      player.oracle.originalComplexityChallengeCompletions = [0, 0, 0, 0, 0, 0];
      player.version = 1.9482421875;
    }
    if (player.version < 1.94921875) {
      player.areNewlyUnlockedAutobuyersOn = true;
      player.version = 1.94921875;
    }
    if (player.version < 1.9501953125) {
      player.powers.initialSeed = player.powers.seed;
      player.version = 1.9501953125;
    }
    if (player.version < 1.951171875) {
      player.chroma.displayAmount = 0;
      player.oracle.powerFutureExtraMultipliers = true;
      player.version = 1.951171875;
    }
    if (player.version < 1.9521484375) {
      delete player.powers.autoSort;
      player.oracle.extraMultipliers = {
        normal: 1,
        infinity: 1,
        eternity: 1,
        complexity: 1
      };
      player.version = 1.9521484375;
    }
    if (player.version < 1.953125) {
      player.stats.lastResetsToShow = 10;
      player.version = 1.953125;
    }
    if (player.version < 1.9541015625) {
      if (player.complexities < 12 && player.finalities === 0) {
        player.autobuyers[14].isOn = false;
      }
      player.version = 1.9541015625;
    }
    if (player.version < 1.955078125) {
      player.challengeRestartOnCompletion = false;
      player.version = 1.955078125;
    }
    if (player.version < 1.9560546875) {
      player.options.fitToWidth = true;
      player.version = 1.9560546875;
    }
    if (player.version < 1.95703125) {
      player.isDivVisible = {
        'prestige': false,
        'infinity': false,
        'boost-power': false,
        'softcap': false,
        'hardcap': false,
      };
      player.version = 1.95703125;
    }
    if (player.version < 1.9580078125) {
      player.oracle.ticks = 1024;
      player.oracle.ticksSimulated = 1024;
      player.oracle.finalities = 0;
      player.oracle.originalFinalities = 0;
      player.oracle.finalityShards = 0;
      player.oracle.originalFinalityShards = 0;
      player.version = 1.9580078125;
    }
    if (player.version < 1.958984375) {
      if (!player.powers.unlocked) {
        player.powers.lastData.next = 'none';
      }
      player.version = 1.958984375;
    }
    if (player.version < 1.9599609375) {
      player.options.theme = 'Dark';
      player.version = 1.9599609375;
    }
    if (player.version < 1.9609375) {
      player.options.largerCheckboxes = false;
      player.version = 1.9609375;
    }
    if (player.version < 1.9619140625) {
      player.tabOptions['last-ten-runs'] = true;
      player.stats.lastRunsToShow = player.stats.lastResetsToShow;
      delete player.stats.lastResetsToShow;
      player.stats.lastRunTypesToShow = {
        infinity: true,
        eternity: true,
        complexity: true,
        finality: true
      };
      player.viewAllGenerators = false;
      player.version = 1.9619140625;
    }
    if (player.version < 1.962890625) {
      player.options.offlineTicks = 1024;
      player.version = 1.962890625;
    }
    if (player.version < 1.9638671875) {
      player.options.timeDisplay = 'Seconds';
      player.version = 1.9638671875;
    }
    if (player.version < 1.96484375) {
      player.highestBoostsBoughtThisEternity = player.boost.bought;
      player.version = 1.96484375;
    }
    if (player.version < 1.965820312) {
      player.confirmations = {
        sacrifice: true,
        prestige: true,
        infinity: true,
        eternity: true,
        complexity: true,
        finality: true,
      };
      player.version = 1.965820312;
    }
    if (player.version < 1.966796875) {
      player.confirmations.complexityReset = true;
      player.version = 1.966796875
    }
    if (player.version < 1.9677734375) {
      player.complexityChallengeTimeSpent = [0, 0, 0, 0, 0, 0];
      player.version = 1.9677734375;
    }
    if (player.version < 1.96875) {
      player.confirmations.studiesRespec = true;
      player.confirmations.eternityChallengeRespec = true;
      player.confirmations.powersRespec = true;
      player.confirmations.finalityShardUpgradesRespec = true;
      player.version = 1.96875;
    }
    if (player.version < 1.9697265625) {
      player.oracle.originalGalaxies = 0;
      player.oracle.galaxies = 0;
      player.version = 1.9697265625;
    }
    if (player.version < 1.970703125) {
      player.studyMode = 'Buy';
      player.confirmations.singleStudyRefund = true;
      player.powers.powerDeactivationMode = 'Confirmation';
      player.version = 1.970703125;
    }
    if (player.version < 1.9716796875) {
      player.options.resetColors = true;
      player.options.tabColors = true;
      player.version = 1.9716796875;
    }
    if (player.version < 1.97265625) {
      player.disableAutobuyersWhenStarting = {
        challenge: false,
        infinityChallenge: false,
      };
      player.version = 1.97265625;
    }
    if (player.version < 1.9736328125) {
      player.options.theme = {
        background: player.options.theme,
        buttonColor: 'Vibrant',
        completionGradients: 'Default'
      }
      player.version = 1.9736328125;
    }
    if (player.version < 1.974609375) {
      player.studyDisplayCostWhenBought = false;
      player.version = 1.974609375;
    }
    if (player.version < 1.9755859375) {
      player.stats.bestStarsThisSacrifice = player.stars;
      player.stats.bestStarsThisPrestige = player.stars;
      player.stats.bestStarsThisInfinity = player.stars;
      player.version = 1.9755859375;
    }
    if (player.version < 1.9765625) {
      player.options.viewAllGenerators = player.viewAllGenerators;
      delete player.viewAllGenerators;
      player.options.viewGeneratorsWhenStarsAtLimit = false;
      player.studySettings = {
        firstTwelveStudyPurchaseOrder: player.firstTwelveStudyPurchaseOrder,
        respecStudies: player.respecStudies,
        studyMode: player.studyMode,
        studyDisplayCostWhenBought: player.studyDisplayCostWhenBought,
        boughtTheoremsThisComplexity: player.boughtTheoremsThisComplexity,
        rebuyAfterComplexityChallenge6: true,
        studiesBeforeLastRespec: initialStudies(),
      },
      delete player.firstTwelveStudyPurchaseOrder;
      delete player.respecStudies
      delete player.studyMode;
      delete player.studyDisplayCostWhenBought;
      delete player.boughtTheoremsThisComplexity;
      player.version = 1.9765625;
    }
    if (player.version < 1.9775390625) {
      player.oracle.powerGainInPredictions = 'Same';
      player.version = 1.9775390625;
    }
    if (player.version < 1.978515625) {
      player.options.viewAllGenerators = true;
      player.version = 1.978515625;
    }
    if (player.version < 1.9794921875) {
      player.stats.timeSinceExport = 0;
      player.options.exportNotificationFrequency = Math.pow(2, 16);
      player.tabPresets = [];
      player.version = 1.9794921875;
    }
    if (player.version < 1.98046875) {
      player.studySettings.showPresetExplanation = false;
      player.version = 1.98046875;
    }
    if (player.version < 1.9814453125) {
      player.stats.timeSinceIPGainWasAmount = 0;
      player.stats.timeSinceEPGainWasAmount = 0;
      player.stats.timeSinceCPGainWasAmount = 0;
      player.stats.timeSinceIPGainWasTotal = 0;
      player.stats.timeSinceEPGainWasTotal = 0;
      player.stats.timeSinceCPGainWasTotal = 0;
      player.version = 1.9814453125;
    }
    if (player.version < 1.982421875) {
      player.studySettings.presetRespecStudies = false;
      player.powers.presetRespec = false;
      player.presetRespecFinalityShards = false;
      player.version = 1.982421875;
    }
    if (player.version < 1.9833984375) {
      player.lastPresetIndices = [0, 0, 0, 0];
      player.options.presetHighlightColors = false;
      player.version = 1.9833984375;
    }
    if (player.version < 1.984375) {
      player.options.showGeneratorAndBoostAutobuyers = true;
      player.version = 1.984375;
    }
    if (player.version < 1.9853515625) {
      player.options.headerSettings = {
        showCurrentChallenges: true,
        showNextCCCompletion: true,
        showResetButtonsForHiddenTabs: true,
      };
      player.options.optionTypeShown = 'saving';
      player.version = 1.9853515625;
    }
    if (player.version < 1.986328125) {
      player.stats.timeSinceSacrificePossible = 0;
      player.stats.timeSincePrestigePossible = 0;
      player.version = 1.986328125;
    }
    if (player.version < 1.9873046875) {
      player.oracle.powerShards = 0;
      player.oracle.originalPowerShards = 0;
      player.version = 1.9873046875;
    }
    if (player.version < 1.98828125) {
      // New saves get -1 for this. 0 is slightly less likely to lead to bug reports, I think.
      player.complexityChallengeLastCompletion = player.complexityChallengeLastCompletion.map(i => i.concat([0]));
      player.oracle.activePowers = [];
      player.version = 1.98828125;
    }
    if (player.version < 1.9892578125) {
      player.oracle.showWaitsFromPastTime = true;
      player.version = 1.9892578125;
    }
    if (player.version < 1.990234375) {
      // Note that player.options.viewAllGenerators.normal is true by default,
      // and is intended to be true by default.
      player.options.viewAllGenerators = {
        normal: player.options.viewAllGenerators,
        infinity: false,
        eternity: false,
        complexity: false,
        finality: false,
      };
      player.version = 1.990234375;
    }
    if (player.version < 1.9912109375) {
      player.complexityChallengeLastCompletion = player.complexityChallengeLastCompletion.map(i => [i[0], i[2]]);
      player.version = 1.9912109375;
    }
    if (player.version < 1.9931640625) {
      player.options.showFullOptions = {
        studies: false,
        powers: false,
        finality: false,
      };
      player.version = 1.9931640625;
    }
    if (player.version < 1.994140625) {
      player.confirmations.presetChange = true;
      player.confirmations.presetDeletion = true;
      player.version = 1.994140625;
    }
    if (player.version < 1.9951171875) {
      player.stats.timeSinceOraclePrediction = 0;
      player.version = 1.9951171875;
    }
    if (player.version < 1.99609375) {
      player.infinityChallengeRestartOnCompletion = false;
      player.eternityMilestonesEnabled = player.eternityMilestonesOn;
      delete player.eternityMilestonesOn;
      player.complexityAchievementsEnabled = [true, true];
      player.version = 1.99609375;
    }
    if (player.version < 2) {
      player.complexityAchievementsEnabled.pop();
      player.oracle.isPredicting = false;
      player.tabOptions.achievements = true;
      for (let x of player.tabPresets) {
        x.tabs = 'ac,' + ((x.tabs[0] === 'a') ? ('au' + x.tabs.slice(1)) : x.tabs);
      }
      // Assume that the player has done some EC out of order
      // if they've done an EC apart from the first EC at all.
      player.achievements = {
        table: [
          [false, false, false, false, false, false, false, false],
          [false, false, false, false, false, false, false, false],
          [false, false, false, false, false, false, false, false],
          [false, false, false, false, false, false, false, false],
          [false, false, false, false, false, false, false, false],
          [false, false, false, false, false, false, false, false],
          [false, false, false, false, false, false, false, false],
          [false, false, false, false, false, false, false, false],
        ],
        beyondHighest: 2,
        active: true,
        notifications: true
      };
      // Add some achievement migrations. (This isn't complete but hopefully it's good enough.)
      if (player.sacrificeMultiplier !== '1') {
        player.achievements.table[1][0] = true;
      }
      if (player.prestigePower !== '1') {
        player.achievements.table[1][4] = true;
      }
      // Search for either isPositive or posData above to see more information about them.
      let isPositive = function (x) {
        return Decimal.gt(x, 0);
      }
      // At this point, the player may have finalities.
      let posData = {
        'infinities': isPositive(player.infinities),
        'eternities': isPositive(player.eternities),
        'complexities': isPositive(player.complexities),
        'finalities': isPositive(player.finalities)
      };
      if (posData.infinities || posData.eternities || posData.complexities || posData.finalities) {
        // We don't technically know that the player has done all these things but it's a fair guess.
        player.achievements.table[1][0] = true;
        player.achievements.table[1][4] = true;
        player.achievements.table[1][7] = true;
      }
      if (posData.eternities || posData.complexities || posData.finalities) {
        player.achievements.table[3][3] = true;
      }
      if (posData.complexities || posData.finalities) {
        player.achievements.table[5][4] = true;
      }
      if (posData.finalities) {
        player.achievements.table[7][3] = true;
      }
      if (player.stats.fastestEternity <= 3600) {
        player.achievements.table[3][4] = true;
      }
      if (player.stats.fastestComplexity <= Math.pow(2, 16)) {
        player.achievements.table[5][5] = true;
      }
      if (player.stats.fastestFinality <= Math.pow(2, 16)) {
        player.achievements.table[7][4] = true;
      }
      if (new Decimal(player.stats.totalStarsProduced).gt(Decimal.pow(2, 1024).times(Decimal.pow(2, 64)))) {
        player.achievements.table[2][3] = true;
      }
      if (new Decimal(player.stats.totalStarsProduced).gt(Decimal.pow(9, Math.pow(9, 9)).times(Decimal.pow(2, 64)))) {
        player.achievements.table[5][1] = true;
      }
      player.stats.sacrificesThisInfinity = 0;
      player.version = 2;
    }
    if (player.version < 2.015625) {
      player.confirmations.permanence = true;
      player.achievements.showFullyFarRows = true;
      player.achievements.showCompletedRows = true;
      player.version = 2.015625;
    }
    if (player.version < 2.01953125) {
      if (Decimal.lte(4, player.eternities) && Decimal.lte(player.eternities, 6)) {
        alert('Eternity milestones 4 and 6 have been swapped (view the eternity milestones tab for more information). ' +
          'You may want to change your sacrifice autobuyer to not constantly sacrifice.');
      }
      player.version = 2.01953125;
    }
    if (player.version < 2.03125) {
      player.chroma.timeForChromaValue = 0.875;
      player.chroma.timeForChromaMode = 'fraction of chroma cap';
      player.version = 2.03125;
    }
    if (player.version < 2.046875) {
      // We don't have any better guess.
      player.stats.onlineTimeSinceGameStart = player.stats.timeSinceGameStart;
      player.version = 2.046875;
    }
    if (player.version < 2.05078125) {
      player.isComplexityChallengeExplanationMovedDown = false;
      player.version = 2.05078125;
    }
    if (player.version < 2.0625) {
      player.powers.equipped = player.powers.active;
      player.powers.powerUnequipMode = player.powers.powerDeactivationMode;
      player.oracle.equippedPowers = player.oracle.activePowers;
      delete player.powers.active;
      delete player.powers.powerDeactivationMode;
      delete player.oracle.activePowers;
      player.version = 2.0625;
    }
    if (player.version < 2.078125) {
      player.galaxies.resetNextDilatedOnFinality = player.galaxies.resetDilatedOnFinality;
      player.galaxies.nextDilatedMode = (player.galaxies.nextDilated >= 0) ? 'Amount' : 'All but amount';
      player.galaxies.nextDilatedAmount = Math.abs(player.galaxies.nextDilated);
      delete player.galaxies.nextDilated;
      delete player.galaxies.resetDilatedOnFinality;
      player.version = 2.078125;
    }
    if (player.version < 2.08203125) {
      player.options.complexityChallengeRunningColors = false;
      player.version = 2.08203125;
    }
    if (player.version < 2.0859375) {
      player.achievements.requirementDescriptions = true;
      player.version = 2.0859375;
    }
    if (player.version < 2.08984375) {
      player.stats.hasSeenPowerWarningMessage = false;
      // This might be confusing for one tick but since dilated galaxies
      // can't go down, it's not that bad, if indeed it's bad at all.
      player.galaxies.undilated = 0;
      player.version = 2.08984375;
    }
    if (player.version < 2.09375) {
      if (player.currentTab === 'challenges') {
        player.currentTab = 'normal-challenges';
      }
      player.tabOptions['normal-challenges'] = player.tabOptions.challenges;
      delete player.tabOptions.challenges;
      for (let i of player.tabPresets) {
        i.tabs = i.tabs.split(',').map(j => j === 'cha' ? 'ncha' : j).join(',');
      }
      player.version = 2.09375;
    }
    if (player.version < 2.09765625) {
      player.isEternityMilestoneExplanationMovedDown = false;
      player.version = 2.09765625;
    }
    if (player.version < 2.0986328125) {
      // These two probably shouldn't be the same but coming up
      // with a good value requires computing the chroma cap.
      // If the player switches, they won't be surprised to see
      // the same value, but when they switch back they'll
      // happily see the old value.
      player.chroma.timeForChromaValue = {
        amount: player.chroma.timeForChromaValue,
        capFraction: player.chroma.timeForChromaValue,
      }
      player.version = 2.0986328125;
    }
    if (player.version < 2.099609375) {
      player.options.theme.edgeGradients = 'Default';
      player.version = 2.099609375;
    }
    if (player.version < 2.1015625) {
      for (let i = 0; i < 9; i++) {
        delete player.autobuyers[i].priority;
      }
      player.version = 2.1015625;
    }
    if (player.version < 2.1025390625) {
      player.confirmations.powerDeletionMode = player.powers.powerDeletionMode;
      player.confirmations.powerUnequipMode = player.powers.powerUnequipMode;
      player.confirmations.powersUnequip = player.confirmations.powersRespec;
      delete player.powers.powerDeletionMode;
      delete player.powers.powerUnequipMode;
      delete player.confirmations.powersRespec;
      player.version = 2.1025390625;
    }
    if (player.version < 2.103515625) {
      player.options.notifications = {
        achievements: player.achievements.notifications,
        complexityAchievements: true
      };
      delete player.achievements.notifications;
      player.version = 2.103515625;
    }
    // player.powers.presetRespec previously wasn't kept properly on finality,
    // so we fix it with a new version.
    if (player.version < 2.1044921875) {
      player.powers.presetRespec = !!player.powers.presetRespec;
      player.version = 2.1044921875;
    }
    if (player.version < 2.10546875) {
      player.options.buttonOutlines = false;
      player.version = 2.10546875;
    }
    if (player.version < 2.1064453125) {
      player.options.buttonOutlines = player.options.buttonOutlines ? 'Cyan' : 'None';
      player.version = 2.1064453125;
    }
    if (player.version < 2.107421875) {
      player.stats.timeSinceLastPeakLogIPPerSec = Math.pow(2, 256);
      player.stats.timeSinceLastPeakLogEPPerSec = Math.pow(2, 256);
      player.stats.timeSinceLastPeakLogCPPerSec = Math.pow(2, 256);
      player.stats.peakLogIPPerSec = 0;
      player.stats.peakLogEPPerSec = 0;
      player.stats.peakLogCPPerSec = 0;
      player.version = 2.107421875;
    }
    if (player.version < 2.1083984375) {
      player.options.notifications.saveLoad = true;
      player.version = 2.1083984375;
    }
    if (player.version < 2.109375) {
      player.stats.hasSeenPowerWarningMessage = player.stats.hasSeenPowerWarningMessage ? {'offline progress': true} : {};
      player.version = 2.109375;
    }
    if (player.version < 2.1103515625) {
      player.options.lowerPrecision = 3;
      player.options.higherPrecision = 5;
      player.version = 2.1103515625;
    }
    if (player.version < 2.111328125) {
      if (player.options.notation === 'Cancer') {
        player.options.notation = 'Emoji';
      }
      player.version = 2.111328125;
    }
    if (player.version < 2.1123046875) {
      // These will be set to true after one tick if they should be true.
      player.isDivVisible.boosts = false;
      player.isDivVisible.sacrifice = false;
      player.version = 2.1123046875;
    }
    if (player.version < 2.11328125) {
      player.options.autobuyers = {
        areNewlyUnlockedAutobuyersOn: player.areNewlyUnlockedAutobuyersOn,
        disableAutobuyersWhenStarting: player.disableAutobuyersWhenStarting,
        showGeneratorAndBoostAutobuyers: player.options.showGeneratorAndBoostAutobuyers,
        suspendAutobuyers: true
      };
      delete player.areNewlyUnlockedAutobuyersOn;
      delete player.disableAutobuyersWhenStarting;
      delete player.options.showGeneratorAndBoostAutobuyers;
      player.version = 2.11328125;
    }
    if (player.version < 2.1171875) {
      // Adding a whole 1 / 256 because as player experience goes this is a fairly big change.
      player.options.maxAllMode = 'Normal generators and boosts';
      player.version = 2.1171875;
    }
    if (player.version < 2.1181640625) {
      player.options.showAllTabs = false;
      player.version = 2.1181640625;
    }
    if (player.version < 2.119140625) {
      player.options.showAllTabs = false;
      player.version = 2.119140625;
    }
    if (player.version < 2.12109375) {
      player.options.notation = {
        notation: player.options.notation,
        lowerPrecision: player.options.lowerPrecision,
        higherPrecision: player.options.higherPrecision,
        displayDigits: 10,
        exponentBase: 10,
        alphabet: 'abcdefghijklmnopqrstuvwxyz'
      };
      if (player.options.notation.notation === 'Mixed scientific') {
        player.options.notation.notation = 'Mixed Scientific';
      }
      if (player.options.notation.notation === 'Mixed engineering') {
        player.options.notation.notation = 'Mixed Engineering';
      }
      if (player.options.notation.notation === 'Binary') {
        player.options.notation.notation = 'Scientific';
        player.options.notation.displayDigits = 2;
        player.options.notation.exponentBase = 2;
      }
      if (player.options.notation.notation === 'Hexadecimal') {
        player.options.notation.notation = 'Scientific';
        player.options.notation.displayDigits = 16;
        player.options.notation.exponentBase = 16;
      }
      player.options.notationOnTimes = false;
      if (player.options.timeDisplay === 'D:H:M:S with notation') {
        player.options.timeDisplay === 'D:H:M:S';
        player.options.notationOnTimes = true;
      }
      player.options.headerSettings.smallerHeader = false;
      player.version = 2.12109375;
    }
    if (player.version < 2.1220703125) {
      player.hasSeenTextBox = {
        'boost-power': player.bestBoostPower > 1 || player.complexities > 0 || player.finalities > 0
      }
      player.version = 2.1220703125;
    }
    if (player.version < 2.123046875) {
      player.studySettings.firstTwelveStudyPurchaseOrderBeforeLastRespec = [];
      player.version = 2.123046875;
    }
    if (player.version < 2.125) {
      player.isPowersExplanationMovedDown = false;
      player.options.exportCopy = true;
      player.options.exportDownload = false;
      player.options.exportShow = player.options.exportDisplay;
      delete player.options.exportDisplay;
      player.options.news = false;
      player.version = 2.125;
    }
    if (player.version < 2.12890625) {
      for (let i of ['lastTenInfinities', 'lastTenEternities', 'lastTenComplexities', 'lastTenFinalities']) {
        for (let j of player.stats[i]) {
          j.push(new Decimal(-1));
        }
      }
      player.options.showLog = {
        resetButtons: 'Default',
        lastTen: 'Default'
      };
      player.version = 2.12890625;
    }
    if (player.version < 2.1328125) {
      player.options.colorChange = 'None';
      player.version = 2.1328125;
    }
    if (player.version < 2.13671875) {
      player.options.notation.formatOrdinals = false;
      player.options.notation.parseAutobuyersInCurrentBase = false;
      player.options.notation.autobuyerPrecision = 3;
      player.version = 2.13671875;
    }
    if (player.version < 2.138671875) {
      player.currentTabGroup = 'normal';
      player.currentTabInGroup = {
        'normal': 'main',
        'infinity': 'infinity',
        'eternity': 'eternity',
        'complexity': 'complexity',
        'finality': 'finality',
        'miscellaneous': 'options'
      };
      player.usingTabGroups = false;
      player.version = 2.138671875;
    }
    if (player.version < 2.140625) {
      let suspend = player.options.autobuyers.suspendAutobuyers;
      player.options.autobuyers.isOnDespiteSuspended = [!suspend, !suspend, !suspend, !suspend];
      player.version = 2.140625;
    }
    if (player.version < 2.14453125) {
      player.options.notation.exponentBase = Math.min(1e80, player.options.notation.exponentBase);
      player.version = 2.14453125;
    }
    if (player.version < 2.1484375) {
      player.cheats.extraAchievements = 0;
      player.cheats.achievementExtraMultiplier = 1;
      player.version = 2.1484375;
    }
    if (player.version < 2.15234375) {
      player.options.adjustColors = true;
      player.options.colorData = {
        'Dull': {
          'yellow': '',
          'grey': '',
          'purple': '',
          'orange': '',
          'cyan': '',
          'green': '',
          'red': '',
          'magenta': '',
          'brown': '',
          'gold': '',
        },
        'Vibrant': {
          'yellow': '',
          'grey': '',
          'purple': '',
          'orange': '',
          'cyan': '',
          'green': '',
          'red': '',
          'magenta': '',
          'brown': '',
          'gold': '',
        }
      };
      player.version = 2.15234375;
    }
    if (player.version < 2.15625) {
      player.colorPresets = [];
      player.version = 2.15625;
    }
    if (player.version < 2.16015625) {
      player.offlineTicks = Math.min(Math.max(1, Math.floor(player.offlineTicks || 1)), Math.pow(2, 20));
      player.version = 2.16015625;
    }
    if (player.version < 2.1640625) {
      // Allow for 20 rather than just 10
      player.stats.lastTenInfinities = player.stats.lastTenInfinities.concat([...Array(10)].map(() => [-1, new Decimal(-1), new Decimal(-1), new Decimal(-1)]));
      player.stats.lastTenEternities = player.stats.lastTenEternities.concat([...Array(10)].map(() => [-1, new Decimal(-1), new Decimal(-1), new Decimal(-1)]));
      player.stats.lastTenComplexities = player.stats.lastTenComplexities.concat([...Array(10)].map(() => [-1, new Decimal(-1), new Decimal(-1), new Decimal(-1)]));
      player.stats.lastTenFinalities = player.stats.lastTenFinalities.concat([...Array(10)].map(() => [-1, new Decimal(-1), -1, new Decimal(-1)]));
      // Color presets were added but lastPresetIndices wasn't properly changed.
      player.lastPresetIndices.push(0);
      player.version = 2.1640625;
    }
    if (player.version < 2.1640625) {
      player.options.autobuyers.explanation = '';
      player.version = 2.1640625;
    }
    if (player.version < 2.16796875) {
      player.options.explanations = {
        'autobuyers': player.options.autobuyers.explanation,
        'eternity-milestones': player.isEternityMilestoneExplanationMovedDown ? '' : 'main',
        'complexity-challenges': player.isComplexityChallengeExplanationMovedDown ? '' : 'main',
        'powers': player.isPowersExplanationMovedDown ? '' : 'main',
        'options': ''
      }
      delete player.options.autobuyers.explanation;
      player.version = 2.16796875;
    }
    if (player.version < 2.171875) {
      player.stats.lastRunsToShow = Math.floor(player.stats.lastRunsToShow);
      player.version = 2.171875;
    }
    if (player.version < 2.17578125) {
      // Note: This is slightly inaccurate, but close enough.
      for (let p of [].concat(player.powers.equipped, player.powers.stored, player.oracle.equippedPowers, player.oracle.powers)) {
        p.id = [player.finalities, 0];
      }
      player.powers.id = 1;
      // Are people using this option? Not sure
      delete player.oracle.showWaitsFromPastTime;
      player.version = 2.17578125;
    }
    if (player.version < 2.1796875) {
      // Ugh I only did half of the migration.
      // In retrospect, the previous migration didn't remove time properties from existing powers, but that's OK.
      for (let p of [].concat(player.powers.equipped, player.powers.stored, player.oracle.equippedPowers, player.oracle.powers)) {
        delete p.time;
      }
      player.powers.id = 1;
      player.version = 2.1796875;
    }
    if (player.version < 2.18359375) {
      player.options.notation.inputPrecision = player.options.notation.autobuyerPrecision;
      delete player.options.notation.autobuyerPrecision;
      player.options.notation.parseInputsInCurrentBase = player.options.notation.parseAutobuyersInCurrentBase;
      // Keep player.options.notation.parseAutobuyersInCurrentBase, it still controls autobuyers
      player.version = 2.18359375;
    }
    if (player.version < 2.1875) {
      player.options.exitComplexityChallengesOnComplexity = true;
      player.version = 2.1875;
    }
    if (player.version < 2.19140625) {
      player.confirmations.complexityChallengeEntering = true;
      player.version = 2.19140625;
    }
    if (player.version < 2.1953125) {
      // For pre-complexity saves, set this option to its new value default value;.
      // (Such players definitely won't have seen/set it yet unless they are
      // using replay mode, which is very rare.)
      if (player.complexities === 0 && player.finalities === 0) {
        player.options.exitComplexityChallengesOnComplexity = false;
      }
      player.version = 2.1953125;
    }
    if (player.version < 2.19921875) {
      player.showGoalTimes = false;
      player.goalTimes = [
        [null, null], [null, null], [null, null], [null, null],
        [null, null], [null, null], [null, null], [null, null],
        [null, null], [null, null], [null, null], [null, null],
        [null, null], [null, null], [null, null], [null, null],
      ];
      player.version = 2.19921875;
    }
    if (player.version < 2.203125) {
      player.options.loadFromTextInput = false;
      player.version = 2.203125;
    }
    if (player.version < 2.20703125) {
      player.studySettings.canBuyStudies = true;
      player.version = 2.20703125;
    }
  },
  convertSaveToDecimal() {
    player.stars = new Decimal(player.stars);
    player.infinityStars = new Decimal(player.infinityStars);
    player.eternityStars = new Decimal(player.eternityStars);
    player.complexityStars = new Decimal(player.complexityStars);
    player.finalityStars = new Decimal(player.finalityStars);
    player.infinityPoints = new Decimal(player.infinityPoints);
    player.eternityPoints = new Decimal(player.eternityPoints);
    player.complexityPoints = new Decimal(player.complexityPoints);
    player.finalityPoints = new Decimal(player.finalityPoints);
    player.sacrificeMultiplier = new Decimal(player.sacrificeMultiplier);
    player.prestigePower = new Decimal(player.prestigePower);
    for (let i = 0; i < 8; i++) {
      player.generators[i].amount = new Decimal(player.generators[i].amount);
      player.infinityGenerators[i].amount = new Decimal(player.infinityGenerators[i].amount);
      player.eternityGenerators[i].amount = new Decimal(player.eternityGenerators[i].amount);
      player.complexityGenerators[i].amount = new Decimal(player.complexityGenerators[i].amount);
      player.finalityGenerators[i].amount = new Decimal(player.finalityGenerators[i].amount);
    }
    player.eternities = new Decimal(player.eternities);
    player.permanence = new Decimal(player.permanence);
    player.stats.lastPermanenceGain = new Decimal(player.stats.lastPermanenceGain);
    player.stats.bestStarsThisSacrifice = new Decimal(player.stats.bestStarsThisSacrifice);
    player.stats.bestStarsThisPrestige = new Decimal(player.stats.bestStarsThisPrestige);
    player.stats.bestStarsThisInfinity = new Decimal(player.stats.bestStarsThisInfinity);
    player.stats.totalStarsProduced = new Decimal(player.stats.totalStarsProduced);
    player.stats.totalStarsProducedThisEternity = new Decimal(player.stats.totalStarsProducedThisEternity);
    player.stats.totalStarsProducedThisComplexity = new Decimal(player.stats.totalStarsProducedThisComplexity);
    player.stats.totalStarsProducedThisFinality = new Decimal(player.stats.totalStarsProducedThisFinality);
    player.stats.totalIPProduced = new Decimal(player.stats.totalIPProduced);
    player.stats.totalIPProducedThisEternity = new Decimal(player.stats.totalIPProducedThisEternity);
    player.stats.totalInfinityStarsProducedThisFinality = new Decimal(player.stats.totalInfinityStarsProducedThisFinality);
    player.stats.totalEPProduced = new Decimal(player.stats.totalEPProduced);
    player.stats.totalEPProducedThisComplexity = new Decimal(player.stats.totalEPProducedThisComplexity);
    player.stats.totalEternitiesProducedThisComplexity = new Decimal(player.stats.totalEternitiesProducedThisComplexity);
    player.stats.totalEternityStarsProducedThisFinality = new Decimal(player.stats.totalEternityStarsProducedThisFinality);
    player.stats.totalCPProduced = new Decimal(player.stats.totalCPProduced);
    player.stats.totalCPProducedThisFinality = new Decimal(player.stats.totalCPProducedThisFinality);
    player.stats.totalComplexityStarsProducedThisFinality = new Decimal(player.stats.totalComplexityStarsProducedThisFinality);
    player.stats.totalFPProduced = new Decimal(player.stats.totalFPProduced);
    player.stats.peakIPPerSec = new Decimal(player.stats.peakIPPerSec);
    player.stats.peakEPPerSec = new Decimal(player.stats.peakEPPerSec);
    player.stats.peakCPPerSec = new Decimal(player.stats.peakCPPerSec);
    for (let i = 0; i < 20; i++) {
      if (player.stats.lastTenInfinities[i] !== -1) {
        player.stats.lastTenInfinities[i][1] = new Decimal(player.stats.lastTenInfinities[i][1]);
        player.stats.lastTenInfinities[i][2] = new Decimal(player.stats.lastTenInfinities[i][2]);
        player.stats.lastTenInfinities[i][3] = new Decimal(player.stats.lastTenInfinities[i][3]);
      }
      if (player.stats.lastTenEternities[i] !== -1) {
        player.stats.lastTenEternities[i][1] = new Decimal(player.stats.lastTenEternities[i][1]);
        player.stats.lastTenEternities[i][2] = new Decimal(player.stats.lastTenEternities[i][2]);
        player.stats.lastTenEternities[i][3] = new Decimal(player.stats.lastTenEternities[i][3]);
      }
      if (player.stats.lastTenComplexities[i] !== -1) {
        player.stats.lastTenComplexities[i][1] = new Decimal(player.stats.lastTenComplexities[i][1]);
        player.stats.lastTenComplexities[i][2] = new Decimal(player.stats.lastTenComplexities[i][2]);
        player.stats.lastTenComplexities[i][3] = new Decimal(player.stats.lastTenComplexities[i][3]);
      }
      if (player.stats.lastTenFinalities[i] !== -1) {
        // There's no missing line here. Finalities are just stored slightly differently.
        player.stats.lastTenFinalities[i][1] = new Decimal(player.stats.lastTenFinalities[i][1]);
        // This part (total finality points) isn't actually used, but it could be.
        player.stats.lastTenFinalities[i][3] = new Decimal(player.stats.lastTenFinalities[i][3]);
      }
    }
    for (let i = 9; i < 15; i++) {
      player.autobuyers[i].priority = new Decimal(player.autobuyers[i].priority);
    }
    player.oracle.complexityPoints = new Decimal(player.oracle.complexityPoints);
    player.oracle.complexityPointGain = new Decimal(player.oracle.complexityPointGain);
  },
  doLastFixes(originalVersion) {
    if (originalVersion < 2.078125) {
      player.galaxies.dilated = Math.floor(Math.min(Galaxy.amount(), Math.max(0, player.galaxies.dilated)));
    }
  },
  loadGameStorage (callback) {
    if (!localStorage.getItem('fe000000-save')) {
      // The save doesn't exist.
      this.resetGame();
      // It worked, I guess?
      callback(true);
    } else {
      try {
        // We're loading from storage, player.options.offlineProgress isn't set yet.
        this.loadGame(localStorage.getItem('fe000000-save'), null, null, false, () => callback(true));
      } catch (ex) {
        console.log('Error while loading game, please report this.', ex);
        alert('There was an error while loading the game, please report this. ' +
        'If the game seems broken, export your save (and reset if you want). ' +
        'More detail on error: ' + ex.toString() + ', stack: ' + ex.stack.toString());
        callback(false);
      }
    }
  },
  loadGamePrompt() {
    this.loadGameFunc(() => prompt('Enter your save:'), () => null);
  },
  loadGameTextInput() {
    this.loadGameFunc(() => document.getElementsByClassName('load-input')[0].value, () => (document.getElementsByClassName('load-input')[0].value = ''));
  },
  loadGameFunc(f, cleanup) {
    try {
      let save = f();
      cleanup();
      // We need to not do this replacement for null (from canceling the prompt to input a save).
      // This is because in that case, we want no message (because the player hit "cancel"
      // so expects no message, see below near the empty save message)
      // and not an "error in importing, no .replace" message.
      if (save) {
        save = save.replace(/^\s+|\s+$/, '');
      }
      if (save) {
        if (this.h(save) === 715689180736) {
          Options.toggleShowAllTabs();
          return;
        }
        let issue = this.quickLoadIssueCheck(save);
        if (issue) {
          alert('The save you entered does not seem to be valid. ' + issue);
        } else {
          // This needs a callback to reset time since export and notify that the save was loaded'
          // (we only want to notify after loading in case something goes wrong).
          // The Options.offlineTicks() here means we'll always use at least the pre-load
          // number of offline ticks (we don't need this parameter when, for example,
          // opening the game in a new window, because then we don't have any potentially different
          // number of offline progress ticks, but when loading from prompt we have a number
          // from the pre-load save and a number from the save being loaded).
          this.loadGame(save, Options.offlineProgress(), Options.offlineTicks(), false, function () {
            // If the player is loading a save from a prompt, we assume that the loaded save
            // is itself an export, and thus reset the export timer.
            player.stats.timeSinceExport = 0;
            // Also notify that the save was loaded successfully.
            Notifications.notify('Loaded save!', 'saveLoad');
          });
        }
      } else if (save !== null) {
        // Note: null only shows up if the player canceled the save input prompt,
        // in which case we don't show any message.
        alert('The save you entered appears to be empty.');
      }
    } catch(ex) {
      alert('The save you entered does not seem to be valid. The error was ' + ex);
    }
  },
  exportFileName() {
    let d = new Date();
    let methods = ['getFullYear', 'getMonth', 'getDate', 'getHours', 'getMinutes', 'getSeconds'];
    let parts = methods.map(i => d[i]());
    // Months start at 0.
    parts[1] += 1;
    parts = parts.map(i => (i < 10 ? '0' : '') + i);
    return ['FE000000'].concat(parts).join('_');
  },
  exportGame(buttonIndex) {
    if (blocked && !confirm('Time is currently being simulated. Exploits are possible by ' +
      'exporting while time is being simulated and then loading the resulting save. ' +
      'If you want to use those exploits, it\'s your choice, but those exploits ' +
      'are not intended in normal play. Are you sure you want to export?')) {
      return;
    }
    player.stats.timeSinceExport = 0;
    this.saveGame(false, false);
    // How can this happen? Well, it can happen if something went wrong.
    let loading = document.getElementById('loading').style.display === '';
    if (loading) {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('main').style.display = '';
    }
    let output = document.getElementById('export-output');
    let parent = output.parentElement;
    parent.style.display = '';
    let encoded = this.encode(player);
    output.value = encoded;
    let fullyWorked = true;
    if (player.options.exportCopy) {
      output.select();
      let copyWorked = false;
      try {
        document.execCommand('copy');
        copyWorked = true;
      } catch(ex) {
        alert('Copying to clipboard failed.');
        // I guess we don't need this explicitly but it seems nice
        // for showing intent.
        copyWorked = false;
      }
      fullyWorked = fullyWorked && copyWorked;
    }
    if (player.options.exportDownload) {
      // We have no way to check if this works since it's async, sadly.
      let a = document.createElement('a');
      a.href = 'data:text/plain;charset=utf-8,' + encoded;
      a.download = this.exportFileName();
      a.id = 'export-download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    if (loading) {
      document.getElementById('loading').style.display = '';
      document.getElementById('main').style.display = 'none';
    }
    if (!player.options.exportShow) {
      parent.style.display = 'none';
      document.getElementsByClassName('export-button')[buttonIndex].focus();
    }
    if (fullyWorked) {
      Notifications.notify('Exported save!', 'saveLoad');
    }
  },
  reseedInitialPlayer() {
    // This should only be called right after resetting the game,
    // or otherwise using initialPlayer if it's later used elsewhere.
    initialSeed = RNG.createSeed();
    initialPlayer.powers.seed = initialSeed;
    initialPlayer.powers.initialSeed = initialSeed;
  },
  resetGame() {
    // The first false here sets Date.now() to when the game was reset
    // rather than when the window was loaded.
    // The null says we have no special setting for offline ticks.
    // The second false confirms that this isn't the Oracle.
    this.loadGame(this.encode(initialPlayer), false, null, false, () => this.reseedInitialPlayer());
  },
  resetGameWithConfirmation() {
    if (confirm('Do you really want to reset the game? You will lose all your progress, and get no benefit.')) {
      this.resetGame();
      Notifications.notify('Game has been reset!', 'saveLoad');
    }
  }
}
