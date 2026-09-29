const audioManager = {
    soundEnabled: true,
    musicEnabled: true,
    backgroundMusic: null,
    currentMusicTrack: 'fieldsOfVelens',
    sounds: {},
    soundCooldowns: {},
    cooldownTime: 150,
    _musicPlaying: false,
    _wasMusicPlaying: false,
    _savedMusicTrack: 'fieldsOfVelens',

	musicTracks: {
		northern: 'sfx/northern.mp3',
		seadogs: 'sfx/seadogs.mp3',
		glory: 'sfx/glory.mp3',
		wartales: 'sfx/wartales.mp3',
		gosenberg: 'sfx/gosenberg.mp3',
		fieldsOfVelens: 'sfx/fields_of_velens.mp3',
		galvanization: 'sfx/galvanization.mp3',
		arena: 'sfx/arena.mp3'
	},

	battleTracks: ['glory', 'galvanization', 'arena'],
	defaultBattleTrack: 'glory',
	altBattleTracks: ['galvanization', 'arena'],

    init() {
        this.loadSettings();
        this.createAudioElements();
        this.setupEventListeners();
        if (this.musicEnabled) this.playBackgroundMusic();
    },

	loadSettings() {
		try {
			const saved = JSON.parse(localStorage.getItem('gwentSettings') || '{}');
			this.soundEnabled = saved.soundEnabled ?? true;
			this.musicEnabled = saved.musicEnabled ?? true;
			this.currentMusicTrack = saved.musicTrack ?? 'fieldsOfVelens';
			this._savedMusicTrack = this.currentMusicTrack;
		} catch {
			this.currentMusicTrack = 'fieldsOfVelens';
			this._savedMusicTrack = 'fieldsOfVelens';
		}
	},

    saveAudioSettings() {
        try {
            const current = JSON.parse(localStorage.getItem('gwentSettings') || '{}');
            Object.assign(current, {
                soundEnabled: this.soundEnabled,
                musicEnabled: this.musicEnabled,
                musicTrack: this._savedMusicTrack
            });
            localStorage.setItem('gwentSettings', JSON.stringify(current));
        } catch {}
    },

    createAudioElements() {
        this.backgroundMusic = this._createMusicTrack(this.currentMusicTrack);

        const soundFiles = {
            button: 'sfx/button.mp3',
            touch: 'sfx/touch.mp3',
            warning: 'sfx/warning.mp3',
            lock: 'sfx/lock.mp3',
            cardAdd: 'sfx/card_add.mp3',
            cardRemove: 'sfx/card_remove.mp3',
            card_selected: 'sfx/card-selected.mp3',
            card_damage: 'sfx/card_damage.mp3',
            card_boost: 'sfx/card_boost.mp3',
            card_destroy: 'sfx/card_destroy.mp3',
            card_draw: 'sfx/card_draw.mp3',
            weatherFrost: 'sfx/frost.mp3',
            weatherFog: 'sfx/fog.mp3',
            weatherRain: 'sfx/rain.mp3',
            weatherClear: 'sfx/clear.mp3',
            round_start: 'sfx/round_start.mp3',
            coin: 'sfx/coin.mp3',
            win: 'sfx/win.mp3',
            lose: 'sfx/lose.mp3',
            draw: 'sfx/draw.mp3',
            scorch: 'sfx/scorch.mp3',
            card_close: 'sfx/card_close.wav',
            card_range: 'sfx/card_range.wav',
            card_siege: 'sfx/card_siege.wav',
            artefact: 'sfx/artefact.wav'
        };

        for (const [key, src] of Object.entries(soundFiles)) {
            this.sounds[key] = new Audio(src);
            this.sounds[key].volume = ['weatherFrost', 'weatherFog', 'weatherRain'].includes(key) ? 0.4 :
                                      key === 'weatherClear' ? 0.6 : 0.5;
        }
    },

    _createMusicTrack(trackId) {
        const track = new Audio(this.musicTracks[trackId] || this.musicTracks.seadogs);
        track.loop = true;
        track.volume = 0.3;
        return track;
    },

    _switchTrack(trackId, saveToSettings = false) {
        if (trackId === this.currentMusicTrack) return;

        const wasPlaying = this._musicPlaying;

        this.backgroundMusic?.pause();
        this.backgroundMusic = this._createMusicTrack(trackId);
        this.currentMusicTrack = trackId;
        
        if (saveToSettings) {
            this._savedMusicTrack = trackId;
            this.saveAudioSettings();
        }

        if (this.musicEnabled && wasPlaying) {
            this._musicPlaying = true;
            this.backgroundMusic.play().catch(() => {});
        }
    },

    changeMusicTrack(trackId) { this._switchTrack(trackId, true); },
    
	setBattleMusic() {
		if (!this.musicEnabled || this.battleTracks.includes(this.currentMusicTrack)) return;

		const pool = this.currentMusicTrack === 'seadogs'
			? [this.defaultBattleTrack]
			: this.altBattleTracks;
		const battleTrack = pool[Math.floor(Math.random() * pool.length)];
		this._switchTrack(battleTrack, false);
	},

	restoreSavedMusic() {
		if (this.musicEnabled && this.battleTracks.includes(this.currentMusicTrack)) {
			this._switchTrack(this._savedMusicTrack, false);
		}
	},

    setupEventListeners() {
        ['click', 'touchstart', 'keydown'].forEach(event => {
            document.addEventListener(event, () => {
                if (this.musicEnabled && this.backgroundMusic?.paused) {
                    this.playBackgroundMusic();
                }
            }, { once: true });
        });
    },

    playBackgroundMusic() {
        if (this.backgroundMusic && this.musicEnabled) {
            this._musicPlaying = true;
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic.play().catch(() => {});
        }
    },

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this._musicPlaying = false;
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    },

    resumeBackgroundMusic() {
        if (this.musicEnabled && !this._musicPlaying && this.backgroundMusic) {
            this._musicPlaying = true;
            this.backgroundMusic.play().catch(() => {});
        }
    },

    isMusicPlaying() { return this._musicPlaying; },

    playSound(soundName) {
        if (!this.soundEnabled || !this.sounds[soundName]) return;

        const now = Date.now();
        if (this.soundCooldowns[soundName] && now - this.soundCooldowns[soundName] < this.cooldownTime) return;
        this.soundCooldowns[soundName] = now;

        const sound = this.sounds[soundName].cloneNode();
        sound.volume = this.sounds[soundName].volume;
        sound.play().catch(() => {});
    },

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.saveAudioSettings();
        return this.soundEnabled;
    },

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        this.saveAudioSettings();
        this.musicEnabled ? this.playBackgroundMusic() : this.stopBackgroundMusic();
        return this.musicEnabled;
    },

    setMusicVolume(volume) {
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = Math.max(0, Math.min(1, volume));
        }
    },

    setSoundVolume(volume) {
        const newVolume = Math.max(0, Math.min(1, volume));
        Object.values(this.sounds).forEach(sound => sound.volume = newVolume);
    },

    playWeatherSound(weatherType) {
        if (!this.soundEnabled) return;

        const weatherSounds = { frost: 'weatherFrost', fog: 'weatherFog', rain: 'weatherRain', clear: 'weatherClear' };
        const sound = this.sounds[weatherSounds[weatherType]];
        if (sound) {
            const clone = sound.cloneNode();
            clone.volume = sound.volume;
            clone.play().catch(() => {});
        }
    },

    getCurrentMusicTrack() { return this.currentMusicTrack; },

	getMusicTrackDisplayName() {
		const names = {
			northern: 'Northern Realms',
			seadogs: 'Sea Dogs',
			glory: 'Battle Theme',
			wartales: 'Wartales',
			gosenberg: 'Gosenberg',
			fieldsOfVelens: 'Fields of Velens',
			galvanization: 'Galvanization',
			arena: 'Arena'
		};
		return names[this.currentMusicTrack] || 'Sea Dogs';
	},
};

window.addEventListener('load', () => audioManager.init());
window.audioManager = audioManager;