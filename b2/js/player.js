let player = {
  lastUpdate: Date.now(),
  lowTiers: Infinity,
  highTiers: Infinity,
  singularity: {
    unlocked: false,
    currencyAmount: new Decimal(1)
  },
  incrementali: initialIncrementali(),
  generators: [],
  currentTheme: 'default',
  metaDisplay: true,
  saveType: 'full',
  version: 5
}

initializeTier();
