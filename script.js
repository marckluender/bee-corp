// Tutorial & Idle
let tutorialStep = 0;
let failClicks = 0;
let idleInterval = null;
let currentIdleMsg = 0;
const tutorialMessages = ["hallo, es freut mich das du helfen willst, diesen ... ja ... etwas chaotischen Bienenstock auf Vordermann zu bringen", "Ich bin BeeBabaluga, und ich leite dich durch den Anfang", "Durch den Klick auf den Button 'Handbestäubung' erhälst du Nektar. Probiere es mal aus"];
const idleMessages = ["Du brauchst so einiges an Nektar. Für uns Bienen ist der sehr wichtig. Drück ordentlich drauf, damit unsere Königin ihn umwandeln kann", "Je mehr Nektar im Speicher ist, umso weniger musst du später klicken. Aber es macht ja auch Spaß!", "Halb geklickt ist schon halb gewonnen, denn mit Nektar wird der Tag begonnen", "Wir hier in BeeTopia sammeln den ganzen lieben Tag Nektar. Gibt es was schöneres?", "Bee, ba dee, BaBee, Babee Babee!"];

// Game State
let nectar = 0, honey = 0, unemployedBees = 0;
let hasWaxStore = false, waxLevel = 1, waxWorkers = 0;
let hasNektarStore = false, nektarLevel = 1, nektarWorkers = 0;
let hasPollenStore = false, pollenLevel = 1, pollenWorkers = 0;
const upgradeCosts = { 2: 250, 3: 1500, 4: 25000, 5: 500000 };
const workerMilestones = { 2: 20, 3: 50, 4: 150, 5: 500 };

function init() { updateNarrator(tutorialMessages[0]); }
function updateNarrator(txt) { document.getElementById('narrator').innerText = txt; }

function handleGlobalClick(event) {
    if (tutorialStep === 2 && event.target.id !== 'collect-btn') {
        failClicks++;
        if (failClicks >= 10) {
            updateNarrator("Schau mal: der Knopf da direkt unter mir. 'Handbestäubung' steht drauf. Da draufklicken!");
            document.getElementById('collect-btn').classList.add('highlight');
        }
    } else if (tutorialStep < 2) advanceTutorial();
}

function advanceTutorial() {
    if (tutorialStep < 2) {
        tutorialStep++;
        updateNarrator(tutorialMessages[tutorialStep]);
        if (tutorialStep === 2) document.getElementById('collect-btn').disabled = false;
    }
}

function manualCollect(event) {
    event.stopPropagation();
    let clickPower = 1 + (hasPollenStore ? (pollenWorkers * pollenLevel) : 0);
    nectar += clickPower;
    if (tutorialStep === 2) {
        tutorialStep = 3;
        document.getElementById('collect-btn').classList.remove('highlight');
        document.getElementById('buy-btn').disabled = false;
        document.getElementById('buy-nektar-btn').disabled = false;
        startProduction();
        startIdleMessages();
    }
    updateUI();
}

function startIdleMessages() {
    idleInterval = setInterval(() => {
        if (!hasWaxStore && !hasNektarStore) {
            updateNarrator(idleMessages[currentIdleMsg]);
            currentIdleMsg = (currentIdleMsg + 1) % idleMessages.length;
        } else clearInterval(idleInterval);
    }, 10000);
}

function startProduction() {
    // Biene alle 10 Sek
    setInterval(() => { unemployedBees++; updateUI(); }, 10000);

    // Königin Umwandlung (5 Sek Basis)
    processQueen();

    // WaxStore Passive Produktion (5 Sek)
    setInterval(() => {
        if (hasWaxStore) {
            let prod = 1 * (1 + (waxWorkers * 0.01));
            honey += prod;
            document.getElementById('wax-auto-prod').innerText = prod.toFixed(0);
        }
        if (hasNektarStore) {
            let prodNek = 1 * (1 + (nektarWorkers * 0.01));
            nectar += prodNek;
            document.getElementById('nektar-auto-prod').innerText = prodNek.toFixed(0);
        }
        if (hasWaxStore || hasNektarStore) updateUI();
    }, 5000);
}

function processQueen() {
    if (nectar >= 1) {
        let time = 5000 * Math.pow(0.5, hasWaxStore ? waxLevel : 0);
        nectar--; honey++; updateUI();
        setTimeout(processQueen, time);
    } else setTimeout(processQueen, 1000);
}

function updateUI() {
    document.getElementById('nectar-val').innerText = Math.floor(Math.max(0, nectar));
    document.getElementById('honey-val').innerText = Math.floor(Math.max(0, honey));
    document.getElementById('unemployed-val').innerText = unemployedBees;
    
    if (hasWaxStore) {
        document.getElementById('wax-workers').innerText = waxWorkers;
        document.getElementById('conv-speed').innerText = (5 * Math.pow(0.5, waxLevel)).toFixed(2);
    }
    if (hasNektarStore) {
        document.getElementById('nektar-workers').innerText = nektarWorkers;
    }
    if (hasPollenStore) {
        document.getElementById('pollen-workers').innerText = pollenWorkers;
        document.getElementById('pollen-click-bonus').innerText = (pollenWorkers * pollenLevel);
    }
    
    let totalWorkers = waxWorkers + nektarWorkers + pollenWorkers;
    
    let waxBtn = document.getElementById('buy-btn');
    if (waxBtn) waxBtn.disabled = tutorialStep < 2 || honey < 25;
    
    let nektarBtn = document.getElementById('buy-nektar-btn');
    if (nektarBtn) nektarBtn.disabled = tutorialStep < 2 || honey < 25;
    
    let canBuyPollen = (honey >= 250 && totalWorkers >= 50);
    let pollenBtn = document.getElementById('buy-pollen-btn');
    if(pollenBtn) pollenBtn.disabled = !canBuyPollen;

    let plotPollen = document.getElementById('plot-pollen');
    if (plotPollen) {
        plotPollen.style.display = (totalWorkers >= 50 || hasPollenStore) ? 'flex' : 'none';
    }

    let showWaxUpgrade = hasWaxStore && waxLevel < 5 && totalWorkers >= workerMilestones[waxLevel + 1];
    let showNektarUpgrade = hasNektarStore && nektarLevel < 5 && totalWorkers >= workerMilestones[nektarLevel + 1];
    let showPollenUpgrade = hasPollenStore && pollenLevel < 5 && totalWorkers >= workerMilestones[pollenLevel + 1];
    document.getElementById('top-alert-bar').style.display = (showWaxUpgrade || showNektarUpgrade || showPollenUpgrade) ? 'block' : 'none';
}

function buyWaxStore(event) {
    event.stopPropagation();
    if (honey >= 25) {
        honey -= 25; hasWaxStore = true;
        document.getElementById('wax-placeholder').style.visibility = 'hidden';
        document.getElementById('wax-img').src = 'gfx/wax_1.png';
        document.getElementById('wax-controls').style.display = 'flex';
        updateNarrator("Ausgezeichnet! Dein WaxStore steht. Jetzt geht es erst richtig los.");
        updateUI();
    }
}

function addWorker(event) {
    event.stopPropagation();
    if (unemployedBees > 0) { unemployedBees--; waxWorkers++; updateUI(); }
}

function buyNektarStore(event) {
    event.stopPropagation();
    if (honey >= 25) {
        honey -= 25; hasNektarStore = true;
        document.getElementById('nektar-placeholder').style.visibility = 'hidden';
        document.getElementById('nektar-img').src = 'gfx/nektar_1.png';
        document.getElementById('nektar-controls').style.display = 'flex';
        updateNarrator("Wunderbar! Dein NektarStore steht. Mehr Nektar bedeutet weniger Arbeit für dich!");
        updateUI();
    }
}

function addWorkerNektar(event) {
    event.stopPropagation();
    if (unemployedBees > 0) { unemployedBees--; nektarWorkers++; updateUI(); }
}

function buyPollenStore(event) {
    event.stopPropagation();
    if (honey >= 250 && (waxWorkers + nektarWorkers + pollenWorkers) >= 50) {
        honey -= 250; hasPollenStore = true;
        document.getElementById('pollen-placeholder').style.visibility = 'hidden';
        document.getElementById('pollen-img').style.background = '#e67e22';
        document.getElementById('pollen-img').style.color = '#fff';
        document.getElementById('pollen-img').innerText = 'Pollenakademie';
        document.getElementById('pollen-controls').style.display = 'flex';
        updateNarrator("Stark! Die Pollenakademie kurbelt die Handbestäubung ordentlich an!");
        updateUI();
    }
}

function addWorkerPollen(event) {
    event.stopPropagation();
    if (unemployedBees > 0) { unemployedBees--; pollenWorkers++; updateUI(); }
}

function toggleUpgradeMenu(show) {
    document.getElementById('upgrade-overlay').style.display = show ? 'flex' : 'none';
    if (show) renderUpgrades();
}

function renderUpgrades() {
    const list = document.getElementById('upgrade-list');
    list.innerHTML = "";

    let totalWorkers = waxWorkers + nektarWorkers + pollenWorkers;

    if (hasWaxStore) {
        let nextWax = waxLevel + 1;
        if (waxLevel < 5 && totalWorkers >= workerMilestones[nextWax]) {
            list.innerHTML += `<div class="upgrade-card" style="border-left-color: #27ae60;"><h3>WaxStore Level ${nextWax}</h3><p>Tempo Königin: -50% | Höhere Eigenproduktion.</p><button onclick="executeUpgrade('wax', ${upgradeCosts[nextWax]})" ${(honey < upgradeCosts[nextWax]) ? 'disabled' : ''} style="background:#27ae60; padding:12px; width:100%; border:none; border-radius:5px; color:white; cursor:pointer;">Kaufen für ${upgradeCosts[nextWax].toLocaleString()} 🍯</button></div>`;
        } else {
            list.innerHTML += `<div class="upgrade-card" style="border-left-color: #7f8c8d;"><h3>WaxStore</h3>` + (waxLevel >= 5 ? `<p>Maximales Level erreicht!</p>` : `<p>Benötigt ${workerMilestones[nextWax]} Bienen insgesamt.</p>`) + `</div>`;
        }
    }

    if (hasNektarStore) {
        let nextNek = nektarLevel + 1;
        if (nektarLevel < 5 && totalWorkers >= workerMilestones[nextNek]) {
            list.innerHTML += `<div class="upgrade-card" style="border-left-color: #9b59b6;"><h3>NektarStore Level ${nextNek}</h3><p>Höhere Nektar-Produktion!</p><button onclick="executeUpgrade('nektar', ${upgradeCosts[nextNek]})" ${(honey < upgradeCosts[nextNek]) ? 'disabled' : ''} style="background:#9b59b6; padding:12px; width:100%; border:none; border-radius:5px; color:white; cursor:pointer;">Kaufen für ${upgradeCosts[nextNek].toLocaleString()} 🍯</button></div>`;
        } else {
            list.innerHTML += `<div class="upgrade-card" style="border-left-color: #7f8c8d;"><h3>NektarStore</h3>` + (nektarLevel >= 5 ? `<p>Maximales Level erreicht!</p>` : `<p>Benötigt ${workerMilestones[nextNek]} Bienen insgesamt.</p>`) + `</div>`;
        }
    }

    if (hasPollenStore) {
        let nextPol = pollenLevel + 1;
        if (pollenLevel < 5 && totalWorkers >= workerMilestones[nextPol]) {
            list.innerHTML += `<div class="upgrade-card" style="border-left-color: #e67e22;"><h3>Pollenakademie Level ${nextPol}</h3><p>Größerer Handbestäubungs-Bonus!</p><button onclick="executeUpgrade('pollen', ${upgradeCosts[nextPol]})" ${(honey < upgradeCosts[nextPol]) ? 'disabled' : ''} style="background:#e67e22; padding:12px; width:100%; border:none; border-radius:5px; color:white; cursor:pointer;">Kaufen für ${upgradeCosts[nextPol].toLocaleString()} 🍯</button></div>`;
        } else {
            list.innerHTML += `<div class="upgrade-card" style="border-left-color: #7f8c8d;"><h3>Pollenakademie</h3>` + (pollenLevel >= 5 ? `<p>Maximales Level erreicht!</p>` : `<p>Benötigt ${workerMilestones[nextPol]} Bienen insgesamt.</p>`) + `</div>`;
        }
    }
}

function executeUpgrade(type, cost) {
    if (honey >= cost) {
        honey -= cost;
        if (type === 'wax') {
            waxLevel++;
            document.getElementById('wax-img').src = `gfx/wax_${waxLevel}.png`;
        } else if (type === 'nektar') {
            nektarLevel++;
            document.getElementById('nektar-img').src = `gfx/nektar_${nektarLevel}.png`;
        } else if (type === 'pollen') {
            pollenLevel++;
            document.getElementById('pollen-img').innerText = `Pollenakademie Lvl ${pollenLevel}`;
        }
        toggleUpgradeMenu(false); updateUI();
    }
}

window.onload = init;