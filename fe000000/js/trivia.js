let Trivia = {
  triviaCriteria: {
    'EG requirement for theorems': () => EternityGenerator(1).bought() === 0,
    'CC1 pre-complexity completion': () => Complexities.amount() === 1 && !PrestigeLayerProgress.hasReached('finality'),
    'complexity achievement order': function() {
      let ca = FinalityStartingBenefits.complexityAchievements(); return 0 < ca && ca < 16;
    },
    'finality shard bought limits': () => FinalityShards.total() >= FinalityShardUpgrade(1).spentForFirst(8),
    'ic': () => (x => [65535, 16711935, 252645135, 858993459, 1431655765].map(y => y & x).every(
      y => [...Array(32)].map((_, z) => !!(y & 1 << z)).reduce((a, b) => a + b) % 2 === 0))(
      parseInt(getNotation('Hex').format(Date.now() / 1000), 16))
  },
  show(x) {
    return this.triviaCriteria[x]();
  }
}
