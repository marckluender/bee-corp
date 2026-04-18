// config.js
const GAME_CONFIG = {
    // Start-Ressourcen
    startingStats: {
        nektar: 0,
        honig: 0,
        bienen: 0
    },

    // Kapazitäten und Arbeiter-Limits
    limits: {
        defaultMaxWorkers: 10,
        upgradedMaxWorkers: 50,
        workersNeededForLevel2: 10 // Wie viele Arbeiter man braucht, um Level 2 freizuschalten
    },

    // Preise für Gebäude und Upgrades
    prices: {
        slot1: 5,        // WaxStore
        slot2: 25,       // NektarStore
        slot3: 50,      // Flugschule
        slot4: 1500,     // EnzymLabor
        slot5: 45000,    // Nektar-Pipeline
        slot6: 2500000,  // Hive-Core
        housingUpgrade: 50,
        buildingUpgrade: 25 
    },

    // Zeitintervalle in Millisekunden
    intervals: {
        honeyBase: 5000,
        honeyUpgraded: 2500,
        nectarBase: 10000,
        beeBase: 10000,
        beeUpgraded: 5000,
        shopCheck: 2000,
        nectarProductionTick: 10000,
        tutorialNectarWait: 10000
    },

    // Produktions-Boni & Faktoren
    bonuses: {
        workerEfficiency: 0.1, // 0.1 entspricht dem 10% Bonus in der UI Berechnung
        workerPerBee: 0.01,    // 1% interner Rechenwert
        enzymLabor: 0.20,
        pipeline: 0.50,
        hiveCore: 1.0,
        housingLevel2: 0.10,
        level2FlatBonus: 10    // Der flache Bonus-Wert in der UI
    },

    // Story & Tutorial Schwellenwerte
    storyThresholds: {
        tutorialNectarStep1: 1,
        tutorialNectarStep2: 10,
        milestoneBees: 1,
        milestoneWorkersSlot1: 5
    },

    // Texte für die Buttons/Labels
    labels: {
        slot1: "WaxStore (5 🍯)", 
        slot2: "NektarStore (25 🍯)",
        slot3: "Flugschule (50 🍯)", 
        slot4: "EnzymLabor (1.5k 🍯)",
        slot5: "Nektar-Pipeline (45k 🍯)", 
        slot6: "Hive-Core (2.5M 🍯)"
    },

    audio: {
        bgMusicPath: 'sfx/relaxedbees.mp3',
        defaultVolume: 0.4
    }
};