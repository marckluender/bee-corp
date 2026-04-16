// --- KONFIGURATION (DEINE SCHALTZENTRALE) ---
const GameData = {
    stats: { nektar: 0, honig: 0, bienen: 0 },
    labels: {
        slot1: "WaxStore (25 🍯)",
        slot2: "NektarStore (25 🍯)",
        slot3: "3Store (250 🍯)",
        slot4: "Flugschule (1500 🍯)",
        slot5: "5Store (45k 🍯)",
        slot6: "BeeCorp (2.5M 🍯)"
    }
};

// --- INTERNE LOGIK (FINGER WEG) ---
const UI = {
    updateStat: (id, val) => document.getElementById(`stat-${id}`).innerText = val,
    updateLabel: (id, text) => document.getElementById(`label-${id}`).innerText = text,
    setMessage: (text) => document.getElementById('bee-message').innerText = text,
    showAlert: (text) => {
        const el = document.getElementById('upgrade-alert');
        el.innerText = text;
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 3000);
    }
};

// Initialisierung der Labels beim Start
Object.keys(GameData.labels).forEach((key, index) => {
    UI.updateLabel(index + 1, GameData.labels[key]);
});

// --- DEINE EVENTS (HIER ARBEITEST DU) ---

// Klick auf BeeBabaluga
document.getElementById('bee-generator').onclick = () => {
    GameData.stats.nektar++;
    UI.updateStat('nektar', GameData.stats.nektar);
    
    // Beispiel für dynamische Nachricht
    if(GameData.stats.nektar === 5) UI.setMessage("Fleißig, fleißig!");
    if(GameData.stats.nektar === 10) UI.showAlert("Upgrade verfügbar! 🚀");
};

// Klick auf den Shop
document.getElementById('shop-trigger').onclick = () => {
    UI.setMessage("Der Shop öffnet bald seine Pforten...");
};