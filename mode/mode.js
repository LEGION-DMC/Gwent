(function () {
    'use strict';

    function cleanup() {
        const section = document.querySelector('.game-mode-selection');
        if (section) section.remove();
        document.removeEventListener('keydown', handleKeyDown);
    }

    function handleKeyDown(event) {
        if (event.key !== 'Escape') return;

        // Если открыто лобби сетевой игры — сначала закрываем его.
        if (window.networkModule && window.networkModule.lobbyEl) {
            window.networkModule.closeLobby();
            if (!window.networkModule.connected && window.networkModule.resetPeer) {
                window.networkModule.resetPeer();
            }
            return;
        }

        cleanup();
        window.factionModule?.returnToMainMenu?.();
    }

    function initGameModeSelection() {
        cleanup();

        const startPage = document.querySelector('.start-page');
        if (startPage) startPage.style.display = 'none';

        document.body.style.background = "url('ui/fon.jpg') no-repeat center center fixed";
        document.body.style.backgroundSize = 'cover';

        const section = document.createElement('section');
        section.className = 'game-mode-selection';
        section.innerHTML = `
            <div class="game-mode-selection__title">ВЫБЕРИТЕ ТИП ИГРЫ</div>
            <div class="game-mode-selection__container">
                <button type="button" class="game-mode-card" id="gameModeAi">
                    <span class="game-mode-card__name">ИГРОК ПРОТИВ ИИ</span>
                    <span class="game-mode-card__desc">Партия против AI</span>
                </button>
                <button type="button" class="game-mode-card" id="gameModePvp">
                    <span class="game-mode-card__name">ИГРОК ПРОТИВ ИГРОКА</span>
                    <span class="game-mode-card__desc">Партия по локальной сети</span>
                </button>
            </div>
        `;
        document.body.appendChild(section);

        requestAnimationFrame(() => section.classList.add('game-mode-selection--visible'));

        const aiBtn = section.querySelector('#gameModeAi');
        const pvpBtn = section.querySelector('#gameModePvp');

        [aiBtn, pvpBtn].forEach((btn) => {
            btn.addEventListener('mouseenter', () => audioManager?.playSound('touch'));
        });

        aiBtn.addEventListener('click', () => {
            audioManager?.playSound('button');
            cleanup();
            window.factionModule?.initFactionSelection?.();
        });

        pvpBtn.addEventListener('click', () => {
            audioManager?.playSound('button');
            if (window.networkModule && window.networkModule.openLobby) {
                window.networkModule.openLobby();
            } else {
                showUnavailable(section);
            }
        });

        document.addEventListener('keydown', handleKeyDown);
    }

    function showUnavailable(section) {
        if (!section || section.querySelector('.game-mode-note')) return;

        const note = document.createElement('div');
        note.className = 'game-mode-note';
        note.textContent = 'Сетевой модуль недоступен';
        section.appendChild(note);
    }

    window.gameModeModule = {
        initGameModeSelection,
        cleanup
    };
})();
