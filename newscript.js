// newscript.js
const GameData = {
    stats: { nektar: 0, honig: 0, bienen: 0 },
    buildings: {
        slot1: false, slot2: false, slot3: false,
        slot4: false, slot5: false, slot6: false
    },
    housing: {
        slot1: { maxWorkers: 10, level: 0 },
        slot2: { maxWorkers: 10, level: 0 },
        slot3: { maxWorkers: 10, level: 0 },
        slot4: { maxWorkers: 10, level: 0 },
        slot5: { maxWorkers: 10, level: 0 },
        slot6: { maxWorkers: 10, level: 0 }
    },
    prices: {
        slot1: 5, slot2: 25, slot3: 250,
        slot4: 1500, slot5: 45000, slot6: 2500000,
        housingUpgrade: 50,
        buildingUpgrade: 25 
    },
    labels: {
        slot1: "WaxStore (5 🍯)", 
        slot2: "NektarStore (25 🍯)",
        slot3: "Flugschule (250 🍯)", 
        slot4: "EnzymLabor (1.5k 🍯)",
        slot5: "Nektar-Pipeline (45k 🍯)", 
        slot6: "Hive-Core (2.5M 🍯)"
    },
    shopItems: [
        {
            id: 'housing_slot1',
            name: 'Wohnraum: WaxStore',
            desc: 'Erweitert den Platz auf 50 Bienen.',
            cost: 50,
            condition: () => GameData.buildings.slot1 && GameData.housing.slot1.maxWorkers === 10 && (window.BuildingUI && window.BuildingUI.workers.slot1 >= 10),
            action: () => { GameData.housing.slot1.maxWorkers = 50; GameData.housing.slot1.level = 1; }
        },
        {
            id: 'housing_slot2',
            name: 'Wohnraum: NektarStore',
            desc: 'Erweitert den Platz auf 50 Bienen.',
            cost: 50,
            condition: () => GameData.buildings.slot2 && GameData.housing.slot2.maxWorkers === 10 && (window.BuildingUI && window.BuildingUI.workers.slot2 >= 10),
            action: () => { GameData.housing.slot2.maxWorkers = 50; GameData.housing.slot2.level = 1; }
        }
    ]
};

const AudioManager = {
    bgMusic: new Audio('sfx/relaxed bees.mp3'),
    isMuted: false,
    hasStarted: false,

    init() {
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.4;
        
        // Erstelle den Button dynamisch
        const btn = document.createElement('button');
        btn.id = 'sound-toggle';
        btn.className = 'sound-toggle-btn';
        btn.innerHTML = '🔊';
        btn.title = 'Ton an/aus';
        document.querySelector('.game-container').appendChild(btn);

        btn.onclick = () => this.toggleMute();

        // Starte Musik beim ersten Klick auf das Dokument (Browser-Anforderung)
        document.addEventListener('click', () => {
            if (!this.hasStarted && !this.isMuted) {
                this.bgMusic.play().catch(e => console.log("Audio play blocked"));
                this.hasStarted = true;
            }
        }, { once: true });
    },

    toggleMute() {
        this.isMuted = !this.isMuted;
        const btn = document.getElementById('sound-toggle');
        if (this.isMuted) {
            this.bgMusic.pause();
            btn.innerHTML = '🔇';
        } else {
            this.bgMusic.play();
            btn.innerHTML = '🔊';
        }
    }
};

const UI = {
    updateStat: (id, val) => {
        const el = document.getElementById(`stat-${id}`);
        if(el) el.innerText = Math.floor(val);
    },
    updateLabel: (id, text) => {
        const el = document.getElementById(`label-${id}`);
        if(el) el.innerText = text;
    },
    setMessage: (text) => {
        const el = document.getElementById('bee-message');
        if(el) el.innerText = text;
    },
    
    refreshBuildings: () => {
        Object.keys(GameData.buildings).forEach((key, index) => {
            const slotNr = index + 1;
            const slotElement = document.getElementById(`slot-${slotNr}`);
            if(!slotElement) return;

            const img = slotElement.querySelector('img');
            const label = document.getElementById(`label-${slotNr}`);
            const housing = GameData.housing[key];

            if (GameData.buildings[key]) {
                // Grafik-Logik: slot2=nektar, slot4=enzym, slot5=pipeline, slot6=core, rest=wax
                let typePrefix = "wax";
                if (slotNr === 2) typePrefix = "nektar";
                if (slotNr === 4) typePrefix = "enzym";
                if (slotNr === 5) typePrefix = "pipeline";
                if (slotNr === 6) typePrefix = "core";
                
                if(img) {
                    let displayLevel = housing.level === 0 ? 1 : housing.level;
                    img.src = `gfx/${typePrefix}${displayLevel}.png`;
                    img.style.display = "block";
                }
                if(label) label.style.display = "none";
                slotElement.classList.add('idle-pump'); 
            } else {
                if(img) img.style.display = "none";
                if(label) {
                    label.style.display = "block";
                    const price = GameData.prices[key];
                    const labelText = GameData.labels[key];
                    label.innerText = labelText;
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
            }
        });
    },

    showAlert: (text) => {
        const el = document.getElementById('upgrade-alert');
        if(el) {
            el.innerText = text;
            el.classList.add('show');
            setTimeout(() => el.classList.remove('show'), 3000);
        }
    },

    triggerPump: (slotNr) => {
        const slotElement = document.getElementById(`slot-${slotNr}`);
        if (slotElement && GameData.buildings[`slot${slotNr}`]) {
            slotElement.classList.remove('active-pump'); 
            void slotElement.offsetWidth; 
            slotElement.classList.add('active-pump');

            let iconSymbol = (slotNr === 1 || slotNr === 4) ? "🍯" : (slotNr === 2 || slotNr === 5) ? "🌸" : (slotNr === 3 || slotNr === 6) ? "🐝" : "";

            if (iconSymbol) {
                const floatingIcon = document.createElement('span');
                floatingIcon.innerText = iconSymbol;
                floatingIcon.className = 'floating-spawn-icon';
                slotElement.appendChild(floatingIcon);
                setTimeout(() => floatingIcon.remove(), 1000);
            }
            
            setTimeout(() => slotElement.classList.remove('active-pump'), 300);
        }
    }
};

window.knownAvailableUpgrades = [];

function checkShopNotifications() {
    const availableItems = GameData.shopItems.filter(item => item.condition());
    const currentIds = availableItems.map(i => i.id);
    const hasUnseen = currentIds.some(id => !window.knownAvailableUpgrades.includes(id));
    const btn = document.getElementById('shop-trigger');
    if (btn) {
        if (hasUnseen) btn.classList.add('shop-glow');
        else btn.classList.remove('shop-glow');
    }
}

function startHoneyProduction() {
    let baseTime = 5000; 
    if (GameData.buildings.slot1) baseTime = 2500; 
    const workerBonus = (window.BuildingUI) ? window.BuildingUI.workers.slot1 : 0;
    
    // Bonus vom EnzymLabor (Slot 4) falls vorhanden
    const laborBonus = GameData.buildings.slot4 ? 0.20 : 0;
    const levelBonus = (GameData.housing.slot1.level >= 2) ? 0.10 : 0;
    
    let finalTime = baseTime / (1 + (workerBonus * 0.01) + levelBonus + laborBonus);

    setTimeout(() => {
        if (GameData.stats.nektar >= 1) {
            GameData.stats.nektar--;
            GameData.stats.honig++;
            UI.updateStat('nektar', GameData.stats.nektar);
            UI.updateStat('honig', GameData.stats.honig);
            UI.refreshBuildings();
            if (GameData.buildings.slot1) UI.triggerPump(1);
        }
        startHoneyProduction();
    }, finalTime);
}

function startNectarProduction() {
    if (GameData.buildings.slot2) {
        const workerCount = (window.BuildingUI) ? window.BuildingUI.workers.slot2 : 0;
        
        // Bonus von der Pipeline (Slot 5) falls vorhanden
        const pipelineBonus = GameData.buildings.slot5 ? 0.50 : 0;
        const levelBonus = (GameData.housing.slot2.level >= 2) ? 0.10 : 0;
        
        const bonusFactor = 1 * (1 + (workerCount * 0.01) + levelBonus + pipelineBonus);
        GameData.stats.nektar += bonusFactor;
        UI.updateStat('nektar', GameData.stats.nektar);
        UI.refreshBuildings();
        UI.triggerPump(2);
    }
    setTimeout(startNectarProduction, 10000);
}

function startBeeProduction() {
    let baseTime = 10000; 
    if (GameData.buildings.slot3) baseTime = 5000; 
    const workerCount = (window.BuildingUI) ? window.BuildingUI.workers.slot3 : 0;
    
    // Bonus vom Hive-Core (Slot 6)
    const coreBonus = GameData.buildings.slot6 ? 1.0 : 0;
    const levelBonus = (GameData.housing.slot3.level >= 2) ? 0.10 : 0;
    
    let finalTime = baseTime / (1 + (workerCount * 0.01) + levelBonus + coreBonus);

    setTimeout(() => {
        GameData.stats.bienen++;
        UI.updateStat('bienen', GameData.stats.bienen);
        if (GameData.buildings.slot3) UI.triggerPump(3);
        startBeeProduction();
    }, finalTime);
}

Object.keys(GameData.labels).forEach((key, index) => UI.updateLabel(index + 1, GameData.labels[key]));
UI.refreshBuildings(); 
startHoneyProduction();
startNectarProduction();
startBeeProduction();
AudioManager.init();
setInterval(checkShopNotifications, 2000);

for (let i = 1; i <= 6; i++) {
    const slotElement = document.getElementById(`slot-${i}`);
    if(slotElement) {
        slotElement.onclick = () => {
            const key = `slot${i}`;
            const price = GameData.prices[key];
            if (!GameData.buildings[key] && GameData.stats.honig >= price) {
                GameData.stats.honig -= price;
                GameData.buildings[key] = true;
                UI.updateStat('honig', GameData.stats.honig);
                UI.refreshBuildings();
                UI.setMessage("Neues Gebäude errichtet!");
            }
        };
    }
}

// Vollbild-Logik
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            UI.setMessage("Vollbild fehlgeschlagen");
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Event-Listener für den Fullscreen-Button
document.querySelectorAll('.fullscreen-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        toggleFullscreen();
    });
});

document.getElementById('bee-generator').onclick = (e) => {
    GameData.stats.nektar++;
    UI.updateStat('nektar', GameData.stats.nektar);
    UI.refreshBuildings();
    createPollenEffect(e);
};

document.getElementById('shop-trigger').onclick = () => {
    if (window.ShopUI) {
        const availableItems = GameData.shopItems.filter(item => item.condition());
        window.knownAvailableUpgrades = availableItems.map(i => i.id);
        checkShopNotifications(); 
        window.ShopUI.open();
    } else {
        UI.setMessage("Shop nicht verfügbar.");
    }
};

function createPollenEffect(e) {
    const container = document.querySelector('.game-container');
    const numParticles = 8;
    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.className = 'pollen-particle';
        particle.style.left = `${e.clientX}px`;
        particle.style.top = `${e.clientY}px`;
        const drift = (Math.random() - 0.5) * 60 + "px";
        particle.style.setProperty('--drift', drift);
        const duration = 0.5 + Math.random() * 0.8;
        particle.style.animation = `pollen-fall ${duration}s ease-out forwards`;
        container.appendChild(particle);
        setTimeout(() => particle.remove(), duration * 1000);
    }
}

// Verhindert das Ziehen aller Bilder (aus newstyle.css verschoben)
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('dragstart', (e) => e.preventDefault());
});