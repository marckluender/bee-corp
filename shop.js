const ShopUI = {
    open() {
        const modal = document.getElementById('shop-modal');
        this.render();
        modal.style.display = 'flex';
    },

    close() {
        document.getElementById('shop-modal').style.display = 'none';
    },

    render() {
        const content = document.getElementById('shop-content');
        content.innerHTML = "";

        const available = GameData.shopItems.filter(item => item.condition());

        if (available.length === 0) {
            content.innerHTML = "<p>Keine neuen Forschungen verfügbar.</p>";
            return;
        }

        available.forEach(item => {
            const div = document.createElement('div');
            div.className = 'shop-item';
            div.innerHTML = `
                <h4>${item.name}</h4>
                <p>${item.desc}</p>
                <button onclick="ShopUI.buy('${item.id}')">Kaufen (${item.cost} 🍯)</button>
            `;
            content.appendChild(div);
        });
    },

    buy(id) {
        const item = GameData.shopItems.find(i => i.id === id);
        
        if (GameData.stats.honig >= item.cost) {
            GameData.stats.honig -= item.cost;
            item.action(); // Führt das Upgrade aus
            
            UI.updateStat('honig', GameData.stats.honig);
            UI.setMessage(`${item.name} erfolgreich erforscht!`);
            
            this.render(); // Shop aktualisieren
            UI.refreshBuildings(); // UI aktualisieren
        } else {
            UI.setMessage("Nicht genug Honig!");
        }
    }
};