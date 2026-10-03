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
		roundResults: [],
    },
	
    currentSettings: {
        cardDisplayMode: 'animated'
    },

    init: function() {
        this.loadSettings();
        this.updateGameSettings();
        this.createTotalScoreDisplays();
        this.createTimerDisplay();
		this.createCrownIndicators();
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
		this.gameState.winnerOfLastRound = null;
		this.startCoinToss();
	},

    createTimerDisplay: function() {
		if (document.getElementById('turnTimerDisplay')) return;
		
		const timerDisplay = document.createElement('div');
		timerDisplay.id = 'turnTimerDisplay';
		timerDisplay.className = 'turn-timer-display';
		timerDisplay.style.display = 'none';
		
		timerDisplay.innerHTML = `
			<img src="board/timer.png" alt="Песочные часы" class="timer-icon">
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
            timerDisplay.style.setProperty('display', 'none', 'important');
            timerDisplay.style.animation = 'none';
        }
    },

    playTimerWarningSound: function() {
        if (window.audioManager && window.audioManager.playSound) {
            if (window.audioManager.sounds && window.audioManager.sounds.timer) {
                window.audioManager.playSound('warning');
            }else {
                window.audioManager.playSound('warning');
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
        
        if (this.gameState.turnTimer.timeLeft === 30) {
            this.playTimerWarningSound();
        } else if (this.gameState.turnTimer.timeLeft === 10) {
            this.playTimerWarningSound();
        }else if (this.gameState.turnTimer.timeLeft === 5) {
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
            audioManager.playSound('warning');
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

    startMulliganPhase: function() {
		this.hideTimerDisplay();
		
		this.gameState.mulligan.phase = 'waiting';
		this.gameState.mulligan.player.used = 0;
		this.gameState.mulligan.player.cards = [];
		this.gameState.mulligan.opponent.used = 0;
		this.gameState.mulligan.opponent.cards = [];
		this.startPlayerMulligan();
	},

    resetMulliganState: function() {
		this.gameState.mulligan.phase = 'waiting';
		this.gameState.mulligan.player.used = 0;
		this.gameState.mulligan.player.cards = [];
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
		this.createMulliganModal();
	},

	createMulliganModal: function() {
		// Удаляем старое окно, если есть
		const existing = document.getElementById('mulliganModal');
		if (existing) existing.remove();

		const availableMulligans = this.gameState.mulligan.player.available;
		const isPlayerRealms = this.gameState.player.faction === 'syndicate';
		const hasExtraMulligan = isPlayerRealms && availableMulligans === 3;

		// Оверлей
		const modal = document.createElement('div');
		modal.id = 'mulliganModal';
		modal.className = 'mulligan-modal-overlay';

		// Контейнер
		const container = document.createElement('div');
		container.className = 'mulligan-modal-container';

		// ===== ЗАГОЛОВОК (С ПРИМЕЧАНИЕМ О ДОП. МУЛЛИГАНЕ) =====
		const header = document.createElement('div');
		header.className = 'mulligan-modal-header';
		header.innerHTML = `
			<div class="mulligan-modal-title">МУЛЛИГАНА</div>
			<div class="mulligan-modal-subtitle">
				Выберите до ${availableMulligans} карт для замены
			</div>
			${hasExtraMulligan ? `
				<div class="mulligan-modal-note">
					<img src="board/mulligan.png" alt="Муллиган" class="mulligan-modal-note__icon">
					<span class="mulligan-modal-note__text">
						Дополнительная муллигана — способность фракции Синдикат
					</span>
				</div>
			` : ''}
		`;

		// Контейнер с картами
		const cardsContainer = document.createElement('div');
		cardsContainer.className = 'mulligan-modal-cards';
		cardsContainer.id = 'mulliganCardsContainer';

		this.gameState.player.hand.forEach((card, index) => {
			const cardElement = this.createMulliganCardElement(card, index);
			cardsContainer.appendChild(cardElement);
		});

		// Футер с кнопками
		const footer = document.createElement('div');
		footer.className = 'mulligan-modal-footer';

		const infoText = document.createElement('div');
		infoText.id = 'mulliganInfoText';
		infoText.className = 'mulligan-modal-info';
		infoText.textContent = `Выбрано: 0/${availableMulligans} карт`;

		const buttonsWrapper = document.createElement('div');
		buttonsWrapper.className = 'mulligan-modal-buttons';

		const resetBtn = document.createElement('button');
		resetBtn.id = 'mulliganResetBtn';
		resetBtn.className = 'mulligan-btn mulligan-btn-reset';
		resetBtn.textContent = 'ОТМЕНИТЬ ВЫБОР';

		const doneBtn = document.createElement('button');
		doneBtn.id = 'mulliganDoneBtn';
		doneBtn.className = 'mulligan-btn mulligan-btn-done';
		doneBtn.textContent = 'БЕЗ ЗАМЕНЫ';

		buttonsWrapper.appendChild(resetBtn);
		buttonsWrapper.appendChild(doneBtn);

		footer.appendChild(infoText);
		footer.appendChild(buttonsWrapper);

		container.appendChild(header);
		container.appendChild(cardsContainer);
		container.appendChild(footer);
		modal.appendChild(container);
		document.body.appendChild(modal);

		// ===== ОБРАБОТЧИКИ КНОПОК =====
		resetBtn.addEventListener('click', (event) => {
			event.stopPropagation();
			this.resetPlayerMulliganSelection();
			if (window.audioManager) audioManager.playSound('button');
		});
		resetBtn.addEventListener('mouseenter', () => {
			if (window.audioManager) audioManager.playSound('touch');
		});

		doneBtn.addEventListener('click', (event) => {
			event.stopPropagation();
			this.completePlayerMulligan();
			if (window.audioManager) audioManager.playSound('button');
		});
		doneBtn.addEventListener('mouseenter', () => {
			if (window.audioManager) audioManager.playSound('touch');
		});

		// Анимация появления
		requestAnimationFrame(() => {
			modal.classList.add('active');
		});

		this.updateMulliganInfo();
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

		let topRightElement = '';
		if (card.type === 'unit') {
			topRightElement = `<div class="hand-card-strength">${card.strength || 0}</div>`;
		} else {
			topRightElement = `<div class="hand-card-type-icon"><img src="${this.getTypeIconPath(card.type)}" alt="${card.type}"></div>`;
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
			const abilityBanner = card.ability && card.ability.trim() !== ''
				? `<img src="faction/${card.faction}/banner_abbility.png" alt="Способность" class="hand-card-ability-banner">`
				: '';
			const abilityIcon = card.ability && card.ability.trim() !== ''
				? `<img src="${window.cardsModule?.getAbilityIconPath?.(card.ability) || `deck/${card.ability}.webp`}"
						alt="${card.ability}"
						class="hand-card-ability-icon"
						onerror="this.style.display='none'">`
				: '';

			positionElement = `
				<div class="hand-card-position">
					<img src="${card.positionBanner || `faction/${card.faction}/banner_position.png`}" alt="Позиция" class="hand-card-position-banner">
					${abilityBanner}
					${abilityIcon}
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
		const handIndex = parseInt(cardElement.dataset.handIndex);

		if (mulliganState.cards.length >= mulliganState.available && 
			!mulliganState.cards.includes(handIndex)) {
			return;
		}

		const cardIndex = mulliganState.cards.indexOf(handIndex);
		if (cardIndex === -1) {
			mulliganState.cards.push(handIndex);
			cardElement.classList.add('mulligan-selected');
			audioManager.playSound('cardAdd');
		} else {
			mulliganState.cards.splice(cardIndex, 1);
			cardElement.classList.remove('mulligan-selected');
			audioManager.playSound('cardRemove');
		}

		this.updateMulliganInfo();
	},

	removeCardFromBoardVisual: function(card, row, player) {
		const rowElement = document.getElementById(`${player}${this.capitalizeFirst(row)}Row`);
		if (!rowElement) return;
		
		const selector = card.uniqueId 
			? `[data-unique-id="${card.uniqueId}"]`
			: `[data-card-id="${card.id}"]`;
		const cardElement = rowElement.querySelector(selector);
		
		if (cardElement) {
			cardElement.style.animation = 'cardDestroy 0.5s ease-out forwards';
			setTimeout(() => {
				if (cardElement.parentNode === rowElement) {
					rowElement.removeChild(cardElement);
				}
			}, 500);
		}
	},

	updateMulliganInfo: function() {
		const infoText = document.getElementById('mulliganInfoText');
		const doneBtn = document.getElementById('mulliganDoneBtn');
		
		const mulliganState = this.gameState.mulligan.player;
		const selectedCount = mulliganState.cards.length;
		const availableCount = mulliganState.available;
		
		// Инфо-текст
		if (infoText) {
			infoText.textContent = `Выбрано: ${selectedCount}/${availableCount} карт`;
			
			if (selectedCount > 0) {
				infoText.classList.add('has-selection');
			} else {
				infoText.classList.remove('has-selection');
			}
		}
		
		// Текст кнопки завершения
		if (doneBtn) {
			if (selectedCount === 0) {
				doneBtn.textContent = 'БЕЗ ЗАМЕНЫ';
			} else {
				doneBtn.textContent = `ЗАМЕНИТЬ`;
			}
		}
	},

	resetPlayerMulliganSelection: function() {
		const mulliganState = this.gameState.mulligan.player;
		mulliganState.cards = [];

		const selectedCards = document.querySelectorAll('#mulliganModal .mulligan-selected');
		selectedCards.forEach(cardElement => {
			cardElement.classList.remove('mulligan-selected');
		});

		this.updateMulliganInfo();
	},

	completePlayerMulligan: function() {
		const mulliganState = this.gameState.mulligan.player;
		
		if (mulliganState.available > 0 && mulliganState.cards.length !== 0) {
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
		const cardIndicesToReplace = [...mulliganState.cards]
			.sort((a, b) => b - a)
			.filter(index => index >= 0 && index < gameState.hand.length);
		
		if (cardIndicesToReplace.length === 0) {
			return true;
		}
		
		const cardsBeingReplaced = cardIndicesToReplace.map(index => gameState.hand[index]);
		
		cardIndicesToReplace.forEach(index => {
			gameState.hand.splice(index, 1);
		});
		
		const newCards = [];
		const cardsToTake = Math.min(cardIndicesToReplace.length, gameState.deck.length);
		
		for (let i = 0; i < cardsToTake; i++) {
			if (gameState.deck.length > 0) {
				newCards.push(gameState.deck.shift());
			}
		}
		
		gameState.hand.push(...newCards);
		gameState.deck.push(...cardsBeingReplaced);
		
		this.shuffleArray(gameState.deck);
		
		mulliganState.used = cardIndicesToReplace.length;
		
		if (gameState.hand.length !== 10) {
			console.error(`${player} has ${gameState.hand.length} cards after mulligan!`);
			
			if (gameState.hand.length > 10) {
				const excess = gameState.hand.length - 10;
				const excessCards = gameState.hand.splice(-excess, excess);
				gameState.deck.push(...excessCards);
			} else if (gameState.hand.length < 10) {
				const needed = 10 - gameState.hand.length;
				const additionalCards = gameState.deck.splice(0, Math.min(needed, gameState.deck.length));
				gameState.hand.push(...additionalCards);
			}
		}
		
		return true;
	},

    startOpponentMulligan: function() {
		this.gameState.mulligan.phase = 'opponent';
		this.removeMulliganInterface();
		
		const opponentHasMulligan = this.gameState.mulligan.opponent.available > 0;
		
		if (!opponentHasMulligan) {
			setTimeout(() => {
				this.completeMulliganPhase();
			}, 1500);
			return;
		}
		
		setTimeout(() => {
			this.performOpponentMulligan();
		}, 1500);
	},

	performOpponentMulligan: function() {
		const mulliganState = this.gameState.mulligan.opponent;
		
		if (mulliganState.available === 0) {
			this.completeMulliganPhase();
			return;
		}
		
		const hand = this.gameState.opponent.hand;
		
		let cardsToReplace = hand
			.filter(card => card.type === 'unit')
			.sort((a, b) => (a.strength || 0) - (b.strength || 0));
		
		if (cardsToReplace.length < mulliganState.available) {
			const otherCards = hand
				.filter(card => card.type !== 'unit')
				.slice(0, mulliganState.available - cardsToReplace.length);
			cardsToReplace = [...cardsToReplace, ...otherCards];
		}
		
		cardsToReplace = cardsToReplace.slice(0, mulliganState.available);
		mulliganState.cards = [];
		cardsToReplace.forEach(card => {
			const index = hand.findIndex(c => c.id === card.id);
			if (index !== -1) {
				mulliganState.cards.push(index);
			}
		});
		
		if (mulliganState.cards.length > 0) {
			this.replaceMulliganCards('opponent');
		}
		
		this.completeMulliganPhase();
	},

	removeMulliganInterface: function() {
		const modal = document.getElementById('mulliganModal');
		if (modal) {
			modal.classList.remove('active');
			setTimeout(() => {
				if (modal.parentNode) modal.remove();
			}, 300);
		}

		const factionInfo = document.querySelector('.mulligan-faction-info');
		if (factionInfo) factionInfo.remove();

		const controls = document.getElementById('mulliganControls');
		if (controls) controls.remove();

		const frameWrapper = document.querySelector('.mulligan-frame-wrapper');
		if (frameWrapper) frameWrapper.remove();

		// Обновляем руку игрока после закрытия модалки
		const handContainer = document.getElementById('playerHand');
		if (handContainer) {
			handContainer.classList.remove('mulligan-active');
			handContainer.style.flexDirection = '';
			this.displayPlayerHand();
		}
	},

    completeMulliganPhase: function() {
        this.gameState.mulligan.phase = 'completed';
        
        const playerUsed = this.gameState.mulligan.player.used;
        const opponentUsed = this.gameState.mulligan.opponent.used;
        
        this.displayPlayerHand();
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
		// Поднимаем canvas, чтобы частицы были видны поверх фона модалки
		const fireCanvas = document.querySelector('.fire-canvas');
		if (fireCanvas) {
			fireCanvas.dataset.prevZIndex = fireCanvas.style.zIndex || '';
			fireCanvas.style.zIndex = '10001';
		}
		window.FireParticles?.start();

		if (window.factionAbilitiesModule) {
			const firstTurn = await window.factionAbilitiesModule.determineFirstTurn(this.gameState);
			this.startGameAfterCoinToss(firstTurn);
		} else {
			this.startCoinTossAnimation();
		}
	},

	startCoinTossAnimation: function() {
		// Поднимаем canvas поверх фона оверлея
		const fireCanvas = document.querySelector('.fire-canvas');
		if (fireCanvas) {
			fireCanvas.dataset.prevZIndex = fireCanvas.style.zIndex || '';
			fireCanvas.style.zIndex = '10001';
		}
		window.FireParticles?.start();

		const coinOverlay = document.createElement('div');
		coinOverlay.id = 'coinTossOverlay';
		coinOverlay.className = 'coin-toss-overlay';
		coinOverlay.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: url('ui/fon.jpg') center/cover no-repeat;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			z-index: 10000;
			font-family: 'Gwent', sans-serif;
		`;

		coinOverlay.innerHTML = `
			<div class="coin-toss-container" style="position: relative; z-index: 10002;">
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
		
		setTimeout(() => {
			this.animateCoinToss();
		}, 1500);
	},

    animateCoinToss: function() {
		const coinElement = document.getElementById('coinElement');
		const coinResult = document.getElementById('coinResult');
		if (!coinElement || !coinResult) {
			return;
		}
		
		const randomValue = Math.random();
		const goesFirst = randomValue < 0.5 ? 'player' : 'opponent';
		
		const finalSide = goesFirst === 'player' ? 0 : 180;
		const totalRotations = 5;
		const targetRotation = (totalRotations * 360) + finalSide;
		const animationDuration = 2500;
		
		coinElement.style.setProperty('--final-rotation', `${targetRotation}deg`);
		coinElement.style.setProperty('--animation-duration', `${animationDuration}ms`);
		
		setTimeout(() => {
			const animations = coinElement.getAnimations();
			animations.forEach(anim => anim.cancel());
			coinElement.style.transform = 'translateY(0) rotateX(0deg)';
			coinElement.classList.remove('coin-tossing', 'smooth-coin-toss');
			
			void coinElement.offsetWidth;
			
			coinElement.classList.add('smooth-coin-toss');
			
			if (audioManager && audioManager.playSound) {
				audioManager.playSound('coin');
			}
		}, 500);
		
		const resultDelay = 500 + animationDuration;
		
		setTimeout(() => {
			coinElement.style.transform = `rotateX(${finalSide}deg)`;
			coinElement.classList.remove('smooth-coin-toss');
			
			if (goesFirst === 'player') {
				coinResult.textContent = 'ИГРОК ХОДИТ ПЕРВЫМ';
				coinResult.style.color = '#4CAF50';
			} else {
				coinResult.textContent = 'ПРОТИВНИК ХОДИТ ПЕРВЫМ';
				coinResult.style.color = '#f44336';
			}
			coinResult.classList.add('show');
			this.gameState.currentPlayer = goesFirst;
			
			const gameStartDelay = 2000; 
			
			setTimeout(() => {
				this.startGameAfterCoinToss(goesFirst);
			}, gameStartDelay);
		}, resultDelay);
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

		// Останавливаем частицы и возвращаем z-index
		window.FireParticles?.stop();
		const fireCanvas = document.querySelector('.fire-canvas');
		if (fireCanvas) {
			fireCanvas.style.zIndex = fireCanvas.dataset.prevZIndex || '';
			delete fireCanvas.dataset.prevZIndex;
		}

		this.stopTurnTimer();
		this.gameState.currentPlayer = firstPlayer;
		this.startMulliganPhase();
		this.isFirstRoundStart = true;
	},

	completeMulliganPhase: function() {
		this.gameState.mulligan.phase = 'completed';
		
		const playerUsed = this.gameState.mulligan.player.used;
		const opponentUsed = this.gameState.mulligan.opponent.used;
		
		this.displayPlayerHand();
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('round_start');
		}
		
		if (this.isFirstRoundStart) {
			this.showRoundStartMessage(`РАУНД 1`);
			this.isFirstRoundStart = false;
			
			setTimeout(() => {
				if (this.gameState.currentPlayer === 'player') {
					this.startPlayerTurn();
				} else {
					this.startOpponentTurn();
				}
			}, 3000);
		} else {
			setTimeout(() => {
				if (this.gameState.currentPlayer === 'player') {
					this.startPlayerTurn();
				} else {
					this.startOpponentTurn();
				}
			}, 1000);
		}
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
            this.gameState.gameSettings.cardsPerRound = 3;
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
		
		if (window.boardModule?.updateControlsVisibility) {
			window.boardModule.updateControlsVisibility(true);
		}
		
		// ===== ДОБАВЛЯЕМ ОБНОВЛЕНИЕ ИКОНКИ =====
		if (window.boardModule?.updateAbilityAvailability) {
			window.boardModule.updateAbilityAvailability(this.gameState);
		}
		
		if (!this.gameState.player.passed) {
			this.startTurnTimer();
		} else {
			this.hideTimerDisplay();
		}
		
		this.updateGameModeIndicator();
		this.updateTurnIndicator();
		this.updateControlButtons();
		this.showGameMessage('Ваш ход', 'info');
		audioManager.playSound('warning');
	},

	startOpponentTurn: function() {
		this.gameState.gamePhase = 'opponentTurn'; 
		this.gameState.currentPlayer = 'opponent';
		this.gameState.cardsPlayedThisTurn = 0;
		this.stopTurnTimer();
		
		if (window.boardModule && window.boardModule.updateControlsVisibility) {
			window.boardModule.updateControlsVisibility(false);
		}
		
		// ===== ДОБАВЛЯЕМ ОБНОВЛЕНИЕ ИКОНКИ =====
		if (window.boardModule?.updateAbilityAvailability) {
			window.boardModule.updateAbilityAvailability(this.gameState);
		}
		
		this.updateTurnIndicator();
		this.updateControlButtons();
		this.showGameMessage('Ход противника', 'warning');
		audioManager.playSound('warning');
		
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

	createCrownIndicators: function() {
        const playerLeaderArea = document.querySelector('.player-leader-area');
        if (playerLeaderArea) {
            const crown1Player = document.createElement('img');
            crown1Player.id = 'crown1Player';
            crown1Player.className = 'crown-indicator crown1-player crown-hidden';
            crown1Player.src = 'board/crown1.png';
            crown1Player.alt = 'Первая победа';
            
            const crown2Player = document.createElement('img');
            crown2Player.id = 'crown2Player';
            crown2Player.className = 'crown-indicator crown2-player crown-hidden';
            crown2Player.src = 'board/crown2.png';
            crown2Player.alt = 'Вторая победа';
            
            playerLeaderArea.appendChild(crown1Player);
            playerLeaderArea.appendChild(crown2Player);
        }
        
        const opponentLeaderArea = document.querySelector('.opponent-leader-area');
        if (opponentLeaderArea) {
            const crown1Opponent = document.createElement('img');
            crown1Opponent.id = 'crown1Opponent';
            crown1Opponent.className = 'crown-indicator crown1-opponent crown-hidden';
            crown1Opponent.src = 'board/crown1.png';
            crown1Opponent.alt = 'Первая победа противника';
            
            const crown2Opponent = document.createElement('img');
            crown2Opponent.id = 'crown2Opponent';
            crown2Opponent.className = 'crown-indicator crown2-opponent crown-hidden';
            crown2Opponent.src = 'board/crown2.png';
            crown2Opponent.alt = 'Вторая победа противника';
            
            opponentLeaderArea.appendChild(crown1Opponent);
            opponentLeaderArea.appendChild(crown2Opponent);
        }
    },

	updateCrownIndicators: function() {
		const playerWins = this.gameState.roundsWon.player;
		const opponentWins = this.gameState.roundsWon.opponent;
		
		// ===== ИСПРАВЛЕНИЕ: ОТОБРАЖАЕМ ПРАВИЛЬНОЕ КОЛИЧЕСТВО КОРОН =====
		// Показываем столько корон, сколько очков набрал игрок (максимум 2)
		const crown1Player = document.getElementById('crown1Player');
		const crown2Player = document.getElementById('crown2Player');
		
		if (crown1Player) {
			if (playerWins >= 1) {
				crown1Player.classList.remove('crown-hidden');
				crown1Player.classList.add('crown-visible');
			} else {
				crown1Player.classList.add('crown-hidden');
				crown1Player.classList.remove('crown-visible');
			}
		}
		
		if (crown2Player) {
			if (playerWins >= 2) {
				crown2Player.classList.remove('crown-hidden');
				crown2Player.classList.add('crown-visible');
			} else {
				crown2Player.classList.add('crown-hidden');
				crown2Player.classList.remove('crown-visible');
			}
		}
		
		const crown1Opponent = document.getElementById('crown1Opponent');
		const crown2Opponent = document.getElementById('crown2Opponent');
		
		if (crown1Opponent) {
			if (opponentWins >= 1) {
				crown1Opponent.classList.remove('crown-hidden');
				crown1Opponent.classList.add('crown-visible');
			} else {
				crown1Opponent.classList.add('crown-hidden');
				crown1Opponent.classList.remove('crown-visible');
			}
		}
		
		if (crown2Opponent) {
			if (opponentWins >= 2) {
				crown2Opponent.classList.remove('crown-hidden');
				crown2Opponent.classList.add('crown-visible');
			} else {
				crown2Opponent.classList.add('crown-hidden');
				crown2Opponent.classList.remove('crown-visible');
			}
		}
	},

    resetCrownIndicators: function() {
        const crowns = [
            'crown1Player', 'crown2Player',
            'crown1Opponent', 'crown2Opponent'
        ];
        
        crowns.forEach(crownId => {
            const crown = document.getElementById(crownId);
            if (crown) {
                crown.classList.add('crown-hidden');
                crown.classList.remove('crown-visible');
            }
        });
    },
	
	endRound: function() {
		this.hideTimerDisplay();
		const playerScore = this.calculateTotalScore('player');
		const opponentScore = this.calculateTotalScore('opponent');
		
		let roundWinner = null;
		
		if (this.gameState.roundLossDueToTimeout) {
			const losingPlayer = this.gameState.roundLossDueToTimeout;
			
			if (losingPlayer === 'player') {
				this.gameState.roundsWon.opponent++;
				this.gameState.roundResults.push('opponent');
				roundWinner = 'opponent';
				this.showRoundResult('opponent', playerScore, opponentScore);
			} else {
				this.gameState.roundsWon.player++;
				this.gameState.roundResults.push('player');
				roundWinner = 'player';
				this.showRoundResult('player', playerScore, opponentScore);
			}
			
			this.gameState.roundLossDueToTimeout = null;
		} else {
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
				} else {
					roundWinner = 'draw';
				}
			}
			
			// ===== ИСПРАВЛЕНИЕ: ПРИ НИЧЬЕ ОЧКИ ПОЛУЧАЮТ ОБА =====
			if (roundWinner === 'player') {
				this.gameState.roundsWon.player++;
				this.gameState.roundResults.push('player');
			} else if (roundWinner === 'opponent') {
				this.gameState.roundsWon.opponent++;
				this.gameState.roundResults.push('opponent');
			} else {
				// НИЧЬЯ: +1 очко ОБОИМ игрокам
				this.gameState.roundsWon.player++;
				this.gameState.roundsWon.opponent++;
				this.gameState.roundResults.push('draw');
				// Победитель раунда не определяется
			}
		}
		
		// ===== ИСПРАВЛЕНИЕ: ПРОВЕРКА ЗАВЕРШЕНИЯ ИГРЫ =====
		const playerWins = this.gameState.roundsWon.player;
		const opponentWins = this.gameState.roundsWon.opponent;
		
		// Игра заканчивается, когда кто-то набрал 2 очка
		const isGameOver = (playerWins >= 2 || opponentWins >= 2);
		
		// Показываем результат раунда
		if (roundWinner !== null) {
			this.showRoundResult(roundWinner, playerScore, opponentScore);
		} else {
			// Ничья - показываем результат ничьи
			this.showRoundResult('draw', playerScore, opponentScore);
		}
		
		// Сохраняем победителя раунда для следующего хода (только если не ничья)
		if (roundWinner !== 'draw' && roundWinner !== null) {
			this.gameState.winnerOfLastRound = roundWinner;
		}
		
		if (window.factionAbilitiesModule) {
			window.factionAbilitiesModule.handleRoundEndForMonsters(this.gameState);
			
			// ===== НОВОЕ: Способность "Королевства Севера" — добор карты после выигранного раунда =====
			if (roundWinner !== 'draw' && roundWinner !== null) {
				window.factionAbilitiesModule.handleRoundWinForRealms(this.gameState, roundWinner);
			}
		}
		
		// Если игра закончена - показываем финальный результат
		if (isGameOver) {
			setTimeout(() => this.endGame(), 3500);
		} else if (this.gameState.currentRound >= this.gameState.totalRounds) {
			// Если это был последний раунд, но никто не набрал 2 очка (маловероятно, но на всякий случай)
			setTimeout(() => this.endGame(), 3500);
		}
		// Если игра не закончена, новый раунд запустится через showRoundResult
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
		this.hideTimerDisplay();
		
		if (this.gameState.currentRound < this.gameState.totalRounds) {
			this.gameState.currentRound++;
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('round_start');
		}
		
		this.showGameMessage(`Раунд ${this.gameState.currentRound}`, 'info');
		
		this.updateRoundCounter();
		this.updateCrownIndicators();
		this.resetRoundState();
		this.dealAdditionalCards();
		
		let firstPlayer = this.determineFirstPlayerForNewRound();
		this.gameState.currentPlayer = firstPlayer;
		
		if (firstPlayer === 'player') {
			this.startPlayerTurn();
		} else {
			this.startOpponentTurn();
		}
	},

	determineFirstPlayerForNewRound: function() {
		if (this.gameState.winnerOfLastRound) {
			return this.gameState.winnerOfLastRound;
		}
		
		const playerIsScoiatael = this.gameState.player.faction === 'scoiatael';
		const opponentIsScoiatael = this.gameState.opponent.faction === 'scoiatael';
		
		if (playerIsScoiatael || opponentIsScoiatael) {
			return 'player';
		}
		
		return Math.random() < 0.5 ? 'player' : 'opponent';
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
		this.gameState.selectedCard = null;
		this.gameState.selectingRow = false;
		this.gameState.placementType = null;
		this.gameState.player.abilityUsedThisRound = false;
		this.gameState.opponent.abilityUsedThisRound = false;
		
		if (window.boardModule?.updateAbilityAvailability) {
			setTimeout(() => {
				window.boardModule.updateAbilityAvailability(this.gameState);
			}, 100);
		}
		
		if (window.playerModule && window.playerModule.cancelRowSelection) {
			window.playerModule.cancelRowSelection();
		}
		
		this.gameState.weather.cards.forEach(weatherCard => {
			const cardOwner = this.getWeatherCardOwner(weatherCard);
			this.addCardToDiscard(weatherCard, cardOwner);
		});
		this.gameState.weather.cards = [];
		this.clearAllWeatherEffects();
		
		const rows = ['close', 'ranged', 'siege'];
		
		rows.forEach(row => {
			// ===== ВАЖНО: Восстанавливаем силу карт ПЕРЕД отправкой в сброс =====
			this.gameState.player.rows[row].cards.forEach(card => {
				this.restoreCardToOriginalStrength(card);
			});
			
			this.gameState.opponent.rows[row].cards.forEach(card => {
				this.restoreCardToOriginalStrength(card);
			});
			
			// Теперь отправляем в сброс с восстановленной силой
			this.gameState.player.rows[row].cards.forEach(card => {
				delete card.summonedByFlock;
				delete card._originalId;
				this.addCardToDiscard(card, 'player');
			});
			
			this.gameState.opponent.rows[row].cards.forEach(card => {
				delete card.summonedByFlock;
				delete card._originalId;
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
		this.displayPlayerHand();
		this.displayPlayerDiscard();
		this.displayOpponentDiscard();
		this.updateControlButtons();
		this.stopTurnTimer();
	},

	restoreCardToOriginalStrength: function(card) {
		if (!card) return;
		
		// Восстанавливаем силу из baseStrength (исходная сила карты)
		if (card.baseStrength !== undefined && card.baseStrength !== null) {
			card.strength = card.baseStrength;
			card.currentStrength = card.baseStrength;
			card.modifiedStrength = card.baseStrength;
		} 
		// Если нет baseStrength, но есть originalStrength (старая система)
		else if (card.originalStrength !== undefined && card.originalStrength !== null) {
			card.strength = card.originalStrength;
			card.currentStrength = card.originalStrength;
			card.modifiedStrength = card.originalStrength;
			delete card.originalStrength;
		}
		// Если есть _displayStrength, используем её как базовую
		else if (card._displayStrength !== undefined && card._displayStrength !== null) {
			card.strength = card._displayStrength;
			card.currentStrength = card._displayStrength;
			card.modifiedStrength = card._displayStrength;
			delete card._displayStrength;
		}
		
		// Сбрасываем состояние погоды
		card.underWeather = false;
		
		// Удаляем временные поля
		delete card._displayStrength;
		delete card.summonedByFlock;
		delete card.summonedByCall;
		delete card.usedFlockTag;
		delete card.completeCalled;
		delete card.isSpy;
		
		// Если карта - артефакт с информацией об усилении, удаляем её
		delete card.boostedCardId;
		delete card.boostedCardUniqueId;
		delete card.boostValue;
		delete card.boostedCards;
		delete card.copyNumber;
		delete card.originalCallerId;
		
		// Восстанавливаем owner и row (будут перезаписаны при добавлении в сброс)
		// Но оставляем для корректного отображения
		card.owner = card.owner || 'player';
	},

	restoreAllCardStrengths: function() {
		const rows = ['close', 'ranged', 'siege'];
		const players = ['player', 'opponent'];
		
		rows.forEach(row => {
			players.forEach(player => {
				this.gameState[player].rows[row].cards.forEach(card => {
					// Используем новый метод для восстановления
					this.restoreCardToOriginalStrength(card);
					
					// Обновляем отображение
					this.updateCardStrengthDisplay(card, row, player);
				});
				
				this.updateRowStrength(row, player);
			});
		});
		
		this.updateTotalScoreDisplays();
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

	handleRegularWeather: function(card) {
		const isClearWeather = this.isClearWeatherCard(card);
		
		if (isClearWeather) {
			this.handleClearWeather(card);
			return;
		}
		
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
		} else {
			const regularWeatherCards = this.gameState.weather.cards.filter(wc => 
				!this.isClearWeatherCard(wc)
			);
			if (regularWeatherCards.length >= this.gameState.weather.maxWeatherCards) {
				return;
			}
		}
		if (!card.owner) {
			card.owner = this.gameState.currentPlayer === 'player' ? 'player' : 'opponent';
		}
		this.gameState.weather.cards.push(card);
		this.applyWeatherEffect(card);
		this.displayWeatherCards();
		
		// ВАЖНО: Обновляем общую силу после применения погоды
		this.updateTotalScoreDisplays();
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

	handleClearWeather: function(card) {
		this.playWeatherSound('clear');
		
		const weatherCardsToDiscard = [...this.gameState.weather.cards];
		
		this.gameState.weather.cards = [];
		
		const cardOwner = this.getWeatherCardOwner(card);
		this.addCardToDiscard(card, cardOwner);
		
		const rows = ['close', 'ranged', 'siege'];
		const players = ['player', 'opponent'];
		
		rows.forEach(row => {
			players.forEach(player => {
				this.gameState[player].rows[row].cards.forEach(card => {
					if (card.underWeather) {
						card.underWeather = false;
						
						if (card.modifiedStrength !== undefined) {
							card.currentStrength = card.modifiedStrength;
							card.strength = card.modifiedStrength;
						} else {
							// Если нет модифицированной силы, используем базовую
							card.currentStrength = card.baseStrength || card.strength;
							card.strength = card.currentStrength;
						}
						
						this.updateCardStrengthDisplay(card, row, player);
					}
					else {
						this.updateCardStrengthDisplay(card, row, player);
					}
				});
				
				this.updateRowStrength(row, player);
			});
		});
		
		weatherCardsToDiscard.forEach(weatherCard => {
			const cardOwner = this.getWeatherCardOwner(weatherCard);
			const isAlreadyInDiscard = this.gameState[cardOwner].discard.some(
				discardedCard => discardedCard.id === weatherCard.id
			);
			if (!isAlreadyInDiscard) {
				this.addCardToDiscard(weatherCard, cardOwner);
			}
		});
		
		this.clearAllWeatherEffects();
		
		this.displayWeatherCards();
		
		this.updateTotalScoreDisplays();
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
			
			// Важно: применяем эффект только если это не "Чистое небо"
			if (card.name !== 'Чистое небо') {
				this.reduceRowStrengthTo1(row, 'player');
				this.reduceRowStrengthTo1(row, 'opponent');
			}
			
			if (sounds[row]) {
				this.playWeatherSound(sounds[row]);
			}
		});
		
		// ВАЖНО: Обновляем общую силу после применения всех эффектов погоды
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
					if (card.modifiedStrength !== undefined) {
						card.currentStrength = card.modifiedStrength;
						card.strength = card.modifiedStrength;
					} else if (card.originalStrength !== undefined) {
						card.strength = card.originalStrength;
						delete card.originalStrength;
					} else if (card._displayStrength !== undefined) {
						card.strength = card._displayStrength;
						delete card._displayStrength;
					}
					
					card.underWeather = false;
					
					this.updateCardStrengthDisplay(card, row, player);
				});
				
				this.updateRowStrength(row, player);
			});
		});
		
		this.updateTotalScoreDisplays();
	},

	reduceRowStrengthTo1: function(row, player) {
		this.gameState[player].rows[row].cards.forEach(card => {
			if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) {
				return;
			}
			
			if (card.baseStrength === undefined) {
				card.baseStrength = card.strength || 0;
			}
			if (card.modifiedStrength === undefined) {
				card.modifiedStrength = card.strength || 0;
			}
			if (card.currentStrength === undefined) {
				card.currentStrength = card.strength || 0;
			}
			
			card.underWeather = true;
			
			card.currentStrength = 1;
			
			this.updateCardStrengthDisplay(card, row, player);
		});
		
		this.updateRowStrength(row, player);
		this.updateTotalScoreDisplays();
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
		
		// ВАЖНО: Увеличиваем счетчик сыгранных карт
		this.gameState.cardsPlayedThisTurn++;
		
		this.updateTotalScoreDisplays();
		this.resetTimeoutCounter();
		
		if (this.gameState.cardsPlayedThisTurn >= this.gameState.maxCardsPerTurn) {
			setTimeout(() => {
				const otherPlayer = this.gameState.currentPlayer === 'player' ? 'opponent' : 'player';
				if (this.gameState[otherPlayer].passed) {
					this.gameState[this.gameState.currentPlayer].passed = true;
				}
				this.handleTurnEnd(); // Это переключит ход
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
		// Убеждаемся, что сила восстановлена перед добавлением в сброс
		this.restoreCardToOriginalStrength(card);
		
		// Проверяем, нет ли уже такой карты в сбросе (чтобы избежать дубликатов)
		const isDuplicate = this.gameState[player].discard.some(
			discardedCard => discardedCard.id === card.id && 
							 discardedCard.uniqueId === card.uniqueId
		);
		
		if (!isDuplicate) {
			// Создаем глубокую копию для сброса, чтобы не было ссылок
			const cardCopy = JSON.parse(JSON.stringify(card));
			
			// Убеждаемся, что в копии правильная сила
			if (cardCopy.baseStrength !== undefined) {
				cardCopy.strength = cardCopy.baseStrength;
				cardCopy.currentStrength = cardCopy.baseStrength;
				cardCopy.modifiedStrength = cardCopy.baseStrength;
			}
			
			this.gameState[player].discard.push(cardCopy);
			this.updateDiscardDisplay(player);
		}
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
		if (this.gameState.gamePhase === 'roundEnd') {
			return;
		}
		
		if (this.gameState.player.passed && this.gameState.opponent.passed) {
			this.gameState.gamePhase = 'roundEnd';
			setTimeout(() => this.endRound(), 1000);
			return;
		}
		
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
		const cardsPerRound = this.gameState.gameSettings.cardsPerRound; 
		const maxHandSize = 10;
		const playerCurrentHandSize = this.gameState.player.hand.length;
		const playerCardsCanDraw = Math.min(
			cardsPerRound,
			this.gameState.player.deck.length, 
			maxHandSize - playerCurrentHandSize 
		);
		if (playerCardsCanDraw > 0) {
			const newCards = this.gameState.player.deck.splice(0, playerCardsCanDraw);
			this.gameState.player.hand.push(...newCards);
		}

		const opponentCurrentHandSize = this.gameState.opponent.hand.length;
		const opponentCardsCanDraw = Math.min(
			cardsPerRound,
			this.gameState.opponent.deck.length, 
			maxHandSize - opponentCurrentHandSize 
		);
		if (opponentCardsCanDraw > 0) {
			const newCards = this.gameState.opponent.deck.splice(0, opponentCardsCanDraw);
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

    redrawRow: function(row, player) {
		const rowElement = document.getElementById(`${player}${this.capitalizeFirst(row)}Row`);
		if (!rowElement) return;
		
		rowElement.innerHTML = '';
		
		const cards = this.gameState[player].rows[row].cards;
		cards.forEach(card => {
			const cardElement = player === 'player' ? 
				this.createBoardCardElement(card, 'unit') : 
				this.createOpponentBoardCardElement(card);
			rowElement.appendChild(cardElement);
		});
		
		this.updateRowStrength(row, player);
	},

	displayCardOnRow: function(row, card, player = 'player', insertIndex = -1) {
		const rowElement = document.getElementById(`${player}${this.capitalizeFirst(row)}Row`);
		if (!rowElement) return;

		const cardElement = player === 'player' ? 
			this.createBoardCardElement(card, 'unit') : 
			this.createOpponentBoardCardElement(card);
		
		if (insertIndex >= 0 && insertIndex < rowElement.children.length) {
			const referenceElement = rowElement.children[insertIndex];
			rowElement.insertBefore(cardElement, referenceElement);
		} else {
			rowElement.appendChild(cardElement);
		}
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
		
		const totalStrength = rowState.cards.reduce((sum, card) => {
			let cardStrength = card.currentStrength !== undefined ? card.currentStrength : (card.strength || 0);
			return sum + cardStrength;
		}, 0);
		
		rowState.strength = totalStrength;
		
		const strengthElement = document.getElementById(`${player}${this.capitalizeFirst(row)}Strength`);
		if (strengthElement) {
			strengthElement.textContent = totalStrength;
		}
		
		rowState.cards.forEach(card => {
			this.updateCardStrengthDisplay(card, row, player);
		});
		
		this.invalidateScoreCache(player);
	},

	isCardDamaged: function(card) {
		return card._displayStrength !== undefined && 
			   card.originalStrength !== undefined && 
			   card._displayStrength < card.originalStrength;
	},

	createCardCopy: function(card) {
		const copy = JSON.parse(JSON.stringify(card));
		
		copy.uniqueId = `${card.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		copy.baseStrength = card.strength;
		copy.currentStrength = card.strength;
		copy.modifiedStrength = card.strength;
		copy.underWeather = false;
		
		return copy;
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

	isCardUnderWeather: function(card, row) {
		if (!this.gameState || !this.gameState.weather) return false;
		
		// Проверяем эффекты погоды на ряду
		const rowWeather = this.gameState.weather.effects[row];
		if (!rowWeather) return false;
		
		// Проверяем, что погода влияет на этот ряд
		const weatherEffect = this.getWeatherEffectForCard(rowWeather.card);
		if (!weatherEffect || !weatherEffect.rows) return false;
		
		return weatherEffect.rows.includes(row);
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

		let topRightElement = '';
		if (card.type === 'unit') {
			topRightElement = `<div class="hand-card-strength">${card.strength || 0}</div>`;
		} else {
			topRightElement = `<div class="hand-card-type-icon"><img src="${this.getTypeIconPath(card.type)}" alt="${card.type}"></div>`;
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
			const abilityBanner = card.ability && card.ability.trim() !== ''
				? `<img src="faction/${card.faction}/banner_abbility.png" alt="Способность" class="hand-card-ability-banner">`
				: '';
			const abilityIcon = card.ability && card.ability.trim() !== ''
				? `<img src="${window.cardsModule?.getAbilityIconPath?.(card.ability) || `deck/${card.ability}.webp`}"
						alt="${card.ability}"
						class="hand-card-ability-icon"
						onerror="this.style.display='none'">`
				: '';

			positionElement = `
				<div class="hand-card-position">
					<img src="${card.positionBanner || `faction/${card.faction}/banner_position.png`}" alt="Позиция" class="hand-card-position-banner">
					${abilityBanner}
					${abilityIcon}
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

        this.setupHandCardEventListeners(cardElement, card);
        return cardElement;
    },

	createBoardCardElement: function(card, cardType) {
		const cardElement = document.createElement('div');
		cardElement.className = `board-card ${cardType} ${card.rarity}`;
		cardElement.dataset.cardId = card.id;
		if (card.uniqueId) {
			cardElement.dataset.uniqueId = card.uniqueId; 
		}
        
		cardElement.style.animation = 'cardAppear 0.5s ease-out';
		cardElement.addEventListener('animationend', function() {
			this.style.animation = '';
		});
	
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
		if (card.type === 'unit') {
			topRightElement = `<div class="board-card-strength">${card.strength || 0}</div>`;
		} else {
			topRightElement = `<div class="board-card-type-icon"><img src="${this.getTypeIconPath(card.type)}" alt="${card.type}"></div>`;
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
			const abilityBanner = card.ability && card.ability.trim() !== ''
				? `<img src="faction/${card.faction}/banner_abbility.png" alt="Способность" class="board-card-ability-banner">`
				: '';
			const abilityIcon = card.ability && card.ability.trim() !== ''
				? `<img src="${window.cardsModule?.getAbilityIconPath?.(card.ability) || `deck/${card.ability}.webp`}"
						alt="${card.ability}"
						class="board-card-ability-icon"
						onerror="this.style.display='none'">`
				: '';

			positionElement = `
				<div class="board-card-position">
					<img src="${card.positionBanner || `faction/${card.faction}/banner_position.png`}" alt="Позиция" class="board-card-position-banner">
					${abilityBanner}
					${abilityIcon}
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
		if (card.type === 'unit') {
			topRightElement = `<div class="weather-card-strength">${card.strength || 0}</div>`;
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

	isSpyCard: function(card) {
		if (!card || !card.position) return false;
		
		// Проверяем, содержит ли позиция префикс 'hidden-'
		const positions = Array.isArray(card.position) ? card.position : [card.position];
		return positions.some(pos => pos.startsWith('hidden-'));
	},

	getSpyTargetPosition: function(card) {
		if (!card || !card.position) return null;
		
		const positions = Array.isArray(card.position) ? card.position : [card.position];
		
		// Для скрытых позиций возвращаем соответствующую обычную позицию
		const targetPositions = positions.map(pos => {
			if (pos === 'hidden-close-row') return 'close-row';
			if (pos === 'hidden-ranged-row') return 'ranged-row';
			if (pos === 'hidden-siege-row') return 'siege-row';
			if (pos === 'hidden-any-row') return 'any-row';
			return pos; // Для обычных карт возвращаем как есть
		});
		
		return targetPositions.length === 1 ? targetPositions[0] : targetPositions;
	},

	placeSpyCard: function(card, row, clickX, player = 'player') {
		const opponent = player === 'player' ? 'opponent' : 'player';
		const rowState = this.gameState[opponent].rows[row];
		
		if (rowState.cards.length >= 9) {
			this.showGameMessage('В ряду противника максимальное количество карт!', 'warning');
			return false;
		}
		
		const rowElement = document.getElementById(`${opponent}${this.capitalizeFirst(row)}Row`);
		if (!rowElement) return false;
		
		let insertIndex = rowState.cards.length;
		
		// Определяем позицию для вставки на основе клика
		if (clickX !== undefined && rowState.cards.length > 0) {
			const cardsInRow = Array.from(rowElement.querySelectorAll('.board-card'));
			if (cardsInRow.length > 0) {
				let closestCard = null;
				let minDistance = Infinity;
				const clickRect = rowElement.getBoundingClientRect();
				const relativeX = clickX - clickRect.left;
				
				cardsInRow.forEach((cardElement, index) => {
					const cardRect = cardElement.getBoundingClientRect();
					const cardCenterX = (cardRect.left + cardRect.right) / 2 - clickRect.left;
					const distance = Math.abs(relativeX - cardCenterX);
					
					if (distance < minDistance) {
						minDistance = distance;
						closestCard = { element: cardElement, index: index };
					}
				});
				
				if (closestCard) {
					const cardRect = closestCard.element.getBoundingClientRect();
					const cardCenterX = (cardRect.left + cardRect.right) / 2;
					
					if (clickX < cardCenterX) {
						insertIndex = closestCard.index;
					} else {
						insertIndex = closestCard.index + 1;
					}
				}
			}
		}
		
		// Создаем копию карты для размещения на поле противника
		const cardCopy = this.createCardCopy(card);
		cardCopy.owner = opponent;
		cardCopy.row = row;
		cardCopy.isSpy = true;
		
		// Вставляем карту в ряд противника
		rowState.cards.splice(insertIndex, 0, cardCopy);
		
		// Удаляем карту из руки игрока
		this.removeCardFromHand(card, player);
		
		// Отображаем карту на поле противника
		this.displayCardOnRow(row, cardCopy, opponent, insertIndex);
		
		// Обновляем силу ряда противника - ЭТО ВАЖНО!
		this.updateRowStrength(row, opponent);
		
		if (window.audioManager && window.audioManager.playSound) {
			// Используем те же звуки, что и для обычных карт отрядов
			switch(row) {
				case 'close':
					audioManager.playSound('card_close');
					break;
				case 'ranged':
					audioManager.playSound('card_range');
					break;
				case 'siege':
					audioManager.playSound('card_siege');
					break;
				default:
					audioManager.playSound('card_close');
			}
		}
		
		// Выполняем добор карты
		this.drawCardForSpy(card, player);
		
		// Увеличиваем счетчик сыгранных карт
		this.gameState.cardsPlayedThisTurn++;
		
		// Обновляем общий счет
		this.updateTotalScoreDisplays();
		
		// Сбрасываем таймер
		this.resetTimeoutCounter();
		
		return true;
	},

	drawCardForSpy: function(spyCard, player) {
		const playerState = this.gameState[player];
		const CARDS_TO_DRAW = 2;
		let drawnCount = 0;
		const drawnCards = [];
		
		const targetPosition = this.getSpyTargetPosition(spyCard);
		
		for (let i = 0; i < CARDS_TO_DRAW; i++) {
			if (playerState.deck.length === 0) {
				break;
			}
			
			// Определяем, какие карты искать
			let cardsToSearch = [];
			
			if (targetPosition === 'any-row' || (Array.isArray(targetPosition) && targetPosition.includes('any-row'))) {
				cardsToSearch = [...playerState.deck];
			} else {
				const targetPositions = Array.isArray(targetPosition) ? targetPosition : [targetPosition];
				
				cardsToSearch = playerState.deck.filter(card => {
					if (!card.position) return false;
					
					const cardPositions = Array.isArray(card.position) ? card.position : [card.position];
					
					return cardPositions.some(pos => 
						targetPositions.includes(pos) && !pos.startsWith('hidden-')
					);
				});
			}
			
			let drawnCard = null;
			
			if (cardsToSearch.length === 0) {
				// Если нет карт с нужной позицией, берем любую карту
				const randomIndex = Math.floor(Math.random() * playerState.deck.length);
				drawnCard = playerState.deck.splice(randomIndex, 1)[0];
			} else {
				// Выбираем случайную карту из подходящих
				const randomIndex = Math.floor(Math.random() * cardsToSearch.length);
				drawnCard = cardsToSearch[randomIndex];
				
				// Удаляем её из колоды
				const deckIndex = playerState.deck.findIndex(c => c.id === drawnCard.id);
				if (deckIndex !== -1) {
					playerState.deck.splice(deckIndex, 1);
				}
			}
			
			if (drawnCard) {
				playerState.hand.push(drawnCard);
				drawnCards.push(drawnCard);
				drawnCount++;
			}
		}
		
		// Обновляем отображение
		this.displayPlayerHand();
		this.displayPlayerDeck();
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_draw');
		}
		
		if (drawnCount > 0) {
			const names = drawnCards.map(c => c.name).join(', ');
			this.showGameMessage(`Шпион: добор ${drawnCount} карт${drawnCount > 1 ? 'ы' : ''} — ${names}`, 'info');
		} else {
			this.showGameMessage('Шпион: в колоде нет карт для добора', 'warning');
		}
		
		return true;
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
		let playerDeck;
		
		if (window.deckModule && window.deckModule.currentDeck) {
			playerDeck = window.deckModule.currentDeck;
			
			if (playerDeck.faction && playerDeck.cards && playerDeck.cards.length > 0) {
				this.gameState.player.deck = this.shuffleArray([...playerDeck.cards]);
				this.gameState.player.faction = playerDeck.faction;
				this.gameState.player.ability = playerDeck.ability;
			} else {
				this.loadDemoDeck('player');
			}
		} else {
			this.loadDemoDeck('player');
		}
		
		this.displayPlayerDeck();
	},

	loadOpponentDeck: function() {
		const availableFactions = this.getAvailableFactions();
		if (availableFactions.length === 0) {
			console.error('Нет доступных фракций для противника');
			return;
		}
		
		const randomFaction = availableFactions[Math.floor(Math.random() * availableFactions.length)];
		const factionCards = window.cardsModule?.getFactionCards(randomFaction.id);
		
		if (!factionCards) {
			console.error(`Не удалось загрузить карты для фракции ${randomFaction.id}`);
			return;
		}
		
		this.gameState.opponent.deck = this.createBalancedDeck(factionCards, randomFaction.id);
		this.gameState.opponent.faction = randomFaction.id;
		this.gameState.opponent.ability = this.getRandomFactionAbility(randomFaction.id);
		
		this.displayOpponentDeck();
	},

	setupPlayerLeader: function() {
		const leaderSlot = document.getElementById('playerLeader');
		if (!leaderSlot) return;

		const faction = this.gameState.player.faction;
		const factionData = window.factionModule?.factionsData[faction];
		if (!factionData) return;

		const abilityId = this.gameState.player.ability;
		
		const leaderCardData = {
			id: `${faction}_leader`,
			name: factionData.leaderName.split(' ')[0],
			namefull: factionData.leaderName,
			type: 'leader',
			faction: faction,
			image: `leader.mp4`, 
			imageStatic: `leader.jpg`,
			description: factionData.description,
			descriptionfull: factionData.descriptionfull,
			ability: abilityId,
			rarity: 'gold',
			tags: ['leader'],
			border: 'deck/bord_gold.png',
			banner: `faction/${faction}/banner_gold.png`
		};

		this.gameState.player.leader = leaderCardData;
		this.gameState.player.ability = abilityId;
		leaderSlot.appendChild(this.createLeaderCardElement(leaderCardData, 'player'));
		
		// Инициализируем иконку способности после создания лидера
		setTimeout(() => {
			if (window.boardModule && window.boardModule.initAbilityIcon) {
				window.boardModule.initAbilityIcon();
			}
		}, 100);
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
            descriptionfull: factionData.descriptionfull,
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
		
		// Функция фильтрации скрытых карт
		const filterHidden = (cards) => (cards || []).filter(card => !card.hidden);
		
		// Функция для добавления карт с учётом лимита копий
		const addCardsWithLimit = (cards, targetArray, usedCounts, maxTotal) => {
			// Перемешиваем карты для случайного порядка
			const shuffled = this.shuffleArray([...cards]);
			
			for (const card of shuffled) {
				// Если достигнут лимит общего количества - выходим
				if (maxTotal !== undefined && targetArray.length >= maxTotal) break;
				
				// Определяем максимальное количество копий для этой карты
				const maxCopies = card.copy || 1; // По умолчанию 1 копия
				
				// Сколько уже добавлено этой карты
				const currentCount = usedCounts[card.id] || 0;
				
				// Если ещё можно добавить
				if (currentCount < maxCopies) {
					targetArray.push(card);
					usedCounts[card.id] = currentCount + 1;
				}
			}
		};
		
		const unitCards = filterHidden(factionCards.units || []);
		const specialCards = filterHidden(factionCards.specials || []);
		const artifactCards = filterHidden(factionCards.artifacts || []);
		const tacticCards = filterHidden(factionCards.tactics || []);
		
		const neutralCards = window.cardsModule?.getFactionCards('neutral') || {};
		const neutralUnits = filterHidden(neutralCards.units || []);
		const neutralSpecials = filterHidden(neutralCards.specials || []);
		const neutralArtifacts = filterHidden(neutralCards.artifacts || []);
		const neutralTactics = filterHidden(neutralCards.tactics || []);
		
		const allUnits = [...unitCards, ...neutralUnits];
		const allSpecials = [...specialCards, ...neutralSpecials];
		const allArtifacts = [...artifactCards, ...neutralArtifacts];
		const allTactics = [...tacticCards, ...neutralTactics];
		const allSpecialCards = [...allSpecials, ...allArtifacts, ...allTactics];
		
		// Счётчики использованных карт
		const usedCounts = {};
		
		const minDeckSize = 22;    
		const maxDeckSize = 40;    
		const minUnits = 22;        
		const minSpecials = 8;       
		const maxSpecials = 10;     
		
		const specialCount = minSpecials + Math.floor(Math.random() * (maxSpecials - minSpecials + 1));
		
		// Добавляем специальные карты с учётом лимита
		addCardsWithLimit(allSpecialCards, deck, usedCounts, specialCount);
		
		// Добавляем отряды с учётом лимита
		const maxUnits = maxDeckSize - deck.length;
		const unitsNeeded = Math.max(minUnits, Math.min(allUnits.length, maxUnits));
		addCardsWithLimit(allUnits, deck, usedCounts, deck.length + unitsNeeded);
		
		const currentDeckSize = deck.length;
		
		// Если колода меньше минимального размера, добираем карты
		if (currentDeckSize < minDeckSize) {
			const cardsNeeded = minDeckSize - currentDeckSize;
			const allCards = [...allUnits, ...allSpecialCards];
			const shuffledAll = this.shuffleArray([...allCards]);
			
			let added = 0;
			for (const card of shuffledAll) {
				if (added >= cardsNeeded) break;
				
				const maxCopies = card.copy || 1;
				const currentCount = usedCounts[card.id] || 0;
				
				if (currentCount < maxCopies) {
					deck.push(card);
					usedCounts[card.id] = currentCount + 1;
					added++;
				}
			}
			
			// Если всё ещё не хватает - используем карты с увеличенным лимитом
			if (added < cardsNeeded) {
				for (let i = 0; i < cardsNeeded - added; i++) {
					const randomCard = shuffledAll[i % shuffledAll.length];
					deck.push({...randomCard, id: `${randomCard.id}_extra_${i}`});
				}
			}
		}
		
		// Если колода больше максимального размера, обрезаем
		if (deck.length > maxDeckSize) {
			deck.length = maxDeckSize;
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
		if (card.uniqueId) {
			cardElement.dataset.uniqueId = card.uniqueId; 
		}
        
        const { mediaPath, isVideo } = this.getCardMediaPath(card);

        let mediaElement = isVideo ? 
            `<video class="board-card-media" muted playsinline preload="metadata"><source src="${mediaPath}" type="video/mp4"></video>` :
            `<img src="${mediaPath}" alt="${card.name}" class="board-card-media" onerror="this.src='card/placeholder.jpg'">`;

		let topRightElement = '';
		if (card.type === 'unit') {
			topRightElement = `<div class="board-card-strength">${card.strength || 0}</div>`;
		} else {
			topRightElement = `<div class="board-card-type-icon"><img src="${this.getTypeIconPath(card.type)}" alt="${card.type}"></div>`;
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
			const abilityBanner = card.ability && card.ability.trim() !== ''
				? `<img src="faction/${card.faction}/banner_abbility.png" alt="Способность" class="board-card-ability-banner">`
				: '';
			const abilityIcon = card.ability && card.ability.trim() !== ''
				? `<img src="${window.cardsModule?.getAbilityIconPath?.(card.ability) || `deck/${card.ability}.webp`}"
						alt="${card.ability}"
						class="board-card-ability-icon"
						onerror="this.style.display='none'">`
				: '';

			positionElement = `
				<div class="board-card-position">
					<img src="${card.positionBanner || `faction/${card.faction}/banner_position.png`}" alt="Позиция" class="board-card-position-banner">
					${abilityBanner}
					${abilityIcon}
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

		// Клик по лидеру игрока - модальное окно с картой
		const playerLeader = document.getElementById('playerLeader');
		if (playerLeader) {
			playerLeader.addEventListener('click', (event) => {
				// Если клик по иконке способности - игнорируем
				if (event.target.closest('.leader-ability-icon')) {
					return;
				}
				// Показываем карту лидера
				const leaderCard = this.gameState.player.leader;
				if (leaderCard) {
					this.showCardModal(leaderCard);
				}
			});
			playerLeader.addEventListener('mouseenter', () => audioManager.playSound('touch'));
		}

		// Клик по лидеру противника - модальное окно с картой
		const opponentLeader = document.getElementById('opponentLeader');
		if (opponentLeader) {
			opponentLeader.addEventListener('click', (event) => {
				// Если клик по иконке способности - игнорируем
				if (event.target.closest('.leader-ability-icon')) {
					return;
				}
				// Показываем карту лидера противника
				const leaderCard = this.gameState.opponent.leader;
				if (leaderCard) {
					this.showCardModal(leaderCard);
				}
			});
			opponentLeader.addEventListener('mouseenter', () => audioManager.playSound('touch'));
		}
	},

	useLeaderAbility: function() {
		const abilityId = this.gameState.player.ability;
		
		if (!abilityId) {
			this.showGameMessage('Не выбрана способность лидера', 'warning');
			return false;
		}
		
		if (window.leaderAbilities && window.leaderAbilities[abilityId]) {
			const result = window.leaderAbilities[abilityId].execute(this.gameState, this);
			if (result !== false) {
				this.gameState.player.abilityUsedThisRound = true;
				
				// ===== ВАЖНО: ОБНОВЛЯЕМ ИКОНКУ =====
				if (window.boardModule?.markAbilityAsUsed) {
					window.boardModule.markAbilityAsUsed();
				}
				
				// Дополнительно обновляем доступность
				if (window.boardModule?.updateAbilityAvailability) {
					setTimeout(() => {
						window.boardModule.updateAbilityAvailability(this.gameState);
					}, 100);
				}
				
				return true;
			}
			return false;
		} else {
			this.showGameMessage('Способность лидера не реализована', 'warning');
			return false;
		}
	},

	handleLeaderClick: function() {
		if (!this.canUseLeaderAbility()) {
			return;
		}
		
		const faction = this.gameState.player.faction;
		const abilityId = this.gameState.player.ability;
		
		if (!abilityId) {
			this.showGameMessage('Не выбрана способность лидера', 'warning');
			return;
		}
		
		if (window.leaderAbilities && window.leaderAbilities[abilityId]) {
			window.leaderAbilities[abilityId].execute(this.gameState, this);
		} else {
			this.showGameMessage('Способность лидера не реализована', 'warning');
		}
	},

	canUseLeaderAbility: function() {
		if (this.gameState.gamePhase !== 'playerTurn') {
			this.showGameMessage('Способность Лидера можно использовать только в свой ход', 'warning');
			return false;
		}
		
		if (this.gameState.player.passed) {
			this.showGameMessage('Нельзя использовать способность Лидера после паса', 'warning');
			return false;
		}
		
		// Проверяем, что способность ещё не использована в этом раунде
		if (this.gameState.player.abilityUsedThisRound) {
			this.showGameMessage('Способность Лидера уже использована в этом раунде', 'warning');
			return false;
		}
		
		return true;
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

			let strengthElement = '';
			let typeIconElement = '';

			if (card.type === 'unit') {
				strengthElement = `<div class="deck-card__strength">${card.strength || 0}</div>`;
			} else {
				typeIconElement = `<div class="deck-card__type-icon"><img src="${this.getTypeIconPath(card.type)}" alt="${card.type}"></div>`;
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

				const abilityBanner = card.ability && card.ability.trim() !== ''
					? `<img src="faction/${card.faction}/banner_abbility.png" alt="Способность" class="deck-card__ability-banner">`
					: '';
				const abilityIcon = card.ability && card.ability.trim() !== ''
					? `<img src="${window.cardsModule?.getAbilityIconPath?.(card.ability) || `deck/${card.ability}.webp`}"
							alt="${card.ability}"
							class="deck-card__ability-icon"
							onerror="this.style.display='none'">`
					: '';

				positionElement = `
					<div class="deck-card__position">
						<img src="${card.positionBanner || `faction/${card.faction}/banner_position.png`}" alt="Позиция" class="deck-card__position-banner">
						${abilityBanner}
						${abilityIcon}
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
		
		const selector = card.uniqueId 
			? `[data-unique-id="${card.uniqueId}"]`
			: `[data-card-id="${card.id}"]`;
		const cardElements = rowElement.querySelectorAll(selector);
		
		cardElements.forEach(cardElement => {
			const strengthElement = cardElement.querySelector('.board-card-strength');
			
			if (card.type === 'special' && card.ability === 'decoy') {
				if (strengthElement) {
					strengthElement.style.display = 'none';
				}
				return;
			}
			
			if (strengthElement) {
				let displayValue;
				let isDamaged = false;
				let isBoosted = false;
				let isUnderWeather = false;
				
				if (card.currentStrength !== undefined) {
					displayValue = card.currentStrength;
				} else if (card._displayStrength !== undefined) {
					displayValue = card._displayStrength;
				} else {
					displayValue = card.strength || 0;
				}
				
				strengthElement.textContent = displayValue;
				strengthElement.style.display = '';
				
				const baseStrength = card.baseStrength || card.originalStrength || card.strength || 0;
				
				isUnderWeather = card.underWeather === true;
				
				if (displayValue < baseStrength && !isUnderWeather) {
					isDamaged = true;
				}
				
				if (displayValue > baseStrength && !isUnderWeather) {
					isBoosted = true;
				}
				
				if (isUnderWeather) {
					strengthElement.style.color = '#ff4444';
					strengthElement.style.animation = 'strengthReduced 2s infinite';
					cardElement.dataset.strengthStatus = 'weather';
				} else if (isDamaged) {
					strengthElement.style.color = '#ff4444';
					strengthElement.style.animation = 'strengthReduced 2s infinite';
					cardElement.dataset.strengthStatus = 'damaged';
				} else if (isBoosted) {
					strengthElement.style.color = '#4CAF50';
					strengthElement.style.animation = 'strengthBoosted 2s infinite';
					cardElement.dataset.strengthStatus = 'boosted';
				} else {
					strengthElement.style.color = 'white';
					strengthElement.style.animation = 'none';
					cardElement.dataset.strengthStatus = 'normal';
				}
			}
		});
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

		// Определяем силу для отображения (базовую)
		let displayStrength = card.strength || 0;
		if (card.baseStrength !== undefined) {
			displayStrength = card.baseStrength;
		} else if (card.originalStrength !== undefined) {
			displayStrength = card.originalStrength;
		}

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
				<h3 style="color: #d4af37; margin-bottom: 10px;">${card.name || 'Неизвестная карта'}</h3>
				<p>${card.description || 'Описание отсутствует'}</p>
				${displayStrength ? `<p><strong>Сила:</strong> ${displayStrength}</p>` : ''}
				${card.tags && card.tags.length ? `<p><strong>Теги:</strong> ${card.tags.join(', ')}</p>` : ''}
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
			// Создаем копию карты для модального окна
			const cardForModal = { ...card };
			
			// Для модального окна показываем БАЗОВУЮ силу карты (baseStrength)
			if (card.baseStrength !== undefined) {
				cardForModal.strength = card.baseStrength;
				cardForModal.showOriginalStrength = true;
			} 
			// Если нет baseStrength, используем оригинальную силу из старых систем
			else if (card.originalStrength !== undefined) {
				cardForModal.strength = card.originalStrength;
				cardForModal.showOriginalStrength = true;
			}
			// Если карта на поле и имеет модификаторы, показываем базовую силу
			else if (card.row !== undefined || card.positionInRow !== undefined) {
				// Для карт на поле используем baseStrength
				cardForModal.strength = card.baseStrength || card.strength || 0;
			}
			// Для карт в руке или колоде показываем обычную силу
			else {
				cardForModal.strength = card.strength || 0;
			}
			
			// Удаляем временные поля, чтобы они не отображались в модальном окне
			delete cardForModal.currentStrength;
			delete cardForModal.modifiedStrength;
			delete cardForModal._displayStrength;
			delete cardForModal.underWeather;
			
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
		
		let resultImage;
		
		if (winner === 'player') {
			resultImage = 'board/win.png';
		} else if (winner === 'opponent') {
			resultImage = 'board/lose.png';
		} else {
			resultImage = 'board/draw.png';
		}
		
		// ===== ИСПРАВЛЕНИЕ: ОТОБРАЖАЕМ ТЕКУЩИЙ СЧЁТ =====
		const scoreText = `${this.gameState.roundsWon.player} : ${this.gameState.roundsWon.opponent}`;
		
		resultOverlay.innerHTML = `
			<div class="round-result-container">
				<img src="${resultImage}" alt="Результат раунда" class="round-result-image">
				<div class="round-score" style="
					font-family: 'Gwent', sans-serif;
					font-size: 32px;
					color: #d4af37;
					text-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
					margin-top: 10px;
					text-align: center;
				">${scoreText}</div>
			</div>
		`;
		
		this.updateCrownIndicators();
		document.body.appendChild(resultOverlay);
		this.animateResultAppear(resultOverlay);
		
		// ===== ИСПРАВЛЕНИЕ: ПРОВЕРКА ЗАВЕРШЕНИЯ ИГРЫ =====
		const playerWins = this.gameState.roundsWon.player;
		const opponentWins = this.gameState.roundsWon.opponent;
		const isGameOver = (playerWins >= 2 || opponentWins >= 2);
		
		setTimeout(() => {
			if (document.body.contains(resultOverlay)) {
				this.animateResultDisappear(resultOverlay);
				
				if (!isGameOver) {
					setTimeout(() => {
						this.startNewRoundAfterDelay();
					}, 400);
				}
			}
		}, 3000);
	},

	startNewRoundAfterDelay: function() {
		const playerWins = this.gameState.roundsWon.player;
		const opponentWins = this.gameState.roundsWon.opponent;
		
		// ===== ИСПРАВЛЕНИЕ: ПРОВЕРКА НА ЗАВЕРШЕНИЕ =====
		// Игра завершена, если кто-то набрал 2 очка
		if (playerWins >= 2 || opponentWins >= 2) {
			return;
		}
		
		this.stopTurnTimer();
		
		if (this.gameState.currentRound < this.gameState.totalRounds) {
			this.gameState.currentRound++;
		} else {
			return;
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('round_start');
		}
		
		this.showRoundStartMessage(`РАУНД ${this.gameState.currentRound}`);
		
		this.updateRoundCounter();
		this.updateCrownIndicators();
		this.resetRoundState();
		this.dealAdditionalCards();
		
		let firstPlayer = this.determineFirstPlayerForNewRound();
		this.gameState.currentPlayer = firstPlayer;
		
		setTimeout(() => {
			if (firstPlayer === 'player') {
				this.startPlayerTurn();
			} else {
				this.startOpponentTurn();
			}
		}, 3000);
	},

	showRoundStartMessage: function(text) {
		const existingMessage = document.getElementById('roundStartMessage');
		if (existingMessage) {
			existingMessage.remove();
		}
		
		const messageOverlay = document.createElement('div');
		messageOverlay.id = 'roundStartMessage';
		messageOverlay.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.7);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 10001;
			pointer-events: none;
			animation: roundMessageFadeIn 0.5s ease-out;
		`;
		
		const messageContainer = document.createElement('div');
		messageContainer.style.cssText = `
			text-align: center;
			animation: roundMessageScale 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
		`;
		
		const roundNumber = this.gameState.currentRound;
		let roundColor = '#d4af37'; 
		
		if (roundNumber === 1) {
			roundColor = '#4CAF50'; 
		} else if (roundNumber === 2) {
			roundColor = '#ff9800'; 
		} else if (roundNumber === 3) {
			roundColor = '#f44336'; 
		}
		
		messageContainer.innerHTML = `
			<div style="
				font-family: 'Gwent', sans-serif;
				font-size: 45px;
				text-transform: uppercase;
				letter-spacing: 8px;
				color: ${roundColor};
				text-shadow: 0 0 20px ${roundColor}, 0 0 40px rgba(0,0,0,0.5);
				margin-bottom: 20px;
				animation: roundTextGlow 1s ease-in-out infinite;
			">${text}</div>
		`;
		
		messageOverlay.appendChild(messageContainer);
		document.body.appendChild(messageOverlay);
		
		setTimeout(() => {
			if (messageOverlay && messageOverlay.parentNode) {
				messageOverlay.style.animation = 'roundMessageFadeOut 0.5s ease-in';
				setTimeout(() => {
					if (messageOverlay.parentNode) {
						messageOverlay.parentNode.removeChild(messageOverlay);
					}
				}, 500);
			}
		}, 2500);
	},

	generateRoundsProgress: function() {
		let progressHTML = '';
		const totalRounds = this.gameState.totalRounds;
		const roundResults = this.gameState.roundResults || [];
		
		for (let i = 1; i <= totalRounds; i++) {
			let roundClass, roundSymbol, roundColor, tooltip;
			const roundResult = roundResults[i - 1];
			
			if (!roundResult || i > roundResults.length) {
				roundClass = 'empty';
				roundSymbol = i;
				roundColor = '#666';
				tooltip = 'Раунд не сыгран';
			} else if (roundResult === 'draw') {
				roundClass = 'draw';
				roundSymbol = '＝';
				roundColor = '#FFD700';
				tooltip = 'Ничья';
			} else if (roundResult === 'player') {
				roundClass = 'player-win';
				roundSymbol = '✓';
				roundColor = '#4CAF50';
				tooltip = 'Победа игрока';
			} else if (roundResult === 'opponent') {
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
					border: 1px solid ${roundColor};
					position: relative;
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

		// Поднимаем canvas поверх фона оверлея
		const fireCanvas = document.querySelector('.fire-canvas');
		if (fireCanvas) {
			fireCanvas.dataset.prevZIndex = fireCanvas.style.zIndex || '';
			fireCanvas.style.zIndex = '10001';
		}
		window.FireParticles?.start();

		const resultOverlay = document.createElement('div');
		resultOverlay.className = 'game-result-overlay';
		
		let resultImage;
		const finalScore = `${this.gameState.roundsWon.player}-${this.gameState.roundsWon.opponent}`;
		
		if (winner === 'player') {
			resultImage = 'board/win.png';
		} else if (winner === 'opponent') {
			resultImage = 'board/lose.png';
		} else {
			resultImage = 'board/draw.png';
		}
		
		// Оборачиваем содержимое в контейнер с z-index выше canvas
		resultOverlay.innerHTML = `
			<div class="game-result-container" style="position: relative; z-index: 10002;">
				<img src="${resultImage}" alt="Результат игры" class="game-result-image">
				<div class="final-score">${finalScore}</div>
				<div class="action-buttons">
					<button class="restart-btn">В ГЛАВНОЕ МЕНЮ</button>
					<button class="redeck-btn">К СБОРУ КОЛОДЫ</button>
				</div>
			</div>
		`;
		
		document.body.appendChild(resultOverlay);
		
		const restartBtn = resultOverlay.querySelector('.restart-btn');
		const redeckBtn = resultOverlay.querySelector('.redeck-btn');
		
		restartBtn.addEventListener('click', () => {
			audioManager.playSound('button');
			this.stopParticlesForResult();
			document.body.removeChild(resultOverlay);
			this.returnToMainMenu();
		});
		
		redeckBtn.addEventListener('click', () => {
			audioManager.playSound('button');
			this.stopParticlesForResult();
			document.body.removeChild(resultOverlay);
			this.redeckGame();
		});
	},

	stopParticlesForResult: function() {
		window.FireParticles?.stop();
		const fireCanvas = document.querySelector('.fire-canvas');
		if (fireCanvas) {
			fireCanvas.style.zIndex = fireCanvas.dataset.prevZIndex || '';
			delete fireCanvas.dataset.prevZIndex;
		}
	},
	
	returnToMainMenu: function() {
		if (window.audioManager) {
			window.audioManager.restoreSavedMusic();
		}
		window.location.reload();
	},

	redeckGame: function() {
		const playerDeck = window.deckModule?.currentDeck;
		
		if (!playerDeck || !playerDeck.faction) {
			if (window.audioManager) {
				window.audioManager.restoreSavedMusic();
			}
			window.location.reload();
			return;
		}
		
		const factionId = playerDeck.faction;
		const factionData = window.factionModule?.factionsData[factionId];
		
		if (!factionData) {
			if (window.audioManager) {
				window.audioManager.restoreSavedMusic();
			}
			window.location.reload();
			return;
		}
		
		this.stopTurnTimer();
		this.resetGameState();
		
		const gameBoard = document.querySelector('.game-board');
		if (gameBoard) gameBoard.remove();
		
		const gameResultOverlay = document.querySelector('.game-result-overlay');
		if (gameResultOverlay) gameResultOverlay.remove();
		
		const modals = document.querySelectorAll('.card-modal-overlay, .deck-modal-overlay, .round-result-overlay');
		modals.forEach(modal => modal.remove());
		
		const deckBuilding = document.querySelector('.deck-building');
		if (deckBuilding) deckBuilding.remove();
		
		if (window.audioManager) {
			window.audioManager.restoreSavedMusic();
		}
		
		if (window.deckModule && window.deckModule.initDeckBuilding) {
			window.deckModule.initDeckBuilding(factionData);
		} else {
			window.location.reload();
		}
		
		this.resetCrownIndicators();
	},

	resetGameState: function() {
		const playerFaction = this.gameState.player.faction;
		const playerAbility = this.gameState.player.ability;
		
		this.gameState = {
			player: {
				deck: [],
				hand: [],
				discard: [],
				leader: null,
				faction: playerFaction, 
				ability: playerAbility,
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
			roundResults: [],
			winnerOfLastRound: null,
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
		};
		
		if (window.aiModule && window.aiModule.reset) {
			window.aiModule.reset();
		}
		
		if (window.playerModule) {
			window.playerModule.gameState = this.gameState;
		}
		
		if (window.aiModule) {
			window.aiModule.gameState = this.gameState;
		}
		
		this.resetCrownIndicators();
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
			'siege-row': 'deck/siege-row.png',
			'any-row': 'deck/any-row.png',
			'hidden-close-row': 'deck/hidden-close-row.png',
			'hidden-ranged-row': 'deck/hidden-ranged-row.png',
			'hidden-siege-row': 'deck/hidden-siege-row.png',
			'hidden-any-row': 'deck/hidden-any-row.png'
        };
        return positionIcons[position] || 'deck/any-row.png';
    },
	
	getPositionName: function(position) {
		const positionNames = {
			'close-row': 'Ближний бой',
			'ranged-row': 'Дальний бой',
			'siege-row': 'Осадный ряд',
			'any-row': 'Все ряды',
			'hidden-close-row': 'Ближний бой',
			'hidden-ranged-row': 'Дальний бой',
			'hidden-siege-row': 'Осадный ряд',
			'hidden-any-row': 'Все ряды'
		};
		return positionNames[position] || position;
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

	showGameMessage: function(text, type = 'info') {
		let messageContainer = document.getElementById('gameMessages');
		if (!messageContainer) {
			messageContainer = document.createElement('div');
			messageContainer.id = 'gameMessages';
			document.body.appendChild(messageContainer);
		}
		
		const messageElement = document.createElement('div');
		messageElement.className = `game-message game-message-${type}`;
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

};

window.gameModule = gameModule;