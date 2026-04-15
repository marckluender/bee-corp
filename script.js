// Konfiguration
let moderatorName = "BeeBabaluga";
const sfxPath = 'sfx/pollinate.mp3';

// Tutorial & Idle
let tutorialStep = 0;
let failClicks = 0;
let idleInterval = null;
let currentIdleMsg = 0;

const tutorialMessages = [
    "hallo, es freut mich das du helfen willst, diesen ... ja ... etwas chaotischen Bienenstock auf Vordermann zu bringen",
    "Ich bin " + moderatorName + ", und ich leite dich durch den Anfang",
    "Klicke einfach mal auf mein Bild hier im Kontrollzentrum, um Nektar zu sammeln. Versuche es mal!"
];
const wellDoneMessage = "Hahaha! Toll gemacht! Ein echtes Naturtalent beim Bestäuben! Mach fleißig weiter, wir brauchen den Nektar.";

const idleMessages = [
    "Du brauchst so einiges an Nektar. Für uns Bienen ist der sehr wichtig. Klick fleißig auf mein Bild!",
    "Je mehr Nektar im Speicher ist, umso weniger musst du später klicken.",
    "Halb geklickt ist schon halb gewonnen!",
    "Bee, ba dee, BaBee, Babee Babee!",
    "Hast du schon den Honigvorrat gesehen? Da geht noch was!",
    "Ein paar Bienen mehr könnten hier wirklich nicht schaden. Also... fast so viele wie in meiner Verwandtschaft!",
    "Summ summ summ... Bienchen klick dich dumm? Nein, klick dich reich!",
    "Wusstest du, dass Honig quasi flüssiges Gold ist? Nur klebriger. Und leckerer.",
    "Ich habe gehört, in anderen Stöcken gibt es Gewerkschaften. Aber hier? Hier gibt es... MICH!",
    "Wenn wir so weitermachen, gehört uns bald der ganze Garten. Oder zumindest der Blumenkasten da vorne."
];

// Game State
let nectar = 0, honey = 0, unemployedBees = 0;
let hasWaxStore = false, waxLevel = 1, waxWorkers = 0;
let hasNektarStore = false, nektarLevel = 1, nektarWorkers = 0;
let hasPollenStore = false, pollenLevel = 1, pollenWorkers = 0;

// Banner Logik
let upgradesSeen = true, lastUpgradeCount = 0;

const workerMilestones = { 2: 20, 3: 50, 4: 150, 5: 500 };
const upgradeCosts = { 2: 250, 3: 1500, 4: 25000, 5: 500000 };

function init() {
    updateNarrator(tutorialMessages[0]);
    document.getElementById('moderator-name-tag').innerText = moderatorName;
    updateUI();
}

function updateNarrator(txt) {
    document.getElementById('narrator').innerText = txt;
}

function playPollinateSound() {
    const audio = new Audio(sfxPath);
    const randomPitch = 0.9 + Math.random() * 0.2;
    audio.playbackRate = randomPitch;
    audio.play().catch(e => console.log("Audio konnte nicht geladen werden:", e));
    audio.onended = () => { audio.remove(); };
}

function triggerNectarJump() {
    let el = document.getElementById('nectar-val');
    if (!el) return;
    el.classList.remove('stat-jump');
    void el.offsetWidth;
    el.classList.add('stat-jump');
}

function handleGlobalClick(event) {
    if (tutorialStep < 2) {
        advanceTutorial();
    }
}

function advanceTutorial() {
    if (tutorialStep < 2) {
        tutorialStep++;
        updateNarrator(tutorialMessages[tutorialStep]);
        if (tutorialStep === 2) {
            document.getElementById('narrator-container').classList.add('highlight-pulse');
        }
    }
}

function createParticles(x, y) {
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        document.body.appendChild(p);
        const size = Math.random() * 10 + 5;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;

        const destX = (Math.random() - 0.5) * 300;
        const destY = (Math.random() - 0.5) * 300;

        const anim = p.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${destX}px, ${destY}px) scale(0)`, opacity: 0 }
        ], { duration: 600 + Math.random() * 400, easing: 'cubic-bezier(0, .9, .57, 1)' });

        anim.onfinish = () => p.remove();
    }
}

function manualCollect(event) {
    if (event) {
        event.stopPropagation();
        createParticles(event.clientX, event.clientY);
        playPollinateSound();
    }

    if (tutorialStep === 2) {
        tutorialStep = 3;
        updateNarrator(wellDoneMessage);
        document.getElementById('narrator-container').classList.remove('highlight-pulse');
        nectar += 1;
        triggerNectarJump();
        updateUI();
        return;
    }
    else if (tutorialStep === 3) {
        tutorialStep = 4;
        startProduction();
        showNextIdleMessage();
        startIdleTimer();
    }

    if (tutorialStep >= 2) {
        nectar += 1;
        triggerNectarJump();
        updateUI();
    }
}

function showNextIdleMessage() {
    updateNarrator(idleMessages[currentIdleMsg]);
    currentIdleMsg = (currentIdleMsg + 1) % idleMessages.length;
}

function startIdleTimer() {
    if (idleInterval) clearInterval(idleInterval);
    idleInterval = setInterval(() => {
        if (upgradesSeen) {
            showNextIdleMessage();
        }
    }, 20000);
}

function startProduction() {
    setInterval(() => {
        let spawnAmount = 1;
        if (hasPollenStore) {
            spawnAmount += (pollenWorkers * 0.05 * pollenLevel);
        }
        unemployedBees += spawnAmount;
        updateUI();
    }, 10000);

    setInterval(() => {
        if (hasWaxStore) honey += (waxLevel * (1 + (waxWorkers * 0.01)));
        if (hasNektarStore) nectar += (nektarLevel * (1 + (nektarWorkers * 0.01)));
        updateUI();
    }, 5000);
    processQueen();
}

function processQueen() {
    let currentSpeedLevel = hasWaxStore ? waxLevel : 0;
    let interval = 5000 * Math.pow(0.5, currentSpeedLevel);
    if (nectar >= 1) {
        nectar -= 1; honey += 1; updateUI();
        setTimeout(processQueen, interval);
    } else {
        setTimeout(processQueen, 500);
    }
}

function updateUI() {
    document.getElementById('nectar-val').innerText = Math.floor(nectar);
    document.getElementById('honey-val').innerText = Math.floor(honey);
    document.getElementById('unemployed-val').innerText = Math.floor(unemployedBees);

    if (hasWaxStore) {
        document.getElementById('wax-workers').innerText = waxWorkers;
        let waxProd = (waxLevel * (1 + (waxWorkers * 0.01)));
        document.getElementById('wax-auto-prod').innerText = waxProd.toFixed(1);
    }

    if (hasNektarStore) {
        document.getElementById('nektar-workers').innerText = nektarWorkers;
        let nekProd = (nektarLevel * (1 + (nektarWorkers * 0.01)));
        document.getElementById('nektar-auto-prod').innerText = nekProd.toFixed(1);
    }

    if (hasPollenStore) {
        document.getElementById('pollen-workers').innerText = pollenWorkers;
        let pollenBonus = (1 + (pollenWorkers * 0.05 * pollenLevel));
        document.getElementById('pollen-prod-val').innerText = pollenBonus.toFixed(1);
    }

    let totalWorkers = waxWorkers + nektarWorkers + pollenWorkers;
    if (document.getElementById('buy-btn')) document.getElementById('buy-btn').disabled = (honey < 25);
    if (document.getElementById('buy-nektar-btn')) document.getElementById('buy-nektar-btn').disabled = (honey < 25);
    if (document.getElementById('buy-pollen-btn')) document.getElementById('buy-pollen-btn').disabled = (honey < 250 || totalWorkers < 50);

    let plotPollen = document.getElementById('plot-pollen');
    if (plotPollen) plotPollen.style.display = (totalWorkers >= 50 || hasPollenStore) ? 'flex' : 'none';

    let showWaxUpgrade = hasWaxStore && waxLevel < 5 && totalWorkers >= workerMilestones[waxLevel + 1];
    let showNektarUpgrade = hasNektarStore && nektarLevel < 5 && totalWorkers >= workerMilestones[nektarLevel + 1];
    let showPollenUpgrade = hasPollenStore && pollenLevel < 5 && totalWorkers >= workerMilestones[pollenLevel + 1];

    let currentAvailable = (showWaxUpgrade ? 1 : 0) + (showNektarUpgrade ? 1 : 0) + (showPollenUpgrade ? 1 : 0);
    if (currentAvailable > lastUpgradeCount) upgradesSeen = false;
    lastUpgradeCount = currentAvailable;

    let alertBar = document.getElementById('top-alert-bar');
    if (alertBar) alertBar.style.display = (!upgradesSeen && currentAvailable > 0) ? 'block' : 'none';
}

function buyStore(type, event) {
    if (event) event.stopPropagation();
    if (type === 'wax' && honey >= 25) {
        honey -= 25; hasWaxStore = true;
        document.getElementById('wax-placeholder').style.visibility = 'hidden';
        document.getElementById('wax-img').src = 'gfx/wax_1.png';
        document.getElementById('wax-controls').style.display = 'flex';
    } else if (type === 'nektar' && honey >= 25) {
        honey -= 25; hasNektarStore = true;
        document.getElementById('nektar-placeholder').style.visibility = 'hidden';
        document.getElementById('nektar-img').src = 'gfx/nektar_1.png';
        document.getElementById('nektar-controls').style.display = 'flex';
    } else if (type === 'pollen' && honey >= 250) {
        honey -= 250; hasPollenStore = true;
        document.getElementById('pollen-placeholder').style.visibility = 'hidden';
        document.getElementById('pollen-controls').style.display = 'flex';
    }
    updateUI();
}

function addWorkerTo(type, event) {
    if (event) event.stopPropagation();
    if (unemployedBees >= 1) {
        unemployedBees--;
        if (type === 'wax') waxWorkers++;
        if (type === 'nektar') nektarWorkers++;
        if (type === 'pollen') pollenWorkers++;
        updateUI();
    }
}

function toggleUpgradeMenu(show) {
    document.getElementById('upgrade-overlay').style.display = show ? 'flex' : 'none';
    if (show) {
        upgradesSeen = true;
        updateUI();
        renderUpgrades();
    }
}

function renderUpgrades() {
    const list = document.getElementById('upgrade-list');
    if (!list) return;
    list.innerHTML = "";

    let totalWorkers = waxWorkers + nektarWorkers + pollenWorkers;
    let itemsAdded = 0;

    // KORREKTUR: Detaillierte Effekt-Beschreibungen für den Shop
    if (hasWaxStore && waxLevel < 5) {
        let nextLvl = waxLevel + 1;
        let canBuy = totalWorkers >= workerMilestones[nextLvl];
        let currentInterval = (5 * Math.pow(0.5, waxLevel)).toFixed(2);
        let nextInterval = (5 * Math.pow(0.5, nextLvl)).toFixed(2);

        list.innerHTML += `<div class="upgrade-card" style="border-left-color: ${canBuy ? '#27ae60' : '#7f8c8d'};">
            <h3>WaxStore Level ${nextLvl}</h3>
            <p>Effekt: Königin-Intervall reduziert von ${currentInterval}s auf ${nextInterval}s.<br>Honig-Grundwert steigt von x${waxLevel} auf x${nextLvl}.</p>
            <button onclick="executeUpgrade('wax', ${upgradeCosts[nextLvl]})" ${(!canBuy || honey < upgradeCosts[nextLvl]) ? 'disabled' : ''}>Kaufen (${upgradeCosts[nextLvl]} 🍯)</button>
        </div>`;
        itemsAdded++;
    }

    if (hasNektarStore && nektarLevel < 5) {
        let nextLvl = nektarLevel + 1;
        let canBuy = totalWorkers >= workerMilestones[nextLvl];

        list.innerHTML += `<div class="upgrade-card" style="border-left-color: ${canBuy ? '#9b59b6' : '#7f8c8d'};">
            <h3>NektarStore Level ${nextLvl}</h3>
            <p>Effekt: Nektar-Eigenproduktion wird von x${nektarLevel} auf x${nextLvl} verstärkt.</p>
            <button onclick="executeUpgrade('nektar', ${upgradeCosts[nextLvl]})" ${(!canBuy || honey < upgradeCosts[nextLvl]) ? 'disabled' : ''}>Kaufen (${upgradeCosts[nextLvl]} 🍯)</button>
        </div>`;
        itemsAdded++;
    }

    if (hasPollenStore && pollenLevel < 5) {
        let nextLvl = pollenLevel + 1;
        let canBuy = totalWorkers >= workerMilestones[nextLvl];

        list.innerHTML += `<div class="upgrade-card" style="border-left-color: ${canBuy ? '#e67e22' : '#7f8c8d'};">
            <h3>Pollenakademie Level ${nextLvl}</h3>
            <p>Effekt: Rekrutierungs-Multiplikator für Arbeiter-Bienen steigt von x${pollenLevel} auf x${nextLvl}.</p>
            <button onclick="executeUpgrade('pollen', ${upgradeCosts[nextLvl]})" ${(!canBuy || honey < upgradeCosts[nextLvl]) ? 'disabled' : ''}>Kaufen (${upgradeCosts[nextLvl]} 🍯)</button>
        </div>`;
        itemsAdded++;
    }

    if (itemsAdded === 0) {
        list.innerHTML = `<p style="color:#bdc3c7; font-style:italic;">Aktuell sind keine weiteren Forschungen verfügbar.</p>`;
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
        }
        toggleUpgradeMenu(false); updateUI();
    }
}

window.onload = init;