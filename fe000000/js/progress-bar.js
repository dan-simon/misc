let ProgressBar = {
  display() {
    return player.options.progressBar !== 'Disabled';
  },
  backgroundColor() {
    if (player.options.progressBar === 'Monochrome') {
      return 'var(--progress-bar-foreground-color)';
    }
    let colors = ['yellow', 'yellow', 'magenta', 'cyan', 'brown', 'gold'];
    return Colors.adjust(Colors.getStringToColorCode(colors[this.stage()], 'Vibrant'));
  },
  width() {
    let s = this.stage();
    if (s < 2) {
      return Math.min(1, player.stars.max(1).log2() / 256);
    }
    if (s < 5) {
      return Math.min(1, Math.log2(player.stats['total' + ['IP', 'EP', 'CP'][s - 2] + 'Produced'].max(2).log2()) / (s === 2 ? 8 : 16));
    }
    return FinalityShards.totalUpgrades() / 192;
  },
  widthStyle() {
    return (this.width() * 100).toFixed(2) + '%';
  },
  text() {
    let s = this.stage();
    if (s < 5) {
      return 'Progress to ' + ['???', 'infinity', 'eternity', 'complexity', 'finality'][s] + (s < 2 ? ' (logarithmic)' : ' (log-log)');
    }
    return 'Progress to buying all finality upgrades'
  },
  stage() {
    if (!SpecialDivs.isDivVisible('infinity')) {
      return 0;
    }
    let conds = PrestigeLayerProgress.conditions.slice(2).map(x => x());
    return conds.lastIndexOf(true) + 2;
  }
}