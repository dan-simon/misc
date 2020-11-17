let Saving = {
  saveGame(isAutoLoop) {
    // Stop the player from saving the game while time is being simulated.
    if (blocked) {
      if (!isAutoLoop) {
        alert('This is an evanescent simulation. Saving it is forbidden.');
      }
      return;
    }
    // Stop the player from saving the game while time is being simulated.
    localStorage.setItem('fe000000-save', btoa(JSON.stringify(player)));
  },
  loadGame(s, offlineProgress, isOracle, callback) {
    if (blocked && !confirm('Time is currently being simulated. Loading a save while time ' +
      'is being simulated can cause weird behavior. Are you sure you want to load? ' +
      '(This message may appear if you did something that uses loading in its implementation, ' +
      'such as resetting.)')) {
      return;
    }
    // offlineProgress = null means leave it up to the save.
    player = JSON.parse(atob(s));
    if (offlineProgress === null) {
      offlineProgress = player.options.offlineProgress;
    }
    this.fixPlayer();
    this.convertSaveToDecimal();
    let setupPageLoad = function (now) {
      player.lastUpdate = now;
      Saving.saveGame(false);
      Options.updateCheckboxSize();
      Colors.updateColors();
      updateDisplaySaveLoadSetup();
    }
    if (isOracle) {
      callback();
    } else {
      // We can do this after fixing Decimal.
      let now = Date.now();
      if (offlineProgress) {
        this.simulateTime((now - player.lastUpdate) / 1000, this.defaultTicks(), true, function () {
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
      formatTime(time, {seconds: {f: format, s: false}, larger: {f: format, s: false}});
    document.getElementById('tickssimulated').innerHTML = format(ticks);
    document.getElementById('totaltickssimulated').innerHTML = format(totalTicks);
    let expectedTotalTime = time * totalTicks / ticks;
    document.getElementById('expectedtotaltimesimulated').innerHTML = ticks === 0 ? 'unknown' :
      formatTime(expectedTotalTime, {seconds: {f: format, s: false}, larger: {f: format, s: false}});
    document.getElementById('expectedremainingtimesimulated').innerHTML = ticks === 0 ? 'unknown' :
      formatTime(expectedTotalTime - time, {seconds: {f: format, s: false}, larger: {f: format, s: false}});
    document.getElementById('bar').style.width = Math.floor(ticks / totalTicks * 512) + 'px';
  },
  simulateTime(totalDiff, maxTicks, showSimulation, callback) {
    // Add this not for any of the actual JS files, but for ease of use from console.
    if (maxTicks === undefined) {
      maxTicks = this.defaultTicks();
    }
    // And similarly
    if (callback === undefined) {
      callback = () => true;
    }
    let baseTickLength = 1 / 16;
    let ticks = Math.ceil(Math.min(totalDiff / baseTickLength, maxTicks));
    let tickLength = totalDiff / ticks;
    let startTime = Date.now();
    let lastUpdateTime = Date.now();
    if (showSimulation) {
      document.getElementById('simulatetime').style.display = '';
      this.simulateTimeUpdate((lastUpdateTime - startTime) / 1000, 0, ticks);
    }
    let tick = 0;
    blocked = true;
    let interval = setInterval(function() {
      let initialTick = tick;
      while (tick < Math.min(ticks, initialTick + 256)) {
        gameLoop(tickLength, false);
        let d = Date.now();
        tick++;
        if (d - startTime > 1 / 16) {
          lastUpdateTime = d;
          if (showSimulation) {
            Saving.simulateTimeUpdate((lastUpdateTime - startTime) / 1000, tick, ticks);
          }
        }
      }
      if (tick === ticks) {
        blocked = false;
        clearInterval(interval);
        if (showSimulation) {
          document.getElementById('simulatetime').style.display = 'none';
        }
        callback();
      }
    }, 1);
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
      player.stats = {
        totalStarsProduced: new Decimal(0),
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
      if (player.infinities > 0 || player.eternities !== '0' || player.complexities > 0) {
        // We don't technically know that the player has done all these things but it's a fair guess.
        player.goals[0] = true;
        player.goals[1] = true;
        player.goals[2] = true;
      }
      if (player.eternities !== '0' || player.complexities > 0) {
        player.goals[5] = true;
      }
      if (player.complexities > 0) {
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
    for (let i = 0; i < 10; i++) {
      if (player.stats.lastTenInfinities[i] !== -1) {
        player.stats.lastTenInfinities[i][1] = new Decimal(player.stats.lastTenInfinities[i][1]);
        player.stats.lastTenInfinities[i][2] = new Decimal(player.stats.lastTenInfinities[i][2]);
      }
      if (player.stats.lastTenEternities[i] !== -1) {
        player.stats.lastTenEternities[i][1] = new Decimal(player.stats.lastTenEternities[i][1]);
        player.stats.lastTenEternities[i][2] = new Decimal(player.stats.lastTenEternities[i][2]);
      }
      if (player.stats.lastTenComplexities[i] !== -1) {
        player.stats.lastTenComplexities[i][1] = new Decimal(player.stats.lastTenComplexities[i][1]);
        player.stats.lastTenComplexities[i][2] = new Decimal(player.stats.lastTenComplexities[i][2]);
      }
      if (player.stats.lastTenFinalities[i] !== -1) {
        // There's no missing line here. Finalities are just stored slightly differently.
        player.stats.lastTenFinalities[i][1] = new Decimal(player.stats.lastTenFinalities[i][1]);
      }
    }
    for (let i = 9; i < 15; i++) {
      player.autobuyers[i].priority = new Decimal(player.autobuyers[i].priority);
    }
    player.oracle.complexityPoints = new Decimal(player.oracle.complexityPoints);
    player.oracle.complexityPointGain = new Decimal(player.oracle.complexityPointGain);
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
        this.loadGame(localStorage.getItem('fe000000-save'), null, false, () => callback(true));
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
    try {
      let save = prompt('Enter your save:');
      if (save && !(/^\s+$/.test(save))) {
        // This isn't the oracle and needs no callback
        this.loadGame(save, player.options.offlineProgress, false, () => true);
      } else if (save !== null) {
        alert('The save you entered appears to be empty.');
      }
    } catch(ex) {
      alert('The save you entered does not seem to be valid. The error was ' + ex);
    }
  },
  exportGame(buttonIndex) {
    if (blocked && !confirm('Time is currently being simulated. Exploits are possible by ' +
      'exporting while time is being simulated and then loading the resulting save. ' +
      'If you want to use those exploits, it\'s your choice, but those exploits ' +
      'are not intended in normal play. Are you sure you want to export?')) {
      return;
    }
    // How can this happen? Well, it can happen if something went wrong.
    let loading = document.getElementById('loading').style.display === '';
    if (loading) {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('main').style.display = '';
    }
    let output = document.getElementById('export-output');
    let parent = output.parentElement;
    parent.style.display = '';
    output.value = btoa(JSON.stringify(player));
    output.select();
    try {
      document.execCommand('copy');
    } catch(ex) {
      alert('Copying to clipboard failed.');
    }
    if (loading) {
      document.getElementById('loading').style.display = '';
      document.getElementById('main').style.display = 'none';
    }
    if (!player.options.exportDisplay) {
      parent.style.display = 'none';
      document.getElementsByClassName('export-button')[buttonIndex].focus();
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
    // The second confirms that this isn't the oracle.
    this.loadGame(btoa(JSON.stringify(initialPlayer)), false, false, () => this.reseedInitialPlayer());
  },
  resetGameWithConfirmation() {
    if (confirm('Do you really want to reset the game? You will lose all your progress, and get no benefit.')) {
      this.resetGame();
    }
  }
}
