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
	_battleTrackQueue: [],

	musicTracks: {
		fieldsOfVelens: 'sfx/music/Fields Of Velens.mp3',
		KaerMorhen: 'sfx/music/Kaer Morhen.mp3',
		gosenberg: 'sfx/music/gosenberg.mp3',
		wartales: 'sfx/music/wartales.mp3',
		northern: 'sfx/music/northern.mp3',
		seadogs: 'sfx/music/seadogs.mp3',
		
		SteelForHumans: 'sfx/music/Steel for Humans.mp3',
		DrinkUp: 'sfx/music/Drink Up.mp3',
		glory: 'sfx/music/glory.mp3',
		galvanization: 'sfx/music/galvanization.mp3',
		arena: 'sfx/music/arena.mp3'
	},

	battleTracks: ['SteelForHumans', 'DrinkUp', 'glory', 'galvanization', 'arena'],
	defaultBattleTrack: 'glory',
	altBattleTracks: ['SteelForHumans', 'DrinkUp', 'galvanization', 'arena'],

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
		button: 'sfx/sound/button.mp3',
		touch: 'sfx/sound/touch.mp3',
		warning: 'sfx/sound/warning.mp3',
		lock: 'sfx/sound/lock.mp3',
		cardAdd: 'sfx/sound/card_add.mp3',
		cardRemove: 'sfx/sound/card_remove.mp3',
		card_selected: 'sfx/sound/card-selected.mp3',
		card_damage: 'sfx/sound/card_damage.mp3',
		card_boost: 'sfx/sound/card_boost.mp3',
		card_destroy: 'sfx/sound/card_destroy.mp3',
		card_draw: 'sfx/sound/card_draw.mp3',
		weatherFrost: 'sfx/sound/frost.mp3',
		weatherFog: 'sfx/sound/fog.mp3',
		weatherRain: 'sfx/sound/rain.mp3',
		weatherClear: 'sfx/sound/clear.mp3',
		round_start: 'sfx/sound/round_start.mp3',
		coin: 'sfx/sound/coin.mp3',
		win: 'sfx/sound/win.mp3',
		lose: 'sfx/sound/lose.mp3',
		draw: 'sfx/sound/draw.mp3',
		scorch: 'sfx/sound/scorch.mp3',
		card_close: 'sfx/sound/card_close.wav',
		card_range: 'sfx/sound/card_range.wav',
		card_siege: 'sfx/sound/card_siege.wav',
		artefact: 'sfx/sound/artefact.wav'
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

		// Формируем список боевых треков для текущей сессии
		const pool = this.currentMusicTrack === 'seadogs'
			? [this.defaultBattleTrack]
			: [...this.battleTracks]; // или this.altBattleTracks, если нужно

		// Если очередь пуста — заполняем и перемешиваем
		if (this._battleTrackQueue.length === 0) {
			this._battleTrackQueue = this._shuffleArray([...pool]);
		}

		// Если в очереди остались треки из старого пула (например, сменился seadogs),
		// фильтруем по актуальному pool
		this._battleTrackQueue = this._battleTrackQueue.filter(t => pool.includes(t));

		// Если после фильтрации пусто — перезаполняем
		if (this._battleTrackQueue.length === 0) {
			this._battleTrackQueue = this._shuffleArray([...pool]);
		}

		// Не даём сыграть тот же трек, что играет сейчас (если есть альтернативы)
		let battleTrack = this._battleTrackQueue.shift();

		if (battleTrack === this.currentMusicTrack && this._battleTrackQueue.length > 0) {
			// Вернём текущий в конец и возьмём следующий
			this._battleTrackQueue.push(battleTrack);
			battleTrack = this._battleTrackQueue.shift();
		}

		this._switchTrack(battleTrack, false);
	},

	_shuffleArray(arr) {
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
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
			KaerMorhen: 'Kaer Morhen',
			DrinkUp: 'Drink Up',
			SteelForHumans: 'Steel for Humans',
			arena: 'Arena'
		};
		return names[this.currentMusicTrack] || 'Sea Dogs';
	},
};

window.addEventListener('load', () => audioManager.init());
window.audioManager = audioManager;