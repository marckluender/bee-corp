// newscript.js

const Preloader = {
    images: {},
    
    init() {
        const imageFiles = [
            'gfx/game.jpg',
            'gfx/beecorpstart.png',
            'gfx/wax1.png', 'gfx/wax2.png',
            'gfx/nektar1.png', 'gfx/nektar2.png',
            'gfx/flug1.png', 'gfx/flug2.png',
            'gfx/enzym1.png', 'gfx/enzym2.png',
            'gfx/pipeline1.png', 'gfx/pipeline2.png',
            'gfx/core1.png', 'gfx/core2.png'
        ];

        imageFiles.forEach(src => {
            const img = new Image();
            img.src = src;
            this.images[src] = img;
        });

        // Preload für die bekannten Sounds
        if (window.AudioManager) {
            ['honey.wav', 'nektar.wav', 'bee.wav', 'baba.wav'].forEach(sfx => window.AudioManager.preloadSfx(sfx));
        }
    }
};

const GameData = {
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
                    const newSrc = `gfx/${typePrefix}${displayLevel}.png`;
                    if (img.getAttribute('src') !== newSrc) img.src = newSrc;
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

            let iconSymbol = "";
            let sfxFile = "";

            if (slotNr === 1 || slotNr === 4) {
                iconSymbol = "🍯";
                sfxFile = "honey.wav";
            } else if (slotNr === 2 || slotNr === 5) {
                iconSymbol = "🌸";
                sfxFile = "nektar.wav";
            } else if (slotNr === 3 || slotNr === 6) {
                iconSymbol = "🐝";
                sfxFile = "bee.wav";
            }

            if (iconSymbol) {
                const floatingIcon = document.createElement('span');
                floatingIcon.innerText = iconSymbol;
                floatingIcon.className = 'floating-spawn-icon';
                slotElement.appendChild(floatingIcon);
                setTimeout(() => floatingIcon.remove(), 1000);
            }

            if (sfxFile && window.AudioManager) {
                window.AudioManager.playSfx(sfxFile);
            }
            
            setTimeout(() => slotElement.classList.remove('active-pump'), 300);
        }
    },

    showStartOverlay: () => {
        const overlay = document.createElement('div');
        overlay.id = 'game-start-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.95); display: flex; justify-content: center;
            align-items: center; z-index: 2147483647; cursor: pointer; transition: opacity 0.5s;
        `;
        
        const img = document.createElement('img');
        img.src = GAME_CONFIG.audio.startOverlayPath;
        img.style.cssText = `
            width: auto; height: auto; max-width: 80%; max-height: 80%; 
            object-fit: contain; border: 5px solid #f1c40f; border-radius: 20px;
            box-shadow: 0 0 50px rgba(241, 196, 15, 0.4);
            display: block; position: relative; z-index: 2147483648;
        `;
        
        img.onload = () => {
            img.style.animation = 'start-pump 3s infinite ease-in-out';
        };

        const style = document.createElement('style');
        style.textContent = '@keyframes start-pump { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }';
        document.head.appendChild(style);

        overlay.appendChild(img);
        document.body.appendChild(overlay);
        
        overlay.onclick = () => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 500);
            if (window.AudioManager) window.AudioManager.toggleMusic();
        };
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
    let baseTime = GAME_CONFIG.intervals.nectarBase;
    const workerCount = (window.BuildingUI) ? window.BuildingUI.workers.slot2 : 0;
    const pipelineBonus = GameData.buildings.slot5 ? GAME_CONFIG.bonuses.pipeline : 0;
    const levelBonus = (GameData.housing.slot2.level >= 2) ? GAME_CONFIG.bonuses.housingLevel2 : 0;
    
    let finalTime = baseTime / (1 + (workerCount * GAME_CONFIG.bonuses.workerPerBee) + levelBonus + pipelineBonus);

    setTimeout(() => {
        if (GameData.buildings.slot2) {
            GameData.stats.nektar += 1;
            UI.updateStat('nektar', GameData.stats.nektar);
            UI.refreshBuildings();
            UI.triggerPump(2);
        }
        startNectarProduction();
    }, finalTime);
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
    Preloader.init();
    UI.showStartOverlay();
    UI.refreshBuildings();
    startHoneyProduction();
    startNectarProduction();
    startBeeProduction();
    
    if (window.StoryModule) window.StoryModule.init();
    if (window.BuildingUI) window.BuildingUI.init();
    
    setInterval(checkShopNotifications, GAME_CONFIG.intervals.shopCheck);
};

document.getElementById('bee-generator').onclick = (e) => {
    GameData.stats.nektar++;
    UI.updateStat('nektar', GameData.stats.nektar);
    UI.refreshBuildings();
    if(window.AudioManager) window.AudioManager.playSfx('baba.wav'); 
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

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Fehler beim Aktivieren des Vollbildmodus: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function createPollenEffect(e) {
    const container = document.querySelector('.game-container');
    const numParticles = 8;
    
    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.className = 'pollen-particle';
        
        particle.style.left = `${e.pageX}px`;
        particle.style.top = `${e.pageY+50}px`;
        
        const drift = (Math.random() - 0.5) * 60 + "px";
        particle.style.setProperty('--drift', drift);
        
        const duration = 1.5 + Math.random() * 1.0; 
        particle.style.animation = `pollen-fall ${duration}s ease-out forwards`;
        
        container.appendChild(particle);
        setTimeout(() => particle.remove(), duration * 1000);
    }
}