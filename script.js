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
    "Hast du schon den Honigvorrat gesehen? Da geht noch was!"
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
    else if (tutorialStep === 2) {
        if (!event.target.closest('#narrator-container')) {
            failClicks++;
            if (failClicks >= 10) {
                updateNarrator("Nicht so schüchtern! Du musst direkt auf mein Bild klicken!");
            }
        }
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
        let clickPower = 1 + (hasPollenStore ? (pollenWorkers * pollenLevel) : 0);
        nectar += clickPower;
        triggerNectarJump();
        updateUI();
    }
}

function showNextIdleMessage() {
    updateNarrator(idleMessages[currentIdleMsg]);
    currentIdleMsg = (currentIdleMsg + 1) % idleMessages.length;
}

function startIdleTimer() {
    idleInterval = setInterval(() => {
        if (!hasWaxStore && !hasNektarStore) {
            showNextIdleMessage();
        } else {
            clearInterval(idleInterval);
            updateNarrator("");
        }
    }, 20000);
}

function startProduction() {
    setInterval(() => { unemployedBees++; updateUI(); }, 10000);
    setInterval(() => {
        if (hasWaxStore) honey += (1 * (1 + (waxWorkers * 0.01)));
        if (hasNektarStore) nectar += (1 * (1 + (nektarWorkers * 0.01)));
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
    document.getElementById('nectar-val').innerText = Math.floor(Math.max(0, nectar));
    document.getElementById('honey-val').innerText = Math.floor(Math.max(0, honey));
    document.getElementById('unemployed-val').innerText = unemployedBees;

    if (hasWaxStore) document.getElementById('wax-workers').innerText = waxWorkers;
    if (hasNektarStore) document.getElementById('nektar-workers').innerText = nektarWorkers;
    if (hasPollenStore) {
        document.getElementById('pollen-workers').innerText = pollenWorkers;
        let bonusEl = document.getElementById('pollen-click-bonus');
        if (bonusEl) bonusEl.innerText = (pollenWorkers * pollenLevel);
    }

    let totalWorkers = waxWorkers + nektarWorkers + pollenWorkers;

    let waxBtn = document.getElementById('buy-btn');
    if (waxBtn) waxBtn.disabled = (tutorialStep < 2 || honey < 25);

    let nektarBtn = document.getElementById('buy-nektar-btn');
    if (nektarBtn) nektarBtn.disabled = (tutorialStep < 2 || honey < 25);

    let canBuyPollen = (honey >= 250 && totalWorkers >= 50);
    let pollenBtn = document.getElementById('buy-pollen-btn');
    if (pollenBtn) pollenBtn.disabled = (tutorialStep < 2 || !canBuyPollen);

    let plotPollen = document.getElementById('plot-pollen');
    if (plotPollen) {
        plotPollen.style.display = (totalWorkers >= 50 || hasPollenStore) ? 'flex' : 'none';
    }

    // Banner-Logik
    let showWaxUpgrade = hasWaxStore && waxLevel < 5 && totalWorkers >= workerMilestones[waxLevel + 1];
    let showNektarUpgrade = hasNektarStore && nektarLevel < 5 && totalWorkers >= workerMilestones[nektarLevel + 1];
    let showPollenUpgrade = hasPollenStore && pollenLevel < 5 && totalWorkers >= workerMilestones[pollenLevel + 1];

    let currentAvailable = (showWaxUpgrade ? 1 : 0) + (showNektarUpgrade ? 1 : 0) + (showPollenUpgrade ? 1 : 0);

    if (currentAvailable > lastUpgradeCount) {
        upgradesSeen = false;
    }
    lastUpgradeCount = currentAvailable;

    let alertBar = document.getElementById('top-alert-bar');
    if (alertBar) alertBar.style.display = (!upgradesSeen && currentAvailable > 0) ? 'block' : 'none';
}

function buyStore(type, event) {
    if (event) event.stopPropagation();
    let totalWorkers = waxWorkers + nektarWorkers + pollenWorkers;

    if (type === 'wax' && honey >= 25) {
        honey -= 25; hasWaxStore = true;
        document.getElementById('wax-placeholder').style.visibility = 'hidden';
        document.getElementById('wax-img').src = 'gfx/wax_1.png';
        document.getElementById('wax-controls').style.display = 'flex';
        updateNarrator("");
    } else if (type === 'nektar' && honey >= 25) {
        honey -= 25; hasNektarStore = true;
        document.getElementById('nektar-placeholder').style.visibility = 'hidden';
        document.getElementById('nektar-img').src = 'gfx/nektar_1.png';
        document.getElementById('nektar-controls').style.display = 'flex';
        updateNarrator("");
    } else if (type === 'pollen' && honey >= 250 && totalWorkers >= 50) {
        honey -= 250; hasPollenStore = true;
        document.getElementById('pollen-placeholder').style.visibility = 'hidden';
        document.getElementById('pollen-controls').style.display = 'flex';
        updateNarrator("Stark! Die Pollenakademie kurbelt die Handbestäubung ordentlich an!");
    }
    updateUI();
}

function addWorkerTo(type, event) {
    if (event) event.stopPropagation();
    if (unemployedBees > 0) {
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
    let itemsAdded = 0; // Hilfsvariable, um zu prüfen ob der Shop komplett leer ist

    // Gekaufte Maximal-Level (Level 5) werden hier komplett ignoriert und verschwinden aus dem Shop
    if (hasWaxStore && waxLevel < 5) {
        let nextWax = waxLevel + 1;
        if (totalWorkers >= workerMilestones[nextWax]) {
            list.innerHTML += `<div class="upgrade-card" style="border-left-color: #27ae60;"><h3>WaxStore Level ${nextWax}</h3><p>Tempo Königin: -50% | Höhere Eigenproduktion.</p><button onclick="executeUpgrade('wax', ${upgradeCosts[nextWax]})" ${(honey < upgradeCosts[nextWax]) ? 'disabled' : ''} style="background:#27ae60; padding:12px; width:100%; border:none; border-radius:5px; color:white; cursor:pointer;">Kaufen für ${upgradeCosts[nextWax].toLocaleString()} 🍯</button></div>`;
        } else {
            list.innerHTML += `<div class="upgrade-card" style="border-left-color: #7f8c8d;"><h3>WaxStore Lvl ${nextWax} gesperrt</h3><p>Benötigt ${workerMilestones[nextWax]} Bienen insgesamt.</p></div>`;
        }
        itemsAdded++;
    }

    if (hasNektarStore && nektarLevel < 5) {
        let nextNek = nektarLevel + 1;
        if (totalWorkers >= workerMilestones[nextNek]) {
            list.innerHTML += `<div class="upgrade-card" style="border-left-color: #9b59b6;"><h3>NektarStore Level ${nextNek}</h3><p>Höhere Nektar-Produktion!</p><button onclick="executeUpgrade('nektar', ${upgradeCosts[nextNek]})" ${(honey < upgradeCosts[nextNek]) ? 'disabled' : ''} style="background:#9b59b6; padding:12px; width:100%; border:none; border-radius:5px; color:white; cursor:pointer;">Kaufen für ${upgradeCosts[nextNek].toLocaleString()} 🍯</button></div>`;
        } else {
            list.innerHTML += `<div class="upgrade-card" style="border-left-color: #7f8c8d;"><h3>NektarStore Lvl ${nextNek} gesperrt</h3><p>Benötigt ${workerMilestones[nextNek]} Bienen insgesamt.</p></div>`;
        }
        itemsAdded++;
    }

    if (hasPollenStore && pollenLevel < 5) {
        let nextPol = pollenLevel + 1;
        if (totalWorkers >= workerMilestones[nextPol]) {
            list.innerHTML += `<div class="upgrade-card" style="border-left-color: #e67e22;"><h3>Pollenakademie Level ${nextPol}</h3><p>Größerer Handbestäubungs-Bonus!</p><button onclick="executeUpgrade('pollen', ${upgradeCosts[nextPol]})" ${(honey < upgradeCosts[nextPol]) ? 'disabled' : ''} style="background:#e67e22; padding:12px; width:100%; border:none; border-radius:5px; color:white; cursor:pointer;">Kaufen für ${upgradeCosts[nextPol].toLocaleString()} 🍯</button></div>`;
        } else {
            list.innerHTML += `<div class="upgrade-card" style="border-left-color: #7f8c8d;"><h3>Pollenakademie Lvl ${nextPol} gesperrt</h3><p>Benötigt ${workerMilestones[nextPol]} Bienen insgesamt.</p></div>`;
        }
        itemsAdded++;
    }

    if (itemsAdded === 0 && (hasWaxStore || hasNektarStore || hasPollenStore)) {
        list.innerHTML = `<p style="color:#bdc3c7; font-style:italic;">Du hast aktuell das Maximum an Wissen erforscht!</p>`;
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