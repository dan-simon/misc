let Trivia = {
  triviaCriteria: {
    'EG requirement for theorems': () => EternityGenerator(1).bought() === 0,
    'CC1 pre-complexity completion': () => Complexities.amount() === 1 && !PrestigeLayerProgress.hasReached('finality')
  },
  show(x) {
    return this.triviaCriteria[x]();
  }
}