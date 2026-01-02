const playerModule = {
    gameState: null,
    
    init: function(gameState) {
        this.gameState = gameState;
        console.log('🎮 Player модуль инициализирован');
    },
    
    // Обработка выбора карты из руки
	handleCardSelection: function(card, cardElement) {
		// ✅ ПРОВЕРЯЕМ НЕ НАХОДИТСЯ ЛИ ИГРА В ФАЗЕ МУЛЬГАНЫ
		if (this.gameState.mulligan.phase === 'player') {
			console.log('⏳ Включена фаза Мульганы - выбор карт для замены');
			return;
		}
	
		// ✅ ПРОВЕРЯЕМ не пасовал ли уже игрок
		if (this.gameState.player.passed) {
			console.log('❌ Игрок уже пасовал и не может играть карты');
			this.showMessage('Вы уже пасовали в этом раунде!');
			return;
		}
		
		// Проверяем лимит карт за ход
		if (this.gameState.cardsPlayedThisTurn >= this.gameState.maxCardsPerTurn) {
			console.log(`❌ Лимит карт за ход достигнут (${this.gameState.cardsPlayedThisTurn}/${this.gameState.maxCardsPerTurn})`);
			this.showMessage(`Вы уже разместили ${this.gameState.maxCardsPerTurn} карт за этот ход!`);
			return;
		}
		
		// Проверяем, может ли игрок сейчас ходить
		if (this.gameState.gamePhase !== 'playerTurn') {
			console.log('❌ Сейчас не ход игрока');
			return;
		}
		
		console.log('🎯 Игрок выбрал карту:', card.name, 'Тип:', card.type);
		
		if (this.gameState.selectingRow) {
			this.cancelRowSelection();
			return;
		}

		this.gameState.selectedCard = card;
		this.gameState.selectedCardElement = cardElement;
		
		// Добавляем визуальное выделение выбранной карты
		if (cardElement) {
			cardElement.classList.add('card-selected');
		}
		
		audioManager.playSound('button');

		if (this.isWeatherCard(card)) {
			this.playWeatherCard(card);
		} else {
			switch (card.type) {
				case 'tactic':
					this.startTacticCardPlacement(card);
					break;
				case 'unit':
				case 'special':
				case 'artifact':
					this.startUnitCardPlacement(card);
					break;
				default:
					console.warn('⚠️ Неизвестный тип карты:', card.type);
					this.cancelCardSelection();
			}
		}
	},

    // Проверка карты погоды
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
    
    // Размещение карты погоды
    playWeatherCard: function(card) {
        const isClearWeather = this.isClearWeatherCard(card);
        
        if (!isClearWeather && this.gameState.weather.cards.length >= this.gameState.weather.maxWeatherCards) {
            this.showMessage('Максимум 3 карты погоды на поле!');
            this.cancelCardSelection();
            return;
        }

        // Помечаем карту как принадлежащую игроку
        card.owner = 'player';

        if (isClearWeather) {
            this.handleClearWeather(card);
        } else {
            this.handleRegularWeather(card);
        }

        this.removeCardFromHand(card);
        
        // Уведомляем gameModule об изменении погоды
        if (window.gameModule) {
            window.gameModule.displayWeatherCards();
            window.gameModule.completeCardPlay();
        }
    },
    
    isClearWeatherCard: function(card) {
        return card.name === 'Чистое небо' || card.id === 'neutral_special_4';
    },
    
    handleClearWeather: function(card) {
        console.log('Игрок активировал Чистое небо');
        
        if (window.gameModule) {
            window.gameModule.handleClearWeather(card);
        }
    },
    
    handleRegularWeather: function(card) {
        if (window.gameModule) {
            window.gameModule.handleRegularWeather(card);
        }
    },
    
    // Размещение тактики
    startTacticCardPlacement: function(card) {
        this.gameState.selectingRow = true;
        this.gameState.placementType = 'tactic';
        this.highlightAvailableTacticSlots();
    },
    
    // Размещение юнита/спецкарты
    startUnitCardPlacement: function(card) {
        this.gameState.selectingRow = true;
        this.gameState.placementType = 'unit';
        this.highlightAvailableRows(card);
    },
    
    // Подсветка доступных слотов тактики
    highlightAvailableTacticSlots: function() {
        const rows = ['close', 'ranged', 'siege'];
        
        rows.forEach(row => {
            const tacticSlot = document.getElementById(`player${this.capitalizeFirst(row)}Tactics`);
            
            if (tacticSlot && !this.gameState.player.rows[row].tactic) {
                tacticSlot.classList.add('tactic-slot-available');
                this.setupTacticSlotSelectionHandler(tacticSlot, row);
            }
        });
    },
    
    setupTacticSlotSelectionHandler: function(tacticSlot, row) {
        const clickHandler = () => {
            if (this.gameState.selectingRow && this.gameState.selectedCard) {
                this.placeTacticCard(this.gameState.selectedCard, row);
                tacticSlot.removeEventListener('click', clickHandler);
            }
        };
        
        tacticSlot.addEventListener('click', clickHandler);
        
        if (!this.gameState.tacticSlotSelectionHandlers) {
            this.gameState.tacticSlotSelectionHandlers = [];
        }
        this.gameState.tacticSlotSelectionHandlers.push({ element: tacticSlot, handler: clickHandler });
    },
    
    // Подсветка доступных рядов
    highlightAvailableRows: function(card) {
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
        
        availableRows = availableRows.filter(row => 
            this.gameState.player.rows[row].cards.length < 9
        );

        if (availableRows.length === 0) {
            this.showMessage('Нет доступных рядов для этой карты!');
            this.cancelCardSelection();
            return;
        }

        availableRows.forEach(row => {
            const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
            if (rowElement) {
                rowElement.classList.add('row-available');
                this.setupRowSelectionHandler(rowElement, row);
            }
        });
    },
    
    setupRowSelectionHandler: function(rowElement, row) {
        const clickHandler = () => {
            if (this.gameState.selectingRow && this.gameState.selectedCard) {
                this.placeCardOnRow(this.gameState.selectedCard, row);
                rowElement.removeEventListener('click', clickHandler);
            }
        };
        
        rowElement.addEventListener('click', clickHandler);
        
        if (!this.gameState.rowSelectionHandlers) {
            this.gameState.rowSelectionHandlers = [];
        }
        this.gameState.rowSelectionHandlers.push({ element: rowElement, handler: clickHandler });
    },
    
    // Размещение карты на ряду
    placeCardOnRow: function(card, row) {
        if (this.gameState.placementType === 'tactic') {
            this.placeTacticCard(card, row);
        } else {
            this.placeUnitCard(card, row);
        }
    },
    
    // Размещение карты тактики
    placeTacticCard: function(card, row) {
        if (this.gameState.player.rows[row].tactic) {
            this.showMessage('В этом ряду уже есть карта тактики!');
            return;
        }

        this.gameState.player.rows[row].tactic = card;
        this.removeCardFromHand(card);
        
        if (window.gameModule) {
            window.gameModule.displayTacticCard(row, card);
            window.gameModule.completeCardPlay();
        }
    },
    
    // Размещение юнита/спецкарты
    placeUnitCard: function(card, row) {
        if (this.gameState.player.rows[row].cards.length >= 9) {
            this.showMessage('В этом ряду уже максимальное количество карт!');
            return;
        }

        this.gameState.player.rows[row].cards.push(card);
        this.removeCardFromHand(card);
        
        if (window.gameModule) {
            window.gameModule.displayCardOnRow(row, card);
            window.gameModule.updateRowStrength(row);
            window.gameModule.completeCardPlay();
        }
    },
    
    // Удаление карты из руки
	removeCardFromHand: function(card) {
		// ✅ ИСПОЛЬЗУЕМ метод gameModule вместо прямой работы с массивом
		if (window.gameModule && window.gameModule.removeCardFromHand) {
			window.gameModule.removeCardFromHand(card, 'player');
		} else {
			// Fallback
			const cardIndex = this.gameState.player.hand.findIndex(c => c.id === card.id);
			if (cardIndex !== -1) {
				this.gameState.player.hand.splice(cardIndex, 1);
				if (window.gameModule) {
					window.gameModule.displayPlayerHand();
				}
			}
		}
	},
    
    // Отмена выбора
    cancelCardSelection: function() {
        this.gameState.selectedCard = null;
        this.gameState.selectedCardElement = null;
        
        if (this.gameState.selectedCardElement) {
            this.gameState.selectedCardElement.classList.remove('card-selected');
        }
    },
    
    cancelRowSelection: function() {
        this.gameState.selectingRow = false;
        this.gameState.placementType = null;
        
        this.removeAllRowHighlights();
        this.removeAllTacticSlotHighlights();
        
        if (this.gameState.rowSelectionHandlers) {
            this.gameState.rowSelectionHandlers.forEach(({ element, handler }) => {
                element.removeEventListener('click', handler);
            });
            this.gameState.rowSelectionHandlers = [];
        }
        
        if (this.gameState.tacticSlotSelectionHandlers) {
            this.gameState.tacticSlotSelectionHandlers.forEach(({ element, handler }) => {
                element.removeEventListener('click', handler);
            });
            this.gameState.tacticSlotSelectionHandlers = [];
        }
    },
    
    removeAllTacticSlotHighlights: function() {
        const rows = ['close', 'ranged', 'siege'];
        rows.forEach(row => {
            const tacticSlot = document.getElementById(`player${this.capitalizeFirst(row)}Tactics`);
            if (tacticSlot) tacticSlot.classList.remove('tactic-slot-available');
        });
    },
    
    removeAllRowHighlights: function() {
        const rows = ['close', 'ranged', 'siege'];
        rows.forEach(row => {
            const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
            const tacticSlot = document.getElementById(`player${this.capitalizeFirst(row)}Tactics`);
            
            if (rowElement) rowElement.classList.remove('row-available');
            if (tacticSlot) tacticSlot.classList.remove('tactic-slot-available');
        });
    },
    
handlePass: function() {
    // Проверяем, может ли игрок пасовать
    if (this.gameState.gamePhase !== 'playerTurn' || this.gameState.player.passed) {
        console.log('❌ Игрок не может пасовать сейчас');
        return;
    }
    
    // ✅ ПРОВЕРЯЕМ может ли игрок вообще играть карты (не достигнут ли лимит)
    if (this.gameState.cardsPlayedThisTurn >= this.gameState.maxCardsPerTurn) {
        console.log('❌ Игрок достиг лимита карт - должен завершить ход вместо паса');
        this.showMessage('Вы достигли лимита карт! Завершите ход.');
        return;
    }
    
    audioManager.playSound('button');
    console.log('⏸️ Игрок пасует');
    
    this.gameState.player.passed = true;
    
    // ✅ СБРАСЫВАЕМ СЧЕТЧИК БЕЗДЕЙСТВИЯ
    if (window.gameModule && window.gameModule.resetTimeoutCounter) {
        window.gameModule.resetTimeoutCounter();
    }
    
    if (window.gameModule) {
        window.gameModule.showGameMessage('Вы пасуете', 'info');
        window.gameModule.updateControlButtons();
        window.gameModule.handleTurnEnd();
    }
},
	
	handleEndTurn: function() {
    // Проверяем, может ли игрок завершать ход
    if (this.gameState.gamePhase !== 'playerTurn') {
        console.log('❌ Сейчас не ход игрока');
        return;
    }
    
    // ✅ ПРОВЕРЯЕМ не пасовал ли уже игрок
    if (this.gameState.player.passed) {
        console.log('❌ Игрок уже пасовал');
        return;
    }
    
    audioManager.playSound('button');
    console.log('🔄 Игрок завершает ход');
    
    // ✅ СБРАСЫВАЕМ СЧЕТЧИК БЕЗДЕЙСТВИЯ
    if (window.gameModule && window.gameModule.resetTimeoutCounter) {
        window.gameModule.resetTimeoutCounter();
    }
    
    if (window.gameModule) {
        window.gameModule.handleTurnEnd();
    }
},

    // Вспомогательные методы
    capitalizeFirst: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    showMessage: function(text) {
        console.log('💬 Сообщение:', text);
        // Используем gameModule для показа сообщений
        if (window.gameModule && window.gameModule.showMessage) {
            window.gameModule.showMessage(text);
        } else {
            alert(text);
        }
    }
};

window.playerModule = playerModule;