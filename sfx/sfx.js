const audioManager = {
    soundEnabled: true,
    musicEnabled: true,
    backgroundMusic: null,
    sounds: {},
    
    init: function() {
        this.createAudioElements();
        this.loadSettings();
        this.setupEventListeners();
    },
    
    createAudioElements: function() {
        // Фоновая музыка
        this.backgroundMusic = new Audio('sfx/fon.mp3');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.3;
        this.backgroundMusic.preload = 'auto';
        
        // Звуковые эффекты
        this.sounds = {
            button: new Audio('sfx/button.mp3'),
            transition: new Audio('sfx/transition.mp3'),
            choice: new Audio('sfx/choice.mp3'),
            touch: new Audio('sfx/touch.mp3'),
            cardAdd: new Audio('sfx/card_add.mp3'),
            cardRemove: new Audio('sfx/card_remove.mp3'),
            weatherFrost: new Audio('sfx/frost.mp3'),
            weatherFog: new Audio('sfx/fog.mp3'),
            weatherRain: new Audio('sfx/rain.mp3'),
            weatherClear: new Audio('sfx/clear.mp3')
        };
        
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.5;
            sound.preload = 'auto';
        });
        
        // Особые настройки для звуков погоды
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
        document.addEventListener('click', this.handleFirstInteraction.bind(this), { once: true });
    },
    
    handleFirstInteraction: function() {
        if (this.musicEnabled) {
            this.playBackgroundMusic();
        }
    },
    
    playBackgroundMusic: function() {
        if (this.backgroundMusic && this.musicEnabled) {
            this.backgroundMusic.play().catch(e => {
                console.log('Автовоспроизведение музыки заблокировано:', e);
            });
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
        
        try {
            const sound = this.sounds[soundName].cloneNode();
            sound.volume = 0.5;
            sound.play().catch(e => {
                console.log('Ошибка воспроизведения звука:', soundName, e);
            });
        } catch (e) {
            console.log('Ошибка клонирования звука:', soundName, e);
        }
    },
    
    toggleSound: function() {
        this.soundEnabled = !this.soundEnabled;
        this.saveSettings();
        return this.soundEnabled;
    },
    
    toggleMusic: function() {
        this.musicEnabled = !this.musicEnabled;
        this.saveSettings();
        
        if (this.musicEnabled) {
            this.playBackgroundMusic();
        } else {
            this.stopBackgroundMusic();
        }
        
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
        
        const soundMap = {
            'frost': this.sounds.weatherFrost,
            'fog': this.sounds.weatherFog,
            'rain': this.sounds.weatherRain,
            'clear': this.sounds.weatherClear
        };
        
        const sound = soundMap[weatherType];
        if (sound) {
            try {
                const weatherSound = sound.cloneNode();
                weatherSound.volume = sound.volume;
                weatherSound.play().catch(e => {
                    console.log('Ошибка воспроизведения звука погоды:', weatherType, e);
                });
            } catch (e) {
                console.log('Ошибка клонирования звука погоды:', weatherType, e);
            }
        }
    },
};

document.addEventListener('DOMContentLoaded', function() {
    audioManager.init();
});

window.audioManager = audioManager;