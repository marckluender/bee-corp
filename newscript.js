// newscript.js
const GameData = {
    // Dynamischer Import der Startwerte aus der Config
    stats: { ...GAME_CONFIG.startingStats },
    buildings: {
        slot1: false, slot2: false, slot3: false,
        slot4: false, slot5: false, slot6: false
    },
    housing: {
        slot1: { maxWorkers: GAME_CONFIG.limits.defaultMaxWorkers, level: 0 },
        slot2: { maxWorkers: GAME_CONFIG.limits.defaultMaxWorkers, level: 0 },
        slot3: { maxWorkers: GAME_CONFIG.limits.defaultMaxWorkers, level: 0 },
        slot4: { maxWorkers: GAME_CONFIG.limits.defaultMaxWorkers, level: 0 },
        slot5: { maxWorkers: GAME_CONFIG.limits.defaultMaxWorkers, level: 0 },
        slot6: { maxWorkers: GAME_CONFIG.limits.defaultMaxWorkers, level: 0 }
    },
    prices: { ...GAME_CONFIG.prices },
    labels: { ...GAME_CONFIG.labels },
    shopItems: [
        {
            id: 'housing_slot1',
            name: 'Wohnraum: WaxStore',
            desc: `Erweitert den Platz auf ${GAME_CONFIG.limits.upgradedMaxWorkers} Bienen.`,
            cost: GAME_CONFIG.prices.housingUpgrade,
            condition: () => GameData.buildings.slot1 && GameData.housing.slot1.maxWorkers === GAME_CONFIG.limits.defaultMaxWorkers && (window.BuildingUI && window.BuildingUI.workers.slot1 >= GAME_CONFIG.limits.workersNeededForLevel2),
            action: () => { GameData.housing.slot1.maxWorkers = GAME_CONFIG.limits.upgradedMaxWorkers; GameData.housing.slot1.level = 1; }
        },
        {
            id: 'housing_slot2',
            name: 'Wohnraum: NektarStore',
            desc: `Erweitert den Platz auf ${GAME_CONFIG.limits.upgradedMaxWorkers} Bienen.`,
            cost: GAME_CONFIG.prices.housingUpgrade,
            condition: () => GameData.buildings.slot2 && GameData.housing.slot2.maxWorkers === GAME_CONFIG.limits.defaultMaxWorkers && (window.BuildingUI && window.BuildingUI.workers.slot2 >= GAME_CONFIG.limits.workersNeededForLevel2),
            action: () => { GameData.housing.slot2.maxWorkers = GAME_CONFIG.limits.upgradedMaxWorkers; GameData.housing.slot2.level = 1; }
        }
    ]
};

const AudioManager = {
    bgMusic: new Audio(GAME_CONFIG.audio.bgMusicPath),
    isMuted: false,
    hasStarted: false,

    init() {
        this.bgMusic.loop = true;
        this.bgMusic.volume = GAME_CONFIG.audio.defaultVolume;
        
        const btn = document.getElementById('sound-toggle');
        if(btn) {
            btn.onclick = () => this.toggleMute();
        }

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
                let typePrefix = "wax";
                if (slotNr === 2) typePrefix = "nektar";
                if (slotNr === 3) typePrefix = "flug";
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
    let baseTime = GAME_CONFIG.intervals.honeyBase; 
    if (GameData.buildings.slot1) baseTime = GAME_CONFIG.intervals.honeyUpgraded; 
    const workerBonus = (window.BuildingUI) ? window.BuildingUI.workers.slot1 : 0;
    const laborBonus = GameData.buildings.slot4 ? GAME_CONFIG.bonuses.enzymLabor : 0;
    const levelBonus = (GameData.housing.slot1.level >= 2) ? GAME_CONFIG.bonuses.housingLevel2 : 0;
    
    let finalTime = baseTime / (1 + (workerBonus * GAME_CONFIG.bonuses.workerPerBee) + levelBonus + laborBonus);

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
        const pipelineBonus = GameData.buildings.slot5 ? GAME_CONFIG.bonuses.pipeline : 0;
        const levelBonus = (GameData.housing.slot2.level >= 2) ? GAME_CONFIG.bonuses.housingLevel2 : 0;
        
        const bonusFactor = 1 * (1 + (workerCount * GAME_CONFIG.bonuses.workerPerBee) + levelBonus + pipelineBonus);
        GameData.stats.nektar += bonusFactor;
        UI.updateStat('nektar', GameData.stats.nektar);
        UI.refreshBuildings();
        UI.triggerPump(2);
    }
    setTimeout(startNectarProduction, GAME_CONFIG.intervals.nectarProductionTick);
}

function startBeeProduction() {
    let baseTime = GAME_CONFIG.intervals.beeBase; 
    if (GameData.buildings.slot3) baseTime = GAME_CONFIG.intervals.beeUpgraded; 
    const workerCount = (window.BuildingUI) ? window.BuildingUI.workers.slot3 : 0;
    const coreBonus = GameData.buildings.slot6 ? GAME_CONFIG.bonuses.hiveCore : 0;
    const levelBonus = (GameData.housing.slot3.level >= 2) ? GAME_CONFIG.bonuses.housingLevel2 : 0;
    
    let finalTime = baseTime / (1 + (workerCount * GAME_CONFIG.bonuses.workerPerBee) + levelBonus + coreBonus);

    setTimeout(() => {
        GameData.stats.bienen++;
        UI.updateStat('bienen', GameData.stats.bienen);
        if (GameData.buildings.slot3) UI.triggerPump(3);
        startBeeProduction();
    }, finalTime);
}

// --- INITIALISIERUNG & KAUF-LOGIK ---

Object.keys(GameData.labels).forEach((key, index) => {
    const slotNr = index + 1;
    const label = document.getElementById(`label-${slotNr}`);
    if (label) {
        label.onclick = () => {
            const price = GameData.prices[key];
            if (!GameData.buildings[key] && GameData.stats.honig >= price) {
                GameData.stats.honig -= price;
                GameData.buildings[key] = true;
                UI.updateStat('honig', GameData.stats.honig);
                UI.refreshBuildings();
                UI.setMessage(`${GameData.labels[key].split('(')[0]} erfolgreich errichtet!`);
            } else if (!GameData.buildings[key]) {
                UI.setMessage("Nicht genug Honig!");
            }
        };
    }
});

window.onload = () => {
    UI.refreshBuildings();
    startHoneyProduction();
    startNectarProduction();
    startBeeProduction();
    
    if (window.StoryModule) window.StoryModule.init();
    if (window.BuildingUI) window.BuildingUI.init();
    AudioManager.init();
    
    setInterval(checkShopNotifications, GAME_CONFIG.intervals.shopCheck);
};

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