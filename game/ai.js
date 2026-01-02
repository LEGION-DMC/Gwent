const aiModule = {
    gameState: null,
    usedCardIds: new Set(),
    
    init: function(gameState) {
        this.gameState = gameState;
        this.usedCardIds.clear();
        console.log('🤖 AI модуль инициализирован');
    },
    
makeMove: function() {
    console.log('=== 🤖 AI НАЧИНАЕТ ХОД ===');
    
    if (this.gameState.opponent.passed) {
        console.log('⏸️ AI уже пасовал');
        this.endAITurn();
        return;
    }
    
    // ✅ ПРОВЕРЯЕМ лимит карт для ИИ
    if (this.gameState.cardsPlayedThisTurn >= this.gameState.maxCardsPerTurn) {
        console.log(`🔄 AI достиг лимита карт (${this.gameState.cardsPlayedThisTurn}/${this.gameState.maxCardsPerTurn}) - завершение хода`);
        this.endAITurn();
        return;
    }
    
    // ✅ СТРАТЕГИЯ: если игрок уже пасовал, AI должен тоже пасовать после одной карты
    if (this.gameState.player.passed) {
        console.log('🎯 Игрок уже пасовал - AI играет стратегически');
        
        // Если AI уже разместил карту в этом раунде после паса игрока - пасовать
        if (this.gameState.cardsPlayedThisTurn > 0) {
            console.log('⏸️ AI стратегически пасует после паса игрока');
            this.pass();
            return;
        }
        
        // Иначе играть одну сильную карту и пасовать
        const playableCards = this.getPlayableCards();
        if (playableCards.length > 0) {
            const bestCard = this.selectBestCard(playableCards);
            if (bestCard && bestCard.strength > 5) { // Только сильные карты
                console.log('✅ AI играет сильную карту перед пасом:', bestCard.name);
                this.playCard(bestCard);
                this.gameState.cardsPlayedThisTurn++;
                
                setTimeout(() => {
                    console.log('⏸️ AI стратегически пасует после размещения карты');
                    this.pass();
                }, 1500);
                return;
            } else {
                console.log('⏸️ AI пасует - нет сильных карт');
                this.pass();
                return;
            }
        } else {
            console.log('⏸️ AI пасует - нет доступных карт');
            this.pass();
            return;
        }
    }
    
    // Обычная логика для начала раунда
    if (this.gameState.opponent.hand.length === 0) {
        console.log('❌ У AI нет карт в руке - пас');
        this.pass();
        return;
    }
    
    const playableCards = this.getPlayableCards();
    console.log('🎯 Доступные карты AI:', playableCards.map(c => c.name));
    
    if (playableCards.length === 0) {
        console.log('❌ Нет доступных карт для игры - пас');
        this.pass();
        return;
    }
    
    const bestCard = this.selectBestCard(playableCards);
    
    if (bestCard) {
        console.log('✅ AI выбрал карту:', bestCard.name);
        this.playCard(bestCard);
        
        this.gameState.cardsPlayedThisTurn++;
        console.log(`🎯 AI разместил карт: ${this.gameState.cardsPlayedThisTurn}/${this.gameState.maxCardsPerTurn}`);
        
        setTimeout(() => {
            // ✅ ПРОВЕРЯЕМ лимит после размещения карты
            if (this.gameState.cardsPlayedThisTurn >= this.gameState.maxCardsPerTurn) {
                console.log(`✅ AI разместил все карты за ход`);
                this.endAITurn();
            } else if (this.gameState.opponent.hand.length > 0) {
                console.log(`🔄 AI может разместить еще карты`);
                setTimeout(() => this.makeMove(), 1000);
            } else {
                console.log('❌ У AI закончились карты');
                this.endAITurn();
            }
        }, 1500);
    } else {
        console.log('❌ AI не нашел подходящую карту - пас');
        this.pass();
    }
},

pass: function() {
    console.log('⏸️ AI пасует');
    this.gameState.opponent.passed = true;
    
    if (window.gameModule) {
        window.gameModule.showGameMessage('Противник пасует', 'info');
        window.gameModule.updateControlButtons();
        
        // ✅ СРАЗУ проверяем конец раунда после паса AI
        if (this.gameState.player.passed) {
            console.log('🎯 Оба игрока пасовали - конец раунда');
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
        // ✅ Проверяем нет ли уже "Чистого неба"
        const hasClearWeather = this.gameState.weather.cards.some(wc => this.isClearWeatherCard(wc));
        return !hasClearWeather; // Можно играть только если нет уже "Чистого неба"
    }
    
    const weatherEffect = this.getWeatherEffectForCard(card);
    if (weatherEffect && this.gameState.weather.effects[weatherEffect.row]) {
        return false; // Нельзя играть погоду на ряд где уже есть эффект
    }
    
    return true;
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
        
        console.log('Оценки карт AI:', scoredCards.map(sc => `${sc.card.name}: ${sc.score}`));
        
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
        // ✅ ПРАВИЛЬНО оцениваем "Чистое небо" - только если есть активная погода
        const activeWeatherCount = Object.values(this.gameState.weather.effects).filter(effect => effect !== null).length;
        if (activeWeatherCount > 0) {
            score += activeWeatherCount * 20; // Высокий приоритет если есть погода
        } else {
            score = 0; // ❌ НИЗКИЙ приоритет если нет активной погоды
        }
        
        // ✅ ДОПОЛНИТЕЛЬНО проверяем нет ли уже "Чистого неба" на поле
        const hasClearWeather = this.gameState.weather.cards.some(wc => this.isClearWeatherCard(wc));
        if (hasClearWeather) {
            score = -10; // ❌ ОЧЕНЬ НИЗКИЙ приоритет если уже есть "Чистое небо"
        }
    } else {
        const weatherEffect = this.getWeatherEffectForCard(card);
        if (weatherEffect) {
            const playerRowStrength = this.gameState.player.rows[weatherEffect.row].strength;
            const opponentRowStrength = this.gameState.opponent.rows[weatherEffect.row].strength;
            
            // ✅ ПРАВИЛЬНО оцениваем обычную погоду
            if (playerRowStrength > 3) {
                score += Math.min(playerRowStrength, 15); // Бонус за сильный ряд противника
            }
            
            if (opponentRowStrength > 2) {
                score -= Math.min(opponentRowStrength, 10); // Штраф за свой сильный ряд
            }
            
            // ✅ Штраф если уже есть такая же погода
            if (this.gameState.weather.effects[weatherEffect.row]) {
                score = 0; // Не играть одинаковую погоду
            }
        }
    }
    
    return score;
},

	evaluateTacticCard: function(card) {
		let score = 8;
		
		// Учитываем текущую ситуацию для тактических карт
		const playerTotal = this.calculateTotalScore('player');
		const opponentTotal = this.calculateTotalScore('opponent');
		
		if (opponentTotal < playerTotal) {
			score += 3; // Больше ценим тактику при отставании
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
		console.log('🎮 AI играет карту:', card.name);
		
		this.usedCardIds.add(card.id);
		this.removeCardFromHand(card);
		
		if (this.isWeatherCard(card)) {
			this.playWeatherCard(card);
		} else if (card.type === 'tactic') {
			this.playTacticCard(card);
		} else {
			this.playUnitCard(card);
		}
		
		console.log('✅ AI завершил размещение карты');
	},

	endAITurn: function() {
		console.log('🔄 AI завершает ход');
		if (window.gameModule) {
			window.gameModule.handleTurnEnd();
		}
	},

	pass: function() {
		console.log('⏸️ AI пасует');
		this.gameState.opponent.passed = true;
		
		if (window.gameModule) {
			window.gameModule.updateControlButtons();
			window.gameModule.handleTurnEnd();
		}
	},

    playWeatherCard: function(card) {
        console.log('🌧️ AI играет карту погоды:', card.name);
        
        card.owner = 'opponent';
        
        if (window.gameModule) {
            if (this.isClearWeatherCard(card)) {
                window.gameModule.handleClearWeather(card);
            } else {
                const clearWeatherIndex = this.gameState.weather.cards.findIndex(
                    weatherCard => this.isClearWeatherCard(weatherCard)
                );
                
                if (clearWeatherIndex !== -1) {
                    const clearWeatherCard = this.gameState.weather.cards[clearWeatherIndex];
                    const clearWeatherOwner = clearWeatherCard.owner || 'player';
                    window.gameModule.addCardToDiscard(clearWeatherCard, clearWeatherOwner);
                    this.gameState.weather.cards.splice(clearWeatherIndex, 1);
                    window.gameModule.clearAllWeatherEffects();
                    window.gameModule.restoreAllRowStrengths();
                }
                
                const weatherEffect = this.getWeatherEffectForCard(card);
                if (weatherEffect) {
                    this.gameState.weather.effects[weatherEffect.row] = {
                        card: card,
                        image: weatherEffect.image,
                        owner: 'opponent'
                    };
                    
                    window.gameModule.applyVisualWeatherEffect(weatherEffect.row, weatherEffect.image);
                    window.gameModule.reduceRowStrengthTo1(weatherEffect.row, 'player');
                    window.gameModule.reduceRowStrengthTo1(weatherEffect.row, 'opponent');
                }
            }
            
            this.gameState.weather.cards.push(card);
            window.gameModule.displayWeatherCards();
        }
    },
    
	findBestTacticRow: function() {
		const rows = ['close', 'ranged', 'siege'];
		const availableRows = rows.filter(row => !this.gameState.opponent.rows[row].tactic);
		
		if (availableRows.length === 0) return null;
		
		// Выбираем ряд с наибольшей силой для тактики
		const scoredRows = availableRows.map(row => ({
			row: row,
			score: this.gameState.opponent.rows[row].strength + 
				   (this.gameState.player.rows[row].strength * 0.3) // Учитываем силу противника
		}));
		
		scoredRows.sort((a, b) => b.score - a.score);
		return scoredRows[0].row;
	},

    playTacticCard: function(card) {
        const bestRow = this.findBestTacticRow();
        if (bestRow) {
            this.gameState.opponent.rows[bestRow].tactic = card;
            // ИСПРАВЛЕНО: вызываем метод из gameModule
            if (window.gameModule && window.gameModule.displayTacticCard) {
                window.gameModule.displayTacticCard(bestRow, card, 'opponent');
            }
        }
    },
    
    playUnitCard: function(card) {
        const bestRow = this.findBestRowForUnit(card);
        if (bestRow) {
            this.gameState.opponent.rows[bestRow].cards.push(card);
            // ИСПРАВЛЕНО: вызываем методы из gameModule
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
		console.log('🔄 AI состояние сброшено');
	},

    // Вспомогательные методы
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
            'Трескучий мороз': { row: 'siege', image: 'gwent/frost.png' },
            'Белый Хлад': { row: 'siege', image: 'gwent/frost.png' },
            'Густой туман': { row: 'ranged', image: 'gwent/fog.png' },
            'Проливной дождь': { row: 'close', image: 'gwent/rain.png' },
            'Шторм Скеллиге': { row: 'close', image: 'gwent/rain.png' }
        };
        return weatherEffects[card.name];
    },
    
	 removeCardFromHand: function(card) {
		// ✅ ИСПОЛЬЗУЕМ метод gameModule
		if (window.gameModule && window.gameModule.removeCardFromHand) {
			window.gameModule.removeCardFromHand(card, 'opponent');
		} else {
			// Fallback
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
