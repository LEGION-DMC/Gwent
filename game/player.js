const playerModule = {
    gameState: null,
    
    init: function(gameState) {
        this.gameState = gameState;
    },

	initializeCardFields: function(card) {
		if (card.baseStrength === undefined) {
			card.baseStrength = card.strength;
		}
		
		if (card.modifiedStrength === undefined) {
			card.modifiedStrength = card.strength;
		}
		
		if (card.currentStrength === undefined) {
			card.currentStrength = card.strength;
		}
		
		if (card.underWeather === undefined) {
			card.underWeather = false;
		}
		
		return card;
	},

	isHeroCard: function(card) {
		return card.tags && (card.tags.includes('hero') || card.tags.includes('герой'));
	},
 
	handleCardSelection: function(card, cardElement) {
		if (this.gameState.mulligan.phase === 'player') {
			return;
		}
		
		if (this.gameState.gamePhase !== 'playerTurn') {
			return;
		}
		
		this.removeSpyHighlights();
		
		if (this.gameState.selectingRow) {
			this.cancelRowSelection();
		}
		
		if (this.gameState.selectedCardElement && this.gameState.selectedCardElement !== cardElement) {
			this.gameState.selectedCardElement.classList.remove('card-selected');
		}
		
		if (this.gameState.selectedCard === card) {
			this.cancelCardSelection();
			this.cancelRowSelection();
			return;
		}
		
		this.gameState.selectedCard = card;
		this.gameState.selectedCardElement = cardElement;
		
		if (cardElement) {
			cardElement.classList.add('card-selected');
		}
		
		audioManager.playSound('card_selected');

		if (this.isWeatherCard(card)) {
			this.playWeatherCard(card);
		} else {
			const isSpy = window.gameModule && window.gameModule.isSpyCard(card);

			switch (card.type) {
				case 'tactic':
					if (card.ability && card.ability.startsWith('boost_')) {
						this.startBoostCardPlacement(card);
					} else if (card.ability === 'double_row_strength') {  
						this.startDoubleStrengthPlacement(card);          
					} else {
						this.startTacticCardPlacement(card);
					}
					break;
					case 'unit':
						if (isSpy) {
							this.startSpyCardPlacement(card);
						} else {
							this.startUnitCardPlacement(card);
						}
						break;
				case 'special':
					if (card.ability === 'decoy') {
						this.startDecoyCardPlacement(card);
					} else if (card.ability === 'destroy') {
						this.startDestroyCardPlacement(card);
					} else if (card.ability === 'destroy_artf') {
						this.startDestroyArtifactPlacement(card);
					} else if (card.ability && card.ability.startsWith('damage_')) {
						this.startDamageCardPlacement(card);
					} else if (card.ability && card.ability.startsWith('boost_')) {
						this.startSpecialBoostPlacement(card);
					} else if (card.ability === 'call_rat' || card.ability === 'call_driad') {
						this.startCallCardPlacement(card);
					} else {
						this.startUnitCardPlacement(card);
					}
					break;
				case 'artifact':
					if (card.ability && card.ability.startsWith('boost_')) {
						this.startArtifactBoostPlacement(card);
					} else {
						this.startUnitCardPlacement(card);
					}
					break;
				default:
					this.cancelCardSelection();
			}
		}
	},

	startUnitDestroyPlacement: function(card) {
		// Для юнита с Казнью цель определяется после выбора ряда —
		// уничтожается сильнейшая карта противника в том же ряду.
		// Здесь только запускаем выбор ряда.
		this.gameState.selectingRow = true;
		this.gameState.placementType = 'unit_destroy';
		this.gameState.destroyUnitCard = card;
		this.gameState.destroyTargets = null;
		
		this.highlightAvailableRows(card);
	},

	executeUnitDestroyAbility: function(destroyCard, strongestCards) {
		let destroyedCount = 0;
		
		strongestCards.forEach(({ card: targetCard, row: targetRow, owner }) => {
			const rowState = this.gameState[owner].rows[targetRow];
			const cardIndex = rowState.cards.findIndex(c => 
				c.id === targetCard.id && 
				(c.uniqueId === undefined || c.uniqueId === targetCard.uniqueId)
			);
			
			if (cardIndex === -1) return;
			
			// Визуальный эффект
			this.createDestroyVisualEffectForOwner(targetCard, targetRow, owner);
			
			// Удаляем карту
			const destroyedCard = { ...rowState.cards[cardIndex] };
			rowState.cards.splice(cardIndex, 1);
			this.gameState[owner].discard.push(destroyedCard);
			destroyedCount++;
			
			if (window.gameModule) {
				setTimeout(() => {
					window.gameModule.removeCardFromBoardVisual(targetCard, targetRow, owner);
					window.gameModule.updateRowStrength(targetRow, owner);
				}, 500);
			}
		});
		
		// Обновляем сбросы и завершаем ход
		if (window.gameModule) {
			setTimeout(() => {
				window.gameModule.displayOpponentDiscard();
				window.gameModule.displayPlayerDiscard();
				window.gameModule.updateTotalScoreDisplays();
				
				// Обновляем силу ряда, где стоит карта destroy
				const destroyRow = destroyCard.row;
				if (destroyRow) {
					window.gameModule.updateRowStrength(destroyRow, 'player');
				}
				
				window.gameModule.completeCardPlay();
			}, 600);
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('scorch');
		}
	},

	findStrongestCardsOnBoard: function() {
		const rows = ['close', 'ranged', 'siege'];
		const players = ['player', 'opponent'];
		let maxStrength = -1;
		const allCandidates = [];
		
		players.forEach(owner => {
			rows.forEach(row => {
				const rowCards = this.gameState[owner].rows[row].cards;
				rowCards.forEach(card => {
					if (this.isHeroCard(card)) return;
					if (card.type !== 'unit') return;
					
					const strength = card.currentStrength !== undefined ? 
						card.currentStrength : (card.strength || 0);
					
					allCandidates.push({ card, row, owner, strength });
					
					if (strength > maxStrength) {
						maxStrength = strength;
					}
				});
			});
		});
		
		if (maxStrength < 0) return [];
		
		return allCandidates.filter(c => c.strength === maxStrength);
	},

	findStrongestEnemyCardsInRow: function(row) {
		const rowCards = this.gameState.opponent.rows[row].cards;
		let maxStrength = -1;
		const candidates = [];
		
		rowCards.forEach(card => {
			if (this.isHeroCard(card)) return;
			if (card.type !== 'unit') return;
			
			const strength = card.currentStrength !== undefined ? 
				card.currentStrength : (card.strength || 0);
			
			candidates.push({ card, row, owner: 'opponent', strength });
			
			if (strength > maxStrength) {
				maxStrength = strength;
			}
		});
		
		if (maxStrength < 0) return [];
		
		return candidates.filter(c => c.strength === maxStrength);
	},
	
	createDestroyVisualEffect: function(card, row) {
		const rowElement = document.getElementById(`opponent${this.capitalizeFirst(row)}Row`);
		if (!rowElement) return;
		
		const cardElement = rowElement.querySelector(`[data-card-id="${card.id}"]`);
		if (!cardElement) return;
		
		// Создаем эффект уничтожения
		const destroyOverlay = document.createElement('div');
		destroyOverlay.className = 'card-destroy-overlay';
		destroyOverlay.style.cssText = `
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: url('card/neutral/scorch.jpg') center/cover no-repeat;
			z-index: 100;
			border-radius: 5px;
			pointer-events: none;
			animation: destroyCardAnimation 1s ease-out forwards;
		`;
		
		cardElement.appendChild(destroyOverlay);
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_destroy');
		}
	},

	applyDoubleStrength: function(card, row) {
		// Проверяем, есть ли уже тактическая карта в этом ряду
		if (this.gameState.player.rows[row].tactic) {
			this.showMessage('В этом ряду уже есть карта тактики!');
			return;
		}
		
		const rowState = this.gameState.player.rows[row];
		let boostedCards = 0;
		
		// Удваиваем силу всех карт в ряду
		rowState.cards.forEach(unitCard => {
			if (unitCard.type === 'unit' && !this.isHeroCard(unitCard)) {
				this.initializeCardFields(unitCard);
				
				// Удваиваем modifiedStrength (базовую силу)
				const boostValue = unitCard.modifiedStrength;
				unitCard.modifiedStrength += boostValue;
				
				// Обновляем currentStrength
				if (!unitCard.underWeather) {
					unitCard.currentStrength = unitCard.modifiedStrength;
					unitCard.strength = unitCard.modifiedStrength;
				}
				
				boostedCards++;
				
				// Создаём визуальный эффект [X2]
				this.createDoubleStrengthVisualEffect(unitCard, row);
			}
		});
		
		if (boostedCards === 0) {
			this.showMessage('В этом ряду нет карт для удвоения силы!');
			return;
		}
		
		// Размещаем тактическую карту в слот
		this.gameState.player.rows[row].tactic = card;
		this.removeCardFromHand(card);
		
		// Обновляем отображение
		if (window.gameModule) {
			window.gameModule.displayTacticCard(row, card, 'player');
			
			// Обновляем все карты в ряду
			rowState.cards.forEach(unitCard => {
				if (unitCard.type === 'unit') {
					window.gameModule.updateCardStrengthDisplay(unitCard, row, 'player');
				}
			});
			
			window.gameModule.updateRowStrength(row, 'player');
			window.gameModule.completeCardPlay();
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_boost');
		}
		
		this.cancelDoubleStrengthSelection();
	},

	createDoubleStrengthVisualEffect: function(card, row) {
		const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
		if (!rowElement) return;
		
		let cardElement = null;
		
		// Ищем элемент карты
		if (card.uniqueId) {
			cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
		}
		
		if (!cardElement) {
			const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
			if (elements.length === 1) {
				cardElement = elements[0];
			} else if (elements.length > 1) {
				const rowState = this.gameState.player.rows[row];
				const position = rowState.cards.findIndex(c => 
					c.id === card.id && c.uniqueId === card.uniqueId
				);
				if (position !== -1 && elements[position]) {
					cardElement = elements[position];
				} else {
					cardElement = elements[0];
				}
			}
		}
		
		if (!cardElement) return;
		
		// Создаем эффект [X2] зелёного цвета
		const doubleOverlay = document.createElement('div');
		doubleOverlay.className = 'card-double-overlay';
		doubleOverlay.textContent = 'x2';
		doubleOverlay.style.cssText = `
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			color: #00ff00;
			font-size: 22px;
			text-shadow: 0 0 10px rgba(0, 255, 0, 0.9),
						 0 0 20px rgba(0, 255, 0, 0.6);
			z-index: 100;
			pointer-events: none;
			animation: doubleStrengthAnimation 1.2s ease-out forwards;
			letter-spacing: 2px;
		`;
		
		cardElement.appendChild(doubleOverlay);
		
		// Добавляем свечение к карте
		cardElement.style.boxShadow = '0 0 15px 5px rgba(0, 255, 0, 0.6)';
		cardElement.style.transition = 'box-shadow 0.5s ease-out';
		
		setTimeout(() => {
			if (doubleOverlay.parentNode) {
				doubleOverlay.remove();
			}
			cardElement.style.boxShadow = '';
		}, 1200);
	},

	startDoubleStrengthPlacement: function(card) {
		this.gameState.selectingRow = true;
		this.gameState.placementType = 'double_strength';
		this.gameState.doubleStrengthCard = card;
		this.highlightPlayerRowsForDoubleStrength();
	},

	highlightPlayerRowsForDoubleStrength: function() {
		const rows = ['close', 'ranged', 'siege'];
		let hasAvailableRows = false;
		
		rows.forEach(row => {
			const rowState = this.gameState.player.rows[row];
			const tacticSlot = document.getElementById(`player${this.capitalizeFirst(row)}Tactics`);
			
			const hasBoostableUnits = rowState.cards.some(card => 
				card.type === 'unit' && !this.isHeroCard(card)
			);
			
			const hasTacticSlot = tacticSlot && !rowState.tactic;
			
			if (hasBoostableUnits && hasTacticSlot) {
				tacticSlot.classList.add('tactic-slot-available', 'double-strength-target');
				this.setupDoubleStrengthSlotHandler(tacticSlot, row);
				hasAvailableRows = true;
			}
		});
		
		if (!hasAvailableRows) {
			this.cancelCardSelection();
		}
	},

	setupDoubleStrengthSlotHandler: function(tacticSlot, row) {
		const clickHandler = () => {
			if (this.gameState.selectingRow && 
				this.gameState.placementType === 'double_strength') {
				this.applyDoubleStrength(this.gameState.doubleStrengthCard, row);
				tacticSlot.removeEventListener('click', clickHandler);
			}
		};
		
		tacticSlot.addEventListener('click', clickHandler);
		
		if (!this.gameState.doubleStrengthHandlers) {
			this.gameState.doubleStrengthHandlers = [];
		}
		this.gameState.doubleStrengthHandlers.push({ 
			element: tacticSlot, 
			handler: clickHandler,
			row: row
		});
	},

	cancelDoubleStrengthSelection: function() {
		const highlightedSlots = document.querySelectorAll('.double-strength-target');
		highlightedSlots.forEach(slot => {
			slot.classList.remove('tactic-slot-available', 'double-strength-target');
		});
		
		if (this.gameState.doubleStrengthHandlers) {
			this.gameState.doubleStrengthHandlers.forEach(({ element, handler }) => {
				element.removeEventListener('click', handler);
			});
			this.gameState.doubleStrengthHandlers = [];
		}
		
		this.cancelRowSelection();
	},

	getRowName: function(row) {
		const rowNames = {
			'close': 'ближнем',
			'ranged': 'дальнем',
			'siege': 'осадном'
		};
		return rowNames[row] || row;
	},

	playFlockCard: function(card) {
		console.log('=== playFlockCard вызван ===');
		console.log('Карта:', card.name, card.tags, card.ability);
		
		let flockTag = null;
		if (card.tags && card.tags.length > 0) {
			for (let tag of card.tags) {
				if (tag !== 'hero' && tag !== 'герой') {
					flockTag = tag;
					break;
				}
			}
		}
		
		if (!flockTag) {
			this.showMessage(`Карта ${card.name} не имеет тега для стаи`);
			this.cancelCardSelection();
			return;
		}
		
		console.log(`Тег стаи: ${flockTag}`);
		
		let availableRows = [];
		
		if (card.position === 'any-row') {
			availableRows = ['close', 'ranged', 'siege'];
		} else if (Array.isArray(card.position)) {
			availableRows = card.position.map(pos => pos.replace('-row', ''));
		} else if (card.position) {
			availableRows = [card.position.replace('-row', '')];
		} else {
			availableRows = ['close', 'ranged', 'siege'];
		}
		
		availableRows = availableRows.filter(row => 
			this.gameState.player.rows[row].cards.length < 9
		);
		
		if (availableRows.length === 0) {
			this.showMessage('Нет доступных рядов для размещения карты!');
			this.cancelCardSelection();
			return;
		}
		
		let targetRow = availableRows[0];
		
		const rowState = this.gameState.player.rows[targetRow];
		
		const cardCopy = {
			...card,
			uniqueId: `${card.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			baseStrength: card.strength,
			currentStrength: card.strength,
			modifiedStrength: card.strength,
			underWeather: false,
			owner: 'player',
			row: targetRow
		};
		
		rowState.cards.push(cardCopy);
		this.removeCardFromHand(card);
		
		if (window.gameModule) {
			window.gameModule.displayCardOnRow(targetRow, cardCopy, 'player', rowState.cards.length - 1);
			window.gameModule.updateRowStrength(targetRow, 'player');
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_close');
		}
		
		// Активируем способность стаи ПОСЛЕ размещения карты
		setTimeout(() => {
			this.activateFlockAbility(cardCopy, flockTag);
		}, 200);
	},

	activateFlockAbility: function(playedCard, flockTag) {
		let summonedCount = 0;
		const cardsToSummon = [];
		
		for (let i = 0; i < this.gameState.player.hand.length; i++) {
			const handCard = this.gameState.player.hand[i];
			
			const hasMatchingFlockTag = handCard.tagsflock && 
				handCard.tagsflock.some(tag => tag === flockTag);
			
			const isSameCard = handCard.uniqueId === playedCard.uniqueId || 
							   (handCard.id === playedCard.id && handCard.uniqueId === playedCard.uniqueId);
			
			if (!isSameCard && 
				handCard.type === 'unit' &&
				hasMatchingFlockTag) {
				
				cardsToSummon.push({ card: handCard, source: 'hand', index: i });
			}
		}
		
		for (let i = 0; i < this.gameState.player.deck.length; i++) {
			const deckCard = this.gameState.player.deck[i];
			
			const hasMatchingFlockTag = deckCard.tagsflock && 
				deckCard.tagsflock.some(tag => tag === flockTag);
			
			if (deckCard.type === 'unit' && hasMatchingFlockTag) {
				cardsToSummon.push({ card: deckCard, source: 'deck', index: i });
			}
		}
		
		for (let i = cardsToSummon.length - 1; i >= 0; i--) {
			const { card: summonCard, source, index } = cardsToSummon[i];
			
			let targetRow = this.getBestRowForSummon(summonCard);
			
			if (targetRow && this.gameState.player.rows[targetRow].cards.length < 9) {
				if (source === 'hand') {
					this.gameState.player.hand.splice(index, 1);
				} else if (source === 'deck') {
					this.gameState.player.deck.splice(index, 1);
				}
				
				const summonCopy = {
					...summonCard,
					uniqueId: `${summonCard.id}_flock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
					baseStrength: summonCard.strength,
					currentStrength: summonCard.strength,
					modifiedStrength: summonCard.strength,
					underWeather: false,
					owner: 'player',
					row: targetRow,
					summonedByFlock: true 
				};
				
				this.gameState.player.rows[targetRow].cards.push(summonCopy);
				
				if (window.gameModule) {
					window.gameModule.displayCardOnRow(targetRow, summonCopy, 'player', 
						this.gameState.player.rows[targetRow].cards.length - 1);
					window.gameModule.updateRowStrength(targetRow, 'player');
				}
				
				summonedCount++;
			}
		}
		
		if (window.gameModule) {
			window.gameModule.displayPlayerHand();
			window.gameModule.displayPlayerDeck();
		}
		
		if (summonedCount > 0 && window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_close');
		}
		
		if (window.gameModule && !playedCard.completeCalled) {
			playedCard.completeCalled = true;
			setTimeout(() => {
				window.gameModule.completeCardPlay();
			}, 500);
		}
	},

	startCallCardPlacement: function(card) {
		if (!card.summon) {
			this.showMessage('У карты нет указания, кого призывать!');
			this.cancelCardSelection();
			return;
		}
		
		this.startUnitCardPlacement(card);
	},

	activateCallAbility: function(playedCard, summonedCardName) {
		console.log(`=== Активация способности "Призыв" для карты: ${summonedCardName} ===`);
		
		// 1. Найти карту для призыва в глобальной коллекции cardsData (включая скрытые)
		let cardToSummon = null;
		let summonCopyCount = 1;
		
		if (window.cardsModule && window.cardsModule.cardsData) {
			for (const factionName in window.cardsModule.cardsData) {
				const faction = window.cardsModule.cardsData[factionName];
				for (const cardType in faction) {
					if (Array.isArray(faction[cardType])) {
						const foundCard = faction[cardType].find(c => c.name === summonedCardName);
						if (foundCard) {
							cardToSummon = foundCard;
							summonCopyCount = foundCard.copy || 1;
							break;
						}
					}
				}
				if (cardToSummon) break;
			}
		}

		if (!cardToSummon) {
			console.error(`Не удалось найти карту для призыва: ${summonedCardName}`);
			window.gameModule.showGameMessage(`Ошибка: карта "${summonedCardName}" не найдена!`, 'error');
			if (window.gameModule) window.gameModule.completeCardPlay();
			return;
		}

		console.log(`Найдена карта для призыва: ${cardToSummon.name}, нужно призвать ${summonCopyCount} копий`);

		let summonedCount = 0;
		const rows = ['close', 'ranged', 'siege'];
		
		// Пытаемся призвать указанное количество копий
		for (let i = 0; i < summonCopyCount; i++) {
			// 2. Определить подходящий ряд для призыва
			let targetRow = this.getBestRowForSummon(cardToSummon);
			
			if (!targetRow) {
				console.warn(`Нет места для ${i+1}-й копии карты "${summonedCardName}"!`);
				break;
			}

			// 3. Создать копию карты и разместить её на поле
			const summonCopy = window.gameModule.createCardCopy(cardToSummon);
			summonCopy.summonedByCall = true;
			summonCopy.originalCallerId = playedCard.id;
			summonCopy.copyNumber = i + 1;

			// Добавляем карту в ряд
			const rowState = this.gameState.player.rows[targetRow];
			if (rowState.cards.length >= 9) {
				console.warn(`В ряду ${targetRow} нет места для ${i+1}-й копии!`);
				break;
			}

			// Размещаем в конец ряда
			const insertIndex = rowState.cards.length;
			rowState.cards.push(summonCopy);
			
			if (window.gameModule) {
				window.gameModule.displayCardOnRow(targetRow, summonCopy, 'player', insertIndex);
				window.gameModule.updateRowStrength(targetRow, 'player');
			}
			
			summonedCount++;
		}

		if (summonedCount > 0) {
			const message = summonedCount === summonCopyCount 
				? `Призыв активирован! Призвано ${summonedCount} ${this.getCardDeclension(summonedCount, cardToSummon.name)}.`
				: `Призыв активирован! Призвано только ${summonedCount} из ${summonCopyCount} ${this.getCardDeclension(summonCopyCount, cardToSummon.name)} (недостаточно места).`;
			
			window.gameModule.showGameMessage(message, 'info');
			
			if (window.audioManager && window.audioManager.playSound) {
				audioManager.playSound('card_close');
			}
		} else {
			window.gameModule.showGameMessage(`Нет места для призыва карт "${summonedCardName}"!`, 'warning');
		}

		// Завершаем ход после небольшой задержки
		setTimeout(() => {
			if (window.gameModule && !playedCard.completeCalled) {
				playedCard.completeCalled = true;
				window.gameModule.completeCardPlay();
			}
		}, 800);
	},

	activateMedicAbility: function(playedCard) {
		// Собираем карты отрядов из сброса игрока
		const discard = this.gameState.player.discard || [];
		const validCards = discard
			.map((card, index) => ({ card, index }))
			.filter(item => {
				if (item.card.type !== 'unit') return false;
				if (this.isHeroCard(item.card)) return false;
				return true;
			});

		if (validCards.length === 0) {
			if (window.gameModule) {
				window.gameModule.completeCardPlay();
			}
			return;
		}

		// Проверяем, есть ли место в руке
		if (this.gameState.player.hand.length >= 10) {
			this.showMessage('Нет места в руке для возврата карты');
			if (window.gameModule) {
				window.gameModule.completeCardPlay();
			}
			return;
		}

		// Открываем модальное окно (как в «Двойной игре», но с реальными картами)
		this.showMedicSelectionModal(validCards).then((selectedItem) => {
			if (selectedItem) {
				this.returnCardFromDiscardToHand(selectedItem, playedCard);
			} else {
				if (window.gameModule) {
					window.gameModule.completeCardPlay();
				}
			}
		});
	},

	returnCardFromDiscardToHand: function(selectedItem, playedCard) {
		const { card, index } = selectedItem;
		const playerState = this.gameState.player;

		// Удаляем из сброса
		playerState.discard.splice(index, 1);
		// Добавляем в руку
		playerState.hand.push(card);

		if (window.gameModule) {
			window.gameModule.displayPlayerHand();
			window.gameModule.displayPlayerDiscard();
			window.gameModule.showGameMessage(
				`Медик: карта «${card.name}» возвращена из сброса в руку`,
				'info'
			);
		}
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('cardAdd');
		}

		// Завершаем ход
		if (window.gameModule && !playedCard.completeCalled) {
			playedCard.completeCalled = true;
			setTimeout(() => {
				window.gameModule.completeCardPlay();
			}, 400);
		}
	},

	showMedicSelectionModal: function(validCards) {
		return new Promise((resolve) => {
			// Удаляем старые модалки
			const existing = document.querySelectorAll('.deck-modal-overlay');
			existing.forEach(m => m.remove());

			// Берём фракцию игрока (сброс — его)
			const faction = this.gameState.player.faction;
			const factionBackground = `faction/${faction}/border_faction.png`;

			const modalOverlay = document.createElement('div');
			modalOverlay.className = 'deck-modal-overlay';
			modalOverlay.innerHTML = `
				<div class="deck-modal">
					<div class="deck-modal__header" style="background: url('${factionBackground}') center/cover;">
						<div class="deck-modal__title">ВЫБЕРИТЕ ОТРЯД ИЗ СБРОСА</div>
						<div class="deck-modal__count">${validCards.length}</div>
					</div>
					<div class="deck-modal__content">
					${validCards.map((item, idx) => `
						<div class="deck-card" data-medic-index="${idx}" data-card-id="${item.card.id}">
							<div class="deck-card__container">
								<img src="card/${item.card.faction}/${item.card.imageStatic || (item.card.image ? item.card.image.replace('.mp4', '.jpg') : 'placeholder.jpg')}"
									 class="deck-card__media" onerror="this.src='card/placeholder.jpg'">
								<img src="${item.card.border || 'deck/bord_silver.png'}" class="deck-card__border">
								<img src="${item.card.banner || 'faction/' + item.card.faction + '/banner_silver.png'}" class="deck-card__banner">
								<div class="deck-card__name">${item.card.name}</div>
								${item.card.type === 'unit' && item.card.ability && item.card.ability.trim() !== ''
									? `<div class="card__ability-icon">
										   <img src="${window.cardsModule?.getAbilityIconPath?.(item.card.ability) || `deck/${item.card.ability}.webp`}"
												alt="${item.card.ability}"
												onerror="this.parentElement.style.display='none'">
									   </div>`
									: ''
								}
								<div class="deck-card__strength">${item.card.strength || ''}</div>
								${item.card.position ? `
								<div class="deck-card__position">
									<img src="${item.card.positionBanner || 'faction/' + item.card.faction + '/banner_position.png'}" class="deck-card__position-banner">
									<img src="${window.gameModule?.getPositionIconPath ? window.gameModule.getPositionIconPath(item.card.position) : 'deck/any-row.png'}" class="deck-card__position-icon">
								</div>
								` : ''}
							</div>
						</div>
					`).join('')}
					</div>
				</div>
			`;

			document.body.appendChild(modalOverlay);
			setTimeout(() => modalOverlay.classList.add('active'), 10);

			let resolved = false;
			const resolveOnce = (value) => {
				if (resolved) return;
				resolved = true;
				resolve(value);
			};

			// Клик по карте — выбор
			modalOverlay.querySelectorAll('.deck-card').forEach(el => {
				el.addEventListener('click', () => {
					const idx = parseInt(el.dataset.medicIndex);
					this.closeMedicModal(modalOverlay);
					audioManager.playSound('button');
					resolveOnce(validCards[idx]);
				});
				el.addEventListener('mouseenter', () => {
					audioManager.playSound('touch');
					el.style.transform = 'scale(1.05)';
				});
				el.addEventListener('mouseleave', () => {
					el.style.transform = 'scale(1)';
				});
				// ПКМ — модалка карты
				el.addEventListener('contextmenu', (e) => {
					e.preventDefault();
					const idx = parseInt(el.dataset.medicIndex);
					if (window.gameModule && window.gameModule.showCardModal) {
						window.gameModule.showCardModal(validCards[idx].card);
					}
				});
			});

			// Клик вне окна / Escape — отмена
			const closeHandler = (e) => {
				if ((e.type === 'keydown' && e.key === 'Escape') || e.target === modalOverlay) {
					document.removeEventListener('keydown', closeHandler);
					this.closeMedicModal(modalOverlay);
					resolveOnce(null);
				}
			};
			modalOverlay.addEventListener('click', closeHandler);
			document.addEventListener('keydown', closeHandler);
		});
	},

	closeMedicModal: function(modal) {
		if (!modal) return;
		modal.classList.remove('active');
		setTimeout(() => {
			if (modal.parentNode) modal.remove();
		}, 300);
	},

	getCardDeclension: function(count, cardName) {
		if (count === 1) return cardName;
		
		if (cardName === 'Крыса') {
			return 'Крысы';
		}
		
		return cardName + 'ов';
	},

	getBestRowForSummon: function(card) {
		let availableRows = [];
		
		if (card.position === 'any-row' || card.position === 'any') {
			availableRows = ['close', 'ranged', 'siege'];
		} else if (Array.isArray(card.position)) {
			availableRows = card.position.map(pos => pos.replace('-row', ''));
		} else if (typeof card.position === 'string') {
			availableRows = [card.position.replace('-row', '')];
		} else {
			availableRows = ['close', 'ranged', 'siege'];
		}
		
		availableRows = availableRows.filter(row => 
			this.gameState.player.rows[row].cards.length < 9
		);
		
		if (availableRows.length === 0) return null;
		
		let bestRow = availableRows[0];
		let maxStrength = this.gameState.player.rows[bestRow].strength;
		
		for (let row of availableRows) {
			const rowStrength = this.gameState.player.rows[row].strength;
			if (rowStrength > maxStrength) {
				maxStrength = rowStrength;
				bestRow = row;
			}
		}
		
		return bestRow;
	},

	createFlockVisualEffect: function(row) {
		const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
		if (!rowElement) return;
		
		const effect = document.createElement('div');
		effect.style.cssText = `
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0) 70%);
			pointer-events: none;
			z-index: 40;
			animation: flockFlash 0.5s ease-out forwards;
		`;
		
		rowElement.style.position = 'relative';
		rowElement.appendChild(effect);
		
		setTimeout(() => {
			if (effect.parentNode) {
				effect.remove();
			}
		}, 500);
	},

	startSpecialBoostPlacement: function(card) {
		const ability = card.ability;
		
		if (ability.startsWith('boost_row_')) {
			this.startSpecialRowBoostPlacement(card);
		} else if (ability.startsWith('boost_tag_')) {
			this.startSpecialTagBoostPlacement(card);
		} else if (ability.startsWith('boost_') && !ability.startsWith('boost_near_')) {
			this.startSpecialCardBoostPlacement(card);
		} else if (ability.startsWith('boost_near_')) {
			this.startSpecialNearBoostPlacement(card);
		} else {
			this.cancelCardSelection();
		}
	},

	highlightPlayerCardsForSpecialTagBoost: function(tag, boostValue) {
		const rows = ['close', 'ranged', 'siege'];
		let hasAvailableCards = false;
		
		rows.forEach(row => {
			const rowState = this.gameState.player.rows[row];
			const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
			
			if (!rowElement) return;
			
			rowState.cards.forEach((unitCard, index) => {
				if (unitCard.type === 'unit' && 
					!this.isHeroCard(unitCard) && 
					unitCard.tags && 
					unitCard.tags.includes(tag)) {
					
					let cardElement = null;
					
					if (unitCard.uniqueId) {
						cardElement = rowElement.querySelector(`[data-unique-id="${unitCard.uniqueId}"]`);
					}
					
					if (!cardElement) {
						const possibleCards = rowElement.querySelectorAll(`[data-card-id="${unitCard.id}"]`);
						for (let el of possibleCards) {
							if (!cardElement) {
								cardElement = el;
							}
						}
					}
					
					if (!cardElement) {
						const allCards = rowElement.querySelectorAll('.board-card');
						if (allCards[index]) {
							cardElement = allCards[index];
						}
					}
					
					if (cardElement) {
						cardElement.classList.add('boost-target');
						cardElement.classList.add('tag-boost-target-card');
						cardElement.dataset.boostValue = boostValue;
						cardElement.dataset.boostTag = tag;
						this.setupSpecialTagCardBoostHandler(cardElement, unitCard, row, index, boostValue);
						hasAvailableCards = true;
					} else {
						console.warn(`Card element not found for ${unitCard.name} (id: ${unitCard.id}, uniqueId: ${unitCard.uniqueId})`);
					}
				}
			});
		});
		
		if (!hasAvailableCards) {
			const tagName = this.getTagRussianName(tag);
			this.showMessage(`Нет карт с тегом "${tagName}" для усиления!`);
			this.cancelCardSelection();
		}
	},

	setupSpecialTagCardBoostHandler: function(cardElement, targetCard, row, position, boostValue) {
		const clickHandler = () => {
			if (this.gameState.selectingRow && this.gameState.placementType === 'special_tag_boost') {
				this.applySpecialTagBoostToRow(this.gameState.boostCard, row, boostValue, this.gameState.boostTag);
				cardElement.removeEventListener('click', clickHandler);
			}
		};
		
		cardElement.addEventListener('click', clickHandler);
		
		if (!this.gameState.specialBoostHandlers) {
			this.gameState.specialBoostHandlers = [];
		}
		this.gameState.specialBoostHandlers.push({ 
			element: cardElement, 
			handler: clickHandler,
			card: targetCard,
			row: row,
			position: position
		});
	},

	applySpecialTagBoostToRow: function(boostCard, row, boostValue, tag) {
		const rowState = this.gameState.player.rows[row];
		let boostedCards = 0;
		
		const cardsToBoost = [...rowState.cards];
		
		cardsToBoost.forEach(card => {
			if (card.type === 'unit' && 
				!this.isHeroCard(card) && 
				card.tags && 
				card.tags.includes(tag)) {
				this.applyBoostToCard(card, boostValue, row, 'player');
				boostedCards++;
			}
		});
		
		if (boostedCards > 0) {
			this.removeCardFromHand(boostCard);
			
			const boostCardCopy = { ...boostCard };
			this.gameState.player.discard.push(boostCardCopy);
			
			if (window.gameModule) {
				window.gameModule.updateRowStrength(row, 'player');
				window.gameModule.displayPlayerDiscard();
				window.gameModule.completeCardPlay();
			}
			
			if (window.audioManager && window.audioManager.playSound) {
				audioManager.playSound('card_boost');
			}
		} else {
			this.showMessage(`В этом ряду нет карт с тегом "${this.getTagRussianName(tag)}"!`);
		}
		
		this.cancelSpecialBoostSelection();
	},

	getTagRussianName: function(tag) {
		const tagNames = {
			'witcher': 'Ведьмак',
			'criminal': 'Преступник',
			'blood': 'Вампир',
			'dwarf': 'Краснолюд',
			'blood': 'Кровопийца',
			'elf': 'Эльф',
			'mage': 'Маг',
			'soldier': 'Солдат',
			'king': 'Король',
			'leader': 'Лидер'
		};
		return tagNames[tag] || tag;
	},

	startSpecialRowBoostPlacement: function(card) {
		this.gameState.selectingRow = true;
		this.gameState.placementType = 'special_row_boost';
		this.gameState.boostCard = card;
		this.highlightPlayerRowsForSpecialBoost(card);
	},

	startSpecialTagBoostPlacement: function(card) {
		this.gameState.selectingRow = true;
		this.gameState.placementType = 'special_tag_boost';
		this.gameState.boostCard = card;
		
		let tag = '';
		let boostValue = 1;
		
		if (card.ability === 'boost_tag_witcher') {
			tag = 'witcher';
			boostValue = 3;
		} else if (card.ability === 'boost_tag_witcher_2') {
			tag = 'witcher';
			boostValue = 2;
		} else if (card.ability === 'boost_tag_witcher_3') {
			tag = 'witcher';
			boostValue = 3;
		} else if (card.ability === 'boost_tag_criminal') {
			tag = 'criminal';
			boostValue = 2;
		} else if (card.ability === 'boost_tag_dwarf') {
			tag = 'dwarf';
			boostValue = 1;
		} else if (card.ability === 'boost_tag_thirst') {
			tag = 'blood';
			boostValue = 2;
		}
		
		if (!tag) {
			this.showMessage('Неизвестный тег для усиления!');
			this.cancelCardSelection();
			return;
		}
		
		this.gameState.boostTag = tag;
		this.gameState.boostTagValue = boostValue;
		
		this.highlightPlayerCardsForSpecialTagBoost(tag, boostValue);
	},

	startSpecialCardBoostPlacement: function(card) {
		this.gameState.selectingRow = true;
		this.gameState.placementType = 'special_card_boost';
		this.gameState.boostCard = card;
		this.highlightPlayerCardsForSpecialBoost(card);
	},

	startSpecialNearBoostPlacement: function(card) {
		this.gameState.selectingRow = true;
		this.gameState.placementType = 'special_near_boost';
		this.gameState.boostCard = card;
		this.highlightPlayerSlotsForSpecialNearBoost(card);
	},

	highlightPlayerRowsForSpecialBoost: function(card) {
		const rows = ['close', 'ranged', 'siege'];
		let hasAvailableRows = false;
		const boostMatch = card.ability.match(/boost_row_(\d+)/);
		const boostValue = boostMatch ? parseInt(boostMatch[1]) : 1;
		
		rows.forEach(row => {
			const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
			const hasBoostableUnits = this.gameState.player.rows[row].cards.some(c => 
				c.type === 'unit' && !this.isHeroCard(c)
			);
			
			if (rowElement && hasBoostableUnits) {
				rowElement.classList.add('row-boost-target');
				this.setupSpecialBoostRowHandler(rowElement, row, boostValue);
				hasAvailableRows = true;
			}
		});
		
		if (!hasAvailableRows) {
			this.showMessage('Нет карт для усиления!');
			this.cancelCardSelection();
		}
	},

	setupSpecialBoostRowHandler: function(rowElement, row, boostValue) {
		const clickHandler = () => {
			if (this.gameState.selectingRow && 
				(this.gameState.placementType === 'special_row_boost' || 
				 this.gameState.placementType === 'special_tag_boost')) {
				this.applySpecialRowBoost(this.gameState.boostCard, row, boostValue);
				rowElement.removeEventListener('click', clickHandler);
			}
		};
		
		rowElement.addEventListener('click', clickHandler);
		
		if (!this.gameState.specialBoostHandlers) {
			this.gameState.specialBoostHandlers = [];
		}
		this.gameState.specialBoostHandlers.push({ 
			element: rowElement, 
			handler: clickHandler,
			row: row
		});
	},

	applySpecialRowBoost: function(boostCard, row, boostValue) {
		const rowState = this.gameState.player.rows[row];
		let boostedCards = 0;
		
		rowState.cards.forEach(card => {
			if (card.type === 'unit' && !this.isHeroCard(card)) {
				this.applyBoostToCard(card, boostValue, row, 'player');
				boostedCards++;
			}
		});
		
		if (boostedCards > 0) {
			// Удаляем специальную карту из руки
			this.removeCardFromHand(boostCard);
			
			// Добавляем карту в сброс
			const boostCardCopy = { ...boostCard };
			this.gameState.player.discard.push(boostCardCopy);
			
			if (window.gameModule) {
				window.gameModule.updateRowStrength(row, 'player');
				window.gameModule.displayPlayerDiscard();
				window.gameModule.completeCardPlay();
			}
			
			if (window.audioManager && window.audioManager.playSound) {
				audioManager.playSound('card_boost');
			}
		}
		
		this.cancelSpecialBoostSelection();
	},

	highlightPlayerRowsForSpecialTagBoost: function(tag) {
		const rows = ['close', 'ranged', 'siege'];
		let hasAvailableRows = false;
		
		rows.forEach(row => {
			const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
			const hasTagUnits = this.gameState.player.rows[row].cards.some(card => 
				card.type === 'unit' && 
				!this.isHeroCard(card) &&
				card.tags && 
				card.tags.includes(tag)
			);
			
			if (rowElement && hasTagUnits) {
				rowElement.classList.add('tag-boost-target');
				rowElement.dataset.boostTag = tag;
				this.setupSpecialTagBoostRowHandler(rowElement, row, tag);
				hasAvailableRows = true;
			}
		});
		
		if (!hasAvailableRows) {
			const tagName = tag === 'witcher' ? 'Ведьмак' : 'Преступник';
			this.showMessage(`Нет карт с тегом "${tagName}" для усиления!`);
			this.cancelCardSelection();
		}
	},

	setupSpecialTagBoostRowHandler: function(rowElement, row, tag) {
		const clickHandler = () => {
			if (this.gameState.selectingRow && this.gameState.placementType === 'special_tag_boost') {
				this.applySpecialTagBoost(this.gameState.boostCard, row, tag);
				rowElement.removeEventListener('click', clickHandler);
			}
		};
		
		rowElement.addEventListener('click', clickHandler);
		
		if (!this.gameState.specialBoostHandlers) {
			this.gameState.specialBoostHandlers = [];
		}
		this.gameState.specialBoostHandlers.push({ 
			element: rowElement, 
			handler: clickHandler,
			row: row,
			tag: tag
		});
	},

	applySpecialTagBoost: function(boostCard, row, tag) {
		const rowState = this.gameState.player.rows[row];
		let boostValue = 1;
		
		if (boostCard.ability === 'boost_tag_witcher') {
			boostValue = 3;
		} else if (boostCard.ability === 'boost_tag_witcher_2') {
			boostValue = 2;
		} else if (boostCard.ability === 'boost_tag_witcher_3') {
			boostValue = 3;
		} else if (boostCard.ability === 'boost_tag_criminal') {
			boostValue = 2;
		} else if (boostCard.ability === 'boost_tag_dwarf') {
			boostValue = 1;
		} else if (boostCard.ability === 'boost_tag_thirst') { 
			boostValue = 2;
		}
		
		let boostedCards = 0;
		
		const cardsToBoost = [...rowState.cards];
		
		cardsToBoost.forEach(card => {
			if (card.type === 'unit' && 
				!this.isHeroCard(card) && 
				card.tags && 
				card.tags.includes(tag)) {
				this.applyBoostToCard(card, boostValue, row, 'player');
				boostedCards++;
			}
		});
		
		if (boostedCards > 0) {
			this.removeCardFromHand(boostCard);
			
			const boostCardCopy = { ...boostCard };
			this.gameState.player.discard.push(boostCardCopy);
			
			if (window.gameModule) {
				window.gameModule.updateRowStrength(row, 'player');
				window.gameModule.displayPlayerDiscard();
				window.gameModule.completeCardPlay();
			}
			
			if (window.audioManager && window.audioManager.playSound) {
				audioManager.playSound('card_boost');
			}
		} else {
			const tagName = this.getTagRussianName(tag);
			this.showMessage(`В этом ряду нет карт с тегом "${tagName}" для усиления!`);
		}
		
		this.cancelSpecialBoostSelection();
	},

	highlightPlayerCardsForSpecialBoost: function(card) {
		const rows = ['close', 'ranged', 'siege'];
		let hasAvailableCards = false;
		const boostMatch = card.ability.match(/boost_(\d+)/);
		const boostValue = boostMatch ? parseInt(boostMatch[1]) : 1;
		
		rows.forEach(row => {
			const rowState = this.gameState.player.rows[row];
			const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
			
			if (!rowElement) return;
			
			rowState.cards.forEach((unitCard, index) => {
				if (unitCard.type === 'unit' && !this.isHeroCard(unitCard)) {
					const cardElement = this.getCardElementOnBoard(unitCard, row, 'player');
					if (cardElement) {
						cardElement.classList.add('boost-target');
						cardElement.dataset.boostValue = boostValue;
						this.setupSpecialCardBoostHandler(cardElement, unitCard, row, index, boostValue);
						hasAvailableCards = true;
					}
				}
			});
		});
		
		if (!hasAvailableCards) {
			this.showMessage('Нет карт для усиления!');
			this.cancelCardSelection();
		}
	},

	setupSpecialCardBoostHandler: function(cardElement, targetCard, row, position, boostValue) {
		const clickHandler = () => {
			if (this.gameState.selectingRow && this.gameState.placementType === 'special_card_boost') {
				this.applySpecialCardBoost(this.gameState.boostCard, targetCard, row, position, boostValue);
				cardElement.removeEventListener('click', clickHandler);
			}
		};
		
		cardElement.addEventListener('click', clickHandler);
		
		if (!this.gameState.specialBoostHandlers) {
			this.gameState.specialBoostHandlers = [];
		}
		this.gameState.specialBoostHandlers.push({ 
			element: cardElement, 
			handler: clickHandler,
			card: targetCard,
			row: row,
			position: position
		});
	},

	applySpecialCardBoost: function(boostCard, targetCard, row, position, boostValue) {
		// Усиливаем выбранную карту
		this.applyBoostToCard(targetCard, boostValue, row, 'player');
		
		// Удаляем специальную карту из руки
		this.removeCardFromHand(boostCard);
		
		// Добавляем карту в сброс
		const boostCardCopy = { ...boostCard };
		this.gameState.player.discard.push(boostCardCopy);
		
		if (window.gameModule) {
			window.gameModule.updateRowStrength(row, 'player');
			window.gameModule.displayPlayerDiscard();
			window.gameModule.completeCardPlay();
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_boost');
		}
		
		this.cancelSpecialBoostSelection();
	},

	highlightPlayerSlotsForSpecialNearBoost: function(card) {
		const rows = ['close', 'ranged', 'siege'];
		let hasAvailableSlots = false;
		const boostMatch = card.ability.match(/boost_near_(\d+)/);
		const boostValue = boostMatch ? parseInt(boostMatch[1]) : 1;
		
		rows.forEach(row => {
			const rowState = this.gameState.player.rows[row];
			const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
			
			if (!rowElement || rowState.cards.length >= 9) return;
			
			for (let i = 0; i <= rowState.cards.length; i++) {
				const hasLeftNeighbor = i > 0 && 
					rowState.cards[i - 1].type === 'unit' && 
					!this.isHeroCard(rowState.cards[i - 1]);
				
				const hasRightNeighbor = i < rowState.cards.length && 
					rowState.cards[i].type === 'unit' && 
					!this.isHeroCard(rowState.cards[i]);
				
				if (hasLeftNeighbor || hasRightNeighbor) {
					const positionMarker = this.createPositionMarker(row, i);
					if (positionMarker) {
						positionMarker.classList.add('boost-position-target');
						positionMarker.dataset.boostValue = boostValue;
						this.setupSpecialNearBoostHandler(positionMarker, row, i, boostValue);
						hasAvailableSlots = true;
					}
				}
			}
		});
		
		if (!hasAvailableSlots) {
			this.showMessage('Нет подходящих позиций для усиления соседей!');
			this.cancelCardSelection();
		}
	},

	setupSpecialNearBoostHandler: function(positionMarker, row, position, boostValue) {
		const clickHandler = () => {
			if (this.gameState.selectingRow && this.gameState.placementType === 'special_near_boost') {
				this.applySpecialNearBoost(this.gameState.boostCard, row, position, boostValue);
				positionMarker.remove();
			}
		};
		
		positionMarker.addEventListener('click', clickHandler);
		
		if (!this.gameState.specialBoostHandlers) {
			this.gameState.specialBoostHandlers = [];
		}
		this.gameState.specialBoostHandlers.push({ 
			element: positionMarker, 
			handler: clickHandler,
			row: row,
			position: position
		});
	},

	applySpecialNearBoost: function(boostCard, row, position, boostValue) {
		const rowState = this.gameState.player.rows[row];
		let boostedCards = 0;
		
		// Усиливаем карту слева
		if (position > 0) {
			const leftCard = rowState.cards[position - 1];
			if (leftCard.type === 'unit' && !this.isHeroCard(leftCard)) {
				this.applyBoostToCard(leftCard, boostValue, row, 'player');
				boostedCards++;
			}
		}
		
		// Усиливаем карту справа
		if (position < rowState.cards.length) {
			const rightCard = rowState.cards[position];
			if (rightCard.type === 'unit' && !this.isHeroCard(rightCard)) {
				this.applyBoostToCard(rightCard, boostValue, row, 'player');
				boostedCards++;
			}
		}
		
		if (boostedCards > 0) {
			// Удаляем специальную карту из руки
			this.removeCardFromHand(boostCard);
			
			// Добавляем карту в сброс
			const boostCardCopy = { ...boostCard };
			this.gameState.player.discard.push(boostCardCopy);
			
			if (window.gameModule) {
				window.gameModule.updateRowStrength(row, 'player');
				window.gameModule.displayPlayerDiscard();
				window.gameModule.completeCardPlay();
			}
			
			if (window.audioManager && window.audioManager.playSound) {
				audioManager.playSound('card_boost');
			}
		}
		
		this.cancelSpecialBoostSelection();
	},

	cancelSpecialBoostSelection: function() {
		// Убираем подсветку рядов
		const highlightedRows = document.querySelectorAll('.row-boost-target, .tag-boost-target');
		highlightedRows.forEach(row => {
			row.classList.remove('row-boost-target');
			row.classList.remove('tag-boost-target');
			delete row.dataset.boostTag;
		});
		
		// Убираем подсветку карт
		const highlightedCards = document.querySelectorAll('.boost-target');
		highlightedCards.forEach(card => {
			card.classList.remove('boost-target');
			delete card.dataset.boostValue;
		});
		
		// Убираем маркеры позиций
		const positionMarkers = document.querySelectorAll('.boost-position-marker');
		positionMarkers.forEach(marker => {
			marker.remove();
		});
		
		// Убираем подсветку соседей
		const neighborHighlights = document.querySelectorAll('.neighbor-highlight');
		neighborHighlights.forEach(card => {
			card.classList.remove('neighbor-highlight');
		});
		
		// Очищаем обработчики
		if (this.gameState.specialBoostHandlers) {
			this.gameState.specialBoostHandlers.forEach(({ element, handler }) => {
				element.removeEventListener('click', handler);
			});
			this.gameState.specialBoostHandlers = [];
		}
		
		this.cancelRowSelection();
	},

	startSpyCardPlacement: function(card) {
		this.gameState.selectingRow = true;
		this.gameState.placementType = 'spy';
		
		// Получаем доступные ряды для размещения шпиона (на стороне противника)
		const targetPosition = window.gameModule.getSpyTargetPosition(card);
		const availableRows = this.getAvailableSpyRows(card, targetPosition);
		
		if (availableRows.length === 0) {
			this.showMessage('Нет доступных рядов для размещения шпиона!');
			this.cancelCardSelection();
			return;
		}
		
		// Подсвечиваем доступные ряды противника
		this.highlightOpponentRowsForSpy(availableRows);
	},

	getAvailableSpyRows: function(card, targetPosition) {
		let availableRows = [];
		
		if (targetPosition === 'any-row' || (Array.isArray(targetPosition) && targetPosition.includes('any-row'))) {
			availableRows = ['close', 'ranged', 'siege'];
		} else if (Array.isArray(targetPosition)) {
			availableRows = targetPosition.map(pos => pos.replace('-row', ''));
		} else {
			availableRows = [targetPosition.replace('-row', '')];
		}
		
		// Проверяем, есть ли место в рядах противника
		return availableRows.filter(row => 
			this.gameState.opponent.rows[row].cards.length < 9
		);
	},

	highlightOpponentRowsForSpy: function(rows) {
		// Сначала очищаем предыдущие подсветки
		this.removeSpyHighlights();
		
		rows.forEach(row => {
			const rowElement = document.getElementById(`opponent${this.capitalizeFirst(row)}Row`);
			if (rowElement) {
				rowElement.classList.add('row-available');
				rowElement.classList.add('spy-target');
				this.setupOpponentRowSelectionHandler(rowElement, row);
			}
		});
	},

	setupOpponentRowSelectionHandler: function(rowElement, row) {
		// Удаляем старый обработчик, если есть
		if (this.gameState.spySelectionHandlers) {
			const existingHandler = this.gameState.spySelectionHandlers.find(h => h.element === rowElement);
			if (existingHandler) {
				rowElement.removeEventListener('click', existingHandler.handler);
			}
		}
		
		const clickHandler = (event) => {
			if (this.gameState.selectingRow && this.gameState.selectedCard) {
				const card = this.gameState.selectedCard;
				
				if (this.gameState.placementType === 'spy') {
					const success = window.gameModule.placeSpyCard(card, row, event.clientX, 'player');
					
					if (success) {
						// Важно: очищаем подсветку ДО cancelRowSelection
						this.removeSpyHighlights();
						this.cancelRowSelection();
						
						if (window.gameModule && window.gameModule.completeCardPlay) {
							setTimeout(() => {
								window.gameModule.completeCardPlay();
							}, 500);
						}
					}
				}
			}
		};
		
		rowElement.addEventListener('click', clickHandler);
		
		if (!this.gameState.spySelectionHandlers) {
			this.gameState.spySelectionHandlers = [];
		}
		this.gameState.spySelectionHandlers.push({ element: rowElement, handler: clickHandler, row: row });
	},

	removeSpyHighlights: function() {
		// Убираем оба класса со ВСЕХ рядов (и игрока, и противника)
		const allRows = document.querySelectorAll('.spy-target, .row-available');
		allRows.forEach(row => {
			row.classList.remove('spy-target');
			row.classList.remove('row-available');
		});
		
		// Очищаем обработчики для шпионов
		if (this.gameState.spySelectionHandlers) {
			this.gameState.spySelectionHandlers.forEach(({ element, handler }) => {
				element.removeEventListener('click', handler);
			});
			this.gameState.spySelectionHandlers = [];
		}
	},

	startBoostCardPlacement: function(card) {
		const ability = card.ability;
		
		if (ability.startsWith('boost_row_')) {
			this.startRowBoostPlacement(card);
		} else if (ability.startsWith('boost_tag_')) {
			this.startTagBoostPlacement(card); // ТЕПЕРЬ ТАКЖЕ ТРЕБУЕТ ВЫБОРА РЯДА
		}
	},

	startRowBoostPlacement: function(card) {
		this.gameState.selectingRow = true;
		this.gameState.placementType = 'row_boost';
		this.gameState.boostCard = card;
		this.highlightAvailableTacticSlotsForBoost();
	},

	startTagBoostPlacement: function(card) {
		this.gameState.selectingRow = true;
		this.gameState.placementType = 'tag_boost';
		this.gameState.boostCard = card;
		
		// Определяем тег из ability
		let tag = '';
		let boostValue = 1;
		
		if (card.ability === 'boost_tag_witcher') {
			tag = 'witcher';
			boostValue = 3;
		} else if (card.ability === 'boost_tag_witcher_2') {
			tag = 'witcher';
			boostValue = 2;
		} else if (card.ability === 'boost_tag_witcher_3') {
			tag = 'witcher';
			boostValue = 3;
		} else if (card.ability === 'boost_tag_criminal') {
			tag = 'criminal';
			boostValue = 2;
		} else if (card.ability === 'boost_tag_dwarf') {
			tag = 'dwarf';
			boostValue = 1;
		}
		
		if (!tag) {
			this.showMessage('Неизвестный тег для усиления!');
			this.cancelCardSelection();
			return;
		}
		
		this.gameState.boostTag = tag;
		this.gameState.boostTagValue = boostValue;
		this.highlightPlayerRowsForTagBoost(tag);
	},

	highlightPlayerRowsForTagBoost: function(tag) {
		const rows = ['close', 'ranged', 'siege'];
		let hasAvailableSlots = false;
		
		rows.forEach(row => {
			// Проверяем, есть ли в ряду карты с нужным тегом
			const hasTagUnits = this.gameState.player.rows[row].cards.some(card => 
				card.type === 'unit' && 
				!(card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) &&
				card.tags && 
				card.tags.includes(tag)
			);
			
			// Проверяем, есть ли свободный тактический слот
			const tacticSlot = document.getElementById(`player${this.capitalizeFirst(row)}Tactics`);
			const hasTacticSlot = tacticSlot && !this.gameState.player.rows[row].tactic;
			
			if (hasTagUnits && hasTacticSlot) {
				tacticSlot.classList.add('tactic-slot-available');
				this.setupTacticSlotSelectionHandler(tacticSlot, row);
				hasAvailableSlots = true;
			}
		});
		
		// Если нет подходящих слотов, показываем сообщение
		if (!hasAvailableSlots) {
			this.showMessage(`У вас нет карт с тегом "${tag}" или нет свободных тактических слотов!`);
			this.cancelCardSelection();
		}
	},

	highlightPlayerRowsForBoost: function() {
		const rows = ['close', 'ranged', 'siege'];
		
		rows.forEach(row => {
			const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
			if (rowElement) {
				// Проверяем, есть ли в ряду карты, которые можно усилить
				const hasBoostableUnits = this.gameState.player.rows[row].cards.some(card => 
					card.type === 'unit' && 
					!(card.tags && (card.tags.includes('hero') || card.tags.includes('герой')))
				);
				
				if (hasBoostableUnits) {
					rowElement.classList.add('row-boost-target');
					this.setupRowBoostSelectionHandler(rowElement, row);
				}
			}
		});
	},

	highlightAvailableTacticSlotsForBoost: function() {
		const rows = ['close', 'ranged', 'siege'];
		let hasAvailableSlots = false;
		
		rows.forEach(row => {
			const tacticSlot = document.getElementById(`player${this.capitalizeFirst(row)}Tactics`);
			
			// Проверяем, есть ли в ряду карты для усиления и свободен ли слот
			const hasBoostableUnits = this.gameState.player.rows[row].cards.some(card => 
				card.type === 'unit' && 
				!(card.tags && (card.tags.includes('hero') || card.tags.includes('герой')))
			);
			
			if (tacticSlot && !this.gameState.player.rows[row].tactic && hasBoostableUnits) {
				tacticSlot.classList.add('tactic-slot-available');
				this.setupTacticSlotSelectionHandler(tacticSlot, row);
				hasAvailableSlots = true;
			}
		});
		
		if (!hasAvailableSlots) {
			this.showMessage('Нет подходящих тактических слотов для усиления!');
			this.cancelCardSelection();
		}
	},

	setupRowBoostSelectionHandler: function(rowElement, row) {
		const clickHandler = () => {
			if (this.gameState.selectingRow) {
				if (this.gameState.placementType === 'row_boost') {
					this.applyRowBoostCard(this.gameState.boostCard, row);
				} else if (this.gameState.placementType === 'tag_boost') {
					this.applyTagBoostCard(this.gameState.boostCard, row);
				}
				rowElement.removeEventListener('click', clickHandler);
			}
		};
		
		rowElement.addEventListener('click', clickHandler);
		
		if (!this.gameState.boostSelectionHandlers) {
			this.gameState.boostSelectionHandlers = [];
		}
		this.gameState.boostSelectionHandlers.push({ 
			element: rowElement, 
			handler: clickHandler,
			row: row,
			placementType: this.gameState.placementType
		});
	},

	applyBoostToCard: function(card, boostValue, row, player = 'player') {
		this.initializeCardFields(card);
		
		card.modifiedStrength += boostValue;
		
		if (card.underWeather) {
			card.currentStrength = 1;
		} else {
			card.currentStrength = card.modifiedStrength;
			card.strength = card.modifiedStrength;
		}
		
		this.createBoostVisualEffectImproved(card, row, boostValue);
		
		if (window.gameModule) {
			window.gameModule.updateCardStrengthDisplay(card, row, player);
			window.gameModule.updateRowStrength(row, player);
		}
	},

	createBoostVisualEffectImproved: function(card, row, boostValue) {
		const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
		if (!rowElement) return;
		
		let cardElement = null;
		
		// Ищем по uniqueId
		if (card.uniqueId) {
			cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
		}
		
		if (!cardElement) {
			const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
			if (elements.length === 1) {
				cardElement = elements[0];
			} else if (elements.length > 1) {
				const rowState = this.gameState.player.rows[row];
				const position = rowState.cards.findIndex(c => 
					c.id === card.id && c.uniqueId === card.uniqueId
				);
				if (position !== -1 && elements[position]) {
					cardElement = elements[position];
				} else {
					cardElement = elements[0];
				}
			}
		}
		
		if (!cardElement) return;
		
		const boostOverlay = document.createElement('div');
		boostOverlay.className = 'card-boost-overlay';
		boostOverlay.textContent = `+${boostValue}`;
		boostOverlay.style.cssText = `
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			color: green;
			font-size: 24px;
			font-weight: bold;
			text-shadow: 0 0 5px black;
			z-index: 100;
			pointer-events: none;
			animation: boostAnimation 0.8s ease-out forwards;
		`;
		
		cardElement.appendChild(boostOverlay);
		
		setTimeout(() => {
			if (boostOverlay.parentNode) {
				boostOverlay.remove();
			}
		}, 800);
	},

	applyRowBoostCard: function(boostCard, row) {
		const ability = boostCard.ability;
		const boostMatch = ability.match(/boost_row_(\d+)/);
		const boostValue = boostMatch ? parseInt(boostMatch[1]) : 1;
		
		if (this.gameState.player.rows[row].tactic) {
			this.showMessage('В этом ряду уже есть карта тактики!');
			return;
		}
		
		this.gameState.player.rows[row].tactic = boostCard;
		this.removeCardFromHand(boostCard);
		
		const rowState = this.gameState.player.rows[row];
		let boostedCards = 0;
		
		rowState.cards.forEach(card => {
			if (card.type === 'unit' && !this.isHeroCard(card)) {
				// Используем новую функцию для усиления
				this.applyBoostToCard(card, boostValue, row, 'player');
				boostedCards++;
			}
		});
		
		if (window.gameModule) {
			window.gameModule.displayTacticCard(row, boostCard, 'player');
			window.gameModule.updateRowStrength(row, 'player');
			window.gameModule.completeCardPlay();
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_boost');
		}
		
		this.cancelBoostSelection();
	},

	applyTagBoostCard: function(boostCard, row) {
		const ability = boostCard.ability;
		let boostValue = 1;
		let tag = '';
		
		// Определяем тег и значение усиления
		if (ability === 'boost_tag_witcher') {
			tag = 'witcher';
			boostValue = 3;
		} else if (ability === 'boost_tag_witcher_2') {
			tag = 'witcher';
			boostValue = 2;
		} else if (ability === 'boost_tag_witcher_3') {
			tag = 'witcher';
			boostValue = 3;
		} else if (ability === 'boost_tag_criminal') {
			tag = 'criminal';
			boostValue = 2;
		} else if (ability === 'boost_tag_dwarf') {
			tag = 'dwarf';
			boostValue = 1;
		}
		
		if (!tag) {
			this.showMessage('Неизвестный тег для усиления!');
			return;
		}
		
		// Проверяем, есть ли в выбранном ряду карты с нужным тегом
		const rowState = this.gameState.player.rows[row];
		const hasTagUnits = rowState.cards.some(card => 
			card.type === 'unit' && 
			!this.isHeroCard(card) &&
			card.tags && 
			card.tags.includes(tag)
		);
		
		if (!hasTagUnits) {
			this.showMessage(`В этом ряду нет карт с тегом "${tag}"!`);
			return;
		}
		
		// Проверяем, свободен ли тактический слот
		if (this.gameState.player.rows[row].tactic) {
			this.showMessage('В этом ряду уже есть карта тактики!');
			return;
		}
		
		// Размещаем карту тактики
		this.gameState.player.rows[row].tactic = boostCard;
		this.removeCardFromHand(boostCard);
		
		// Применяем эффект усиления
		let boostedCards = 0;
		
		rowState.cards.forEach(card => {
			if (card.type === 'unit' && 
				!this.isHeroCard(card) && 
				card.tags && 
				card.tags.includes(tag)) {
				
				// Используем функцию applyBoostToCard для усиления
				this.applyBoostToCard(card, boostValue, row, 'player');
				boostedCards++;
			}
		});
		
		// Обновляем силу ряда
		if (window.gameModule) {
			window.gameModule.updateRowStrength(row, 'player');
			
			// Отображаем карту тактики
			window.gameModule.displayTacticCard(row, boostCard, 'player');
			
			// Завершаем ход
			window.gameModule.completeCardPlay();
		}
		
		// Воспроизводим звук
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_boost');
		}
		
		// Сбрасываем состояние выбора
		this.cancelBoostSelection();
	},

	createBoostVisualEffect: function(card, row, boostValue) {
		const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
		if (!rowElement) return;
		
		let cardElements = [];
		
		if (card.uniqueId) {
			const uniqueElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			if (uniqueElement) {
				cardElements = [uniqueElement];
			}
		}
		
		if (cardElements.length === 0) {
			cardElements = Array.from(rowElement.querySelectorAll(`[data-card-id="${card.id}"]`));
		}
		
		if (cardElements.length === 0) {
			const rowState = this.gameState.player.rows[row];
			const cardIndex = rowState.cards.findIndex(c => 
				c.id === card.id && c.uniqueId === card.uniqueId
			);
			if (cardIndex !== -1) {
				const allCards = rowElement.querySelectorAll('.board-card');
				if (allCards[cardIndex]) {
					cardElements = [allCards[cardIndex]];
				}
			}
		}
		
		cardElements.forEach(cardElement => {
			const boostOverlay = document.createElement('div');
			boostOverlay.className = 'card-boost-overlay';
			boostOverlay.textContent = `+${boostValue}`;
			boostOverlay.style.cssText = `
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				color: green;
				font-size: 24px;
				font-weight: bold;
				text-shadow: 0 0 5px black;
				z-index: 100;
				pointer-events: none;
				animation: boostAnimation 0.8s ease-out forwards;
			`;
			
			cardElement.appendChild(boostOverlay);
			
			setTimeout(() => {
				if (boostOverlay.parentNode) {
					boostOverlay.remove();
				}
			}, 800);
		});
	},

	cancelBoostSelection: function() {
		this.gameState.boostTag = null;
	},

	removeBoostHighlights: function() {
		// Убираем подсветку рядов
		const highlightedRows = document.querySelectorAll('.row-boost-target, .tag-boost-target');
		highlightedRows.forEach(row => {
			row.classList.remove('row-boost-target');
			row.classList.remove('tag-boost-target');
			delete row.dataset.boostTag;
		});
	},

	startDamageCardPlacement: function(card) {
		const ability = card.ability;
		
		if (ability === 'damage_row_1' || ability === 'damage_row_2' || ability === 'damage_row_3') {
			// Для урона по ряду - выбор ряда
			this.startRowDamagePlacement(card);
		} else {
			// Для урона по единичной карте - выбор карты
			this.startUnitDamagePlacement(card);
		}
	},

	startUnitDamagePlacement: function(card) {
		this.gameState.selectingRow = true;
		this.gameState.placementType = 'unit_damage';
		this.gameState.damageCard = card;
		this.highlightEnemyUnitsForDamage(card);
	},

	highlightEnemyUnitsForDamage: function(damageCard) {
		const rows = ['close', 'ranged', 'siege'];
		const damageValue = this.getDamageValueFromAbility(damageCard.ability);
		
		rows.forEach(row => {
			const rowCards = this.gameState.opponent.rows[row].cards;
			
			rowCards.forEach((unitCard, index) => {
				if (unitCard.tags && (unitCard.tags.includes('hero') || unitCard.tags.includes('герой'))) {
					return;
				}
				
				if (unitCard.type === 'unit' && unitCard.strength > 0) {
					const cardElement = this.getCardElementOnBoard(unitCard, row, 'opponent');
					if (cardElement) {
						cardElement.classList.add('damage-target');
						cardElement.dataset.damageValue = damageValue;
						this.setupDamageSelectionHandler(cardElement, damageCard, unitCard, row);
					}
				}
			});
		});
	},

	startRowDamagePlacement: function(card) {
		this.gameState.selectingRow = true;
		this.gameState.placementType = 'row_damage';
		this.gameState.damageCard = card;
		this.highlightEnemyRowsForDamage(card);
	},

	highlightEnemyRowsForDamage: function(damageCard) {
		const rows = ['close', 'ranged', 'siege'];
		const damageValue = this.getDamageValueFromAbility(damageCard.ability);
		
		rows.forEach(row => {
			const rowElement = document.getElementById(`opponent${this.capitalizeFirst(row)}Row`);
			if (rowElement) {
				const hasNonHeroUnits = this.gameState.opponent.rows[row].cards.some(card => 
					card.type === 'unit' && 
					card.strength > 0 && 
					!(card.tags && (card.tags.includes('hero') || card.tags.includes('герой')))
				);
				
				if (hasNonHeroUnits) {
					rowElement.classList.add('row-damage-target');
					rowElement.dataset.damageValue = damageValue;
					this.setupRowDamageSelectionHandler(rowElement, damageCard, row);
				}
			}
		});
	},

	getDamageValueFromAbility: function(ability) {
		const damageMatch = ability.match(/damage_(\d+)/);
		if (damageMatch && damageMatch[1]) {
			return parseInt(damageMatch[1]);
		}
		
		const rowDamageMatch = ability.match(/damage_row_(\d+)/);
		if (rowDamageMatch && rowDamageMatch[1]) {
			return parseInt(rowDamageMatch[1]);
		}
		
		return 1;
	},

	setupDamageSelectionHandler: function(cardElement, damageCard, targetCard, row) {
		const clickHandler = () => {
			if (this.gameState.selectingRow && this.gameState.placementType === 'unit_damage') {
				this.executeUnitDamage(damageCard, targetCard, row);
				cardElement.removeEventListener('click', clickHandler);
			}
		};
		
		cardElement.addEventListener('click', clickHandler);
		
		if (!this.gameState.damageSelectionHandlers) {
			this.gameState.damageSelectionHandlers = [];
		}
		this.gameState.damageSelectionHandlers.push({ 
			element: cardElement, 
			handler: clickHandler,
			card: targetCard
		});
	},

	setupRowDamageSelectionHandler: function(rowElement, damageCard, row) {
		const clickHandler = () => {
			if (this.gameState.selectingRow && this.gameState.placementType === 'row_damage') {
				this.executeRowDamage(damageCard, row);
				rowElement.removeEventListener('click', clickHandler);
			}
		};
		
		rowElement.addEventListener('click', clickHandler);
		
		if (!this.gameState.rowDamageSelectionHandlers) {
			this.gameState.rowDamageSelectionHandlers = [];
		}
		this.gameState.rowDamageSelectionHandlers.push({ 
			element: rowElement, 
			handler: clickHandler,
			row: row
		});
	},

	executeUnitDamage: function(damageCard, targetCard, row) {
		const damageValue = this.getDamageValueFromAbility(damageCard.ability);
		
		this.removeCardFromHand(damageCard);
		
		const damageCardCopy = { ...damageCard };
		this.gameState.player.discard.push(damageCardCopy);
		
		// Инициализируем поля для отслеживания состояний, если их нет
		this.initializeCardFields(targetCard);
		
		// Сохраняем текущую силу до применения урона
		const currentDisplayStrength = targetCard.currentStrength !== undefined ? 
			targetCard.currentStrength : targetCard.strength;
		
		// Применяем урон к модифицированной силе (сила без учета погоды)
		const newModifiedStrength = Math.max(0, targetCard.modifiedStrength - damageValue);
		targetCard.modifiedStrength = newModifiedStrength;
		
		// ВАЖНО: Проверка на уничтожение - используем И modifiedStrength И currentStrength
		// Карта уничтожается, если:
		// 1. modifiedStrength (реальная сила) стала 0, ИЛИ
		// 2. currentStrength (текущая сила) меньше или равна damageValue (для карт под погодой с усилением)
		const shouldBeDestroyed = (targetCard.modifiedStrength <= 0) || 
								  (targetCard.underWeather && currentDisplayStrength <= damageValue);
		
		if (shouldBeDestroyed) {
			// Карта уничтожена - удаляем с поля
			const rowState = this.gameState.opponent.rows[row];
			const cardIndex = rowState.cards.findIndex(c => c.id === targetCard.id);
			if (cardIndex !== -1) {
				const destroyedCard = { ...rowState.cards[cardIndex] };
				rowState.cards.splice(cardIndex, 1);
				this.gameState.opponent.discard.push(destroyedCard);
				
				// Создаем визуальный эффект уничтожения
				this.createDestroyVisualEffect(targetCard, row);
				
				setTimeout(() => {
					if (window.gameModule) {
						window.gameModule.removeCardFromBoardVisual(targetCard, row, 'opponent');
					}
				}, 500);
			}
		} else {
			// Карта не уничтожена, обновляем отображение
			this.createDamageVisualEffect(targetCard, row, damageValue);
			
			// Если карта НЕ под погодой, обновляем текущую силу
			if (!targetCard.underWeather) {
				targetCard.currentStrength = newModifiedStrength;
				targetCard.strength = newModifiedStrength;
			} else {
				// Если карта под погодой, текущая сила остается 1 (или 1+усиление),
				// но modifiedStrength уже обновлен для будущего восстановления
				// НЕ меняем currentStrength здесь
			}
			
			if (window.gameModule) {
				window.gameModule.updateCardStrengthDisplay(targetCard, row, 'opponent');
			}
		}
		
		if (window.gameModule) {
			window.gameModule.updateRowStrength(row, 'opponent');
			window.gameModule.displayPlayerDiscard();
			window.gameModule.displayOpponentDiscard();
			window.gameModule.completeCardPlay();
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_damage');
		}
		
		this.cancelDamageSelection();
	},

	startArtifactBoostPlacement: function(card) {
		this.gameState.selectingRow = true;
		this.gameState.placementType = 'artifact_boost';
		this.gameState.boostCard = card;
		
		const ability = card.ability;
		
		if (ability === 'boost_near_1' || ability === 'boost_near_2' || ability === 'boost_near_3' ||
			ability === 'boost_near_4' || ability === 'boost_near_5') {
			// Для усиления соседей - выбираем позицию в ряду
			this.highlightAvailableSlotsForNearBoost(card);
		} else if (ability === 'boost_1' || ability === 'boost_2' || ability === 'boost_3' ||
				   ability === 'boost_4' || ability === 'boost_5') {
			// Для усиления карты - выбираем карту для усиления
			this.highlightAvailableCardsForBoost(card);
		} else {
			this.cancelCardSelection();
		}
	},

	highlightAvailableCardsForBoost: function(card) {
		const rows = ['close', 'ranged', 'siege'];
		let hasAvailableCards = false;
		const boostMatch = card.ability.match(/boost_(\d+)/);
		const boostValue = boostMatch ? parseInt(boostMatch[1]) : 1;
		
		rows.forEach(row => {
			const rowState = this.gameState.player.rows[row];
			const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
			
			if (!rowElement) return;
			
			rowState.cards.forEach((unitCard, index) => {
				if (unitCard.type === 'unit' && !this.isHeroCard(unitCard)) {
					const cardElement = this.getCardElementOnBoardImproved(unitCard, row, rowElement);
					if (cardElement) {
						cardElement.classList.add('boost-target');
						cardElement.dataset.boostValue = boostValue;
						this.setupCardBoostSelectionHandler(cardElement, unitCard, row, index);
						hasAvailableCards = true;
					} else {
						const allCards = rowElement.querySelectorAll('.board-card');
						for (let i = 0; i < allCards.length; i++) {
							const el = allCards[i];
							const strengthEl = el.querySelector('.board-card-strength');
							if (strengthEl && !el.classList.contains('artifact')) {
								const existingCardId = el.dataset.cardId;
								if (existingCardId === unitCard.id) {
									el.classList.add('boost-target');
									el.dataset.boostValue = boostValue;
									this.setupCardBoostSelectionHandler(el, unitCard, row, index);
									hasAvailableCards = true;
									break;
								}
							}
						}
					}
				}
			});
		});
		
		if (!hasAvailableCards) {
			this.showMessage('Нет карт для усиления!');
			this.cancelCardSelection();
		}
	},

	getCardElementOnBoardImproved: function(card, row, rowElement) {
		if (!rowElement) {
			rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
			if (!rowElement) return null;
		}
		
		if (card.uniqueId) {
			const uniqueElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			if (uniqueElement) return uniqueElement;
		}
		
		const cardElements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
		if (cardElements.length === 1) return cardElements[0];
		
		if (cardElements.length > 1) {
			const rowState = this.gameState.player.rows[row];
			const positionInRow = rowState.cards.findIndex(c => 
				c.id === card.id && c.uniqueId === card.uniqueId
			);
			if (positionInRow !== -1 && cardElements[positionInRow]) {
				return cardElements[positionInRow];
			}
			return cardElements[0];
		}
		
		return null;
	},

	highlightAvailableSlotsForNearBoost: function(card) {
		const rows = ['close', 'ranged', 'siege'];
		let hasAvailableSlots = false;
		
		rows.forEach(row => {
			const rowState = this.gameState.player.rows[row];
			const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
			
			if (!rowElement || rowState.cards.length >= 9) return;
			
			// Подсвечиваем все пустые позиции в ряду
			for (let i = 0; i <= rowState.cards.length; i++) {
				// Проверяем, есть ли соседи для усиления
				const hasLeftNeighbor = i > 0 && 
					rowState.cards[i - 1].type === 'unit' && 
					!this.isHeroCard(rowState.cards[i - 1]);
				
				const hasRightNeighbor = i < rowState.cards.length && 
					rowState.cards[i].type === 'unit' && 
					!this.isHeroCard(rowState.cards[i]);
				
				if (hasLeftNeighbor || hasRightNeighbor) {
					// Создаем виртуальный элемент для позиции
					const positionMarker = this.createPositionMarker(row, i);
					positionMarker.classList.add('boost-position-target');
					this.setupPositionBoostSelectionHandler(positionMarker, row, i);
					hasAvailableSlots = true;
				}
			}
		});
		
		if (!hasAvailableSlots) {
			this.showMessage('Нет подходящих позиций для усиления соседей!');
			this.cancelCardSelection();
		}
	},

	createPositionMarker: function(row, position) {
		const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
		if (!rowElement) return null;
		
		// Получаем все карты в ряду
		const cardsInRow = Array.from(rowElement.querySelectorAll('.board-card'));
		
		// Если в ряду нет карт - маркер не нужен
		if (cardsInRow.length === 0) {
			return null;
		}
		
		// Проверяем, есть ли соседи для этой позиции
		const rowState = this.gameState.player.rows[row];
		const hasLeftNeighbor = position > 0 && 
			rowState.cards[position - 1]?.type === 'unit' && 
			!this.isHeroCard(rowState.cards[position - 1]);
		
		const hasRightNeighbor = position < rowState.cards.length && 
			rowState.cards[position]?.type === 'unit' && 
			!this.isHeroCard(rowState.cards[position]);
		
		// Если нет соседей - маркер не нужен
		if (!hasLeftNeighbor && !hasRightNeighbor) {
			return null;
		}
		
		const marker = document.createElement('div');
		marker.className = 'position-marker boost-position-marker';
		marker.dataset.row = row;
		marker.dataset.position = position;
		
		// Убедимся, что ряд имеет относительное позиционирование
		rowElement.style.position = 'relative';
		
		// Определяем позицию маркера
		let leftPosition = 0;
		
		if (position === 0) {
			// Маркер перед первой картой
			const firstCard = cardsInRow[0];
			if (firstCard) {
				const cardRect = firstCard.getBoundingClientRect();
				const rowRect = rowElement.getBoundingClientRect();
				leftPosition = (cardRect.left - rowRect.left) - 20; // Слева от карты
			}
		} else if (position >= cardsInRow.length) {
			// Маркер после последней карты
			const lastCard = cardsInRow[cardsInRow.length - 1];
			if (lastCard) {
				const cardRect = lastCard.getBoundingClientRect();
				const rowRect = rowElement.getBoundingClientRect();
				leftPosition = (cardRect.right - rowRect.left) - 15; // Справа от карты
			}
		} else {
			// Маркер между картами
			const leftCard = cardsInRow[position - 1];
			const rightCard = cardsInRow[position];
			
			if (leftCard && rightCard) {
				const leftCardRect = leftCard.getBoundingClientRect();
				const rightCardRect = rightCard.getBoundingClientRect();
				const rowRect = rowElement.getBoundingClientRect();
				
				// Средняя точка между картами
				const middle = ((leftCardRect.right + rightCardRect.left) / 2) - rowRect.left;
				leftPosition = middle - 15; // Центрируем маркер
			}
		}
		
		// Ограничиваем позицию в пределах ряда
		const rowWidth = rowElement.offsetWidth;
		leftPosition = Math.max(10, Math.min(leftPosition, rowWidth - 40));
		
		// Устанавливаем стили
		marker.style.position = 'absolute';
		marker.style.left = `${leftPosition}px`;
		marker.style.top = '50%';
		marker.style.transform = 'translateY(-50%)';
		marker.style.width = '30px';
		marker.style.height = '60px';
		marker.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
		marker.style.border = '2px dashed #00ff00';
		marker.style.borderRadius = '5px';
		marker.style.zIndex = '100'; // Выше карт
		marker.style.cursor = 'pointer';
		marker.style.transition = 'all 0.3s ease';
		marker.style.pointerEvents = 'auto';
		marker.style.boxSizing = 'border-box';
		
		rowElement.appendChild(marker);
		
		// Эффекты при наведении
		marker.addEventListener('mouseenter', () => {
			marker.style.backgroundColor = 'rgba(0, 255, 0, 0.4)';
			marker.style.border = '1px solid green';
			marker.style.boxShadow = '0 0 15px 5px rgba(0, 255, 0, 0.5)';
			marker.style.transform = 'translateY(-50%) scale(1.01)';
			marker.style.zIndex = '101'; // Еще выше при наведении
			
			// Подсветка соседних карт
			if (hasLeftNeighbor && position > 0) {
				const leftCard = cardsInRow[position - 1];
				if (leftCard) {
					leftCard.classList.add('neighbor-highlight');
					leftCard.style.zIndex = '99'; // Чуть ниже маркера
				}
			}
			
			if (hasRightNeighbor && position < cardsInRow.length) {
				const rightCard = cardsInRow[position];
				if (rightCard) {
					rightCard.classList.add('neighbor-highlight');
					rightCard.style.zIndex = '99'; // Чуть ниже маркера
				}
			}
		});
		
		marker.addEventListener('mouseleave', () => {
			marker.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
			marker.style.border = '1px dashed green';
			marker.style.boxShadow = 'none';
			marker.style.transform = 'translateY(-50%) scale(1)';
			marker.style.zIndex = '100';
			
			// Убираем подсветку соседних карт
			if (hasLeftNeighbor && position > 0) {
				const leftCard = cardsInRow[position - 1];
				if (leftCard) {
					leftCard.classList.remove('neighbor-highlight');
					leftCard.style.zIndex = '';
				}
			}
			
			if (hasRightNeighbor && position < cardsInRow.length) {
				const rightCard = cardsInRow[position];
				if (rightCard) {
					rightCard.classList.remove('neighbor-highlight');
					rightCard.style.zIndex = '';
				}
			}
		});
		
		return marker;
	},

	removeAllPositionMarkers: function() {
		const markers = document.querySelectorAll('.boost-position-marker');
		markers.forEach(marker => {
			marker.remove();
		});
		
		// Убираем подсветку с карт
		const highlightedCards = document.querySelectorAll('.neighbor-highlight');
		highlightedCards.forEach(card => {
			card.classList.remove('neighbor-highlight');
			card.style.zIndex = '';
		});
		
		// Восстанавливаем стандартные стили рядов
		const rows = ['close', 'ranged', 'siege'];
		rows.forEach(row => {
			const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
			if (rowElement) {
				// Убираем position: relative, если оно было добавлено
				rowElement.style.position = '';
			}
		});
	},

	setupCardBoostSelectionHandler: function(cardElement, targetCard, row, position) {
		const clickHandler = (event) => {
			if (this.gameState.selectingRow && this.gameState.placementType === 'artifact_boost') {
				// Определяем, куда кликнул игрок (левая или правая половина карты)
				const rect = cardElement.getBoundingClientRect();
				const clickX = event.clientX - rect.left;
				const cardWidth = rect.width;
				
				// Если клик в левой половине - размещаем слева, в правой - справа
				const placeLeft = clickX < cardWidth / 2;
				
				this.applyArtifactCardBoost(this.gameState.boostCard, targetCard, row, position, placeLeft);
				cardElement.removeEventListener('click', clickHandler);
			}
		};
		
		cardElement.addEventListener('click', clickHandler);
		
		if (!this.gameState.boostSelectionHandlers) {
			this.gameState.boostSelectionHandlers = [];
		}
		this.gameState.boostSelectionHandlers.push({ 
			element: cardElement, 
			handler: clickHandler,
			card: targetCard,
			row: row,
			position: position
		});
	},

	setupPositionBoostSelectionHandler: function(positionMarker, row, position) {
		const clickHandler = () => {
			if (this.gameState.selectingRow && this.gameState.placementType === 'artifact_boost') {
				this.applyArtifactNearBoost(this.gameState.boostCard, row, position);
				positionMarker.remove();
			}
		};
		
		positionMarker.addEventListener('click', clickHandler);
		
		if (!this.gameState.positionSelectionHandlers) {
			this.gameState.positionSelectionHandlers = [];
		}
		this.gameState.positionSelectionHandlers.push({ 
			element: positionMarker, 
			handler: clickHandler,
			row: row,
			position: position
		});
	},

	applyArtifactCardBoost: function(artifactCard, targetCard, row, position, placeLeft = false) {
		const ability = artifactCard.ability;
		const boostMatch = ability.match(/boost_(\d+)/);
		const boostValue = boostMatch ? parseInt(boostMatch[1]) : 1;
		
		const rowState = this.gameState.player.rows[row];
		
		if (rowState.cards.length >= 9) {
			this.showMessage('В ряду максимальное количество карт!');
			return;
		}
		
		// Определяем позицию для артефакта
		let insertPosition;
		if (placeLeft) {
			insertPosition = position; // Слева от целевой карты
		} else {
			insertPosition = position + 1; // Справа от целевой карты
		}
		
		// Усиливаем выбранную карту
		this.applyBoostToCard(targetCard, boostValue, row, 'player');
		
		// Размещаем артефакт в ряд
		const artifactCopy = { ...artifactCard };
		artifactCopy.owner = 'player';
		artifactCopy.row = row;
		
		artifactCopy.baseStrength = artifactCopy.strength;
		artifactCopy.modifiedStrength = artifactCopy.strength;
		artifactCopy.currentStrength = artifactCopy.strength;
		artifactCopy.underWeather = false;
		
		// СОХРАНЯЕМ ИНФОРМАЦИЮ О ТОМ, КАКУЮ КАРТУ УСИЛИЛ АРТЕФАКТ
		artifactCopy.boostedCardId = targetCard.id;
		artifactCopy.boostedCardUniqueId = targetCard.uniqueId;
		artifactCopy.boostValue = boostValue;
		
		rowState.cards.splice(insertPosition, 0, artifactCopy);
		
		this.removeCardFromHand(artifactCard);
		
		if (window.gameModule) {
			window.gameModule.displayCardOnRow(row, artifactCopy, 'player', insertPosition);
			window.gameModule.updateRowStrength(row, 'player');
			window.gameModule.completeCardPlay();
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_boost');
		}
		
		this.cancelArtifactBoostSelection();
	},

	applyArtifactNearBoost: function(artifactCard, row, position) {
		const ability = artifactCard.ability;
		const boostMatch = ability.match(/boost_near_(\d+)/);
		const boostValue = boostMatch ? parseInt(boostMatch[1]) : 1;
		
		const rowState = this.gameState.player.rows[row];
		
		if (rowState.cards.length >= 9) {
			this.showMessage('В ряду максимальное количество карт!');
			return;
		}
		
		let boostedCards = [];
		
		// Усиливаем карту слева
		if (position > 0) {
			const leftCard = rowState.cards[position - 1];
			if (leftCard.type === 'unit' && !this.isHeroCard(leftCard)) {
				this.applyBoostToCard(leftCard, boostValue, row, 'player');
				boostedCards.push({
					cardId: leftCard.id,
					uniqueId: leftCard.uniqueId,
					boostValue: boostValue
				});
			}
		}
		
		// Усиливаем карту справа
		if (position < rowState.cards.length) {
			const rightCard = rowState.cards[position];
			if (rightCard.type === 'unit' && !this.isHeroCard(rightCard)) {
				this.applyBoostToCard(rightCard, boostValue, row, 'player');
				boostedCards.push({
					cardId: rightCard.id,
					uniqueId: rightCard.uniqueId,
					boostValue: boostValue
				});
			}
		}
		
		if (boostedCards.length === 0) {
			this.showMessage('Рядом с этой позицией нет карт для усиления!');
			return;
		}
		
		// Размещаем артефакт в ряд на выбранной позиции
		const artifactCopy = { ...artifactCard };
		artifactCopy.owner = 'player';
		artifactCopy.row = row;
		
		artifactCopy.baseStrength = artifactCopy.strength;
		artifactCopy.modifiedStrength = artifactCopy.strength;
		artifactCopy.currentStrength = artifactCopy.strength;
		artifactCopy.underWeather = false;
		
		// СОХРАНЯЕМ ИНФОРМАЦИЮ ОБ УСИЛЕННЫХ КАРТАХ
		artifactCopy.boostedCards = boostedCards;
		
		rowState.cards.splice(position, 0, artifactCopy);
		
		this.removeCardFromHand(artifactCard);
		
		if (window.gameModule) {
			rowState.cards.forEach((card, index) => {
				if (card.type === 'unit') {
					window.gameModule.updateCardStrengthDisplay(card, row, 'player');
				}
			});
			window.gameModule.displayCardOnRow(row, artifactCopy, 'player', position);
			window.gameModule.updateRowStrength(row, 'player');
			window.gameModule.completeCardPlay();
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_boost');
		}
		
		this.cancelArtifactBoostSelection();
	},

	cancelArtifactBoostSelection: function() {
		// Убираем подсветку карт
		const highlightedCards = document.querySelectorAll('.boost-target, .neighbor-highlight');
		highlightedCards.forEach(card => {
			card.classList.remove('boost-target');
			card.classList.remove('neighbor-highlight');
		});
		
		// Убираем все маркеры позиций
		this.removeAllPositionMarkers();
		
		// Очищаем обработчики
		if (this.gameState.boostSelectionHandlers) {
			this.gameState.boostSelectionHandlers.forEach(({ element, handler }) => {
				element.removeEventListener('click', handler);
			});
			this.gameState.boostSelectionHandlers = [];
		}
		
		if (this.gameState.positionSelectionHandlers) {
			this.gameState.positionSelectionHandlers.forEach(({ element, handler }) => {
				element.removeEventListener('click', handler);
			});
			this.gameState.positionSelectionHandlers = [];
		}
		
		// Сбрасываем состояние
		this.cancelRowSelection();
	},

	removeAllPositionMarkers: function() {
		const markers = document.querySelectorAll('.boost-position-marker');
		markers.forEach(marker => {
			marker.remove();
		});
	},

	executeRowDamage: function(damageCard, row) {
		const damageValue = this.getDamageValueFromAbility(damageCard.ability);
		
		this.removeCardFromHand(damageCard);
		
		const damageCardCopy = { ...damageCard };
		this.gameState.player.discard.push(damageCardCopy);
		
		const rowState = this.gameState.opponent.rows[row];
		let destroyedCards = [];
		
		rowState.cards.forEach(card => {
			if (this.isHeroCard(card)) {
				return;
			}
			
			if (card.type === 'unit') {
				// Инициализируем поля для отслеживания состояний
				this.initializeCardFields(card);
				
				// Сохраняем текущую силу до применения урона
				const currentDisplayStrength = card.currentStrength !== undefined ? 
					card.currentStrength : card.strength;
				
				// Применяем урон к модифицированной силе
				const newModifiedStrength = Math.max(0, card.modifiedStrength - damageValue);
				card.modifiedStrength = newModifiedStrength;
				
				// ВАЖНО: Проверка на уничтожение
				const shouldBeDestroyed = (card.modifiedStrength <= 0) || 
										  (card.underWeather && currentDisplayStrength <= damageValue);
				
				if (shouldBeDestroyed) {
					destroyedCards.push(card);
				} else {
					// Если карта НЕ под погодой, обновляем текущую силу
					if (!card.underWeather) {
						card.currentStrength = newModifiedStrength;
						card.strength = newModifiedStrength;
					}
					
					this.createDamageVisualEffect(card, row, damageValue);
					
					if (window.gameModule) {
						window.gameModule.updateCardStrengthDisplay(card, row, 'opponent');
					}
				}
			}
		});
		
		// Удаляем уничтоженные карты
		for (let i = destroyedCards.length - 1; i >= 0; i--) {
			const destroyedCard = destroyedCards[i];
			const cardIndex = rowState.cards.findIndex(c => c.id === destroyedCard.id);
			
			if (cardIndex !== -1) {
				const destroyedCardCopy = { ...rowState.cards[cardIndex] };
				rowState.cards.splice(cardIndex, 1);
				this.gameState.opponent.discard.push(destroyedCardCopy);
				
				this.createDestroyVisualEffect(destroyedCard, row);
				
				setTimeout(() => {
					if (window.gameModule) {
						window.gameModule.removeCardFromBoardVisual(destroyedCard, row, 'opponent');
					}
				}, 500);
			}
		}
		
		if (window.gameModule) {
			window.gameModule.updateRowStrength(row, 'opponent');
			window.gameModule.displayPlayerDiscard();
			window.gameModule.displayOpponentDiscard();
			window.gameModule.completeCardPlay();
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_damage');
		}
		
		this.cancelDamageSelection();
	},

	createDamageVisualEffect: function(card, row, damageValue) {
		const rowElement = document.getElementById(`opponent${this.capitalizeFirst(row)}Row`);
		if (!rowElement) return;
		
		const cardElement = rowElement.querySelector(`[data-card-id="${card.id}"]`);
		if (!cardElement) return;
		
		// Создаем эффект урона
		const damageOverlay = document.createElement('div');
		damageOverlay.className = 'card-damage-overlay';
		damageOverlay.textContent = `-${damageValue}`;
		damageOverlay.style.cssText = `
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			color: red;
			font-size: 24px;
			font-weight: bold;
			text-shadow: 0 0 5px black;
			z-index: 100;
			pointer-events: none;
			animation: damageAnimation 0.8s ease-out forwards;
		`;
		
		cardElement.appendChild(damageOverlay);
		
		// Удаляем эффект через 0.8 секунды
		setTimeout(() => {
			if (damageOverlay.parentNode) {
				damageOverlay.remove();
			}
		}, 800);
	},

	cancelDamageSelection: function() {
		// Убираем подсветку целей
		this.removeDamageHighlights();
		
		// Очищаем обработчики
		if (this.gameState.damageSelectionHandlers) {
			this.gameState.damageSelectionHandlers.forEach(({ element, handler }) => {
				element.removeEventListener('click', handler);
			});
			this.gameState.damageSelectionHandlers = [];
		}
		
		if (this.gameState.rowDamageSelectionHandlers) {
			this.gameState.rowDamageSelectionHandlers.forEach(({ element, handler }) => {
				element.removeEventListener('click', handler);
			});
			this.gameState.rowDamageSelectionHandlers = [];
		}
		
		// Сбрасываем состояние
		this.cancelRowSelection();
	},

	removeDamageHighlights: function() {
		// Убираем подсветку карт
		const highlightedCards = document.querySelectorAll('.damage-target');
		highlightedCards.forEach(card => {
			card.classList.remove('damage-target');
			delete card.dataset.damageValue;
		});
		
		// Убираем подсветку рядов
		const highlightedRows = document.querySelectorAll('.row-damage-target');
		highlightedRows.forEach(row => {
			row.classList.remove('row-damage-target');
			delete row.dataset.damageValue;
		});
	},

	startDestroyArtifactPlacement: function(card) {
		this.gameState.selectingRow = true;
		this.gameState.placementType = 'destroy_artifact';
		this.gameState.destroyArtifactCard = card;
		this.highlightEnemyArtifacts();
	},

	highlightEnemyArtifacts: function() {
		const rows = ['close', 'ranged', 'siege'];
		
		rows.forEach(row => {
			const rowCards = this.gameState.opponent.rows[row].cards;
			
			rowCards.forEach((card, index) => {
				if (card.type === 'artifact') {
					const cardElement = this.getCardElementOnBoard(card, row, 'opponent');
					if (cardElement) {
						cardElement.classList.add('artifact-target');
						this.setupArtifactSelectionHandler(cardElement, card, row, 'artifact', index);
					}
				}
			});
		});
		
		const hasArtifacts = document.querySelectorAll('.artifact-target').length > 0;
		if (!hasArtifacts) {
			this.cancelCardSelection();
		}
	},

	setupArtifactSelectionHandler: function(element, card, row, type, position = null) {
		const clickHandler = () => {
			if (this.gameState.selectingRow && this.gameState.placementType === 'destroy_artifact') {
				this.executeArtifactDestroy(this.gameState.destroyArtifactCard, { card, row, type, position });
				element.removeEventListener('click', clickHandler);
			}
		};
		
		element.addEventListener('click', clickHandler);
		
		if (!this.gameState.artifactSelectionHandlers) {
			this.gameState.artifactSelectionHandlers = [];
		}
		this.gameState.artifactSelectionHandlers.push({ 
			element: element, 
			handler: clickHandler,
			card: card,
			row: row,
			type: type
		});
	},

	executeArtifactDestroy: function(destroyCard, artifactData) {
		const { card: targetCard, row: targetRow, type: targetType, position } = artifactData;
		
		// Удаляем карту из руки
		this.removeCardFromHand(destroyCard);
		
		// Добавляем карту в сброс игрока
		const destroyCardCopy = { ...destroyCard };
		this.gameState.player.discard.push(destroyCardCopy);
		
		// Удаляем только артефакты из ряда (НЕ тактики)
		if (targetType === 'artifact') {
			const rowState = this.gameState.opponent.rows[targetRow];
			const cardIndex = rowState.cards.findIndex(c => c.id === targetCard.id);
			
			if (cardIndex !== -1) {
				// Получаем информацию об артефакте до его удаления
				const artifactCard = rowState.cards[cardIndex];
				const artifactAbility = artifactCard.ability;
				
				// Проверяем, усиливал ли артефакт карты
				if (artifactAbility && artifactAbility.startsWith('boost_')) {
					// Отменяем усиление для соседних карт или конкретной карты
					this.revertArtifactBoost(artifactCard, targetRow, cardIndex);
				}
				
				// Создаем копию для сброса
				const destroyedCard = { ...rowState.cards[cardIndex] };
				
				// Удаляем из ряда
				rowState.cards.splice(cardIndex, 1);
				
				// Добавляем ТОЛЬКО ОДНУ копию в сброс противника
				this.gameState.opponent.discard.push(destroyedCard);
				
				// Визуальный эффект
				this.createArtifactDestroyEffect(targetCard, targetRow, targetType);
				
				// Обновляем отображение
				if (window.gameModule) {
					// Удаляем карту с поля через задержку
					setTimeout(() => {
						window.gameModule.removeCardFromBoardVisual(targetCard, targetRow, 'opponent');
					}, 500);
					
					// Обновляем все карты в ряду (сила могла измениться)
					rowState.cards.forEach(unitCard => {
						if (unitCard.type === 'unit') {
							window.gameModule.updateCardStrengthDisplay(unitCard, targetRow, 'opponent');
						}
					});
					
					// Обновляем силу ряда
					window.gameModule.updateRowStrength(targetRow, 'opponent');
				}
			}
		}
		
		// Обновляем сбросы
		if (window.gameModule) {
			window.gameModule.displayPlayerDiscard();
			window.gameModule.displayOpponentDiscard();
			
			// Завершаем ход
			window.gameModule.completeCardPlay();
		}
		
		// Воспроизводим звук
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('artefact');
			setTimeout(() => {
				audioManager.playSound('card_destroy');
			}, 300);
		}
		
		// Сбрасываем состояние
		this.cancelArtifactSelection();
	},

	revertArtifactBoost: function(artifactCard, row, artifactPosition) {
		const rowState = this.gameState.opponent.rows[row];
		
		// Проверяем, есть ли сохранённая информация об усиленных картах
		if (artifactCard.boostedCards && Array.isArray(artifactCard.boostedCards)) {
			// Это артефакт типа boost_near_
			artifactCard.boostedCards.forEach(boostInfo => {
				const boostedCard = this.findCardById(rowState.cards, boostInfo.cardId, boostInfo.uniqueId);
				if (boostedCard) {
					this.removeBoostFromCard(boostedCard, boostInfo.boostValue, row);
				}
			});
		} else if (artifactCard.boostedCardId) {
			// Это артефакт типа boost_
			const boostedCard = this.findCardById(rowState.cards, artifactCard.boostedCardId, artifactCard.boostedCardUniqueId);
			if (boostedCard) {
				this.removeBoostFromCard(boostedCard, artifactCard.boostValue, row);
			}
		}
	},

	findCardById: function(cards, cardId, uniqueId) {
		if (uniqueId) {
			return cards.find(c => c.uniqueId === uniqueId) || 
				   cards.find(c => c.id === cardId);
		}
		return cards.find(c => c.id === cardId);
	},

	removeBoostFromCard: function(card, boostValue, row) {
		this.initializeCardFields(card);
		
		// Уменьшаем modifiedStrength на значение усиления
		card.modifiedStrength = Math.max(card.baseStrength || 0, card.modifiedStrength - boostValue);
		
		// Обновляем currentStrength
		if (!card.underWeather) {
			card.currentStrength = card.modifiedStrength;
			card.strength = card.modifiedStrength;
		}
		
		// Визуальный эффект снятия усиления (красный)
		this.createBoostRemoveVisualEffect(card, row, boostValue);
	},

	createBoostRemoveVisualEffect: function(card, row, boostValue) {
		const rowElement = document.getElementById(`opponent${this.capitalizeFirst(row)}Row`);
		if (!rowElement) return;
		
		let cardElement = null;
		
		if (card.uniqueId) {
			cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
		}
		
		if (!cardElement) {
			const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
			if (elements.length > 0) {
				cardElement = elements[0];
			}
		}
		
		if (!cardElement) return;
		
		// Создаем эффект снятия усиления (красный цвет)
		const removeOverlay = document.createElement('div');
		removeOverlay.className = 'card-boost-remove-overlay';
		removeOverlay.textContent = `-${boostValue}`;
		removeOverlay.style.cssText = `
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			color: #ff4444;
			font-size: 24px;
			font-weight: bold;
			text-shadow: 0 0 5px black;
			z-index: 100;
			pointer-events: none;
			animation: boostRemoveAnimation 0.8s ease-out forwards;
		`;
		
		cardElement.appendChild(removeOverlay);
		
		setTimeout(() => {
			if (removeOverlay.parentNode) {
				removeOverlay.remove();
			}
		}, 800);
	},

	createArtifactDestroyEffect: function(card, row, type) {
		let targetElement;
		
		if (type === 'tactic') {
			const tacticSlot = document.getElementById(`opponent${this.capitalizeFirst(row)}Tactics`);
			if (tacticSlot) {
				targetElement = tacticSlot.querySelector(`[data-card-id="${card.id}"]`);
			}
		} else {
			const rowElement = document.getElementById(`opponent${this.capitalizeFirst(row)}Row`);
			if (rowElement) {
				targetElement = rowElement.querySelector(`[data-card-id="${card.id}"]`);
			}
		}
		
		if (!targetElement) return;
		
		// Создаем эффект уничтожения
		const destroyOverlay = document.createElement('div');
		destroyOverlay.className = 'artifact-destroy-overlay';
		destroyOverlay.style.cssText = `
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: url('card/destroy_card.jpg') center/cover no-repeat;
			z-index: 100;
			border-radius: 5px;
			pointer-events: none;
			animation: destroyArtifactAnimation 1s ease-out forwards;
		`;
		
		targetElement.appendChild(destroyOverlay);
	},

	cancelArtifactSelection: function() {
		// Убираем подсветку целей
		this.removeArtifactHighlights();
		
		// Очищаем обработчики
		if (this.gameState.artifactSelectionHandlers) {
			this.gameState.artifactSelectionHandlers.forEach(({ element, handler }) => {
				element.removeEventListener('click', handler);
			});
			this.gameState.artifactSelectionHandlers = [];
		}
		
		// Сбрасываем состояние
		this.cancelRowSelection();
	},

	removeArtifactHighlights: function() {
		const highlightedArtifacts = document.querySelectorAll('.artifact-target');
		highlightedArtifacts.forEach(artifact => {
			artifact.classList.remove('artifact-target');
		});
	},

	startDestroyCardPlacement: function(card) {
		// Находим самые сильные карты на поле у обоих игроков
		const strongestCards = this.findStrongestCardsOnBoard();
		
		if (strongestCards.length === 0) {
			this.showMessage('На поле нет карт для уничтожения!');
			this.cancelCardSelection();
			return;
		}
		
		// Применяем Казнь
		this.executeDestroyCard(card, strongestCards);
	},

	findStrongestEnemyCard: function() {
		const rows = ['close', 'ranged', 'siege'];
		let strongestCard = null;
		let maxStrength = -1;
		let cardRow = null;
		
		rows.forEach(row => {
			const rowCards = this.gameState.opponent.rows[row].cards;
			rowCards.forEach(card => {
				if (this.isHeroCard(card)) {
					return;
				}
				
				if (card.type === 'unit') {
					// Используем currentStrength для определения силы
					const strength = card.currentStrength !== undefined ? 
						card.currentStrength : (card.strength || 0);
					
					if (strength > maxStrength) {
						maxStrength = strength;
						strongestCard = card;
						cardRow = row;
					}
				}
			});
		});
		
		return strongestCard ? { card: strongestCard, row: cardRow } : null;
	},

	executeDestroyCard: function(destroyCard, strongestCards) {
		// Удаляем Казнь из руки
		this.removeCardFromHand(destroyCard);
		
		// Добавляем Казнь в сброс игрока
		const destroyCardCopy = { ...destroyCard };
		this.gameState.player.discard.push(destroyCardCopy);
		
		let destroyedCount = 0;
		
		// Уничтожаем все карты-цели (у обоих игроков)
		strongestCards.forEach(({ card: targetCard, row: targetRow, owner }) => {
			// Создаем визуальный эффект уничтожения
			this.createDestroyVisualEffectForOwner(targetCard, targetRow, owner);
			
			// Удаляем карту из ряда
			const rowState = this.gameState[owner].rows[targetRow];
			const cardIndex = rowState.cards.findIndex(c => 
				c.id === targetCard.id && 
				(c.uniqueId === undefined || c.uniqueId === targetCard.uniqueId)
			);
			
			if (cardIndex !== -1) {
				const destroyedCard = { ...rowState.cards[cardIndex] };
				rowState.cards.splice(cardIndex, 1);
				this.gameState[owner].discard.push(destroyedCard);
				destroyedCount++;
				
				if (window.gameModule) {
					setTimeout(() => {
						window.gameModule.removeCardFromBoardVisual(targetCard, targetRow, owner);
						window.gameModule.updateRowStrength(targetRow, owner);
					}, 500);
				}
			}
		});
		
		// Обновляем сбросы и завершаем ход
		if (window.gameModule) {
			setTimeout(() => {
				window.gameModule.displayPlayerDiscard();
				window.gameModule.displayOpponentDiscard();
				window.gameModule.updateTotalScoreDisplays();
				window.gameModule.completeCardPlay();
			}, 600);
		}
		
		// Воспроизводим звук
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('scorch');
		}
		
		// Сбрасываем состояние
		this.cancelCardSelection();
	},

	createDestroyVisualEffect: function(card, row) {
		const rowElement = document.getElementById(`opponent${this.capitalizeFirst(row)}Row`);
		if (!rowElement) return;
		
		const cardElement = rowElement.querySelector(`[data-card-id="${card.id}"]`);
		if (!cardElement) return;
		
		// Создаем эффект уничтожения
		const destroyOverlay = document.createElement('div');
		destroyOverlay.className = 'card-destroy-overlay';
		destroyOverlay.style.cssText = `
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: url('card/neutral/scorch.jpg') center/cover no-repeat;
			z-index: 100;
			border-radius: 5px;
			pointer-events: none;
			animation: destroyCardAnimation 1s ease-out forwards;
		`;
		
		cardElement.appendChild(destroyOverlay);
		
		// Воспроизводим звук уничтожения
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_destroy');
		}
	},

	createDestroyVisualEffectForOwner: function(card, row, owner) {
		const rowElement = document.getElementById(`${owner}${this.capitalizeFirst(row)}Row`);
		if (!rowElement) return;
		
		let cardElement = null;
		if (card.uniqueId) {
			cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
		}
		if (!cardElement) {
			cardElement = rowElement.querySelector(`[data-card-id="${card.id}"]`);
		}
		if (!cardElement) return;
		
		const destroyOverlay = document.createElement('div');
		destroyOverlay.className = 'card-destroy-overlay';
		destroyOverlay.style.cssText = `
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: url('card/neutral/scorch.jpg') center/cover no-repeat;
			z-index: 100;
			border-radius: 5px;
			pointer-events: none;
			animation: destroyCardAnimation 1s ease-out forwards;
		`;
		
		cardElement.appendChild(destroyOverlay);
	},
	
	startDecoyCardPlacement: function(card) {
		this.gameState.selectingRow = true;
		this.gameState.placementType = 'decoy';
		this.gameState.decoyCard = card;
		this.highlightAvailableUnitsForDecoy();
	},

	highlightAvailableUnitsForDecoy: function() {
		const rows = ['close', 'ranged', 'siege'];
		
		rows.forEach(row => {
			const rowCards = this.gameState.player.rows[row].cards;
			
			rowCards.forEach((unitCard, index) => {
				if (unitCard.tags && (unitCard.tags.includes('hero') || unitCard.tags.includes('герой'))) {
					return;
				}
				
				if (unitCard.type === 'unit') {
					const cardKey = unitCard.uniqueId || `${unitCard.id}_${row}_${index}`;
					const cardElement = this.getCardElementOnBoard(unitCard, row, 'player', cardKey);
					if (cardElement) {
						cardElement.classList.add('decoy-target');
						cardElement.dataset.cardKey = cardKey;
						this.setupDecoySelectionHandler(cardElement, unitCard, row, cardKey);
					}
				}
			});
		});
	},

	getCardElementOnBoard: function(card, row, owner, cardKey = null) {
		const rowElement = document.getElementById(`${owner}${this.capitalizeFirst(row)}Row`);
		if (!rowElement) return null;
		
		if (cardKey) {
			const cardElement = rowElement.querySelector(`[data-card-key="${cardKey}"]`);
			if (cardElement) return cardElement;
		}
		
		const cardElements = rowElement.querySelectorAll('.board-card');
		for (let cardElement of cardElements) {
			if (cardElement.dataset.cardId === card.id) {
				const existingKey = cardElement.dataset.cardKey;
				if (!existingKey || existingKey === cardKey) {
					return cardElement;
				}
			}
		}
		return null;
	},

	setupDecoySelectionHandler: function(cardElement, card, row, cardKey) {
		const clickHandler = () => {
			if (this.gameState.selectingRow && this.gameState.placementType === 'decoy') {
				this.placeDecoyCard(this.gameState.decoyCard, card, row, cardKey);
				cardElement.removeEventListener('click', clickHandler);
			}
		};
		
		cardElement.addEventListener('click', clickHandler);
		
		if (!this.gameState.decoySelectionHandlers) {
			this.gameState.decoySelectionHandlers = [];
		}
		this.gameState.decoySelectionHandlers.push({ 
			element: cardElement, 
			handler: clickHandler,
			card: card,
			row: row,
			cardKey: cardKey
		});
	},

	placeDecoyCard: function(decoyCard, targetCard, row, cardKey) {
		const rowState = this.gameState.player.rows[row];
		const targetIndex = rowState.cards.findIndex(card => {
			const cardUniqueKey = card.uniqueId || `${card.id}_${row}_${rowState.cards.indexOf(card)}`;
			return cardKey === cardUniqueKey || card.id === targetCard.id;
		});
		
		if (targetIndex === -1) {
			this.showMessage('Карта не найдена в ряду!');
			return;
		}
		
		const cardCopy = { ...targetCard };
		cardCopy.playedThisRound = false;
		
		delete cardCopy.summonedByFlock;
		delete cardCopy.usedFlockTag;
		delete cardCopy.completeCalled;
		delete cardCopy.uniqueId;           
		delete cardCopy._displayStrength;
		delete cardCopy.currentStrength;    
		delete cardCopy.modifiedStrength;  
		delete cardCopy.underWeather;
		delete cardCopy.owner;
		delete cardCopy.row;
		delete cardCopy.positionInRow;
		
		if (cardCopy.baseStrength !== undefined) {
			cardCopy.strength = cardCopy.baseStrength;
			cardCopy.baseStrength = undefined;  
		} else if (cardCopy.originalStrength !== undefined) {
			cardCopy.strength = cardCopy.originalStrength;
			delete cardCopy.originalStrength;
		}
		
		this.removeCardFromHand(decoyCard);
		
		this.gameState.player.hand.push(cardCopy);
		
		const placedDecoy = { ...decoyCard };
		placedDecoy.owner = 'player';
		placedDecoy.row = row;
		
		delete placedDecoy.strength;
		delete placedDecoy.currentStrength;
		delete placedDecoy.modifiedStrength;
		delete placedDecoy.baseStrength;
		delete placedDecoy._displayStrength;
		delete placedDecoy.originalStrength;
		
		placedDecoy.underWeather = false;
		placedDecoy.uniqueId = `decoy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		
		rowState.cards[targetIndex] = placedDecoy;
		
		if (window.gameModule) {
			const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
			const oldCardElement = this.getCardElementOnBoard(targetCard, row, 'player', cardKey);
			
			if (oldCardElement) {
				const cardRect = oldCardElement.getBoundingClientRect();
				const rowRect = rowElement.getBoundingClientRect();
				const relativePosition = cardRect.left - rowRect.left;
				
				oldCardElement.remove();
				
				const decoyElement = window.gameModule.createBoardCardElement(placedDecoy, 'special');
				
				const strengthElement = decoyElement.querySelector('.board-card-strength');
				if (strengthElement) {
					strengthElement.remove();
				}
				
				const cardsInRow = Array.from(rowElement.children);
				let insertIndex = 0;
				
				for (let i = 0; i < cardsInRow.length; i++) {
					const cardEl = cardsInRow[i];
					const elRect = cardEl.getBoundingClientRect();
					const elRelativePosition = elRect.left - rowRect.left;
					
					if (elRelativePosition > relativePosition) {
						break;
					}
					insertIndex++;
				}
				
				if (insertIndex < cardsInRow.length) {
					rowElement.insertBefore(decoyElement, cardsInRow[insertIndex]);
				} else {
					rowElement.appendChild(decoyElement);
				}
			} else {
				window.gameModule.displayCardOnRow(row, placedDecoy, 'player', targetIndex);
			}
			
			window.gameModule.displayPlayerHand();
			window.gameModule.updateRowStrength(row);
			window.gameModule.completeCardPlay();
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('artefact');
		}
		
		this.cancelCardSelection();
	},

	isCardUnderWeather: function(card, row) {
		// Проверяем флаг underWeather у карты
		if (card.underWeather === true) {
			return true;
		}
		
		// Также проверяем эффекты погоды на ряду
		if (!this.gameState || !this.gameState.weather) return false;
		
		const rowWeather = this.gameState.weather.effects[row];
		if (!rowWeather) return false;
		
		const weatherEffect = this.getWeatherEffectForCard(rowWeather.card);
		if (weatherEffect && weatherEffect.rows) {
			return weatherEffect.rows.includes(row);
		}
		
		return false;
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

    playWeatherCard: function(card) {
		const isClearWeather = this.isClearWeatherCard(card);
	
		if (isClearWeather) {
			const hasSameClearWeather = this.gameState.weather.cards.some(wc => 
				wc.name === card.name || wc.id === card.id
			);
			if (hasSameClearWeather) {
				this.cancelCardSelection();
				return;
			}
		} 
		else {
			const sameWeatherExists = this.gameState.weather.cards.some(weatherCard => {
				if (this.isClearWeatherCard(weatherCard)) return false;
				return weatherCard.name === card.name;
			});
			if (sameWeatherExists) {
				this.cancelCardSelection();
				return;
			}
			const weatherEffect = this.getWeatherEffectForCard(card);
			if (weatherEffect && weatherEffect.rows) {
				const targetRows = weatherEffect.rows;
				if (targetRows.length > 1) {
					let occupiedRowsCount = 0;
					targetRows.forEach(row => {
						if (this.gameState.weather.effects[row]) {
							occupiedRowsCount++;
						}
					});
					if (occupiedRowsCount === targetRows.length) {
						this.cancelCardSelection();
						return;
					}
				}
				else if (targetRows.length === 1) {
					const targetRow = targetRows[0];
					if (this.gameState.weather.effects[targetRow]) {
						this.cancelCardSelection();
						return;
					}
				}
			}
			const regularWeatherCards = this.gameState.weather.cards.filter(wc => 
				!this.isClearWeatherCard(wc)
			);
			const hasClearWeather = this.gameState.weather.cards.some(wc => 
				this.isClearWeatherCard(wc)
			);
		
			if (!hasClearWeather && regularWeatherCards.length >= this.gameState.weather.maxWeatherCards) {
				this.cancelCardSelection();
				return;
			}
		}
		card.owner = 'player';

		if (isClearWeather) {
			this.handleClearWeather(card);
		} else {
			this.handleRegularWeather(card);
		}

		this.removeCardFromHand(card);
		if (window.gameModule) {
			window.gameModule.displayWeatherCards();
			window.gameModule.completeCardPlay();
		}
	},
    
    isClearWeatherCard: function(card) {
        return card.name === 'Чистое небо' || card.id === 'neutral_special_4';
    },
    
    handleClearWeather: function(card) {
        if (window.gameModule) {
            window.gameModule.handleClearWeather(card);
        }
    },
    
    handleRegularWeather: function(card) {
        if (window.gameModule) {
            window.gameModule.handleRegularWeather(card);
        }
    },
    
    startTacticCardPlacement: function(card) {
        this.gameState.selectingRow = true;
        this.gameState.placementType = 'tactic';
        this.highlightAvailableTacticSlots();
    },
    
    startUnitCardPlacement: function(card) {
        this.gameState.selectingRow = true;
        this.gameState.placementType = 'unit';
        this.highlightAvailableRows(card);
    },
    
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
				// Определяем тип карты
				const card = this.gameState.selectedCard;
				
				if (card.type === 'tactic') {
					if (card.ability && card.ability.startsWith('boost_')) {
						// Это карта усиления
						if (card.ability.startsWith('boost_row_')) {
							this.applyRowBoostCard(card, row);
						} else if (card.ability.startsWith('boost_tag_')) {
							this.applyTagBoostCard(card, row);
						}
					} else {
						// Обычная тактическая карта
						this.placeTacticCard(card, row);
					}
				}
				tacticSlot.removeEventListener('click', clickHandler);
			}
		};
		
		tacticSlot.addEventListener('click', clickHandler);
		
		if (!this.gameState.tacticSlotSelectionHandlers) {
			this.gameState.tacticSlotSelectionHandlers = [];
		}
		this.gameState.tacticSlotSelectionHandlers.push({ element: tacticSlot, handler: clickHandler });
	},
   
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
    const clickHandler = (event) => {
        if (this.gameState.selectingRow && this.gameState.selectedCard) {
            // Передаем координату X клика
            this.placeCardOnRow(this.gameState.selectedCard, row, event.clientX);
            rowElement.removeEventListener('click', clickHandler);
        }
    };
    
    rowElement.addEventListener('click', clickHandler);
    
    if (!this.gameState.rowSelectionHandlers) {
        this.gameState.rowSelectionHandlers = [];
    }
    this.gameState.rowSelectionHandlers.push({ element: rowElement, handler: clickHandler });
},

    placeCardOnRow: function(card, row, clickX) {
			if (this.gameState.placementType === 'tactic') {
				this.placeTacticCard(card, row);
			} else {
				this.placeUnitCard(card, row, clickX);
			}
		},

    placeTacticCard: function(card, row) {
        if (this.gameState.player.rows[row].tactic) {
            this.showMessage('В этом ряду уже есть карта тактики!');
            return;
        }

        if (window.audioManager && window.audioManager.playSound) {
            audioManager.playSound('artefact');
        }

        this.gameState.player.rows[row].tactic = card;
        this.removeCardFromHand(card);
        
        if (window.gameModule) {
            window.gameModule.displayTacticCard(row, card);
            window.gameModule.completeCardPlay();
        }
    },
    
	placeUnitCard: function(card, row, clickX) {
		const rowState = this.gameState.player.rows[row];
		
		if (rowState.cards.length >= 9) {
			this.showMessage('В этом ряду уже максимальное количество карт!');
			return;
		}

		const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
		if (!rowElement) return;
		
		let insertIndex = rowState.cards.length;
		
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

		const cardCopy = {
			...card,
			uniqueId: `${card.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			baseStrength: card.strength,
			currentStrength: card.strength,
			modifiedStrength: card.strength,
			underWeather: false,
			owner: 'player',
			row: row
		};
		
		rowState.cards.splice(insertIndex, 0, cardCopy);
		
		this.removeCardFromHand(card);
		
		if (window.audioManager && window.audioManager.playSound) {
			if (card.type === 'artifact' || card.type === 'special' || card.type === 'tactic') {
				audioManager.playSound('artefact');
			} else {
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
		}
		
		if (window.gameModule) {
			window.gameModule.displayCardOnRow(row, cardCopy, 'player', insertIndex);
			window.gameModule.updateRowStrength(row, 'player');

			if (card.ability === 'double_row_strength_unit') {
				setTimeout(() => {
					this.activateDoubleRowStrengthUnitAbility(cardCopy, row);
				}, 300);
				return;
			}

			if (card.ability === 'destroy' && card.type === 'unit') {
				const strongestCards = this.findStrongestEnemyCardsInRow(row);
            
            if (strongestCards.length > 0) {
                setTimeout(() => {
                    this.executeUnitDestroyAbility(cardCopy, strongestCards);
                }, 300);
                return;
            } else {
                // В этом ряду нет целей — просто завершаем ход
                if (window.gameModule) {
                    window.gameModule.completeCardPlay();
                }
                return;
            }
        }
	
			if (card.ability === 'flock') {
				let flockTag = null;
				if (card.tagsflock && card.tagsflock.length > 0) {
					flockTag = card.tagsflock[0];
				}
				
				if (flockTag) {
					setTimeout(() => {
						this.activateFlockAbility(cardCopy, flockTag);
					}, 300);
				} else {
					window.gameModule.completeCardPlay();
				}
			} 

			else if (card.ability === 'call_rat' || card.ability === 'call_driad') {
				if (card.summon) {
					setTimeout(() => {
						this.activateCallAbility(cardCopy, card.summon);
					}, 300);
				} else {
					console.warn(`Карта ${card.name} имеет способность 'call', но не указано поле 'summon'.`);
					window.gameModule.completeCardPlay();
				}
			}
			else if (card.ability === 'call_warrior') {
				setTimeout(() => {
					this.activateCallFromDeckAbility(cardCopy, 'Воительница');
				}, 300);
			}
			else if (card.ability === 'medic') {      
				setTimeout(() => {
					this.activateMedicAbility(cardCopy);
				}, 300);
			}
			else {
				window.gameModule.completeCardPlay();
			}
		}
	},

	activateDoubleRowStrengthUnitAbility: function(playedCard, row) {
		const rowState = this.gameState.player.rows[row];
		let boostedCards = 0;
		
		// Удваиваем силу всех карт в ряду (кроме самого командира и героев)
		rowState.cards.forEach(unitCard => {
			if (unitCard.type === 'unit' && 
				!this.isHeroCard(unitCard) && 
				unitCard.uniqueId !== playedCard.uniqueId) {
				
				this.initializeCardFields(unitCard);
				
				// Удваиваем modifiedStrength (базовую силу)
				const boostValue = unitCard.modifiedStrength;
				unitCard.modifiedStrength += boostValue;
				
				// Обновляем currentStrength
				if (!unitCard.underWeather) {
					unitCard.currentStrength = unitCard.modifiedStrength;
					unitCard.strength = unitCard.modifiedStrength;
				}
				
				boostedCards++;
				
				// Визуальный эффект [X2]
				this.createDoubleStrengthVisualEffect(unitCard, row);
			}
		});
		
		// Также удваиваем силу самого командира
		this.initializeCardFields(playedCard);
		const commanderBoost = playedCard.modifiedStrength;
		playedCard.modifiedStrength += commanderBoost;
		
		if (!playedCard.underWeather) {
			playedCard.currentStrength = playedCard.modifiedStrength;
			playedCard.strength = playedCard.modifiedStrength;
		}
		
		this.createDoubleStrengthVisualEffect(playedCard, row);
		
		if (window.gameModule) {
			// Обновляем все карты в ряду
			rowState.cards.forEach(unitCard => {
				if (unitCard.type === 'unit') {
					window.gameModule.updateCardStrengthDisplay(unitCard, row, 'player');
				}
			});
			
			window.gameModule.updateRowStrength(row, 'player');
			window.gameModule.updateTotalScoreDisplays();
			
			setTimeout(() => {
				window.gameModule.completeCardPlay();
			}, 800);
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_boost');
		}
		
		// Показываем сообщение
		if (window.gameModule && boostedCards > 0) {
			window.gameModule.showGameMessage(
				`Командир удвоил силу ${boostedCards + 1} отрядов в ряду!`, 
				'info'
			);
		}
	},

	activateCallFromDeckAbility: function(playedCard, summonName) {
		if (!summonName) {
			this.returnCardToHand(playedCard);
			return;
		}

		const player = this.gameState.player;

		// Собираем кандидатов из колоды и из руки.
		// playedCard уже убран из руки, поэтому он не попадёт в выборку.
		const candidates = [];

		// Колода
		player.deck.forEach(card => {
			if (card.name === summonName && card.type === 'unit') {
				candidates.push({ card, source: 'deck' });
			}
		});

		// Рука
		player.hand.forEach(card => {
			if (card.name === summonName && card.type === 'unit') {
				candidates.push({ card, source: 'hand' });
			}
		});

		// Ничего не нашли — способность не срабатывает
		if (candidates.length === 0) {
			this.returnCardToHand(playedCard);
			return;
		}

		let summonedCount = 0;

		// Идём с конца, чтобы splice не сбивал индексы
		for (let i = candidates.length - 1; i >= 0; i--) {
			const { card, source } = candidates[i];

			const targetRow = this.getBestRowForSummon(card);
			if (!targetRow) continue;

			// Удаляем из источника
			if (source === 'deck') {
				const idx = player.deck.findIndex(c => c === card);
				if (idx === -1) continue;
				player.deck.splice(idx, 1);
			} else {
				const idx = player.hand.findIndex(c => c === card);
				if (idx === -1) continue;
				player.hand.splice(idx, 1);
			}

			// Создаём копию и размещаем на поле
			const summonCopy = {
				...card,
				uniqueId: `${card.id}_call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				baseStrength: card.strength,
				currentStrength: card.strength,
				modifiedStrength: card.strength,
				underWeather: false,
				owner: 'player',
				row: targetRow,
				summonedByCall: true,
				originalCallerId: playedCard.id
			};

			player.rows[targetRow].cards.push(summonCopy);

			if (window.gameModule) {
				window.gameModule.displayCardOnRow(
					targetRow,
					summonCopy,
					'player',
					player.rows[targetRow].cards.length - 1
				);
				window.gameModule.updateRowStrength(targetRow, 'player');
			}

			summonedCount++;
		}

		if (summonedCount === 0) {
			this.returnCardToHand(playedCard);
			return;
		}

		if (window.gameModule) {
			window.gameModule.displayPlayerHand();
			window.gameModule.displayPlayerDeck();
			window.gameModule.updateTotalScoreDisplays();
		}

		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_close');
		}

		if (window.gameModule && !playedCard.completeCalled) {
			playedCard.completeCalled = true;
			setTimeout(() => {
				window.gameModule.completeCardPlay();
			}, 500);
		}
	},

    removeCardFromHand: function(card) {
        if (window.gameModule && window.gameModule.removeCardFromHand) {
            window.gameModule.removeCardFromHand(card, 'player');
        } else {
            const cardIndex = this.gameState.player.hand.findIndex(c => c.id === card.id);
            if (cardIndex !== -1) {
                this.gameState.player.hand.splice(cardIndex, 1);
                if (window.gameModule) {
                    window.gameModule.displayPlayerHand();
                }
            }
        }
    },
    
    cancelCardSelection: function() {
		if (this.gameState.selectedCardElement) {
			this.gameState.selectedCardElement.classList.remove('card-selected');
		}
		
		this.gameState.selectedCard = null;
		this.gameState.selectedCardElement = null;
		this.cancelRowSelection();
	},

	cancelRowSelection: function() {
		this.gameState.selectingRow = false;
		this.gameState.placementType = null;
		this.gameState.boostCard = null;
		this.gameState.boostTag = null;

		this.removeDecoyHighlights();
		this.removeArtifactHighlights();
		this.removeDamageHighlights();
		this.removeAllRowHighlights();
		this.removeAllTacticSlotHighlights();
		this.removeBoostHighlights();
		this.removeSpyHighlights();
		
		const positionMarkers = document.querySelectorAll('.boost-position-marker');
		positionMarkers.forEach(marker => {
			marker.remove();
		});
		
		const boostTargets = document.querySelectorAll('.boost-target');
		boostTargets.forEach(card => {
			card.classList.remove('boost-target');
		});

		if (this.gameState.doubleStrengthHandlers) {
			this.gameState.doubleStrengthHandlers.forEach(({ element, handler }) => {
				element.removeEventListener('click', handler);
			});
			this.gameState.doubleStrengthHandlers = [];
		}
		
		const doubleStrengthTargets = document.querySelectorAll('.double-strength-target');
		doubleStrengthTargets.forEach(el => {
			el.classList.remove('tactic-slot-available', 'double-strength-target');
		});
	
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
		
		if (this.gameState.selectedCardElement) {
			this.gameState.selectedCardElement.classList.remove('card-selected');
			this.gameState.selectedCard = null;
			this.gameState.selectedCardElement = null;
		}
		
		if (this.gameState.artifactSelectionHandlers) {
			this.gameState.artifactSelectionHandlers.forEach(({ element, handler }) => {
				element.removeEventListener('click', handler);
			});
			this.gameState.artifactSelectionHandlers = [];
		}
		
		if (this.gameState.spySelectionHandlers) {
			this.gameState.spySelectionHandlers.forEach(({ element, handler }) => {
				element.removeEventListener('click', handler);
			});
			this.gameState.spySelectionHandlers = [];
		}
	},

	removeSpyHighlights: function() {
		const highlightedRows = document.querySelectorAll('.spy-target');
		highlightedRows.forEach(row => {
			row.classList.remove('spy-target');
		});
	},

	removeDecoyHighlights: function() {
		const highlightedCards = document.querySelectorAll('.decoy-target');
		highlightedCards.forEach(card => {
			card.classList.remove('decoy-target');
		});
		
		if (this.gameState.decoySelectionHandlers) {
			this.gameState.decoySelectionHandlers.forEach(({ element, handler }) => {
				element.removeEventListener('click', handler);
			});
			this.gameState.decoySelectionHandlers = [];
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
			// Убираем подсветку с рядов игрока
			const playerRowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
			if (playerRowElement) {
				playerRowElement.classList.remove('row-available');
			}
			
			// Убираем подсветку с рядов противника
			const opponentRowElement = document.getElementById(`opponent${this.capitalizeFirst(row)}Row`);
			if (opponentRowElement) {
				opponentRowElement.classList.remove('row-available');
				opponentRowElement.classList.remove('spy-target');
			}
			
			// Убираем подсветку с тактических слотов
			const tacticSlot = document.getElementById(`player${this.capitalizeFirst(row)}Tactics`);
			if (tacticSlot) tacticSlot.classList.remove('tactic-slot-available');
		});
	},
	 
    handlePass: function() {
        if (this.gameState.gamePhase !== 'playerTurn' || this.gameState.player.passed) {
            return;
        }
        
        if (this.gameState.cardsPlayedThisTurn >= this.gameState.maxCardsPerTurn) {
            this.showMessage('Вы достигли лимита карт! Завершите ход.');
            return;
        }
        
        audioManager.playSound('button');
        
        this.gameState.player.passed = true;
        
        if (window.gameModule && window.gameModule.resetTimeoutCounter) {
            window.gameModule.resetTimeoutCounter();
        }
        
        if (window.gameModule) {
            window.gameModule.updateControlButtons();
            window.gameModule.handleTurnEnd();
        }
    },
	
    handleEndTurn: function() {
        if (this.gameState.gamePhase !== 'playerTurn') {
            return;
        }
        
        if (this.gameState.player.passed) {
            return;
        }
        
        audioManager.playSound('button');
        
        if (window.gameModule && window.gameModule.resetTimeoutCounter) {
            window.gameModule.resetTimeoutCounter();
        }
        
        if (window.gameModule) {
            window.gameModule.handleTurnEnd();
        }
    },

    capitalizeFirst: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    showMessage: function(text) {
        if (window.gameModule && window.gameModule.showMessage) {
            window.gameModule.showMessage(text);
        } else {
            alert(text);
        }
    }
};

window.playerModule = playerModule;