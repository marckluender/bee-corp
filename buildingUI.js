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
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeMenu();
        });
    },

    renderContent(slotNr) {
        const slotKey = `slot${slotNr}`;
        const currentWorkers = this.workers[slotKey];
        const maxWorkers = GameData.housing[slotKey].maxWorkers;
        const housingLevel = GameData.housing[slotKey].level;
        
        const content = document.getElementById('modal-content');
        let bonusInfo = "";
        let upgradeButton = "";

        if (slotNr === 1) { 
            const timeBonus = (currentWorkers * 0.1).toFixed(1);
            bonusInfo = `<div style="color: #2ecc71; margin-bottom: 10px;">Zeitgewinn: +${timeBonus}%</div>`;
        } else if (slotNr === 2) { 
            const nectarBonus = (currentWorkers * 0.1).toFixed(1);
            bonusInfo = `<div style="color: #2ecc71; margin-bottom: 10px;">Nektar-Bonus: +${nectarBonus}%</div>`;
        } else if (slotNr === 3) {
            const beeBonus = (currentWorkers * 0.1).toFixed(1);
            bonusInfo = `<div style="color: #2ecc71; margin-bottom: 10px;">Geburtsrate-Bonus: +${beeBonus}%</div>`;
        }

        if (housingLevel === 0 && currentWorkers >= maxWorkers) {
            upgradeButton = `
                <button class="upgrade-btn" onclick="BuildingUI.upgradeHousing()">
                    Wohnraum erweitern (${GameData.prices.housingUpgrade} 🍯)
                </button>`;
        }

        content.innerHTML = `
            <div style="margin-bottom: 10px; font-size: 1.1rem; color: #f1c40f;">
                Arbeiter: <strong>${currentWorkers} / ${maxWorkers}</strong> 🐝
            </div>
            ${bonusInfo}
            <div class="modal-actions">
                <button onclick="BuildingUI.hire(1)">+1 Biene zuweisen</button>
                <button onclick="BuildingUI.hire(10)">+10 Bienen zuweisen</button>
                ${upgradeButton}
            </div>
        `;
    },

    openMenu(slotNr) {
        this.activeSlot = slotNr;
        const modal = document.getElementById('building-modal');
        const title = document.getElementById('modal-title');
        title.innerText = GameData.labels[`slot${slotNr}`].split('(')[0];
        this.renderContent(slotNr); 
        modal.style.display = 'flex';
    },

    closeMenu() {
        document.getElementById('building-modal').style.display = 'none';
        this.activeSlot = null;
    },

    hire(amount) {
        const slotKey = `slot${this.activeSlot}`;
        const maxLimit = GameData.housing[slotKey].maxWorkers;
        
        if (this.workers[slotKey] + amount > maxLimit) {
            UI.setMessage("Wohnraum voll! Erweitere das Gebäude.");
            return;
        }

        if (GameData.stats.bienen >= amount) {
            GameData.stats.bienen -= amount;
            this.workers[slotKey] += amount;
            UI.updateStat('bienen', GameData.stats.bienen);
            this.renderContent(this.activeSlot);
            UI.setMessage(`${amount} Biene(n) zugewiesen!`);
        } else {
            UI.setMessage("Nicht genug freie Bienen!");
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
            this.renderContent(this.activeSlot);
            UI.setMessage("Wohnraum auf 50 Plätze erweitert!");
            UI.refreshBuildings();
        } else {
            UI.setMessage("Nicht genug Honig!");
        }
    }
};

window.addEventListener('DOMContentLoaded', () => BuildingUI.init());