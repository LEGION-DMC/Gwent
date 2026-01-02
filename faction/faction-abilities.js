const factionAbilitiesModule = {
    abilities: {
        'realms': {
            id: 'realms',
            name: 'Королевства Севера',
            effect: 'extra_mulligan',
            description: 'Доступно 3 муллиганы вместо 2',
            isActive: false,
            applyEffect: function(gameState) {
                gameState.mulligan.player.available = 3;
                gameState.mulligan.opponent.available = 3;
                return true;
            }
        },
        'nilfgaard': {
            id: 'nilfgaard',
            name: 'Нильфгаард',
            effect: 'win_on_tie',
            description: 'Победа при ничьей в раунде',
            isActive: false,
            applyEffect: function(gameState) {
                return true;
            },
            checkWinOnTie: function(gameState, playerScore, opponentScore, playerFaction) {
                if (playerScore === opponentScore) {
                    if (gameState.player.faction === 'nilfgaard') {
                        return 'player';
                    } else if (gameState.opponent.faction === 'nilfgaard') {
                        return 'opponent';
                    }
                }
                return null;
            }
        },
        'scoiatael': {
            id: 'scoiatael',
            name: 'Скоя\'таэли',
            effect: 'choose_first_turn',
            description: 'Право выбора первого хода',
            isActive: false,
            applyEffect: function(gameState) {
                return true;
            },
            chooseFirstTurn: function(gameState) {
                return this.showTurnChoiceModal(gameState);
            },
            showTurnChoiceModal: function(gameState) {
                return new Promise((resolve) => {
                    const modalOverlay = document.createElement('div');
                    modalOverlay.className = 'turn-choice-overlay';
                    modalOverlay.style.cssText = `
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

                    const isPlayerScoiatael = gameState.player.faction === 'scoiatael';
                    const opponentFaction = gameState.opponent.faction;
                    
                    modalOverlay.innerHTML = `
                        <div style="
                            background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
                            border: 2px solid #d4af37;
                            border-radius: 10px;
                            padding: 20px;
                            text-align: center;
                            max-width: 500px;
                            animation: modalAppear 0.3s ease-out;
                        ">
                            <div style="
                                color: #d4af37;
                                font-size: 20px;
                                margin-bottom: 15px;
                                text-transform: uppercase;
                                letter-spacing: 2px;
                            ">${isPlayerScoiatael ? 'ВЫБЕРИТЕ КТО ХОДИТ ПЕРВЫМ' : 'ПРОТИВНИК ВЫБИРАЕТ ХОД'}</div>
                            
                            ${isPlayerScoiatael ? `
                                <div style="display: flex; gap: 20px; margin: 20px 0;">
                                    <button class="choice-btn player-choice" style="
                                        background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
                                        color: #4CAF50;
                                        border: 2px solid #4CAF50;
                                        padding: 10px 20px;
                                        font-size: 16px;
                                        font-family: 'Gwent', sans-serif;
                                        cursor: pointer;
                                        border-radius: 5px;
                                        flex: 1;
                                    ">
                                        <div style="font-size: 14px; color: #888; margin-bottom: 5px;">ИГРОК</div>
                                        <div style="font-size: 18px; font-weight: bold;">ХОДИТ ПЕРВЫМ</div>
                                    </button>
                                    
                                    <button class="choice-btn opponent-choice" style="
                                        background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
                                        color: #f44336;
                                        border: 2px solid #f44336;
                                        padding: 10px 20px;
                                        font-size: 16px;
                                        font-family: 'Gwent', sans-serif;
                                        cursor: pointer;
                                        border-radius: 5px;
                                        flex: 1;
                                    ">
                                        <div style="font-size: 14px; color: #888; margin-bottom: 5px;">ПРОТИВНИК</div>
                                        <div style="font-size: 18px; font-weight: bold;">ХОДИТ ПЕРВЫМ</div>
                                    </button>
                                </div>
                            ` : `
                                <div style="
                                    color: #ccc;
                                    font-size: 16px;
                                    margin: 20px 0;
                                    padding: 20px;
                                    background: rgba(0,0,0,0.3);
                                    border-radius: 5px;
                                ">
                                    Противник (${this.getFactionName(opponentFaction)}) выбирает первый ход...
                                </div>
                            `}
                            
                            <div style="
                                color: #888;
                                font-size: 12px;
                                margin-top: 15px;
                                font-style: italic;
                            ">
                                Способность фракции: Право выбора первого хода
                            </div>
                        </div>
                    `;

                    document.body.appendChild(modalOverlay);
                    audioManager.playSound('button');

                    if (isPlayerScoiatael) {
                        const playerChoiceBtn = modalOverlay.querySelector('.player-choice');
                        const opponentChoiceBtn = modalOverlay.querySelector('.opponent-choice');

                        playerChoiceBtn.addEventListener('click', () => {
                            audioManager.playSound('choice');
                            this.animateChoiceSelection(playerChoiceBtn, true);
                            setTimeout(() => {
                                document.body.removeChild(modalOverlay);
                                resolve('player');
                            }, 1000);
                        });

                        opponentChoiceBtn.addEventListener('click', () => {
                            audioManager.playSound('choice');
                            this.animateChoiceSelection(opponentChoiceBtn, false);
                            setTimeout(() => {
                                document.body.removeChild(modalOverlay);
                                resolve('opponent');
                            }, 1000);
                        });

                        playerChoiceBtn.addEventListener('mouseenter', () => audioManager.playSound('touch'));
                        opponentChoiceBtn.addEventListener('mouseenter', () => audioManager.playSound('touch'));
                    } else {
                        setTimeout(() => {
                            const aiChoice = this.makeAIChoice(gameState);
                            audioManager.playSound('choice');
                            
                            modalOverlay.innerHTML = `
                                <div style="
                                    background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
                                    border: 2px solid #d4af37;
                                    border-radius: 10px;
                                    padding: 20px;
                                    text-align: center;
                                    max-width: 500px;
                                ">
                                    <div style="color: #d4af37; font-size: 20px; margin-bottom: 15px;">
                                        ПРОТИВНИК ВЫБРАЛ
                                    </div>
                                    
                                    <div style="
                                        background: ${aiChoice === 'opponent' ? '#f44336' : '#4CAF50'};
                                        color: white;
                                        padding: 15px;
                                        border-radius: 5px;
                                        font-size: 18px;
                                        font-weight: bold;
                                        margin: 20px 0;
                                        animation: choiceReveal 0.5s ease-out;
                                    ">
                                        ${aiChoice === 'opponent' ? 'ХОЖУ ПЕРВЫМ' : 'ХОДИТЕ ПЕРВЫМ'}
                                    </div>
                                    
                                    <div style="color: #888; font-size: 12px;">
                                        Противник выбрал в свою пользу
                                    </div>
                                </div>
                            `;
                            
                            setTimeout(() => {
                                document.body.removeChild(modalOverlay);
                                resolve(aiChoice);
                            }, 2000);
                        }, 2000);
                    }
                });
            },
            makeAIChoice: function(gameState) {
                return 'opponent';
            },
            animateChoiceSelection: function(button, isPlayer) {
                button.style.animation = 'choiceSelected 0.5s ease-out';
                button.style.transform = 'scale(1.05)';
                button.style.boxShadow = `0 0 20px ${isPlayer ? '#4CAF50' : '#f44336'}`;
            },
            getFactionName: function(factionId) {
                const factions = {
                    'scoiatael': 'Скоя\'таэли',
                    'realms': 'Королевства Севера',
                    'nilfgaard': 'Нильфгаард',
                    'monsters': 'Чудовища',
                    'skellige': 'Скеллиге'
                };
                return factions[factionId] || factionId;
            }
        },
        'monsters': {
            id: 'monsters',
            name: 'Чудовища',
            effect: 'keep_random_card',
            description: 'Случайная карта остается на поле',
            isActive: false,
            applyEffect: function(gameState) {
                return true;
            },
            keepRandomCard: function(gameState, player) {
                const rows = ['close', 'ranged', 'siege'];
                let allCards = [];
                
                rows.forEach(row => {
                    const rowCards = gameState[player].rows[row].cards;
                    allCards.push(...rowCards.map(card => ({ card, row, type: 'unit' })));
                    
                    if (gameState[player].rows[row].tactic) {
                        allCards.push({ 
                            card: gameState[player].rows[row].tactic, 
                            row, 
                            type: 'tactic' 
                        });
                    }
                });
                
                if (allCards.length === 0) return null;
                
                const randomIndex = Math.floor(Math.random() * allCards.length);
                const selected = allCards[randomIndex];
                
                return selected;
            }
        },
        'skellige': {
			id: 'skellige',
			name: 'Скеллиге',
			effect: 'resurrect_from_graveyard',
			description: 'Возвращение карт из сброса в 3 раунде',
			isActive: false,
			applyEffect: function(gameState) {
				return true;
			},
			resurrectCards: function(gameState, player) {
				if (gameState.currentRound !== 3) {
					return [];
				}
				
				const discard = gameState[player].discard;
				if (discard.length === 0) {
					return [];
				}
				
				const cardsToResurrect = [];
				const shuffled = [...discard].sort(() => Math.random() - 0.5);
				
				const maxCards = Math.min(2, shuffled.length);
				
				for (let i = 0; i < maxCards; i++) {
					const card = shuffled[i];
					const originalIndex = discard.findIndex(c => c.id === card.id);
					if (originalIndex !== -1) {
						const removedCard = discard.splice(originalIndex, 1)[0];
						cardsToResurrect.push(removedCard);
					}
				}
				
				return cardsToResurrect;
			}
		}
    },

    init: function(gameState) {
        const playerFaction = gameState.player.faction;
        if (playerFaction && this.abilities[playerFaction]) {
            this.abilities[playerFaction].isActive = true;
            this.abilities[playerFaction].applyEffect(gameState);
        }
        
        const opponentFaction = gameState.opponent.faction;
        if (opponentFaction && this.abilities[opponentFaction]) {
            this.abilities[opponentFaction].isActive = true;
            this.abilities[opponentFaction].applyEffect(gameState);
        }
    },

    checkRoundWinner: function(gameState, playerScore, opponentScore) {
        if (playerScore > opponentScore) return 'player';
        if (opponentScore > playerScore) return 'opponent';
        
        const nilfgaardAbility = this.abilities['nilfgaard'];
        if (nilfgaardAbility && nilfgaardAbility.isActive) {
            const tieWinner = nilfgaardAbility.checkWinOnTie(gameState, playerScore, opponentScore, gameState.player.faction);
            if (tieWinner) {
                return tieWinner;
            }
        }
        
        return null;
    },

    async determineFirstTurn(gameState) {
        const playerIsScoiatael = gameState.player.faction === 'scoiatael';
        const opponentIsScoiatael = gameState.opponent.faction === 'scoiatael';
        
        if (playerIsScoiatael || opponentIsScoiatael) {
            const scoiataelAbility = this.abilities['scoiatael'];
            
            if (scoiataelAbility && scoiataelAbility.isActive) {
                const firstTurn = await scoiataelAbility.chooseFirstTurn(gameState);
                return firstTurn;
            }
        }
        
        return Math.random() < 0.5 ? 'player' : 'opponent';
    },

    handleRoundEndForMonsters: function(gameState) {
    const players = ['player', 'opponent'];
    
    players.forEach(player => {
        const faction = gameState[player].faction;
        if (faction === 'monsters') {
            const monstersAbility = this.abilities['monsters'];
            if (monstersAbility && monstersAbility.isActive) {
                const keptCard = monstersAbility.keepRandomCard(gameState, player);
                
                if (keptCard) {
                    if (keptCard.card.originalStrength !== undefined) {
                        keptCard.card.strength = keptCard.card.originalStrength;
                        delete keptCard.card.originalStrength;
                    }
                    
                    const cardToKeep = {
                        ...keptCard.card,
                        strength: keptCard.card.originalStrength || keptCard.card.strength
                    };
                    
                    if (cardToKeep.originalStrength) {
                        delete cardToKeep.originalStrength;
                    }
                    
                    gameState[player].hand.push(cardToKeep);
                    
                    const rowIndex = gameState[player].rows[keptCard.row].cards.findIndex(
                        c => c.id === keptCard.card.id
                    );
                    if (rowIndex !== -1) {
                        gameState[player].rows[keptCard.row].cards.splice(rowIndex, 1);
                    } else if (keptCard.type === 'tactic') {
                        gameState[player].rows[keptCard.row].tactic = null;
                    }
                }
            }
        }
    });
},

    handleRound3ForSkellige: function(gameState) {
        if (gameState.currentRound !== 3) return;
        
        const players = ['player', 'opponent'];
        
        players.forEach(player => {
            const faction = gameState[player].faction;
            if (faction === 'skellige') {
                const skelligeAbility = this.abilities['skellige'];
                if (skelligeAbility && skelligeAbility.isActive) {
                    const resurrectedCards = skelligeAbility.resurrectCards(gameState, player);
                    
                    if (resurrectedCards.length > 0) {
                        gameState[player].hand.push(...resurrectedCards);
                        
                        if (player === 'player' && window.gameModule) {
                            window.gameModule.displayPlayerHand();
                        }
                    }
                }
            }
        });
    },

    getFactionAbility: function(factionId) {
        return this.abilities[factionId] || null;
    },

    displayAbilityInfo: function(player) {
        const faction = window.gameModule.gameState[player].faction;
        const ability = this.getFactionAbility(faction);
        
        if (!ability) return null;
        
        const abilityElement = document.createElement('div');
        abilityElement.className = 'faction-ability-info';
        abilityElement.innerHTML = `
            <div style="
                background: rgba(0,0,0,0.7);
                border: 2px solid #d4af37;
                border-radius: 5px;
                padding: 10px;
                color: #d4af37;
                font-size: 12px;
                max-width: 200px;
            ">
                <div style="font-weight: bold; margin-bottom: 5px;">${ability.name}</div>
                <div style="font-size: 11px; color: #ccc;">${ability.description}</div>
            </div>
        `;
        
        return abilityElement;
    }
};

window.factionAbilitiesModule = factionAbilitiesModule;