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
            value: 1, // Prüft auf MINDESTENS 1
            onStart: () => document.getElementById("bee-generator").classList.remove("tutorial-jump","tutorial-highlight")
        },
        { text: "Mach ruhig noch weiter. Wir brauchen ganz viel davon.", type: "wait_for_stat", stat: "nektar", value: 10 },
        { 
            text: "Unsere Königin wandelt den Nektar in Honig um", 
            type: "wait_for_stat", 
            stat: "honig", 
            value: 1 
        },
        {
            id: "ende",
            text: "Du bist nun auf dich allein gestellt. Viel Erfolg!",
            type: "click_anywhere",
            onStart: () => {
                // Startet den Meilenstein-Watcher nach dem Tutorial
                StoryEvents.startPostTutorialWatcher();
            }
        }
    ],

    init() {
        this.showStep();
        document.addEventListener("click", (e) => this.handleGlobalClick(e));
    },

    showStep() {
        const step = this.steps[this.currentStep];
        if (!step) return;

        UI.setMessage(step.text);
        if (step.onStart) step.onStart();

        // LOGIK FÜR STAT-PRÜFUNG
        if (step.type === "wait_for_stat") {
            const checkStat = setInterval(() => {
                // Hier ist das entscheidende "at least" (>=)
                // Es prüft: Ist der aktuelle Wert größer oder gleich dem Zielwert?
                if (GameData.stats[step.stat] >= step.value) {
                    clearInterval(checkStat);
                    this.next();
                }
            }, 500);
        }

        if (step.type === "click_or_wait") {
            setTimeout(() => {
                if (this.currentStep === this.steps.indexOf(step)) this.next();
            }, step.duration);
        }
    },

    handleGlobalClick(e) {
        const step = this.steps[this.currentStep];
        if (!step) return;

        if (step.type === "click_anywhere") {
            this.next();
        } else if (step.type === "target_click") {
            if (e.target.closest(`#${step.targetId}`)) {
                this.next();
            } else {
                this.missedClicks++;
                if (this.missedClicks > 3) UI.setMessage("Hier drüben! Klick auf mich!");
            }
        }
    },

    next() {
        this.missedClicks = 0;
        this.currentStep++;
        if (this.currentStep < this.steps.length) {
            this.showStep();
        }
    }
};

// --- StoryEvents - Meilenstein Logik nach dem Tutorial ---

const StoryEvents = {
    milestones: [
        {
            condition: () => GameData.stats.bienen >= 1,
            triggered: false,
            action: () => {
                UI.setMessage("Uih, eine neue Biene!");
                if(UI.showAlert) UI.showAlert("Erfolg: Erster Nachwuchs! 🐝");
            }
        },
        {
            condition: () => window.BuildingUI && BuildingUI.workers.slot1 >= 5,
            triggered: false,
            action: () => {
                UI.setMessage("Ein Team aus 5 Arbeitern im WaxStore? Das geht jetzt fix!");
            }
        }
    ],

    watchStats() {
        this.milestones.forEach(event => {
            if (!event.triggered && event.condition()) {
                event.triggered = true;
                event.action();
            }
        });
    },

    startPostTutorialWatcher() {
        console.log("Tutorial beendet. Meilenstein-Überwachung gestartet.");
        setInterval(() => this.watchStats(), 1000);
    }
};

window.addEventListener("load", () => StoryModule.init());