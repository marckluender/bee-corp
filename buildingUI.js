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

    renderContent(slotNr) {
        const slotKey = `slot${slotNr}`;
        const currentWorkers = this.workers[slotKey];
        const housing = GameData.housing[slotKey];
        const content = document.getElementById('modal-content');
        
        let bonusVal = (currentWorkers * 0.1);
        if (housing.level >= 2) bonusVal += 10;
        
        let upgradeButton = "";

        // Upgrade-Logik: Erst Wohnraum (10->50), dann Gebäude-Level (1->2)
        if (housing.level === 0 && currentWorkers >= 10) {
            upgradeButton = `<button class="upgrade-btn" onclick="BuildingUI.upgradeHousing()">Wohnraum erweitern (50 🍯)</button>`;
        } else if (housing.level === 1 && currentWorkers >= 50) {
            upgradeButton = `
                <button class="upgrade-btn" style="background: #9b59b6 !important;" onclick="BuildingUI.upgradeBuilding()">
                    Gebäude-Upgrade (25 🍯)
                </button>`;
        }

        content.innerHTML = `
            <div style="margin-bottom: 5px; font-size: 0.9rem; color: #bdc3c7;">Status: Level ${housing.level}</div>
            <div style="margin-bottom: 10px; font-size: 1.1rem; color: #f1c40f;">
                Belegschaft: <strong>${currentWorkers} / ${housing.maxWorkers}</strong> 🐝
            </div>
            <div style="color: #2ecc71; margin-bottom: 10px;">Effizienz-Bonus: +${bonusVal.toFixed(1)}%</div>
            <div class="modal-actions">
                <button onclick="BuildingUI.hire(1)">+1 Arbeiter</button>
                <button onclick="BuildingUI.hire(10)">+10 Arbeiter</button>
                ${upgradeButton}
            </div>
        `;
    },

    openMenu(slotNr) {
        this.activeSlot = slotNr;
        const title = document.getElementById('modal-title');
        title.innerText = GameData.labels[`slot${slotNr}`].split('(')[0];
        this.renderContent(slotNr); 
        document.getElementById('building-modal').style.display = 'flex';
    },

    closeMenu() {
        document.getElementById('building-modal').style.display = 'none';
        this.activeSlot = null;
    },

    hire(amount) {
        const slotKey = `slot${this.activeSlot}`;
        if (this.workers[slotKey] + amount > GameData.housing[slotKey].maxWorkers) {
            UI.setMessage("Kein Platz mehr!");
            return;
        }
        if (GameData.stats.bienen >= amount) {
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
        const price = GameData.prices.housingUpgrade;
        if (GameData.stats.honig >= price) {
            GameData.stats.honig -= price;
            GameData.housing[slotKey].maxWorkers = 50;
            GameData.housing[slotKey].level = 1;
            UI.updateStat('honig', GameData.stats.honig);
            UI.refreshBuildings();
            this.renderContent(this.activeSlot);
            UI.setMessage("Wohnraum auf 50 Plätze erweitert!");
        } else {
            UI.setMessage("Zu wenig Honig!");
        }
    },

    upgradeBuilding() {
        const slotKey = `slot${this.activeSlot}`;
        const price = GameData.prices.buildingUpgrade;
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

window.addEventListener('DOMContentLoaded', () => BuildingUI.init());