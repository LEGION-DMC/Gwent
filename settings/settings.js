const settingsModule = {
    settings: {
        soundEnabled: true,
        musicEnabled: true,
        cardDisplayMode: 'static' ,
        gameMode: 'classic'
    },

    init: function() {
        this.loadSettings();
        this.applySettings();
    },

    loadSettings: function() {
        const savedSettings = localStorage.getItem('gwentSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
        
        // Синхронизируем с audioManager
        if (window.audioManager) {
            audioManager.soundEnabled = this.settings.soundEnabled;
            audioManager.musicEnabled = this.settings.musicEnabled;
        }
    },

    saveSettings: function() {
        localStorage.setItem('gwentSettings', JSON.stringify(this.settings));
        this.applySettings();
        this.notifySettingsChange();
    },

    applySettings: function() {
        // Применяем настройку вида карт
        const cardDisplayMode = document.getElementById('cardDisplayMode');
        if (cardDisplayMode) {
            cardDisplayMode.value = this.settings.cardDisplayMode;
        }
        
        // Применяем настройку режима игры
        const gameMode = document.getElementById('gameMode');
        if (gameMode) {
            gameMode.value = this.settings.gameMode;
        }
    },

    notifySettingsChange: function() {
        // Уведомляем gameModule об изменении настроек
        if (window.gameModule && window.gameModule.onSettingsChange) {
            window.gameModule.onSettingsChange(this.settings);
        }
        
        // Уведомляем deckModule об изменении настроек
        if (window.deckModule && window.deckModule.onSettingsChange) {
            window.deckModule.onSettingsChange(this.settings);
        }
    },

    getCardDisplayMode: function() {
        return this.settings.cardDisplayMode;
    },

    setCardDisplayMode: function(mode) {
        this.settings.cardDisplayMode = mode;
        this.saveSettings();
    },

    getGameMode: function() {
        return this.settings.gameMode;
    },

    setGameMode: function(mode) {
        this.settings.gameMode = mode;
        this.saveSettings();
    }
};

window.settingsModule = settingsModule;

// ОБНОВИТЕ функцию showSettingsModal
function showSettingsModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'settings-modal-overlay';
    
    // Получаем текущее состояние полноэкранного режима
    const isFullscreenActive = window.fullscreenManager && window.fullscreenManager.isFullscreen();
    
    // Получаем текущую настройку вида карт
    const currentCardMode = settingsModule.getCardDisplayMode();
    const currentGameMode = settingsModule.getGameMode();
    
    modalOverlay.innerHTML = `
        <div class="settings-modal">
            <div class="settings-modal__title">НАСТРОЙКИ</div>
            <div class="settings-controls">
			<div class="settings-title">ЗВУК</div>
                <div class="settings-control">
                    <div class="settings-control__label">Звуковые эффекты</div>
                    <div class="settings-control__buttons">
                        <button class="settings-control__btn ${audioManager.soundEnabled ? 'active' : ''}" 
                                id="modalSoundOn" title="Включить звуковые эффекты">
                            🕪
                        </button>
                        <button class="settings-control__btn ${!audioManager.soundEnabled ? 'active' : ''}" 
                                id="modalSoundOff" title="Выключить звуковые эффекты">
                            ✖
                        </button>
                    </div>
                </div>
                <div class="settings-control">
                    <div class="settings-control__label">Фоновая музыка</div>
                    <div class="settings-control__buttons">
                        <button class="settings-control__btn ${audioManager.musicEnabled ? 'active' : ''}" 
                                id="modalMusicOn" title="Включить фоновую музыку">
                            ♬
                        </button>
                        <button class="settings-control__btn ${!audioManager.musicEnabled ? 'active' : ''}" 
                                id="modalMusicOff" title="Выключить фоновую музыку">
                            ✖
                        </button>
                    </div>
                </div>
				<div class="settings-title">ГРАФИКА</div>
                <div class="settings-control">
                    <div class="settings-control__label">Режим экрана</div>
                    <div class="settings-control__buttons">
                        <button class="settings-control__btn ${!isFullscreenActive ? 'active' : ''}" 
                                id="modalFullscreenOff" title="Оконный режим">
                            ❐
                        </button>
                        <button class="settings-control__btn ${isFullscreenActive ? 'active' : ''}" 
                                id="modalFullscreenOn" title="Полноэкранный режим">
                            ⛶
                        </button>
                    </div>
                </div>
                <div class="settings-control">
                    <div class="settings-control__label">Вид карт</div>
                    <div class="settings-control__buttons">
                        <select id="cardDisplayMode" class="settings-select">
                            <option value="static" ${currentCardMode === 'static' ? 'selected' : ''}>Статические</option>
                            <option value="animated" ${currentCardMode === 'animated' ? 'selected' : ''}>Анимированные</option>
                        </select>
                    </div>
                </div>
				<div class="settings-title">ИГРА</div>
                <div class="settings-control">
                    <div class="settings-control__label">Режим игры</div>
                    <div class="settings-control__buttons">
                        <select id="gameMode" class="settings-select">
                            <option value="classic" ${currentGameMode === 'classic' ? 'selected' : ''}>Классический</option>
                            <option value="cdpred" ${currentGameMode === 'cdpred' ? 'selected' : ''} style="cursor: url('../ui/cursor_hover.png'), pointer !important;">CD Project Red</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalOverlay);
    
    setTimeout(() => {
        modalOverlay.classList.add('active');
    }, 10);
    
    setupSettingsModalEventListeners(modalOverlay);
}

// ОБНОВИТЕ функцию setupSettingsModalEventListeners
function setupSettingsModalEventListeners(modalOverlay) {
    // Обработчики для звука
    document.getElementById('modalSoundOn').addEventListener('click', () => {
        if (!audioManager.soundEnabled) {
            audioManager.toggleSound();
            settingsModule.settings.soundEnabled = audioManager.soundEnabled;
            settingsModule.saveSettings();
            updateSettingsButtons();
            audioManager.playSound('button');
        }
    });
    
    document.getElementById('modalSoundOff').addEventListener('click', () => {
        if (audioManager.soundEnabled) {
            audioManager.toggleSound();
            settingsModule.settings.soundEnabled = audioManager.soundEnabled;
            settingsModule.saveSettings();
            updateSettingsButtons();
            audioManager.playSound('button');
        }
    });
    
    // Обработчики для музыки
    document.getElementById('modalMusicOn').addEventListener('click', () => {
        if (!audioManager.musicEnabled) {
            audioManager.toggleMusic();
            settingsModule.settings.musicEnabled = audioManager.musicEnabled;
            settingsModule.saveSettings();
            updateSettingsButtons();
            audioManager.playSound('button');
        }
    });
	
    document.getElementById('modalMusicOff').addEventListener('click', () => {
        if (audioManager.musicEnabled) {
            audioManager.toggleMusic();
            settingsModule.settings.musicEnabled = audioManager.musicEnabled;
            settingsModule.saveSettings();
            updateSettingsButtons();
            audioManager.playSound('button');
        }
    });
    
    // Обработчики для полноэкранного режима
    document.getElementById('modalFullscreenOn').addEventListener('click', () => {
        if (window.fullscreenManager && !window.fullscreenManager.isFullscreen()) {
            window.fullscreenManager.enterFullscreen();
            updateSettingsButtons();
            audioManager.playSound('button');
        }
    });
    
    document.getElementById('modalFullscreenOff').addEventListener('click', () => {
        if (window.fullscreenManager && window.fullscreenManager.isFullscreen()) {
            window.fullscreenManager.exitFullscreen();
            updateSettingsButtons();
            audioManager.playSound('button');
        }
    });
    
    // ✅ ОБРАБОТЧИК ДЛЯ ВИДА КАРТ
    const cardDisplayMode = document.getElementById('cardDisplayMode');
		if (cardDisplayMode) {
			cardDisplayMode.addEventListener('change', (e) => {
				settingsModule.setCardDisplayMode(e.target.value);
				audioManager.playSound('button');
			});
		}
    
    // ✅ ОБРАБОТЧИК ДЛЯ РЕЖИМА ИГРЫ
    const gameMode = document.getElementById('gameMode');
		if (gameMode) {
			gameMode.addEventListener('change', (e) => {
				settingsModule.setGameMode(e.target.value);
				audioManager.playSound('button');
				
				// Показываем сообщение о перезапуске игры
				showGameModeChangeMessage(e.target.value);
			});
		}

    function updateSettingsButtons() {
        const soundOnBtn = document.getElementById('modalSoundOn');
        const soundOffBtn = document.getElementById('modalSoundOff');
        const musicOnBtn = document.getElementById('modalMusicOn');
        const musicOffBtn = document.getElementById('modalMusicOff');
        const fullscreenOnBtn = document.getElementById('modalFullscreenOn');
        const fullscreenOffBtn = document.getElementById('modalFullscreenOff');
        
        // Обновляем кнопки звука
        if (soundOnBtn && soundOffBtn) {
            soundOnBtn.classList.toggle('active', audioManager.soundEnabled);
            soundOffBtn.classList.toggle('active', !audioManager.soundEnabled);
        }
        
        // Обновляем кнопки музыки
        if (musicOnBtn && musicOffBtn) {
            musicOnBtn.classList.toggle('active', audioManager.musicEnabled);
            musicOffBtn.classList.toggle('active', !audioManager.musicEnabled);
        }
        
        // Обновляем кнопки полноэкранного режима
        if (fullscreenOnBtn && fullscreenOffBtn) {
            const isFullscreen = window.fullscreenManager && window.fullscreenManager.isFullscreen();
            fullscreenOnBtn.classList.toggle('active', isFullscreen);
            fullscreenOffBtn.classList.toggle('active', !isFullscreen);
        }
    }
    
    function closeSettingsModal(modalOverlay) {
        modalOverlay.classList.remove('active');
        
        setTimeout(() => {
            if (modalOverlay.parentNode) {
                modalOverlay.parentNode.removeChild(modalOverlay);
            }
            if (modalOverlay.escapeHandler) {
                document.removeEventListener('keydown', modalOverlay.escapeHandler);
            }
        }, 300);
        
        audioManager.playSound('button');
    }

    // Закрытие модального окна по клику вне
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeSettingsModal(modalOverlay);
        }
    });
    
    // Закрытие по Escape
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeSettingsModal(modalOverlay);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Сохраняем обработчик для последующего удаления
    modalOverlay.escapeHandler = escapeHandler;
    
    // Инициализируем состояние кнопок при открытии
    updateSettingsButtons();
}

// ✅ ИНИЦИАЛИЗИРУЕМ МОДУЛЬ НАСТРОЕК ПРИ ЗАГРУЗКЕ
document.addEventListener('DOMContentLoaded', function() {
    if (window.settingsModule) {
        settingsModule.init();
    }
});