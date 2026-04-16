// story.js - Erweiterte Tutorial-Logik
const StoryModule = {
    currentStep: 0,
    missedClicks: 0,

    steps: [
        { text: "Hallo, ich bin BeeBabaluga", type: "click_anywhere" },
        { text: "Danke, dass du helfen willst", type: "click_anywhere" },
        { 
            text: "Für uns ist Nektar das Wichtigste!", 
            type: "click_or_wait", 
            duration: 10000 
        },
        { 
            text: "Klick auf MICH, um Nektar zu sammeln!", 
            type: "target_click", 
            targetId: "bee-generator",
            onStart: () => document.getElementById("bee-generator").classList.add("tutorial-highlight")
        },
        { 
            text: "Toll gemacht! Aus dir wird noch ein Profi!", 
            type: "wait_for_stat", 
            stat: "nektar", 
            value: 1,
            onStart: () => document.getElementById("bee-generator").classList.remove("tutorial-jump","tutorial-highlight")
        },
        { text: "Mach ruhig noch weiter. Wir brauchen ganz viel davon.", type: "wait_for_stat", stat: "nektar", value: 10 },
        { 
            text: "Unsere Königin wandelt den Nektar in Honig um", 
            type: "wait_for_stat", 
            stat: "nektar", 
            value: 25,
            action: () => StoryModule.animateStat("stat-honig")
        },
        { text: "Bald kannst du dir dein erstes Gebäude kaufen", type: "wait_for_stat", stat: "honig", value: 20 },
        { text: "Diese unterstützen dich beim Sammeln", type: "pause", duration: 15000 },
        { text: "Kauf dir doch den Wax-Store oder den Nektar-Store", type: "click_anywhere" }, // Hier könnte man später auf Shop-Klick prüfen
        { text: "Jetzt geht's erst richtig los! Hurraaaa!!!", type: "end" }
    ],

    init() {
        this.showStep();
        document.addEventListener('click', (e) => this.handleInput(e));
        // Hintergrund-Check für Statistiken
        setInterval(() => this.checkStats(), 500);
    },

    showStep() {
        const step = this.steps[this.currentStep];
        if (!step) return;

        UI.setMessage(step.text);
        if (step.onStart) step.onStart();

        if (step.type === "click_or_wait" || step.type === "pause") {
            setTimeout(() => {
                if (this.steps[this.currentStep] === step) this.next();
            }, step.duration);
        }
    },

    handleInput(e) {
        const step = this.steps[this.currentStep];
        if (!step) return;

        if (step.type === "click_anywhere" || step.type === "click_or_wait") {
            this.next();
        } 
        else if (step.type === "target_click") {
            if (e.target.closest(`#${step.targetId}`)) {
                this.next();
            } else {
                this.missedClicks++;
                if (this.missedClicks >= 5) {
                    UI.setMessage("Trau dich ruhig. Klick MICH!");
                    document.getElementById(step.targetId).classList.add("tutorial-jump");
                }
            }
        }
    },

    checkStats() {
        const step = this.steps[this.currentStep];
        if (step && step.type === "wait_for_stat") {
            if (GameData.stats[step.stat] >= step.value) {
                if (step.action) step.action();
                this.next();
            }
        }
    },

    animateStat(id) {
        const el = document.getElementById(id);
        el.classList.add("stat-bounce");
        setTimeout(() => el.classList.remove("stat-bounce"), 1000);
    },

    next() {
        this.missedClicks = 0;
        this.currentStep++;
        this.showStep();
    }
};

// story.js - Erweiterung

const StoryEvents = {
    // Diese Liste enthält Ereignisse, die eintreten, wenn Stats erreicht werden
    milestones: [
        {
            condition: () => GameData.stats.bienen >= 1,
            triggered: false,
            action: () => {
                UI.setMessage("Uih, eine neue Biene!");
                // Hier könntest du z.B. ein neues Gebäude freischalten oder ein Bild ändern
            }
        },
        {
            condition: () => BuildingUI.workers.slot1 >= 5,
            triggered: false,
            action: () => {
                UI.setMessage("Ein Team aus 5 Arbeitern im WaxStore? Das geht jetzt fix!");
                // Eventuelle Belohnung
            }
        }
    ],

    // Diese Funktion wird jede Sekunde aufgerufen
    watchStats() {
        this.milestones.forEach(event => {
            if (!event.triggered && event.condition()) {
                event.triggered = true; // Verhindert, dass es mehrfach auslöst
                event.action();
            }
        });
    },

    startPostTutorialWatcher() {
        console.log("Tutorial beendet. Überwachung der Stats gestartet...");
        setInterval(() => this.watchStats(), 1000);
    }
};

window.addEventListener('DOMContentLoaded', () => StoryModule.init());