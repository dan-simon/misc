let Trivia = {
  triviaCriteria: {
    'EG requirement for theorems': () => EternityGenerator(1).bought() === 0,
    'CC1 pre-complexity completion': () => Complexities.amount() === 1 && !PrestigeLayerProgress.hasReached('finality'),
    'complexity achievement order': function() {
      let ca = FinalityStartingBenefits.complexityAchievements(); return 0 < ca && ca < 16;
    }
  },
  show(x) {
    return this.triviaCriteria[x]();
  }
}
