let player = {
  lastUpdate: Date.now(),
  lowTiers: Infinity,
  highTiers: Infinity,
  lowLayers: Infinity,
  highLayers: Infinity,
  singularity: {
    unlocked: false,
    currencyAmount: new Decimal(1)
  },
  incrementali: initialIncrementali(),
  generators: [],
  currentTheme: 'default',
  metaDisplay: true,
  saveType: 'full',
  version: 6
}

initializeTier();
