// shop.js
window.ShopUI = {
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

        // Filtert Items basierend auf den Bedingungen in GameData
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
            item.action(); 
            
            UI.updateStat('honig', GameData.stats.honig);
            UI.setMessage(`${item.name} erfolgreich erforscht!`);
            
            this.render(); 
            UI.refreshBuildings(); 
        } else {
            UI.setMessage("Nicht genug Honig!");
        }
    }
};

// --- NEU: Schließen beim Klick auf den Hintergrund ---
window.addEventListener('DOMContentLoaded', () => {
    const shopModal = document.getElementById('shop-modal');
    if (shopModal) {
        shopModal.addEventListener('click', (e) => {
            // Wenn das geklickte Element exakt das Overlay ist (und nicht der Inhalt)
            if (e.target === shopModal) {
                window.ShopUI.close();
            }
        });
    }
});