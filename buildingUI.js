// buildingUI.js
window.BuildingUI = {
    activeSlot: null,
    workers: {
        slot1: 0, slot2: 0, slot3: 0, slot4: 0, slot5: 0, slot6: 0
    },

    init() {
        for (let i = 1; i <= 6; i++) {
            const slot = document.getElementById(`slot-${i}`);
            slot.addEventListener('click', (e) => {
                if (GameData.buildings[`slot${i}`]) {
                    e.stopPropagation(); 
                    this.openMenu(i);
                }
            });
        }
        const modal = document.getElementById('building-modal');
        modal.addEventListener('click', (e) => { if (e.target === modal) this.closeMenu(); });
    },

    openMenu(slotNr) {
        this.activeSlot = slotNr;
        const slotKey = `slot${slotNr}`;
        const buildingName = GameData.labels[slotKey].split('(')[0].trim();
        document.getElementById('modal-title').innerText = buildingName;
        this.renderContent(slotNr);
        document.getElementById('building-modal').style.display = 'flex';
    },

    closeMenu() {
        document.getElementById('building-modal').style.display = 'none';
        this.activeSlot = null;
    },

    renderContent(slotNr) {
        const slotKey = `slot${slotNr}`;
        const currentWorkers = this.workers[slotKey];
        const housing = GameData.housing[slotKey];
        const content = document.getElementById('modal-content');
        
        // Berechnung basierend auf GAME_CONFIG
        let bonusVal = (currentWorkers * (GAME_CONFIG.bonuses.workerEfficiency * 10)); 
        if (housing.level >= 2) bonusVal += GAME_CONFIG.bonuses.level2FlatBonus;
        
        let upgradeButton = "";

        // Upgrade-Logik basierend auf Config Limits
        if (housing.level === 0 && currentWorkers >= GAME_CONFIG.limits.workersNeededForLevel2) {
            upgradeButton = `<button class="upgrade-btn" onclick="BuildingUI.upgradeHousing()">Wohnraum erweitern (${GAME_CONFIG.prices.housingUpgrade} 🍯)</button>`;
        } else if (housing.level === 1 && currentWorkers >= GAME_CONFIG.limits.upgradedMaxWorkers) {
            upgradeButton = `
                <button class="upgrade-btn" style="background: #9b59b6 !important;" onclick="BuildingUI.upgradeBuilding()">
                    Gebäude-Upgrade (${GAME_CONFIG.prices.buildingUpgrade} 🍯)
                </button>`;
        }

        content.innerHTML = `
            <div class="modal-status-text">Status: Level ${housing.level}</div>
            <div class="modal-workforce-text" style="color: #f1c40f; font-size: 1.1rem; margin: 10px 0;">
                Belegschaft: <strong>${currentWorkers} / ${housing.maxWorkers}</strong> 🐝
            </div>
            <div class="modal-efficiency-text">Effizienz-Bonus: +${bonusVal.toFixed(1)}%</div>
            <div class="modal-actions">
                <button class="modal-btn" onclick="BuildingUI.hire(1)">+1 Arbeiter</button>
                <button class="modal-btn" onclick="BuildingUI.hire(10)">+10 Arbeiter</button>
                ${upgradeButton}
            </div>
        `;
    },

    hire(amount) {
        if (GameData.stats.bienen >= amount) {
            const slotKey = `slot${this.activeSlot}`;
            const housing = GameData.housing[slotKey];
            
            if (this.workers[slotKey] + amount > housing.maxWorkers) {
                UI.setMessage("Nicht genug Wohnraum für so viele Arbeiter!");
                return;
            }

            GameData.stats.bienen -= amount;
            this.workers[slotKey] += amount;
            UI.updateStat('bienen', GameData.stats.bienen);
            this.renderContent(this.activeSlot);
        } else {
            UI.setMessage("Nicht genug untätige Bienen!");
        }
    },

    upgradeHousing() {
        const slotKey = `slot${this.activeSlot}`;
        const price = GAME_CONFIG.prices.housingUpgrade;
        if (GameData.stats.honig >= price) {
            GameData.stats.honig -= price;
            GameData.housing[slotKey].maxWorkers = GAME_CONFIG.limits.upgradedMaxWorkers;
            GameData.housing[slotKey].level = 1;
            UI.updateStat('honig', GameData.stats.honig);
            UI.refreshBuildings();
            this.renderContent(this.activeSlot);
            UI.setMessage(`Wohnraum auf ${GAME_CONFIG.limits.upgradedMaxWorkers} Plätze erweitert!`);
        } else {
            UI.setMessage("Zu wenig Honig!");
        }
    },

    upgradeBuilding() {
        const slotKey = `slot${this.activeSlot}`;
        const price = GAME_CONFIG.prices.buildingUpgrade;
        if (GameData.stats.honig >= price) {
            GameData.stats.honig -= price;
            GameData.housing[slotKey].level = 2; 
            UI.updateStat('honig', GameData.stats.honig);
            UI.refreshBuildings();
            this.renderContent(this.activeSlot);
            UI.setMessage("Industrie-Upgrade abgeschlossen!");
        } else {
            UI.setMessage("Zu wenig Honig!");
        }
    }
};