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
            <div class="board-background"></div>
            
            <div class="opponent-leader-area leader-area">
                <div class="leader-slot" id="opponentLeader"></div>
            </div>

            <div class="player-leader-area leader-area">
                <div class="leader-slot" id="playerLeader"></div>
            </div>

            <div class="weather-area">
                <div class="weather-slot" id="weatherSlot"></div>
            </div>

            <div class="opponent-decks-area decks-area">
                <div class="deck-slot discard-pile" id="opponentDiscard">
                    <span>Сброс</span>
                </div>
                <div class="deck-slot deck-pile" id="opponentDeck">
                    <span>Колода</span>
                </div>
            </div>

            <div class="player-decks-area decks-area">
                <div class="deck-slot discard-pile" id="playerDiscard">
                    <span>Сброс</span>
                </div>
                <div class="deck-slot deck-pile" id="playerDeck">
                    <span>Колода</span>
                </div>
            </div>

            <div class="round-counter-area">
                <div class="round-display">
                    <img src="board/round1.png" alt="Раунд 1" class="round-image" id="roundImage">
                </div>
            </div>

            <div class="player-hand-area">
                <div class="hand-cards" id="playerHand"></div>
            </div>

            <div class="player-rows-area battle-rows">
                <div class="battle-row close-row" data-row="close">
                    <div class="row-strength player-strength" id="playerCloseStrength">0</div>
                    <div class="tactics-slot player-tactics" id="playerCloseTactics"></div>
                    <div class="cards-row" id="playerCloseRow"></div>
                </div>
                
                <div class="battle-row ranged-row" data-row="ranged">
                    <div class="row-strength player-strength" id="playerRangedStrength">0</div>
                    <div class="tactics-slot player-tactics" id="playerRangedTactics"></div>
                    <div class="cards-row" id="playerRangedRow"></div>
                </div>
				
                <div class="battle-row siege-row" data-row="siege">
                    <div class="row-strength player-strength" id="playerSiegeStrength">0</div>
                    <div class="tactics-slot player-tactics" id="playerSiegeTactics"></div>
                    <div class="cards-row" id="playerSiegeRow"></div>
                </div>
            </div>

            <div class="opponent-rows-area battle-rows">
                <div class="battle-row siege-row" data-row="siege">
                    <div class="row-strength opponent-strength" id="opponentSiegeStrength">0</div>
                    <div class="tactics-slot opponent-tactics" id="opponentSiegeTactics"></div>
                    <div class="cards-row" id="opponentSiegeRow"></div>
                </div>
                
                <div class="battle-row ranged-row" data-row="ranged">
                    <div class="row-strength opponent-strength" id="opponentRangedStrength">0</div>
                    <div class="tactics-slot opponent-tactics" id="opponentRangedTactics"></div>
                    <div class="cards-row" id="opponentRangedRow"></div>
                </div>
				
                <div class="battle-row close-row" data-row="close">
                    <div class="row-strength opponent-strength" id="opponentCloseStrength">0</div>
                    <div class="tactics-slot opponent-tactics" id="opponentCloseTactics"></div>
                    <div class="cards-row" id="opponentCloseRow"></div>
                </div>
            </div>

            <div class="game-controls">
                <button class="control-btn pass-btn" id="passBtn">ПАС</button>
                <button class="control-btn end-turn-btn" id="endTurnBtn">ЗАКОНЧИТЬ ХОД</button>
            </div>
        `;
    },

    setupBoardEventListeners: function() {
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

        this.setupCardSlotsEventListeners();
    },

    setupCardSlotsEventListeners: function() {
    },

	handlePass: function() {
		audioManager.playSound('button');
		
		if (window.playerModule && window.playerModule.handlePass) {
			window.playerModule.handlePass();
		}
	},

	handleEndTurn: function() {
		audioManager.playSound('button');
		
		if (window.playerModule && window.playerModule.handleEndTurn) {
			window.playerModule.handleEndTurn();
		}
	},

    animateBoardEntrance: function() {
        setTimeout(() => {
            if (this.boardElement) {
                this.boardElement.style.opacity = '1';
                
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
            roundImage.src = `board/round${Math.min(roundNumber, 10)}.png`;
        }
        if (roundNumberElement) {
            roundNumberElement.textContent = roundNumber;
        }
    },

    updateRowStrength: function(player, row, strength) {
        const strengthElement = document.getElementById(`${player}${this.capitalizeFirst(row)}Strength`);
        if (strengthElement) {
            strengthElement.textContent = strength;
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
    },

    removeCardFromBoard: function(cardId, player) {
    },

    clearBoard: function() {
    },
	
	endTurn: function() {
		this.endPlayerTurn();
	},
};

window.boardModule = boardModule;