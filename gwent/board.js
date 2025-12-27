const boardModule = {
    gameState: null,
    boardElement: null,

    initGameBoard: function() {
        this.hideDeckBuilding();
        this.createBoardHTML();
        this.setupBoardEventListeners();
        this.animateBoardEntrance();
	
	setTimeout(() => {
		if (window.gameModule && window.gameModule.init) {
			window.gameModule.init();
		}
	}, 1000);
	},

    hideDeckBuilding: function() {
        const deckBuildingSection = document.querySelector('.deck-building');
        if (deckBuildingSection) {
            deckBuildingSection.style.opacity = '0';
            deckBuildingSection.style.transform = 'translateY(50px)';
            setTimeout(() => {
                deckBuildingSection.remove();
            }, 800);
        }
    },

    createBoardHTML: function() {
        const boardSection = document.createElement('section');
        boardSection.className = 'game-board';
        boardSection.innerHTML = this.generateBoardHTML();
        document.body.appendChild(boardSection);
        this.boardElement = boardSection;
    },

    generateBoardHTML: function() {
        return `
            <!-- Фон игрового поля -->
            <div class="board-background"></div>
            
            <!-- Область лидера противника -->
            <div class="opponent-leader-area leader-area">
                <div class="leader-slot" id="opponentLeader"></div>
            </div>

            <!-- Область лидера игрока -->
            <div class="player-leader-area leader-area">
                <div class="leader-slot" id="playerLeader"></div>
            </div>

            <!-- Область погоды -->
            <div class="weather-area">
                <div class="weather-slot" id="weatherSlot"></div>
            </div>

            <!-- Колоды противника -->
            <div class="opponent-decks-area decks-area">
                <div class="deck-slot discard-pile" id="opponentDiscard">
                    <span>Сброс</span>
                </div>
                <div class="deck-slot deck-pile" id="opponentDeck">
                    <span>Колода</span>
                </div>
            </div>

            <!-- Колоды игрока -->
            <div class="player-decks-area decks-area">
                <div class="deck-slot discard-pile" id="playerDiscard">
                    <span>Сброс</span>
                </div>
                <div class="deck-slot deck-pile" id="playerDeck">
                    <span>Колода</span>
                </div>
            </div>

            <!-- Счетчик раундов -->
            <div class="round-counter-area">
                <div class="round-display">
                    <img src="gwent/round1.png" alt="Раунд 1" class="round-image" id="roundImage">
                </div>
            </div>

            <!-- Рука игрока -->
            <div class="player-hand-area">
                <div class="hand-cards" id="playerHand"></div>
            </div>

            <!-- Ряды игрока -->
            <div class="player-rows-area battle-rows">
                
                <!-- Ряд ближнего боя -->
                <div class="battle-row close-row" data-row="close">
                    <div class="row-strength player-strength" id="playerCloseStrength">0</div>
                    <div class="tactics-slot player-tactics" id="playerCloseTactics"></div>
                    <div class="cards-row" id="playerCloseRow"></div>
                </div>
                
                <!-- Ряд дальнего боя -->
                <div class="battle-row ranged-row" data-row="ranged">
                    <div class="row-strength player-strength" id="playerRangedStrength">0</div>
                    <div class="tactics-slot player-tactics" id="playerRangedTactics"></div>
                    <div class="cards-row" id="playerRangedRow"></div>
                </div>
				
                <!-- Ряд осады -->
                <div class="battle-row siege-row" data-row="siege">
                    <div class="row-strength player-strength" id="playerSiegeStrength">0</div>
                    <div class="tactics-slot player-tactics" id="playerSiegeTactics"></div>
                    <div class="cards-row" id="playerSiegeRow"></div>
                </div>
            </div>

            <!-- Ряды противника -->
            <div class="opponent-rows-area battle-rows">
                
                <!-- Ряд осады -->
                <div class="battle-row siege-row" data-row="siege">
                    <div class="row-strength opponent-strength" id="opponentSiegeStrength">0</div>
                    <div class="tactics-slot opponent-tactics" id="opponentSiegeTactics"></div>
                    <div class="cards-row" id="opponentSiegeRow"></div>
                </div>
                
                <!-- Ряд дальнего боя -->
                <div class="battle-row ranged-row" data-row="ranged">
                    <div class="row-strength opponent-strength" id="opponentRangedStrength">0</div>
                    <div class="tactics-slot opponent-tactics" id="opponentRangedTactics"></div>
                    <div class="cards-row" id="opponentRangedRow"></div>
                </div>
				
                <!-- Ряд ближнего боя -->
                <div class="battle-row close-row" data-row="close">
                    <div class="row-strength opponent-strength" id="opponentCloseStrength">0</div>
                    <div class="tactics-slot opponent-tactics" id="opponentCloseTactics"></div>
                    <div class="cards-row" id="opponentCloseRow"></div>
                </div>
            </div>

            <!-- Элементы управления игрой -->
            <div class="game-controls">
                <button class="control-btn pass-btn" id="passBtn">ПАС</button>
                <button class="control-btn end-turn-btn" id="endTurnBtn">ЗАКОНЧИТЬ ХОД</button>
            </div>
        `;
    },

    setupBoardEventListeners: function() {
        // Обработчики для кнопок управления
        const passBtn = document.getElementById('passBtn');
        const endTurnBtn = document.getElementById('endTurnBtn');

        if (passBtn) {
            passBtn.addEventListener('click', () => this.handlePass());
            passBtn.addEventListener('mouseenter', () => audioManager.playSound('touch'));
        }

        if (endTurnBtn) {
            endTurnBtn.addEventListener('click', () => this.handleEndTurn());
            endTurnBtn.addEventListener('mouseenter', () => audioManager.playSound('touch'));
        }

        // Обработчики для слотов карт
        this.setupCardSlotsEventListeners();
    },

    setupCardSlotsEventListeners: function() {
        // Будет реализовано в game.js
        console.log('Настройка обработчиков для слотов карт...');
    },

	handlePass: function() {
		audioManager.playSound('button');
		console.log('⏸️ Игрок пасует');
		
		// ВЫЗЫВАЕМ ПРАВИЛЬНЫЙ МЕТОД ИЗ playerModule
		if (window.playerModule && window.playerModule.handlePass) {
			window.playerModule.handlePass();
		}
	},

	handleEndTurn: function() {
		audioManager.playSound('button');
		console.log('🔄 Игрок завершает ход');
		
		// ВЫЗЫВАЕМ ПРАВИЛЬНЫЙ МЕТОД ИЗ playerModule
		if (window.playerModule && window.playerModule.handleEndTurn) {
			window.playerModule.handleEndTurn();
		}
	},

    animateBoardEntrance: function() {
        setTimeout(() => {
            if (this.boardElement) {
                this.boardElement.style.opacity = '1';
                
                // Анимация появления элементов
                const elements = this.boardElement.querySelectorAll('.leader-area, .decks-area, .weather-area, .round-counter-area, .battle-rows, .player-hand-area, .game-controls');
                elements.forEach((el, index) => {
                    setTimeout(() => {
                        el.style.transform = 'translateY(0)';
                        el.style.opacity = '1';
                    }, index * 100);
                });
            }
        }, 50);
    },

    updateRoundCounter: function(roundNumber) {
        const roundImage = document.getElementById('roundImage');
        const roundNumberElement = document.getElementById('roundNumber');
        
        if (roundImage) {
            roundImage.src = `gwent/round${Math.min(roundNumber, 10)}.png`;
        }
        if (roundNumberElement) {
            roundNumberElement.textContent = roundNumber;
        }
    },

    updateRowStrength: function(player, row, strength) {
        const strengthElement = document.getElementById(`${player}${this.capitalizeFirst(row)}Strength`);
        if (strengthElement) {
            strengthElement.textContent = strength;
            // Анимация изменения силы
            strengthElement.classList.add('strength-update');
            setTimeout(() => {
                strengthElement.classList.remove('strength-update');
            }, 500);
        }
    },

    capitalizeFirst: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    placeCardOnBoard: function(card, row, player) {
        console.log(`Размещение карты ${card.name} в ряду ${row} для игрока ${player}`);
    },

    removeCardFromBoard: function(cardId, player) {
        console.log(`Удаление карты ${cardId} с поля игрока ${player}`);
    },

    clearBoard: function() {
        console.log('Очистка игрового поля');
    },
	
	endTurn: function() {
		this.endPlayerTurn();
	},
};

window.boardModule = boardModule;