const aiModule = {
    gameState: null,
    usedCardIds: new Set(),
    
    init: function(gameState) {
        this.gameState = gameState;
        this.usedCardIds.clear();
    },
    
    makeMove: function() {
        if (this.gameState.opponent.passed) {
            this.endAITurn();
            return;
        }
        
        if (this.gameState.cardsPlayedThisTurn >= this.gameState.maxCardsPerTurn) {
            this.endAITurn();
            return;
        }
        
        if (this.gameState.player.passed) {
            if (this.gameState.cardsPlayedThisTurn > 0) {
                this.pass();
                return;
            }
            
            const playableCards = this.getPlayableCards();
            if (playableCards.length > 0) {
                const bestCard = this.selectBestCard(playableCards);
                if (bestCard && bestCard.strength > 5) {
                    this.playCard(bestCard);
                    this.gameState.cardsPlayedThisTurn++;
                    
                    setTimeout(() => {
                        this.pass();
                    }, 1500);
                    return;
                } else {
                    this.pass();
                    return;
                }
            } else {
                this.pass();
                return;
            }
        }
        
        if (this.gameState.opponent.hand.length === 0) {
            this.pass();
            return;
        }
        
        const playableCards = this.getPlayableCards();
        
        if (playableCards.length === 0) {
            this.pass();
            return;
        }
        
        const bestCard = this.selectBestCard(playableCards);
        
        if (bestCard) {
            this.playCard(bestCard);
            
            this.gameState.cardsPlayedThisTurn++;
            
            setTimeout(() => {
                if (this.gameState.cardsPlayedThisTurn >= this.gameState.maxCardsPerTurn) {
                    this.endAITurn();
                } else if (this.gameState.opponent.hand.length > 0) {
                    setTimeout(() => this.makeMove(), 1000);
                } else {
                    this.endAITurn();
                }
            }, 1500);
        } else {
            this.pass();
        }
    },

    pass: function() {
        this.gameState.opponent.passed = true;
        
        if (window.gameModule) {
            window.gameModule.showGameMessage('Противник пасует', 'info');
            window.gameModule.updateControlButtons();
            
            if (this.gameState.player.passed) {
                setTimeout(() => {
                    window.gameModule.checkRoundEnd();
                }, 1000);
            } else {
                window.gameModule.handleTurnEnd();
            }
        }
    },

    getPlayableCards: function() {
        const uniqueCards = [];
        const seenIds = new Set();
        
        this.gameState.opponent.hand.forEach(card => {
            if (this.usedCardIds.has(card.id)) {
                return;
            }
            
            if (seenIds.has(card.id)) {
                return;
            }
            seenIds.add(card.id);
            
            if (this.isWeatherCard(card)) {
                if (this.canPlayWeatherCard(card)) {
                    uniqueCards.push(card);
                }
            } else if (card.type === 'tactic') {
                if (this.canPlayTacticCard(card)) {
                    uniqueCards.push(card);
                }
            } else {
                if (this.canPlayUnitCard(card)) {
                    uniqueCards.push(card);
                }
            }
        });
        
        return uniqueCards;
    },
    
    canPlayWeatherCard: function(card) {
        if (this.gameState.weather.cards.length >= this.gameState.weather.maxWeatherCards) {
            return false;
        }
        
        if (this.isClearWeatherCard(card)) {
            const hasClearWeather = this.gameState.weather.cards.some(wc => 
                this.isClearWeatherCard(wc)
            );
            if (hasClearWeather) {
                return false;
            }
            return true;
        }
        
        const weatherEffect = this.getWeatherEffectForCard(card);
        if (!weatherEffect || !weatherEffect.rows) {
            return false;
        }
        
        const hasValidTargetRow = weatherEffect.rows.some(row => 
            !this.gameState.weather.effects[row]
        );
        
        if (!hasValidTargetRow) {
            return false;
        }
        
        const hasSameWeather = this.gameState.weather.cards.some(wc => 
            wc.name === card.name
        );
        
        if (hasSameWeather) {
            return false;
        }
        
        return true;
    },

    hasDuplicateWeather: function(card) {
        const weatherEffect = this.getWeatherEffectForCard(card);
        if (!weatherEffect || !weatherEffect.rows) return false;
        
        const hasSameCard = this.gameState.weather.cards.some(wc => 
            wc.name === card.name
        );
        
        if (hasSameCard) return true;
        
        return weatherEffect.rows.every(row => 
            this.gameState.weather.effects[row]
        );
    },

    canPlayTacticCard: function(card) {
        const rows = ['close', 'ranged', 'siege'];
        return rows.some(row => !this.gameState.opponent.rows[row].tactic);
    },
    
    canPlayUnitCard: function(card) {
        const availableRows = this.getAvailableRowsForCard(card);
        return availableRows.length > 0;
    },
    
    getAvailableRowsForCard: function(card) {
        let availableRows = [];
        
        if (card.type === 'special' || card.type === 'artifact') {
            availableRows = ['close', 'ranged', 'siege'];
        } else if (card.type === 'unit' && card.position) {
            if (Array.isArray(card.position)) {
                availableRows = card.position.map(pos => pos.replace('-row', ''));
            } else if (card.position === 'any-row') {
                availableRows = ['close', 'ranged', 'siege'];
            } else {
                availableRows = [card.position.replace('-row', '')];
            }
        }
        
        return availableRows.filter(row => 
            this.gameState.opponent.rows[row].cards.length < 9
        );
    },
    
    selectBestCard: function(playableCards) {
        if (playableCards.length === 0) return null;
        
        const scoredCards = playableCards.map(card => ({
            card: card,
            score: this.evaluateCardScore(card)
        }));
        
        scoredCards.sort((a, b) => b.score - a.score);
        
        return scoredCards[0].card;
    },
    
    evaluateCardScore: function(card) {
        let baseScore = 0;
        
        if (this.isWeatherCard(card)) {
            baseScore = this.evaluateWeatherCard(card);
        } else if (card.type === 'tactic') {
            baseScore = this.evaluateTacticCard(card);
        } else if (card.type === 'unit') {
            baseScore = this.evaluateUnitCard(card);
        } else {
            baseScore = 5;
        }
        
        if (card.rarity === 'gold') {
            baseScore += 3;
        }
        
        const situationBonus = this.getSituationBonus(card);
        baseScore += situationBonus;
        
        return Math.max(0, baseScore);
    },
    
    evaluateWeatherCard: function(card) {
        let score = 10;
        
        if (this.isClearWeatherCard(card)) {
            const activeWeatherCount = Object.values(this.gameState.weather.effects)
                .filter(effect => effect !== null).length;
            if (activeWeatherCount > 0) {
                score += activeWeatherCount * 20;
            } else {
                score = 0;
            }
            
            const hasClearWeather = this.gameState.weather.cards.some(wc => 
                this.isClearWeatherCard(wc)
            );
            if (hasClearWeather) {
                score = -10;
            }
        } else {
            const weatherEffect = this.getWeatherEffectForCard(card);
            if (weatherEffect && weatherEffect.rows) {
                let totalPlayerStrength = 0;
                let totalOpponentStrength = 0;
                let alreadyHasWeatherOnSomeRows = false;
                
                weatherEffect.rows.forEach(row => {
                    totalPlayerStrength += this.gameState.player.rows[row].strength;
                    totalOpponentStrength += this.gameState.opponent.rows[row].strength;
                    
                    if (this.gameState.weather.effects[row]) {
                        alreadyHasWeatherOnSomeRows = true;
                    }
                });
                
                if (totalPlayerStrength > 0) {
                    score += Math.min(totalPlayerStrength * 0.7, 20);
                }
                
                if (totalOpponentStrength > 0) {
                    score -= Math.min(totalOpponentStrength * 0.5, 10);
                }
                
                if (alreadyHasWeatherOnSomeRows) {
                    score -= 10;
                }
                
                if (weatherEffect.rows.length > 1) {
                    score += 5;
                }
            }
        }
        
        return Math.max(0, score);
    },

    evaluateTacticCard: function(card) {
        let score = 8;
        
        const playerTotal = this.calculateTotalScore('player');
        const opponentTotal = this.calculateTotalScore('opponent');
        
        if (opponentTotal < playerTotal) {
            score += 3;
        }
        
        return score;
    },
    
    evaluateUnitCard: function(card) {
        let score = card.strength || 5;
        
        const bestRow = this.findBestRowForUnit(card);
        if (bestRow) {
            score += this.getRowPlacementBonus(card, bestRow);
        }
        
        return score;
    },
    
    findBestRowForUnit: function(card) {
        const availableRows = this.getAvailableRowsForCard(card);
        if (availableRows.length === 0) return null;
        
        const scoredRows = availableRows.map(row => ({
            row: row,
            score: this.evaluateRowForPlacement(row)
        }));
        
        scoredRows.sort((a, b) => b.score - a.score);
        return scoredRows[0].row;
    },
    
    evaluateRowForPlacement: function(row) {
        let score = 0;
        
        const cardCount = this.gameState.opponent.rows[row].cards.length;
        score += (9 - cardCount) * 2;
        
        if (this.gameState.weather.effects[row]) {
            score -= 50;
        }
        
        const rowStrength = this.gameState.opponent.rows[row].strength;
        score += rowStrength * 0.5;
        
        return score;
    },
    
    getRowPlacementBonus: function(card, row) {
        let bonus = 0;
        
        const rowCards = this.gameState.opponent.rows[row].cards;
        
        if (card.tags) {
            rowCards.forEach(existingCard => {
                if (existingCard.tags) {
                    const commonTags = card.tags.filter(tag => existingCard.tags.includes(tag));
                    bonus += commonTags.length * 2;
                }
            });
        }
        
        return bonus;
    },
    
    getSituationBonus: function(card) {
        let bonus = 0;
        
        const playerTotalScore = this.calculateTotalScore('player');
        const opponentTotalScore = this.calculateTotalScore('opponent');
        
        if (opponentTotalScore < playerTotalScore) {
            if (card.strength && card.strength > 8) {
                bonus += 5;
            }
        }
        
        if (opponentTotalScore > playerTotalScore + 10) {
            if (this.isWeatherCard(card) && !this.isClearWeatherCard(card)) {
                bonus -= 5;
            }
        }
        
        return bonus;
    },
    
    playCard: function(card) {
        this.usedCardIds.add(card.id);
        this.removeCardFromHand(card);
        
        if (this.isWeatherCard(card)) {
            this.playWeatherCard(card);
        } else if (card.type === 'tactic') {
            this.playTacticCard(card);
        } else {
            this.playUnitCard(card);
        }
    },

    endAITurn: function() {
        if (window.gameModule) {
            window.gameModule.handleTurnEnd();
        }
    },

    playWeatherCard: function(card) {
        const weatherCardWithOwner = { ...card, owner: 'opponent' };
        
        this.removeCardFromHand(card);
        
        if (window.gameModule) {
            if (this.isClearWeatherCard(card)) {
                window.gameModule.handleClearWeather(weatherCardWithOwner);
            } else {
                this.gameState.weather.cards.push(weatherCardWithOwner);
                
                window.gameModule.handleRegularWeather(weatherCardWithOwner);
                
                const weatherEffect = this.getWeatherEffectForCard(card);
                if (weatherEffect && weatherEffect.rows) {
                    weatherEffect.rows.forEach(row => {
                        this.gameState.weather.effects[row] = {
                            card: weatherCardWithOwner,
                            image: weatherEffect.images[row],
                            owner: 'opponent'
                        };
                        
                        window.gameModule.reduceRowStrengthTo1(row, 'player');
                        window.gameModule.reduceRowStrengthTo1(row, 'opponent');
                    });
                }
            }
            
            window.gameModule.displayWeatherCards();
        }
    },

    getRowsUnderWeather: function() {
        const rowsUnderWeather = [];
        const rows = ['close', 'ranged', 'siege'];
        
        rows.forEach(row => {
            if (this.gameState.weather.effects[row]) {
                rowsUnderWeather.push(row);
            }
        });
        
        return rowsUnderWeather;
    },

    findBestTacticRow: function() {
        const rows = ['close', 'ranged', 'siege'];
        const availableRows = rows.filter(row => !this.gameState.opponent.rows[row].tactic);
        
        if (availableRows.length === 0) return null;
        
        const scoredRows = availableRows.map(row => ({
            row: row,
            score: this.gameState.opponent.rows[row].strength + 
                   (this.gameState.player.rows[row].strength * 0.3)
        }));
        
        scoredRows.sort((a, b) => b.score - a.score);
        return scoredRows[0].row;
    },

    playTacticCard: function(card) {
        const bestRow = this.findBestTacticRow();
        if (bestRow) {
            this.gameState.opponent.rows[bestRow].tactic = card;
            if (window.audioManager && window.audioManager.playSound) {
                audioManager.playSound('artefact');
            }
            if (window.gameModule && window.gameModule.displayTacticCard) {
                window.gameModule.displayTacticCard(bestRow, card, 'opponent');
            }
        }
    },
    
    playUnitCard: function(card) {
        const bestRow = this.findBestRowForUnit(card);
        if (bestRow) {
            this.gameState.opponent.rows[bestRow].cards.push(card);
            if (window.audioManager && window.audioManager.playSound) {
                if (card.type === 'artifact' || card.type === 'special' || card.type === 'tactic') {
                    audioManager.playSound('artefact');
                } else {
                    switch(bestRow) {
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
            }
            if (window.gameModule) {
                if (window.gameModule.displayCardOnRow) {
                    window.gameModule.displayCardOnRow(bestRow, card, 'opponent');
                }
                if (window.gameModule.updateRowStrength) {
                    window.gameModule.updateRowStrength(bestRow, 'opponent');
                }
            }
        }
    },
    
    reset: function() {
        this.usedCardIds.clear();
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
    
    removeCardFromHand: function(card) {
        if (window.gameModule && window.gameModule.removeCardFromHand) {
            window.gameModule.removeCardFromHand(card, 'opponent');
        } else {
            const cardIndex = this.gameState.opponent.hand.findIndex(c => c.id === card.id);
            if (cardIndex !== -1) {
                this.gameState.opponent.hand.splice(cardIndex, 1);
            }
        }
    },
    
    calculateTotalScore: function(player) {
        const rows = this.gameState[player].rows;
        return Object.values(rows).reduce((total, row) => total + row.strength, 0);
    },

    capitalizeFirst: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
};

window.aiModule = aiModule;