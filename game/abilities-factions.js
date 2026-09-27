const factionAbilitiesModule = {
    abilities: {
        'syndicate': {
            id: 'syndicate',
            name: 'Синдикат',
            effect: 'extra_mulligan',
            description: 'Доступно 3 муллиганы вместо 2',
            isActive: false,
            applyEffect: function(gameState) {
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
                        background: url('ui/fon.jpg') center/cover no-repeat;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        z-index: 10000;
                        font-family: 'Gwent', sans-serif;
                    `;

                    const isPlayerScoiatael = gameState.player.faction === 'scoiatael';
                    
                    if (!isPlayerScoiatael) {
                        modalOverlay.innerHTML = `
                            <div class="turn-choice-modal">
                                <div class="turn-choice-modal__icon">
                                    <img src="board/choice.png" alt="Выбор хода">
                                </div>
                                <div class="turn-choice-modal__title">
                                    ПРОТИВНИК ВЫБИРАЕТ КТО ХОДИТ ПЕРВЫМ
                                </div>
                                <div class="turn-choice-modal__thinking">
                                    <div class="thinking-animation">•••</div>
                                </div>
                                <div class="turn-choice-modal__description">
                                    Способность фракции Скоя'таэли
                                </div>
                            </div>
                        `;
                        
                        document.body.appendChild(modalOverlay);
                        audioManager.playSound('button');
                        
                        setTimeout(() => {
                            const aiChoice = this.makeAIChoice(gameState);
                            audioManager.playSound('choice');
                            
                            modalOverlay.innerHTML = `
                                <div class="turn-choice-modal turn-choice-modal-result">
                                    <div class="turn-choice-modal__icon">
                                        <img src="board/choice.png" alt="Выбор хода">
                                    </div>
                                    <div class="turn-choice-modal__title">
                                        ПРОТИВНИК ВЫБРАЛ
                                    </div>
                                    <div class="turn-choice-modal__result-value">
                                        ${aiChoice === 'opponent' ? 'ХОЖУ ПЕРВЫМ' : 'ХОДИТЕ ПЕРВЫМ'}
                                    </div>
                                    <div class="turn-choice-modal__description">
                                        Способность фракции Скоя'таэли
                                    </div>
                                </div>
                            `;
                            
                            setTimeout(() => {
                                document.body.removeChild(modalOverlay);
                                resolve(aiChoice);
                            }, 2000);
                        }, 3000);
                    } else {
                        modalOverlay.innerHTML = `
                            <div class="turn-choice-modal">
                                <div class="turn-choice-modal__icon">
                                    <img src="board/choice.png" alt="Выбор хода">
                                </div>
                                <div class="turn-choice-modal__title">
                                    ВЫБЕРИТЕ КТО ХОДИТ ПЕРВЫМ
                                </div>
                                <div class="turn-choice-modal__buttons">
                                    <button class="choice-btn player-choice">
                                        <div class="choice-btn__label">ИГРОК</div>
                                        <div class="choice-btn__value">ХОДИТ ПЕРВЫМ</div>
                                    </button>
                                    
                                    <button class="choice-btn opponent-choice">
                                        <div class="choice-btn__label">ПРОТИВНИК</div>
                                        <div class="choice-btn__value">ХОДИТ ПЕРВЫМ</div>
                                    </button>
                                </div>
                                <div class="turn-choice-modal__description">
                                    Способность фракции Скоя'таэли
                                </div>
                            </div>
                        `;
                        
                        document.body.appendChild(modalOverlay);
                        audioManager.playSound('button');
                        
                        const playerChoiceBtn = modalOverlay.querySelector('.player-choice');
                        const opponentChoiceBtn = modalOverlay.querySelector('.opponent-choice');
                        
                        playerChoiceBtn.addEventListener('click', () => {
                            audioManager.playSound('choice');
                            this.animateChoiceSelection(playerChoiceBtn, true);
                            setTimeout(() => {
                                document.body.removeChild(modalOverlay);
                                resolve('player');
                            }, 100);
                        });
                        
                        opponentChoiceBtn.addEventListener('click', () => {
                            audioManager.playSound('choice');
                            this.animateChoiceSelection(opponentChoiceBtn, false);
                            setTimeout(() => {
                                document.body.removeChild(modalOverlay);
                                resolve('opponent');
                            }, 100);
                        });
                    }
                });
            },
            makeAIChoice: function(gameState) {
                const randomValue = Math.random();
                return randomValue < 0.6 ? 'opponent' : 'player';
            },
            animateChoiceSelection: function(button, isPlayer) {
                button.style.animation = 'choiceSelected 0.5s ease-out';
            }
        },
        'monsters': {
            id: 'monsters',
            name: 'Чудовища',
            effect: 'keep_random_card',
            description: 'Случайная карта возвращается в руку',
            isActive: false,
            applyEffect: function(gameState) {
                return true;
            },
            keepRandomCard: function(gameState, player) {
                const rows = ['close', 'ranged', 'siege'];
                let allCards = [];
                
                // Сбор всех подходящих карт с поля
                rows.forEach(row => {
                    const rowData = gameState[player].rows[row];
                    
                    // Собираем карты отрядов
                    rowData.cards.forEach(card => {
                        // Исключаем скрытые карты (технические, типа призванных)
                        if (card.hidden) {
                            return;
                        }
                        // Исключаем шпионов
                        if (card.isSpy) {
                            return;
                        }
                        // Исключаем призванные карты (call)
                        if (card.call) {
                            return;
                        }
                        
                        // Если карта прошла фильтры, добавляем её
                        const cardCopy = JSON.parse(JSON.stringify(card));
                        cardCopy._originalId = card.id;
                        allCards.push({
                            card: cardCopy,
                            row: row,
                            type: 'unit',
                            uniqueId: card.uniqueId
                        });
                    });
                    
                    // Собираем тактики (если есть)
                    if (rowData.tactic) {
                        allCards.push({ 
                            card: JSON.parse(JSON.stringify(rowData.tactic)),
                            row: row, 
                            type: 'tactic'
                        });
                    }
                });
                
                // Если после фильтрации не осталось карт, возвращаем null
                if (allCards.length === 0) return null;
                
                // Сортировка по приоритету: сначала отряды, потом тактики
                const sortedCards = [...allCards].sort((a, b) => {
                    const getPriority = (type) => {
                        if (type === 'unit') return 1;
                        if (type === 'tactic') return 3;
                        return 99;
                    };
                    
                    return getPriority(a.type) - getPriority(b.type);
                });
                
                // Сначала пробуем выбрать из карт с наивысшим приоритетом
                const highestPriority = sortedCards[0].type === 'unit' ? 1 : 3;
                const highPriorityCards = sortedCards.filter(card => {
                    const priority = card.type === 'unit' ? 1 : 3;
                    return priority === highestPriority;
                });
                
                // Выбираем случайную карту из карт с наивысшим приоритетом
                const randomIndex = Math.floor(Math.random() * highPriorityCards.length);
                const selected = highPriorityCards[randomIndex];
                
                console.log(`[Monsters] Выбрана карта для сохранения:`, selected.card.name || selected.card.id, 'тип:', selected.type);
                
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
                const handSize = gameState[player].hand.length;
                const maxHandSize = 10;
                const availableSpace = maxHandSize - handSize;
                
                if (availableSpace <= 0) {
                    return [];
                }
                const cardsToResurrect = [];
                const shuffled = [...discard].sort(() => Math.random() - 0.5);
                const maxCardsToTry = Math.min(2, shuffled.length, availableSpace);
                for (let i = 0; i < maxCardsToTry; i++) {
                    const card = shuffled[i];
                    const originalIndex = discard.findIndex(c => c.id === card.id);
                    if (originalIndex !== -1) {
                        const removedCard = discard.splice(originalIndex, 1)[0];
                        cardsToResurrect.push(removedCard);
                    }
                }
                return cardsToResurrect;
            }
        },
        'realms': {
            id: 'realms',
            name: 'Королевства Севера',
            effect: 'draw_card_on_round_win',
            description: 'Добор 1 карты из колоды после каждого выигранного раунда',
            isActive: false,
            applyEffect: function(gameState) {
                return true;
            },
            /**
             * Добор 1 карты из колоды после выигранного раунда.
             * @param {Object} gameState - состояние игры
             * @param {string} player - 'player' или 'opponent'
             * @returns {Object|null} - вытянутая карта или null, если добор невозможен
             */
            drawCardOnRoundWin: function(gameState, player) {
                const deck = gameState[player].deck;
                if (!deck || deck.length === 0) {
                    return null;
                }
                const handSize = gameState[player].hand.length;
                const maxHandSize = 10;
                if (handSize >= maxHandSize) {
                    return null;
                }
                const drawnCard = deck.shift();
                if (!drawnCard) {
                    return null;
                }
                gameState[player].hand.push(drawnCard);

                if (player === 'player' && window.gameModule) {
                    if (window.gameModule.displayPlayerHand) {
                        window.gameModule.displayPlayerHand();
                    }
                    if (window.gameModule.displayPlayerDeck) {
                        window.gameModule.displayPlayerDeck();
                    }
                }
                if (player === 'opponent' && window.gameModule) {
                    if (window.gameModule.displayOpponentDeck) {
                        window.gameModule.displayOpponentDeck();
                    }
                }

                return drawnCard;
            }
        },
    },

    init: function(gameState) {
        const playerFaction = gameState.player.faction;
        const opponentFaction = gameState.opponent.faction;
        
        if (playerFaction && this.abilities[playerFaction]) {
            this.abilities[playerFaction].isActive = true;
            if (playerFaction === 'syndicate') {
                gameState.mulligan.player.available = 3;
            }
            this.abilities[playerFaction].applyEffect(gameState);
        }
        
        if (opponentFaction && this.abilities[opponentFaction]) {
            this.abilities[opponentFaction].isActive = true;
            if (opponentFaction === 'syndicate') {
                gameState.mulligan.opponent.available = 3;
            }
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
        const cardsToReturn = [];
        
        players.forEach(player => {
            const faction = gameState[player].faction;
            if (faction === 'monsters') {
                const monstersAbility = this.abilities['monsters'];
                if (monstersAbility && monstersAbility.isActive) {
                    const keptCard = monstersAbility.keepRandomCard(gameState, player);
                    if (keptCard) {
                        cardsToReturn.push({
                            player: player,
                            card: keptCard.card,
                            row: keptCard.row,
                            type: keptCard.type,
                            uniqueId: keptCard.uniqueId
                        });
                    }
                }
            }
        });
        
        players.forEach(player => {
            const rows = ['close', 'ranged', 'siege'];
            rows.forEach(row => {
                const cardsToKeep = cardsToReturn.filter(item => 
                    item.player === player && item.row === row && item.type === 'unit'
                );
                
                const originalCards = [...gameState[player].rows[row].cards];
                gameState[player].rows[row].cards = [];
                
                originalCards.forEach(card => {
                    const isReturningCard = cardsToKeep.some(item => 
                        item.card.id === card.id && 
                        (item.uniqueId === card.uniqueId || 
                         (!item.uniqueId && item.card._originalId === card.id))
                    );
                    
                    if (!isReturningCard) {
                        const cardToDiscard = JSON.parse(JSON.stringify(card));
                        delete cardToDiscard.summonedByFlock;
                        gameState[player].discard.push(cardToDiscard);
                    } else {
                        if (!cardsToKeep.some(k => k.card === card)) {
                            cardsToKeep.push({ card: card, row: row, player: player });
                        }
                    }
                });
                
                gameState[player].rows[row].strength = 0;
            });
        });
        
        players.forEach(player => {
            const rows = ['close', 'ranged', 'siege'];
            rows.forEach(row => {
                if (gameState[player].rows[row].tactic) {
                    const isReturningTactic = cardsToReturn.some(item => 
                        item.player === player && 
                        item.type === 'tactic' && 
                        item.row === row
                    );
                    
                    if (!isReturningTactic) {
                        gameState[player].discard.push(gameState[player].rows[row].tactic);
                        gameState[player].rows[row].tactic = null;
                    }
                }
            });
        });
        
        cardsToReturn.forEach(item => {
            const cardToReturn = { ...item.card };
            
            delete cardToReturn.summonedByFlock;
            delete cardToReturn._originalId;
            
            if (cardToReturn.baseStrength !== undefined) {
                cardToReturn.strength = cardToReturn.baseStrength;
                cardToReturn.currentStrength = cardToReturn.baseStrength;
                cardToReturn.modifiedStrength = cardToReturn.baseStrength;
            }
            
            cardToReturn.underWeather = false;
            
            delete cardToReturn.uniqueId;
            
            gameState[item.player].hand.push(cardToReturn);
            
            if (item.player === 'player' && window.gameModule) {
                window.gameModule.displayPlayerHand();
            }
        });
        
        if (window.gameModule && window.gameModule.updateDiscardDisplay) {
            window.gameModule.updateDiscardDisplay('player');
            window.gameModule.updateDiscardDisplay('opponent');
        }
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
                        const handSize = gameState[player].hand.length;
                        const maxHandSize = 10;
                        const availableSpace = maxHandSize - handSize;
                        
                        if (availableSpace > 0) {
                            const cardsToAdd = resurrectedCards.slice(0, availableSpace);
                            gameState[player].hand.push(...cardsToAdd);
                            const remainingCards = resurrectedCards.slice(availableSpace);
                            if (remainingCards.length > 0) {
                                gameState[player].deck.push(...remainingCards);
                                if (player === 'player') {
                                    this.showGameMessage(`Часть карт возвращена в колоду (макс. карт в руке: 10)`, 'info');
                                }
                            }
                            if (player === 'player' && window.gameModule) {
                                window.gameModule.displayPlayerHand();
                            }
                        }
                        if (window.gameModule && window.gameModule.updateDiscardDisplay) {
                            window.gameModule.updateDiscardDisplay(player);
                        }
                        if (window.gameModule && window.gameModule.displayPlayerDeck && player === 'player') {
                            window.gameModule.displayPlayerDeck();
                        }
                        if (window.gameModule && window.gameModule.displayOpponentDeck && player === 'opponent') {
                            window.gameModule.displayOpponentDeck();
                        }
                    }
                }
            }
        });
    },

    /**
     * Обработка способности "Королевства Севера":
     * добор 1 карты из колоды после выигранного раунда.
     * Вызывать после определения победителя раунда.
     * @param {Object} gameState
     * @param {string} roundWinner - 'player' или 'opponent'
     */
    handleRoundWinForRealms: function(gameState, roundWinner) {
        if (!roundWinner) return;

        const winnerFaction = gameState[roundWinner].faction;
        if (winnerFaction !== 'realms') return;

        const realmsAbility = this.abilities['realms'];
        if (!realmsAbility || !realmsAbility.isActive) return;

        const drawnCard = realmsAbility.drawCardOnRoundWin(gameState, roundWinner);

        if (drawnCard && roundWinner === 'player' && window.gameModule) {
            this.showGameMessage(
                `Королевства Севера: вы добрали карту «${drawnCard.name || drawnCard.id}»`,
                'info'
            );
        }
    },

    showGameMessage: function(message, type) {
        if (window.gameModule && typeof window.gameModule.showGameMessage === 'function') {
            window.gameModule.showGameMessage(message, type);
        } else {
            console.log(`[FactionAbility] ${message}`);
        }
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