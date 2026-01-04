const gameModule = {
    gameState: {
        player: {
            deck: [],
            hand: [],
            discard: [],
            leader: null,
            faction: null,
            ability: null,
            rows: {
                'close': { cards: [], strength: 0, tactic: null },
                'ranged': { cards: [], strength: 0, tactic: null },
                'siege': { cards: [], strength: 0, tactic: null }
            },
            passed: false,
            score: 0
        },
        opponent: {
            deck: [],
            hand: [],
            discard: [],
            leader: null,
            faction: null,
            ability: null,
            rows: {
                'close': { cards: [], strength: 0, tactic: null },
                'ranged': { cards: [], strength: 0, tactic: null },
                'siege': { cards: [], strength: 0, tactic: null }
            },
            passed: false,
            score: 0
        },
        weather: {
            cards: [],
            maxWeatherCards: 3,
            effects: {
                'close': null,
                'ranged': null, 
                'siege': null
            }
        },
        currentRound: 1,
        totalRounds: 3,
        roundsWon: {
            player: 0,
            opponent: 0
        },
        currentPlayer: 'player',
        gamePhase: 'setup',
        selectedCard: null,
        selectingRow: false,
        cardsPlayedThisTurn: 0, 
        maxCardsPerTurn: 1, 
        gameSettings: {
            mode: 'cdpred',
            initialHandSize: 10,
            cardsPerRound: 1,
            totalRounds: 3
        },
        mulligan: {
            enabled: true,
            phase: 'waiting',
            player: {
                available: 2,
                used: 0,    
                cards: []    
            },
            opponent: {
                available: 2, 
                used: 0,    
                cards: []    
            }
        },
        turnTimer: {
            active: false,
            timeLeft: 60,
            maxTime: 60,
            intervalId: null,
            timeouts: 0,
            maxTimeouts: 2, 
            penaltyApplied: false 
        },
        roundLossDueToTimeout: null,
    },
	
    currentSettings: {
        cardDisplayMode: 'animated'
    },

    init: function() {
        this.loadSettings();
        this.updateGameSettings();
        this.addMessageStyles();
        this.addTimerStyles();
        this.createTotalScoreDisplays();
        this.createTimerDisplay();
        this.loadPlayerDeck();
        this.loadOpponentDeck();
        this.setupPlayerLeader();
        this.setupOpponentLeader();
        this.dealInitialHands();
        this.setupEventListeners();
        this.updateGameDisplay();
        this.displayPlayerDiscard();
        this.displayOpponentDiscard();
        
        if (window.factionAbilitiesModule) {
            window.factionAbilitiesModule.init(this.gameState);
        }
        if (window.playerModule) {
            window.playerModule.init(this.gameState);
        }
        if (window.aiModule) {
            window.aiModule.init(this.gameState);
        }
        this.startGameSequence();
    },

    startGameSequence: function() {
        this.startCoinToss();
    },

    createTimerDisplay: function() {
        if (document.getElementById('turnTimerDisplay')) return;
        
        const timerDisplay = document.createElement('div');
        timerDisplay.id = 'turnTimerDisplay';
        timerDisplay.className = 'turn-timer-display';
        timerDisplay.style.display = 'none';
        
        timerDisplay.innerHTML = `
            <div class="timer-time" id="timerTime">60</div>
            <div class="timer-label">сек.</div>
        `;
        document.body.appendChild(timerDisplay);
    },

    updateTimerDisplay: function() {
        const timerTime = document.getElementById('timerTime');
        const timerDisplay = document.getElementById('turnTimerDisplay');
        
        if (!timerTime || !timerDisplay) {
            return;
        }
        
        const timeLeft = this.gameState.turnTimer.timeLeft;
        timerTime.textContent = timeLeft;
        
        if (timeLeft <= 10) {
            timerTime.style.color = '#ff4444';
            timerDisplay.style.borderColor = '#ff4444';
            if (timeLeft <= 5) {
                timerDisplay.style.animation = 'timerPulse 0.5s infinite';
            } else {
                timerDisplay.style.animation = 'none';
            }
        } else if (timeLeft <= 30) {
            timerTime.style.color = '#ff9800';
            timerDisplay.style.borderColor = '#ff9800';
            timerDisplay.style.animation = 'none';
        } else {
            timerTime.style.color = '#4CAF50';
            timerDisplay.style.borderColor = '#d4af37';
            timerDisplay.style.animation = 'none';
        }
        
        if (this.gameState.turnTimer.active && this.gameState.gamePhase === 'playerTurn') {
            timerDisplay.style.display = 'flex';
        } else {
            timerDisplay.style.display = 'none';
        }
    },

    hideTimerDisplay: function() {
        const timerDisplay = document.getElementById('turnTimerDisplay');
        if (timerDisplay) {
            timerDisplay.style.display = 'none';
            timerDisplay.style.animation = 'none';
        }
    },

    playTimerWarningSound: function() {
        if (window.audioManager && window.audioManager.playSound) {
            if (window.audioManager.sounds && window.audioManager.sounds.timer) {
                window.audioManager.playSound('timer');
            } else {
                window.audioManager.playSound('button');
            }
        }
    },

    startTurnTimer: function() {
        this.createTimerDisplay();
        this.gameState.turnTimer.timeLeft = 60;
        this.gameState.turnTimer.active = true;
        this.updateTimerDisplay();
        
        if (this.gameState.turnTimer.intervalId) {
            clearInterval(this.gameState.turnTimer.intervalId);
        }
        
        this.gameState.turnTimer.intervalId = setInterval(() => {
            this.updateTimer();
        }, 1000);
    },

    stopTurnTimer: function() {
        if (this.gameState.turnTimer.intervalId) {
            clearInterval(this.gameState.turnTimer.intervalId);
            this.gameState.turnTimer.intervalId = null;
        }
        this.gameState.turnTimer.active = false;
        this.hideTimerDisplay();
    },

    updateTimer: function() {
        if (!this.gameState.turnTimer.active) return;
        
        this.gameState.turnTimer.timeLeft--;
        this.updateTimerDisplay();
        
        if (this.gameState.turnTimer.timeLeft === 10) {
            this.playTimerWarningSound();
        } else if (this.gameState.turnTimer.timeLeft === 5) {
            this.playTimerWarningSound();
        }
        
        if (this.gameState.turnTimer.timeLeft <= 0) {
            this.handleTimeExpired();
        }
    },

    handleTimeExpired: function() {
        this.stopTurnTimer();
        this.gameState.turnTimer.timeouts++;
        const currentPlayer = this.gameState.currentPlayer;
        
        if (this.gameState.turnTimer.timeouts === 1 && !this.gameState.turnTimer.penaltyApplied) {
            this.applyCardPenalty(currentPlayer);
            this.gameState.turnTimer.penaltyApplied = true;
            
            setTimeout(() => {
                if (currentPlayer === 'player') {
                    this.startTurnTimer();
                }
            }, 1000);
        }
        else if (this.gameState.turnTimer.timeouts >= 2) {
            this.forceAutoPassWithRoundLoss(currentPlayer);
        }
    },

    applyCardPenalty: function(player) {
        const playerState = this.gameState[player];
        
        if (playerState.hand.length === 0) {
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * playerState.hand.length);
        const penaltyCard = playerState.hand[randomIndex];
        
        playerState.hand.splice(randomIndex, 1);
        this.addCardToDiscard(penaltyCard, player);
        
        if (player === 'player') {
            this.displayPlayerHand();
            this.displayPlayerDiscard();
        } else {
            this.displayOpponentDiscard();
        }
        
        const message = player === 'player' 
            ? 'Бездействие! Случайная карта отправлена в сброс' 
            : 'Противник бездействует! Карта отправлена в сброс';
        this.showGameMessage(message, 'warning');
        
        if (audioManager && audioManager.playSound) {
            audioManager.playSound('button');
        }
    },

    forceEndTurn: function() {
        const currentPlayer = this.gameState.currentPlayer;
        
        if (currentPlayer === 'player') {
            this.gameState.cardsPlayedThisTurn = 0;
            this.gameState.selectingRow = false;
            this.gameState.selectedCard = null;
            
            if (window.playerModule && window.playerModule.cancelRowSelection) {
                window.playerModule.cancelRowSelection();
            }
            
            this.startOpponentTurn();
        } else {
            this.startPlayerTurn();
        }
    },

    forceAutoPassWithRoundLoss: function(player) {
        this.gameState[player].passed = true;
        this.gameState.roundLossDueToTimeout = player;
        
        if (player === 'player') {
            this.showGameMessage('Вы проиграли раунд из-за бездействия!', 'error');
        } else {
            this.showGameMessage('Противник проиграл раунд из-за бездействия!', 'info');
        }
        
        setTimeout(() => {
            this.endRound();
        }, 2000);
    },

    resetTimeoutCounter: function() {
        this.gameState.turnTimer.timeouts = 0;
        this.gameState.turnTimer.penaltyApplied = false;
    },

    addTimerStyles: function() {
        if (document.getElementById('turn-timer-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'turn-timer-styles';
        style.textContent = `
            .turn-timer-display {
                position: fixed !important;
                top: 65% !important;
                right: 2.5% !important;
                transform: translateX(-50%) !important;
                background: rgba(0, 0, 0, 0.8) !important;
                border: 2px solid #d4af37 !important;
                border-radius: 10px !important;
                padding: 5px 20px !important;
                color: white !important;
                font-family: 'Gwent', sans-serif !important;
                font-size: 15px !important;
                font-weight: bold !important;
                z-index: 9999 !important;
                text-align: center !important;
                min-width: 150px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 10px !important;
                transition: all 0.3s ease !important;
            }
            
            @keyframes timerPulse {
                0% { box-shadow: 0 0 5px rgba(255, 68, 68, 0.5); }
                50% { box-shadow: 0 0 20px rgba(255, 68, 68, 0.8); }
                100% { box-shadow: 0 0 5px rgba(255, 68, 68, 0.5); }
            }
            
            @keyframes pulse {
                0% { opacity: 0.7; }
                50% { opacity: 1; }
                100% { opacity: 0.7; }
            }
            
            .timer-time {
                font-size: 18px;
                font-weight: bold;
            }
            
            .timer-label {
                font-size: 13px;
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);
    },

    startMulliganPhase: function() {
        this.resetMulliganState();
        
        const playerIsRealms = this.gameState.player.faction === 'realms';
        const opponentIsRealms = this.gameState.opponent.faction === 'realms';
        
        if (playerIsRealms) {
            this.gameState.mulligan.player.available = 3;
        }
        
        if (opponentIsRealms) {
            this.gameState.mulligan.opponent.available = 3;
        }
        
        this.startPlayerMulligan();
    },

    resetMulliganState: function() {
        this.gameState.mulligan.phase = 'waiting';
        this.gameState.mulligan.player.available = 2;
        this.gameState.mulligan.player.used = 0;
        this.gameState.mulligan.player.cards = [];
        this.gameState.mulligan.opponent.available = 2;
        this.gameState.mulligan.opponent.used = 0;
        this.gameState.mulligan.opponent.cards = [];
    },

    showMulliganIntro: function() {
        this.startPlayerMulligan();
    },

    startPlayerMulligan: function() {
        this.gameState.mulligan.phase = 'player';
        this.showMulliganInterface();
    },

    showMulliganInterface: function() {
        this.hideGameBoardDuringMulligan();
        this.createMulliganControls();
        this.displayPlayerHandForMulligan();
    },

    hideGameBoardDuringMulligan: function() {
        const elementsToHide = [
            'gameBoard', 'weatherSlot', 'playerLeader', 'opponentLeader',
            'playerDeck', 'opponentDeck', 'playerDiscard', 'opponentDiscard',
            'roundImage', 'winsIndicator', 'gameModeIndicator',
            'playerCloseRow', 'playerRangedRow', 'playerSiegeRow',
            'opponentCloseRow', 'opponentRangedRow', 'opponentSiegeRow',
            'passBtn', 'endTurnBtn', 'turnTimerDisplay'
        ];
        
        const overlay = document.createElement('div');
        overlay.id = 'mulliganOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            z-index: 999;
            pointer-events: none;
        `;
        document.body.appendChild(overlay);
        
        this.mulliganHiddenElements = {};
        elementsToHide.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                this.mulliganHiddenElements[elementId] = {
                    display: element.style.display || '',
                    opacity: element.style.opacity || '',
                    visibility: element.style.visibility || ''
                };
                
                element.style.opacity = '0.05';
                element.style.pointerEvents = 'none';
            }
        });
        
        document.querySelectorAll('.row-strength').forEach(el => {
            el.style.opacity = '0.05';
        });
        
        document.querySelectorAll('.total-score-display').forEach(el => {
            el.style.opacity = '0.05';
        });
    },

    restoreGameBoardAfterMulligan: function() {
        const overlay = document.getElementById('mulliganOverlay');
        if (overlay) {
            overlay.remove();
        }
        
        if (this.mulliganHiddenElements) {
            Object.keys(this.mulliganHiddenElements).forEach(elementId => {
                const element = document.getElementById(elementId);
                if (element) {
                    const original = this.mulliganHiddenElements[elementId];
                    element.style.display = original.display;
                    element.style.opacity = original.opacity;
                    element.style.visibility = original.visibility;
                    element.style.pointerEvents = '';
                }
            });
        }
        
        document.querySelectorAll('.row-strength').forEach(el => {
            el.style.opacity = '';
        });
        
        document.querySelectorAll('.total-score-display').forEach(el => {
            el.style.opacity = '';
        });
        
        this.mulliganHiddenElements = null;
    },

    createMulliganControls: function() {
        const playerHand = document.getElementById('playerHand');
        if (!playerHand) return;
        
        const existingControls = document.getElementById('mulliganControls');
        if (existingControls) {
            existingControls.remove();
        }
        
        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'mulliganControls';
        controlsContainer.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 54%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            z-index: 1000;
            bottom: 2.3%;
        `;
        
        const resetButton = document.createElement('button');
        resetButton.id = 'mulliganResetBtn';
        resetButton.textContent = 'ОТМЕНИТЬ ВЫБОР';
        resetButton.style.cssText = `
            background: linear-gradient(145deg, rgb(42, 42, 42), rgb(26, 26, 26));
            color: rgb(212, 175, 55);
            border: 1px solid rgb(212, 175, 55);
            padding: 8px;
            font-size: 14px;
            font-family: "Gwent", sans-serif;
            text-transform: uppercase;
            letter-spacing: 2px;
            cursor: url("./ui/cursor_hover.png"), pointer;
            transition: 0.3s;
            border-radius: 4px;
            box-shadow: rgba(0, 0, 0, 0.3) 0px 4px 8px;
            margin: 0px auto;
            display: block;
            overflow: hidden;
            transform: scale(1);
            width: 150px;
        `;
        
        const infoPanel = document.createElement('div');
        infoPanel.id = 'mulliganInfo';
        infoPanel.style.cssText = `
            background: rgba(0, 0, 0, 0.8);
            color: rgb(212, 175, 55);
            border-radius: 4px;
            border: 1px solid rgb(212, 175, 55);
            font-family: "Gwent", sans-serif;
            font-size: 18px;
            text-align: center;
            min-width: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px 20px;
            font-weight: bold;
        `;
        
        const infoText = document.createElement('div');
        infoText.id = 'mulliganInfoText';
        infoText.textContent = 'Выбрано: 0/2 карт';
        
        infoPanel.appendChild(infoText);
        
        const doneButton = document.createElement('button');
        doneButton.id = 'mulliganDoneBtn';
        doneButton.textContent = 'ГОТОВО';
        doneButton.style.cssText = `
            background: linear-gradient(145deg, rgb(42, 42, 42), rgb(26, 26, 26));
            color: rgb(212, 175, 55);
            border: 1px solid rgb(212, 175, 55);
            padding: 8px;
            font-size: 14px;
            font-family: "Gwent", sans-serif;
            text-transform: uppercase;
            letter-spacing: 2px;
            cursor: url("./ui/cursor_hover.png"), pointer;
            transition: 0.3s;
            border-radius: 4px;
            box-shadow: rgba(0, 0, 0, 0.3) 0px 4px 8px;
            margin: 0px auto;
            display: block;
            overflow: hidden;
            transform: scale(1);
            width: 150px;
        `;
        
        controlsContainer.appendChild(resetButton);
        controlsContainer.appendChild(infoPanel);
        controlsContainer.appendChild(doneButton);
        
        document.body.appendChild(controlsContainer);
        
        this.setupMulliganControlsEventListeners();
        this.updateMulliganInfo();
    },

    setupMulliganControlsEventListeners: function() {
        const doneBtn = document.getElementById('mulliganDoneBtn');
        const resetBtn = document.getElementById('mulliganResetBtn');
        
        if (doneBtn) {
            const newDoneBtn = doneBtn.cloneNode(true);
            doneBtn.parentNode.replaceChild(newDoneBtn, doneBtn);
            
            newDoneBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                this.completePlayerMulligan();
                audioManager.playSound('button');
            });
            
            newDoneBtn.addEventListener('mouseenter', () => {
                newDoneBtn.style.transform = 'scale(1.05)';
                newDoneBtn.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
                audioManager.playSound('touch');
            });
            
            newDoneBtn.addEventListener('mouseleave', () => {
                newDoneBtn.style.transform = 'scale(1)';
                newDoneBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
            });
        }
        
        if (resetBtn) {
            const newResetBtn = resetBtn.cloneNode(true);
            resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
            
            newResetBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                this.resetPlayerMulliganSelection();
                audioManager.playSound('button');
            });
            
            newResetBtn.addEventListener('mouseenter', () => {
                newResetBtn.style.transform = 'scale(1.05)';
                newResetBtn.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
                audioManager.playSound('touch');
            });
            
            newResetBtn.addEventListener('mouseleave', () => {
                newResetBtn.style.transform = 'scale(1)';
                newResetBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
            });
        }
    },

    displayPlayerHandForMulligan: function() {
        const handContainer = document.getElementById('playerHand');
        if (!handContainer) return;

        const originalStyles = handContainer.style.cssText;
        handContainer.innerHTML = '';
        handContainer.classList.add('mulligan-active');
        
        const frameWrapper = document.createElement('div');
        frameWrapper.id = 'mulligan-frame-wrapper';
        frameWrapper.style.cssText = `
            position: relative;
            display: inline-block;
        `;
        
        const titleLabel = document.createElement('div');
        titleLabel.id = 'mulligan-title';
        titleLabel.textContent = 'Муллигана';
        titleLabel.style.cssText = `
            position: absolute;
            top: -25px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(145deg, rgb(42, 42, 42), rgb(26, 26, 26));
            color: #d4af37;
            padding: 3px 15px;
            border: 1px solid #d4af37;
            border-radius: 4px;
            font-family: "Gwent", sans-serif;
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            z-index: 1000;
            white-space: nowrap;
        `;
        
        const cardsContainer = document.createElement('div');
        cardsContainer.id = 'mulligan-cards-container';
        cardsContainer.style.cssText = `
            border: 1px solid #d4af37;
            border-radius: 5px;
            padding: 10px;
            background: rgba(0, 0, 0, 0.3);
            display: inline-block;
        `;
        
        const innerCardsContainer = document.createElement('div');
        innerCardsContainer.style.cssText = `
            display: flex;
            gap: 10px;
        `;
        
        this.gameState.player.hand.forEach((card, index) => {
            const cardElement = this.createMulliganCardElement(card, index);
            innerCardsContainer.appendChild(cardElement);
        });
        
        cardsContainer.appendChild(innerCardsContainer);
        frameWrapper.appendChild(titleLabel);
        frameWrapper.appendChild(cardsContainer);
        handContainer.appendChild(frameWrapper);
        
        handContainer.style.cssText = originalStyles;
        handContainer.style.display = 'flex';
        handContainer.style.justifyContent = 'center';
        handContainer.style.alignItems = 'center';
    },

    createMulliganCardElement: function(card, index) {
        const cardElement = document.createElement('div');
        cardElement.className = `hand-card ${card.type} ${card.rarity} mulligan-card`;
        cardElement.dataset.cardId = card.id;
        cardElement.dataset.handIndex = index;
        
        const { mediaPath, isVideo } = this.getCardMediaPath(card);

        let mediaElement = isVideo ? 
            `<video class="hand-card-media" muted playsinline preload="metadata"><source src="${mediaPath}" type="video/mp4"></video>` :
            `<img src="${mediaPath}" alt="${card.name}" class="hand-card-media" onerror="this.src='card/placeholder.jpg'">`;

        let topRightElement = card.type === 'unit' ? 
            `<div class="hand-card-strength">${card.strength || 0}</div>` :
            `<div class="hand-card-type-icon"><img src="${this.getTypeIconPath(card.type)}" alt="${card.type}"></div>`;

        let positionElement = '';
        if (card.type === 'unit' && card.position) {
            let positions = [];
            if (Array.isArray(card.position)) {
                positions = card.position;
            } else {
                positions = [card.position];
            }
            
            const displayPosition = positions.length > 1 ? 'any' : positions[0];
            const positionIconPath = this.getPositionIconPath(displayPosition);
            
            positionElement = `
                <div class="hand-card-position">
                    <img src="${card.positionBanner || 'deck/position_banner.png'}" alt="Позиция" class="hand-card-position-banner">
                    <img src="${positionIconPath}" alt="${displayPosition}" class="hand-card-position-icon">
                </div>
            `;
        }

        cardElement.innerHTML = `
            <div class="hand-card-container">
                ${mediaElement}
                <img src="${card.border || 'deck/bord_bronze.png'}" alt="Рамка" class="hand-card-border">
                <img src="${card.banner || `faction/${card.faction}/banner_bronze.png`}" alt="Баннер" class="hand-card-banner">
                <div class="hand-card-name">${card.name || 'Неизвестная карта'}</div>
                ${topRightElement}
                ${positionElement}
            </div>
        `;
    
        cardElement.addEventListener('click', (event) => {
            if (this.gameState.mulligan.phase === 'player') {
                this.handleMulliganCardSelection(card, cardElement);
                event.stopPropagation();
            }
        });
        
        cardElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.showCardModal(card);
            audioManager.playSound('button');
        });
        
        cardElement.addEventListener('mouseenter', () => {
            audioManager.playSound('touch');
        });
        
        return cardElement;
    },

    handleMulliganCardSelection: function(card, cardElement) {
        const mulliganState = this.gameState.mulligan.player;
        
        if (mulliganState.cards.length >= mulliganState.available && 
            !mulliganState.cards.includes(card)) {
            return;
        }
        
        const cardIndex = mulliganState.cards.indexOf(card);
        if (cardIndex === -1) {
            mulliganState.cards.push(card);
            cardElement.classList.add('mulligan-selected');
            audioManager.playSound('cardAdd');
        } else {
            mulliganState.cards.splice(cardIndex, 1);
            cardElement.classList.remove('mulligan-selected');
            audioManager.playSound('cardRemove');
        }
        
        this.updateMulliganInfo();
    },

    updateMulliganInfo: function() {
        const infoText = document.getElementById('mulliganInfoText');
        const infoPanel = document.getElementById('mulliganInfo');
        
        if (!infoText || !infoPanel) {
            return;
        }
        
        const mulliganState = this.gameState.mulligan.player;
        const selectedCount = mulliganState.cards.length;
        const availableCount = mulliganState.available;
        
        infoText.textContent = `Выбрано: ${selectedCount}/${availableCount} карт`;
        
        if (selectedCount > 0) {
            infoPanel.style.borderColor = '#4CAF50';
            infoPanel.style.color = '#4CAF50';
            infoPanel.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.3)';
        } else {
            infoPanel.style.borderColor = '#d4af37';
            infoPanel.style.color = '#d4af37';
            infoPanel.style.boxShadow = 'none';
        }
    },

    resetPlayerMulliganSelection: function() {
        const mulliganState = this.gameState.mulligan.player;
        
        const selectedCards = document.querySelectorAll('.mulligan-selected');
        selectedCards.forEach(cardElement => {
            cardElement.classList.remove('mulligan-selected');
        });
        
        mulliganState.cards = [];
        this.updateMulliganInfo();
    },

    completePlayerMulligan: function() {
        const mulliganState = this.gameState.mulligan.player;
        
        if (mulliganState.cards.length !== 0) {
            this.replaceMulliganCards('player');
        }
        
        this.removeMulliganInterface();
        
        setTimeout(() => {
            this.startOpponentMulligan();
        }, 1000);
    },

    replaceMulliganCards: function(player) {
        const mulliganState = this.gameState.mulligan[player];
        const gameState = this.gameState[player];
        
        const cardsToReplace = [...mulliganState.cards];
        const currentHand = [...gameState.hand];
        const currentDeck = [...gameState.deck];
        
        const removedCards = [];
        cardsToReplace.forEach(card => {
            const handIndex = currentHand.findIndex(c => c.id === card.id);
            if (handIndex !== -1) {
                const removedCard = currentHand.splice(handIndex, 1)[0];
                removedCards.push(removedCard);
            }
        });
        
        this.shuffleArray(currentDeck);
        
        const newCards = [];
        for (let i = 0; i < cardsToReplace.length; i++) {
            if (currentDeck.length > 0) {
                const newCard = currentDeck.shift();
                newCards.push(newCard);
            }
        }
        
        newCards.forEach(newCard => {
            currentHand.push(newCard);
        });
        
        removedCards.forEach(oldCard => {
            const randomPosition = Math.floor(Math.random() * (currentDeck.length + 1));
            currentDeck.splice(randomPosition, 0, oldCard);
        });

        this.shuffleArray(currentDeck);
        
        gameState.hand = currentHand;
        gameState.deck = currentDeck;
        mulliganState.used = cardsToReplace.length;
        
        if (player === 'player') {
            this.displayPlayerHand();
            this.displayPlayerDeck();
        }
        
        return true;
    },

    startOpponentMulligan: function() {
        this.gameState.mulligan.phase = 'opponent';
        this.removeMulliganInterface();
        
        setTimeout(() => {
            this.performOpponentMulligan();
        }, 1500);
    },

    performOpponentMulligan: function() {
        const mulliganState = this.gameState.mulligan.opponent;
        const hand = this.gameState.opponent.hand;
        
        const weakCards = hand
            .filter(card => card.type === 'unit')
            .sort((a, b) => (a.strength || 0) - (b.strength || 0))
            .slice(0, Math.min(2, hand.length));
        
        if (weakCards.length === 0) {
            weakCards.push(...hand.slice(0, Math.min(2, hand.length)));
        }
        
        mulliganState.cards = weakCards.slice(0, mulliganState.available);
        
        if (mulliganState.cards.length > 0) {
            this.replaceMulliganCards('opponent');
        }
        
        this.completeMulliganPhase();
    },

    removeMulliganInterface: function() {
        this.restoreGameBoardAfterMulligan();
        
        const controls = document.getElementById('mulliganControls');
        if (controls) {
            controls.remove();
        }
        
        const frameWrapper = document.getElementById('mulligan-frame-wrapper');
        if (frameWrapper) {
            frameWrapper.remove();
        }
        
        const handContainer = document.getElementById('playerHand');
        if (handContainer) {
            handContainer.classList.remove('mulligan-active');
            handContainer.innerHTML = '';
            this.displayPlayerHand();
        }
    },

    completeMulliganPhase: function() {
        this.gameState.mulligan.phase = 'completed';
        
        const playerUsed = this.gameState.mulligan.player.used;
        const opponentUsed = this.gameState.mulligan.opponent.used;
        
        this.displayPlayerHand();
        this.showGameMessage('ИГРА НАЧИНАЕТСЯ!', 'info');
        if (window.audioManager && window.audioManager.playSound) {
            audioManager.playSound('round_start');
        }
        setTimeout(() => {
            if (this.gameState.currentPlayer === 'player') {
                this.startPlayerTurn();
            } else {
                this.startOpponentTurn();
            }
        }, 1000);
    },

    startCoinToss: function() {
        const playerIsScoiatael = this.gameState.player.faction === 'scoiatael';
        const opponentIsScoiatael = this.gameState.opponent.faction === 'scoiatael';
        
        if (playerIsScoiatael || opponentIsScoiatael) {
            this.startScoiataelTurnChoice();
        } else {
            this.startCoinTossAnimation();
        }
    },

    startScoiataelTurnChoice: async function() {
        if (window.factionAbilitiesModule) {
            const firstTurn = await window.factionAbilitiesModule.determineFirstTurn(this.gameState);
            this.startGameAfterCoinToss(firstTurn);
        } else {
            this.startCoinTossAnimation();
        }
    },

    startCoinTossAnimation: function() {
        const coinOverlay = document.createElement('div');
        coinOverlay.id = 'coinTossOverlay';
        coinOverlay.className = 'coin-toss-overlay';
        coinOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 1);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: 'Gwent', sans-serif;
        `;

        coinOverlay.innerHTML = `
            <div class="coin-toss-container">
                <div class="coin-toss-title">ОПРЕДЕЛЕНИЕ ОЧЕРЁДНОСТИ ХОДА</div>
                
                <div class="coin-wrapper">
                    <div class="coin" id="coinElement">
                        <img src="board/coin_player.png" alt="Игрок ходит первым" class="coin-front">
                        <img src="board/coin_opponent.png" alt="Противник ходит первым" class="coin-back">
                    </div>
                </div>
                
                <div class="coin-result" id="coinResult"></div>
            </div>
        `;

        document.body.appendChild(coinOverlay);
        this.addCoinTossStyles();
        
        setTimeout(() => {
            this.animateCoinToss();
        }, 1500);
    },

    addCoinTossStyles: function() {
        if (document.getElementById('coin-toss-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'coin-toss-styles';
        style.textContent = `
            .coin-toss-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                max-width: 600px;
            }
            
            .coin-toss-title {
                color: #d4af37;
                font-size: 30px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 3px;
                text-shadow: 0 2px 10px rgba(212, 175, 55, 0.5);
                animation: titlePulse 2s infinite;
            }
            
            @keyframes titlePulse {
                0% { opacity: 0.8; }
                50% { opacity: 1; }
                100% { opacity: 0.8; }
            }
            
            .coin-wrapper {
                width: 300px;
                height: 300px;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .coin {
                position: relative;
                transform-style: preserve-3d;
                transition: transform 0.1s linear;
                display: flex;
                align-items: center;
                justify-content: center;
                left: -11%;
            }
            
            .coin-front, .coin-back {
                position: absolute;
                backface-visibility: hidden;
            }
            
            .coin-front {
                transform: rotateY(0deg);
            }
            
            .coin-back {
                transform: rotateY(180deg);
            }
            
            @keyframes coinTossUp {
                0% {
                    transform: translateY(0) rotateY(0deg);
                    animation-timing-function: ease-out;
                }
                20% {
                    transform: translateY(-200px) rotateY(360deg);
                    animation-timing-function: ease-in;
                }
                40% {
                    transform: translateY(-50px) rotateY(720deg);
                    animation-timing-function: ease-out;
                }
                60% {
                    transform: translateY(-150px) rotateY(1080deg);
                    animation-timing-function: ease-in;
                }
                80% {
                    transform: translateY(-30px) rotateY(1440deg);
                    animation-timing-function: ease-out;
                }
                100% {
                    transform: translateY(0) rotateY(1800deg);
                }
            }
            
            .coin-tossing {
                animation: coinTossUp 3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
            
            .coin-result {
                color: #fff;
                font-size: 25px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 2px;
                min-height: 40px;
                opacity: 0;
                transition: opacity 0.5s ease;
            }
            
            .coin-result.show {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    },

    animateCoinToss: function() {
        const coinElement = document.getElementById('coinElement');
        const coinResult = document.getElementById('coinResult');
        
        if (!coinElement || !coinResult) {
            return;
        }
        
        setTimeout(() => {
            coinElement.classList.add('coin-tossing');
            
            if (audioManager && audioManager.playSound) {
                audioManager.playSound('coinToss');
            }
        }, 500);
        
        setTimeout(() => {
            coinElement.classList.remove('coin-tossing');
            const goesFirst = Math.random() < 0.5 ? 'player' : 'opponent';
            coinElement.style.transition = 'none';
            
            if (goesFirst === 'player') {
                coinElement.style.transform = 'rotateY(0deg)';
                coinResult.textContent = 'ИГРОК ХОДИТ ПЕРВЫМ';
                coinResult.style.color = '#4CAF50';
            } else {
                coinElement.style.transform = 'rotateY(180deg)';
                coinResult.textContent = 'ПРОТИВНИК ХОДИТ ПЕРВЫМ';
                coinResult.style.color = '#f44336';
            }
            
            coinResult.classList.add('show');
            this.gameState.currentPlayer = goesFirst;
            
            setTimeout(() => {
                this.startGameAfterCoinToss(goesFirst);
            }, 2000);
        }, 3500);
    },

    startGameAfterCoinToss: function(firstPlayer) {
        const coinOverlay = document.getElementById('coinTossOverlay');
        if (coinOverlay) {
            coinOverlay.style.opacity = '0';
            setTimeout(() => {
                if (coinOverlay.parentNode) {
                    coinOverlay.parentNode.removeChild(coinOverlay);
                }
            }, 500);
        }
        
        this.stopTurnTimer();
        this.gameState.currentPlayer = firstPlayer;
        this.startMulliganPhase();
    },

    loadSettings: function() {
        if (window.settingsModule) {
            const gameMode = settingsModule.getGameMode();
            this.gameState.gameSettings.mode = gameMode;
        }
    },

    updateGameSettings: function() {
        const mode = this.gameState.gameSettings.mode;
        
        if (mode === 'classic') {
            this.gameState.gameSettings.initialHandSize = 10;
            this.gameState.gameSettings.cardsPerRound = 0;
        } else {
            this.gameState.gameSettings.initialHandSize = 10;
            this.gameState.gameSettings.cardsPerRound = 10;
        }
    },

    onSettingsChange: function(settings) {
        this.currentSettings.cardDisplayMode = settings.cardDisplayMode;
        
        if (settings.gameMode !== this.gameState.gameSettings.mode) {
            this.gameState.gameSettings.mode = settings.gameMode;
            this.updateGameSettings();
        }
        
        this.updateAllCardDisplays();
    },

    updateAllCardDisplays: function() {
        this.displayPlayerHand();
        this.displayWeatherCards();
        this.redrawLeaders();
        
        const rows = ['close', 'ranged', 'siege'];
        rows.forEach(row => {
            this.gameState.player.rows[row].cards.forEach(card => {
                this.redrawCardOnBoard(card, row, 'player');
            });
            this.gameState.opponent.rows[row].cards.forEach(card => {
                this.redrawCardOnBoard(card, row, 'opponent');
            });
            if (this.gameState.player.rows[row].tactic) {
                this.redrawTacticCard(this.gameState.player.rows[row].tactic, row, 'player');
            }
            if (this.gameState.opponent.rows[row].tactic) {
                this.redrawTacticCard(this.gameState.opponent.rows[row].tactic, row, 'opponent');
            }
        });
    },

    redrawCardOnBoard: function(card, row, player) {
        const rowElement = document.getElementById(`${player}${this.capitalizeFirst(row)}Row`);
        if (!rowElement) return;
        
        const existingCard = rowElement.querySelector(`[data-card-id="${card.id}"]`);
        if (existingCard) {
            existingCard.remove();
        }
        
        const newCardElement = player === 'player' ? 
            this.createBoardCardElement(card, 'unit') : 
            this.createOpponentBoardCardElement(card);
            
        rowElement.appendChild(newCardElement);
        this.updateRowStrength(row, player);
    },

    redrawTacticCard: function(card, row, player) {
        const tacticSlot = document.getElementById(`${player}${this.capitalizeFirst(row)}Tactics`);
        if (!tacticSlot) return;
        
        tacticSlot.innerHTML = '';
        const cardElement = player === 'player' ? 
            this.createBoardCardElement(card, 'tactic') : 
            this.createOpponentBoardCardElement(card);
            
        tacticSlot.appendChild(cardElement);
    },

    redrawLeaders: function() {
        const playerLeaderSlot = document.getElementById('playerLeader');
        if (playerLeaderSlot && this.gameState.player.leader) {
            playerLeaderSlot.innerHTML = '';
            playerLeaderSlot.appendChild(this.createLeaderCardElement(this.gameState.player.leader, 'player'));
        }
        
        const opponentLeaderSlot = document.getElementById('opponentLeader');
        if (opponentLeaderSlot && this.gameState.opponent.leader) {
            opponentLeaderSlot.innerHTML = '';
            opponentLeaderSlot.appendChild(this.createLeaderCardElement(this.gameState.opponent.leader, 'opponent'));
        }
    },

    getCardMediaPath: function(card) {
        const cardDisplayMode = this.currentSettings.cardDisplayMode;
        
        let mediaPath = `card/${card.faction}/${card.image}`;
        let isVideo = card.image && card.image.endsWith('.mp4');
        
        if (cardDisplayMode === 'static' && isVideo) {
            mediaPath = mediaPath.replace('.mp4', '.jpg');
            isVideo = false;
        }
        
        return { mediaPath, isVideo };
    },

    startPlayerTurn: function() {
        if (this.gameState.mulligan.phase !== 'completed') {
            return;
        }
        this.gameState.gamePhase = 'playerTurn';
        this.gameState.currentPlayer = 'player';
        this.gameState.cardsPlayedThisTurn = 0;
        this.gameState.selectingRow = false;
        this.gameState.selectedCard = null;
        
        if (!this.gameState.player.passed) {
            this.startTurnTimer();
        } else {
            this.hideTimerDisplay();
        }
        
        this.updateGameModeIndicator();
        this.updateTurnIndicator();
        this.updateControlButtons();
        this.showGameMessage('Ваш ход', 'info');
    },

    startOpponentTurn: function() {
        this.gameState.gamePhase = 'opponentTurn'; 
        this.gameState.currentPlayer = 'opponent';
        this.gameState.cardsPlayedThisTurn = 0;
        this.stopTurnTimer();
        this.updateTurnIndicator();
        this.updateControlButtons();
        this.showGameMessage('Ход противника', 'warning');
        
        if (this.gameState.opponent.passed) {
            this.showGameMessage('Противник пасовал', 'info');
            setTimeout(() => {
                this.startPlayerTurn();
            }, 1000);
            return;
        }
        
        setTimeout(() => {
            if (window.aiModule) {
                window.aiModule.makeMove();
            } else {
                this.startPlayerTurn();
            }
        }, 1000);
    },

    handleTurnEnd: function() {
        this.stopTurnTimer();
        
        const currentPlayer = this.gameState.currentPlayer;
        this.gameState.cardsPlayedThisTurn = 0;
        this.gameState.selectingRow = false;
        this.gameState.selectedCard = null;
        
        if (this.gameState[currentPlayer].passed) {
            this.checkRoundEnd();
        } else {
            if (currentPlayer === 'player') {
                this.startOpponentTurn();
            } else {
                this.startPlayerTurn();
            }
        }
    },

    endRound: function() {
        const playerScore = this.calculateTotalScore('player');
        const opponentScore = this.calculateTotalScore('opponent');
        
        if (this.gameState.roundLossDueToTimeout) {
            const losingPlayer = this.gameState.roundLossDueToTimeout;
            
            if (losingPlayer === 'player') {
                this.gameState.roundsWon.opponent++;
                this.showRoundResult('opponent', playerScore, opponentScore);
            } else {
                this.gameState.roundsWon.player++;
                this.showRoundResult('player', playerScore, opponentScore);
            }
            
            this.gameState.roundLossDueToTimeout = null;
        } else {
            let roundWinner = null;
            
            if (window.factionAbilitiesModule) {
                roundWinner = window.factionAbilitiesModule.checkRoundWinner(
                    this.gameState, 
                    playerScore, 
                    opponentScore
                );
            } else {
                if (playerScore > opponentScore) {
                    roundWinner = 'player';
                } else if (opponentScore > playerScore) {
                    roundWinner = 'opponent';
                }
            }
            
            if (roundWinner === 'player') {
                this.gameState.roundsWon.player++;
            } else if (roundWinner === 'opponent') {
                this.gameState.roundsWon.opponent++;
            } else {
                this.gameState.roundsWon.player++;
                this.gameState.roundsWon.opponent++;
            }
            
            this.showRoundResult(roundWinner, playerScore, opponentScore);
        }
        
        if (window.factionAbilitiesModule) {
            window.factionAbilitiesModule.handleRoundEndForMonsters(this.gameState);
        }
        
        if (this.gameState.roundsWon.player >= 2 || this.gameState.roundsWon.opponent >= 2) {
            setTimeout(() => this.endGame(), 3000);
        } else {
            setTimeout(() => this.startNewRound(), 3000);
        }
    },

    calculateTotalScore: function(player) {
        const rows = this.gameState[player].rows;
        
        if (this.gameState[player].cachedTotalScore !== undefined) {
            const rowsChanged = Object.values(rows).some(row => 
                row.cards.length !== (this.gameState[player].cachedRowLengths?.[row] || 0)
            );
            
            if (!rowsChanged) {
                return this.gameState[player].cachedTotalScore;
            }
        }
        
        const totalScore = Object.values(rows).reduce((total, row) => total + row.strength, 0);
        this.gameState[player].cachedTotalScore = totalScore;
        this.gameState[player].cachedRowLengths = {};
        Object.keys(rows).forEach(rowKey => {
            this.gameState[player].cachedRowLengths[rowKey] = rows[rowKey].cards.length;
        });
        
        return totalScore;
    },

    resolveTie: function() {
        if (this.gameState.player.faction === 'nilfgaard') {
            return 'player';
        } else if (this.gameState.opponent.faction === 'nilfgaard') {
            return 'opponent';
        }
        return null;
    },

    startNewRound: function() {
        this.gameState.currentRound++;
        if (window.audioManager && window.audioManager.playSound) {
            audioManager.playSound('round_start');
        }
        if (window.factionAbilitiesModule) {
            window.factionAbilitiesModule.handleRound3ForSkellige(this.gameState);
        }
        
        const mode = this.gameState.gameSettings.mode;
        
        if (mode === 'classic') {
            this.showGameMessage(`Классический режим | Раунд ${this.gameState.currentRound}`, 'info');
        } else {
            this.showGameMessage(`CDPRed режим | Раунд ${this.gameState.currentRound}`, 'info');
        }
        
        this.updateRoundCounter();
        this.resetRoundState();
        this.dealAdditionalCards();
        this.startPlayerTurn();
    },

    updateGameModeIndicator: function() {
        const mode = this.gameState.gameSettings.mode;
        const modeName = mode === 'classic' ? 'Классический' : 'CD Project Red';
        const modeColor = mode === 'classic' ? '#d4af37' : '#d4af37';
        
        let modeIndicator = document.getElementById('gameModeIndicator');
        if (!modeIndicator) {
            modeIndicator = document.createElement('div');
            modeIndicator.id = 'gameModeIndicator';
            modeIndicator.style.cssText = `
                position: absolute;
                top: 0.5%;
                right: 0.5%;
                color: ${modeColor};
                padding: 2px 3px;
                border-radius: 5px;
                border: 1px solid ${modeColor};
                font-family: 'Gwent', sans-serif;
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
                z-index: 50;
            `;
            document.querySelector('.game-board').appendChild(modeIndicator);
        }
        
        modeIndicator.textContent = modeName;
        modeIndicator.title = `Режим игры: ${modeName}\n${mode === 'classic' ? '10 карт на всю игру' : 'Карты добираются каждый раунд'}`;
    },

    resetRoundState: function() {
        this.gameState.player.passed = false;
        this.gameState.opponent.passed = false;
        this.gameState.cardsPlayedThisTurn = 0;
        this.resetTimeoutCounter();
        this.gameState.roundLossDueToTimeout = null;
        this.invalidateScoreCache('player');
        this.invalidateScoreCache('opponent');
        this.restoreAllCardStrengths();
        
        this.gameState.weather.cards.forEach(weatherCard => {
            const cardOwner = this.getWeatherCardOwner(weatherCard);
            this.addCardToDiscard(weatherCard, cardOwner);
        });
        
        this.gameState.weather.cards = [];
        this.clearAllWeatherEffects();
        
        const rows = ['close', 'ranged', 'siege'];
        
        rows.forEach(row => {
            this.gameState.player.rows[row].cards.forEach(card => {
                this.addCardToDiscard(card, 'player');
            });
            
            this.gameState.opponent.rows[row].cards.forEach(card => {
                this.addCardToDiscard(card, 'opponent');
            });
            
            if (this.gameState.player.rows[row].tactic) {
                this.addCardToDiscard(this.gameState.player.rows[row].tactic, 'player');
            }
            
            if (this.gameState.opponent.rows[row].tactic) {
                this.addCardToDiscard(this.gameState.opponent.rows[row].tactic, 'opponent');
            }
            
            this.gameState.player.rows[row] = { cards: [], strength: 0, tactic: null };
            this.gameState.opponent.rows[row] = { cards: [], strength: 0, tactic: null };
        });
        
        this.clearAllBoardRows();
        this.displayWeatherCards();
        this.updateTotalScoreDisplays();
    },

    restoreAllCardStrengths: function() {
        const rows = ['close', 'ranged', 'siege'];
        const players = ['player', 'opponent'];
        
        rows.forEach(row => {
            players.forEach(player => {
                this.gameState[player].rows[row].cards.forEach(card => {
                    if (card.originalStrength !== undefined) {
                        card.strength = card.originalStrength;
                        delete card.originalStrength;
                    }
                });
            });
        });
    },

    invalidateScoreCache: function(player) {
        if (this.gameState[player]) {
            this.gameState[player].cachedTotalScore = undefined;
            this.gameState[player].cachedRowLengths = undefined;
        }
    },

    endGame: function() {
        const playerWins = this.gameState.roundsWon.player;
        const opponentWins = this.gameState.roundsWon.opponent;
        
        let gameWinner = null;
        if (playerWins > opponentWins) {
            gameWinner = 'player';
        } else if (opponentWins > playerWins) {
            gameWinner = 'opponent';
        } else {
            gameWinner = 'draw';
        }
        
        this.showGameResult(gameWinner);
    },

    clearAllBoardRows: function() {
        const rows = ['close', 'ranged', 'siege'];
        
        rows.forEach(row => {
            const playerRow = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
            const playerTactic = document.getElementById(`player${this.capitalizeFirst(row)}Tactics`);
            
            if (playerRow) playerRow.innerHTML = '';
            if (playerTactic) playerTactic.innerHTML = '';
            
            const opponentRow = document.getElementById(`opponent${this.capitalizeFirst(row)}Row`);
            const opponentTactic = document.getElementById(`opponent${this.capitalizeFirst(row)}Tactics`);
            
            if (opponentRow) opponentRow.innerHTML = '';
            if (opponentTactic) opponentTactic.innerHTML = '';
            
            const playerStrength = document.getElementById(`player${this.capitalizeFirst(row)}Strength`);
            const opponentStrength = document.getElementById(`opponent${this.capitalizeFirst(row)}Strength`);
            
            if (playerStrength) playerStrength.textContent = '0';
            if (opponentStrength) opponentStrength.textContent = '0';
        });
    },

    handleClearWeather: function(card) {
        this.playWeatherSound('clear');
        
        this.gameState.weather.cards.forEach(weatherCard => {
            const cardOwner = this.getWeatherCardOwner(weatherCard);
            this.addCardToDiscard(weatherCard, cardOwner);
        });
        
        this.gameState.weather.cards = [];
        this.gameState.weather.cards.push(card);
        this.clearAllWeatherEffects();
        this.restoreAllRowStrengths();
        this.displayWeatherCards();
    },

    removeCardFromHand: function(card, player) {
        const cardIndex = this.gameState[player].hand.findIndex(c => c.id === card.id);
        if (cardIndex !== -1) {
            this.gameState[player].hand.splice(cardIndex, 1);
            if (player === 'player') {
                this.displayPlayerHand();
            }
        }
    },

    handleRegularWeather: function(card) {
        const clearWeatherIndex = this.gameState.weather.cards.findIndex(
            weatherCard => this.isClearWeatherCard(weatherCard)
        );
        
        if (clearWeatherIndex !== -1) {
            const clearWeatherCard = this.gameState.weather.cards[clearWeatherIndex];
            const clearWeatherOwner = this.getWeatherCardOwner(clearWeatherCard);
            this.addCardToDiscard(clearWeatherCard, clearWeatherOwner);
            this.gameState.weather.cards.splice(clearWeatherIndex, 1);
            
            this.clearAllWeatherEffects();
            this.restoreAllRowStrengths();
        }
        
        if (!card.owner) {
            card.owner = this.gameState.currentPlayer === 'player' ? 'player' : 'opponent';
        }
        
        this.gameState.weather.cards.push(card);
        this.applyWeatherEffect(card);
        this.displayWeatherCards();
    },

    applyWeatherEffect: function(card) {
        const weatherEffect = this.getWeatherEffectForCard(card);
        if (!weatherEffect) return;
        
        const { rows, images, sounds } = weatherEffect;
        
        rows.forEach(row => {
            this.gameState.weather.effects[row] = {
                card: card,
                image: images[row],
                sound: sounds[row]
            };
            
            this.applyVisualWeatherEffect(row, images[row]);
            this.reduceRowStrengthTo1(row, 'player');
            this.reduceRowStrengthTo1(row, 'opponent');
            
            if (sounds[row]) {
                this.playWeatherSound(sounds[row]);
            }
        });
        
        this.updateTotalScoreDisplays();
    },

    clearAllWeatherEffects: function() {
        const rows = ['close', 'ranged', 'siege'];
        
        rows.forEach(row => {
            this.gameState.weather.effects[row] = null;
            this.removeVisualWeatherEffect(row);
        });
    },

    restoreAllRowStrengths: function() {
        const rows = ['close', 'ranged', 'siege'];
        const players = ['player', 'opponent'];
        
        rows.forEach(row => {
            players.forEach(player => {
                this.gameState[player].rows[row].cards.forEach(card => {
                    if (card.originalStrength !== undefined) {
                        card.strength = card.originalStrength;
                        this.updateCardStrengthDisplay(card, row, player);
                        delete card.originalStrength;
                    }
                });
                this.updateRowStrength(row, player);
            });
        });
        
        this.updateTotalScoreDisplays();
    },
    
    reduceRowStrengthTo1: function(row, player) {
        this.gameState[player].rows[row].cards.forEach(card => {
            if (card.strength > 1) {
                card.originalStrength = card.strength;
                card.strength = 1;
                this.updateCardStrengthDisplay(card, row, player);
            }
        });
        this.updateRowStrength(row, player);
    },

    updateControlButtons: function() {
        const passBtn = document.getElementById('passBtn');
        const endTurnBtn = document.getElementById('endTurnBtn');
        
        if (!passBtn || !endTurnBtn) return;
        
        const isPlayerTurn = this.gameState.gamePhase === 'playerTurn';
        const playerPassed = this.gameState.player.passed;
        const canPlayMoreCards = this.gameState.cardsPlayedThisTurn < this.gameState.maxCardsPerTurn;
        
        passBtn.disabled = !isPlayerTurn || playerPassed || !canPlayMoreCards;
        endTurnBtn.disabled = !isPlayerTurn || (canPlayMoreCards && !playerPassed);
        
        passBtn.style.opacity = (!isPlayerTurn || playerPassed || !canPlayMoreCards) ? '0.5' : '1';
        passBtn.style.cursor = (!isPlayerTurn || playerPassed || !canPlayMoreCards) ? 'not-allowed' : 'pointer';
        
        endTurnBtn.style.opacity = (!isPlayerTurn || (canPlayMoreCards && !playerPassed)) ? '0.5' : '1';
        endTurnBtn.style.cursor = (!isPlayerTurn || (canPlayMoreCards && !playerPassed)) ? 'not-allowed' : 'pointer';
        
        if (isPlayerTurn && !canPlayMoreCards) {
            endTurnBtn.style.background = '#4CAF50';
            endTurnBtn.textContent = 'Завершить ход ✓';
        } else if (isPlayerTurn && playerPassed) {
            endTurnBtn.style.background = '#ff9800';
            endTurnBtn.textContent = 'Ожидание противника';
        } else {
            endTurnBtn.style.background = '';
            endTurnBtn.textContent = 'Завершить ход';
        }
        
        if (playerPassed) {
            passBtn.textContent = 'Пас ✓';
            passBtn.style.background = '#ff9800';
        } else {
            passBtn.textContent = 'Пас';
            passBtn.style.background = '';
        }
    },

    updateAllDisplays: function() {
        this.displayPlayerHand();
        this.displayPlayerDeck();
        this.displayOpponentDeck();
        this.displayPlayerDiscard();
        this.displayOpponentDiscard();
        this.displayWeatherCards();
        
        const rows = ['close', 'ranged', 'siege'];
        rows.forEach(row => {
            this.updateRowStrength(row, 'player');
            this.updateRowStrength(row, 'opponent');
        });
    },

    createTotalScoreDisplays: function() {
        const gameBoard = document.querySelector('.game-board');
        const playerLeader = document.getElementById('playerLeader');
        const opponentLeader = document.getElementById('opponentLeader');
        
        if (!gameBoard || !playerLeader || !opponentLeader) return;
        
        const opponentScoreDisplay = document.createElement('div');
        opponentScoreDisplay.id = 'opponentTotalScore';
        opponentScoreDisplay.className = 'total-score-display opponent-total-score';
        opponentScoreDisplay.style.cssText = `
            position: absolute;
            z-index: 100;
            text-align: center;
        `;
        
        opponentScoreDisplay.innerHTML = `
            <div class="score-background" style="
                background: url('board/score.png') center/contain no-repeat;
                width: 120px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                left: 150px;
                top: 80px;
            ">
                <div class="score-value" style="
                    color: #f44336;
                    font-size: 24px;
                    font-weight: bold;
                    font-family: 'Gwent', sans-serif;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                    margin-bottom: 5px;
                ">0</div>
            </div>
        `;
        
        const playerScoreDisplay = document.createElement('div');
        playerScoreDisplay.id = 'playerTotalScore';
        playerScoreDisplay.className = 'total-score-display player-total-score';
        playerScoreDisplay.style.cssText = `
            position: absolute;
            z-index: 100;
            text-align: center;
        `;
        
        playerScoreDisplay.innerHTML = `
            <div class="score-background" style="
                background: url('board/score.png') center/contain no-repeat;
                width: 120px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                left: 150px;
                bottom: 85px;
            ">
                <div class="score-value" style="
                    color: #4CAF50;
                    font-size: 24px;
                    font-weight: bold;
                    font-family: 'Gwent', sans-serif;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                    margin-bottom: 5px;
                ">0</div>
            </div>
        `;
        
        gameBoard.appendChild(opponentScoreDisplay);
        gameBoard.appendChild(playerScoreDisplay);
    },

    updateTotalScoreDisplays: function() {
        const playerTotalScore = this.calculateTotalScore('player');
        const opponentTotalScore = this.calculateTotalScore('opponent');
        
        const playerScoreElement = document.getElementById('playerTotalScore');
        const opponentScoreElement = document.getElementById('opponentTotalScore');
        
        if (playerScoreElement) {
            const scoreValue = playerScoreElement.querySelector('.score-value');
            if (scoreValue) {
                scoreValue.textContent = playerTotalScore;
                scoreValue.classList.add('score-update');
                setTimeout(() => {
                    scoreValue.classList.remove('score-update');
                }, 500);
            }
        }
        
        if (opponentScoreElement) {
            const scoreValue = opponentScoreElement.querySelector('.score-value');
            if (scoreValue) {
                scoreValue.textContent = opponentTotalScore;
                scoreValue.classList.add('score-update');
                setTimeout(() => {
                    scoreValue.classList.remove('score-update');
                }, 500);
            }
        }
    },

    completeCardPlay: function() {
        this.gameState.selectedCard = null;
        this.gameState.selectingRow = false;
        this.gameState.cardsPlayedThisTurn++;
        this.updateTotalScoreDisplays();
        this.resetTimeoutCounter();
        
        if (this.gameState.cardsPlayedThisTurn >= this.gameState.maxCardsPerTurn) {
            this.showGameMessage('Лимит карт за ход достигнут', 'info');
            setTimeout(() => {
                this.handleTurnEnd();
            }, 800);
        } else {
            this.updateControlButtons();
        }
        
        if (window.playerModule && window.playerModule.cancelRowSelection) {
            window.playerModule.cancelRowSelection();
        }
    },

    endTurn: function() {
        this.gameState.cardsPlayedThisTurn = 0;
        this.handleTurnCompletion();
    },

    addCardToDiscard: function(card, player) {
        this.gameState[player].discard.push(card);
        this.updateDiscardDisplay(player);
    },

    getWeatherCardOwner: function(weatherCard) {
        if (weatherCard.owner) return weatherCard.owner;
        if (weatherCard.id && weatherCard.id.includes('opponent')) return 'opponent';
        return 'player';
    },

    isClearWeatherCard: function(card) {
        return card.name === 'Чистое небо' || card.id === 'neutral_special_4';
    },

    getWeatherEffectForCard: function(card) {
        const weatherEffects = {
            'Трескучий мороз': { 
                rows: ['close'], 
                images: {'close': 'board/frost.png'}, 
                sounds: {'close': 'frost'} 
            },
            'Белый Хлад': { 
                rows: ['close', 'ranged'], 
                images: {'close': 'board/frost.png', 'ranged': 'board/fog.png'},
                sounds: {'close': 'frost', 'ranged': 'fog'}
            },
            'Густой туман': { 
                rows: ['ranged'], 
                images: {'ranged': 'board/fog.png'},
                sounds: {'ranged': 'fog'}
            },
            'Проливной дождь': { 
                rows: ['siege'], 
                images: {'siege': 'board/rain.png'},
                sounds: {'siege': 'rain'}
            },
            'Шторм Скеллиге': { 
                rows: ['ranged', 'siege'], 
                images: {'ranged': 'board/fog.png', 'siege': 'board/rain.png'},
                sounds: {'ranged': 'fog', 'siege': 'rain'}
            },
            'Чистое небо': { 
                rows: [], 
                images: {},
                sounds: {'clear': 'clear'}
            }
        };
        return weatherEffects[card.name];
    },

    playWeatherSound: function(soundType) {
        if (window.audioManager && window.audioManager.playWeatherSound) {
            window.audioManager.playWeatherSound(soundType);
        }
    },

    endPlayerTurn: function() {
        this.startOpponentTurn();
    },

    checkRoundEnd: function() {
        if (this.gameState.player.passed && this.gameState.opponent.passed) {
            this.showGameMessage('Оба игрока пасовали! Конец раунда', 'warning');
            setTimeout(() => this.endRound(), 1500);
        } else {
            let nextPlayer;
            if (this.gameState.player.passed && !this.gameState.opponent.passed) {
                nextPlayer = 'opponent';
            } else if (!this.gameState.player.passed && this.gameState.opponent.passed) {
                nextPlayer = 'player';
            } else {
                nextPlayer = this.gameState.currentPlayer === 'player' ? 'opponent' : 'player';
            }
            
            if (nextPlayer === 'player') {
                this.startPlayerTurn();
            } else {
                this.startOpponentTurn();
            }
        }
    },

    addCardToDiscard: function(card, player) {
        this.gameState[player].discard.push(card);
        this.updateDiscardDisplay(player);
    },

    dealAdditionalCards: function() {
        const mode = this.gameState.gameSettings.mode;
        
        if (mode === 'classic') {
            return;
        }
        
        const targetHandSize = 10;
        this.shuffleDeck('player');
        this.shuffleDeck('opponent');
        
        const playerCurrentHandSize = this.gameState.player.hand.length;
        const playerCardsNeeded = targetHandSize - playerCurrentHandSize;
        
        if (playerCardsNeeded > 0 && this.gameState.player.deck.length > 0) {
            const cardsToDeal = Math.min(playerCardsNeeded, this.gameState.player.deck.length);
            const newCards = this.gameState.player.deck.splice(0, cardsToDeal);
            this.gameState.player.hand.push(...newCards);
        }
        
        const opponentCurrentHandSize = this.gameState.opponent.hand.length;
        const opponentCardsNeeded = targetHandSize - opponentCurrentHandSize;
        
        if (opponentCardsNeeded > 0 && this.gameState.opponent.deck.length > 0) {
            const cardsToDeal = Math.min(opponentCardsNeeded, this.gameState.opponent.deck.length);
            const newCards = this.gameState.opponent.deck.splice(0, cardsToDeal);
            this.gameState.opponent.hand.push(...newCards);
        }
        
        this.displayPlayerHand();
        this.displayPlayerDeck();
        this.displayOpponentDeck();
    },

    displayPlayerHand: function() {
        const handContainer = document.getElementById('playerHand');
        if (!handContainer) return;

        handContainer.innerHTML = '';
        this.gameState.player.hand.forEach((card, index) => {
            const cardElement = this.createHandCardElement(card, index);
            handContainer.appendChild(cardElement);
        });
    },

    displayCardOnRow: function(row, card, player = 'player') {
        const rowElement = document.getElementById(`${player}${this.capitalizeFirst(row)}Row`);
        if (!rowElement) return;

        const cardElement = player === 'player' ? 
            this.createBoardCardElement(card, 'unit') : 
            this.createOpponentBoardCardElement(card);
            
        rowElement.appendChild(cardElement);
    },

    displayTacticCard: function(row, card, player = 'player') {
        const tacticSlot = document.getElementById(`${player}${this.capitalizeFirst(row)}Tactics`);
        if (!tacticSlot) return;

        tacticSlot.innerHTML = '';
        const cardElement = player === 'player' ? 
            this.createBoardCardElement(card, 'tactic') : 
            this.createOpponentBoardCardElement(card);
            
        tacticSlot.appendChild(cardElement);
    },

    updateRowStrength: function(row, player = 'player') {
        const rowState = this.gameState[player].rows[row];
        const totalStrength = rowState.cards.reduce((sum, card) => sum + (card.strength || 0), 0);
        rowState.strength = totalStrength;
        
        const strengthElement = document.getElementById(`${player}${this.capitalizeFirst(row)}Strength`);
        if (strengthElement) {
            strengthElement.textContent = totalStrength;
            strengthElement.classList.add('strength-update');
            setTimeout(() => strengthElement.classList.remove('strength-update'), 500);
        }
        
        this.updateTotalScoreDisplays();
    },

    getCardMediaPath: function(card) {
        const cardDisplayMode = window.settingsModule ? window.settingsModule.getCardDisplayMode() : 'animated';
        
        let mediaPath = `card/${card.faction}/${card.image}`;
        let isVideo = card.image && card.image.endsWith('.mp4');
        
        if (cardDisplayMode === 'static' && isVideo) {
            mediaPath = mediaPath.replace('.mp4', '.jpg');
            isVideo = false;
        }
        
        return { mediaPath, isVideo };
    },

    createHandCardElement: function(card, index) {
        const cardElement = document.createElement('div');
        cardElement.className = `hand-card ${card.type} ${card.rarity}`;
        cardElement.dataset.cardId = card.id;
        cardElement.dataset.handIndex = index;
        
        const { mediaPath, isVideo } = this.getCardMediaPath(card);

        let mediaElement = isVideo ? 
            `<video class="hand-card-media" muted playsinline preload="metadata"><source src="${mediaPath}" type="video/mp4"></video>` :
            `<img src="${mediaPath}" alt="${card.name}" class="hand-card-media" onerror="this.src='card/placeholder.jpg'">`;

        let topRightElement = card.type === 'unit' ? 
            `<div class="hand-card-strength">${card.strength || 0}</div>` :
            `<div class="hand-card-type-icon"><img src="${this.getTypeIconPath(card.type)}" alt="${card.type}"></div>`;

        let positionElement = '';
        if (card.type === 'unit' && card.position) {
            let positions = [];
            if (Array.isArray(card.position)) {
                positions = card.position;
            } else {
                positions = [card.position];
            }
            
            const displayPosition = positions.length > 1 ? 'any' : positions[0];
            const positionIconPath = this.getPositionIconPath(displayPosition);
            
            positionElement = `
                <div class="hand-card-position">
                    <img src="${card.positionBanner || 'deck/position_banner.png'}" alt="Позиция" class="hand-card-position-banner">
                    <img src="${positionIconPath}" alt="${displayPosition}" class="hand-card-position-icon">
                </div>
            `;
            
            if (positions.length > 1) {
                cardElement.title = `Доступные ряды: ${positions.join(', ').replace(/-row/g, '')}`;
            }
        }

        cardElement.innerHTML = `
            <div class="hand-card-container">
                ${mediaElement}
                <img src="${card.border || 'deck/bord_bronze.png'}" alt="Рамка" class="hand-card-border">
                <img src="${card.banner || `faction/${card.faction}/banner_bronze.png`}" alt="Баннер" class="hand-card-banner">
                <div class="hand-card-name">${card.name || 'Неизвестная карта'}</div>
                ${topRightElement}
                ${positionElement}
            </div>
        `;

        this.setupHandCardEventListeners(cardElement, card);
        return cardElement;
    },

    createBoardCardElement: function(card, cardType) {
        const cardElement = document.createElement('div');
        cardElement.className = `board-card ${cardType} ${card.rarity}`;
        cardElement.dataset.cardId = card.id;
        
        const { mediaPath, isVideo } = this.getCardMediaPath(card);

        let mediaElement = '';
        if (isVideo) {
            mediaElement = `
                <video class="board-card-media" muted playsinline preload="metadata">
                    <source src="${mediaPath}" type="video/mp4">
                </video>
            `;
        } else {
            mediaElement = `<img src="${mediaPath}" alt="${card.name}" class="board-card-media" onerror="this.src='card/placeholder.jpg'">`;
        }

        let topRightElement = '';
        if (card.strength) {
            topRightElement = `<div class="board-card-strength">${card.strength}</div>`;
        } else {
            const typeIconPath = this.getTypeIconPath(card.type);
            topRightElement = `
                <div class="board-card-type-icon">
                    <img src="${typeIconPath}" alt="${card.type}">
                </div>
            `;
        }

        let positionElement = '';
        if (card.type === 'unit' && card.position) {
            let positions = [];
            if (Array.isArray(card.position)) {
                positions = card.position;
            } else {
                positions = [card.position];
            }
            
            const displayPosition = positions.length > 1 ? 'any' : positions[0];
            const positionIconPath = this.getPositionIconPath(displayPosition);
            
            positionElement = `
                <div class="board-card-position">
                    <img src="${card.positionBanner || 'deck/position_banner.png'}" alt="Позиция" class="board-card-position-banner">
                    <img src="${positionIconPath}" alt="${displayPosition}" class="board-card-position-icon">
                </div>
            `;
        }

        cardElement.innerHTML = `
            <div class="board-card-container">
                ${mediaElement}
                <img src="${card.border || 'deck/bord_bronze.png'}" alt="Рамка" class="board-card-border">
                <img src="${card.banner || `faction/${card.faction}/banner_bronze.png`}" alt="Баннер" class="board-card-banner">
                <div class="board-card-name">${card.name || 'Неизвестная карта'}</div>
                ${topRightElement}
                ${positionElement}
            </div>
        `;

        cardElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.showCardModal(card);
        });

        cardElement.addEventListener('mouseenter', () => {
            audioManager.playSound('touch');
            
            const video = cardElement.querySelector('video');
            if (video) {
                video.currentTime = 0;
                video.play().catch(e => {});
                video.loop = true;
            }
        });

        cardElement.addEventListener('mouseleave', () => {
            const video = cardElement.querySelector('video');
            if (video) {
                video.pause();
                video.currentTime = 0;
                video.loop = false;
            }
        });

        return cardElement;
    },

    createWeatherCardElement: function(card, index) {
        const cardElement = document.createElement('div');
        cardElement.className = 'weather-card';
        cardElement.dataset.cardId = card.id;
        cardElement.dataset.weatherIndex = index;
        
        const { mediaPath, isVideo } = this.getCardMediaPath(card);

        let mediaElement = '';
        if (isVideo) {
            mediaElement = `
                <video class="weather-card-media" muted playsinline preload="metadata">
                    <source src="${mediaPath}" type="video/mp4">
                </video>
            `;
        } else {
            mediaElement = `<img src="${mediaPath}" alt="${card.name}" class="weather-card-media" onerror="this.src='card/placeholder.jpg'">`;
        }

        let topRightElement = '';
        if (card.strength) {
            topRightElement = `<div class="weather-card-strength">${card.strength}</div>`;
        } else {
            const typeIconPath = this.getTypeIconPath(card.type);
            topRightElement = `
                <div class="weather-card-type-icon">
                    <img src="${typeIconPath}" alt="${card.type}">
                </div>
            `;
        }

        cardElement.innerHTML = `
            <div class="weather-card-container">
                ${mediaElement}
                <img src="${card.border || 'deck/bord_bronze.png'}" alt="Рамка" class="weather-card-border">
                <img src="${card.banner || `faction/${card.faction}/banner_bronze.png`}" alt="Баннер" class="weather-card-banner">
                <div class="weather-card-name">${card.name || 'Неизвестная карта'}</div>
                ${topRightElement}
            </div>
        `;

        cardElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.showCardModal(card);
        });

        cardElement.addEventListener('click', () => {
            audioManager.playSound('touch');
        });

        cardElement.addEventListener('mouseenter', () => {
            audioManager.playSound('touch');
            
            const video = cardElement.querySelector('video');
            if (video) {
                video.currentTime = 0;
                video.play().catch(e => {});
                video.loop = true;
            }
        });

        cardElement.addEventListener('mouseleave', () => {
            const video = cardElement.querySelector('video');
            if (video) {
                video.pause();
                video.currentTime = 0;
                video.loop = false;
            }
        });

        return cardElement;
    },

    displayWeatherCards: function() {
        const weatherSlot = document.getElementById('weatherSlot');
        if (!weatherSlot) return;

        const opponentScoreDisplay = document.getElementById('opponentTotalScore');
        const playerScoreDisplay = document.getElementById('playerTotalScore');
        
        const weatherContainer = weatherSlot.querySelector('.weather-cards-container');
        if (weatherContainer) {
            weatherContainer.remove();
        }
        
        if (this.gameState.weather.cards.length > 0) {
            const newWeatherContainer = document.createElement('div');
            newWeatherContainer.className = 'weather-cards-container';
            
            const uniqueCards = [];
            const seenCardIds = new Set();
            
            this.gameState.weather.cards.forEach((card, index) => {
                if (!seenCardIds.has(card.id)) {
                    seenCardIds.add(card.id);
                    uniqueCards.push(card);
                    
                    const cardElement = this.createWeatherCardElement(card, index);
                    newWeatherContainer.appendChild(cardElement);
                }
            });

            weatherSlot.appendChild(newWeatherContainer);
        }
        
        if (!opponentScoreDisplay || !document.getElementById('opponentTotalScore')) {
            this.restoreScoreDisplays();
        }
        
        this.updateWeatherCounter();
    },

    restoreScoreDisplays: function() {
        const weatherSlot = document.getElementById('weatherSlot');
        if (!weatherSlot) return;
        
        if (!document.getElementById('opponentTotalScore')) {
            const opponentScoreDisplay = document.createElement('div');
            opponentScoreDisplay.id = 'opponentTotalScore';
            opponentScoreDisplay.className = 'total-score-display opponent-total-score';
            opponentScoreDisplay.style.cssText = `
                position: absolute;
                top: -80px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 100;
                text-align: center;
            `;
            
            opponentScoreDisplay.innerHTML = `
                <div class="score-background" style="
                    background: url('board/score.png') center/contain no-repeat;
                    width: 120px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                ">
                    <div class="score-value" style="
                        color: #f44336;
                        font-size: 24px;
                        font-weight: bold;
                        font-family: 'Gwent', sans-serif;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                        margin-top: 5px;
                    ">0</div>
                </div>
            `;
            
            weatherSlot.appendChild(opponentScoreDisplay);
        }
        
        if (!document.getElementById('playerTotalScore')) {
            const playerScoreDisplay = document.createElement('div');
            playerScoreDisplay.id = 'playerTotalScore';
            playerScoreDisplay.className = 'total-score-display player-total-score';
            playerScoreDisplay.style.cssText = `
                position: absolute;
                bottom: -80px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 100;
                text-align: center;
            `;
            
            playerScoreDisplay.innerHTML = `
                <div class="score-background" style="
                    background: url('board/score.png') center/contain no-repeat;
                    width: 120px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                ">
                    <div class="score-value" style="
                        color: #4CAF50;
                        font-size: 24px;
                        font-weight: bold;
                        font-family: 'Gwent', sans-serif;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                        margin-top: 5px;
                    ">0</div>
                </div>
            `;
            
            weatherSlot.appendChild(playerScoreDisplay);
        }
        
        this.updateTotalScoreDisplays();
    },

    updateTurnIndicator: function() {
        const turnElement = document.getElementById('currentTurn');
        const cardsCountElement = document.getElementById('cardsPlayedCount');
        const maxCardsElement = document.getElementById('maxCardsPerTurn');
        
        if (turnElement) {
            turnElement.textContent = this.gameState.currentPlayer === 'player' ? 'Ваш ход' : 'Ход противника';
        }
        
        if (cardsCountElement && maxCardsElement) {
            cardsCountElement.textContent = this.gameState.cardsPlayedThisTurn;
            maxCardsElement.textContent = this.gameState.maxCardsPerTurn;
        }
        
        this.updateRoundCounter();
        this.updateWinsIndicator();
    },

    updateRoundCounter: function() {
        const roundImage = document.getElementById('roundImage');
        if (!roundImage) return;
        
        const roundImages = {
            1: 'board/round1.png',
            2: 'board/round2.png', 
            3: 'board/round3.png'
        };
        
        roundImage.src = roundImages[this.gameState.currentRound] || 'board/round1.png';
        roundImage.alt = `Раунд ${this.gameState.currentRound}`;
        
        roundImage.style.animation = 'roundChange 0.5s ease-out';
        setTimeout(() => {
            roundImage.style.animation = '';
        }, 500);
    },

    updateWinsIndicator: function() {
        let winsIndicator = document.getElementById('winsIndicator');
        if (!winsIndicator) {
            winsIndicator = document.createElement('div');
            winsIndicator.id = 'winsIndicator';
            winsIndicator.className = 'wins-indicator';
            document.querySelector('.game-board').appendChild(winsIndicator);
        }
        
        const playerWins = this.gameState.roundsWon.player;
        const opponentWins = this.gameState.roundsWon.opponent;
        
        winsIndicator.innerHTML = '';
        
        for (let i = 0; i < 2; i++) {
            const winCircle = document.createElement('div');
            winCircle.className = 'win-circle';
            
            if (i < playerWins) {
                winCircle.classList.add('player');
            } else if (i < opponentWins) {
                winCircle.classList.add('opponent');
            } else {
                winCircle.classList.add('empty');
            }
            
            winsIndicator.appendChild(winCircle);
        }
    },

    loadPlayerDeck: function() {
        if (window.deckModule && window.deckModule.currentDeck) {
            const playerDeck = window.deckModule.currentDeck;
            this.gameState.player.deck = this.shuffleArray([...playerDeck.cards]);
            this.gameState.player.faction = playerDeck.faction;
            this.gameState.player.ability = playerDeck.ability;
        } else {
            this.loadDemoDeck('player');
        }
        
        this.displayPlayerDeck();
    },

    loadOpponentDeck: function() {
        const availableFactions = this.getAvailableFactions();
        if (availableFactions.length === 0) {
            availableFactions.push(...Object.values(window.factionModule?.factionsData || {}));
        }
        
        const randomFaction = availableFactions[Math.floor(Math.random() * availableFactions.length)];
        const factionCards = window.cardsModule?.getFactionCards(randomFaction.id);
        
        if (factionCards) {
            this.gameState.opponent.deck = this.createBalancedDeck(factionCards, randomFaction.id);
            this.gameState.opponent.faction = randomFaction.id;
            this.gameState.opponent.ability = this.getRandomFactionAbility(randomFaction.id);
        } else {
            this.loadDemoDeck('opponent');
        }
        
        this.displayOpponentDeck();
    },

    setupPlayerLeader: function() {
        const leaderSlot = document.getElementById('playerLeader');
        if (!leaderSlot) return;

        const faction = this.gameState.player.faction;
        const factionData = window.factionModule?.factionsData[faction];
        if (!factionData) return;

        const leaderCardData = {
            id: `${faction}_leader`,
            name: factionData.leaderName.split(' ')[0],
            namefull: factionData.leaderName,
            type: 'leader',
            faction: faction,
            image: `leader.mp4`, 
            imageStatic: `leader.jpg`,
            description: factionData.description,
            ability: `${faction}_ability`,
            rarity: 'gold',
            tags: ['leader'],
            border: 'deck/bord_gold.png',
            banner: `faction/${faction}/banner_gold.png`
        };

        this.gameState.player.leader = leaderCardData;
        leaderSlot.appendChild(this.createLeaderCardElement(leaderCardData, 'player'));
    },
    
    setupOpponentLeader: function() {
        const leaderSlot = document.getElementById('opponentLeader');
        if (!leaderSlot) return;

        const faction = this.gameState.opponent.faction;
        const factionData = window.factionModule?.factionsData[faction];
        if (!factionData) return;

        const leaderCardData = {
            id: `${faction}_leader_opponent`,
            name: factionData.leaderName.split(' ')[0],
            namefull: factionData.leaderName,
            type: 'leader',
            faction: faction,
            image: `leader.mp4`,
            imageStatic: `leader.jpg`,
            description: factionData.description,
            ability: `${faction}_ability`,
            rarity: 'gold',
            tags: ['leader'],
            border: 'deck/bord_gold.png',
            banner: `faction/${faction}/banner_gold.png`
        };

        this.gameState.opponent.leader = leaderCardData;
        leaderSlot.appendChild(this.createLeaderCardElement(leaderCardData, 'opponent'));
    },
    
    dealInitialHands: function() {
        const handSize = this.gameState.gameSettings.initialHandSize;
        
        this.shuffleDeck('player');
        this.shuffleDeck('opponent');
        
        this.gameState.player.hand = this.gameState.player.deck.splice(0, 
            Math.min(handSize, this.gameState.player.deck.length));
        this.gameState.opponent.hand = this.gameState.opponent.deck.splice(0, 
            Math.min(handSize, this.gameState.opponent.deck.length));

        this.displayPlayerHand();
        this.displayPlayerDeck();
        this.displayOpponentDeck();
    },
    
    shuffleDeck: function(player) {
        const deck = this.gameState[player].deck;
        
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        
        return deck;
    },

    getAvailableFactions: function() {
        const allFactions = Object.values(window.factionModule?.factionsData || {});
        const playerFaction = this.gameState.player.faction;
        return playerFaction ? allFactions.filter(faction => faction.id !== playerFaction) : allFactions;
    },

    createBalancedDeck: function(factionCards, factionId) {
        const deck = [];
        const unitCards = [...(factionCards.units || [])];
        const specialCards = [...(factionCards.specials || [])];
        const artifactCards = [...(factionCards.artifacts || [])];
        const tacticCards = [...(factionCards.tactics || [])];
        
        const neutralCards = window.cardsModule?.getFactionCards('neutral');
        if (neutralCards) {
            unitCards.push(...(neutralCards.units || []).slice(0, 3));
            specialCards.push(...(neutralCards.specials || []).slice(0, 2));
        }
        
        this.shuffleArray(unitCards);
        this.shuffleArray(specialCards);
        this.shuffleArray(artifactCards);
        this.shuffleArray(tacticCards);
        
        const targetDeckSize = 25 + Math.floor(Math.random() * 6);
        const unitCount = Math.floor(targetDeckSize * 0.7);
        const specialCount = Math.floor(targetDeckSize * 0.2);
        
        deck.push(...unitCards.slice(0, Math.min(unitCount, unitCards.length)));
        deck.push(...specialCards.slice(0, Math.min(specialCount, specialCards.length)));
        
        const remainingCount = targetDeckSize - deck.length;
        if (remainingCount > 0) {
            const availableArtifactsTactics = [...artifactCards, ...tacticCards];
            this.shuffleArray(availableArtifactsTactics);
            deck.push(...availableArtifactsTactics.slice(0, Math.min(remainingCount, availableArtifactsTactics.length)));
        }
        
        this.shuffleArray(deck);
        return deck;
    },

    getRandomFactionAbility: function(factionId) {
        const abilities = window.deckModule?.factionAbilities?.[factionId];
        return abilities && abilities.length > 0 ? 
            abilities[Math.floor(Math.random() * abilities.length)].id : 'default_ability';
    },

    shuffleArray: function(array) {
        if (!array || array.length === 0) return array;
        
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        return shuffled;
    },

    startNewRound: function() {
        this.gameState.currentRound++;
        if (window.audioManager && window.audioManager.playSound) {
            audioManager.playSound('round_start');
        }
        if (window.factionAbilitiesModule) {
            window.factionAbilitiesModule.handleRound3ForSkellige(this.gameState);
        }
        
        const mode = this.gameState.gameSettings.mode;
        
        if (mode === 'classic') {
            this.showGameMessage(`Классический режим | Раунд ${this.gameState.currentRound}`, 'info');
        } else {
            this.showGameMessage(`CDPRed режим | Раунд ${this.gameState.currentRound}`, 'info');
        }
        
        this.updateRoundCounter();
        this.resetRoundState();
        this.dealAdditionalCards();
        this.startPlayerTurn();
    },

    displayPlayerDeck: function() {
        const deckSlot = document.getElementById('playerDeck');
        if (!deckSlot) return;

        deckSlot.innerHTML = '';

        const deckElement = document.createElement('div');
        deckElement.className = 'deck-visual';
        
        const faction = this.gameState.player.faction;
        const cardBackPath = `faction/${faction}/card.png`;
        
        deckElement.innerHTML = `
            <div class="deck-stack">
                <img src="${cardBackPath}" alt="Колода игрока" class="deck-card-back"
                     onerror="this.src='faction/neutral/cardpng'">
                <div class="deck-count">${this.gameState.player.deck.length}</div>
            </div>
        `;

        deckSlot.appendChild(deckElement);
    },

    displayOpponentDeck: function() {
        const deckSlot = document.getElementById('opponentDeck');
        if (!deckSlot) return;

        deckSlot.innerHTML = `
            <div class="deck-visual opponent-deck">
                <div class="deck-stack">
                    <img src="faction/${this.gameState.opponent.faction}/card.png" 
                         alt="Колода противника" class="deck-card-back opponent-card-back"
                     onerror="this.src='faction/neutral/card.png'">
                    <div class="deck-count opponent-deck-count">${this.gameState.opponent.deck.length}</div>
                </div>
            </div>
        `;
    },

    displayPlayerDiscard: function() {
        const discardSlot = document.getElementById('playerDiscard');
        if (!discardSlot) return;

        discardSlot.innerHTML = '';

        const discardElement = document.createElement('div');
        discardElement.className = 'discard-visual';
        
        const faction = this.gameState.player.faction;
        const cardBackPath = `board/discard.jpg`;
        
        discardElement.innerHTML = `
            <div class="discard-stack">
                <img src="${cardBackPath}" alt="Сброс игрока" class="discard-card-back"
                     onerror="this.src='board/discard.jpg'">
                <div class="discard-count">${this.gameState.player.discard.length}</div>
            </div>
        `;

        discardSlot.appendChild(discardElement);
    },

    displayOpponentDiscard: function() {
        const discardSlot = document.getElementById('opponentDiscard');
        if (!discardSlot) return;

        discardSlot.innerHTML = '';

        const discardElement = document.createElement('div');
        discardElement.className = 'discard-visual opponent-discard';
        
        const faction = this.gameState.opponent.faction;
        const cardBackPath = `board/discard.jpg`;
        
        discardElement.innerHTML = `
            <div class="discard-stack">
                <img src="${cardBackPath}" alt="Сброс противника" class="discard-card-back opponent-discard-back"
                     onerror="this.src='board/discard.jpg'">
                <div class="discard-count opponent-discard-count">${this.gameState.opponent.discard.length}</div>
            </div>
        `;

        discardSlot.appendChild(discardElement);
    },

    createLeaderCardElement: function(leaderData, owner) {
        const leaderElement = document.createElement('div');
        leaderElement.className = `leader-card-on-board ${owner === 'opponent' ? 'opponent-leader' : ''}`;
        leaderElement.dataset.cardId = leaderData.id;
        
        const cardDisplayMode = this.currentSettings.cardDisplayMode;
        
        let mediaPath;
        let isVideo;
        
        if (cardDisplayMode === 'static' && leaderData.imageStatic) {
            mediaPath = `faction/${leaderData.faction}/${leaderData.imageStatic}`;
            isVideo = false;
        } else {
            mediaPath = `faction/${leaderData.faction}/${leaderData.image}`;
            isVideo = leaderData.image.endsWith('.mp4');
        }
        
        let mediaElement = '';
        if (isVideo) {
            mediaElement = `
                <video class="leader-card-media ${owner === 'opponent' ? 'opponent-leader-media' : ''}" 
                       autoplay loop muted playsinline>
                    <source src="${mediaPath}" type="video/mp4">
                </video>
            `;
        } else {
            mediaElement = `<img src="${mediaPath}" alt="${leaderData.name}" class="leader-card-media ${owner === 'opponent' ? 'opponent-leader-media' : ''}" onerror="this.onerror=null; this.src='faction/${leaderData.faction}/leader.jpg'">`;
        }

        leaderElement.innerHTML = `
            <div class="leader-card-container ${owner === 'opponent' ? 'opponent-leader-container' : ''}">
                ${mediaElement}
                <img src="${leaderData.border}" alt="Рамка" class="leader-card-border">
                <img src="${leaderData.banner}" alt="Баннер" class="leader-card-banner">
                <div class="leader-card-name ${owner === 'opponent' ? 'opponent-leader-name' : ''}">${leaderData.name}</div>
            </div>
        `;

        this.setupLeaderCardEventListeners(leaderElement, leaderData);
        return leaderElement;
    },

    updateCardDisplay: function(card, row, player) {
        const rowElement = document.getElementById(`${player}${this.capitalizeFirst(row)}Row`);
        if (!rowElement) return;
        
        const existingCard = rowElement.querySelector(`[data-card-id="${card.id}"]`);
        if (existingCard) {
            existingCard.remove();
        }
        
        const newCardElement = player === 'player' ? 
            this.createBoardCardElement(card, 'unit') : 
            this.createOpponentBoardCardElement(card);
            
        rowElement.appendChild(newCardElement);
    },

    createOpponentBoardCardElement: function(card) {
        const cardElement = document.createElement('div');
        cardElement.className = `board-card opponent-card ${card.type} ${card.rarity}`;
        cardElement.dataset.cardId = card.id;
        
        const { mediaPath, isVideo } = this.getCardMediaPath(card);

        let mediaElement = isVideo ? 
            `<video class="board-card-media" muted playsinline preload="metadata"><source src="${mediaPath}" type="video/mp4"></video>` :
            `<img src="${mediaPath}" alt="${card.name}" class="board-card-media" onerror="this.src='card/placeholder.jpg'">`;

        let topRightElement = card.strength ? 
            `<div class="board-card-strength">${card.strength}</div>` :
            `<div class="board-card-type-icon"><img src="${this.getTypeIconPath(card.type)}" alt="${card.type}"></div>`;

        let positionElement = '';
        if (card.type === 'unit' && card.position) {
            let positions = [];
            if (Array.isArray(card.position)) {
                positions = card.position;
            } else {
                positions = [card.position];
            }
            
            const displayPosition = positions.length > 1 ? 'any' : positions[0];
            const positionIconPath = this.getPositionIconPath(displayPosition);
            
            positionElement = `
                <div class="board-card-position">
                    <img src="${card.positionBanner || 'deck/position_banner.png'}" alt="Позиция" class="board-card-position-banner">
                    <img src="${positionIconPath}" alt="${displayPosition}" class="board-card-position-icon">
                </div>
            `;
        }

        cardElement.innerHTML = `
            <div class="board-card-container">
                ${mediaElement}
                <img src="${card.border || 'deck/bord_bronze.png'}" alt="Рамка" class="board-card-border">
                <img src="${card.banner || `faction/${card.faction}/banner_bronze.png`}" alt="Баннер" class="board-card-banner">
                <div class="board-card-name">${card.name || 'Неизвестная карта'}</div>
                ${topRightElement}
                ${positionElement}
            </div>
        `;

        cardElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.showCardModal(card);
        });

        cardElement.addEventListener('mouseenter', () => {
            audioManager.playSound('touch');
            
            const video = cardElement.querySelector('video');
            if (video) {
                video.currentTime = 0;
                video.play().catch(e => {});
                video.loop = true;
            }
        });

        cardElement.addEventListener('mouseleave', () => {
            const video = cardElement.querySelector('video');
            if (video) {
                video.pause();
                video.currentTime = 0;
                video.loop = false;
            }
        });

        cardElement.style.animation = 'cardAppear 0.5s ease-out';

        return cardElement;
    },

    displayOpponentCardOnRow: function(row, card) {
        const rowElement = document.getElementById(`opponent${this.capitalizeFirst(row)}Row`);
        if (!rowElement) {
            return;
        }

        const cardElement = this.createOpponentBoardCardElement(card);
        rowElement.appendChild(cardElement);
    },

    displayOpponentTacticCard: function(row, card) {
        const tacticSlot = document.getElementById(`opponent${this.capitalizeFirst(row)}Tactics`);
        if (!tacticSlot) {
            return;
        }

        tacticSlot.innerHTML = '';
        const cardElement = this.createOpponentBoardCardElement(card);
        tacticSlot.appendChild(cardElement);
    },

    updateOpponentRowStrength: function(row) {
        const rowState = this.gameState.opponent.rows[row];
        const totalStrength = rowState.cards.reduce((sum, card) => sum + (card.strength || 0), 0);
        rowState.strength = totalStrength;
        
        const strengthElement = document.getElementById(`opponent${this.capitalizeFirst(row)}Strength`);
        if (strengthElement) {
            strengthElement.textContent = totalStrength;
            strengthElement.classList.add('strength-update');
            setTimeout(() => strengthElement.classList.remove('strength-update'), 500);
        }
    },

    setupEventListeners: function() {
        const passBtn = document.getElementById('passBtn');
        const endTurnBtn = document.getElementById('endTurnBtn');

        if (passBtn) {
            passBtn.addEventListener('click', () => {
                if (window.playerModule && window.playerModule.handlePass) {
                    window.playerModule.handlePass();
                }
            });
            passBtn.addEventListener('mouseenter', () => audioManager.playSound('touch'));
        }

        if (endTurnBtn) {
            endTurnBtn.addEventListener('click', () => {
                if (window.playerModule && window.playerModule.handleEndTurn) {
                    window.playerModule.handleEndTurn();
                }
            });
            endTurnBtn.addEventListener('mouseenter', () => audioManager.playSound('touch'));
        }

        this.setupDeckViewEventListeners();
    },

    setupDeckViewEventListeners: function() {
        const playerDeck = document.getElementById('playerDeck');
        if (playerDeck) {
            playerDeck.addEventListener('click', () => {
                if (this.gameState.player.deck.length > 0) {
                    this.showDeckModal('player', 'deck', 'Колода');
                }
            });
            playerDeck.addEventListener('mouseenter', () => audioManager.playSound('touch'));
        }

        const playerDiscard = document.getElementById('playerDiscard');
        if (playerDiscard) {
            playerDiscard.addEventListener('click', () => {
                if (this.gameState.player.discard.length > 0) {
                    this.showDeckModal('player', 'discard', 'Сброс');
                }
            });
            playerDiscard.addEventListener('mouseenter', () => audioManager.playSound('touch'));
        }

        const opponentDiscard = document.getElementById('opponentDiscard');
        if (opponentDiscard) {
            opponentDiscard.addEventListener('click', () => {
                if (this.gameState.opponent.discard.length > 0) {
                    this.showDeckModal('opponent', 'discard', 'Сброс противника');
                }
            });
            opponentDiscard.addEventListener('mouseenter', () => audioManager.playSound('touch'));
        }
    },

    setupHandCardEventListeners: function(cardElement, card) {
        cardElement.addEventListener('click', (event) => {
            if (event.button === 0 && this.gameState.gamePhase === 'playerTurn') {
                if (window.playerModule && window.playerModule.handleCardSelection) {
                    window.playerModule.handleCardSelection(card, cardElement);
                }
            }
        });

        cardElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.showCardModal(card);
        });

        const video = cardElement.querySelector('video');
        if (video) {
            cardElement.addEventListener('mouseenter', () => {
                video.currentTime = 0;
                video.play().catch(e => {});
                video.loop = true;
            });

            cardElement.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });
        }

        cardElement.addEventListener('mouseenter', () => {
            audioManager.playSound('touch');
        });
    },

    setupLeaderCardEventListeners: function(leaderElement, leaderData) {
        leaderElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.showCardModal(leaderData);
        });

        leaderElement.addEventListener('mouseenter', () => {
            audioManager.playSound('touch');
        });
    },

    sortDeckCards: function(cards) {
        return cards.slice().sort((a, b) => {
            if (a.strength && b.strength) {
                return a.strength - b.strength;
            }
            if (a.strength && !b.strength) {
                return -1;
            }
            if (!a.strength && b.strength) {
                return 1;
            }
            return 0;
        });
    },

    generateDeckCardsHTML: function(cards, isModal = false) {
        return cards.map(card => {
            let mediaPath;
            let isVideo;
            
            if (isModal) {
                const isClassicMode = this.gameState.gameSettings.mode === 'classic';
                const isStaticInModal = isClassicMode ? true : this.currentSettings.cardDisplayMode === 'static';
                const hasStaticImage = card.image && card.image.includes('.mp4') && card.imageStatic;
                
                if (isStaticInModal && hasStaticImage) {
                    mediaPath = `card/${card.faction}/${card.imageStatic || card.image.replace('.mp4', '.jpg')}`;
                    isVideo = false;
                } else {
                    const { mediaPath: normalPath, isVideo: normalIsVideo } = this.getCardMediaPath(card);
                    mediaPath = normalPath;
                    isVideo = normalIsVideo;
                }
            } else {
                const { mediaPath: normalPath, isVideo: normalIsVideo } = this.getCardMediaPath(card);
                mediaPath = normalPath;
                isVideo = normalIsVideo;
            }
            
            let mediaElement = isVideo ? 
                `<video class="deck-card__media" muted playsinline preload="metadata"><source src="${mediaPath}" type="video/mp4"></video>` :
                `<img src="${mediaPath}" alt="${card.name}" class="deck-card__media" onerror="this.onerror=null; this.src='card/placeholder.jpg'">`;

            let strengthElement = card.strength ? 
                `<div class="deck-card__strength">${card.strength}</div>` : '';

            let typeIconElement = !card.strength ? 
                `<div class="deck-card__type-icon"><img src="${this.getTypeIconPath(card.type)}" alt="${card.type}"></div>` : '';

            let positionElement = '';
            if (card.type === 'unit' && card.position) {
                let positions = [];
                if (Array.isArray(card.position)) {
                    positions = card.position;
                } else {
                    positions = [card.position];
                }
                
                const displayPosition = positions.length > 1 ? 'any' : positions[0];
                const positionIconPath = this.getPositionIconPath(displayPosition);
                
                positionElement = `
                    <div class="deck-card__position">
                        <img src="${card.positionBanner || 'deck/position_banner.png'}" alt="Позиция" class="deck-card__position-banner">
                        <img src="${positionIconPath}" alt="${displayPosition}" class="deck-card__position-icon">
                    </div>
                `;
            }

            return `
                <div class="deck-card" data-card-id="${card.id}">
                    <div class="deck-card__container">
                        ${mediaElement}
                        <img src="${card.border || 'deck/bord_bronze.png'}" alt="Рамка" class="deck-card__border">
                        <img src="${card.banner || `faction/${card.faction}/banner_bronze.png`}" alt="Баннер" class="deck-card__banner">
                        <div class="deck-card__name">${card.name}</div>
                        ${strengthElement}
                        ${typeIconElement}
                        ${positionElement} 
                    </div>
                </div>
            `;
        }).join('');
    },

    updateDiscardDisplay: function(player) {
        if (player === 'player') {
            this.displayPlayerDiscard();
        } else {
            this.displayOpponentDiscard();
        }
    },

    isWeatherCard: function(card) {
        return (card.tags && card.tags.includes('weather')) || 
               (card.type === 'special' && this.isWeatherCardByName(card.name));
    },

    isWeatherCardByName: function(cardName) {
        const weatherCardNames = [
            'Проливной дождь', 'Трескучий мороз', 'Густой туман', 'Чистое небо',
            'Белый Хлад', 'Шторм Скеллиге'
        ];
        return weatherCardNames.includes(cardName);
    },

    applyVisualWeatherEffect: function(row, image) {
        this.removeVisualWeatherEffect(row);
        
        const playerRowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
        const opponentRowElement = document.getElementById(`opponent${this.capitalizeFirst(row)}Row`);
        
        [playerRowElement, opponentRowElement].forEach(rowElement => {
            if (rowElement) {
                const weatherOverlay = document.createElement('div');
                weatherOverlay.className = 'weather-effect-overlay';
                weatherOverlay.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: url('${image}') center/cover;
                    pointer-events: none;
                    z-index: 5;
                `;
                weatherOverlay.dataset.weatherRow = row;
                weatherOverlay.dataset.weatherSide = rowElement.id.startsWith('player') ? 'player' : 'opponent';
                rowElement.style.position = 'relative';
                rowElement.appendChild(weatherOverlay);
            }
        });
    },

    removeVisualWeatherEffect: function(row) {
        const playerEffects = document.querySelectorAll(`[data-weather-row="${row}"][data-weather-side="player"]`);
        playerEffects.forEach(effect => effect.remove());
        
        const opponentEffects = document.querySelectorAll(`[data-weather-row="${row}"][data-weather-side="opponent"]`);
        opponentEffects.forEach(effect => effect.remove());
    },

    updateCardStrengthDisplay: function(card, row, player) {
        const rowElement = document.getElementById(`${player}${this.capitalizeFirst(row)}Row`);
        if (!rowElement) return;
        
        const cardElement = rowElement.querySelector(`[data-card-id="${card.id}"]`);
        if (cardElement) {
            const strengthElement = cardElement.querySelector('.board-card-strength');
            if (strengthElement) {
                strengthElement.textContent = card.strength;
                
                if (card.strength === 1 && card.originalStrength > 1) {
                    cardElement.dataset.strengthReduced = 'true';
                    strengthElement.style.color = '#ff4444';
                    strengthElement.style.animation = 'strengthReduced 2s infinite';
                } else {
                    cardElement.dataset.strengthReduced = 'false';
                    strengthElement.style.color = 'white';
                    strengthElement.style.animation = 'none';
                }
            }
        }
    },

    updateWeatherCounter: function() {
        const weatherCount = this.gameState.weather.cards.length;
        const maxWeather = this.gameState.weather.maxWeatherCards;
    },

    showBasicCardModal: function(card) {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'card-modal-overlay';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        modalOverlay.innerHTML = `
            <div style="
                background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
                border: 3px solid #d4af37;
                border-radius: 15px;
                padding: 20px;
                color: white;
                max-width: 400px;
                text-align: center;
            ">
                <h3 style="color: #d4af37; margin-bottom: 10px;">${card.name}</h3>
                <p>${card.description || 'Описание отсутствует'}</p>
                ${card.strength ? `<p><strong>Сила:</strong> ${card.strength}</p>` : ''}
                <button onclick="this.closest('.card-modal-overlay').remove(); audioManager.playSound('button');" 
                        style="
                            background: #d4af37;
                            color: black;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            margin-top: 10px;
                        ">ЗАКРЫТЬ</button>
            </div>
        `;

        document.body.appendChild(modalOverlay);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
                audioManager.playSound('button');
            }
        });
    },

    showDeckModal: function(player, deckType, title) {
        const cards = this.gameState[player][deckType];
        
        if (cards.length === 0) {
            return;
        }

        const faction = this.gameState[player].faction;
        const factionBackground = `faction/${faction}/border_faction.png`;
        const sortedCards = this.sortDeckCards(cards);

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'deck-modal-overlay';
        modalOverlay.innerHTML = `
            <div class="deck-modal">
                <div class="deck-modal__header" style="background: url('${factionBackground}') center/cover;">
                    <div class="deck-modal__title">${title}</div>
                    <div class="deck-modal__count">Карт: ${sortedCards.length}</div>
                    <button class="deck-modal__close">&times;</button>
                </div>
                <div class="deck-modal__content" id="deckModalContent">
                    ${this.generateDeckCardsHTML(sortedCards, true)}
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);
        this.setupDeckModalEventListeners(modalOverlay, sortedCards);
        
        setTimeout(() => {
            modalOverlay.classList.add('active');
        }, 10);
        
        audioManager.playSound('button');
    },

    setupDeckModalEventListeners: function(modalOverlay, cards) {
        const closeBtn = modalOverlay.querySelector('.deck-modal__close');
        closeBtn.addEventListener('click', () => {
            this.closeDeckModal(modalOverlay);
        });

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.closeDeckModal(modalOverlay);
            }
        });

        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeDeckModal(modalOverlay);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        const cardElements = modalOverlay.querySelectorAll('.deck-card');
        cardElements.forEach(cardElement => {
            const cardId = cardElement.dataset.cardId;
            const card = cards.find(c => c.id === cardId);
            
            if (card) {
                const isCDPRedMode = this.gameState.gameSettings.mode === 'cdpred';
                const video = cardElement.querySelector('video');
                
                if (video && isCDPRedMode) {
                    cardElement.addEventListener('mouseenter', () => {
                        video.currentTime = 0;
                        video.play().catch(e => {});
                        video.loop = true;
                    });

                    cardElement.addEventListener('mouseleave', () => {
                        video.pause();
                        video.currentTime = 0;
                        video.loop = false;
                    });
                } else if (video) {
                    video.controls = false;
                    video.muted = true;
                    video.loop = false;
                }
                
                cardElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showCardModal(card);
                });

                cardElement.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showCardModal(card);
                });

                cardElement.addEventListener('mouseenter', () => {
                    audioManager.playSound('touch');
                });
            }
        });

        modalOverlay.escapeHandler = escapeHandler;
    },

    closeDeckModal: function(modalOverlay) {
        modalOverlay.classList.remove('active');
        
        if (modalOverlay.escapeHandler) {
            document.removeEventListener('keydown', modalOverlay.escapeHandler);
        }
        
        setTimeout(() => {
            if (modalOverlay.parentNode) {
                modalOverlay.parentNode.removeChild(modalOverlay);
            }
        }, 300);
        
        audioManager.playSound('button');
    },

    showCardModal: function(card) {
        if (window.deckModule && typeof window.showCardModal === 'function') {
            const cardForModal = { ...card };
            
            if (card.originalStrength !== undefined) {
                cardForModal.strength = card.originalStrength;
                cardForModal.showOriginalStrength = true;
            }
            
            window.showCardModal(cardForModal);
        } else {
            this.showBasicCardModal(card);
        }
        audioManager.playSound('button');
    },

    showRoundResult: function(winner, playerScore, opponentScore) {
        if (window.audioManager && window.audioManager.playSound) {
            if (winner === 'player') {
                audioManager.playSound('win');
            } else if (winner === 'opponent') {
                audioManager.playSound('lose');
            } else {
                audioManager.playSound('draw');
            }
        }
        
        const resultOverlay = document.createElement('div');
        resultOverlay.className = 'round-result-overlay';
        resultOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: 'Gwent', sans-serif;
        `;

        let resultImage, resultText, resultColor, borderColor;
        
        if (winner === 'player') {
            resultImage = 'board/win.png';
            resultText = 'ПОБЕДА В РАУНДЕ';
            resultColor = '#4CAF50';
            borderColor = '#4CAF50';
        } else if (winner === 'opponent') {
            resultImage = 'board/lose.png';
            resultText = 'ПОРАЖЕНИЕ В РАУНДЕ';
            resultColor = '#f44336';
            borderColor = '#f44336';
        } else {
            resultImage = 'board/draw.png';
            resultText = 'НИЧЬЯ В РАУНДЕ';
            resultColor = '#FFD700';
            borderColor = '#FFD700';
        }

        resultOverlay.innerHTML = `
            <div class="round-result-container" style="
                background: linear-gradient(145deg, #0a0a0a, #1a1a1a);
                border: 4px solid ${borderColor};
                border-radius: 15px;
                padding: 30px 40px;
                text-align: center;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                position: relative;
                overflow: hidden;
            ">
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 4px;
                    background: linear-gradient(90deg, transparent, ${borderColor}, transparent);
                "></div>
                
                <div style="
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 4px;
                    background: linear-gradient(90deg, transparent, ${borderColor}, transparent);
                "></div>
                
                <img src="${resultImage}" alt="${resultText}" style="
                    width: 120px;
                    height: 120px;
                    margin-bottom: 20px;
                    filter: drop-shadow(0 0 10px ${resultColor}80);
                " onerror="this.style.display='none'">
                
                <h2 style="
                    color: ${resultColor};
                    margin: 0 0 15px 0;
                    font-size: 24px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    font-weight: bold;
                ">${resultText}</h2>
                
                <div class="score-display" style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 40px;
                    margin: 25px 0;
                    font-size: 22px;
                    font-weight: bold;
                    background: rgba(0,0,0,0.3);
                    padding: 15px 25px;
                    border-radius: 10px;
                    border: 2px solid #333;
                ">
                    <div class="player-score" style="color: #4CAF50; text-align: center;">
                        <div style="font-size: 14px; color: #888; margin-bottom: 5px; text-transform: uppercase;">Игрок</div>
                        <div style="font-size: 28px;">${playerScore}</div>
                    </div>
                    
                    <div style="color: #d4af37; font-size: 16px; font-weight: normal;">ПРОТИВ</div>
                    
                    <div class="opponent-score" style="color: #f44336; text-align: center;">
                        <div style="font-size: 14px; color: #888; margin-bottom: 5px; text-transform: uppercase;">Противник</div>
                        <div style="font-size: 28px;">${opponentScore}</div>
                    </div>
                </div>
                
                <div class="rounds-progress" style="
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    margin: 20px 0;
                ">
                    ${this.generateRoundsProgress()}
                </div>
                
                <div class="round-info" style="
                    color: #888;
                    font-size: 14px;
                    margin: 10px 0;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                ">
                    Раунд ${this.gameState.currentRound} завершен
                </div>
                
                <button class="continue-btn" style="
                    background: linear-gradient(145deg, ${resultColor}, ${this.darkenColor(resultColor, 20)});
                    color: white;
                    border: none;
                    padding: 12px 35px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 15px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    transition: all 0.3s ease;
                    border: 2px solid ${this.darkenColor(resultColor, 30)};
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                ">ПРОДОЛЖИТЬ</button>
            </div>
        `;

        document.body.appendChild(resultOverlay);
        this.animateResultAppear(resultOverlay);
        
        const continueBtn = resultOverlay.querySelector('.continue-btn');
        continueBtn.addEventListener('click', () => {
            audioManager.playSound('button');
            this.animateResultDisappear(resultOverlay);
        });
        
        continueBtn.addEventListener('mouseenter', () => {
            audioManager.playSound('touch');
            continueBtn.style.transform = 'scale(1.05)';
            continueBtn.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
        });
        
        continueBtn.addEventListener('mouseleave', () => {
            continueBtn.style.transform = 'scale(1)';
            continueBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        });
        
        setTimeout(() => {
            if (document.body.contains(resultOverlay)) {
                this.animateResultDisappear(resultOverlay);
            }
        }, 5000);
    },

    generateRoundsProgress: function() {
        let progressHTML = '';
        const totalRounds = this.gameState.totalRounds;
        const playerWins = this.gameState.roundsWon.player;
        const opponentWins = this.gameState.roundsWon.opponent;
        const maxWins = Math.max(playerWins, opponentWins);
        
        for (let i = 1; i <= totalRounds; i++) {
            let roundClass, roundSymbol, roundColor, tooltip;
            
            if (i <= playerWins && i <= opponentWins) {
                roundClass = 'draw';
                roundSymbol = '＝';
                roundColor = '#FFD700';
                tooltip = 'Ничья';
            } else if (i <= playerWins) {
                roundClass = 'player-win';
                roundSymbol = '✓';
                roundColor = '#4CAF50';
                tooltip = 'Победа игрока';
            } else if (i <= opponentWins) {
                roundClass = 'opponent-win';
                roundSymbol = '✗';
                roundColor = '#f44336';
                tooltip = 'Победа противника';
            } else {
                roundClass = 'empty';
                roundSymbol = i;
                roundColor = '#666';
                tooltip = 'Раунд не сыгран';
            }
            
            progressHTML += `
                <div class="round-indicator ${roundClass}" style="
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 14px;
                    background: ${roundClass === 'empty' ? 'transparent' : roundColor};
                    color: ${roundClass === 'empty' ? '#888' : 'white'};
                    border: 2px solid ${roundColor};
                    position: relative;
                    cursor: help;
                " title="${tooltip}">${roundSymbol}</div>
            `;
        }
        
        return progressHTML;
    },

    addResultStyles: function() {
        if (document.getElementById('round-result-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'round-result-styles';
        style.textContent = `
            @keyframes resultAppear {
                0% {
                    opacity: 0;
                    transform: scale(0.5) translateY(-100px) rotateX(60deg);
                }
                70% {
                    opacity: 1;
                    transform: scale(1.05) translateY(10px) rotateX(0deg);
                }
                100% {
                    opacity: 1;
                    transform: scale(1) translateY(0) rotateX(0deg);
                }
            }
            
            @keyframes resultDisappear {
                0% {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
                100% {
                    opacity: 0;
                    transform: scale(0.8) translateY(50px);
                }
            }
            
            @keyframes roundChange {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            
            .round-result-overlay {
                animation: overlayAppear 0.3s ease-out;
            }
            
            @keyframes overlayAppear {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .continue-btn:hover {
                filter: brightness(1.1);
            }
            
            .continue-btn:active {
                transform: scale(0.95) !important;
            }
        `;
        document.head.appendChild(style);
    },

    showGameResult: function(winner) {
        if (window.audioManager && window.audioManager.playSound) {
            if (winner === 'player') {
                audioManager.playSound('win');
            } else if (winner === 'opponent') {
                audioManager.playSound('lose');
            } else {
                audioManager.playSound('draw');
            }
        }
        const resultOverlay = document.createElement('div');
        resultOverlay.className = 'game-result-overlay';
        resultOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: 'Gwent', sans-serif;
        `;

        let resultImage, resultText, resultColor;
        const finalScore = `${this.gameState.roundsWon.player}-${this.gameState.roundsWon.opponent}`;
        
        if (winner === 'player') {
            resultImage = 'board/win.png';
            resultText = 'ПОБЕДА В МАТЧЕ!';
            resultColor = '#4CAF50';
        } else if (winner === 'opponent') {
            resultImage = 'board/lose.png';
            resultText = 'ПОРАЖЕНИЕ В МАТЧЕ';
            resultColor = '#f44336';
        } else {
            resultImage = 'board/draw.png';
            resultText = 'НИЧЬЯ В МАТЧЕ!';
            resultColor = '#FFD700';
        }

        resultOverlay.innerHTML = `
            <div class="game-result-container" style="
                background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
                border: 4px solid ${resultColor};
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                max-width: 600px;
                animation: resultAppear 0.5s ease-out;
            ">
                <img src="${resultImage}" alt="${resultText}" style="
                    width: 250px;
                    height: 250px;
                    margin-bottom: 30px;
                " onerror="this.style.display='none'">
                
                <h1 style="
                    color: ${resultColor};
                    margin: 0 0 20px 0;
                    font-size: 36px;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
                ">${resultText}</h1>
                
                <div class="final-score" style="
                    font-size: 28px;
                    font-weight: bold;
                    margin: 20px 0;
                    color: #fff;
                ">
                    ФИНАЛЬНЫЙ СЧЕТ: ${finalScore}
                </div>
                
                <div class="match-stats" style="
                    display: flex;
                    justify-content: space-around;
                    margin: 30px 0;
                    color: #ccc;
                    font-size: 16px;
                    width: 100%;
                ">
                    <div style="text-align: center;">
                        <div style="color: #4CAF50; margin-bottom: 5px;">ПОБЕДЫ ИГРОКА</div>
                        <div style="font-size: 24px; color: #4CAF50;">${this.gameState.roundsWon.player}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="color: #FFD700; margin-bottom: 5px;">НИЧЬИ</div>
                        <div style="font-size: 24px; color: #FFD700;">${Math.min(this.gameState.roundsWon.player, this.gameState.roundsWon.opponent)}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="color: #f44336; margin-bottom: 5px;">ПОБЕДЫ ПРОТИВНИКА</div>
                        <div style="font-size: 24px; color: #f44336;">${this.gameState.roundsWon.opponent}</div>
                    </div>
                </div>
                
                <div class="action-buttons" style="
                    display: flex;
                    gap: 20px;
                    justify-content: center;
                    margin-top: 30px;
                ">
                    <button class="restart-btn" style="
                        background: #2196F3;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 8px;
                        font-size: 18px;
                        font-weight: bold;
                        cursor: pointer;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        transition: all 0.3s ease;
                    ">ИГРАТЬ СНОВА</button>
                    
                    <button class="menu-btn" style="
                        background: #666;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 8px;
                        font-size: 18px;
                        font-weight: bold;
                        cursor: pointer;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        transition: all 0.3s ease;
                    ">ГЛАВНОЕ МЕНЮ</button>
                </div>
            </div>
        `;

        document.body.appendChild(resultOverlay);
        
        const restartBtn = resultOverlay.querySelector('.restart-btn');
        const menuBtn = resultOverlay.querySelector('.menu-btn');
        
        restartBtn.addEventListener('click', () => {
            audioManager.playSound('button');
            document.body.removeChild(resultOverlay);
            this.restartGame();
        });
        
        menuBtn.addEventListener('click', () => {
            audioManager.playSound('button');
            document.body.removeChild(resultOverlay);
            this.returnToMainMenu();
        });
    },

    restartGame: function() {
        window.location.reload();
    },

    returnToMainMenu: function() {
        const gameBoard = document.querySelector('.game-board');
        const startPage = document.querySelector('.start-page');
        
        if (gameBoard) gameBoard.style.display = 'none';
        if (startPage) startPage.style.display = 'block';
    },

    getTypeIconPath: function(cardType) {
        const typeIcons = {
            'special': 'deck/type_special.png',
            'artifact': 'deck/type_artifact.png',
            'tactic': 'deck/type_tactic.png',
            'leader': 'deck/type_leader.png'
        };
        return typeIcons[cardType] || 'deck/type_unknown.png';
    },

    getPositionIconPath: function(position) {
        const positionIcons = {
            'close-row': 'deck/close-row.png',
            'ranged-row': 'deck/ranged-row.png',
            'siege-row': 'deck/siege-row.png'
        };
        return positionIcons[position] || 'deck/any-row.png';
    },

    capitalizeFirst: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    updateGameDisplay: function() {
        const playerDeckCount = document.querySelector('.deck-count');
        const opponentDeckCount = document.querySelector('.opponent-deck-count');
        
        if (playerDeckCount) playerDeckCount.textContent = this.gameState.player.deck.length;
        if (opponentDeckCount) opponentDeckCount.textContent = this.gameState.opponent.deck.length;
    },

    animateResultAppear: function(overlay) {
        const container = overlay.querySelector('.round-result-container');
        container.style.animation = 'resultAppear 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    },

    animateResultDisappear: function(overlay) {
        const container = overlay.querySelector('.round-result-container');
        container.style.animation = 'resultDisappear 0.4s ease-in forwards';
        
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }, 400);
    },

    darkenColor: function(color, percent) {
        if (color.startsWith('#')) {
            let num = parseInt(color.slice(1), 16);
            let amt = Math.round(2.55 * percent);
            let R = (num >> 16) - amt;
            let G = (num >> 8 & 0x00FF) - amt;
            let B = (num & 0x0000FF) - amt;
            return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
                (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
                (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
        }
        return color;
    },

    startNewRound: function() {
        this.gameState.currentRound++;
        if (window.audioManager && window.audioManager.playSound) {
            audioManager.playSound('round_start');
        }
        this.updateRoundCounter();
        this.resetRoundState();
        this.dealAdditionalCards();
        this.startPlayerTurn();
        this.showGameMessage(`Начало раунда ${this.gameState.currentRound}`, 'info');
    },

    showGameMessage: function(text, type = 'info') {
        let messageContainer = document.getElementById('gameMessages');
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'gameMessages';
            messageContainer.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
            `;
            document.body.appendChild(messageContainer);
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = `game-message game-message-${type}`;
        messageElement.style.cssText = `
            text-align: center;
            font-family: 'Gwent', sans-serif;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            animation: messageAppear 0.3s ease-out;
        `;
        
        messageElement.textContent = text;
        messageContainer.appendChild(messageElement);
        
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.style.animation = 'messageDisappear 0.3s ease-out';
                setTimeout(() => {
                    if (messageElement.parentNode) {
                        messageElement.parentNode.removeChild(messageElement);
                    }
                }, 300);
            }
        }, 3000);
    },

    addMessageStyles: function() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes messageAppear {
                from { 
                    opacity: 0; 
                    transform: translateY(-20px) translateX(-50%); 
                }
                to { 
                    opacity: 1; 
                    transform: translateY(0) translateX(-50%); 
                }
            }
            
            @keyframes messageDisappear {
                from { 
                    opacity: 1; 
                    transform: translateY(0) translateX(-50%); 
                }
                to { 
                    opacity: 0; 
                    transform: translateY(-20px) translateX(-50%); 
                }
            }
        `;
        document.head.appendChild(style);
    },

};

window.gameModule = gameModule;