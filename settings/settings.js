document.addEventListener('contextmenu', function(e) {
    let isCard = e.target.closest('.card, .collection-card, .deck-card');
    
    if (!isCard) {
        e.preventDefault();
        return false;
    }
});

const settingsModule = {
    settings: {
        soundEnabled: true,
        musicEnabled: true,
        cardDisplayMode: 'static',
        gameMode: 'cdpred',
        musicTrack: 'seadogs'
    },
    _musicFirstInit: true,
    _storageKey: 'gwentSettings',

    init() {
        this.loadSettings();
        this.applyAudioSettings();
        this._musicFirstInit = false;
    },

    loadSettings() {
        try {
            const saved = localStorage.getItem(this._storageKey);
            if (saved) Object.assign(this.settings, JSON.parse(saved));
        } catch {}
    },

    saveSettings() {
        try {
            localStorage.setItem(this._storageKey, JSON.stringify(this.settings));
            this.applyAudioSettings();
            this.notifySettingsChange();
        } catch {}
    },

	applyAudioSettings() {
		const am = window.audioManager;
		if (!am) return;

		am.soundEnabled = this.settings.soundEnabled;
		am.musicEnabled = this.settings.musicEnabled;

		const battleTracks = am.battleTracks || ['glory'];
		if (am.currentMusicTrack !== this.settings.musicTrack && !battleTracks.includes(am.currentMusicTrack)) {
			am.changeMusicTrack(this.settings.musicTrack);
		}

		if (this.settings.musicEnabled) {
			if (this._musicFirstInit) {
				am.playBackgroundMusic();
			} else if (!am._wasMusicPlaying && !am._musicPlaying) {
				am.resumeBackgroundMusic?.();
			}
		} else {
			am._wasMusicPlaying = am.isMusicPlaying?.() ?? false;
			am.stopBackgroundMusic();
		}
	},

    notifySettingsChange() {
        window.gameModule?.onSettingsChange?.(this.settings);
        window.deckModule?.onSettingsChange?.(this.settings);
    },

    getCardDisplayMode() { return this.settings.cardDisplayMode; },
    setCardDisplayMode(mode) { this.settings.cardDisplayMode = mode; this.saveSettings(); },
    getGameMode() { return this.settings.gameMode; },
    setGameMode(mode) { this.settings.gameMode = mode; this.saveSettings(); },
    getMusicTrack() { return this.settings.musicTrack; },
    setMusicTrack(track) {
        if (this.settings.musicTrack !== track) {
            this.settings.musicTrack = track;
            this.saveSettings();
        }
    }
};

window.settingsModule = settingsModule;

const fullscreenAPI = {
    enter() {
        const el = document.documentElement;
        (el.requestFullscreen || el.mozRequestFullScreen || el.webkitRequestFullscreen || el.msRequestFullscreen)?.call(el);
    },
    exit() {
        (document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen)?.call(document);
    },
    isActive() {
        return !!(document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
    }
};

function showSettingsModal() {
    const overlay = document.createElement('div');
    overlay.className = 'settings-modal-overlay';
    
    const { soundEnabled, musicEnabled } = audioManager;
    const { cardDisplayMode, gameMode, musicTrack } = settingsModule.settings;
    const isFullscreen = fullscreenAPI.isActive();

	const trackNames = {
		northern: 'Northern Realms',
		seadogs: 'Sea Dogs',
		wartales: 'Wartales',
		gosenberg: 'Gosenberg',
		fieldsOfVelens: 'Fields of Velens'
	};

    overlay.innerHTML = `
        <div class="settings-modal">
            <div class="settings-modal__title">НАСТРОЙКИ</div>
            <div class="settings-controls">
                <div class="settings-title">ЗВУК</div>
                <div class="settings-control">
                    <div class="settings-control__label">Звуковые эффекты</div>
                    <div class="settings-control__buttons">
                        <button class="settings-control__btn ${soundEnabled ? 'active' : ''}" data-action="soundOn">🕪</button>
                        <button class="settings-control__btn ${!soundEnabled ? 'active' : ''}" data-action="soundOff">✖</button>
                    </div>
                </div>
                <div class="settings-control">
                    <div class="settings-control__label">Фоновая музыка</div>
                    <div class="settings-control__buttons">
                        <button class="settings-control__btn ${musicEnabled ? 'active' : ''}" data-action="musicOn">♬</button>
                        <button class="settings-control__btn ${!musicEnabled ? 'active' : ''}" data-action="musicOff">✖</button>
                    </div>
                </div>
                <div class="settings-control" style="justify-content: center;">
                    <div class="settings-control__buttons" style="width: 100%; display: flex; justify-content: center;">
                        <div class="music-track-selector">
                            <button class="music-track-arrow" data-action="prevTrack">&lt;</button>
                            <div class="music-track-name">
                                <span class="music-track-text">${trackNames[musicTrack] || 'Sea Dogs'}</span>
                            </div>
                            <button class="music-track-arrow" data-action="nextTrack">&gt;</button>
                        </div>
                    </div>
                </div>
                <div class="settings-title">ГРАФИКА</div>
                <div class="settings-control">
                    <div class="settings-control__label">Режим экрана</div>
                    <div class="settings-control__buttons">
                        <button class="settings-control__btn ${!isFullscreen ? 'active' : ''}" data-action="fullscreenOff">❐</button>
                        <button class="settings-control__btn ${isFullscreen ? 'active' : ''}" data-action="fullscreenOn">⛶</button>
                    </div>
                </div>
                <div class="settings-control">
                    <div class="settings-control__label">Вид карт</div>
                    <div class="settings-control__buttons">
                        <select class="settings-select" data-action="cardDisplayMode">
                            <option value="static" ${cardDisplayMode === 'static' ? 'selected' : ''}>Статические</option>
                            <option value="animated" ${cardDisplayMode === 'animated' ? 'selected' : ''}>Анимированные</option>
                        </select>
                    </div>
                </div>
                <div class="settings-title">ИГРА</div>
                <div class="settings-control">
                    <div class="settings-control__label">Режим игры</div>
                    <div class="settings-control__buttons">
                        <select class="settings-select" data-action="gameMode">
                            <option value="classic" ${gameMode === 'classic' ? 'selected' : ''}>Классический</option>
                            <option value="cdpred" ${gameMode === 'cdpred' ? 'selected' : ''}>CD Project Red</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('active'));
    setupModalEvents(overlay);
}

function setupModalEvents(overlay) {
	const tracks = ['fieldsOfVelens', 'gosenberg', 'wartales', 'northern', 'seadogs',];
	const trackNames = {
		northern: 'Northern Realms',
		seadogs: 'Sea Dogs',
		wartales: 'Wartales',
		gosenberg: 'Gosenberg',
		fieldsOfVelens: 'Fields of Velens'
	};
    let currentTrackIndex = Math.max(0, tracks.indexOf(settingsModule.settings.musicTrack));

    const closeModal = () => {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
            document.removeEventListener('keydown', overlay._escapeHandler);
            document.removeEventListener('fullscreenchange', overlay._fullscreenHandler);
        }, 300);
        audioManager.playSound('button');
    };

    const updateUI = () => {
        const { soundEnabled, musicEnabled } = audioManager;
        const isFull = fullscreenAPI.isActive();

        overlay.querySelector('[data-action="soundOn"]')?.classList.toggle('active', soundEnabled);
        overlay.querySelector('[data-action="soundOff"]')?.classList.toggle('active', !soundEnabled);
        overlay.querySelector('[data-action="musicOn"]')?.classList.toggle('active', musicEnabled);
        overlay.querySelector('[data-action="musicOff"]')?.classList.toggle('active', !musicEnabled);
        overlay.querySelector('[data-action="fullscreenOn"]')?.classList.toggle('active', isFull);
        overlay.querySelector('[data-action="fullscreenOff"]')?.classList.toggle('active', !isFull);
    };

    const actions = {
        soundOn: () => !audioManager.soundEnabled && toggleSetting('sound'),
        soundOff: () => audioManager.soundEnabled && toggleSetting('sound'),
        musicOn: () => !audioManager.musicEnabled && toggleSetting('music'),
        musicOff: () => audioManager.musicEnabled && toggleSetting('music'),
        fullscreenOn: () => !fullscreenAPI.isActive() && fullscreenAPI.enter(),
        fullscreenOff: () => fullscreenAPI.isActive() && fullscreenAPI.exit(),
        prevTrack: () => changeTrack(-1),
        nextTrack: () => changeTrack(1)
    };

    const toggleSetting = (type) => {
        const method = type === 'sound' ? 'toggleSound' : 'toggleMusic';
        audioManager[method]();
        settingsModule.settings[`${type}Enabled`] = audioManager[`${type}Enabled`];
        settingsModule.saveSettings();
        updateUI();
        audioManager.playSound('button');
    };

    const changeTrack = (direction) => {
        currentTrackIndex = (currentTrackIndex + direction + tracks.length) % tracks.length;
        const newTrack = tracks[currentTrackIndex];
        const trackText = overlay.querySelector('.music-track-text');

        if (trackText) {
            trackText.classList.add(direction === 1 ? 'slide-left' : 'slide-right');
            setTimeout(() => {
                trackText.textContent = trackNames[newTrack];
                trackText.classList.remove(direction === 1 ? 'slide-left' : 'slide-right');
            }, 150);
        }

        audioManager.changeMusicTrack(newTrack);
        settingsModule.setMusicTrack(newTrack);
        audioManager.playSound('button');
    };

    overlay.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (btn) {
            actions[btn.dataset.action]?.();
        } else if (e.target === overlay) {
            closeModal();
        }
    });

    overlay.querySelector('[data-action="cardDisplayMode"]')?.addEventListener('change', (e) => {
        settingsModule.setCardDisplayMode(e.target.value);
        audioManager.playSound('button');
    });

    overlay.querySelector('[data-action="gameMode"]')?.addEventListener('change', (e) => {
        settingsModule.setGameMode(e.target.value);
        audioManager.playSound('button');
    });

    overlay._escapeHandler = (e) => e.key === 'Escape' && closeModal();
    overlay._fullscreenHandler = () => updateUI();
    
    document.addEventListener('keydown', overlay._escapeHandler);
    document.addEventListener('fullscreenchange', overlay._fullscreenHandler);
    
    updateUI();
}

window.fullscreenManager = fullscreenAPI;
document.addEventListener('DOMContentLoaded', () => settingsModule.init());