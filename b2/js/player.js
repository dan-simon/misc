let player = {
  lastUpdate: Date.now(),
  lowTiers: Infinity,
  highTiers: Infinity,
  singularity: {
    unlocked: false,
    currencyAmount: 1
  },
  incrementali: initialIncrementali(),
  generators: [],
  currentTheme: 'default'
}

initializeTier();
