// sounds.js - Zentrales Sound-Management für Bee-Corp
window.AudioManager = {
    volumes: {
        music: 0.3,
        sfx: 0.5,
        voice: 1.0
    },

    channels: {
        music: new Audio(),
        voice: new Audio()
    },

    sfxCache: {},
    sfxPool: [], // Verwaltet die aktiven SFX-Instanzen (max. 3)

    init() {
        // Sicherstellen, dass der Pfad aus der Config absolut sauber ist
        if (GAME_CONFIG.audio && GAME_CONFIG.audio.bgMusicPath) {
            this.channels.music.src = GAME_CONFIG.audio.bgMusicPath;
        }
        
        this.channels.music.src = GAME_CONFIG.audio.bgMusicPath;
        this.channels.music.loop = true;
        this.updateVolumes();
        
        // Fix für Autoplay: Musik beim ersten Klick starten
        const startAudio = () => {
            if (this.channels.music.paused) {
                this.channels.music.play().catch(() => {});
            }
            document.removeEventListener('click', startAudio);
        };
        document.addEventListener('click', startAudio);

        // Hintergrund-Klick zum Schließen des Modals
        const modal = document.getElementById('sound-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeMenu();
            });
        }
    },

    openMenu() {
        document.getElementById('sound-modal').style.display = 'flex';
    },

    closeMenu() {
        document.getElementById('sound-modal').style.display = 'none';
    },

    toggleMusic() {
        if (this.channels.music.paused) {
            this.channels.music.play().catch(() => {});
        } else {
            this.channels.music.pause();
        }
    },

    preloadSfx(file) {
        if (!this.sfxCache[file]) {
            this.sfxCache[file] = new Audio(`sfx/${file}`);
            this.sfxCache[file].load(); // Erzwingt das Laden in den Browser-Cache
        }
    },

    playSfx(file) {
        if (!this.sfxCache[file]) {
            this.sfxCache[file] = new Audio(`sfx/${file}`);
        }

        // Channel-Management: Wenn mehr als 3 Sounds spielen, stoppe den ältesten
        if (this.sfxPool.length >= 3) {
            const oldest = this.sfxPool.shift();
            oldest.pause();
            oldest.src = ""; // Ressourcen-Cleanup
        }

        // Erstelle eine Instanz für Überlappung
        const instance = this.sfxCache[file].cloneNode();
        instance.volume = this.volumes.sfx;

        // Pitch-Variation: Zufällige Tonhöhe für organischen Sound
        const randomPitch = 0.7 + Math.random() * 0.2;
        instance.playbackRate = randomPitch;

        this.sfxPool.push(instance);
        instance.play().catch(() => {});

        // Nach Ende aus dem Pool entfernen
        instance.onended = () => {
            this.sfxPool = this.sfxPool.filter(s => s !== instance);
        };
    },

    playVoice(file) {
        this.channels.voice.pause();
        this.channels.voice.src = `sfx/${file}`;
        this.channels.voice.volume = this.volumes.voice;
        this.channels.voice.play().catch(() => {});
    },

    setVolume(type, val) {
        this.volumes[type] = parseFloat(val);
        this.updateVolumes();
    },

    updateVolumes() {
        this.channels.music.volume = this.volumes.music;
        this.channels.voice.volume = this.volumes.voice;
        
        // Auch alle aktuell spielenden SFX im Pool anpassen
        this.sfxPool.forEach(instance => instance.volume = this.volumes.sfx);
    }
};

window.addEventListener('DOMContentLoaded', () => window.AudioManager.init());