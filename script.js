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
    nectar++;
    if (tutorialStep === 2) {
        tutorialStep = 3;
        document.getElementById('collect-btn').classList.remove('highlight');
        document.getElementById('buy-btn').disabled = false;
        startProduction();
        startIdleMessages();
    }
    updateUI();
}

function startIdleMessages() {
    idleInterval = setInterval(() => {
        if (!hasWaxStore) {
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
            document.getElementById('wax-auto-prod').innerText = prod.toFixed(2);
            updateUI();
        }
    }, 5000);
}

function processQueen() {
    if (nectar > 0) {
        let time = 5000 * Math.pow(0.5, hasWaxStore ? waxLevel : 0);
        nectar--; honey++; updateUI();
        setTimeout(processQueen, time);
    } else setTimeout(processQueen, 1000);
}

function updateUI() {
    document.getElementById('nectar-val').innerText = nectar;
    document.getElementById('honey-val').innerText = Math.floor(honey);
    document.getElementById('unemployed-val').innerText = unemployedBees;
    if (hasWaxStore) {
        document.getElementById('wax-workers').innerText = waxWorkers;
        document.getElementById('conv-speed').innerText = (5 * Math.pow(0.5, waxLevel)).toFixed(2);
        let next = waxLevel + 1;
        document.getElementById('top-alert-bar').style.display = (waxLevel < 5 && waxWorkers >= workerMilestones[next]) ? 'block' : 'none';
    }
}

function buyWaxStore(event) {
    event.stopPropagation();
    if (honey >= 25) {
        honey -= 25; hasWaxStore = true;
        document.getElementById('wax-placeholder').style.display = 'none';
        document.getElementById('wax-img').style.display = 'block';
        document.getElementById('wax-controls').style.display = 'flex';
        updateNarrator("Ausgezeichnet! Dein WaxStore steht. Jetzt geht es erst richtig los.");
        updateUI();
    }
}

function addWorker(event) {
    event.stopPropagation();
    if (unemployedBees > 0) { unemployedBees--; waxWorkers++; updateUI(); }
}

function toggleUpgradeMenu(show) {
    document.getElementById('upgrade-overlay').style.display = show ? 'flex' : 'none';
    if (show) renderUpgrades();
}

function renderUpgrades() {
    const list = document.getElementById('upgrade-list');
    list.innerHTML = "";
    let next = waxLevel + 1;
    if (waxLevel < 5 && waxWorkers >= workerMilestones[next]) {
        list.innerHTML = `<div class="upgrade-card"><h3>WaxStore Level ${next}</h3><p>Tempo Königin: -50% | Höhere Eigenproduktion.</p><button onclick="executeUpgrade(${upgradeCosts[next]})" ${(honey < upgradeCosts[next]) ? 'disabled' : ''} style="background:#27ae60; padding:12px; width:100%;">Kaufen für ${upgradeCosts[next].toLocaleString()} 🍯</button></div>`;
    } else list.innerHTML = waxLevel >= 5 ? "Max Level!" : `<p>Du brauchst ${workerMilestones[next]} Arbeiter.</p>`;
}

function executeUpgrade(cost) {
    if (honey >= cost) {
        honey -= cost; waxLevel++;
        document.getElementById('wax-img').src = `gxf/wax_${waxLevel}.png`;
        toggleUpgradeMenu(false); updateUI();
    }
}

window.onload = init;