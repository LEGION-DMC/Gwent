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
        musicTrack: 'fieldsOfVelens'
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
		fieldsOfVelens: 'Fields of Velens',
		KaerMorhen: 'Kaer Morhen',
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
				<div class="settings-control" style="flex-direction: column; align-items: stretch; gap: 10px;">
					<div style="display: flex; justify-content: space-between; align-items: center;">
						<div class="settings-control__label">Фоновая музыка</div>
						<div class="settings-control__buttons">
							<button class="settings-control__btn ${musicEnabled ? 'active' : ''}" data-action="musicOn">♬</button>
							<button class="settings-control__btn ${!musicEnabled ? 'active' : ''}" data-action="musicOff">✖</button>
						</div>
					</div>
					<div class="settings-control__divider"></div>
					<div class="music-track-selector">
						<button class="music-track-arrow" data-action="prevTrack">&lt;</button>
						<div class="music-track-name">
							<span class="music-track-text">${trackNames[musicTrack] || 'Sea Dogs'}</span>
						</div>
						<button class="music-track-arrow" data-action="nextTrack">&gt;</button>
					</div>
					<div class="settings-control__divider"></div>
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
						<div class="settings-dropdown" data-dropdown="cardDisplayMode">
							<div class="settings-dropdown-selected">
								<span class="settings-dropdown-label">
									${cardDisplayMode === 'static' ? 'Статические' : 'Анимированные'}
								</span>
								<span class="settings-dropdown-arrow">▾</span>
							</div>
							<div class="settings-dropdown-list">
								<div class="settings-dropdown-option ${cardDisplayMode === 'static' ? 'active' : ''}" data-value="static">Статические</div>
								<div class="settings-dropdown-option ${cardDisplayMode === 'animated' ? 'active' : ''}" data-value="animated">Анимированные</div>
							</div>
						</div>
					</div>
				</div>
				<div class="settings-control">
					<div class="settings-control__label">Режим игры</div>
					<div class="settings-control__buttons">
						<div class="settings-dropdown" data-dropdown="gameMode">
							<div class="settings-dropdown-selected">
								<span class="settings-dropdown-label">
									${gameMode === 'classic' ? 'Классический' : 'CD Project Red'}
								</span>
								<span class="settings-dropdown-arrow">▾</span>
							</div>
							<div class="settings-dropdown-list">
								<div class="settings-dropdown-option ${gameMode === 'classic' ? 'active' : ''}" data-value="classic">Классический</div>
								<div class="settings-dropdown-option ${gameMode === 'cdpred' ? 'active' : ''}" data-value="cdpred">CD Project Red</div>
							</div>
						</div>
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
	const tracks = ['fieldsOfVelens', 'KaerMorhen', 'gosenberg', 'wartales', 'northern', 'seadogs'];
	const trackNames = {
		northern: 'Northern Realms',
		seadogs: 'Sea Dogs',
		wartales: 'Wartales',
		gosenberg: 'Gosenberg',
		fieldsOfVelens: 'Fields of Velens',
		KaerMorhen: 'Kaer Morhen',
	};
    let currentTrackIndex = Math.max(0, tracks.indexOf(settingsModule.settings.musicTrack));

	// ===== Кастомные выпадающие списки =====
	const dropdownHandlers = {
		cardDisplayMode: (value) => {
			settingsModule.setCardDisplayMode(value);
		},
		gameMode: (value) => {
			settingsModule.setGameMode(value);
		}
	};

	overlay.querySelectorAll('.settings-dropdown').forEach(dropdown => {
		const key = dropdown.dataset.dropdown;
		const selected = dropdown.querySelector('.settings-dropdown-selected');
		const label = dropdown.querySelector('.settings-dropdown-label');
		const options = dropdown.querySelectorAll('.settings-dropdown-option');

		// Открытие/закрытие
		selected.addEventListener('click', (e) => {
			e.stopPropagation();

			// Закрываем все остальные дропдауны
			overlay.querySelectorAll('.settings-dropdown').forEach(d => {
				if (d !== dropdown) d.classList.remove('open');
			});

			dropdown.classList.toggle('open');
			audioManager.playSound('button');
		});

		selected.addEventListener('mouseenter', () => audioManager.playSound('touch'));

		// Выбор опции
		options.forEach(opt => {
			opt.addEventListener('click', (e) => {
				e.stopPropagation();
				const value = opt.dataset.value;

				options.forEach(o => o.classList.remove('active'));
				opt.classList.add('active');

				label.textContent = opt.textContent;

				dropdown.classList.remove('open');

				dropdownHandlers[key]?.(value);

				audioManager.playSound('button');
			});

			opt.addEventListener('mouseenter', () => audioManager.playSound('touch'));
		});
	});

	// Клик вне любого дропдауна — закрыть все
	const closeAllDropdowns = (e) => {
		if (!e.target.closest('.settings-dropdown')) {
			overlay.querySelectorAll('.settings-dropdown').forEach(d => d.classList.remove('open'));
		}
	};
	overlay.addEventListener('click', closeAllDropdowns);

	const closeModal = () => {
		overlay.classList.remove('active');
		setTimeout(() => {
			overlay.remove();
			document.removeEventListener('keydown', overlay._escapeHandler);
			document.removeEventListener('fullscreenchange', overlay._fullscreenHandler);
			overlay.removeEventListener('click', closeAllDropdowns);
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

    overlay._escapeHandler = (e) => e.key === 'Escape' && closeModal();
    overlay._fullscreenHandler = () => updateUI();
    
    document.addEventListener('keydown', overlay._escapeHandler);
    document.addEventListener('fullscreenchange', overlay._fullscreenHandler);
    
    updateUI();
}

window.fullscreenManager = fullscreenAPI;
document.addEventListener('DOMContentLoaded', () => settingsModule.init());