const audioManager = {
    soundEnabled: true,
    musicEnabled: true,
    backgroundMusic: null,
    sounds: {},
    isFirstInteractionHandled: false,
    
    init: function() {
        this.createAudioElements();
        this.loadSettings();
        this.setupEventListeners();
    },
    
    createAudioElements: function() {
        this.backgroundMusic = new Audio('sfx/fon.mp3');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.3;
        
        const soundFiles = {
            button: 'sfx/button.mp3',
            transition: 'sfx/transition.mp3',
            choice: 'sfx/choice.mp3',
            touch: 'sfx/touch.mp3',
            cardAdd: 'sfx/card_add.mp3',
            cardRemove: 'sfx/card_remove.mp3',
            weatherFrost: 'sfx/frost.mp3',
            weatherFog: 'sfx/fog.mp3',
            weatherRain: 'sfx/rain.mp3',
            weatherClear: 'sfx/clear.mp3'
        };
        
        for (const [key, src] of Object.entries(soundFiles)) {
            this.sounds[key] = new Audio(src);
            this.sounds[key].volume = 0.5;
        }
        
        this.sounds.weatherFrost.volume = 0.4;
        this.sounds.weatherFog.volume = 0.4;
        this.sounds.weatherRain.volume = 0.4;
        this.sounds.weatherClear.volume = 0.6;
    },
    
    loadSettings: function() {
        const soundSetting = localStorage.getItem('soundEnabled');
        const musicSetting = localStorage.getItem('musicEnabled');       
        if (soundSetting !== null) this.soundEnabled = JSON.parse(soundSetting);
        if (musicSetting !== null) this.musicEnabled = JSON.parse(musicSetting);
    },
    
    saveSettings: function() {
        localStorage.setItem('soundEnabled', JSON.stringify(this.soundEnabled));
        localStorage.setItem('musicEnabled', JSON.stringify(this.musicEnabled));
    },
    
    setupEventListeners: function() {
        const handler = () => this.handleFirstInteraction();
        ['click', 'touchstart', 'keydown'].forEach(event => {
            document.addEventListener(event, handler, { once: false });
        });
    },
    
    handleFirstInteraction: function() {
        if (this.isFirstInteractionHandled) return;
        this.isFirstInteractionHandled = true;
        if (this.musicEnabled && this.backgroundMusic.paused) {
            this.playBackgroundMusic();
        }
    },
    
    playBackgroundMusic: function() {
        if (this.backgroundMusic && this.musicEnabled) {
            this.backgroundMusic.currentTime = 0;
            const playPromise = this.backgroundMusic.play();
            if (playPromise !== undefined) playPromise.catch(() => {});
        }
    },
    
    stopBackgroundMusic: function() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    },
    
    playSound: function(soundName) {
        if (!this.soundEnabled || !this.sounds[soundName]) return;
        const sound = this.sounds[soundName].cloneNode();
        sound.volume = this.sounds[soundName].volume;
        sound.play().catch(() => {});
    },
    
    toggleSound: function() {
        this.soundEnabled = !this.soundEnabled;
        this.saveSettings();
        return this.soundEnabled;
    },
    
    toggleMusic: function() {
        this.musicEnabled = !this.musicEnabled;
        this.saveSettings();
        this.musicEnabled ? this.playBackgroundMusic() : this.stopBackgroundMusic();
        return this.musicEnabled;
    },
    
    setMusicVolume: function(volume) {
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = Math.max(0, Math.min(1, volume));
        }
    },
    
    setSoundVolume: function(volume) {
        const newVolume = Math.max(0, Math.min(1, volume));
        Object.values(this.sounds).forEach(sound => {
            sound.volume = newVolume;
        });
    },
    
    playWeatherSound: function(weatherType) {
        if (!this.soundEnabled) return;
        const weatherSounds = {
            'frost': this.sounds.weatherFrost,
            'fog': this.sounds.weatherFog,
            'rain': this.sounds.weatherRain,
            'clear': this.sounds.weatherClear
        };
        const sound = weatherSounds[weatherType];
        if (sound) {
            const weatherSound = sound.cloneNode();
            weatherSound.volume = sound.volume;
            weatherSound.play().catch(() => {});
        }
    }
};

window.addEventListener('load', () => {
    audioManager.init();
    setTimeout(() => {
        if (audioManager.musicEnabled) audioManager.playBackgroundMusic();
    }, 100);
});

window.audioManager = audioManager;