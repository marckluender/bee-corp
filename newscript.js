// --- KONFIGURATION (DEINE SCHALTZENTRALE) ---
const GameData = {
    stats: { nektar: 0, honig: 0, bienen: 0 },
    buildings: {
        slot1: false,
        slot2: false,
        slot3: false,
        slot4: false,
        slot5: false,
        slot6: false
    },
    // NEU: Kapazitäts-Logik
    housing: {
        slot1: { maxWorkers: 10, level: 0 },
        slot2: { maxWorkers: 10, level: 0 },
        slot3: { maxWorkers: 10, level: 0 },
        slot4: { maxWorkers: 10, level: 0 },
        slot5: { maxWorkers: 10, level: 0 },
        slot6: { maxWorkers: 10, level: 0 }
    },
    prices: {
        slot1: 5,
        slot2: 25,
        slot3: 250,
        slot4: 1500,
        slot5: 45000,
        slot6: 2500000,
        housingUpgrade: 50 // Preis für die erste Erweiterung
    },
    labels: {
        slot1: "WaxStore (5 🍯)",
        slot2: "NektarStore (25 🍯)",
        slot3: "3Store (250 🍯)",
        slot4: "Flugschule (1500 🍯)",
        slot5: "5Store (45k 🍯)",
        slot6: "BeeCorp (2.5M 🍯)"
    },
    // NEU: Shop-Items Definition
    shopItems: [
        {
            id: 'housing_slot1',
            name: 'Wohnraum: WaxStore',
            desc: 'Erweitert den Platz auf 50 Bienen.',
            cost: 50,
            condition: () => GameData.buildings.slot1 && GameData.housing.slot1.level === 0 && (window.BuildingUI && BuildingUI.workers.slot1 >= 10),
            action: () => { GameData.housing.slot1.maxWorkers = 50; GameData.housing.slot1.level = 1; }
        },
        {
            id: 'housing_slot2',
            name: 'Wohnraum: NektarStore',
            desc: 'Erweitert den Platz auf 50 Bienen.',
            cost: 50,
            condition: () => GameData.buildings.slot2 && GameData.housing.slot2.level === 0 && (window.BuildingUI && BuildingUI.workers.slot2 >= 10),
            action: () => { GameData.housing.slot2.maxWorkers = 50; GameData.housing.slot2.level = 1; }
        }
    ]
};

const UI = {
    updateStat: (id, val) => {
        const el = document.getElementById(`stat-${id}`);
        if(el) el.innerText = Math.floor(val);
    },
    updateLabel: (id, text) => document.getElementById(`label-${id}`).innerText = text,
    setMessage: (text) => document.getElementById('bee-message').innerText = text,
    
    refreshBuildings: () => {
        Object.keys(GameData.buildings).forEach((key, index) => {
            const slotNr = index + 1;
            const slotElement = document.getElementById(`slot-${slotNr}`);
            const img = slotElement.querySelector('img');
            const label = document.getElementById(`label-${slotNr}`);

            if (GameData.buildings[key]) {
                img.style.display = "block";
                label.style.display = "none";
            } else {
                img.style.display = "none";
                label.style.display = "block";
                
                const price = GameData.prices[key];
                if (GameData.stats.honig >= price) {
                    label.style.background = "#f1c40f"; 
                    label.style.opacity = "1";
                    label.style.cursor = "pointer";
                } else {
                    label.style.background = "#7f8c8d"; 
                    label.style.opacity = "0.6";
                    label.style.cursor = "default";
                }
            }
        });
    },

    showAlert: (text) => {
        const el = document.getElementById('upgrade-alert');
        el.innerText = text;
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 3000);
    }
};

// NEU: Shop-Benachrichtigung (Glow-Effekt)
function checkShopNotifications() {
    const hasNew = GameData.shopItems.some(item => item.condition());
    const btn = document.getElementById('shop-trigger');
    if (btn) {
        if (hasNew) btn.classList.add('shop-glow');
        else btn.classList.remove('shop-glow');
    }
}

// Initialisierung
Object.keys(GameData.labels).forEach((key, index) => {
    UI.updateLabel(index + 1, GameData.labels[key]);
});
UI.refreshBuildings(); 

// --- DIE ZEITSCHLEIFEN ---

function startHoneyProduction() {
    let baseTime = 5000; 
    if (GameData.buildings.slot1) baseTime = 2500; 
    
    const workerBonus = (typeof BuildingUI !== 'undefined') ? BuildingUI.workers.slot1 : 0;
    let finalTime = baseTime / (1 + (workerBonus * 0.001));

    setTimeout(() => {
        if (GameData.stats.nektar >= 1) {
            GameData.stats.nektar--;
            GameData.stats.honig++;
            UI.updateStat('nektar', GameData.stats.nektar);
            UI.updateStat('honig', GameData.stats.honig);
            UI.refreshBuildings();
        }
        startHoneyProduction();
    }, finalTime);
}

function startNectarProduction() {
    if (GameData.buildings.slot2) {
        const workerCount = (typeof BuildingUI !== 'undefined') ? BuildingUI.workers.slot2 : 0;
        const bonusFactor = 1 * (1 + (workerCount * 0.001));
        
        GameData.stats.nektar += bonusFactor;
        UI.updateStat('nektar', GameData.stats.nektar);
        UI.refreshBuildings();
    }
    setTimeout(startNectarProduction, 10000);
}

function startBeeProduction() {
    let baseTime = 10000; 
    if (GameData.buildings.slot3) baseTime = 5000; 
    
    const workerCount = (typeof BuildingUI !== 'undefined') ? BuildingUI.workers.slot3 : 0;
    const workerBonus = 1 + (workerCount * 0.001);
    let finalTime = baseTime / workerBonus;

    setTimeout(() => {
        GameData.stats.bienen++;
        UI.updateStat('bienen', GameData.stats.bienen);
        startBeeProduction();
    }, finalTime);
}

// Start der Intervalle
startHoneyProduction();
startNectarProduction();
startBeeProduction();
setInterval(checkShopNotifications, 2000); // NEU: Shop-Check alle 2 Sek

// --- EVENTS ---

for (let i = 1; i <= 6; i++) {
    const slotElement = document.getElementById(`slot-${i}`);
    slotElement.onclick = () => {
        const key = `slot${i}`;
        const price = GameData.prices[key];
        
        if (!GameData.buildings[key] && GameData.stats.honig >= price) {
            GameData.stats.honig -= price;
            GameData.buildings[key] = true;
            UI.updateStat('honig', GameData.stats.honig);
            UI.refreshBuildings();
            UI.setMessage("Ein neues Gebäude für den Schwarm!");
        }
    };
}

document.getElementById('bee-generator').onclick = () => {
    GameData.stats.nektar++;
    UI.updateStat('nektar', GameData.stats.nektar);
    UI.refreshBuildings();
};

document.getElementById('shop-trigger').onclick = () => {
    if (window.ShopUI) ShopUI.open();
    else UI.setMessage("Der Shop öffnet bald...");
};

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`Fehler: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}