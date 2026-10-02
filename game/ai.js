const aiModule = {
    gameState: null,
	usedCardInstances: new Map(),
    usedCardIds: new Set(),
    isMakingMove: false,
	
    init: function(gameState) {
        this.gameState = gameState;
        this.usedCardIds.clear();
		this.isMakingMove = false;
    },
 
	isHeroCard: function(card) {
		return card.tags && (card.tags.includes('hero') || card.tags.includes('герой'));
	},
 
	reset: function() {
		this.usedCardIds.clear();
		this.gameState = null;
		this.isMakingMove = false;
	},

	makeMove: function() {
																							this.debugDetailedAICards();
		if (this.isMakingMove) return;
		this.isMakingMove = true;
		
		if (this.gameState.opponent.passed) {
			this.isMakingMove = false;
			this.endAITurn();
			return;
		}
		
		if (this.gameState.cardsPlayedThisTurn >= this.gameState.maxCardsPerTurn) {
			this.isMakingMove = false;
			this.endAITurn();
			return;
		}
		
		if (this.gameState.player.passed) {
			const playableCards = this.getPlayableCards();
			if (playableCards.length > 0) {
				const bestCard = this.selectBestCard(playableCards);
				if (bestCard) {
					this.playCard(bestCard);
					setTimeout(() => {
						this.isMakingMove = false;
					}, 100);
					return;
				}
			}
			this.isMakingMove = false;
			this.pass();
			return;
		}
		
		if (this.gameState.opponent.hand.length === 0) {
			this.isMakingMove = false;
			this.pass();
			return;
		}
		
		const playableCards = this.getPlayableCards();
		
		if (playableCards.length === 0) {
			this.isMakingMove = false;
			this.pass();
			return;
		}
		
		const playerScore = this.calculateTotalScore('player');
		const opponentScore = this.calculateTotalScore('opponent');
		const scoreDifference = opponentScore - playerScore;
		
		if (scoreDifference > 15 && this.gameState.opponent.hand.length <= 2) {
			this.isMakingMove = false;
			this.pass();
			return;
		}
		
		const bestCard = this.selectBestCard(playableCards);
		
		if (bestCard) {
			this.playCard(bestCard);
			setTimeout(() => {
				this.isMakingMove = false;
			}, 100);
		} else {
			this.isMakingMove = false;
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
		
		// Проверяем, есть ли у игрока карты на поле
		const playerHasCardsOnBoard = this.playerHasCardsOnBoard();
		
		this.gameState.opponent.hand.forEach(card => {
			const cardInstanceId = `${card.id}_${card.uniqueId || ''}`;
			
			if (this.usedCardInstances.has(cardInstanceId) || seenIds.has(card.id)) {
				if (card.copy && card.copy > 1) {
					const usedCount = this.usedCardInstances.get(card.id) || 0;
					if (usedCount >= card.copy) {
						return;
					}
				} else {
					return;
				}
			}
			seenIds.add(card.id);
			
			let canPlay = false;
			
			if (card.ability === 'flock') {
				canPlay = this.canPlayFlockCard(card);
			}
			else if (card.ability === 'call') {
				canPlay = this.canPlayCallCard(card);
			}
			else if (this.isWeatherCard(card)) {
				canPlay = this.canPlayWeatherCard(card);
			}
			else if (card.ability === 'decoy') {
				// Чучело можно играть только если есть свои карты на поле
				canPlay = this.getWeakCardsOnBoard().length > 0;
			}
			else if (card.ability === 'destroy' && card.type === 'unit') {
				canPlay = this.canPlayUnitCard(card);
			}
			else if (card.ability === 'destroy_artf') {
				// Уничтожение артефакта можно играть только если у игрока есть артефакты
				canPlay = this.findPlayerArtifacts().length > 0;
			}
			else if (card.ability && card.ability.startsWith('damage_')) {
				// Урон можно наносить только если у игрока есть карты на поле
				canPlay = playerHasCardsOnBoard && this.canPlayDamageCard(card);
			}
			else if (card.ability && card.ability.startsWith('boost_')) {
				canPlay = this.canPlaySpecialBoostCard(card);
			}
			else if (card.ability === 'double_row_strength') {
				canPlay = this.canPlayDoubleStrengthCard(card);
			}
			else if (card.type === 'tactic') {
				canPlay = this.canPlayTacticCard(card);
			}
			else if (card.type === 'artifact' && card.ability && card.ability.startsWith('boost_')) {
				canPlay = this.canPlayArtifactBoostCard(card);
			}
			else {
				const isSpy = window.gameModule && window.gameModule.isSpyCard(card);
				
				if (isSpy) {
					canPlay = this.canPlaySpyCard(card);
				} else {
					canPlay = this.canPlayUnitCard(card);
				}
			}
			
			if (canPlay) {
				uniqueCards.push(card);
			}
		});
		
		return uniqueCards;
	},

	playerHasCardsOnBoard: function() {
		const rows = ['close', 'ranged', 'siege'];
		
		for (let row of rows) {
			if (this.gameState.player.rows[row].cards.length > 0) {
				return true;
			}
			if (this.gameState.player.rows[row].tactic) {
				return true;
			}
		}
		
		return false;
	},

																					 debugDetailedAICards: function() {
																						console.group('Рука');
																						if (this.gameState.opponent.hand.length === 0) {
																							console.log('  (empty)');
																						} else {
																							this.gameState.opponent.hand.forEach((card, idx) => {
																								console.log(`${idx + 1}.`, {
																									name: card.name,
																									strength: card.strength,
																									position: card.position
																								});
																							});
																						}
																						console.groupEnd();
																						
																						console.group('Колода');
																						if (this.gameState.opponent.deck.length === 0) {
																							console.log('  (empty)');
																						} else {
																							const units = this.gameState.opponent.deck.filter(c => c.type === 'unit');
																							const specials = this.gameState.opponent.deck.filter(c => c.type === 'special');
																							const artifacts = this.gameState.opponent.deck.filter(c => c.type === 'artifact');
																							const tactics = this.gameState.opponent.deck.filter(c => c.type === 'tactic');
																							
																							if (units.length) console.log(`Отряды (${units.length}):`, units.map(c => `${c.name}(${c.strength})`).join(', '));
																							if (specials.length) console.log(`Спец. (${specials.length}):`, specials.map(c => c.name).join(', '));
																							if (artifacts.length) console.log(`Артефакты (${artifacts.length}):`, artifacts.map(c => c.name).join(', '));
																							if (tactics.length) console.log(`Тактики (${tactics.length}):`, tactics.map(c => c.name).join(', '));
																						}
																						console.groupEnd();
																						
																						console.group('СТАТИСТИКА');
																						console.log(`Всего карт: ${this.gameState.opponent.hand.length + this.gameState.opponent.deck.length}`);
																						console.log(`Рука: ${this.gameState.opponent.hand.length}`);
																						console.log(`Колода: ${this.gameState.opponent.deck.length}`);
																						console.log(`Сброс: ${this.gameState.opponent.discard.length}`);
																						console.groupEnd();
																						
																						console.groupEnd();
																					},

																					formatCardInfo: function(card) {
																						let info = `[${card.id}] ${card.name || 'Unknown'}`;
																						
																						if (card.type) info += ` | Type: ${card.type}`;
																						if (card.strength !== undefined) info += ` | Str: ${card.strength}`;
																						if (card.ability) info += ` | Ability: ${card.ability}`;
																						if (card.rarity) info += ` | ${card.rarity.toUpperCase()}`;
																						if (card.copy && card.copy > 1) info += ` | Copy x${card.copy}`;
																						
																						return info;
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

	findStrongestPlayerCardsInRow: function(row) {
		const rowCards = this.gameState.player.rows[row].cards;
		let maxStrength = -1;
		const candidates = [];
		
		rowCards.forEach(card => {
			if (this.isHeroCard(card)) return;
			if (card.type !== 'unit') return;
			
			const strength = card.currentStrength !== undefined ? 
				card.currentStrength : (card.strength || 0);
			
			candidates.push({ card, row, owner: 'player', strength });
			
			if (strength > maxStrength) {
				maxStrength = strength;
			}
		});
		
		if (maxStrength < 0) return [];
		
		return candidates.filter(c => c.strength === maxStrength);
	},
	
	playUnitDestroyCard: function(card) {
		// Определяем ряд, в который ставим юнита
		const bestRow = this.findBestRowForUnit(card);
		if (!bestRow) {
			this.usedCardIds.delete(card.id);
			return;
		}
		
		// Ищем сильнейшие карты игрока в ЭТОМ ЖЕ ряду
		const strongestCards = this.findStrongestPlayerCardsInRow(bestRow);
		
		// Размещаем юнита
		const rowState = this.gameState.opponent.rows[bestRow];
		const cardCopy = { 
			...card,
			uniqueId: `${card.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			owner: 'opponent',
			row: bestRow
		};
		
		rowState.cards.push(cardCopy);
		this.removeCardFromHand(card);
		
		if (window.gameModule) {
			window.gameModule.displayCardOnRow(bestRow, cardCopy, 'opponent', rowState.cards.length - 1);
			window.gameModule.updateRowStrength(bestRow, 'opponent');
		}
		
		// Применяем Казнь (если есть цели в этом ряду)
		if (strongestCards.length > 0) {
			setTimeout(() => {
				this.executeUnitDestroyAbilityForAI(cardCopy, strongestCards);
			}, 300);
		} else {
			// Нет целей — просто завершаем ход
			if (window.gameModule && window.gameModule.completeCardPlay) {
				setTimeout(() => {
					window.gameModule.completeCardPlay();
				}, 600);
			}
		}
	},
	
	executeUnitDestroyAbilityForAI: function(destroyCard, strongestCards) {
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
		
		if (window.gameModule) {
			setTimeout(() => {
				window.gameModule.displayPlayerDiscard();
				window.gameModule.displayOpponentDiscard();
				window.gameModule.updateTotalScoreDisplays();
				
				if (window.gameModule.completeCardPlay) {
					window.gameModule.completeCardPlay();
				}
			}, 600);
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('scorch');
		}
	},
	
	createDestroyVisualEffectForAI: function(card, row) {
		const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
		if (!rowElement) return;
		
		const cardElement = rowElement.querySelector(`[data-card-id="${card.id}"]`);
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
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_destroy');
		}
	},
	
	canPlayDoubleStrengthCard: function(card) {
		const rows = ['close', 'ranged', 'siege'];
		return rows.some(row => 
			!this.gameState.opponent.rows[row].tactic &&
			this.gameState.opponent.rows[row].cards.some(c => 
				c.type === 'unit' && !this.isHeroCard(c)
			)
		);
	},

	evaluateDoubleStrengthCard: function(card) {
		let score = 20; // Базовая оценка (выше чем у обычных тактик)
		
		// Находим лучший ряд для удвоения
		const bestRow = this.findBestRowForDoubleStrength();
		
		if (bestRow) {
			const rowState = this.gameState.opponent.rows[bestRow];
			const boostableUnits = rowState.cards.filter(c => 
				c.type === 'unit' && !this.isHeroCard(c)
			);
			
			if (boostableUnits.length > 0) {
				// Считаем общую силу карт в ряду
				const totalStrength = boostableUnits.reduce((sum, c) => {
					const strength = c.currentStrength !== undefined ? 
						c.currentStrength : (c.strength || 0);
					return sum + strength;
				}, 0);
				
				// Чем больше карт и чем они сильнее, тем ценнее удвоение
				score += boostableUnits.length * 10;
				score += totalStrength * 0.8;
				
				// Бонус за большое количество карт в ряду
				if (boostableUnits.length >= 3) {
					score += 15;
				}
				
				// Бонус за ряды с сильными картами
				if (totalStrength > 20) {
					score += 10;
				}
				
				// Бонус, если проигрываем
				const playerTotal = this.calculateTotalScore('player');
				const opponentTotal = this.calculateTotalScore('opponent');
				
				if (opponentTotal < playerTotal) {
					score += 15;
				}
				
				// Бонус, если игрок спасовал (последний ход)
				if (this.gameState.player.passed) {
					score += 20;
				}
				
				// Штраф за ряды под погодой
				if (this.gameState.weather.effects[bestRow]) {
					score -= 30; // Под погодой удвоение менее эффективно
				}
			} else {
				score = 0; // Нет карт для удвоения
			}
		} else {
			score = 0; // Нет подходящих рядов
		}
		
		return Math.max(0, score);
	},

	findBestRowForDoubleStrength: function() {
		const rows = ['close', 'ranged', 'siege'];
		let bestRow = null;
		let bestScore = -1;
		
		rows.forEach(row => {
			// Проверяем, свободен ли тактический слот
			if (this.gameState.opponent.rows[row].tactic) {
				return;
			}
			
			const rowState = this.gameState.opponent.rows[row];
			const boostableUnits = rowState.cards.filter(c => 
				c.type === 'unit' && !this.isHeroCard(c)
			);
			
			if (boostableUnits.length === 0) return;
			
			let score = 0;
			
			// Считаем силу карт (используем currentStrength или modifiedStrength)
			const totalStrength = boostableUnits.reduce((sum, c) => {
				const strength = c.currentStrength !== undefined ? 
					c.currentStrength : (c.strength || 0);
				return sum + strength;
			}, 0);
			
			score += totalStrength * 0.8;
			score += boostableUnits.length * 10;
			
			// Бонус за отсутствие погоды в ряду
			if (!this.gameState.weather.effects[row]) {
				score += 20;
			}
			
			// Бонус за героев в ряду (их нельзя усилить, но они создают мощный ряд)
			const hasHeroes = rowState.cards.some(c => 
				c.type === 'unit' && this.isHeroCard(c)
			);
			if (hasHeroes) {
				score += 5;
			}
			
			if (score > bestScore) {
				bestScore = score;
				bestRow = row;
			}
		});
		
		return bestRow;
	},

	playDoubleStrengthCard: function(card) {
		const bestRow = this.findBestRowForDoubleStrength();
		
		if (!bestRow) {
			this.usedCardIds.delete(card.id);
			return;
		}
		
		const rowState = this.gameState.opponent.rows[bestRow];
		let boostedCards = 0;
		
		// Удваиваем силу всех карт в ряду
		rowState.cards.forEach(unitCard => {
			if (unitCard.type === 'unit' && !this.isHeroCard(unitCard)) {
				// Инициализируем поля
				if (unitCard.baseStrength === undefined) {
					unitCard.baseStrength = unitCard.strength;
				}
				if (unitCard.modifiedStrength === undefined) {
					unitCard.modifiedStrength = unitCard.strength;
				}
				if (unitCard.currentStrength === undefined) {
					unitCard.currentStrength = unitCard.strength;
				}
				
				// Сохраняем текущую силу
				const currentStrength = unitCard.currentStrength !== undefined ? 
					unitCard.currentStrength : unitCard.strength;
				
				// Удваиваем modifiedStrength (базовую силу)
				const boostValue = unitCard.modifiedStrength;
				unitCard.modifiedStrength += boostValue;
				
				// Обновляем currentStrength
				if (!unitCard.underWeather) {
					unitCard.currentStrength = unitCard.modifiedStrength;
					unitCard.strength = unitCard.modifiedStrength;
				}
				
				boostedCards++;
				
				// Создаём визуальный эффект [X2] (для карт противника)
				this.createDoubleStrengthVisualEffect(unitCard, bestRow);
			}
		});
		
		if (boostedCards === 0) {
			this.usedCardIds.delete(card.id);
			return;
		}
		
		// Размещаем тактическую карту в слот
		this.gameState.opponent.rows[bestRow].tactic = card;
		
		// Обновляем отображение
		if (window.gameModule) {
			window.gameModule.displayTacticCard(bestRow, card, 'opponent');
			
			// Обновляем все карты в ряду
			rowState.cards.forEach(unitCard => {
				if (unitCard.type === 'unit') {
					window.gameModule.updateCardStrengthDisplay(unitCard, bestRow, 'opponent');
				}
			});
			
			window.gameModule.updateRowStrength(bestRow, 'opponent');
			
			setTimeout(() => {
				if (window.gameModule.completeCardPlay) {
					window.gameModule.completeCardPlay();
				}
			}, 1000);
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_boost');
		}
	},

	createDoubleStrengthVisualEffect: function(card, row) {
		const rowElement = document.getElementById(`opponent${this.capitalizeFirst(row)}Row`);
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
				const rowState = this.gameState.opponent.rows[row];
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
		
		// Создаем эффект [X2] зелёного цвета (такой же как у игрока)
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

	canPlayCallCard: function(card) {
		// Проверяем, есть ли место для призываемой карты
		if (!card.summon) return false;
		
		// Находим карту для призыва
		let summonedCard = null;
		let summonCopyCount = 1;
		
		if (window.cardsModule && window.cardsModule.cardsData) {
			for (const factionName in window.cardsModule.cardsData) {
				const faction = window.cardsModule.cardsData[factionName];
				for (const cardType in faction) {
					if (Array.isArray(faction[cardType])) {
						const foundCard = faction[cardType].find(c => c.name === card.summon);
						if (foundCard) {
							summonedCard = foundCard;
							summonCopyCount = foundCard.copy || 1;
							break;
						}
					}
				}
				if (summonedCard) break;
			}
		}
		
		if (!summonedCard) return false;
		
		// Проверяем, есть ли место для всех копий
		let availableSlots = 0;
		const rows = ['close', 'ranged', 'siege'];
		
		rows.forEach(row => {
			if (this.gameState.opponent.rows[row].cards.length < 9) {
				availableSlots += (9 - this.gameState.opponent.rows[row].cards.length);
			}
		});
		
		return availableSlots >= summonCopyCount;
	},

	evaluateCallCard: function(card) {
		let score = card.strength || 5;
		
		if (!card.summon) return score;
		
		// Находим призываемую карту
		let summonedCard = null;
		let summonCopyCount = 1;
		let summonedStrength = 0;
		
		if (window.cardsModule && window.cardsModule.cardsData) {
			for (const factionName in window.cardsModule.cardsData) {
				const faction = window.cardsModule.cardsData[factionName];
				for (const cardType in faction) {
					if (Array.isArray(faction[cardType])) {
						const foundCard = faction[cardType].find(c => c.name === card.summon);
						if (foundCard) {
							summonedCard = foundCard;
							summonCopyCount = foundCard.copy || 1;
							summonedStrength = foundCard.strength || 0;
							break;
						}
					}
				}
				if (summonedCard) break;
			}
		}
		
		if (!summonedCard) return score;
		
		// Общая сила призываемых карт
		const totalSummonedStrength = summonedStrength * summonCopyCount;
		score += totalSummonedStrength * 0.8;
		
		// Бонус за количество призываемых карт
		if (summonCopyCount > 1) {
			score += summonCopyCount * 5;
		}
		
		// Бонус, если призываются карты с полезными тегами
		if (summonedCard.tags && summonedCard.tags.length > 0) {
			score += summonedCard.tags.length * 3;
		}
		
		// Учитываем ситуацию на поле
		const playerTotalScore = this.calculateTotalScore('player');
		const opponentTotalScore = this.calculateTotalScore('opponent');
		
		if (opponentTotalScore < playerTotalScore) {
			score += 15; // Если проигрываем, призовые карты важнее
		}
		
		// Бонус, если в конце раунда
		if (this.gameState.player.passed) {
			score += 20;
		}
		
		return Math.max(0, score);
	},

	canPlayFlockCard: function(card) {
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
		
		const hasAvailableRow = availableRows.some(row => 
			this.gameState.opponent.rows[row].cards.length < 9
		);
		
		if (!hasAvailableRow) return false;
		
		if (!card.tagsflock || card.tagsflock.length === 0) return false;
		
		return true;
	},
	 
	canPlayArtifactBoostCard: function(card) {
		const ability = card.ability;
		
		if (ability.startsWith('boost_') && !ability.startsWith('boost_near_')) {
			// Для усиления карты проверяем, есть ли карты для усиления
			const rows = ['close', 'ranged', 'siege'];
			return rows.some(row => {
				const rowState = this.gameState.opponent.rows[row];
				return rowState.cards.some(unitCard => 
					unitCard.type === 'unit' && !this.isHeroCard(unitCard)
				);
			});
		} else if (ability.startsWith('boost_near_')) {
			// Для усиления соседей проверяем, есть ли позиции
			const rows = ['close', 'ranged', 'siege'];
			return rows.some(row => {
				const rowState = this.gameState.opponent.rows[row];
				if (rowState.cards.length >= 9) return false;
				
				// Проверяем, есть ли позиции с соседями
				for (let i = 0; i <= rowState.cards.length; i++) {
					const hasLeftNeighbor = i > 0 && 
						rowState.cards[i - 1].type === 'unit' && 
						!this.isHeroCard(rowState.cards[i - 1]);
					
					const hasRightNeighbor = i < rowState.cards.length && 
						rowState.cards[i].type === 'unit' && 
						!this.isHeroCard(rowState.cards[i]);
					
					if (hasLeftNeighbor || hasRightNeighbor) {
						return true;
					}
				}
				return false;
			});
		}
		
		return false;
	},

	canPlayDamageCard: function(card) {
		const ability = card.ability;
		
		if (ability.includes('damage_row_')) {
			// Для урона по ряду проверяем, есть ли ряды с картами
			const rows = ['close', 'ranged', 'siege'];
			return rows.some(row => {
				const rowCards = this.gameState.player.rows[row].cards;
				return rowCards.some(c => c.type === 'unit' && c.strength > 0);
			});
		} else {
			// Для урона по единичной карте проверяем, есть ли карты противника
			const rows = ['close', 'ranged', 'siege'];
			return rows.some(row => {
				const rowCards = this.gameState.player.rows[row].cards;
				return rowCards.some(c => c.type === 'unit' && c.strength > 0);
			});
		}
	},

    canPlayWeatherCard: function(card) {
		const isClearWeather = this.isClearWeatherCard(card);
		if (isClearWeather) {
			const hasSameClearWeather = this.gameState.weather.cards.some(wc => 
				wc.name === card.name || wc.id === card.id
			);
			
			if (hasSameClearWeather) {
				return false;
			}
			return true;
		} else {
			const sameWeatherExists = this.gameState.weather.cards.some(weatherCard => {
				if (this.isClearWeatherCard(weatherCard)) return false;
				return weatherCard.name === card.name;
			});
			if (sameWeatherExists) {
				return false;
			}
			const weatherEffect = this.getWeatherEffectForCard(card);
			if (!weatherEffect || !weatherEffect.rows) {
				return false;
			}
			const targetRows = weatherEffect.rows;
			if (targetRows.length > 1) {
				let occupiedRowsCount = 0;
				targetRows.forEach(row => {
					if (this.gameState.weather.effects[row]) {
						occupiedRowsCount++;
					}
				});
				if (occupiedRowsCount === targetRows.length) {
					return false;
				}
			}
			else if (targetRows.length === 1) {
				const targetRow = targetRows[0];
				if (this.gameState.weather.effects[targetRow]) {
					return false;
				}
			}
			const regularWeatherCards = this.gameState.weather.cards.filter(wc => 
				!this.isClearWeatherCard(wc)
			);
			const hasClearWeather = this.gameState.weather.cards.some(wc => 
				this.isClearWeatherCard(wc)
			);
			if (!hasClearWeather && regularWeatherCards.length >= this.gameState.weather.maxWeatherCards) {
				return false;
			}
			return true;
		}
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
    // Для карт с особыми способностями проверка не нужна
    if (card.ability === 'decoy' || card.ability === 'destroy' || card.ability === 'destroy_artf') {
        return true;
    }
    
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
    
	canPlaySpyCard: function(card) {
		const targetPosition = window.gameModule.getSpyTargetPosition(card);
		let availableRows = [];
		
		if (targetPosition === 'any-row' || (Array.isArray(targetPosition) && targetPosition.includes('any-row'))) {
			availableRows = ['close', 'ranged', 'siege'];
		} else if (Array.isArray(targetPosition)) {
			availableRows = targetPosition.map(pos => pos.replace('-row', ''));
		} else {
			availableRows = [targetPosition.replace('-row', '')];
		}
		
		// Проверяем, есть ли место в рядах игрока
		return availableRows.some(row => 
			this.gameState.player.rows[row].cards.length < 9
		);
	},

	evaluateCardScore: function(card) {
		let baseScore = 0;
		
		const copyBonus = (card.copy && card.copy > 1) ? card.copy * 5 : 0;
		
		if (card.ability === 'flock') {
			baseScore = this.evaluateFlockCard(card);
		} 
		else if (card.ability === 'call') {
			baseScore = this.evaluateCallCard(card); // НОВОЕ
		}
		else if (card.ability === 'double_row_strength') {  
			baseScore = this.evaluateDoubleStrengthCard(card);  // ← ДОБАВИТЬ
		}
		else if (card.type === 'artifact') {
			baseScore = 15;
			if (card.ability && card.ability.startsWith('boost_')) {
				baseScore = this.evaluateArtifactBoostCard(card);
			} else if (card.ability === 'damage') {
				baseScore = 12;
			} else {
				baseScore = 10;
			}
		}
		else if (card.type === 'tactic') {
			baseScore = 12;
			if (card.ability && card.ability.startsWith('boost_')) {
				baseScore = this.evaluateBoostCard(card);
			}
		}
		else if (card.type === 'unit') {
			const isSpy = window.gameModule && window.gameModule.isSpyCard(card);
			
			if (isSpy) {
				baseScore = this.evaluateSpyCard(card);
			} else {
				baseScore = this.evaluateUnitCard(card);
			}
		} 
		else if (card.ability === 'decoy') {
			baseScore = this.evaluateDecoyCard(card);
		} 
		else if (card.ability === 'destroy') {
			baseScore = this.evaluateDestroyCard(card);
		} 
		else if (card.ability === 'destroy_artf') {
			baseScore = this.evaluateDestroyArtifactCard(card);
		} 
		else if (card.ability && card.ability.startsWith('damage_')) {
			baseScore = this.evaluateDamageCard(card);
		} 
		else if (card.ability === 'double_row_strength_unit') {
			baseScore = this.evaluateDoubleStrengthUnitCard(card);
		}
		else {
			baseScore = 5;
		}
		
		baseScore += copyBonus;
		
		const instanceId = `${card.id}_${card.uniqueId || ''}`;
		if (!this.usedCardInstances.has(instanceId)) {
			baseScore += 3;
		}
		
		if (card.rarity === 'gold') {
			baseScore += 3;
		}
		
		const situationBonus = this.getSituationBonus(card);
		baseScore += situationBonus;
		
		return Math.max(0, baseScore);
	},

	evaluateDoubleStrengthUnitCard: function(card) {
		let score = card.strength || 5;
		
		// Находим лучший ряд для размещения
		const bestRow = this.findBestRowForUnit(card);
		
		if (bestRow) {
			const rowState = this.gameState.opponent.rows[bestRow];
			const boostableUnits = rowState.cards.filter(c => 
				c.type === 'unit' && !this.isHeroCard(c)
			);
			
			if (boostableUnits.length > 0) {
				// Считаем общую силу карт в ряду
				const totalStrength = boostableUnits.reduce((sum, c) => {
					const strength = c.currentStrength !== undefined ? 
						c.currentStrength : (c.strength || 0);
					return sum + strength;
				}, 0);
				
				// Чем больше карт и чем они сильнее, тем ценнее удвоение
				score += boostableUnits.length * 8;
				score += totalStrength * 0.6;
				
				// Бонус за большое количество карт в ряду
				if (boostableUnits.length >= 3) {
					score += 20;
				}
				
				// Бонус за ряды без погоды
				if (!this.gameState.weather.effects[bestRow]) {
					score += 15;
				}
			}
		}
		
		return score;
	},

	evaluateFlockCard: function(card) {
		let score = card.strength || 5;
		
		let flockTag = null;
		if (card.tagsflock && card.tagsflock.length > 0) {
			flockTag = card.tagsflock[0];
		}
		
		if (!flockTag) return score;
		
		let sameTagCount = 0;
		let totalStrength = 0;
		
		this.gameState.opponent.hand.forEach(handCard => {
			const hasMatchingFlockTag = handCard.tagsflock && 
				handCard.tagsflock.some(tag => tag === flockTag);
			
			if (handCard.id !== card.id && 
				hasMatchingFlockTag &&
				handCard.type === 'unit') {
				sameTagCount++;
				totalStrength += handCard.strength || 0;
			}
		});
		
		this.gameState.opponent.deck.forEach(deckCard => {
			const hasMatchingFlockTag = deckCard.tagsflock && 
				deckCard.tagsflock.some(tag => tag === flockTag);
			
			if (deckCard.id !== card.id &&
				hasMatchingFlockTag &&
				deckCard.type === 'unit') {
				sameTagCount++;
				totalStrength += deckCard.strength || 0;
			}
		});
		
		score += sameTagCount * 8;
		score += totalStrength * 0.5;
		
		if (sameTagCount >= 2) {
			score += 10;
		}
		
		if (this.gameState.player.passed) {
			score += 15;
		}
		
		if (this.gameState.opponent.hand.length <= 3) {
			score += 10;
		}
		
		return Math.max(0, score);
	},

	canPlaySpecialBoostCard: function(card) {
		const ability = card.ability;
		
		if (ability.startsWith('boost_row_')) {
			const boostMatch = ability.match(/boost_row_(\d+)/);
			const boostValue = boostMatch ? parseInt(boostMatch[1]) : 1;
			const bestRow = this.findBestRowForBoost(boostValue);
			return bestRow !== null;
		} else if (ability.startsWith('boost_tag_')) {
			let tag = '';
			if (ability === 'boost_tag_witcher') tag = 'witcher';
			else if (ability === 'boost_tag_criminal') tag = 'criminal';
			
			if (!tag) return false;
			
			// Проверяем, есть ли карты с этим тегом
			let hasTagCards = false;
			const rows = ['close', 'ranged', 'siege'];
			rows.forEach(row => {
				if (this.gameState.opponent.rows[row].cards.some(card => 
					card.type === 'unit' && 
					!this.isHeroCard(card) && 
					card.tags && 
					card.tags.includes(tag)
				)) {
					hasTagCards = true;
				}
			});
			return hasTagCards;
		} else if (ability.startsWith('boost_') && !ability.startsWith('boost_near_')) {
			const boostMatch = ability.match(/boost_(\d+)/);
			const boostValue = boostMatch ? parseInt(boostMatch[1]) : 1;
			const bestTarget = this.findBestCardForBoost(boostValue);
			return bestTarget !== null;
		} else if (ability.startsWith('boost_near_')) {
			const boostMatch = ability.match(/boost_near_(\d+)/);
			const boostValue = boostMatch ? parseInt(boostMatch[1]) : 1;
			const bestPosition = this.findBestPositionForNearBoost(boostValue);
			return bestPosition !== null;
		}
		
		return false;
	},

	evaluateSpyCard: function(card) {
		let score = card.strength || 0;
		
		// Шпионы дают карту в руку - это очень ценно
		score += 15;
		
		// Учитываем состояние колоды
		const deckSize = this.gameState.opponent.deck.length;
		if (deckSize > 5) {
			score += 5; // Бонус, если есть из чего тянуть
		}
		
		// Учитываем ситуацию в раунде
		const playerTotal = this.calculateTotalScore('player');
		const opponentTotal = this.calculateTotalScore('opponent');
		
		if (opponentTotal < playerTotal) {
			// Если проигрываем, шпион может помочь добрать карты для comeback'а
			score += 10;
		} else if (opponentTotal > playerTotal + 15) {
			// Если сильно выигрываем, шпион менее ценен
			score -= 5;
		}
		
		// Проверяем, есть ли в руке сильные карты, которые можно будет сыграть после добора
		const strongCardsInHand = this.gameState.opponent.hand.filter(c => 
			c.strength > 8 && c.type === 'unit' && !window.gameModule?.isSpyCard(c)
		).length;
		
		if (strongCardsInHand > 0) {
			score += strongCardsInHand * 3;
		}
		
		return score;
	},

	evaluateArtifactBoostCard: function(card) {
		const ability = card.ability;
		
		if (ability.startsWith('boost_') && !ability.startsWith('boost_near_')) {
			return this.evaluateCardBoostArtifact(card);
		} else if (ability.startsWith('boost_near_')) {
			return this.evaluateNearBoostArtifact(card);
		}
		
		return 10; // Базовая оценка
	},

	evaluateCardBoostArtifact: function(card) {
		let score = 12;
		const boostMatch = card.ability.match(/boost_(\d+)/);
		const boostValue = boostMatch ? parseInt(boostMatch[1]) : 1;
		
		// Находим лучшую карту для усиления
		const bestTarget = this.findBestCardForBoost(boostValue);
		
		if (bestTarget) {
			score += boostValue * 3;
			
			// Бонус за усиление сильных карт
			if (bestTarget.card.strength >= 8) {
				score += 5;
			}
			
			// Бонус за усиление золотых карт
			if (bestTarget.card.rarity === 'gold') {
				score += 10;
			}
		} else {
			score = 0;
		}
		
		return score;
	},

	evaluateNearBoostArtifact: function(card) {
		let score = 10;
		const boostMatch = card.ability.match(/boost_near_(\d+)/);
		const boostValue = boostMatch ? parseInt(boostMatch[1]) : 1;
		
		// Находим лучшую позицию для усиления соседей
		const bestPosition = this.findBestPositionForNearBoost(boostValue);
		
		if (bestPosition) {
			const { row, position, neighborCount } = bestPosition;
			score += neighborCount * boostValue * 2;
			
			// Бонус за усиление нескольких карт
			if (neighborCount === 2) {
				score += 8;
			}
		} else {
			score = 0;
		}
		
		return score;
	},
		
	evaluateBoostCard: function(card) {
		const ability = card.ability;
		
		if (ability.startsWith('boost_row_')) {
			return this.evaluateRowBoostCard(card);
		} else if (ability.startsWith('boost_tag_')) {
			return this.evaluateTagBoostCard(card);
		}
		
		return 15; // Базовая оценка для других карт усиления
	},

	evaluateRowBoostCard: function(card) {
		let score = 15;
		
		const boostMatch = card.ability.match(/boost_row_(\d+)/);
		const boostValue = boostMatch ? parseInt(boostMatch[1]) : 1;
		
		// Находим лучший ряд для усиления
		const bestRow = this.findBestRowForBoost(boostValue);
		
		if (bestRow) {
			const rowState = this.gameState.opponent.rows[bestRow];
			const boostableUnits = rowState.cards.filter(card => 
				card.type === 'unit' && !this.isHeroCard(card)
			).length;
			
			if (boostableUnits > 0) {
				score += boostableUnits * (boostValue * 2);
				
				// Бонус за усиление в ряду с большим количеством карт
				if (boostableUnits >= 3) {
					score += 10;
				}
				
				// Бонус за сильные карты в ряду
				const rowStrength = rowState.strength;
				if (rowStrength > 20) {
					score += 5;
				}
				
				// Учитываем ситуацию на поле
				const playerTotalScore = this.calculateTotalScore('player');
				const opponentTotalScore = this.calculateTotalScore('opponent');
				
				if (opponentTotalScore < playerTotalScore) {
					score += 10; // Если проигрываем, усиление важнее
				}
			} else {
				score = 0; // Если нет карт для усиления
			}
		} else {
			score = 0; // Если нет подходящих рядов
		}
		
		return score;
	},

	evaluateTagBoostCard: function(card) {
		let score = 15;
		
		let tag = '';
		let boostValue = 1;
		
		if (card.ability === 'boost_tag_witcher') {
			tag = 'witcher';
			boostValue = 3;
		} else if (card.ability === 'boost_tag_criminal') {
			tag = 'criminal';
			boostValue = 2;
		}
		
		if (!tag) return score;
		
		// Считаем общее количество карт с этим тегом на поле
		let tagCardCount = 0;
		const rows = ['close', 'ranged', 'siege'];
		
		rows.forEach(row => {
			const rowCards = this.gameState.opponent.rows[row].cards;
			rowCards.forEach(card => {
				if (card.type === 'unit' && 
					!this.isHeroCard(card) && 
					card.tags && 
					card.tags.includes(tag)) {
					tagCardCount++;
				}
			});
		});
		
		if (tagCardCount > 0) {
			score += tagCardCount * boostValue * 2;
			
			// Бонус за наличие свободных тактических слотов
			const freeTacticSlots = rows.filter(row => !this.gameState.opponent.rows[row].tactic).length;
			if (freeTacticSlots > 0) {
				score += 5;
			}
		} else {
			score = 0;
		}
		
		return score;
	},

	findBestRowForBoost: function(boostValue) {
		const rows = ['close', 'ranged', 'siege'];
		let bestRow = null;
		let bestScore = -1;
		
		rows.forEach(row => {
			const rowState = this.gameState.opponent.rows[row];
			
			// Не усиливаем ряды под погодой
			if (this.gameState.weather.effects[row]) {
				return;
			}
			
			const boostableUnits = rowState.cards.filter(card => 
				card.type === 'unit' && !this.isHeroCard(card)
			);
			
			if (boostableUnits.length === 0) return;
			
			let score = 0;
			
			score += boostableUnits.length * (boostValue * 2);
			
			// Бонус за ряды с большим количеством карт
			if (boostableUnits.length >= 3) {
				score += 5;
			}
			
			// Бонус за сильные карты
			const totalStrength = boostableUnits.reduce((sum, card) => 
				sum + (card.strength || 0), 0
			);
			score += totalStrength * 0.5;
			
			// Учитываем текущую силу ряда
			if (rowState.strength > 15) {
				score += 3;
			}
			
			if (score > bestScore) {
				bestScore = score;
				bestRow = row;
			}
		});
		
		return bestRow;
	},

	evaluateDamageCard: function(card) {
		const ability = card.ability;
		const isRowDamage = ability.includes('damage_row_');
		
		if (isRowDamage) {
			return this.evaluateRowDamageCard(card);
		} else {
			return this.evaluateUnitDamageCard(card);
		}
	},

	evaluateUnitDamageCard: function(card) {
		let score = 12;
		
		// Получаем значение урона из способности
		const damageMatch = card.ability.match(/damage_(\d+)/);
		const damageValue = damageMatch ? parseInt(damageMatch[1]) : 1;
		
		// Находим лучшую цель для урона
		const bestTarget = this.findBestDamageTarget(damageValue);
		
		if (bestTarget) {
			// Чем больше урон, тем выше оценка
			score += damageValue * 3;
			
			// Бонус за уничтожение карты
			if (bestTarget.card.strength <= damageValue) {
				score += 15;
				
				// Дополнительный бонус за уничтожение сильных карт
				if (bestTarget.card.strength >= 8) {
					score += 10;
				}
				
				// Бонус за уничтожение золотых карт
				if (bestTarget.card.rarity === 'gold') {
					score += 20;
				}
			} else {
				// Бонус за нанесение урона без уничтожения
				score += Math.min(bestTarget.card.strength, damageValue) * 2;
			}
		} else {
			// Если нет целей, не играем эту карту
			score = 0;
		}
		
		return score;
	},

	executeCardBoostForAI: function(artifactCard, targetData) {
		const { card: targetCard, row, position } = targetData;
		const boostMatch = artifactCard.ability.match(/boost_(\d+)/);
		const boostValue = boostMatch ? parseInt(boostMatch[1]) : 1;
		
		if (targetCard.baseStrength === undefined) {
			targetCard.baseStrength = targetCard.strength;
		}
		if (targetCard.modifiedStrength === undefined) {
			targetCard.modifiedStrength = targetCard.strength;
		}
		if (targetCard.currentStrength === undefined) {
			targetCard.currentStrength = targetCard.strength;
		}
		
		targetCard.modifiedStrength += boostValue;
		
		if (!targetCard.underWeather) {
			targetCard.currentStrength = targetCard.modifiedStrength;
			targetCard.strength = targetCard.modifiedStrength;
		}
		
		const placeLeft = Math.random() < 0.5;
		
		let insertPosition;
		if (placeLeft) {
			insertPosition = position;
		} else {
			insertPosition = position + 1;
		}
		
		const rowState = this.gameState.opponent.rows[row];
		
		const artifactCopy = { ...artifactCard };
		artifactCopy.owner = 'opponent';
		artifactCopy.row = row;
		
		artifactCopy.baseStrength = artifactCopy.strength;
		artifactCopy.modifiedStrength = artifactCopy.strength;
		artifactCopy.currentStrength = artifactCopy.strength;
		artifactCopy.underWeather = false;
		
		// СОХРАНЯЕМ ИНФОРМАЦИЮ
		artifactCopy.boostedCardId = targetCard.id;
		artifactCopy.boostedCardUniqueId = targetCard.uniqueId;
		artifactCopy.boostValue = boostValue;
		
		rowState.cards.splice(insertPosition, 0, artifactCopy);
		
		if (window.gameModule) {
			window.gameModule.updateCardStrengthDisplay(targetCard, row, 'opponent');
			window.gameModule.displayCardOnRow(row, artifactCopy, 'opponent', insertPosition);
			window.gameModule.updateRowStrength(row, 'opponent');
			
			setTimeout(() => {
				if (window.gameModule.completeCardPlay) {
					window.gameModule.completeCardPlay();
				}
			}, 1000);
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_boost');
		}
	},

	executeNearBoostForAI: function(artifactCard, positionData) {
		const { row, position } = positionData;
		const boostMatch = artifactCard.ability.match(/boost_near_(\d+)/);
		const boostValue = boostMatch ? parseInt(boostMatch[1]) : 1;
		
		const rowState = this.gameState.opponent.rows[row];
		let boostedCards = [];
		
		if (position > 0) {
			const leftCard = rowState.cards[position - 1];
			if (leftCard.type === 'unit' && !this.isHeroCard(leftCard)) {
				if (leftCard.baseStrength === undefined) {
					leftCard.baseStrength = leftCard.strength;
				}
				if (leftCard.modifiedStrength === undefined) {
					leftCard.modifiedStrength = leftCard.strength;
				}
				if (leftCard.currentStrength === undefined) {
					leftCard.currentStrength = leftCard.strength;
				}
				
				leftCard.modifiedStrength += boostValue;
				
				if (!leftCard.underWeather) {
					leftCard.currentStrength = leftCard.modifiedStrength;
					leftCard.strength = leftCard.modifiedStrength;
				}
				
				boostedCards.push({
					cardId: leftCard.id,
					uniqueId: leftCard.uniqueId,
					boostValue: boostValue
				});
				
				if (window.gameModule) {
					window.gameModule.updateCardStrengthDisplay(leftCard, row, 'opponent');
				}
			}
		}
		
		if (position < rowState.cards.length) {
			const rightCard = rowState.cards[position];
			if (rightCard.type === 'unit' && !this.isHeroCard(rightCard)) {
				if (rightCard.baseStrength === undefined) {
					rightCard.baseStrength = rightCard.strength;
				}
				if (rightCard.modifiedStrength === undefined) {
					rightCard.modifiedStrength = rightCard.strength;
				}
				if (rightCard.currentStrength === undefined) {
					rightCard.currentStrength = rightCard.strength;
				}
				
				rightCard.modifiedStrength += boostValue;
				
				if (!rightCard.underWeather) {
					rightCard.currentStrength = rightCard.modifiedStrength;
					rightCard.strength = rightCard.modifiedStrength;
				}
				
				boostedCards.push({
					cardId: rightCard.id,
					uniqueId: rightCard.uniqueId,
					boostValue: boostValue
				});
				
				if (window.gameModule) {
					window.gameModule.updateCardStrengthDisplay(rightCard, row, 'opponent');
				}
			}
		}
		
		const artifactCopy = { ...artifactCard };
		artifactCopy.owner = 'opponent';
		artifactCopy.row = row;
		
		artifactCopy.baseStrength = artifactCopy.strength;
		artifactCopy.modifiedStrength = artifactCopy.strength;
		artifactCopy.currentStrength = artifactCopy.strength;
		artifactCopy.underWeather = false;
		
		// СОХРАНЯЕМ ИНФОРМАЦИЮ
		artifactCopy.boostedCards = boostedCards;
		
		rowState.cards.splice(position, 0, artifactCopy);
		
		if (window.gameModule) {
			rowState.cards.forEach((card, index) => {
				if (card.type === 'unit') {
					window.gameModule.updateCardStrengthDisplay(card, row, 'opponent');
				}
			});
			
			window.gameModule.displayCardOnRow(row, artifactCopy, 'opponent', position);
			window.gameModule.updateRowStrength(row, 'opponent');
			
			setTimeout(() => {
				if (window.gameModule.completeCardPlay) {
					window.gameModule.completeCardPlay();
				}
			}, 1000);
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_boost');
		}
	},

	evaluateRowDamageCard: function(card) {
		let score = 10;
		
		// Получаем значение урона из способности
		const damageMatch = card.ability.match(/damage_row_(\d+)/);
		const damageValue = damageMatch ? parseInt(damageMatch[1]) : 1;
		
		// Находим лучший ряд для урона
		const bestRow = this.findBestRowForDamage(damageValue);
		
		if (bestRow) {
			const rowState = this.gameState.player.rows[bestRow];
			const unitCount = rowState.cards.filter(c => c.type === 'unit' && c.strength > 0).length;
			
			// Бонус за количество карт в ряду
			score += unitCount * 5;
			
			// Бонус за значение урона
			score += damageValue * 2;
			
			// Проверяем, сколько карт может быть уничтожено
			let potentialDestroys = 0;
			rowState.cards.forEach(unit => {
				if (unit.type === 'unit' && unit.strength > 0 && unit.strength <= damageValue) {
					potentialDestroys++;
				}
			});
			
			score += potentialDestroys * 10;
		} else {
			// Если нет подходящих рядов, не играем эту карту
			score = 0;
		}
		
		return score;
	},

	findBestDamageTarget: function(damageValue) {
		const rows = ['close', 'ranged', 'siege'];
		let bestTarget = null;
		let bestScore = -1;
		
		rows.forEach(row => {
			const rowCards = this.gameState.player.rows[row].cards;
			
			rowCards.forEach(card => {
				if (this.isHeroCard(card)) {
					return;
				}
				
				if (card.type === 'unit') {
					// Используем currentStrength или modifiedStrength для оценки
					const currentStrength = card.currentStrength !== undefined ? 
						card.currentStrength : (card.strength || 0);
					
					if (currentStrength > 0) {
						let score = 0;
						
						score += currentStrength * 2;
						
						if (currentStrength <= damageValue) {
							score += 20;
							
							if (currentStrength >= 8) {
								score += 15;
							}
						}
						if (card.rarity === 'gold') {
							score += 25;
						} else if (card.rarity === 'silver') {
							score += 10;
						}
						if (card.tags && card.tags.length > 0) {
							score += card.tags.length * 5;
						}
						
						if (score > bestScore) {
							bestScore = score;
							bestTarget = { card: card, row: row, score: score };
						}
					}
				}
			});
		});
		
		return bestTarget;
	},

	findBestRowForDamage: function(damageValue) {
		const rows = ['close', 'ranged', 'siege'];
		let bestRow = null;
		let bestScore = -1;
		
		rows.forEach(row => {
			const rowState = this.gameState.player.rows[row];
			
			const nonHeroUnitCards = rowState.cards.filter(c => 
				c.type === 'unit' && 
				c.strength > 0 && 
				!(c.tags && (c.tags.includes('hero') || c.tags.includes('герой')))
			);
			
			if (nonHeroUnitCards.length === 0) return;
			
			let score = 0;
			
			score += nonHeroUnitCards.length * 3;
			
			const rowStrength = nonHeroUnitCards.reduce((sum, card) => sum + card.strength, 0);
			score += rowStrength * 0.5;
			
			let potentialDestroys = 0;
			nonHeroUnitCards.forEach(card => {
				if (card.strength <= damageValue) {
					potentialDestroys++;
					score += 15;
					
					if (card.strength >= 8) {
						score += 10;
					}
				}
			});
			
			score += potentialDestroys * 10;
			
			if (score > bestScore) {
				bestScore = score;
				bestRow = row;
			}
		});
		
		return bestRow;
	},

	playDamageCard: function(card) {
		const ability = card.ability;
		const isRowDamage = ability.includes('damage_row_');
		
		if (isRowDamage) {
			this.playRowDamageCard(card);
		} else {
			this.playUnitDamageCard(card);
		}
	},

	findBestCardForBoost: function(boostValue) {
		const rows = ['close', 'ranged', 'siege'];
		let bestTarget = null;
		let bestScore = -1;
		
		rows.forEach(row => {
			const rowState = this.gameState.opponent.rows[row];
			
			rowState.cards.forEach((card, index) => {
				if (card.type === 'unit' && !this.isHeroCard(card)) {
					// Используем currentStrength для оценки
					const currentStrength = card.currentStrength !== undefined ? 
						card.currentStrength : (card.strength || 0);
					
					let score = 0;
					
					score += currentStrength * 0.5;
					score += boostValue * 2;
					
					if (card.rarity === 'gold') {
						score += 15;
					} else if (card.rarity === 'silver') {
						score += 8;
					}
					
					if (card.tags && card.tags.length > 0) {
						score += card.tags.length * 3;
					}
					
					// Учитываем, не под погодой ли карта
					if (card.underWeather) {
						score += 10; // Бонус за усиление карты под погодой
					}
					
					if (score > bestScore) {
						bestScore = score;
						bestTarget = { card, row, position: index };
					}
				}
			});
		});
		
		return bestTarget;
	},

	findBestPositionForNearBoost: function(boostValue) {
		const rows = ['close', 'ranged', 'siege'];
		let bestPosition = null;
		let bestScore = -1;
		
		rows.forEach(row => {
			const rowState = this.gameState.opponent.rows[row];
			
			if (rowState.cards.length >= 9) return;
			
			// Проверяем все возможные позиции
			for (let i = 0; i <= rowState.cards.length; i++) {
				let neighborCount = 0;
				let score = 0;
				
				// Проверяем левого соседа
				if (i > 0) {
					const leftCard = rowState.cards[i - 1];
					if (leftCard.type === 'unit' && !this.isHeroCard(leftCard)) {
						neighborCount++;
						score += (leftCard.strength || 0) * 0.3;
					}
				}
				
				// Проверяем правого соседа
				if (i < rowState.cards.length) {
					const rightCard = rowState.cards[i];
					if (rightCard.type === 'unit' && !this.isHeroCard(rightCard)) {
						neighborCount++;
						score += (rightCard.strength || 0) * 0.3;
					}
				}
				
				if (neighborCount > 0) {
					score += neighborCount * boostValue * 2;
					
					if (neighborCount === 2) {
						score += 5; // Бонус за усиление двух карт
					}
					
					if (score > bestScore) {
						bestScore = score;
						bestPosition = { row, position: i, neighborCount };
					}
				}
			}
		});
		
		return bestPosition;
	},

	playUnitDamageCard: function(card) {
		const damageMatch = card.ability.match(/damage_(\d+)/);
		const damageValue = damageMatch ? parseInt(damageMatch[1]) : 1;
		const bestTarget = this.findBestDamageTarget(damageValue);
		
		if (!bestTarget) {
			this.usedCardIds.delete(card.id);
			return;
		}
		this.executeUnitDamage(card, bestTarget);
	},

	playRowDamageCard: function(card) {
		const damageMatch = card.ability.match(/damage_row_(\d+)/);
		const damageValue = damageMatch ? parseInt(damageMatch[1]) : 1;
		const bestRow = this.findBestRowForDamage(damageValue);
		
		if (!bestRow) {
			this.usedCardIds.delete(card.id);
			return;
		}
		this.executeRowDamage(card, bestRow, damageValue);
	},

	executeUnitDamage: function(damageCard, targetData) {
		const { card: targetCard, row: targetRow } = targetData;
		
		this.removeCardFromHand(damageCard);
		
		const damageCardCopy = { ...damageCard };
		this.gameState.opponent.discard.push(damageCardCopy);
		
		const damageMatch = damageCard.ability.match(/damage_(\d+)/);
		const damageValue = damageMatch ? parseInt(damageMatch[1]) : 1;
		
		// Инициализируем поля для отслеживания состояний, если их нет
		if (targetCard.baseStrength === undefined) {
			targetCard.baseStrength = targetCard.strength;
		}
		if (targetCard.modifiedStrength === undefined) {
			targetCard.modifiedStrength = targetCard.strength;
		}
		if (targetCard.currentStrength === undefined) {
			targetCard.currentStrength = targetCard.strength;
		}
		
		// Применяем урон к модифицированной силе
		const newModifiedStrength = Math.max(0, targetCard.modifiedStrength - damageValue);
		targetCard.modifiedStrength = newModifiedStrength;
		
		// Если карта НЕ под погодой, обновляем текущую силу
		if (!targetCard.underWeather) {
			targetCard.currentStrength = newModifiedStrength;
			targetCard.strength = newModifiedStrength;
		}
		
		this.createDamageVisualEffect(targetCard, targetRow, damageValue);
		
		if (window.gameModule) {
			window.gameModule.updateCardStrengthDisplay(targetCard, targetRow, 'player');
		}
		
		if (targetCard.modifiedStrength === 0) {
			const rowState = this.gameState.player.rows[targetRow];
			const cardIndex = rowState.cards.findIndex(c => c.id === targetCard.id);
			if (cardIndex !== -1) {
				const destroyedCard = { ...rowState.cards[cardIndex] };
				rowState.cards.splice(cardIndex, 1);
				this.gameState.player.discard.push(destroyedCard);
				
				setTimeout(() => {
					if (window.gameModule) {
						window.gameModule.removeCardFromBoardVisual(targetCard, targetRow, 'player');
					}
				}, 500);
			}
		}
		
		if (window.gameModule) {
			window.gameModule.updateRowStrength(targetRow, 'player');
			window.gameModule.displayPlayerDiscard();
			window.gameModule.displayOpponentDiscard();
			
			if (window.gameModule.completeCardPlay) {
				setTimeout(() => {
					window.gameModule.completeCardPlay();
				}, 1000);
			}
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_damage');
		}
	},

	executeRowDamage: function(damageCard, row, damageValue) {
		this.removeCardFromHand(damageCard);
		
		const damageCardCopy = { ...damageCard };
		this.gameState.opponent.discard.push(damageCardCopy);
		
		const rowState = this.gameState.player.rows[row];
		let destroyedCards = [];
		
		rowState.cards.forEach(card => {
			if (this.isHeroCard(card)) {
				return;
			}
			
			if (card.type === 'unit') {
				// Инициализируем поля для отслеживания состояний
				if (card.baseStrength === undefined) {
					card.baseStrength = card.strength;
				}
				if (card.modifiedStrength === undefined) {
					card.modifiedStrength = card.strength;
				}
				if (card.currentStrength === undefined) {
					card.currentStrength = card.strength;
				}
				
				// Применяем урон к модифицированной силе
				const newModifiedStrength = Math.max(0, card.modifiedStrength - damageValue);
				card.modifiedStrength = newModifiedStrength;
				
				// Если карта НЕ под погодой, обновляем текущую силу
				if (!card.underWeather) {
					card.currentStrength = newModifiedStrength;
					card.strength = newModifiedStrength;
				}
				
				this.createDamageVisualEffect(card, row, damageValue);
				
				if (window.gameModule) {
					window.gameModule.updateCardStrengthDisplay(card, row, 'player');
				}
				
				if (card.modifiedStrength === 0) {
					destroyedCards.push(card);
				}
			}
		});
		
		for (let i = destroyedCards.length - 1; i >= 0; i--) {
			const destroyedCard = destroyedCards[i];
			const cardIndex = rowState.cards.findIndex(c => c.id === destroyedCard.id);
			
			if (cardIndex !== -1) {
				const destroyedCardCopy = { ...rowState.cards[cardIndex] };
				rowState.cards.splice(cardIndex, 1);
				this.gameState.player.discard.push(destroyedCardCopy);
				
				setTimeout(() => {
					if (window.gameModule) {
						window.gameModule.removeCardFromBoardVisual(destroyedCard, row, 'player');
					}
				}, 500);
			}
		}
		
		if (window.gameModule) {
			window.gameModule.updateRowStrength(row, 'player');
			window.gameModule.displayPlayerDiscard();
			window.gameModule.displayOpponentDiscard();
			
			if (window.gameModule.completeCardPlay) {
				setTimeout(() => {
					window.gameModule.completeCardPlay();
				}, 1500);
			}
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_damage');
		}
	},

	updateCardDisplay: function(card, row) {
		if (window.gameModule && window.gameModule.updateCardStrengthDisplay) {
			window.gameModule.updateCardStrengthDisplay(card, row, 'player');
		}
	},

	createDamageVisualEffect: function(card, row, damageValue) {
		const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
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

	evaluateDestroyCard: function(card) {
    let score = 20;
    
    // Находим самую сильную карту игрока
    const strongestPlayerCard = this.findStrongestPlayerCard();
    
    if (strongestPlayerCard) {
        const cardStrength = strongestPlayerCard.card.strength || 0;
        
        // Чем сильнее карта, тем ценнее ее уничтожение
        score += cardStrength * 2;
        
        // Бонус за уничтожение золотых/особых карт
        if (strongestPlayerCard.card.rarity === 'gold') {
            score += 10;
        }
        
        // Бонус за уничтожение карт с тегами (особые способности)
        if (strongestPlayerCard.card.tags && strongestPlayerCard.card.tags.length > 0) {
            score += strongestPlayerCard.card.tags.length * 3;
        }
        
        // Учитываем ситуацию на поле
        const playerTotalScore = this.calculateTotalScore('player');
        const opponentTotalScore = this.calculateTotalScore('opponent');
        
        if (playerTotalScore > opponentTotalScore + 5) {
            // Если игрок лидирует, уничтожение его сильной карты особенно важно
            score += 15;
        }
        
        if (cardStrength >= 8) {
            score += 10;
        }
    } else {
        // Если у игрока нет карт для уничтожения, не играем эту карту
        score = 0;
    }
    
    return score;
},

	findStrongestPlayerCard: function() {
		const rows = ['close', 'ranged', 'siege'];
		let strongestCard = null;
		let maxStrength = -1;
		let cardRow = null;
		
		rows.forEach(row => {
			const rowCards = this.gameState.player.rows[row].cards;
			rowCards.forEach(card => {
				if (this.isHeroCard(card)) {
					return;
				}
				
				if (card.type === 'unit') {
					const strength = card.strength || 0;
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

	evaluateDestroyArtifactCard: function(card) {
		let score = 18;
		
		// Находим артефакты игрока
		const playerArtifacts = this.findPlayerArtifacts();
		
		if (playerArtifacts.length > 0) {
			// Учитываем количество артефактов
			score += playerArtifacts.length * 5;
			
			// Бонус за тактические карты
			const tacticCount = playerArtifacts.filter(a => a.type === 'tactic').length;
			if (tacticCount > 0) {
				score += tacticCount * 8;
			}
			
			// Бонус за сильные/редкие артефакты
			playerArtifacts.forEach(artifact => {
				if (artifact.card.rarity === 'gold') {
					score += 12;
				} else if (artifact.card.rarity === 'silver') {
					score += 6;
				}
				
				// Бонус за артефакты с тегами (особые способности)
				if (artifact.card.tags && artifact.card.tags.length > 0) {
					score += artifact.card.tags.length * 4;
				}
			});
			
			// Учитываем ситуацию на поле
			const playerTotalScore = this.calculateTotalScore('player');
			const opponentTotalScore = this.calculateTotalScore('opponent');
			
			if (playerTotalScore > opponentTotalScore + 10) {
				// Если игрок сильно лидирует, уничтожение его артефактов менее важно
				score -= 5;
			} else if (playerTotalScore < opponentTotalScore) {
				// Если мы проигрываем, уничтожение артефактов может помочь
				score += 10;
			}
		} else {
			// Если у игрока нет артефактов, не играем эту карту
			score = 0;
		}
		
		return score;
	},

	playSpecialBoostCard: function(card) {
		const ability = card.ability;
		
		if (ability.startsWith('boost_row_')) {
			this.playSpecialRowBoostCard(card);
		} else if (ability.startsWith('boost_tag_')) {
			this.playSpecialTagBoostCard(card);
		} else if (ability.startsWith('boost_') && !ability.startsWith('boost_near_')) {
			this.playSpecialCardBoostCard(card);
		} else if (ability.startsWith('boost_near_')) {
			this.playSpecialNearBoostCard(card);
		}
	},

	playSpecialRowBoostCard: function(card) {
		const boostMatch = card.ability.match(/boost_row_(\d+)/);
		const boostValue = boostMatch ? parseInt(boostMatch[1]) : 1;
		const bestRow = this.findBestRowForBoost(boostValue);
		
		if (!bestRow) return;
		
		// Применяем усиление
		const rowState = this.gameState.opponent.rows[bestRow];
		let boostedCards = 0;
		
		rowState.cards.forEach(unitCard => {
			if (unitCard.type === 'unit' && !this.isHeroCard(unitCard)) {
				// Инициализируем поля
				if (unitCard.baseStrength === undefined) {
					unitCard.baseStrength = unitCard.strength;
				}
				if (unitCard.modifiedStrength === undefined) {
					unitCard.modifiedStrength = unitCard.strength;
				}
				if (unitCard.currentStrength === undefined) {
					unitCard.currentStrength = unitCard.strength;
				}
				
				// Применяем усиление
				unitCard.modifiedStrength += boostValue;
				
				if (!unitCard.underWeather) {
					unitCard.currentStrength = unitCard.modifiedStrength;
					unitCard.strength = unitCard.modifiedStrength;
				}
				
				this.createBoostVisualEffect(unitCard, bestRow, boostValue);
				
				if (window.gameModule) {
					window.gameModule.updateCardStrengthDisplay(unitCard, bestRow, 'opponent');
				}
				
				boostedCards++;
			}
		});
		
		if (boostedCards > 0) {
			// Удаляем карту из руки
			this.removeCardFromHand(card);
			
			// Добавляем в сброс
			const cardCopy = { ...card };
			this.gameState.opponent.discard.push(cardCopy);
			
			if (window.gameModule) {
				window.gameModule.updateRowStrength(bestRow, 'opponent');
				window.gameModule.displayOpponentDiscard();
				
				setTimeout(() => {
					if (window.gameModule.completeCardPlay) {
						window.gameModule.completeCardPlay();
					}
				}, 1000);
			}
			
			if (window.audioManager && window.audioManager.playSound) {
				audioManager.playSound('card_boost');
			}
		}
	},

	playSpecialTagBoostCard: function(card) {
		let tag = '';
		let boostValue = 1;
		
		if (card.ability === 'boost_tag_witcher') {
			tag = 'witcher';
			boostValue = 3;
		} else if (card.ability === 'boost_tag_criminal') {
			tag = 'criminal';
			boostValue = 2;
		}
		
		if (!tag) return;
		
		// Находим лучший ряд для усиления по тегу
		const bestRow = this.findBestRowForTagBoost(tag, boostValue);
		
		if (!bestRow) return;
		
		const rowState = this.gameState.opponent.rows[bestRow];
		let boostedCards = 0;
		
		rowState.cards.forEach(unitCard => {
			if (unitCard.type === 'unit' && 
				!this.isHeroCard(unitCard) && 
				unitCard.tags && 
				unitCard.tags.includes(tag)) {
				
				if (unitCard.baseStrength === undefined) {
					unitCard.baseStrength = unitCard.strength;
				}
				if (unitCard.modifiedStrength === undefined) {
					unitCard.modifiedStrength = unitCard.strength;
				}
				if (unitCard.currentStrength === undefined) {
					unitCard.currentStrength = unitCard.strength;
				}
				
				unitCard.modifiedStrength += boostValue;
				
				if (!unitCard.underWeather) {
					unitCard.currentStrength = unitCard.modifiedStrength;
					unitCard.strength = unitCard.modifiedStrength;
				}
				
				this.createBoostVisualEffect(unitCard, bestRow, boostValue);
				
				if (window.gameModule) {
					window.gameModule.updateCardStrengthDisplay(unitCard, bestRow, 'opponent');
				}
				
				boostedCards++;
			}
		});
		
		if (boostedCards > 0) {
			this.removeCardFromHand(card);
			
			const cardCopy = { ...card };
			this.gameState.opponent.discard.push(cardCopy);
			
			if (window.gameModule) {
				window.gameModule.updateRowStrength(bestRow, 'opponent');
				window.gameModule.displayOpponentDiscard();
				
				setTimeout(() => {
					if (window.gameModule.completeCardPlay) {
						window.gameModule.completeCardPlay();
					}
				}, 1000);
			}
			
			if (window.audioManager && window.audioManager.playSound) {
				audioManager.playSound('card_boost');
			}
		}
	},

	playSpecialCardBoostCard: function(card) {
		const boostMatch = card.ability.match(/boost_(\d+)/);
		const boostValue = boostMatch ? parseInt(boostMatch[1]) : 1;
		const bestTarget = this.findBestCardForBoost(boostValue);
		
		if (!bestTarget) return;
		
		const { card: targetCard, row: targetRow, position } = bestTarget;
		
		// Применяем усиление
		if (targetCard.baseStrength === undefined) {
			targetCard.baseStrength = targetCard.strength;
		}
		if (targetCard.modifiedStrength === undefined) {
			targetCard.modifiedStrength = targetCard.strength;
		}
		if (targetCard.currentStrength === undefined) {
			targetCard.currentStrength = targetCard.strength;
		}
		
		targetCard.modifiedStrength += boostValue;
		
		if (!targetCard.underWeather) {
			targetCard.currentStrength = targetCard.modifiedStrength;
			targetCard.strength = targetCard.modifiedStrength;
		}
		
		this.createBoostVisualEffect(targetCard, targetRow, boostValue);
		
		if (window.gameModule) {
			window.gameModule.updateCardStrengthDisplay(targetCard, targetRow, 'opponent');
		}
		
		// Удаляем карту из руки
		this.removeCardFromHand(card);
		
		// Добавляем в сброс
		const cardCopy = { ...card };
		this.gameState.opponent.discard.push(cardCopy);
		
		if (window.gameModule) {
			window.gameModule.updateRowStrength(targetRow, 'opponent');
			window.gameModule.displayOpponentDiscard();
			
			setTimeout(() => {
				if (window.gameModule.completeCardPlay) {
					window.gameModule.completeCardPlay();
				}
			}, 1000);
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_boost');
		}
	},

	playSpecialNearBoostCard: function(card) {
		const boostMatch = card.ability.match(/boost_near_(\d+)/);
		const boostValue = boostMatch ? parseInt(boostMatch[1]) : 1;
		const bestPosition = this.findBestPositionForNearBoost(boostValue);
		
		if (!bestPosition) return;
		
		const { row, position, neighborCount } = bestPosition;
		const rowState = this.gameState.opponent.rows[row];
		
		// Усиливаем соседние карты
		if (position > 0) {
			const leftCard = rowState.cards[position - 1];
			if (leftCard.type === 'unit' && !this.isHeroCard(leftCard)) {
				if (leftCard.baseStrength === undefined) {
					leftCard.baseStrength = leftCard.strength;
				}
				if (leftCard.modifiedStrength === undefined) {
					leftCard.modifiedStrength = leftCard.strength;
				}
				if (leftCard.currentStrength === undefined) {
					leftCard.currentStrength = leftCard.strength;
				}
				
				leftCard.modifiedStrength += boostValue;
				
				if (!leftCard.underWeather) {
					leftCard.currentStrength = leftCard.modifiedStrength;
					leftCard.strength = leftCard.modifiedStrength;
				}
				
				this.createBoostVisualEffect(leftCard, row, boostValue);
				
				if (window.gameModule) {
					window.gameModule.updateCardStrengthDisplay(leftCard, row, 'opponent');
				}
			}
		}
		
		if (position < rowState.cards.length) {
			const rightCard = rowState.cards[position];
			if (rightCard.type === 'unit' && !this.isHeroCard(rightCard)) {
				if (rightCard.baseStrength === undefined) {
					rightCard.baseStrength = rightCard.strength;
				}
				if (rightCard.modifiedStrength === undefined) {
					rightCard.modifiedStrength = rightCard.strength;
				}
				if (rightCard.currentStrength === undefined) {
					rightCard.currentStrength = rightCard.strength;
				}
				
				rightCard.modifiedStrength += boostValue;
				
				if (!rightCard.underWeather) {
					rightCard.currentStrength = rightCard.modifiedStrength;
					rightCard.strength = rightCard.modifiedStrength;
				}
				
				this.createBoostVisualEffect(rightCard, row, boostValue);
				
				if (window.gameModule) {
					window.gameModule.updateCardStrengthDisplay(rightCard, row, 'opponent');
				}
			}
		}
		
		// Удаляем карту из руки
		this.removeCardFromHand(card);
		
		// Добавляем в сброс
		const cardCopy = { ...card };
		this.gameState.opponent.discard.push(cardCopy);
		
		if (window.gameModule) {
			window.gameModule.updateRowStrength(row, 'opponent');
			window.gameModule.displayOpponentDiscard();
			
			setTimeout(() => {
				if (window.gameModule.completeCardPlay) {
					window.gameModule.completeCardPlay();
				}
			}, 1000);
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_boost');
		}
	},

	createBoostVisualEffect: function(card, row, boostValue) {
		const rowElement = document.getElementById(`opponent${this.capitalizeFirst(row)}Row`);
		if (!rowElement) return;
		
		const cardElement = rowElement.querySelector(`[data-card-id="${card.id}"]`);
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

	findPlayerArtifacts: function() {
		const artifacts = [];
		const rows = ['close', 'ranged', 'siege'];
		
		rows.forEach(row => {

			const rowCards = this.gameState.player.rows[row].cards || [];
			rowCards.forEach(card => {
				if (card.type === 'artifact') {
					artifacts.push({
						card: card,
						row: row,
						type: 'artifact',
						location: 'row',
						position: rowCards.indexOf(card)
					});
				}
			});
		});
		
		return artifacts;
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
			
	if (card.ability === 'medic') {
		const strongInDiscard = (this.gameState.opponent.discard || []).filter(c =>
			c.type === 'unit' && !this.isHeroCard(c)
		).length;
		score += Math.min(strongInDiscard, 3) * 4;
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
 
	playArtifactBoostCard: function(card) {
		const ability = card.ability;
		
		if (ability.startsWith('boost_') && !ability.startsWith('boost_near_')) {
			this.playCardBoostArtifact(card);
		} else if (ability.startsWith('boost_near_')) {
			this.playNearBoostArtifact(card);
		}
	},

	playCardBoostArtifact: function(card) {
		const boostMatch = card.ability.match(/boost_(\d+)/);
		const boostValue = boostMatch ? parseInt(boostMatch[1]) : 1;
		const bestTarget = this.findBestCardForBoost(boostValue);
		
		if (!bestTarget) {
			this.usedCardIds.delete(card.id);
			return;
		}
		
		this.executeCardBoostForAI(card, bestTarget);
	},

	playNearBoostArtifact: function(card) {
		const boostMatch = card.ability.match(/boost_near_(\d+)/);
		const boostValue = boostMatch ? parseInt(boostMatch[1]) : 1;
		const bestPosition = this.findBestPositionForNearBoost(boostValue);
		
		if (!bestPosition) {
			this.usedCardIds.delete(card.id);
			return;
		}
		
		this.executeNearBoostForAI(card, bestPosition);
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
    
	evaluateDecoyCard: function(card) {
    let score = 15;
    
    // Ищем слабые карты на своем поле, которые можно вернуть в руку
    const weakCards = this.getWeakCardsOnBoard();
    if (weakCards.length > 0) {
        score += weakCards.length * 5;
    }
    
    // Учитываем наличие сильных карт в руке, которые можно сыграть повторно
    const strongCardsInHand = this.gameState.opponent.hand.filter(c => 
        c.strength > 8 && c.type === 'unit'
    );
    if (strongCardsInHand.length > 0) {
        score += 10;
    }
    
    return score;
},

	getWeakCardsOnBoard: function() {
		const weakCards = [];
		const rows = ['close', 'ranged', 'siege'];
		
		rows.forEach(row => {
			this.gameState.opponent.rows[row].cards.forEach((card, index) => {
				if (this.isHeroCard(card)) {
					return;
				}
				
				if (card.type === 'unit') {
					let currentStrength = card.currentStrength;
					if (currentStrength === undefined && card.modifiedStrength !== undefined) {
						currentStrength = card.modifiedStrength;
					}
					if (currentStrength === undefined) {
						currentStrength = card.strength;
					}
					
					const baseStrength = card.baseStrength || card.strength || 0;
					const isVeryWeak = currentStrength <= 3;
					const isDamaged = currentStrength < baseStrength;
					const isUnderWeatherButValuable = card.underWeather === true && baseStrength >= 6;
					
					if (isVeryWeak || isDamaged || isUnderWeatherButValuable) {
						let score = 10 - currentStrength;
						
						if (isDamaged) {
							score += (baseStrength - currentStrength) * 2;
						}
						
						if (isUnderWeatherButValuable) {
							score += baseStrength;
						}
						
						if (card.rarity === 'gold') {
							score += 15;
						} else if (card.rarity === 'silver') {
							score += 8;
						}
						
						weakCards.push({
							card: card,
							row: row,
							position: index,
							currentStrength: currentStrength,
							baseStrength: baseStrength,
							score: score
						});
					}
				}
			});
		});
		
		return weakCards.sort((a, b) => b.score - a.score);
	},

	playCard: function(card) {
		const instanceId = `${card.id}_${card.uniqueId || Date.now()}`;
		this.usedCardInstances.set(instanceId, true);
		
		if (card.copy && card.copy > 1) {
			const usedCount = this.usedCardInstances.get(card.id) || 0;
			this.usedCardInstances.set(card.id, usedCount + 1);
		}
		
		this.removeCardFromHand(card);
		
		if (card.ability === 'flock') {
        this.playFlockCard(card);
		}
		else if (card.ability === 'call_rat' || card.ability === 'call_driad') {
			this.playCallCard(card);
		}
		else if (this.isWeatherCard(card)) {
			this.playWeatherCard(card);
		}
		else if (card.ability === 'double_row_strength') {  
			this.playDoubleStrengthCard(card);          
		}
		else if (card.ability === 'destroy' && card.type === 'unit') {
			this.playUnitDestroyCard(card);
		}
		else if (card.type === 'tactic') {
			if (card.ability && card.ability.startsWith('boost_')) {
				this.playBoostCard(card);
			} else {
				this.playTacticCard(card);
			}
		} else if (card.type === 'artifact') {
			if (card.ability && card.ability.startsWith('boost_')) {
				this.playArtifactBoostCard(card);
			} else {
				this.playUnitCard(card);
			}
		} else if (card.ability === 'decoy') {
			this.playDecoyCard(card);
		} else if (card.ability === 'destroy') {
			this.playDestroyCard(card);
		} else if (card.ability === 'destroy_artf') {
			this.playDestroyArtifactCard(card);
		} else if (card.ability && card.ability.startsWith('damage_')) {
			this.playDamageCard(card);
		} else if (card.ability && card.ability.startsWith('boost_')) {
			this.playSpecialBoostCard(card);
		} else {
			const isSpy = window.gameModule && window.gameModule.isSpyCard(card);
			
			if (isSpy) {
				this.playSpyCard(card);
			} else {
				this.playUnitCard(card);
			}
		}
	},

	playFlockCard: function(card) {
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
			this.gameState.opponent.rows[row].cards.length < 9
		);
		
		if (availableRows.length === 0) {
			this.usedCardIds.delete(card.id);
			return;
		}
		
		let bestRow = availableRows[0];
		let maxStrength = this.gameState.opponent.rows[bestRow].strength;
		
		for (let row of availableRows) {
			const rowStrength = this.gameState.opponent.rows[row].strength;
			if (rowStrength > maxStrength) {
				maxStrength = rowStrength;
				bestRow = row;
			}
		}
		
		const rowState = this.gameState.opponent.rows[bestRow];
		const insertIndex = rowState.cards.length;
		
		const cardCopy = { ...card };
		cardCopy.owner = 'opponent';
		cardCopy.row = bestRow;
		cardCopy.uniqueId = `${card.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		cardCopy.baseStrength = card.strength;
		cardCopy.currentStrength = card.strength;
		cardCopy.modifiedStrength = card.strength;
		cardCopy.underWeather = false;
		
		rowState.cards.splice(insertIndex, 0, cardCopy);
		
		if (window.gameModule) {
			window.gameModule.displayCardOnRow(bestRow, cardCopy, 'opponent', insertIndex);
			window.gameModule.updateRowStrength(bestRow, 'opponent');
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_close');
		}
		
		setTimeout(() => {
			this.activateFlockAbilityForAI(cardCopy);
		}, 300);
	},

	playCallCard: function(card) {
		// Проверяем, есть ли место для размещения основной карты
		let mainCardRow = this.findBestRowForUnit(card);
		if (!mainCardRow) {
			this.usedCardIds.delete(card.id);
			return;
		}
		
		// Размещаем основную карту
		const rowState = this.gameState.opponent.rows[mainCardRow];
		const insertIndex = rowState.cards.length;
		
		const cardCopy = { 
			...card,
			uniqueId: `${card.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			owner: 'opponent',
			row: mainCardRow
		};
		
		rowState.cards.splice(insertIndex, 0, cardCopy);
		
		if (window.gameModule) {
			window.gameModule.displayCardOnRow(mainCardRow, cardCopy, 'opponent', insertIndex);
			window.gameModule.updateRowStrength(mainCardRow, 'opponent');
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_close');
		}
		
		// Активируем способность призыва
		if (card.summon) {
			setTimeout(() => {
				this.activateCallAbilityForAI(cardCopy, card.summon);
			}, 300);
		} else {
			console.warn(`AI: Карта ${card.name} имеет способность 'call', но не указано поле 'summon'.`);
			if (window.gameModule) {
				window.gameModule.completeCardPlay();
			}
		}
	},

	activateCallAbilityForAI: function(playedCard, summonedCardName) {
		console.log(`=== AI активирует способность "Призыв" для карты: ${summonedCardName} ===`);
		
		// 1. Найти карту для призыва
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
			console.error(`AI: Не удалось найти карту для призыва: ${summonedCardName}`);
			if (window.gameModule) window.gameModule.completeCardPlay();
			return;
		}

		console.log(`AI: Нужно призвать ${summonCopyCount} копий карты ${summonedCardName}`);
		
		let summonedCount = 0;
		
		for (let i = 0; i < summonCopyCount; i++) {
			// Находим лучший ряд для призыва
			let targetRow = this.getBestRowForFlockSummon(cardToSummon);
			
			if (!targetRow) {
				console.warn(`AI: Нет места для ${i+1}-й копии карты "${summonedCardName}"!`);
				break;
			}

			// Создаем и размещаем копию
			const summonCopy = window.gameModule.createCardCopy(cardToSummon);
			summonCopy.summonedByCall = true;
			
			const rowState = this.gameState.opponent.rows[targetRow];
			if (rowState.cards.length >= 9) {
				break;
			}

			const insertPosition = rowState.cards.length;
			rowState.cards.push(summonCopy);
			
			if (window.gameModule) {
				window.gameModule.displayCardOnRow(targetRow, summonCopy, 'opponent', insertPosition);
				window.gameModule.updateRowStrength(targetRow, 'opponent');
			}
			
			summonedCount++;
		}

		const message = summonedCount === summonCopyCount 
			? `Противник призывает ${summonedCount} ${summonedCount === 1 ? summonedCardName : (summonedCardName === 'Крыса' ? 'Крысы' : summonedCardName + 'ов')}!`
			: `Противник призывает только ${summonedCount} из ${summonCopyCount} карт!`;
		
		if (window.gameModule) {
			window.gameModule.showGameMessage(message, 'warning');
			
			setTimeout(() => {
				if (window.gameModule && window.gameModule.completeCardPlay) {
					window.gameModule.completeCardPlay();
				}
			}, 800);
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_close');
		}
	},

	activateFlockAbilityForAI: function(playedCard) {
		let flockTag = null;
		if (playedCard.tagsflock && playedCard.tagsflock.length > 0) {
			flockTag = playedCard.tagsflock[0];
		}
		
		if (!flockTag) {
			if (window.gameModule) {
				window.gameModule.completeCardPlay();
			}
			return;
		}
		
		const cardsToSummon = [];
		
		for (let i = 0; i < this.gameState.opponent.hand.length; i++) {
			const handCard = this.gameState.opponent.hand[i];
			
			const hasMatchingFlockTag = handCard.tagsflock && 
				handCard.tagsflock.some(tag => tag === flockTag);
			
			if (handCard.id !== playedCard.id && 
				handCard.type === 'unit' &&
				hasMatchingFlockTag) {
				cardsToSummon.push({ card: handCard, source: 'hand', index: i });
			}
		}
		
		for (let i = 0; i < this.gameState.opponent.deck.length; i++) {
			const deckCard = this.gameState.opponent.deck[i];
			
			const hasMatchingFlockTag = deckCard.tagsflock && 
				deckCard.tagsflock.some(tag => tag === flockTag);
			
			if (deckCard.id !== playedCard.id &&
				deckCard.type === 'unit' &&
				hasMatchingFlockTag) {
				cardsToSummon.push({ card: deckCard, source: 'deck', index: i });
			}
		}
		
		for (let i = cardsToSummon.length - 1; i >= 0; i--) {
			const { card: summonCard, source, index } = cardsToSummon[i];
			
			let targetRow = this.getBestRowForFlockSummon(summonCard);
			
			if (targetRow && this.gameState.opponent.rows[targetRow].cards.length < 9) {
				if (source === 'hand') {
					this.gameState.opponent.hand.splice(index, 1);
				} else if (source === 'deck') {
					this.gameState.opponent.deck.splice(index, 1);
				}
				
				const summonCopy = { ...summonCard };
				summonCopy.owner = 'opponent';
				summonCopy.row = targetRow;
				summonCopy.uniqueId = `${summonCard.id}_flock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
				summonCopy.baseStrength = summonCard.strength;
				summonCopy.currentStrength = summonCard.strength;
				summonCopy.modifiedStrength = summonCard.strength;
				summonCopy.underWeather = false;
				summonCopy.summonedByFlock = true;
				
				this.gameState.opponent.rows[targetRow].cards.push(summonCopy);
				
				if (window.gameModule) {
					window.gameModule.displayCardOnRow(targetRow, summonCopy, 'opponent', 
						this.gameState.opponent.rows[targetRow].cards.length - 1);
					window.gameModule.updateRowStrength(targetRow, 'opponent');
				}
			}
		}
		
		if (window.gameModule) {
			window.gameModule.displayOpponentDeck();
			window.gameModule.completeCardPlay();
		}
		
		if (cardsToSummon.length > 0 && window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_close');
		}
	},

	getBestRowForFlockSummon: function(card) {
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
			this.gameState.opponent.rows[row].cards.length < 9
		);
		
		if (availableRows.length === 0) return null;
		
		let bestRow = availableRows[0];
		let maxStrength = this.gameState.opponent.rows[bestRow].strength;
		
		for (let row of availableRows) {
			const rowStrength = this.gameState.opponent.rows[row].strength;
			if (rowStrength > maxStrength) {
				maxStrength = rowStrength;
				bestRow = row;
			}
		}
		
		return bestRow;
	},

	playSpyCard: function(card) {
		const targetPosition = window.gameModule.getSpyTargetPosition(card);
		let availableRows = [];
		
		if (targetPosition === 'any-row' || (Array.isArray(targetPosition) && targetPosition.includes('any-row'))) {
			availableRows = ['close', 'ranged', 'siege'];
		} else if (Array.isArray(targetPosition)) {
			availableRows = targetPosition.map(pos => pos.replace('-row', ''));
		} else {
			availableRows = [targetPosition.replace('-row', '')];
		}
		
		// Фильтруем ряды, где есть место
		availableRows = availableRows.filter(row => 
			this.gameState.player.rows[row].cards.length < 9
		);
		
		if (availableRows.length === 0) {
			this.usedCardIds.delete(card.id);
			return;
		}
		
		// Выбираем ряд с наименьшей силой (чтобы не давать игроку слишком много очков)
		let bestRow = availableRows[0];
		let minStrength = this.gameState.player.rows[bestRow].strength;
		
		availableRows.forEach(row => {
			const rowStrength = this.gameState.player.rows[row].strength;
			if (rowStrength < minStrength) {
				minStrength = rowStrength;
				bestRow = row;
			}
		});
		
		// Размещаем шпиона в выбранном ряду
		this.placeSpyCardForAI(card, bestRow);
	},

	placeSpyCardForAI: function(card, row) {
		const rowState = this.gameState.player.rows[row];
		let insertIndex = rowState.cards.length;
		
		const cardCopy = { 
			...card,
			uniqueId: `${card.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			owner: 'player',
			row: row,
			isSpy: true
		};
		
		this.removeCardFromHand(card);
		
		rowState.cards.splice(insertIndex, 0, cardCopy);
		
		if (window.gameModule) {
			window.gameModule.displayCardOnRow(row, cardCopy, 'player', insertIndex);
			window.gameModule.updateRowStrength(row, 'player');
			window.gameModule.updateTotalScoreDisplays();
		}
		
		this.gameState.cardsPlayedThisTurn++;
		
		setTimeout(() => {
			this.drawCardForAISpy(card);
			
			setTimeout(() => {
				this.isMakingMove = false;
				if (window.gameModule) {
					window.gameModule.completeCardPlay();
				}
			}, 500);
		}, 500);
		
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
	},

	drawCardForAISpy: function(spyCard) {
		const opponentState = this.gameState.opponent;
		const CARDS_TO_DRAW = 2;
		let drawnCount = 0;
		
		const targetPosition = window.gameModule.getSpyTargetPosition(spyCard);
		
		for (let i = 0; i < CARDS_TO_DRAW; i++) {
			if (opponentState.deck.length === 0) {
				break;
			}
			
			let cardsToSearch = [];
			
			if (targetPosition === 'any-row' || (Array.isArray(targetPosition) && targetPosition.includes('any-row'))) {
				cardsToSearch = [...opponentState.deck];
			} else {
				const targetPositions = Array.isArray(targetPosition) ? targetPosition : [targetPosition];
				
				cardsToSearch = opponentState.deck.filter(card => {
					if (!card.position) return false;
					
					const cardPositions = Array.isArray(card.position) ? card.position : [card.position];
					
					return cardPositions.some(pos => 
						targetPositions.includes(pos) && !pos.startsWith('hidden-')
					);
				});
			}
			
			let drawnCard = null;
			
			if (cardsToSearch.length === 0) {
				// Если нет карт с нужной позицией, берем любую
				const randomIndex = Math.floor(Math.random() * opponentState.deck.length);
				drawnCard = opponentState.deck.splice(randomIndex, 1)[0];
			} else {
				const randomIndex = Math.floor(Math.random() * cardsToSearch.length);
				drawnCard = cardsToSearch[randomIndex];
				
				const deckIndex = opponentState.deck.findIndex(c => c.id === drawnCard.id);
				if (deckIndex !== -1) {
					opponentState.deck.splice(deckIndex, 1);
				}
			}
			
			if (drawnCard) {
				opponentState.hand.push(drawnCard);
				drawnCount++;
			}
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_draw');
		}
		
		// Обновляем отображение колоды ИИ
		if (window.gameModule && window.gameModule.displayOpponentDeck) {
			window.gameModule.displayOpponentDeck();
		}
	},

	playBoostCard: function(card) {
		const ability = card.ability;
		
		if (ability.startsWith('boost_row_')) {
			this.playRowBoostCard(card);
		} else if (ability.startsWith('boost_tag_')) {
			this.playTagBoostCard(card);
		}
	},

	playRowBoostCard: function(card) {
		const boostMatch = card.ability.match(/boost_row_(\d+)/);
		const boostValue = boostMatch ? parseInt(boostMatch[1]) : 1;
		
		// Находим любой свободный тактический слот
		const rows = ['close', 'ranged', 'siege'];
		const availableRows = rows.filter(row => 
			!this.gameState.opponent.rows[row].tactic &&
			this.gameState.opponent.rows[row].cards.some(card => 
				card.type === 'unit' && !this.isHeroCard(card)
			)
		);
		
		if (availableRows.length === 0) {
			this.usedCardIds.delete(card.id);
			return;
		}
		
		const randomRow = availableRows[Math.floor(Math.random() * availableRows.length)];
		
		// Размещаем карту тактики
		this.gameState.opponent.rows[randomRow].tactic = card;
		
		// Применяем эффект усиления
		const rowState = this.gameState.opponent.rows[randomRow];
		rowState.cards.forEach(unitCard => {
			if (unitCard.type === 'unit' && !this.isHeroCard(unitCard)) {
				// Инициализируем поля
				if (unitCard.baseStrength === undefined) {
					unitCard.baseStrength = unitCard.strength;
				}
				if (unitCard.modifiedStrength === undefined) {
					unitCard.modifiedStrength = unitCard.strength;
				}
				if (unitCard.currentStrength === undefined) {
					unitCard.currentStrength = unitCard.strength;
				}
				
				// Применяем усиление
				unitCard.modifiedStrength += boostValue;
				
				// Если карта не под погодой, обновляем текущую силу
				if (!unitCard.underWeather) {
					unitCard.currentStrength = unitCard.modifiedStrength;
					unitCard.strength = unitCard.modifiedStrength;
				}
				
				this.createBoostVisualEffect(unitCard, randomRow, boostValue);
				
				// Обновляем отображение
				if (window.gameModule) {
					window.gameModule.updateCardStrengthDisplay(unitCard, randomRow, 'opponent');
				}
			}
		});
		
		if (window.gameModule) {
			window.gameModule.displayTacticCard(randomRow, card, 'opponent');
			window.gameModule.updateRowStrength(randomRow, 'opponent');
			
			setTimeout(() => {
				if (window.gameModule.completeCardPlay) {
					window.gameModule.completeCardPlay();
				}
			}, 1000);
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_boost');
		}
	},

	playTagBoostCard: function(card) {
		let tag = '';
		let boostValue = 1;
		
		if (card.ability === 'boost_tag_witcher') {
			tag = 'witcher';
			boostValue = 3;
		} else if (card.ability === 'boost_tag_criminal') {
			tag = 'criminal';
			boostValue = 2;
		}
		
		if (!tag) {
			this.usedCardIds.delete(card.id);
			return;
		}
		
		// Находим свободный тактический слот, где есть карты с нужным тегом
		const rows = ['close', 'ranged', 'siege'];
		const availableRows = rows.filter(row => 
			!this.gameState.opponent.rows[row].tactic &&
			this.gameState.opponent.rows[row].cards.some(card => 
				card.type === 'unit' && 
				!this.isHeroCard(card) && 
				card.tags && 
				card.tags.includes(tag)
			)
		);
		
		if (availableRows.length === 0) {
			this.usedCardIds.delete(card.id);
			return;
		}
		
		const randomRow = availableRows[Math.floor(Math.random() * availableRows.length)];
		
		// Размещаем карту тактики
		this.gameState.opponent.rows[randomRow].tactic = card;
		
		// Применяем эффект усиления по тегу
		const rowState = this.gameState.opponent.rows[randomRow];
		let boostedCards = 0;
		
		rowState.cards.forEach(unitCard => {
			if (unitCard.type === 'unit' && 
				!this.isHeroCard(unitCard) && 
				unitCard.tags && 
				unitCard.tags.includes(tag)) {
				
				// Инициализируем поля
				if (unitCard.baseStrength === undefined) {
					unitCard.baseStrength = unitCard.strength;
				}
				if (unitCard.modifiedStrength === undefined) {
					unitCard.modifiedStrength = unitCard.strength;
				}
				if (unitCard.currentStrength === undefined) {
					unitCard.currentStrength = unitCard.strength;
				}
				
				// Применяем усиление
				unitCard.modifiedStrength += boostValue;
				
				// Если карта не под погодой, обновляем текущую силу
				if (!unitCard.underWeather) {
					unitCard.currentStrength = unitCard.modifiedStrength;
					unitCard.strength = unitCard.modifiedStrength;
				}
				
				this.createBoostVisualEffect(unitCard, randomRow, boostValue);
				
				// Обновляем отображение
				if (window.gameModule) {
					window.gameModule.updateCardStrengthDisplay(unitCard, randomRow, 'opponent');
				}
				
				boostedCards++;
			}
		});
		
		if (window.gameModule) {
			window.gameModule.displayTacticCard(randomRow, card, 'opponent');
			window.gameModule.updateRowStrength(randomRow, 'opponent');
			
			setTimeout(() => {
				if (window.gameModule.completeCardPlay) {
					window.gameModule.completeCardPlay();
				}
			}, 1000);
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_boost');
		}
	},

	createBoostVisualEffect: function(card, row, boostValue) {
		const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
		if (!rowElement) return;
		
		const cardElement = rowElement.querySelector(`[data-card-id="${card.id}"]`);
		if (!cardElement) return;
		
		// Создаем эффект усиления - ЗЕЛЕНЫЙ ЦВЕТ
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
		
		// Удаляем эффект через 0.8 секунды
		setTimeout(() => {
			if (boostOverlay.parentNode) {
				boostOverlay.remove();
			}
		}, 800);
	},

	findBestRowForTagBoost: function(tag, boostValue) {
		const rows = ['close', 'ranged', 'siege'];
		let bestRow = null;
		let bestScore = -1;
		
		rows.forEach(row => {
			// Не размещаем в рядах с уже установленной тактической картой
			if (this.gameState.opponent.rows[row].tactic) {
				return;
			}
			
			const rowState = this.gameState.opponent.rows[row];
			
			// Считаем карты с нужным тегом в этом ряду
			const tagCards = rowState.cards.filter(card => 
				card.type === 'unit' && 
				!this.isHeroCard(card) && 
				card.tags && 
				card.tags.includes(tag)
			);
			
			if (tagCards.length === 0) return;
			
			let score = 0;
			
			// Базовый бонус за количество карт с тегом
			score += tagCards.length * 10;
			
			// Бонус за общую силу карт с тегом
			const tagCardsStrength = tagCards.reduce((sum, card) => 
				sum + (card.strength || 0), 0
			);
			score += tagCardsStrength * 0.5;
			
			// Бонус за значение усиления
			score += boostValue * 2;
			
			// Бонус за синергию (много карт одного тега в одном ряду)
			if (tagCards.length >= 2) {
				score += 15;
			}
			
			// Бонус за ряды без погоды
			if (!this.gameState.weather.effects[row]) {
				score += 5;
			}
			
			if (score > bestScore) {
				bestScore = score;
				bestRow = row;
			}
		});
		
		return bestRow;
	},

	playDestroyArtifactCard: function(card) {
    // Находим артефакты игрока
    const playerArtifacts = this.findPlayerArtifacts();
    
    if (playerArtifacts.length === 0) {
        // Если нет целей, не играем эту карту
        this.usedCardIds.delete(card.id);
        return;
    }
    
    // Выбираем лучший артефакт для уничтожения
    const bestArtifact = this.selectBestArtifactToDestroy(playerArtifacts);
    
    if (bestArtifact) {
        // Выполняем уничтожение
        this.executeArtifactDestroy(card, bestArtifact);
    }
},

	selectBestArtifactToDestroy: function(artifacts) {
		if (artifacts.length === 0) return null;
		
		const scoredArtifacts = artifacts.map(artifact => ({
			artifact: artifact,
			score: this.evaluateArtifactForDestruction(artifact)
		}));
		
		// Сортируем по убыванию оценки
		scoredArtifacts.sort((a, b) => b.score - a.score);
		
		return scoredArtifacts[0].artifact;
	},

	evaluateArtifactForDestruction: function(artifact) {
		let score = 0;
		
		// Тактические карты приоритетнее
		if (artifact.type === 'tactic') {
			score += 20;
		}
		
		// Редкие карты приоритетнее
		if (artifact.card.rarity === 'gold') {
			score += 15;
		} else if (artifact.card.rarity === 'silver') {
			score += 10;
		}
		
		// Артефакты с тегами (особые способности)
		if (artifact.card.tags && artifact.card.tags.length > 0) {
			score += artifact.card.tags.length * 5;
		}
		
		// Учитываем силу (если есть)
		if (artifact.card.strength) {
			score += artifact.card.strength * 2;
		}
		
		// Учитываем положение на поле (центральные ряды важнее)
		if (artifact.row === 'ranged') {
			score += 3;
		}
		
		return score;
	},

	executeArtifactDestroy: function(destroyCard, artifactData) {
		const { card: targetCard, row: targetRow, type: targetType } = artifactData;
		
		// Удаляем карту из руки
		this.removeCardFromHand(destroyCard);
		
		// Добавляем карту в сброс противника (AI)
		const destroyCardCopy = { ...destroyCard };
		this.gameState.opponent.discard.push(destroyCardCopy);
		
		// Удаляем ТОЛЬКО артефакты (не тактики)
		if (targetType === 'artifact') {
			const rowState = this.gameState.player.rows[targetRow];
			const cardIndex = rowState.cards.findIndex(c => c.id === targetCard.id);
			
			if (cardIndex !== -1) {
				// Получаем информацию об артефакте до его удаления
				const artifactCard = rowState.cards[cardIndex];
				const artifactAbility = artifactCard.ability;
				
				// Проверяем, усиливал ли артефакт карты
				if (artifactAbility && artifactAbility.startsWith('boost_')) {
					// Отменяем усиление
					this.revertArtifactBoostForAI(artifactCard, targetRow, cardIndex);
				}
				
				// Создаем ОДНУ копию для сброса
				const destroyedCard = { ...rowState.cards[cardIndex] };
				
				// Удаляем из ряда
				rowState.cards.splice(cardIndex, 1);
				
				// Добавляем ТОЛЬКО ОДНУ копию в сброс игрока
				this.gameState.player.discard.push(destroyedCard);
				
				// Обновляем отображение
				if (window.gameModule) {
					window.gameModule.removeCardFromBoardVisual(targetCard, targetRow, 'player');
					
					// Обновляем все карты в ряду
					rowState.cards.forEach(unitCard => {
						if (unitCard.type === 'unit') {
							window.gameModule.updateCardStrengthDisplay(unitCard, targetRow, 'player');
						}
					});
					
					window.gameModule.updateRowStrength(targetRow, 'player');
				}
			}
		}
		
		// Воспроизводим звук
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_destroy');
		}
		
		// Обновляем сбросы
		if (window.gameModule) {
			window.gameModule.displayPlayerDiscard();
			window.gameModule.displayOpponentDiscard();
			
			// Завершаем ход
			if (window.gameModule.completeCardPlay) {
				setTimeout(() => {
					window.gameModule.completeCardPlay();
				}, 1000);
			}
		}
	},

	revertArtifactBoostForAI: function(artifactCard, row, artifactPosition) {
		const rowState = this.gameState.player.rows[row];
		
		// Проверяем, есть ли сохранённая информация об усиленных картах
		if (artifactCard.boostedCards && Array.isArray(artifactCard.boostedCards)) {
			// Это артефакт типа boost_near_
			artifactCard.boostedCards.forEach(boostInfo => {
				const boostedCard = this.findCardInRow(rowState.cards, boostInfo.cardId, boostInfo.uniqueId);
				if (boostedCard) {
					this.removeBoostFromCardForAI(boostedCard, boostInfo.boostValue, row);
				}
			});
		} else if (artifactCard.boostedCardId) {
			// Это артефакт типа boost_
			const boostedCard = this.findCardInRow(rowState.cards, artifactCard.boostedCardId, artifactCard.boostedCardUniqueId);
			if (boostedCard) {
				this.removeBoostFromCardForAI(boostedCard, artifactCard.boostValue, row);
			}
		}
	},

	findCardInRow: function(cards, cardId, uniqueId) {
		if (uniqueId) {
			return cards.find(c => c.uniqueId === uniqueId) || 
				   cards.find(c => c.id === cardId);
		}
		return cards.find(c => c.id === cardId);
	},

	removeBoostFromCardForAI: function(card, boostValue, row) {
		// Инициализируем поля, если нужно
		if (card.baseStrength === undefined) {
			card.baseStrength = card.strength;
		}
		if (card.modifiedStrength === undefined) {
			card.modifiedStrength = card.strength;
		}
		if (card.currentStrength === undefined) {
			card.currentStrength = card.strength;
		}
		
		// Уменьшаем modifiedStrength
		card.modifiedStrength = Math.max(card.baseStrength || 0, card.modifiedStrength - boostValue);
		
		// Обновляем currentStrength
		if (!card.underWeather) {
			card.currentStrength = card.modifiedStrength;
			card.strength = card.modifiedStrength;
		}
		
		// Визуальный эффект снятия усиления
		this.createBoostRemoveVisualEffectForAI(card, row, boostValue);
	},

	createBoostRemoveVisualEffectForAI: function(card, row, boostValue) {
		const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
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

	playDestroyCard: function(card) {
		// Находим самые сильные карты на поле у обоих игроков
		const strongestCards = this.findStrongestCardsOnBoard();
		
		if (strongestCards.length === 0) {
			this.usedCardIds.delete(card.id);
			return;
		}
		
		// Выполняем уничтожение
		this.executeDestroyCard(card, strongestCards);
	},
	
	executeDestroyCard: function(destroyCard, strongestCards) {
		// Удаляем Казнь из руки
		this.removeCardFromHand(destroyCard);
		
		// Добавляем Казнь в сброс ИИ
		const destroyCardCopy = { ...destroyCard };
		this.gameState.opponent.discard.push(destroyCardCopy);
		
		let destroyedCount = 0;
		
		// Уничтожаем все карты-цели (у обоих игроков)
		strongestCards.forEach(({ card: targetCard, row: targetRow, owner }) => {
			const rowState = this.gameState[owner].rows[targetRow];
			const cardIndex = rowState.cards.findIndex(c => 
				c.id === targetCard.id && 
				(c.uniqueId === undefined || c.uniqueId === targetCard.uniqueId)
			);
			
			if (cardIndex === -1) return;
			
			this.createDestroyVisualEffectForOwner(targetCard, targetRow, owner);
			
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
		
		if (window.gameModule) {
			setTimeout(() => {
				window.gameModule.displayPlayerDiscard();
				window.gameModule.displayOpponentDiscard();
				window.gameModule.updateTotalScoreDisplays();
				
				if (window.gameModule.completeCardPlay) {
					window.gameModule.completeCardPlay();
				}
			}, 600);
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('scorch');
		}
	},
	
	createDestroyVisualEffect: function(card, row) {
		const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
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
	},

	playDecoyCard: function(card) {
    const weakCards = this.getWeakCardsOnBoard();
    
    if (weakCards.length > 0) {
        const bestTarget = weakCards[0];
        this.performDecoySwap(card, bestTarget.card, bestTarget.row);
        
        // Увеличиваем счетчик сыгранных карт
        this.gameState.cardsPlayedThisTurn++;
    } else {
        // Если нет слабых карт, пропускаем эту карту
        this.usedCardIds.delete(card.id); // Убираем из использованных
        return; // Не увеличиваем счетчик и не удаляем карту
    }
},

	performDecoySwap: function(decoyCard, targetCard, row) {
		const rowState = this.gameState.opponent.rows[row];
		const targetIndex = rowState.cards.findIndex(c => c.id === targetCard.id);
		
		if (targetIndex === -1) return;
		
		const cardCopy = { ...targetCard };
		cardCopy.playedThisRound = false;
		
		if (cardCopy.originalStrength !== undefined) {
			cardCopy.strength = cardCopy.originalStrength;
			delete cardCopy.originalStrength;
		}
		
		if (cardCopy.baseStrength !== undefined) {
			cardCopy.strength = cardCopy.baseStrength;
			cardCopy.currentStrength = cardCopy.baseStrength;
			cardCopy.modifiedStrength = cardCopy.baseStrength;
		}
		
		cardCopy.underWeather = false;
		
		this.removeCardFromHand(decoyCard);
		
		rowState.cards.splice(targetIndex, 1);
		
		this.gameState.opponent.hand.push(cardCopy);
		
		const placedDecoy = { ...decoyCard };
		placedDecoy.owner = 'opponent';
		placedDecoy.row = row;
		
		delete placedDecoy.strength;
		delete placedDecoy.currentStrength;
		delete placedDecoy.modifiedStrength;
		delete placedDecoy.baseStrength;
		delete placedDecoy._displayStrength;
		delete placedDecoy.originalStrength;
		
		placedDecoy.underWeather = false;
		placedDecoy.uniqueId = `decoy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		
		rowState.cards.splice(targetIndex, 0, placedDecoy);
		
		if (window.gameModule) {
			window.gameModule.removeCardFromBoardVisual(targetCard, row, 'opponent');
			
			setTimeout(() => {
				window.gameModule.displayCardOnRow(row, placedDecoy, 'opponent', targetIndex);
				window.gameModule.updateRowStrength(row, 'opponent');
				
				if (window.gameModule.displayOpponentDeck) {
					window.gameModule.displayOpponentDeck();
				}
				
				setTimeout(() => {
					if (window.gameModule.completeCardPlay) {
						window.gameModule.completeCardPlay();
					}
				}, 1000);
			}, 300);
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('artefact');
		}
	},

	endAITurn: function() {
		this.isMakingMove = false;
		
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
				window.gameModule.handleRegularWeather(weatherCardWithOwner);
			}
			
			window.gameModule.displayWeatherCards();
			
			setTimeout(() => {
				if (window.gameModule.completeCardPlay) {
					window.gameModule.completeCardPlay();
				}
			}, 100);
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
				
				setTimeout(() => {
					if (window.gameModule.completeCardPlay) {
						window.gameModule.completeCardPlay();
					}
				}, 1000);
			}
		}
	},
    
	playUnitCard: function(card) {
		const bestRow = this.findBestRowForUnit(card);
		if (bestRow) {
			const rowState = this.gameState.opponent.rows[bestRow];
			let insertIndex = rowState.cards.length;
			
			const cardCopy = { 
				...card,
				uniqueId: `${card.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				owner: 'opponent',
				row: bestRow
			};
			
			if (rowState.cards.length > 0) {
				const synergyResult = this.findBestCardForSynergy(card, rowState.cards);
				
				if (synergyResult.score > 0) {
					const placeLeft = Math.random() < 0.5;
					if (placeLeft) {
						insertIndex = synergyResult.index;
					} else {
						insertIndex = synergyResult.index + 1;
					}
				} else {
					const cardStrength = card.strength || 0;
					if (cardStrength >= 8) {
						insertIndex = Math.floor(rowState.cards.length / 2);
					} else if (cardStrength <= 3) {
						const placeAtStart = Math.random() < 0.5;
						insertIndex = placeAtStart ? 0 : rowState.cards.length;
					}
				}
				
				if (card.tags && card.tags.length > 0) {
					const similarCardsIndices = [];
					rowState.cards.forEach((existingCard, index) => {
						if (existingCard.tags) {
							const commonTags = card.tags.filter(tag => 
								existingCard.tags.includes(tag)
							);
							if (commonTags.length > 0) {
								similarCardsIndices.push({ index, commonTagsCount: commonTags.length });
							}
						}
					});
					
					if (similarCardsIndices.length > 0) {
						similarCardsIndices.sort((a, b) => b.commonTagsCount - a.commonTagsCount);
						const bestSimilarIndex = similarCardsIndices[0].index;
						insertIndex = bestSimilarIndex + 1;
					}
				}
				
				if (insertIndex === rowState.cards.length) {
					const strongestCardIndex = this.findStrongestCardIndex(rowState.cards);
					if (strongestCardIndex !== -1) {
						insertIndex = strongestCardIndex + 1;
					}
				}
			}
			
			rowState.cards.splice(insertIndex, 0, card);
			
			this.removeCardFromHand(card);
			
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
				window.gameModule.displayCardOnRow(bestRow, cardCopy, 'opponent', insertIndex);
				window.gameModule.updateRowStrength(bestRow, 'opponent');

				if (card.ability === 'double_row_strength_unit') {
					setTimeout(() => {
						this.activateDoubleRowStrengthUnitAbilityForAI(cardCopy, bestRow);
					}, 300);
				} else if (card.ability === 'medic' && card.type === 'unit') {
					setTimeout(() => {
						this.activateMedicAbilityForAI(cardCopy);
					}, 400);
				} else {
					setTimeout(() => {
						if (window.gameModule.completeCardPlay) {
							window.gameModule.completeCardPlay();
						}
					}, 1000);
				}
			}
		}
	},

	activateDoubleRowStrengthUnitAbilityForAI: function(playedCard, row) {
		const rowState = this.gameState.opponent.rows[row];
		let boostedCards = 0;
		
		// Удваиваем силу всех карт в ряду (кроме самого командира и героев)
		rowState.cards.forEach(unitCard => {
			if (unitCard.type === 'unit' && 
				!this.isHeroCard(unitCard) && 
				unitCard.uniqueId !== playedCard.uniqueId) {
				
				if (unitCard.baseStrength === undefined) {
					unitCard.baseStrength = unitCard.strength;
				}
				if (unitCard.modifiedStrength === undefined) {
					unitCard.modifiedStrength = unitCard.strength;
				}
				if (unitCard.currentStrength === undefined) {
					unitCard.currentStrength = unitCard.strength;
				}
				
				// Удваиваем modifiedStrength
				const boostValue = unitCard.modifiedStrength;
				unitCard.modifiedStrength += boostValue;
				
				if (!unitCard.underWeather) {
					unitCard.currentStrength = unitCard.modifiedStrength;
					unitCard.strength = unitCard.modifiedStrength;
				}
				
				boostedCards++;
				
				// Визуальный эффект
				this.createDoubleStrengthVisualEffect(unitCard, row);
			}
		});
		
		// Также удваиваем силу самого командира
		if (playedCard.baseStrength === undefined) {
			playedCard.baseStrength = playedCard.strength;
		}
		if (playedCard.modifiedStrength === undefined) {
			playedCard.modifiedStrength = playedCard.strength;
		}
		if (playedCard.currentStrength === undefined) {
			playedCard.currentStrength = playedCard.strength;
		}
		
		const commanderBoost = playedCard.modifiedStrength;
		playedCard.modifiedStrength += commanderBoost;
		
		if (!playedCard.underWeather) {
			playedCard.currentStrength = playedCard.modifiedStrength;
			playedCard.strength = playedCard.modifiedStrength;
		}
		
		this.createDoubleStrengthVisualEffect(playedCard, row);
		
		if (window.gameModule) {
			rowState.cards.forEach(unitCard => {
				if (unitCard.type === 'unit') {
					window.gameModule.updateCardStrengthDisplay(unitCard, row, 'opponent');
				}
			});
			
			window.gameModule.updateRowStrength(row, 'opponent');
			window.gameModule.updateTotalScoreDisplays();
			
			setTimeout(() => {
				if (window.gameModule.completeCardPlay) {
					window.gameModule.completeCardPlay();
				}
			}, 800);
		}
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_boost');
		}
		
		if (window.gameModule && boostedCards > 0) {
			window.gameModule.showGameMessage(
				`Противник: Командир удвоил силу ${boostedCards + 1} отрядов в ряду!`, 
				'warning'
			);
		}
	},

	activateMedicAbilityForAI: function(playedCard) {
		const opponentState = this.gameState.opponent;
		const discard = opponentState.discard || [];

		const validCards = discard
			.map((card, index) => ({ card, index }))
			.filter(item => {
				if (item.card.type !== 'unit') return false;
				if (this.isHeroCard(item.card)) return false;
				return true;
			});

		if (validCards.length === 0 || opponentState.hand.length >= 10) {
			if (window.gameModule && window.gameModule.completeCardPlay) {
				window.gameModule.completeCardPlay();
			}
			return;
		}

		// ИИ выбирает сильнейшую карту из доступных
		let bestItem = validCards[0];
		let bestStrength = this.getCardStrength(bestItem.card);
		validCards.forEach(item => {
			const s = this.getCardStrength(item.card);
			if (s > bestStrength) {
				bestStrength = s;
				bestItem = item;
			}
		});

		// Удаляем из сброса
		opponentState.discard.splice(bestItem.index, 1);
		opponentState.hand.push(bestItem.card);

		if (window.gameModule) {
			window.gameModule.displayOpponentDiscard();
			window.gameModule.showGameMessage(
				`Противник использовал «Медика»: вернул «${bestItem.card.name}» в руку`,
				'warning'
			);
		}
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('cardAdd');
		}

		if (window.gameModule && !playedCard.completeCalled) {
			playedCard.completeCalled = true;
			setTimeout(() => {
				window.gameModule.completeCardPlay();
			}, 600);
		}
	},

	getCardStrength: function(card) {
		if (!card) return 0;
		if (card.currentStrength !== undefined) return card.currentStrength;
		if (card.modifiedStrength !== undefined) return card.modifiedStrength;
		return card.strength || 0;
	},

	findStrongestCardIndex: function(cards) {
		let strongestIndex = -1;
		let maxStrength = -1;
		
		cards.forEach((card, index) => {
			const strength = card.strength || 0;
			if (strength > maxStrength) {
				maxStrength = strength;
				strongestIndex = index;
			}
		});
		
		return strongestIndex;
	},

	findBestCardForSynergy: function(card, rowCards) {
		let bestIndex = -1;
		let bestScore = -1;
		
		rowCards.forEach((existingCard, index) => {
			let score = 0;
			
			if (card.tags && existingCard.tags) {
				const commonTags = card.tags.filter(tag => 
					existingCard.tags.includes(tag)
				);
				score += commonTags.length * 3;
			}
			
			const cardStrength = card.strength || 0;
			const existingStrength = existingCard.strength || 0;
			const strengthDiff = Math.abs(cardStrength - existingStrength);
			if (strengthDiff <= 3) {
				score += 2;
			}
			
			if (score > bestScore) {
				bestScore = score;
				bestIndex = index;
			}
		});
		
		return { index: bestIndex, score: bestScore };
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