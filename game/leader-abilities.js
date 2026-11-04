const leaderAbilities = {
	'scoiatael_ability_1': {
		name: 'Махакамская кузня',
		description: 'Усильте всех Краснолюдов на поле на 3 еденицы',
		execute: function(gameState, gameModule) {
			const boostedCards = [];
			const rows = ['close', 'ranged', 'siege'];
			
			rows.forEach(row => {
				gameState.player.rows[row].cards.forEach(card => {
					if (card.tags && (card.tags.includes('dwarf') || card.tags.includes('краснолюд'))) {
						if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
						this.boostCard(card, 3);
						boostedCards.push({ card: card, player: 'player', row: row });
						
						// ===== ДОБАВЛЕНА АНИМАЦИЯ +3 =====
						this.createBoostVisualEffect(card, row, gameModule);
						// ====================================
						
						gameModule.updateRowStrength(row, 'player');
					}
				});
			});
			
			if (boostedCards.length === 0) {
				gameModule.showGameMessage('Нет краснолюдов на поле для усиления', 'warning');
				return false;
			}
			
			gameState.player.abilityUsedThisRound = true;
			gameModule.updateTotalScoreDisplays();
			gameModule.showGameMessage(`Способность "${this.name}" активирована! Усилено ${boostedCards.length} краснолюдов.`, 'info');
			audioManager.playSound('card_boost');
			
			return true;
		},
		
		boostCard: function(card, amount) {
			if (window.gameModule && window.gameModule.applyCardBoost) {
				window.gameModule.applyCardBoost(card, amount);
				return;
			}
			
			if (card.baseStrength === undefined) card.baseStrength = card.strength;
			if (card.originalStrength === undefined) card.originalStrength = card.strength;
			if (card.modifiedStrength === undefined) card.modifiedStrength = card.strength;
			
			card.modifiedStrength += amount;
			card.currentStrength = card.modifiedStrength;
			card.strength = card.currentStrength;
			card._displayStrength = card.currentStrength;
		},
		
		// ===== НОВЫЙ МЕТОД ДЛЯ ВИЗУАЛЬНОГО ЭФФЕКТА =====
		createBoostVisualEffect: function(card, row, gameModule) {
			const rowElement = document.getElementById(`player${gameModule.capitalizeFirst(row)}Row`);
			if (!rowElement) return;
			
			// Ищем элемент карты на доске
			let cardElement = null;
			
			if (card.uniqueId) {
				cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			}
			
			if (!cardElement) {
				const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
				if (elements.length === 1) {
					cardElement = elements[0];
				} else if (elements.length > 1) {
					// Если несколько карт с одинаковым id, ищем по порядку в ряду
					const rowState = gameState.player.rows[row];
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
			
			// Если не нашли по селекторам, пробуем найти по позиции
			if (!cardElement) {
				const allCards = rowElement.querySelectorAll('.board-card');
				const rowState = gameState.player.rows[row];
				const position = rowState.cards.findIndex(c => 
					c.id === card.id && c.uniqueId === card.uniqueId
				);
				if (position !== -1 && allCards[position]) {
					cardElement = allCards[position];
				}
			}
			
			if (!cardElement) return;
			
			// Создаём элемент с анимацией +3
			const boostOverlay = document.createElement('div');
			boostOverlay.className = 'card-boost-overlay';
			boostOverlay.textContent = '+3';
			boostOverlay.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #00ff00;
				font-size: 36px;
				font-weight: bold;
				text-shadow: 0 0 20px rgba(0, 255, 0, 0.9), 0 0 40px rgba(0, 255, 0, 0.6);
				z-index: 100;
				pointer-events: none;
				animation: leaderBoostAnimation 1.2s ease-out forwards;
				font-family: 'Gwent', sans-serif;
				letter-spacing: 2px;
			`;
			
			// Добавляем дополнительный эффект свечения на карту
			cardElement.style.boxShadow = '0 0 20px 8px rgba(0, 255, 0, 0.5)';
			cardElement.style.transition = 'box-shadow 0.5s ease-out';
			
			cardElement.appendChild(boostOverlay);
			
			// Удаляем эффект через 1.2 секунды
			setTimeout(() => {
				if (boostOverlay.parentNode) {
					boostOverlay.remove();
				}
				cardElement.style.boxShadow = '';
			}, 1200);
		}
	},
    'scoiatael_ability_2': {
        name: 'Засада ловчих',
        description: 'Призывите из колоды в руку карту Эльфа',
        execute: function(gameState, gameModule) {
            if (gameState.player.hand.length >= 10) {
                gameModule.showGameMessage('Нет места в руке для призыва', 'warning');
                return false;
            }
            
            // Ищем в колоде карту с тегом 'elf' или 'эльф'
            let elfIndex = -1;
            let elfCard = null;
            
            for (let i = 0; i < gameState.player.deck.length; i++) {
                const card = gameState.player.deck[i];
                if (card.tags && (card.tags.includes('elf') || card.tags.includes('эльф'))) {
                    elfIndex = i;
                    elfCard = card;
                    break;
                }
            }
            
            if (!elfCard) {
                gameModule.showGameMessage('В колоде нет карт с тегом "Эльф"', 'warning');
                return false;
            }
            
            // Удаляем из колоды и добавляем в руку
            gameState.player.deck.splice(elfIndex, 1);
            gameState.player.hand.push(elfCard);
            
            gameState.player.abilityUsedThisRound = true;
            gameModule.displayPlayerHand();
            gameModule.displayPlayerDeck();
            gameModule.showGameMessage(`Способность "${this.name}" активирована! ${elfCard.name} добавлен в руку.`, 'info');
            audioManager.playSound('cardAdd');
            
            return true;
        }
    },
	'scoiatael_ability_3': {
		name: 'Точный удар',
		description: 'Нанесите 5 едениц урона отряду противника',
		execute: function(gameState, gameModule) {
			// Сначала убираем старые выделения, если они есть
			this.removeHighlights(gameState);
			
			const enemyUnits = [];
			const rows = ['close', 'ranged', 'siege'];
			
			rows.forEach(row => {
				gameState.opponent.rows[row].cards.forEach(card => {
					// Строгая проверка: только отряды (unit) с силой > 0
					if (card.type === 'unit' && card.strength > 0) {
						// Пропускаем героев
						if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
						enemyUnits.push({ card: card, row: row });
					}
				});
			});
			
			if (enemyUnits.length === 0) {
				gameModule.showGameMessage('Нет вражеских отрядов для атаки', 'warning');
				return false;
			}
			
			// Сохраняем gameState для отмены
			this._gameState = gameState;
			this._gameModule = gameModule;
			this._damageAmount = 5;
			
			this.showTargetSelection(enemyUnits, gameState, gameModule);
			return true;
		},
		
		showTargetSelection: function(enemyUnits, gameState, gameModule) {
			this._currentTargets = enemyUnits;
			this._clickHandlers = [];
			this.highlightEnemyUnits(enemyUnits, gameState, gameModule);
		},
		
		highlightEnemyUnits: function(enemyUnits, gameState, gameModule) {
			const rows = ['close', 'ranged', 'siege'];
			
			const clickHandler = (target) => {
				return (event) => {
					// Проверяем, что цель все еще существует на поле и является отрядом
					const stillExists = gameState.opponent.rows[target.row].cards.some(
						c => c.uniqueId === target.card.uniqueId && c.type === 'unit'
					);
					
					if (!stillExists) {
						gameModule.showGameMessage('Эта карта уже не на поле', 'warning');
						this.removeHighlights(gameState);
						return;
					}
					
					// Дополнительная проверка перед нанесением урона
					if (target.card.type !== 'unit') {
						gameModule.showGameMessage('Можно наносить урон только отрядам!', 'warning');
						this.removeHighlights(gameState);
						return;
					}
					
					if (target.card.modifiedStrength <= 0) {
						gameModule.showGameMessage('Эта карта уже уничтожена', 'warning');
						this.removeHighlights(gameState);
						return;
					}
					
					// Наносим урон
					this.dealDamage(target.card, this._damageAmount);
					gameState.player.abilityUsedThisRound = true;
					
					// Обновляем отображение силы
					gameModule.updateRowStrength(target.row, 'opponent');
					gameModule.updateTotalScoreDisplays();
					
					// === АНИМАЦИЯ УРОНА -5 ===
					this.createDamageVisualEffect(target.card, target.row, gameModule);
					
					// Если карта уничтожена
					if (target.card.modifiedStrength <= 0) {
						this.destroyCard(gameState, target.card, target.row, gameModule);
					}
					
					gameModule.showGameMessage(`Способность "${this.name}" активирована! Нанесён ${this._damageAmount} урон ${target.card.name}.`, 'info');
					audioManager.playSound('card_damage');
					
					// Убираем подсветку
					this.removeHighlights(gameState);
				};
			};
			
			// Подсвечиваем только отряды
			for (const row of rows) {
				const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(cardElement => {
					const cardId = cardElement.dataset.cardId;
					const uniqueId = cardElement.dataset.uniqueId;
					
					let target = null;
					if (uniqueId) {
						target = enemyUnits.find(u => u.card.uniqueId === uniqueId) || null;
					}
					if (!target) {
						target = enemyUnits.find(u => u.card.id === cardId) || null;
					}
					
					if (target) {
						// Дополнительная проверка: убеждаемся, что это отряд
						if (target.card.type !== 'unit') return;
						
						// Проверяем, что это не герой
						if (target.card.tags && (target.card.tags.includes('hero') || target.card.tags.includes('герой'))) return;
						
						cardElement._targetData = target;
						
						cardElement.style.cursor = 'pointer';
						cardElement.classList.add('damage-target');
						
						const handler = clickHandler(target);
						cardElement.addEventListener('click', handler);
						this._clickHandlers.push({ element: cardElement, handler: handler });
						
						cardElement.addEventListener('mouseenter', () => {
							cardElement.style.transform = 'scale(1.05)';
							cardElement.style.filter = 'brightness(1.2) drop-shadow(0 0 12px #ff4444)';
						});
						
						cardElement.addEventListener('mouseleave', () => {
							cardElement.style.transform = 'scale(1)';
							cardElement.style.filter = '';
						});
					}
				});
			}
			
			// === КНОПКА ОТМЕНЫ (исправленная) ===
			this.showCancelButton(gameState, gameModule);
		},
		
		// ===== АНИМАЦИЯ УРОНА -5 (как в scoiatael_ability_1, но красная) =====
		createDamageVisualEffect: function(card, row, gameModule) {
			const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
			if (!rowElement) return;
			
			// Ищем элемент карты на доске
			let cardElement = null;
			
			if (card.uniqueId) {
				cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			}
			
			if (!cardElement) {
				const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
				if (elements.length === 1) {
					cardElement = elements[0];
				} else if (elements.length > 1) {
					const rowState = this._gameState.opponent.rows[row];
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
			
			// Если не нашли по селекторам, пробуем найти по позиции
			if (!cardElement) {
				const allCards = rowElement.querySelectorAll('.board-card');
				const rowState = this._gameState.opponent.rows[row];
				const position = rowState.cards.findIndex(c => 
					c.id === card.id && c.uniqueId === card.uniqueId
				);
				if (position !== -1 && allCards[position]) {
					cardElement = allCards[position];
				}
			}
			
			if (!cardElement) return;
			
			// Создаём элемент с анимацией -5 (красный)
			const damageOverlay = document.createElement('div');
			damageOverlay.className = 'card-damage-overlay';
			damageOverlay.textContent = '-5';
			damageOverlay.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #ff1744;
				font-size: 36px;
				font-weight: bold;
				text-shadow: 0 0 20px rgba(255, 23, 68, 0.9), 0 0 40px rgba(255, 0, 0, 0.6);
				z-index: 100;
				pointer-events: none;
				animation: leaderBoostAnimation 1.2s ease-out forwards;
				font-family: 'Gwent', sans-serif;
				letter-spacing: 2px;
			`;
			
			// Добавляем красное свечение на карту
			cardElement.style.boxShadow = '0 0 20px 8px rgba(255, 0, 0, 0.5)';
			cardElement.style.transition = 'box-shadow 0.5s ease-out';
			
			cardElement.appendChild(damageOverlay);
			
			// Удаляем эффект через 1.2 секунды
			setTimeout(() => {
				if (damageOverlay.parentNode) {
					damageOverlay.remove();
				}
				cardElement.style.boxShadow = '';
			}, 1200);
		},
		
		// ===== ИСПРАВЛЕННАЯ КНОПКА ОТМЕНЫ =====
		showCancelButton: function(gameState, gameModule) {
			const existingBtn = document.getElementById('abilityCancelBtn');
			if (existingBtn) existingBtn.remove();
			
			const cancelBtn = document.createElement('button');
			cancelBtn.id = 'abilityCancelBtn';
			cancelBtn.textContent = 'ОТМЕНА';
			cancelBtn.className = 'ability-cancel-btn';
			cancelBtn.style.cssText = `
				position: fixed;
				bottom: 30px;
				left: 50%;
				transform: translateX(-50%);
				background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
				color: #d4af37;
				border: 2px solid #d4af37;
				padding: 12px 35px;
				border-radius: 8px;
				cursor: pointer;
				font-weight: bold;
				font-family: 'Gwent', sans-serif;
				font-size: 16px;
				text-transform: uppercase;
				letter-spacing: 2px;
				z-index: 10050;
				transition: all 0.3s ease;
				box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
			`;
			
			cancelBtn.addEventListener('mouseenter', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1.05)';
				cancelBtn.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)';
				audioManager.playSound('touch');
			});
			
			cancelBtn.addEventListener('mouseleave', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1)';
				cancelBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
			});
			
			cancelBtn.addEventListener('click', () => {
				// Отменяем выделение
				this.removeHighlights(gameState);
				audioManager.playSound('button');
				gameModule.showGameMessage('Использование способности отменено', 'info');
				
				// ===== ВАЖНО: Сбрасываем флаг использования способности =====
				if (gameState) {
					gameState.player.abilityUsedThisRound = false;
				}
				
				// ===== ВАЖНО: Обновляем иконку способности =====
				if (window.boardModule && window.boardModule.updateAbilityAvailability) {
					window.boardModule.updateAbilityAvailability(gameState);
				}
			});
			
			document.body.appendChild(cancelBtn);
			this._cancelBtn = cancelBtn;
		},
		
		removeCancelButton: function() {
			if (this._cancelBtn && this._cancelBtn.parentNode) {
				this._cancelBtn.remove();
				this._cancelBtn = null;
			}
			const btn = document.getElementById('abilityCancelBtn');
			if (btn) btn.remove();
		},
		
		removeHighlights: function(gameState) {
			const rows = ['close', 'ranged', 'siege'];
			
			for (const row of rows) {
				const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(card => {
					card.style.cursor = '';
					card.classList.remove('damage-target');
					card.style.transform = '';
					card.style.filter = '';
					card.style.boxShadow = '';
				});
			}
			
			// Удаляем обработчики кликов
			if (this._clickHandlers) {
				this._clickHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('click', handler);
				});
				this._clickHandlers = [];
			}
			
			this._currentTargets = null;
			this.removeCancelButton();
		},
		
		dealDamage: function(card, amount) {
			if (window.gameModule && window.gameModule.applyCardDamage) {
				window.gameModule.applyCardDamage(card, amount);
				return;
			}
			
			if (card.baseStrength === undefined) card.baseStrength = card.strength;
			if (card.originalStrength === undefined) card.originalStrength = card.strength;
			if (card.modifiedStrength === undefined) card.modifiedStrength = card.strength;
			
			card.modifiedStrength = Math.max(0, card.modifiedStrength - amount);
			card.currentStrength = card.modifiedStrength;
			card.strength = card.currentStrength;
			card._displayStrength = card.currentStrength;
		},
		
		destroyCard: function(gameState, card, row, gameModule) {
			const rowCards = gameState.opponent.rows[row].cards;
			let cardIndex = -1;
			
			if (card.uniqueId !== undefined) {
				cardIndex = rowCards.findIndex(c => c.uniqueId === card.uniqueId);
			}
			if (cardIndex === -1) {
				cardIndex = rowCards.indexOf(card);
			}
			if (cardIndex === -1) {
				// Последний вариант — ищем по id, но только если карта одна
				const sameId = rowCards
					.map((c, index) => ({ c, index }))
					.filter(entry => entry.c.id === card.id);
				if (sameId.length === 1) {
					cardIndex = sameId[0].index;
				}
			}
			
			if (cardIndex !== -1) {
				const destroyedCard = rowCards.splice(cardIndex, 1)[0];
				gameModule.addCardToDiscard(destroyedCard, 'opponent');
				gameModule.redrawRow(row, 'opponent');
				gameModule.updateRowStrength(row, 'opponent');
				audioManager.playSound('card_destroy');
			}
		}
	},
	'scoiatael_ability_4': {
		name: 'Дар природы',
		description: 'Усильте 3 отряда на поле на 2 еденицы',
		execute: function(gameState, gameModule) {
			this.showMultiTargetSelection(gameState, gameModule);
			return true;
		},
		
		showMultiTargetSelection: function(gameState, gameModule) {
			let selectedCards = [];
			const maxSelections = 3;
			const boostAmount = 2;
			const allUnits = [];
			const rows = ['close', 'ranged', 'siege'];
			
			// Собираем все отряды с uniqueId
			rows.forEach(row => {
				gameState.player.rows[row].cards.forEach(card => {
					if (card.type === 'unit') {
						if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
						// Убеждаемся, что у карты есть uniqueId
						if (!card.uniqueId) {
							card.uniqueId = `${card.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
						}
						allUnits.push({ 
							card: card, 
							row: row, 
							player: 'player',
							uniqueId: card.uniqueId 
						});
					}
				});
				gameState.opponent.rows[row].cards.forEach(card => {
					if (card.type === 'unit') {
						if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
						if (!card.uniqueId) {
							card.uniqueId = `${card.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
						}
						allUnits.push({ 
							card: card, 
							row: row, 
							player: 'opponent',
							uniqueId: card.uniqueId 
						});
					}
				});
			});
			
			if (allUnits.length === 0) {
				gameModule.showGameMessage('Нет отрядов на поле для усиления', 'warning');
				return;
			}
			
			// Сохраняем gameState для анимации
			this._gameState = gameState;
			this._gameModule = gameModule;
			this._maxSelections = maxSelections;
			this._boostAmount = boostAmount;
			
			this.highlightUnitsForBoost(allUnits, selectedCards, maxSelections, boostAmount, gameState, gameModule);
		},
		
		highlightUnitsForBoost: function(allUnits, selectedCards, maxSelections, boostAmount, gameState, gameModule) {
			const rows = ['close', 'ranged', 'siege'];
			
			// Сохраняем обработчики для удаления
			this._clickHandlers = [];
			this._selectedCardElements = [];
			
			const clickHandler = (target) => {
				return (event) => {
					// Проверяем, что цель все еще существует на поле
					let stillExists = false;
					if (target.player === 'player') {
						stillExists = gameState.player.rows[target.row].cards.some(
							c => c.uniqueId === target.uniqueId && c.type === 'unit'
						);
					} else {
						stillExists = gameState.opponent.rows[target.row].cards.some(
							c => c.uniqueId === target.uniqueId && c.type === 'unit'
						);
					}
					
					if (!stillExists) {
						gameModule.showGameMessage('Эта карта уже не на поле', 'warning');
						this.removeHighlights(gameState);
						return;
					}
					
					// Проверяем героя
					if (target.card.tags && (target.card.tags.includes('hero') || target.card.tags.includes('герой'))) {
						gameModule.showGameMessage('Нельзя усилить Героя!', 'warning');
						return;
					}
					
					const alreadySelected = selectedCards.some(s => s.uniqueId === target.uniqueId);
					if (!alreadySelected && selectedCards.length < maxSelections) {
						selectedCards.push(target);
						this.highlightCard(target.uniqueId, true);
						audioManager.playSound('cardAdd');
					} else if (alreadySelected) {
						const index = selectedCards.findIndex(s => s.uniqueId === target.uniqueId);
						selectedCards.splice(index, 1);
						this.highlightCard(target.uniqueId, false);
						audioManager.playSound('cardRemove');
					}
					
					this.updateSelectionCounter(maxSelections, selectedCards.length);
				};
			};
			
			// Подсвечиваем карты на доске
			for (const row of rows) {
				const rowElementPlayer = document.getElementById(`player${gameModule.capitalizeFirst(row)}Row`);
				const rowElementOpponent = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
				
				[rowElementPlayer, rowElementOpponent].forEach(rowElement => {
					if (!rowElement) return;
					const cards = rowElement.querySelectorAll('.board-card');
					cards.forEach(card => {
						const uniqueId = card.dataset.uniqueId;
						// Ищем цель по uniqueId
						const target = allUnits.find(u => u.uniqueId === uniqueId);
						if (target) {
							card.style.cursor = 'pointer';
							card.classList.add('boost-target');
							
							const handler = clickHandler(target);
							card.addEventListener('click', handler);
							this._clickHandlers.push({ element: card, handler: handler });
							
							// Сохраняем связь card <-> uniqueId для highlightCard
							card.dataset.boostUniqueId = target.uniqueId;
							
							card.addEventListener('mouseenter', () => {
								if (!card.classList.contains('boost-selected')) {
									card.style.transform = 'scale(1.05)';
								}
							});
							card.addEventListener('mouseleave', () => {
								if (!card.classList.contains('boost-selected')) {
									card.style.transform = 'scale(1)';
								}
							});
						}
					});
				});
			}
			
			this.createSelectionCounter(maxSelections);
			this.showConfirmButton(() => {
				if (selectedCards.length === 0) {
					gameModule.showGameMessage('Выберите хотя бы один отряд', 'warning');
					return;
				}
				
				// Применяем усиление с анимацией
				selectedCards.forEach(item => {
					this.boostCard(item.card, boostAmount);
					this.createBoostVisualEffect(item.card, item.row, gameModule);
					gameModule.updateRowStrength(item.row, item.player);
				});
				
				gameState.player.abilityUsedThisRound = true;
				gameModule.updateTotalScoreDisplays();
				gameModule.showGameMessage(`Способность "${this.name}" активирована! Усилено ${selectedCards.length} отрядов.`, 'info');
				audioManager.playSound('card_boost');
				
				this.removeHighlights(gameState);
				this.removeSelectionCounter();
				this.removeCancelButton();
			});
			
			// Кнопка отмены
			this.showCancelButton(gameState, gameModule);
		},
		
		// ===== ИСПРАВЛЕННЫЙ МЕТОД highlightCard =====
		highlightCard: function(uniqueId, isSelected) {
			// Ищем все карты с этим uniqueId на доске
			const allCards = document.querySelectorAll('.board-card');
			allCards.forEach(card => {
				if (card.dataset.uniqueId === uniqueId || card.dataset.boostUniqueId === uniqueId) {
					if (isSelected) {
						card.classList.add('boost-selected');
						card.style.filter = 'brightness(1.2) drop-shadow(0 0 8px #4CAF50)';
						card.style.transform = 'scale(1.05)';
					} else {
						card.classList.remove('boost-selected');
						card.style.filter = '';
						card.style.transform = 'scale(1)';
					}
				}
			});
		},
		
		// ===== АНИМАЦИЯ УСИЛЕНИЯ =====
		createBoostVisualEffect: function(card, row, gameModule) {
			const rowElement = document.getElementById(`${card.owner || 'player'}${gameModule.capitalizeFirst(row)}Row`);
			if (!rowElement) return;
			
			// Ищем элемент карты на доске по uniqueId
			let cardElement = null;
			
			if (card.uniqueId) {
				cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			}
			
			if (!cardElement) {
				// Пробуем найти по id, если uniqueId не найден
				const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
				if (elements.length === 1) {
					cardElement = elements[0];
				} else if (elements.length > 1) {
					// Если несколько копий, ищем по позиции в ряду
					const player = card.owner || 'player';
					const rowState = this._gameState[player].rows[row];
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
			
			// Создаём элемент с анимацией +2
			const boostOverlay = document.createElement('div');
			boostOverlay.className = 'card-boost-overlay';
			boostOverlay.textContent = '+2';
			boostOverlay.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #00ff00;
				font-size: 36px;
				font-weight: bold;
				text-shadow: 0 0 20px rgba(0, 255, 0, 0.9), 0 0 40px rgba(0, 255, 0, 0.6);
				z-index: 100;
				pointer-events: none;
				animation: leaderBoostAnimation 1.2s ease-out forwards;
				font-family: 'Gwent', sans-serif;
				letter-spacing: 2px;
			`;
			
			cardElement.style.boxShadow = '0 0 20px 8px rgba(0, 255, 0, 0.5)';
			cardElement.style.transition = 'box-shadow 0.5s ease-out';
			
			cardElement.appendChild(boostOverlay);
			
			setTimeout(() => {
				if (boostOverlay.parentNode) {
					boostOverlay.remove();
				}
				cardElement.style.boxShadow = '';
			}, 1200);
		},
		
		createSelectionCounter: function(max) {
			const existingCounter = document.getElementById('abilityCounter');
			if (existingCounter) existingCounter.remove();
			
			const counter = document.createElement('div');
			counter.id = 'abilityCounter';
			counter.className = 'ability-counter';
			counter.textContent = `Выбрано: 0/${max}`;
			counter.style.cssText = `
				position: fixed;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				background: rgba(0, 0, 0, 0.85);
				color: #d4af37;
				padding: 12px 24px;
				border-radius: 8px;
				font-family: 'Gwent', sans-serif;
				font-size: 18px;
				font-weight: bold;
				z-index: 10050;
				border: 2px solid #d4af37;
				text-align: center;
				pointer-events: none;
				box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
			`;
			document.body.appendChild(counter);
		},
		
		updateSelectionCounter: function(max, current) {
			const counter = document.getElementById('abilityCounter');
			if (counter) counter.textContent = `Выбрано: ${current}/${max}`;
		},
		
		removeSelectionCounter: function() {
			const counter = document.getElementById('abilityCounter');
			if (counter) counter.remove();
		},
		
		showConfirmButton: function(onConfirm) {
			const existingBtn = document.getElementById('abilityConfirmBtn');
			if (existingBtn) existingBtn.remove();
			
			const confirmBtn = document.createElement('button');
			confirmBtn.id = 'abilityConfirmBtn';
			confirmBtn.textContent = 'ПОДТВЕРДИТЬ';
			confirmBtn.className = 'ability-confirm-btn';
			confirmBtn.style.cssText = `
				position: fixed;
				bottom: 30px;
				right: 30px;
				background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
				color: #4CAF50;
				border: 2px solid #4CAF50;
				padding: 12px 35px;
				border-radius: 8px;
				cursor: pointer;
				font-weight: bold;
				font-family: 'Gwent', sans-serif;
				font-size: 16px;
				text-transform: uppercase;
				letter-spacing: 2px;
				z-index: 10050;
				transition: all 0.3s ease;
				box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
			`;
			confirmBtn.addEventListener('click', () => {
				onConfirm();
				audioManager.playSound('button');
			});
			confirmBtn.addEventListener('mouseenter', () => {
				confirmBtn.style.transform = 'scale(1.05)';
				confirmBtn.style.boxShadow = '0 0 20px rgba(76, 175, 80, 0.5)';
				audioManager.playSound('touch');
			});
			confirmBtn.addEventListener('mouseleave', () => {
				confirmBtn.style.transform = 'scale(1)';
				confirmBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
			});
			document.body.appendChild(confirmBtn);
			this._confirmBtn = confirmBtn;
		},
		
		showCancelButton: function(gameState, gameModule) {
			const existingBtn = document.getElementById('abilityCancelBtn');
			if (existingBtn) existingBtn.remove();
			
			const cancelBtn = document.createElement('button');
			cancelBtn.id = 'abilityCancelBtn';
			cancelBtn.textContent = 'ОТМЕНА';
			cancelBtn.className = 'ability-cancel-btn';
			cancelBtn.style.cssText = `
				position: fixed;
				bottom: 30px;
				left: 30px;
				background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
				color: #d4af37;
				border: 2px solid #d4af37;
				padding: 12px 35px;
				border-radius: 8px;
				cursor: pointer;
				font-weight: bold;
				font-family: 'Gwent', sans-serif;
				font-size: 16px;
				text-transform: uppercase;
				letter-spacing: 2px;
				z-index: 10050;
				transition: all 0.3s ease;
				box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
			`;
			
			cancelBtn.addEventListener('mouseenter', () => {
				cancelBtn.style.transform = 'scale(1.05)';
				cancelBtn.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)';
				audioManager.playSound('touch');
			});
			
			cancelBtn.addEventListener('mouseleave', () => {
				cancelBtn.style.transform = 'scale(1)';
				cancelBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
			});
			
			cancelBtn.addEventListener('click', () => {
				this.removeHighlights(gameState);
				this.removeSelectionCounter();
				this.removeCancelButton();
				
				if (gameState) {
					gameState.player.abilityUsedThisRound = false;
				}
				
				audioManager.playSound('button');
				gameModule.showGameMessage('Использование способности отменено', 'info');
				
				if (window.boardModule && window.boardModule.updateAbilityAvailability) {
					window.boardModule.updateAbilityAvailability(gameState);
				}
			});
			
			document.body.appendChild(cancelBtn);
			this._cancelBtn = cancelBtn;
		},
		
		removeCancelButton: function() {
			if (this._cancelBtn && this._cancelBtn.parentNode) {
				this._cancelBtn.remove();
				this._cancelBtn = null;
			}
			const btn = document.getElementById('abilityCancelBtn');
			if (btn) btn.remove();
			
			if (this._confirmBtn && this._confirmBtn.parentNode) {
				this._confirmBtn.remove();
				this._confirmBtn = null;
			}
			const confirmBtn = document.getElementById('abilityConfirmBtn');
			if (confirmBtn) confirmBtn.remove();
		},
		
		removeHighlights: function(gameState) {
			// Убираем подсветку со всех карт
			const allCards = document.querySelectorAll('.board-card');
			allCards.forEach(card => {
				card.style.cursor = '';
				card.classList.remove('boost-target', 'boost-selected');
				card.style.filter = '';
				card.style.transform = '';
				card.style.boxShadow = '';
			});
			
			// Удаляем обработчики кликов
			if (this._clickHandlers) {
				this._clickHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('click', handler);
				});
				this._clickHandlers = [];
			}
			
			this.removeCancelButton();
		},
		
		boostCard: function(card, amount) {
			if (window.gameModule && window.gameModule.applyCardBoost) {
				window.gameModule.applyCardBoost(card, amount);
				return;
			}
			
			if (card.baseStrength === undefined) card.baseStrength = card.strength;
			if (card.originalStrength === undefined) card.originalStrength = card.strength;
			if (card.modifiedStrength === undefined) card.modifiedStrength = card.strength;
			
			card.modifiedStrength += amount;
			card.currentStrength = card.modifiedStrength;
			card.strength = card.currentStrength;
			card._displayStrength = card.currentStrength;
		}
	},
	'scoiatael_ability_5': {
		name: 'Партизанская тактика',
		description: 'Нанесите 3 еденицы урона всем картам в ряду противника',
		execute: function(gameState, gameModule) {
			// Сначала проверяем, есть ли вообще карты у противника
			let hasAnyUnits = false;
			const rows = ['close', 'ranged', 'siege'];
			
			rows.forEach(row => {
				if (gameState.opponent.rows[row].cards.length > 0) {
					const hasNonHeroUnit = gameState.opponent.rows[row].cards.some(card => {
						if (card.type !== 'unit') return false;
						if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return false;
						return true;
					});
					if (hasNonHeroUnit) {
						hasAnyUnits = true;
					}
				}
			});
			
			if (!hasAnyUnits) {
				gameModule.showGameMessage('Нет отрядов противника на поле для атаки', 'warning');
				return false;
			}
			
			this.showRowSelection(gameState, gameModule);
			return true;
		},
		
		showRowSelection: function(gameState, gameModule) {
			// Сохраняем gameState для анимации
			this._gameState = gameState;
			this._gameModule = gameModule;
			
			// Определяем ряды с картами противника (не героями)
			const rowsWithCards = [];
			const rows = [
				{ id: 'close', name: 'Ближний бой', elementId: 'opponentCloseRow' },
				{ id: 'ranged', name: 'Дальний бой', elementId: 'opponentRangedRow' },
				{ id: 'siege', name: 'Осадный', elementId: 'opponentSiegeRow' }
			];
			
			rows.forEach(row => {
				const hasUnits = gameState.opponent.rows[row.id].cards.some(card => {
					if (card.type !== 'unit') return false;
					if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return false;
					return true;
				});
				if (hasUnits) {
					rowsWithCards.push(row);
				}
			});
			
			if (rowsWithCards.length === 0) {
				gameModule.showGameMessage('Нет уязвимых отрядов противника для атаки', 'warning');
				return;
			}
			
			// ===== СОХРАНЯЕМ ВСЕ ОБРАБОТЧИКИ =====
			this._rowHandlers = [];
			this._rowMouseEnterHandlers = [];
			this._rowMouseLeaveHandlers = [];
			
			const clickHandler = (rowId, rowName) => {
				return (event) => {
					let damagedCount = 0;
					const unitsToDestroy = [];
					const damageAmount = 3;
					
					// Сохраняем карты для анимации
					const damagedCards = [];
					
					gameState.opponent.rows[rowId].cards.forEach(card => {
						if (card.type === 'unit') {
							if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
							
							damagedCards.push({ card: card, row: rowId });
							
							this.dealDamage(card, damageAmount);
							damagedCount++;
							
							if (card.modifiedStrength <= 0) {
								unitsToDestroy.push({ card: card, row: rowId });
							}
						}
					});
					
					damagedCards.forEach(item => {
						this.createDamageVisualEffect(item.card, item.row, gameModule);
					});
					
					unitsToDestroy.forEach(unit => {
						this.destroyCard(gameState, unit.card, unit.row, gameModule);
					});
					
					if (damagedCount === 0) {
						gameModule.showGameMessage('В выбранном ряду нет уязвимых отрядов', 'warning');
						this.removeHighlights(gameState);
						return;
					}
					
					gameState.player.abilityUsedThisRound = true;
					gameModule.updateRowStrength(rowId, 'opponent');
					gameModule.updateTotalScoreDisplays();
					gameModule.showGameMessage(`Способность "${this.name}" активирована! Нанесён урон ${damagedCount} отрядам.`, 'info');
					audioManager.playSound('card_damage');
					
					this.removeHighlights(gameState);
					this.removeCancelButton();
					
					if (window.boardModule && window.boardModule.updateAbilityAvailability) {
						window.boardModule.updateAbilityAvailability(gameState);
					}
				};
			};
			
			// Подсвечиваем ряды и добавляем обработчики
			rowsWithCards.forEach(row => {
				const rowElement = document.getElementById(row.elementId);
				if (rowElement) {
					rowElement.classList.add('row-damage-target');
					rowElement.style.cursor = 'pointer';
					
					// Обработчик клика
					const handler = clickHandler(row.id, row.name);
					rowElement.addEventListener('click', handler);
					this._rowHandlers.push({ element: rowElement, handler: handler });
					
					// ===== ОБРАБОТЧИКИ НАВЕДЕНИЯ =====
					const mouseEnterHandler = () => {
						rowElement.style.transform = 'scale(1.02)';
						rowElement.style.transition = 'all 0.2s ease';
						rowElement.style.boxShadow = '0 0 20px rgba(255, 68, 68, 0.3)';
					};
					
					const mouseLeaveHandler = () => {
						rowElement.style.transform = 'scale(1)';
						rowElement.style.boxShadow = '';
					};
					
					rowElement.addEventListener('mouseenter', mouseEnterHandler);
					rowElement.addEventListener('mouseleave', mouseLeaveHandler);
					
					// ===== СОХРАНЯЕМ ОБРАБОТЧИКИ ДЛЯ УДАЛЕНИЯ =====
					this._rowMouseEnterHandlers.push({ element: rowElement, handler: mouseEnterHandler });
					this._rowMouseLeaveHandlers.push({ element: rowElement, handler: mouseLeaveHandler });
				}
			});
			
			this.showCancelButton(gameState, gameModule);
		},
		
		createDamageVisualEffect: function(card, row, gameModule) {
			const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
			if (!rowElement) return;
			
			let cardElement = null;
			
			if (card.uniqueId) {
				cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			}
			
			if (!cardElement) {
				const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
				if (elements.length === 1) {
					cardElement = elements[0];
				} else if (elements.length > 1) {
					const rowState = this._gameState.opponent.rows[row];
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
			
			const damageOverlay = document.createElement('div');
			damageOverlay.className = 'card-damage-overlay';
			damageOverlay.textContent = '-3';
			damageOverlay.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #ff1744;
				font-size: 36px;
				font-weight: bold;
				text-shadow: 0 0 20px rgba(255, 23, 68, 0.9), 0 0 40px rgba(255, 0, 0, 0.6);
				z-index: 100;
				pointer-events: none;
				animation: leaderBoostAnimation 1.2s ease-out forwards;
				font-family: 'Gwent', sans-serif;
				letter-spacing: 2px;
			`;
			
			cardElement.style.boxShadow = '0 0 20px 8px rgba(255, 0, 0, 0.5)';
			cardElement.style.transition = 'box-shadow 0.5s ease-out';
			
			cardElement.appendChild(damageOverlay);
			
			setTimeout(() => {
				if (damageOverlay.parentNode) {
					damageOverlay.remove();
				}
				cardElement.style.boxShadow = '';
			}, 1200);
		},
		
		showCancelButton: function(gameState, gameModule) {
			const existingBtn = document.getElementById('abilityCancelBtn');
			if (existingBtn) existingBtn.remove();
			
			const cancelBtn = document.createElement('button');
			cancelBtn.id = 'abilityCancelBtn';
			cancelBtn.textContent = 'ОТМЕНА';
			cancelBtn.className = 'ability-cancel-btn';
			cancelBtn.style.cssText = `
				position: fixed;
				bottom: 30px;
				left: 50%;
				transform: translateX(-50%);
				background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
				color: #d4af37;
				border: 2px solid #d4af37;
				padding: 12px 35px;
				border-radius: 8px;
				cursor: pointer;
				font-weight: bold;
				font-family: 'Gwent', sans-serif;
				font-size: 16px;
				text-transform: uppercase;
				letter-spacing: 2px;
				z-index: 10050;
				transition: all 0.3s ease;
				box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
			`;
			
			cancelBtn.addEventListener('mouseenter', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1.05)';
				cancelBtn.style.boxShadow = '0 0 25px rgba(212, 175, 55, 0.4)';
				audioManager.playSound('touch');
			});
			
			cancelBtn.addEventListener('mouseleave', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1)';
				cancelBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
			});
			
			cancelBtn.addEventListener('click', () => {
				if (gameState) {
					gameState.player.abilityUsedThisRound = false;
				}
				
				this.removeHighlights(gameState);
				this.removeCancelButton();
				
				audioManager.playSound('button');
				gameModule.showGameMessage('Использование способности отменено', 'info');
				
				if (window.boardModule && window.boardModule.updateAbilityAvailability) {
					window.boardModule.updateAbilityAvailability(gameState);
				}
			});
			
			document.body.appendChild(cancelBtn);
			this._cancelBtn = cancelBtn;
		},
		
		removeCancelButton: function() {
			if (this._cancelBtn && this._cancelBtn.parentNode) {
				this._cancelBtn.remove();
				this._cancelBtn = null;
			}
			const btn = document.getElementById('abilityCancelBtn');
			if (btn) btn.remove();
		},
		
		// ===== ИСПРАВЛЕННЫЙ МЕТОД removeHighlights =====
		removeHighlights: function(gameState) {
			const rows = ['close', 'ranged', 'siege'];
			rows.forEach(row => {
				const rowElement = document.getElementById(`opponent${this._gameModule.capitalizeFirst(row)}Row`);
				if (rowElement) {
					rowElement.classList.remove('row-damage-target');
					rowElement.style.cursor = '';
					rowElement.style.transform = '';
					rowElement.style.boxShadow = '';
					rowElement.style.transition = '';
				}
			});
			
			// ===== УДАЛЯЕМ ОБРАБОТЧИКИ КЛИКОВ =====
			if (this._rowHandlers) {
				this._rowHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('click', handler);
				});
				this._rowHandlers = [];
			}
			
			// ===== УДАЛЯЕМ ОБРАБОТЧИКИ MOUSEENTER =====
			if (this._rowMouseEnterHandlers) {
				this._rowMouseEnterHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('mouseenter', handler);
				});
				this._rowMouseEnterHandlers = [];
			}
			
			// ===== УДАЛЯЕМ ОБРАБОТЧИКИ MOUSELEAVE =====
			if (this._rowMouseLeaveHandlers) {
				this._rowMouseLeaveHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('mouseleave', handler);
				});
				this._rowMouseLeaveHandlers = [];
			}
			
			this.removeCancelButton();
		},
		
		dealDamage: function(card, amount) {
			if (window.gameModule && window.gameModule.applyCardDamage) {
				window.gameModule.applyCardDamage(card, amount);
				return;
			}
			
			if (card.baseStrength === undefined) card.baseStrength = card.strength;
			if (card.originalStrength === undefined) card.originalStrength = card.strength;
			if (card.modifiedStrength === undefined) card.modifiedStrength = card.strength;
			
			card.modifiedStrength = Math.max(0, card.modifiedStrength - amount);
			card.currentStrength = card.modifiedStrength;
			card.strength = card.currentStrength;
			card._displayStrength = card.currentStrength;
		},
		
		destroyCard: function(gameState, card, row, gameModule) {
			const rowCards = gameState.opponent.rows[row].cards;
			let cardIndex = -1;
			
			if (card.uniqueId !== undefined) {
				cardIndex = rowCards.findIndex(c => c.uniqueId === card.uniqueId);
			}
			if (cardIndex === -1) {
				cardIndex = rowCards.indexOf(card);
			}
			if (cardIndex === -1) {
				// Последний вариант — ищем по id, но только если карта одна
				const sameId = rowCards
					.map((c, index) => ({ c, index }))
					.filter(entry => entry.c.id === card.id);
				if (sameId.length === 1) {
					cardIndex = sameId[0].index;
				}
			}
			
			if (cardIndex !== -1) {
				const destroyedCard = rowCards.splice(cardIndex, 1)[0];
				gameModule.addCardToDiscard(destroyedCard, 'opponent');
				gameModule.redrawRow(row, 'opponent');
				gameModule.updateRowStrength(row, 'opponent');
				audioManager.playSound('card_destroy');
			}
		}
	},
	
	'realms_ability_1': {
		name: 'Королевское вдохновение',
		description: 'Усильте дружественный отряд на 5 едениц',
		execute: function(gameState, gameModule) {
			// Собираем все дружественные отряды на поле (исключая героев)
			const friendlyUnits = [];
			const rows = ['close', 'ranged', 'siege'];
			
			rows.forEach(row => {
				gameState.player.rows[row].cards.forEach(card => {
					if (card.type === 'unit') {
						// Пропускаем героев
						if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
						friendlyUnits.push({ card: card, row: row });
					}
				});
			});
			
			if (friendlyUnits.length === 0) {
				gameModule.showGameMessage('Нет дружественных отрядов на поле для усиления', 'warning');
				return false;
			}
			
			// Сохраняем состояние для отмены
			this._gameState = gameState;
			this._gameModule = gameModule;
			this._boostAmount = 5;
			
			// Показываем выбор цели на поле
			this.showTargetSelection(friendlyUnits, gameState, gameModule);
			return true;
		},
		
		showTargetSelection: function(friendlyUnits, gameState, gameModule) {
			const rows = ['close', 'ranged', 'siege'];
			this._clickHandlers = [];
			
			const clickHandler = (target) => {
				return (event) => {
					// Проверяем, что цель все еще существует на поле
					const stillExists = gameState.player.rows[target.row].cards.some(
						c => c.uniqueId === target.card.uniqueId && c.type === 'unit'
					);
					
					if (!stillExists) {
						gameModule.showGameMessage('Эта карта уже не на поле', 'warning');
						this.removeHighlights(gameState);
						return;
					}
					
					// Проверяем героя (дополнительная защита)
					if (target.card.tags && (target.card.tags.includes('hero') || target.card.tags.includes('герой'))) {
						gameModule.showGameMessage('Нельзя усилить Героя!', 'warning');
						this.removeHighlights(gameState);
						return;
					}
					
					// Применяем усиление
					this.boostCard(target.card, this._boostAmount);
					
					// === АНИМАЦИЯ УСИЛЕНИЯ +5 (как в scoiatael_ability_1) ===
					this.createBoostVisualEffect(target.card, target.row, gameModule);
					
					gameState.player.abilityUsedThisRound = true;
					
					gameModule.updateRowStrength(target.row, 'player');
					gameModule.updateTotalScoreDisplays();
					gameModule.showGameMessage(`Способность "${this.name}" активирована! ${target.card.name} усилен на ${this._boostAmount} ед.`, 'info');
					audioManager.playSound('card_boost');
					
					// Убираем подсветку
					this.removeHighlights(gameState);
				};
			};
			
			// Подсвечиваем доступные карты (не героев)
			for (const row of rows) {
				const rowElement = document.getElementById(`player${gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(cardElement => {
					const cardId = cardElement.dataset.cardId;
					const uniqueId = cardElement.dataset.uniqueId;
					
					const target = friendlyUnits.find(u => 
						(u.card.id === cardId || u.card.uniqueId === uniqueId)
					);
					
					if (target) {
						// Дополнительная проверка: убеждаемся, что это не герой
						if (target.card.tags && (target.card.tags.includes('hero') || target.card.tags.includes('герой'))) return;
						
						cardElement.style.cursor = 'pointer';
						cardElement.classList.add('boost-target');
						
						const handler = clickHandler(target);
						cardElement.addEventListener('click', handler);
						this._clickHandlers.push({ element: cardElement, handler: handler });
						
						// Эффект при наведении
						cardElement.addEventListener('mouseenter', () => {
							cardElement.style.transform = 'scale(1.05)';
							cardElement.style.filter = 'brightness(1.2) drop-shadow(0 0 12px #4CAF50)';
						});
						
						cardElement.addEventListener('mouseleave', () => {
							cardElement.style.transform = 'scale(1)';
							cardElement.style.filter = '';
						});
					}
				});
			}
			
			// === КНОПКА ОТМЕНЫ (как в scoiatael_ability_3) ===
			this.showCancelButton(gameState, gameModule);
		},
		
		// ===== АНИМАЦИЯ УСИЛЕНИЯ +5 (как в scoiatael_ability_1) =====
		createBoostVisualEffect: function(card, row, gameModule) {
			const rowElement = document.getElementById(`player${gameModule.capitalizeFirst(row)}Row`);
			if (!rowElement) return;
			
			// Ищем элемент карты на доске
			let cardElement = null;
			
			if (card.uniqueId) {
				cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			}
			
			if (!cardElement) {
				const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
				if (elements.length === 1) {
					cardElement = elements[0];
				} else if (elements.length > 1) {
					const rowState = this._gameState.player.rows[row];
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
			
			// Если не нашли по селекторам, пробуем найти по позиции
			if (!cardElement) {
				const allCards = rowElement.querySelectorAll('.board-card');
				const rowState = this._gameState.player.rows[row];
				const position = rowState.cards.findIndex(c => 
					c.id === card.id && c.uniqueId === card.uniqueId
				);
				if (position !== -1 && allCards[position]) {
					cardElement = allCards[position];
				}
			}
			
			if (!cardElement) return;
			
			// Создаём элемент с анимацией +5 (зелёный)
			const boostOverlay = document.createElement('div');
			boostOverlay.className = 'card-boost-overlay';
			boostOverlay.textContent = '+5';
			boostOverlay.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #00ff00;
				font-size: 36px;
				font-weight: bold;
				text-shadow: 0 0 20px rgba(0, 255, 0, 0.9), 0 0 40px rgba(0, 255, 0, 0.6);
				z-index: 100;
				pointer-events: none;
				animation: leaderBoostAnimation 1.2s ease-out forwards;
				font-family: 'Gwent', sans-serif;
				letter-spacing: 2px;
			`;
			
			// Добавляем свечение на карту
			cardElement.style.boxShadow = '0 0 20px 8px rgba(0, 255, 0, 0.5)';
			cardElement.style.transition = 'box-shadow 0.5s ease-out';
			
			cardElement.appendChild(boostOverlay);
			
			// Удаляем эффект через 1.2 секунды
			setTimeout(() => {
				if (boostOverlay.parentNode) {
					boostOverlay.remove();
				}
				cardElement.style.boxShadow = '';
			}, 1200);
		},
		
		// ===== КНОПКА ОТМЕНЫ (как в scoiatael_ability_3) =====
		showCancelButton: function(gameState, gameModule) {
			const existingBtn = document.getElementById('abilityCancelBtn');
			if (existingBtn) existingBtn.remove();
			
			const cancelBtn = document.createElement('button');
			cancelBtn.id = 'abilityCancelBtn';
			cancelBtn.textContent = 'ОТМЕНА';
			cancelBtn.className = 'ability-cancel-btn';
			cancelBtn.style.cssText = `
				position: fixed;
				bottom: 30px;
				left: 50%;
				transform: translateX(-50%);
				background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
				color: #d4af37;
				border: 2px solid #d4af37;
				padding: 12px 35px;
				border-radius: 8px;
				cursor: pointer;
				font-weight: bold;
				font-family: 'Gwent', sans-serif;
				font-size: 16px;
				text-transform: uppercase;
				letter-spacing: 2px;
				z-index: 10050;
				transition: all 0.3s ease;
				box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
			`;
			
			cancelBtn.addEventListener('mouseenter', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1.05)';
				cancelBtn.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)';
				audioManager.playSound('touch');
			});
			
			cancelBtn.addEventListener('mouseleave', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1)';
				cancelBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
			});
			
			cancelBtn.addEventListener('click', () => {
				// Отменяем выделение и сбрасываем флаг использования
				this.removeHighlights(gameState);
				audioManager.playSound('button');
				gameModule.showGameMessage('Использование способности отменено', 'info');
				
				// Сбрасываем флаг использования способности
				if (gameState) {
					gameState.player.abilityUsedThisRound = false;
				}
				
				// Обновляем иконку способности (возвращаем активное состояние)
				if (window.boardModule && window.boardModule.updateAbilityAvailability) {
					window.boardModule.updateAbilityAvailability(gameState);
				}
			});
			
			document.body.appendChild(cancelBtn);
			this._cancelBtn = cancelBtn;
		},
		
		removeCancelButton: function() {
			if (this._cancelBtn && this._cancelBtn.parentNode) {
				this._cancelBtn.remove();
				this._cancelBtn = null;
			}
			const btn = document.getElementById('abilityCancelBtn');
			if (btn) btn.remove();
		},
		
		removeHighlights: function(gameState) {
			const rows = ['close', 'ranged', 'siege'];
			for (const row of rows) {
				const rowElement = document.getElementById(`player${gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(card => {
					card.style.cursor = '';
					card.classList.remove('boost-target');
					card.style.filter = '';
					card.style.transform = '';
					card.style.boxShadow = '';
				});
			}
			
			// Удаляем обработчики кликов
			if (this._clickHandlers) {
				this._clickHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('click', handler);
				});
				this._clickHandlers = [];
			}
			
			this.removeCancelButton();
		},
		
		boostCard: function(card, amount) {
			if (window.gameModule && window.gameModule.applyCardBoost) {
				window.gameModule.applyCardBoost(card, amount);
				return;
			}
			
			if (card.baseStrength === undefined) {
				card.baseStrength = card.strength;
			}
			if (card.originalStrength === undefined) {
				card.originalStrength = card.strength;
			}
			if (card.modifiedStrength === undefined) {
				card.modifiedStrength = card.strength;
			}
			
			card.modifiedStrength += amount;
			card.currentStrength = card.modifiedStrength;
			card.strength = card.currentStrength;
			card._displayStrength = card.currentStrength;
		},
		
		getRowName: function(row) {
			const names = {
				'close': 'Ближний бой',
				'ranged': 'Дальний бой',
				'siege': 'Осадный'
			};
			return names[row] || row;
		}
	},
	'realms_ability_2': {
		name: 'Ополчение',
		description: 'Нанесите 3 еденицы урона 2-м отрядам противника',
		execute: function(gameState, gameModule) {
			let selectedCards = [];
			const maxSelections = 2;
			const damageAmount = 3;
			const enemyUnits = [];
			const rows = ['close', 'ranged', 'siege'];
			
			// ===== ФИЛЬТРУЕМ ТОЛЬКО ОТРЯДЫ (НЕ ГЕРОИ, НЕ АРТЕФАКТЫ) =====
			rows.forEach(row => {
				gameState.opponent.rows[row].cards.forEach(card => {
					// ===== ВАЖНО: ТОЛЬКО ОТРЯДЫ =====
					if (card.type === 'unit') {
						// Пропускаем героев
						if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
						// Пропускаем карты с силой 0 (уже уничтоженные)
						if (card.strength <= 0) return;
						enemyUnits.push({ 
							card: card, 
							row: row,
							uniqueId: card.uniqueId 
						});
					}
				});
			});
			
			if (enemyUnits.length === 0) {
				gameModule.showGameMessage('Нет вражеских отрядов для атаки', 'warning');
				return false;
			}
			
			// Сохраняем состояние для отмены
			this._gameState = gameState;
			this._gameModule = gameModule;
			this._damageAmount = damageAmount;
			this._maxSelections = maxSelections;
			
			this.highlightEnemyUnitsForDamage(enemyUnits, selectedCards, maxSelections, damageAmount, gameState, gameModule);
			return true;
		},
		
		highlightEnemyUnitsForDamage: function(enemyUnits, selectedCards, maxSelections, damageAmount, gameState, gameModule) {
			const rows = ['close', 'ranged', 'siege'];
			this._clickHandlers = [];
			this._mouseEnterHandlers = [];
			this._mouseLeaveHandlers = [];
			
			const clickHandler = (target) => {
				return (event) => {
					// Проверяем, что цель все еще существует на поле
					const stillExists = gameState.opponent.rows[target.row].cards.some(
						c => c.uniqueId === target.card.uniqueId && c.type === 'unit'
					);
					
					if (!stillExists) {
						gameModule.showGameMessage('Эта карта уже не на поле', 'warning');
						this.removeHighlights(gameState);
						return;
					}
					
					// Проверяем, что это отряд
					if (target.card.type !== 'unit') {
						gameModule.showGameMessage('Можно наносить урон только отрядам!', 'warning');
						this.removeHighlights(gameState);
						return;
					}
					
					// Проверяем героя
					if (target.card.tags && (target.card.tags.includes('hero') || target.card.tags.includes('герой'))) {
						gameModule.showGameMessage('Нельзя нанести урон Герою!', 'warning');
						return;
					}
					
					// Проверяем, что карта ещё жива
					if (target.card.modifiedStrength <= 0) {
						gameModule.showGameMessage('Эта карта уже уничтожена', 'warning');
						this.removeHighlights(gameState);
						return;
					}
					
					const alreadySelected = selectedCards.some(s => s.uniqueId === target.uniqueId);
					if (!alreadySelected && selectedCards.length < maxSelections) {
						selectedCards.push(target);
						this.highlightDamageCard(target.uniqueId, true);
						audioManager.playSound('cardAdd');
					} else if (alreadySelected) {
						const index = selectedCards.findIndex(s => s.uniqueId === target.uniqueId);
						selectedCards.splice(index, 1);
						this.highlightDamageCard(target.uniqueId, false);
						audioManager.playSound('cardRemove');
					}
					
					this.updateDamageCounter(maxSelections, selectedCards.length);
				};
			};
			
			// Подсвечиваем только отряды (не герои)
			for (const row of rows) {
				const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(card => {
					const uniqueId = card.dataset.uniqueId;
					
					// Ищем цель по uniqueId
					const target = enemyUnits.find(u => u.uniqueId === uniqueId);
					
					if (target) {
						// ===== ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА: убеждаемся, что это отряд =====
						if (target.card.type !== 'unit') return;
						
						// Проверяем, что это не герой
						if (target.card.tags && (target.card.tags.includes('hero') || target.card.tags.includes('герой'))) return;
						
						// Проверяем, что карта ещё жива
						if (target.card.strength <= 0) return;
						
						card.style.cursor = 'pointer';
						card.classList.add('damage-target');
						
						const handler = clickHandler(target);
						card.addEventListener('click', handler);
						this._clickHandlers.push({ element: card, handler: handler });
						
						// Сохраняем связь для highlightDamageCard
						card.dataset.damageUniqueId = target.uniqueId;
						
						// ===== СОХРАНЯЕМ ОБРАБОТЧИКИ НАВЕДЕНИЯ =====
						const mouseEnterHandler = () => {
							if (!card.classList.contains('damage-selected')) {
								card.style.transform = 'scale(1.05)';
							}
						};
						
						const mouseLeaveHandler = () => {
							if (!card.classList.contains('damage-selected')) {
								card.style.transform = 'scale(1)';
							}
						};
						
						card.addEventListener('mouseenter', mouseEnterHandler);
						card.addEventListener('mouseleave', mouseLeaveHandler);
						
						this._mouseEnterHandlers.push({ element: card, handler: mouseEnterHandler });
						this._mouseLeaveHandlers.push({ element: card, handler: mouseLeaveHandler });
					}
				});
			}
			
			this.createDamageCounter(maxSelections);
			this.showDamageConfirmButton(() => {
				if (selectedCards.length === 0) {
					gameModule.showGameMessage('Выберите хотя бы одну цель', 'warning');
					return;
				}
				
				// Применяем урон с анимацией
				selectedCards.forEach(item => {
					this.dealDamage(item.card, damageAmount);
					
					// Анимация урона
					this.createDamageVisualEffect(item.card, item.row, gameModule);
					
					if (item.card.strength <= 0) {
						this.destroyCard(gameState, item.card, item.row, gameModule);
					}
					gameModule.updateRowStrength(item.row, 'opponent');
				});
				
				gameState.player.abilityUsedThisRound = true;
				gameModule.updateTotalScoreDisplays();
				gameModule.showGameMessage(`Способность "${this.name}" активирована! Нанесён урон ${selectedCards.length} отрядам.`, 'info');
				audioManager.playSound('card_damage');
				
				this.removeHighlights(gameState);
				this.removeDamageCounter();
				this.removeCancelButton();
				
				if (window.boardModule && window.boardModule.updateAbilityAvailability) {
					window.boardModule.updateAbilityAvailability(gameState);
				}
			});
			
			// Кнопка отмены
			this.showCancelButton(gameState, gameModule);
		},
		
		// ===== ИСПРАВЛЕННЫЙ МЕТОД highlightDamageCard =====
		highlightDamageCard: function(uniqueId, isSelected) {
			const allCards = document.querySelectorAll('.board-card');
			allCards.forEach(card => {
				if (card.dataset.uniqueId === uniqueId || card.dataset.damageUniqueId === uniqueId) {
					if (isSelected) {
						card.classList.add('damage-selected');
						card.style.filter = 'brightness(1.2) drop-shadow(0 0 8px #ff4444)';
						card.style.transform = 'scale(1.05)';
					} else {
						card.classList.remove('damage-selected');
						card.style.filter = '';
						card.style.transform = 'scale(1)';
					}
				}
			});
		},
		
		// ===== АНИМАЦИЯ УРОНА =====
		createDamageVisualEffect: function(card, row, gameModule) {
			const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
			if (!rowElement) return;
			
			let cardElement = null;
			
			if (card.uniqueId) {
				cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			}
			
			if (!cardElement) {
				const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
				if (elements.length === 1) {
					cardElement = elements[0];
				} else if (elements.length > 1) {
					const rowState = this._gameState.opponent.rows[row];
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
			
			const damageOverlay = document.createElement('div');
			damageOverlay.className = 'card-damage-overlay';
			damageOverlay.textContent = '-3';
			damageOverlay.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #ff1744;
				font-size: 36px;
				font-weight: bold;
				text-shadow: 0 0 20px rgba(255, 23, 68, 0.9), 0 0 40px rgba(255, 0, 0, 0.6);
				z-index: 100;
				pointer-events: none;
				animation: leaderBoostAnimation 1.2s ease-out forwards;
				font-family: 'Gwent', sans-serif;
				letter-spacing: 2px;
			`;
			
			cardElement.style.boxShadow = '0 0 20px 8px rgba(255, 0, 0, 0.5)';
			cardElement.style.transition = 'box-shadow 0.5s ease-out';
			
			cardElement.appendChild(damageOverlay);
			
			setTimeout(() => {
				if (damageOverlay.parentNode) {
					damageOverlay.remove();
				}
				cardElement.style.boxShadow = '';
			}, 1200);
		},
		
		createDamageCounter: function(max) {
			const existingCounter = document.getElementById('abilityCounter');
			if (existingCounter) existingCounter.remove();
			
			const counter = document.createElement('div');
			counter.id = 'abilityCounter';
			counter.className = 'ability-counter';
			counter.textContent = `Выбрано: 0/${max}`;
			counter.style.cssText = `
				position: fixed;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				background: rgba(0, 0, 0, 0.85);
				color: #d4af37;
				padding: 12px 24px;
				border-radius: 8px;
				font-family: 'Gwent', sans-serif;
				font-size: 18px;
				font-weight: bold;
				z-index: 10050;
				border: 2px solid #d4af37;
				text-align: center;
				pointer-events: none;
				box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
			`;
			document.body.appendChild(counter);
		},
		
		updateDamageCounter: function(max, current) {
			const counter = document.getElementById('abilityCounter');
			if (counter) counter.textContent = `Выбрано: ${current}/${max}`;
		},
		
		removeDamageCounter: function() {
			const counter = document.getElementById('abilityCounter');
			if (counter) counter.remove();
		},
		
		showDamageConfirmButton: function(onConfirm) {
			const existingBtn = document.getElementById('abilityConfirmBtn');
			if (existingBtn) existingBtn.remove();
			
			const confirmBtn = document.createElement('button');
			confirmBtn.id = 'abilityConfirmBtn';
			confirmBtn.textContent = 'ПОДТВЕРДИТЬ';
			confirmBtn.className = 'ability-confirm-btn';
			confirmBtn.style.cssText = `
				position: fixed;
				bottom: 30px;
				right: 30px;
				background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
				color: #4CAF50;
				border: 2px solid #4CAF50;
				padding: 12px 35px;
				border-radius: 8px;
				cursor: pointer;
				font-weight: bold;
				font-family: 'Gwent', sans-serif;
				font-size: 16px;
				text-transform: uppercase;
				letter-spacing: 2px;
				z-index: 10050;
				transition: all 0.3s ease;
				box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
			`;
			confirmBtn.addEventListener('click', () => {
				onConfirm();
				audioManager.playSound('button');
			});
			confirmBtn.addEventListener('mouseenter', () => {
				confirmBtn.style.transform = 'scale(1.05)';
				confirmBtn.style.boxShadow = '0 0 20px rgba(76, 175, 80, 0.5)';
				audioManager.playSound('touch');
			});
			confirmBtn.addEventListener('mouseleave', () => {
				confirmBtn.style.transform = 'scale(1)';
				confirmBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
			});
			document.body.appendChild(confirmBtn);
			this._confirmBtn = confirmBtn;
		},
		
		showCancelButton: function(gameState, gameModule) {
			const existingBtn = document.getElementById('abilityCancelBtn');
			if (existingBtn) existingBtn.remove();
			
			const cancelBtn = document.createElement('button');
			cancelBtn.id = 'abilityCancelBtn';
			cancelBtn.textContent = 'ОТМЕНА';
			cancelBtn.className = 'ability-cancel-btn';
			cancelBtn.style.cssText = `
				position: fixed;
				bottom: 30px;
				left: 50%;
				transform: translateX(-50%);
				background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
				color: #d4af37;
				border: 2px solid #d4af37;
				padding: 12px 35px;
				border-radius: 8px;
				cursor: pointer;
				font-weight: bold;
				font-family: 'Gwent', sans-serif;
				font-size: 16px;
				text-transform: uppercase;
				letter-spacing: 2px;
				z-index: 10050;
				transition: all 0.3s ease;
				box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
			`;
			
			cancelBtn.addEventListener('mouseenter', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1.05)';
				cancelBtn.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)';
				audioManager.playSound('touch');
			});
			
			cancelBtn.addEventListener('mouseleave', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1)';
				cancelBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
			});
			
			cancelBtn.addEventListener('click', () => {
				if (gameState) {
					gameState.player.abilityUsedThisRound = false;
				}
				
				this.removeHighlights(gameState);
				this.removeDamageCounter();
				this.removeCancelButton();
				
				audioManager.playSound('button');
				gameModule.showGameMessage('Использование способности отменено', 'info');
				
				if (window.boardModule && window.boardModule.updateAbilityAvailability) {
					window.boardModule.updateAbilityAvailability(gameState);
				}
			});
			
			document.body.appendChild(cancelBtn);
			this._cancelBtn = cancelBtn;
		},
		
		removeCancelButton: function() {
			if (this._cancelBtn && this._cancelBtn.parentNode) {
				this._cancelBtn.remove();
				this._cancelBtn = null;
			}
			const btn = document.getElementById('abilityCancelBtn');
			if (btn) btn.remove();
			
			if (this._confirmBtn && this._confirmBtn.parentNode) {
				this._confirmBtn.remove();
				this._confirmBtn = null;
			}
			const confirmBtn = document.getElementById('abilityConfirmBtn');
			if (confirmBtn) confirmBtn.remove();
		},
		
		// ===== ИСПРАВЛЕННЫЙ МЕТОД removeHighlights =====
		removeHighlights: function(gameState) {
			const rows = ['close', 'ranged', 'siege'];
			for (const row of rows) {
				const rowElement = document.getElementById(`opponent${this._gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(card => {
					card.style.cursor = '';
					card.classList.remove('damage-target', 'damage-selected');
					card.style.filter = '';
					card.style.transform = '';
					card.style.boxShadow = '';
				});
			}
			
			// Удаляем обработчики кликов
			if (this._clickHandlers) {
				this._clickHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('click', handler);
				});
				this._clickHandlers = [];
			}
			
			// Удаляем обработчики mouseenter
			if (this._mouseEnterHandlers) {
				this._mouseEnterHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('mouseenter', handler);
				});
				this._mouseEnterHandlers = [];
			}
			
			// Удаляем обработчики mouseleave
			if (this._mouseLeaveHandlers) {
				this._mouseLeaveHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('mouseleave', handler);
				});
				this._mouseLeaveHandlers = [];
			}
			
			this.removeCancelButton();
		},
		
		dealDamage: function(card, amount) {
			if (window.gameModule && window.gameModule.applyCardDamage) {
				window.gameModule.applyCardDamage(card, amount);
				return;
			}
			
			if (card.baseStrength === undefined) card.baseStrength = card.strength;
			if (card.originalStrength === undefined) card.originalStrength = card.strength;
			if (card.modifiedStrength === undefined) card.modifiedStrength = card.strength;
			
			card.modifiedStrength = Math.max(0, card.modifiedStrength - amount);
			card.currentStrength = card.modifiedStrength;
			card.strength = card.currentStrength;
			card._displayStrength = card.currentStrength;
		},
		
		destroyCard: function(gameState, card, row, gameModule) {
			const rowCards = gameState.opponent.rows[row].cards;
			let cardIndex = -1;
			
			if (card.uniqueId !== undefined) {
				cardIndex = rowCards.findIndex(c => c.uniqueId === card.uniqueId);
			}
			if (cardIndex === -1) {
				cardIndex = rowCards.indexOf(card);
			}
			if (cardIndex === -1) {
				// Последний вариант — ищем по id, но только если карта одна
				const sameId = rowCards
					.map((c, index) => ({ c, index }))
					.filter(entry => entry.c.id === card.id);
				if (sameId.length === 1) {
					cardIndex = sameId[0].index;
				}
			}
			
			if (cardIndex !== -1) {
				const destroyedCard = rowCards.splice(cardIndex, 1)[0];
				gameModule.addCardToDiscard(destroyedCard, 'opponent');
				gameModule.redrawRow(row, 'opponent');
				gameModule.updateRowStrength(row, 'opponent');
				audioManager.playSound('card_destroy');
			}
		}
	},
	'realms_ability_3': {
		name: 'Стена щитов',
		description: 'Усильте дружественный отряд на 2 еденицы и призвать в руку артефакт',
		execute: function(gameState, gameModule) {
			const friendlyUnits = [];
			const rows = ['close', 'ranged', 'siege'];
			
			rows.forEach(row => {
				gameState.player.rows[row].cards.forEach((card, index) => {
					if (card.type === 'unit') {
						// Пропускаем героев
						if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
						friendlyUnits.push({ card: card, row: row, index: index });
					}
				});
			});
			
			if (friendlyUnits.length === 0) {
				gameModule.showGameMessage('Нет дружественных отрядов на поле для усиления', 'warning');
				return false;
			}
			
			// Сохраняем состояние для отмены
			this._gameState = gameState;
			this._gameModule = gameModule;
			this._boostAmount = 2;
			
			this.showTargetSelection(friendlyUnits, gameState, gameModule);
			return true;
		},
		
		showTargetSelection: function(friendlyUnits, gameState, gameModule) {
			const rows = ['close', 'ranged', 'siege'];
			this._clickHandlers = [];
			
			const clickHandler = (target) => {
				return (event) => {
					// Проверяем, что цель все еще существует на поле
					const stillExists = gameState.player.rows[target.row].cards.some(
						c => c.uniqueId === target.card.uniqueId && c.type === 'unit'
					);
					
					if (!stillExists) {
						gameModule.showGameMessage('Эта карта уже не на поле', 'warning');
						this.removeHighlights(gameState);
						return;
					}
					
					// Проверяем героя
					if (target.card.tags && (target.card.tags.includes('hero') || target.card.tags.includes('герой'))) {
						gameModule.showGameMessage('Нельзя усилить Героя!', 'warning');
						this.removeHighlights(gameState);
						return;
					}
					
					// Применяем усиление
					this.boostCard(target.card, this._boostAmount);
					
					// === АНИМАЦИЯ УСИЛЕНИЯ +2 (как в scoiatael_ability_1) ===
					this.createBoostVisualEffect(target.card, target.row, gameModule);
					
					// Ищем артефакт в колоде
					let artifactIndex = -1;
					let artifactCard = null;
					for (let i = 0; i < gameState.player.deck.length; i++) {
						if (gameState.player.deck[i].type === 'artifact') {
							artifactIndex = i;
							artifactCard = gameState.player.deck[i];
							break;
						}
					}
					
					if (artifactCard && gameState.player.hand.length < 10) {
						gameState.player.deck.splice(artifactIndex, 1);
						gameState.player.hand.push(artifactCard);
						gameModule.displayPlayerHand();
						gameModule.displayPlayerDeck();
						gameModule.showGameMessage(`Артефакт "${artifactCard.name}" добавлен в руку из колоды!`, 'info');
						audioManager.playSound('cardAdd');
					} else if (gameState.player.hand.length >= 10) {
						gameModule.showGameMessage('Нет места в руке для артефакта', 'warning');
					} else {
						gameModule.showGameMessage('В колоде нет артефактов', 'warning');
					}
					
					gameState.player.abilityUsedThisRound = true;
					gameModule.updateRowStrength(target.row, 'player');
					gameModule.updateTotalScoreDisplays();
					gameModule.updateCardStrengthDisplay(target.card, target.row, 'player');
					gameModule.showGameMessage(`Способность "${this.name}" активирована! ${target.card.name} усилен на ${this._boostAmount} ед.`, 'info');
					audioManager.playSound('card_boost');
					
					this.removeHighlights(gameState);
				};
			};
			
			// Подсвечиваем доступные карты (не героев)
			for (const row of rows) {
				const rowElement = document.getElementById(`player${gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(card => {
					const cardId = card.dataset.cardId;
					const uniqueId = card.dataset.uniqueId;
					const target = friendlyUnits.find(u => 
						(u.card.id === cardId || u.card.uniqueId === uniqueId)
					);
					if (target) {
						// Дополнительная проверка: убеждаемся, что это не герой
						if (target.card.tags && (target.card.tags.includes('hero') || target.card.tags.includes('герой'))) return;
						
						card.style.cursor = 'pointer';
						card.classList.add('boost-target');
						
						const handler = clickHandler(target);
						card.addEventListener('click', handler);
						this._clickHandlers.push({ element: card, handler: handler });
						
						card.addEventListener('mouseenter', () => {
							card.style.transform = 'scale(1.05)';
							card.style.filter = 'brightness(1.2) drop-shadow(0 0 12px #4CAF50)';
						});
						
						card.addEventListener('mouseleave', () => {
							card.style.transform = 'scale(1)';
							card.style.filter = '';
						});
					}
				});
			}
			
			// === КНОПКА ОТМЕНЫ (как в scoiatael_ability_3) ===
			this.showCancelButton(gameState, gameModule);
		},
		
		// ===== АНИМАЦИЯ УСИЛЕНИЯ +2 (как в scoiatael_ability_1) =====
		createBoostVisualEffect: function(card, row, gameModule) {
			const rowElement = document.getElementById(`player${gameModule.capitalizeFirst(row)}Row`);
			if (!rowElement) return;
			
			// Ищем элемент карты на доске
			let cardElement = null;
			
			if (card.uniqueId) {
				cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			}
			
			if (!cardElement) {
				const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
				if (elements.length === 1) {
					cardElement = elements[0];
				} else if (elements.length > 1) {
					const rowState = this._gameState.player.rows[row];
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
			
			// Если не нашли по селекторам, пробуем найти по позиции
			if (!cardElement) {
				const allCards = rowElement.querySelectorAll('.board-card');
				const rowState = this._gameState.player.rows[row];
				const position = rowState.cards.findIndex(c => 
					c.id === card.id && c.uniqueId === card.uniqueId
				);
				if (position !== -1 && allCards[position]) {
					cardElement = allCards[position];
				}
			}
			
			if (!cardElement) return;
			
			// Создаём элемент с анимацией +2 (зелёный)
			const boostOverlay = document.createElement('div');
			boostOverlay.className = 'card-boost-overlay';
			boostOverlay.textContent = '+2';
			boostOverlay.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #00ff00;
				font-size: 36px;
				font-weight: bold;
				text-shadow: 0 0 20px rgba(0, 255, 0, 0.9), 0 0 40px rgba(0, 255, 0, 0.6);
				z-index: 100;
				pointer-events: none;
				animation: leaderBoostAnimation 1.2s ease-out forwards;
				font-family: 'Gwent', sans-serif;
				letter-spacing: 2px;
			`;
			
			// Добавляем свечение на карту
			cardElement.style.boxShadow = '0 0 20px 8px rgba(0, 255, 0, 0.5)';
			cardElement.style.transition = 'box-shadow 0.5s ease-out';
			
			cardElement.appendChild(boostOverlay);
			
			// Удаляем эффект через 1.2 секунды
			setTimeout(() => {
				if (boostOverlay.parentNode) {
					boostOverlay.remove();
				}
				cardElement.style.boxShadow = '';
			}, 1200);
		},
		
		// ===== КНОПКА ОТМЕНЫ (как в scoiatael_ability_3) =====
		showCancelButton: function(gameState, gameModule) {
			const existingBtn = document.getElementById('abilityCancelBtn');
			if (existingBtn) existingBtn.remove();
			
			const cancelBtn = document.createElement('button');
			cancelBtn.id = 'abilityCancelBtn';
			cancelBtn.textContent = 'ОТМЕНА';
			cancelBtn.className = 'ability-cancel-btn';
			cancelBtn.style.cssText = `
				position: fixed;
				bottom: 30px;
				left: 50%;
				transform: translateX(-50%);
				background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
				color: #d4af37;
				border: 2px solid #d4af37;
				padding: 12px 35px;
				border-radius: 8px;
				cursor: pointer;
				font-weight: bold;
				font-family: 'Gwent', sans-serif;
				font-size: 16px;
				text-transform: uppercase;
				letter-spacing: 2px;
				z-index: 10050;
				transition: all 0.3s ease;
				box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
			`;
			
			cancelBtn.addEventListener('mouseenter', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1.05)';
				cancelBtn.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)';
				audioManager.playSound('touch');
			});
			
			cancelBtn.addEventListener('mouseleave', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1)';
				cancelBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
			});
			
			cancelBtn.addEventListener('click', () => {
				// Отменяем выделение и сбрасываем флаг использования
				this.removeHighlights(gameState);
				audioManager.playSound('button');
				gameModule.showGameMessage('Использование способности отменено', 'info');
				
				// Сбрасываем флаг использования способности
				if (gameState) {
					gameState.player.abilityUsedThisRound = false;
				}
				
				// Обновляем иконку способности (возвращаем активное состояние)
				if (window.boardModule && window.boardModule.updateAbilityAvailability) {
					window.boardModule.updateAbilityAvailability(gameState);
				}
			});
			
			document.body.appendChild(cancelBtn);
			this._cancelBtn = cancelBtn;
		},
		
		removeCancelButton: function() {
			if (this._cancelBtn && this._cancelBtn.parentNode) {
				this._cancelBtn.remove();
				this._cancelBtn = null;
			}
			const btn = document.getElementById('abilityCancelBtn');
			if (btn) btn.remove();
		},
		
		removeHighlights: function(gameState) {
			const rows = ['close', 'ranged', 'siege'];
			for (const row of rows) {
				const rowElement = document.getElementById(`player${gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(card => {
					card.style.cursor = '';
					card.classList.remove('boost-target');
					card.style.filter = '';
					card.style.transform = '';
					card.style.boxShadow = '';
				});
			}
			
			// Удаляем обработчики кликов
			if (this._clickHandlers) {
				this._clickHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('click', handler);
				});
				this._clickHandlers = [];
			}
			
			this.removeCancelButton();
		},
		
		boostCard: function(card, amount) {
			if (window.gameModule && window.gameModule.applyCardBoost) {
				window.gameModule.applyCardBoost(card, amount);
				return;
			}
			
			if (card.baseStrength === undefined) card.baseStrength = card.strength;
			if (card.originalStrength === undefined) card.originalStrength = card.strength;
			if (card.modifiedStrength === undefined) card.modifiedStrength = card.strength;
			
			card.modifiedStrength += amount;
			card.currentStrength = card.modifiedStrength;
			card.strength = card.currentStrength;
			card._displayStrength = card.currentStrength;
		}
	},
	'realms_ability_4': {
		name: 'Побуждение к действию',
		description: 'Усильте дружественный отряд на поле на 3 еденицы',
		execute: function(gameState, gameModule) {
			const friendlyUnits = [];
			const rows = ['close', 'ranged', 'siege'];
			
			rows.forEach(row => {
				gameState.player.rows[row].cards.forEach(card => {
					if (card.type === 'unit') {
						if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
						friendlyUnits.push({ card: card, row: row });
					}
				});
			});
			
			if (friendlyUnits.length === 0) {
				gameModule.showGameMessage('Нет дружественных отрядов на поле для усиления', 'warning');
				return false;
			}
			
			// Сохраняем состояние для отмены
			this._gameState = gameState;
			this._gameModule = gameModule;
			this._boostAmount = 3;
			
			this.showTargetSelection(friendlyUnits, gameState, gameModule);
			return true;
		},
		
		showTargetSelection: function(friendlyUnits, gameState, gameModule) {
			const rows = ['close', 'ranged', 'siege'];
			this._clickHandlers = [];
			
			const clickHandler = (target) => {
				return (event) => {
					// Проверяем, что цель все еще существует на поле
					const stillExists = gameState.player.rows[target.row].cards.some(
						c => c.uniqueId === target.card.uniqueId && c.type === 'unit'
					);
					
					if (!stillExists) {
						gameModule.showGameMessage('Эта карта уже не на поле', 'warning');
						this.removeHighlights(gameState);
						return;
					}
					
					// Проверяем героя
					if (target.card.tags && (target.card.tags.includes('hero') || target.card.tags.includes('герой'))) {
						gameModule.showGameMessage('Нельзя усилить Героя!', 'warning');
						this.removeHighlights(gameState);
						return;
					}
					
					// Применяем усиление
					this.boostCard(target.card, this._boostAmount);
					
					// === АНИМАЦИЯ УСИЛЕНИЯ +3 (как в scoiatael_ability_1) ===
					this.createBoostVisualEffect(target.card, target.row, gameModule);
					
					gameState.player.abilityUsedThisRound = true;
					
					gameModule.updateRowStrength(target.row, 'player');
					gameModule.updateTotalScoreDisplays();
					gameModule.showGameMessage(`Способность "${this.name}" активирована! ${target.card.name} усилен на ${this._boostAmount} ед.`, 'info');
					audioManager.playSound('card_boost');
					
					this.removeHighlights(gameState);
				};
			};
			
			// Подсвечиваем доступные карты (не героев)
			for (const row of rows) {
				const rowElement = document.getElementById(`player${gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(card => {
					const cardId = card.dataset.cardId;
					const uniqueId = card.dataset.uniqueId;
					const target = friendlyUnits.find(u => 
						(u.card.id === cardId || u.card.uniqueId === uniqueId)
					);
					if (target) {
						// Дополнительная проверка: убеждаемся, что это не герой
						if (target.card.tags && (target.card.tags.includes('hero') || target.card.tags.includes('герой'))) return;
						
						card.style.cursor = 'pointer';
						card.classList.add('boost-target');
						
						const handler = clickHandler(target);
						card.addEventListener('click', handler);
						this._clickHandlers.push({ element: card, handler: handler });
						
						card.addEventListener('mouseenter', () => {
							card.style.transform = 'scale(1.05)';
							card.style.filter = 'brightness(1.2) drop-shadow(0 0 12px #4CAF50)';
						});
						
						card.addEventListener('mouseleave', () => {
							card.style.transform = 'scale(1)';
							card.style.filter = '';
						});
					}
				});
			}
			
			// === КНОПКА ОТМЕНЫ (как в scoiatael_ability_3) ===
			this.showCancelButton(gameState, gameModule);
		},
		
		// ===== АНИМАЦИЯ УСИЛЕНИЯ +3 (как в scoiatael_ability_1) =====
		createBoostVisualEffect: function(card, row, gameModule) {
			const rowElement = document.getElementById(`player${gameModule.capitalizeFirst(row)}Row`);
			if (!rowElement) return;
			
			// Ищем элемент карты на доске
			let cardElement = null;
			
			if (card.uniqueId) {
				cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			}
			
			if (!cardElement) {
				const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
				if (elements.length === 1) {
					cardElement = elements[0];
				} else if (elements.length > 1) {
					const rowState = this._gameState.player.rows[row];
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
			
			// Если не нашли по селекторам, пробуем найти по позиции
			if (!cardElement) {
				const allCards = rowElement.querySelectorAll('.board-card');
				const rowState = this._gameState.player.rows[row];
				const position = rowState.cards.findIndex(c => 
					c.id === card.id && c.uniqueId === card.uniqueId
				);
				if (position !== -1 && allCards[position]) {
					cardElement = allCards[position];
				}
			}
			
			if (!cardElement) return;
			
			// Создаём элемент с анимацией +3 (зелёный)
			const boostOverlay = document.createElement('div');
			boostOverlay.className = 'card-boost-overlay';
			boostOverlay.textContent = '+3';
			boostOverlay.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #00ff00;
				font-size: 36px;
				font-weight: bold;
				text-shadow: 0 0 20px rgba(0, 255, 0, 0.9), 0 0 40px rgba(0, 255, 0, 0.6);
				z-index: 100;
				pointer-events: none;
				animation: leaderBoostAnimation 1.2s ease-out forwards;
				font-family: 'Gwent', sans-serif;
				letter-spacing: 2px;
			`;
			
			// Добавляем свечение на карту
			cardElement.style.boxShadow = '0 0 20px 8px rgba(0, 255, 0, 0.5)';
			cardElement.style.transition = 'box-shadow 0.5s ease-out';
			
			cardElement.appendChild(boostOverlay);
			
			// Удаляем эффект через 1.2 секунды
			setTimeout(() => {
				if (boostOverlay.parentNode) {
					boostOverlay.remove();
				}
				cardElement.style.boxShadow = '';
			}, 1200);
		},
		
		// ===== КНОПКА ОТМЕНЫ (как в scoiatael_ability_3) =====
		showCancelButton: function(gameState, gameModule) {
			const existingBtn = document.getElementById('abilityCancelBtn');
			if (existingBtn) existingBtn.remove();
			
			const cancelBtn = document.createElement('button');
			cancelBtn.id = 'abilityCancelBtn';
			cancelBtn.textContent = 'ОТМЕНА';
			cancelBtn.className = 'ability-cancel-btn';
			cancelBtn.style.cssText = `
				position: fixed;
				bottom: 30px;
				left: 50%;
				transform: translateX(-50%);
				background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
				color: #d4af37;
				border: 2px solid #d4af37;
				padding: 12px 35px;
				border-radius: 8px;
				cursor: pointer;
				font-weight: bold;
				font-family: 'Gwent', sans-serif;
				font-size: 16px;
				text-transform: uppercase;
				letter-spacing: 2px;
				z-index: 10050;
				transition: all 0.3s ease;
				box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
			`;
			
			cancelBtn.addEventListener('mouseenter', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1.05)';
				cancelBtn.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)';
				audioManager.playSound('touch');
			});
			
			cancelBtn.addEventListener('mouseleave', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1)';
				cancelBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
			});
			
			cancelBtn.addEventListener('click', () => {
				// Отменяем выделение и сбрасываем флаг использования
				this.removeHighlights(gameState);
				audioManager.playSound('button');
				gameModule.showGameMessage('Использование способности отменено', 'info');
				
				// Сбрасываем флаг использования способности
				if (gameState) {
					gameState.player.abilityUsedThisRound = false;
				}
				
				// Обновляем иконку способности (возвращаем активное состояние)
				if (window.boardModule && window.boardModule.updateAbilityAvailability) {
					window.boardModule.updateAbilityAvailability(gameState);
				}
			});
			
			document.body.appendChild(cancelBtn);
			this._cancelBtn = cancelBtn;
		},
		
		removeCancelButton: function() {
			if (this._cancelBtn && this._cancelBtn.parentNode) {
				this._cancelBtn.remove();
				this._cancelBtn = null;
			}
			const btn = document.getElementById('abilityCancelBtn');
			if (btn) btn.remove();
		},
		
		removeHighlights: function(gameState) {
			const rows = ['close', 'ranged', 'siege'];
			for (const row of rows) {
				const rowElement = document.getElementById(`player${gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(card => {
					card.style.cursor = '';
					card.classList.remove('boost-target');
					card.style.filter = '';
					card.style.transform = '';
					card.style.boxShadow = '';
				});
			}
			
			// Удаляем обработчики кликов
			if (this._clickHandlers) {
				this._clickHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('click', handler);
				});
				this._clickHandlers = [];
			}
			
			this.removeCancelButton();
		},
		
		boostCard: function(card, amount) {
			if (window.gameModule && window.gameModule.applyCardBoost) {
				window.gameModule.applyCardBoost(card, amount);
				return;
			}
			
			if (card.baseStrength === undefined) card.baseStrength = card.strength;
			if (card.originalStrength === undefined) card.originalStrength = card.strength;
			if (card.modifiedStrength === undefined) card.modifiedStrength = card.strength;
			
			card.modifiedStrength += amount;
			card.currentStrength = card.modifiedStrength;
			card.strength = card.currentStrength;
			card._displayStrength = card.currentStrength;
		}
	},
	'realms_ability_5': {
		name: 'Мобилизация',
		description: 'Призовите бронзовый отряд на поле и усильте его и смежные с ним отряд на 3 еденицы',
		isExecuting: false,  
		pendingCard: null,   
		pendingCardIndex: null, 
		
		execute: async function(gameState, gameModule) {
			// Запрещаем повторную активацию, если уже выполняется
			if (this.isExecuting) {
				gameModule.showGameMessage('Способность уже активирована! Разместите выбранную карту.', 'warning');
				return false;
			}
			
			// Очищаем предыдущие выделения
			this.cleanupPreviousSelection();
			
			// 1. Показываем модальное окно с картами из колоды
			// Шпионы в списке призыва не участвуют
			const bronzeUnits = [];
			gameState.player.deck.forEach((card, index) => {
				const isSpy = typeof gameModule.isSpyCard === 'function'
					? gameModule.isSpyCard(card)
					: card.ability === 'spy';
				
				if (card.type === 'unit' && card.rarity === 'bronze' && !isSpy) {
					bronzeUnits.push({ card: card, index: index });
				}
			});
			
			if (bronzeUnits.length === 0) {
				gameModule.showGameMessage('Нет бронзовых отрядов для призыва в колоде', 'warning');
				return false;
			}
			
			this.isExecuting = true;
			
			const selectedCard = await this.showDeckSelectionModal(bronzeUnits, gameModule);
			
			if (!selectedCard) {
				// Отмена выбора
				this.isExecuting = false;
				return false;
			}
			
			// 2. Проверяем, что карта всё ещё в колоде
			const stillInDeck = gameState.player.deck.some((card, idx) => 
				idx === selectedCard.index && card.id === selectedCard.card.id
			);
			
			if (!stillInDeck) {
				gameModule.showGameMessage('Эта карта больше не доступна', 'warning');
				this.isExecuting = false;
				return false;
			}
			
			// 3. Сохраняем выбранную карту и удаляем из колоды
			this.pendingCard = selectedCard.card;
			this.pendingCardIndex = selectedCard.index;
			gameState.player.deck.splice(selectedCard.index, 1);
			
			// 4. Показываем выбор ряда
			const availableRows = this.getAvailableRowsForCard(this.pendingCard, gameState);
			if (availableRows.length === 0) {
				gameModule.showGameMessage('Нет свободных рядов для размещения', 'warning');
				// Возвращаем карту в колоду
				gameState.player.deck.splice(this.pendingCardIndex, 0, this.pendingCard);
				this.pendingCard = null;
				this.pendingCardIndex = null;
				this.isExecuting = false;
				return false;
			}
			
			const selectedRow = await this.showRowSelectionForSummon(availableRows, gameState, gameModule);
			
			if (!selectedRow) {
				// Отмена размещения - возвращаем карту в колоду
				gameState.player.deck.splice(this.pendingCardIndex, 0, this.pendingCard);
				this.pendingCard = null;
				this.pendingCardIndex = null;
				this.isExecuting = false;
				return false;
			}
			
			// Размещаем карту
			await this.placeSummonedCard(this.pendingCard, selectedRow, gameState, gameModule);
			
			// Сбрасываем состояние
			this.pendingCard = null;
			this.pendingCardIndex = null;
			this.isExecuting = false;
			
			return true;
		},
		
		cleanupPreviousSelection: function() {
			// Удаляем все подсветки рядов
			const rows = ['close', 'ranged', 'siege'];
			for (const row of rows) {
				const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
				if (rowElement) {
					rowElement.classList.remove('row-available');
					rowElement.style.cursor = '';
					rowElement.style.transform = '';
					const newRow = rowElement.cloneNode(true);
					rowElement.parentNode?.replaceChild(newRow, rowElement);
				}
			}
			
			// Удаляем кнопку отмены
			const cancelBtn = document.querySelector('.ability-cancel-btn');
			if (cancelBtn) cancelBtn.remove();
			
			// Закрываем все модальные окна
			const modals = document.querySelectorAll('.deck-modal-overlay');
			modals.forEach(modal => modal.remove());
		},
		
		capitalizeFirst: function(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		},
		
		showDeckSelectionModal: function(cards, gameModule) {
			return new Promise((resolve) => {
				// Закрываем предыдущие модальные окна
				const existingModals = document.querySelectorAll('.deck-modal-overlay');
				existingModals.forEach(modal => modal.remove());

				const playerFaction = (gameModule && gameModule.gameState && gameModule.gameState.player && gameModule.gameState.player.faction)
					|| (cards[0] && cards[0].card && cards[0].card.faction)
					|| 'neutral';
				const factionBackground = `faction/${playerFaction}/border_faction.png`;
				
				const modalOverlay = document.createElement('div');
				modalOverlay.className = 'deck-modal-overlay';
				modalOverlay.innerHTML = `
					<div class="deck-modal-wrapper">
						<div class="deck-modal">
							<div class="deck-modal__header" style="background: url('${factionBackground}') center/cover;">
								<div class="deck-modal__title">ВЫБЕРИТЕ БРОНЗОВЫЙ ОТРЯД</div>
								<div class="deck-modal__count">${cards.length}</div>
							</div>
							<div class="deck-modal__content">
								${cards.map((item, idx) => `
									<div class="deck-card" data-card-index="${idx}" data-card-id="${item.card.id}">
										<div class="deck-card__container">
											<img src="card/${item.card.faction}/${item.card.imageStatic || (item.card.image ? item.card.image.replace('.mp4', '.jpg') : 'placeholder.jpg')}" 
												 class="deck-card__media" onerror="this.src='card/placeholder.jpg'">
											<img src="${item.card.border || 'deck/bord_silver.png'}" class="deck-card__border">
											<img src="${item.card.banner || 'faction/' + item.card.faction + '/banner_silver.png'}" class="deck-card__banner">
											<div class="deck-card__name">${item.card.name}</div>
											<div class="deck-card__strength">${item.card.strength || ''}</div>
											${item.card.position ? `
											<div class="deck-card__position">
												<img src="${item.card.positionBanner || 'faction/' + item.card.faction + '/banner_position.png'}" class="deck-card__position-banner">
												<img src="${this.getPositionIconPath(item.card.position)}" class="deck-card__position-icon">
											</div>
											` : ''}
										</div>
									</div>
								`).join('')}
							</div>
						</div>
						<button class="deck-modal__cancel" type="button">ОТМЕНА</button>
					</div>
				`;
				
				document.body.appendChild(modalOverlay);
				setTimeout(() => modalOverlay.classList.add('active'), 10);
				
				let isResolved = false;
				
				const resolveOnce = (value) => {
					if (!isResolved) {
						isResolved = true;
						resolve(value);
					}
				};
				
				// Добавляем обработчики для карт
				const cardElements = modalOverlay.querySelectorAll('.deck-card');
				cardElements.forEach(card => {
					const cardData = cards[parseInt(card.dataset.cardIndex)];
					
					card.addEventListener('click', (e) => {
						if (e.button === 0 && !isResolved) {
							const index = parseInt(card.dataset.cardIndex);
							this.closeModal(modalOverlay);
							audioManager.playSound('button');
							resolveOnce(cards[index]);
						}
					});
					
					card.addEventListener('contextmenu', (e) => {
						e.preventDefault();
						e.stopPropagation();
						if (cardData && window.showCardModal) {
							window.showCardModal(cardData.card);
						}
						audioManager.playSound('button');
					});
					
					card.addEventListener('mouseenter', () => {
						card.style.transform = 'scale(1.05)';
						audioManager.playSound('touch');
					});
					card.addEventListener('mouseleave', () => {
						card.style.transform = 'scale(1)';
					});
				});
				
				// Закрытие по клику вне окна или Escape
				const closeHandler = (e) => {
					if (e.type === 'keydown') {
						if (e.key === 'Escape') {
							this.closeModal(modalOverlay);
							document.removeEventListener('keydown', closeHandler);
							resolveOnce(null);
						}
					} else if (e.target === modalOverlay) {
						this.closeModal(modalOverlay);
						document.removeEventListener('keydown', closeHandler);
						resolveOnce(null);
					}
				};
				
				modalOverlay.addEventListener('click', closeHandler);
				document.addEventListener('keydown', closeHandler);
				modalOverlay._closeHandler = closeHandler;
				
				// Кнопка отмены выбора
				const cancelBtn = modalOverlay.querySelector('.deck-modal__cancel');
				if (cancelBtn) {
					cancelBtn.addEventListener('click', (e) => {
						e.stopPropagation();
						if (isResolved) return;
						this.closeModal(modalOverlay);
						document.removeEventListener('keydown', closeHandler);
						resolveOnce(null);
						audioManager.playSound('button');
					});
					
					cancelBtn.addEventListener('mouseenter', () => {
						audioManager.playSound('touch');
					});
				}
			});
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
		
		getAvailableRowsForCard: function(card, gameState) {
			const positions = Array.isArray(card.position) ? card.position : [card.position];
			const availableRows = [];
			const rows = ['close', 'ranged', 'siege'];
			
			rows.forEach(row => {
				const rowName = `${row}-row`;
				if (positions.includes(rowName) || positions.includes('any-row')) {
					if (gameState.player.rows[row].cards.length < 9) {
						availableRows.push(row);
					}
				}
			});
			
			return availableRows;
		},
		
		showRowSelectionForSummon: function(availableRows, gameState, gameModule) {
			return new Promise((resolve) => {
				// Удаляем предыдущие подсветки
				this.removeRowHighlightsForSummon();
				
				const rowsMap = {
					'close': `player${this.capitalizeFirst('close')}Row`,
					'ranged': `player${this.capitalizeFirst('ranged')}Row`,
					'siege': `player${this.capitalizeFirst('siege')}Row`
				};
				
				let isResolved = false;
				
				const resolveOnce = (value) => {
					if (!isResolved) {
						isResolved = true;
						this.removeRowHighlightsForSummon();
						resolve(value);
					}
				};
				
				const rowClickHandler = (row) => {
					return () => {
						resolveOnce(row);
					};
				};
				
				for (const row of availableRows) {
					const rowElement = document.getElementById(rowsMap[row]);
					if (rowElement) {
						rowElement.classList.add('row-available');
						rowElement.style.cursor = 'pointer';
						rowElement.addEventListener('click', rowClickHandler(row));
						
						rowElement.addEventListener('mouseenter', () => {
							rowElement.style.transform = 'scale(1.02)';
						});
						rowElement.addEventListener('mouseleave', () => {
							rowElement.style.transform = 'scale(1)';
						});
					}
				}
				
				// Кнопка отмены
				const cancelBtn = document.createElement('button');
				cancelBtn.textContent = 'ОТМЕНА';
				cancelBtn.className = 'ability-cancel-btn';
				cancelBtn.style.cssText = `
					position: fixed;
					bottom: 30px;
					left: 50%;
					transform: translateX(-50%);
					background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
					color: #d4af37;
					border: 2px solid #d4af37;
					padding: 12px 35px;
					border-radius: 8px;
					cursor: pointer;
					font-weight: bold;
					font-family: 'Gwent', sans-serif;
					font-size: 16px;
					text-transform: uppercase;
					letter-spacing: 2px;
					z-index: 10050;
					transition: all 0.3s ease;
					box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
				`;
				
				cancelBtn.addEventListener('click', () => {
					resolveOnce(null);
					audioManager.playSound('button');
				});
				
				cancelBtn.addEventListener('mouseenter', () => {
					cancelBtn.style.transform = 'translateX(-50%) scale(1.05)';
					cancelBtn.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)';
					audioManager.playSound('touch');
				});
				
				cancelBtn.addEventListener('mouseleave', () => {
					cancelBtn.style.transform = 'translateX(-50%) scale(1)';
					cancelBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
				});
				
				document.body.appendChild(cancelBtn);
				this._currentCancelBtn = cancelBtn;
			});
		},
		
		removeRowHighlightsForSummon: function() {
			const rows = ['close', 'ranged', 'siege'];
			for (const row of rows) {
				const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
				if (rowElement) {
					rowElement.classList.remove('row-available');
					rowElement.style.cursor = '';
					rowElement.style.transform = '';
					const newRow = rowElement.cloneNode(true);
					rowElement.parentNode?.replaceChild(newRow, rowElement);
				}
			}
			if (this._currentCancelBtn && this._currentCancelBtn.parentNode) {
				this._currentCancelBtn.remove();
				this._currentCancelBtn = null;
			}
		},
		
		placeSummonedCard: function(card, row, gameState, gameModule) {
			const rowState = gameState.player.rows[row];
			
			if (rowState.cards.length >= 9) {
				gameModule.showGameMessage('В этом ряду максимальное количество карт!', 'warning');
				return false;
			}
			
			// Создаём копию карты для размещения
			const newCard = gameModule.createCardCopy(card);
			newCard.summonedByAbility = true;
			
			// Вставляем карту между отрядами, чтобы у неё были соседи
			// с обеих сторон (при наличии минимум двух карт в ряду)
			const insertIndex = rowState.cards.length >= 2
				? Math.floor(rowState.cards.length / 2)
				: rowState.cards.length;
			rowState.cards.splice(insertIndex, 0, newCard);
			
			// Отображаем карту на поле
			gameModule.displayCardOnRow(row, newCard, 'player', insertIndex);
			
			// Применяем эффекты
			this.boostCard(newCard, 3);
			
			// Усиливаем соседей слева и справа
			if (insertIndex > 0) {
				this.boostCard(rowState.cards[insertIndex - 1], 3);
			}
			if (insertIndex < rowState.cards.length - 1) {
				this.boostCard(rowState.cards[insertIndex + 1], 3);
			}
			
			// Обновляем отображение
			gameModule.updateRowStrength(row, 'player');
			gameModule.updateTotalScoreDisplays();
			gameModule.displayPlayerDeck();
			
			gameState.player.abilityUsedThisRound = true;
			
			gameModule.showGameMessage(`Способность "${this.name}" активирована! Призван ${newCard.name}.`, 'info');
			audioManager.playSound('card_boost');
			
			return true;
		},
		
		boostCard: function(card, amount) {
			if (window.gameModule && window.gameModule.applyCardBoost) {
				window.gameModule.applyCardBoost(card, amount);
				return;
			}
			
			if (card.baseStrength === undefined) card.baseStrength = card.strength;
			if (card.modifiedStrength === undefined) card.modifiedStrength = card.strength;
			
			card.modifiedStrength += amount;
			card.currentStrength = card.modifiedStrength;
			card.strength = card.currentStrength;
		},
		
		closeModal: function(modal) {
			if (modal._closeHandler) {
				document.removeEventListener('keydown', modal._closeHandler);
			}
			modal.classList.remove('active');
			setTimeout(() => {
				if (modal.parentNode) {
					modal.parentNode.removeChild(modal);
				}
			}, 300);
		}
	},

	'nilfgaard_ability_1': {
		name: 'Имперское построение',
		description: 'Усильте 2 дружественных отряда на 1 еденицу и поменяйте их местами (только в пределах одного ряда)',
		execute: function(gameState, gameModule) {
			// ===== ПРОВЕРЯЕМ, ЕСТЬ ЛИ МИНИМУМ 2 ОТРЯДА В ОДНОМ РЯДУ =====
			let hasValidPair = false;
			const rows = ['close', 'ranged', 'siege'];
			
			for (const row of rows) {
				const rowCards = gameState.player.rows[row].cards;
				// Считаем только отряды (не герои)
				const unitCount = rowCards.filter(card => 
					card.type === 'unit' && 
					!(card.tags && (card.tags.includes('hero') || card.tags.includes('герой')))
				).length;
				
				if (unitCount >= 2) {
					hasValidPair = true;
					break;
				}
			}
			
			// ===== ЕСЛИ НЕТ 2-Х ОТРЯДОВ В ОДНОМ РЯДУ - ВОЗВРАЩАЕМ FALSE =====
			if (!hasValidPair) {
				gameModule.showGameMessage('Нужно минимум 2 отряда в одном ряду для обмена', 'warning');
				return false;
			}
			
			this.showDoubleTargetSelection(gameState, gameModule);
			return true;
		},
		
		showDoubleTargetSelection: function(gameState, gameModule) {
			let selectedCards = [];
			const rows = ['close', 'ranged', 'siege'];
			
			// Сохраняем ссылки на обработчики
			this._clickHandlers = [];
			this._mouseEnterHandlers = [];
			this._mouseLeaveHandlers = [];
			this._gameState = gameState;
			this._gameModule = gameModule;
			
			const clickHandler = (event) => {
				const cardElement = event.currentTarget;
				const cardId = cardElement.dataset.cardId;
				const uniqueId = cardElement.dataset.uniqueId;
				const row = cardElement.dataset.row;
				
				// Ищем карту по uniqueId: копии одной карты имеют одинаковый id,
				// поэтому поиск только по id всегда выбирал первую копию в ряду.
				let targetCard = null;
				const clickedRowCards = row && gameState.player.rows[row]
					? gameState.player.rows[row].cards
					: null;
				
				if (clickedRowCards) {
					targetCard = uniqueId
						? clickedRowCards.find(c => c.uniqueId === uniqueId) || null
						: clickedRowCards.find(c => c.id === cardId) || null;
				}
				
				if (!targetCard) {
					for (const r of rows) {
						const rowCards = gameState.player.rows[r].cards;
						targetCard = uniqueId
							? rowCards.find(c => c.uniqueId === uniqueId) || null
							: rowCards.find(c => c.id === cardId) || null;
						if (targetCard) {
							break;
						}
					}
				}
				
				if (targetCard) {
					// Проверяем, что это отряд
					if (targetCard.type !== 'unit') {
						gameModule.showGameMessage('Можно выбирать только отряды!', 'warning');
						return;
					}
					
					// Проверяем героя
					if (targetCard.tags && (targetCard.tags.includes('hero') || targetCard.tags.includes('герой'))) {
						gameModule.showGameMessage('Нельзя усилить Героя!', 'warning');
						return;
					}
					
					const alreadySelected = selectedCards.some(s => s.card.uniqueId === targetCard.uniqueId);
					if (!alreadySelected && selectedCards.length < 2) {
						selectedCards.push({ card: targetCard, row: row, element: cardElement });
						cardElement.style.filter = 'brightness(1.2) drop-shadow(0 0 8px #4CAF50)';
						audioManager.playSound('cardAdd');
					} else if (alreadySelected) {
						selectedCards = selectedCards.filter(s => s.card.uniqueId !== targetCard.uniqueId);
						cardElement.style.filter = '';
						audioManager.playSound('cardRemove');
					}
					
					this.updateSelectionCounter(2, selectedCards.length);
				}
			};
			
			this.highlightPlayerUnits(gameState, rows, clickHandler);
			this.createSelectionCounter(2);
			this.showConfirmButton(() => {
				if (selectedCards.length !== 2) {
					gameModule.showGameMessage('Выберите 2 отряда', 'warning');
					return;
				}
				
				if (selectedCards[0].row !== selectedCards[1].row) {
					gameModule.showGameMessage('Отряды должны быть в одном ряду для обмена!', 'warning');
					this.removeHighlights(gameState);
					this.removeSelectionCounter();
					return;
				}
				
				// Усиливаем оба отряда с анимацией
				selectedCards.forEach(item => {
					this.boostCard(item.card, 1);
					this.createBoostVisualEffect(item.card, item.row, gameModule);
				});
				
				// Меняем местами
				const rowCards = gameState.player.rows[selectedCards[0].row].cards;
				const index1 = rowCards.findIndex(c => c.uniqueId === selectedCards[0].card.uniqueId);
				const index2 = rowCards.findIndex(c => c.uniqueId === selectedCards[1].card.uniqueId);
				if (index1 !== -1 && index2 !== -1) {
					[rowCards[index1], rowCards[index2]] = [rowCards[index2], rowCards[index1]];
					gameModule.redrawRow(selectedCards[0].row, 'player');
				}
				
				gameState.player.abilityUsedThisRound = true;
				gameModule.updateTotalScoreDisplays();
				gameModule.showGameMessage(`Способность "${this.name}" активирована! Отряды усилены и обменяны местами.`, 'info');
				audioManager.playSound('card_boost');
				
				this.removeHighlights(gameState);
				this.removeSelectionCounter();
				this.removeCancelButton();
				
				if (window.boardModule && window.boardModule.updateAbilityAvailability) {
					window.boardModule.updateAbilityAvailability(gameState);
				}
			});
		},
		
		// ===== АНИМАЦИЯ УСИЛЕНИЯ =====
		createBoostVisualEffect: function(card, row, gameModule) {
			const rowElement = document.getElementById(`player${gameModule.capitalizeFirst(row)}Row`);
			if (!rowElement) return;
			
			let cardElement = null;
			
			if (card.uniqueId) {
				cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			}
			
			if (!cardElement) {
				const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
				if (elements.length === 1) {
					cardElement = elements[0];
				} else if (elements.length > 1) {
					const rowState = this._gameState.player.rows[row];
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
			boostOverlay.textContent = '+1';
			boostOverlay.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #00ff00;
				font-size: 36px;
				font-weight: bold;
				text-shadow: 0 0 20px rgba(0, 255, 0, 0.9), 0 0 40px rgba(0, 255, 0, 0.6);
				z-index: 100;
				pointer-events: none;
				animation: leaderBoostAnimation 1.2s ease-out forwards;
				font-family: 'Gwent', sans-serif;
				letter-spacing: 2px;
			`;
			
			cardElement.style.boxShadow = '0 0 20px 8px rgba(0, 255, 0, 0.5)';
			cardElement.style.transition = 'box-shadow 0.5s ease-out';
			
			cardElement.appendChild(boostOverlay);
			
			setTimeout(() => {
				if (boostOverlay.parentNode) {
					boostOverlay.remove();
				}
				cardElement.style.boxShadow = '';
			}, 1200);
		},
		
		highlightPlayerUnits: function(gameState, rows, clickHandler) {
			for (const row of rows) {
				const rowElement = document.getElementById(`player${this._gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(card => {
					const uniqueId = card.dataset.uniqueId;
					
					// Находим карту в gameState
					let targetCard = null;
					for (const r of rows) {
						const found = gameState.player.rows[r].cards.find(c => c.uniqueId === uniqueId);
						if (found) {
							targetCard = found;
							break;
						}
					}
					
					if (targetCard && targetCard.type === 'unit') {
						// Проверяем, что это не герой
						if (targetCard.tags && (targetCard.tags.includes('hero') || targetCard.tags.includes('герой'))) return;
						
						card.style.cursor = 'pointer';
						card.style.transition = 'all 0.2s ease';
						card.dataset.row = row;
						card.addEventListener('click', clickHandler);
						
						// Сохраняем обработчик для удаления
						this._clickHandlers.push({ element: card, handler: clickHandler });
						
						// Обработчики наведения
						const mouseEnterHandler = () => {
							if (!card.style.filter || !card.style.filter.includes('#4CAF50')) {
								card.style.transform = 'scale(1.05)';
							}
						};
						
						const mouseLeaveHandler = () => {
							card.style.transform = 'scale(1)';
						};
						
						card.addEventListener('mouseenter', mouseEnterHandler);
						card.addEventListener('mouseleave', mouseLeaveHandler);
						
						this._mouseEnterHandlers.push({ element: card, handler: mouseEnterHandler });
						this._mouseLeaveHandlers.push({ element: card, handler: mouseLeaveHandler });
					}
				});
			}
			this.showCancelButton(gameState);
		},
		
		createSelectionCounter: function(max) {
			if (document.getElementById('abilityCounter')) return;
			const counter = document.createElement('div');
			counter.id = 'abilityCounter';
			counter.style.cssText = `
				position: fixed;
				top: 20px;
				left: 50%;
				transform: translateX(-50%);
				background: rgba(0,0,0,0.8);
				color: #d4af37;
				padding: 10px 20px;
				border-radius: 5px;
				font-family: 'Gwent', sans-serif;
				font-size: 16px;
				z-index: 10002;
			`;
			counter.textContent = `Выбрано: 0/${max}`;
			document.body.appendChild(counter);
		},
		
		updateSelectionCounter: function(max, current) {
			const counter = document.getElementById('abilityCounter');
			if (counter) counter.textContent = `Выбрано: ${current}/${max}`;
		},
		
		removeSelectionCounter: function() {
			const counter = document.getElementById('abilityCounter');
			if (counter) counter.remove();
		},
		
		showConfirmButton: function(onConfirm) {
			if (document.getElementById('abilityConfirmBtn')) return;
			const confirmBtn = document.createElement('button');
			confirmBtn.id = 'abilityConfirmBtn';
			confirmBtn.textContent = 'ПОДТВЕРДИТЬ ОБМЕН';
			confirmBtn.style.cssText = `
				position: fixed;
				bottom: 20px;
				right: 20px;
				background: #4CAF50;
				color: white;
				border: none;
				padding: 10px 30px;
				border-radius: 5px;
				cursor: pointer;
				font-weight: bold;
				z-index: 10002;
				font-family: 'Gwent', sans-serif;
				transition: all 0.3s ease;
			`;
			confirmBtn.addEventListener('mouseenter', () => {
				confirmBtn.style.transform = 'scale(1.05)';
				confirmBtn.style.boxShadow = '0 0 20px rgba(76, 175, 80, 0.5)';
			});
			confirmBtn.addEventListener('mouseleave', () => {
				confirmBtn.style.transform = 'scale(1)';
				confirmBtn.style.boxShadow = 'none';
			});
			confirmBtn.addEventListener('click', () => {
				onConfirm();
				audioManager.playSound('button');
			});
			document.body.appendChild(confirmBtn);
			this._confirmBtn = confirmBtn;
		},
		
		showCancelButton: function(gameState) {
			if (document.getElementById('abilityCancelBtn')) return;
			const cancelBtn = document.createElement('button');
			cancelBtn.id = 'abilityCancelBtn';
			cancelBtn.textContent = 'ОТМЕНА';
			cancelBtn.style.cssText = `
				position: fixed;
				bottom: 20px;
				left: 20px;
				background: #d4af37;
				color: #1a1a1a;
				border: none;
				padding: 10px 30px;
				border-radius: 5px;
				cursor: pointer;
				font-weight: bold;
				z-index: 10002;
				font-family: 'Gwent', sans-serif;
				transition: all 0.3s ease;
			`;
			
			cancelBtn.addEventListener('mouseenter', () => {
				cancelBtn.style.transform = 'scale(1.05)';
				cancelBtn.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)';
				audioManager.playSound('touch');
			});
			cancelBtn.addEventListener('mouseleave', () => {
				cancelBtn.style.transform = 'scale(1)';
				cancelBtn.style.boxShadow = 'none';
			});
			
			cancelBtn.addEventListener('click', () => {
				if (gameState) {
					gameState.player.abilityUsedThisRound = false;
				}
				
				this.removeHighlights(gameState);
				this.removeSelectionCounter();
				this.removeCancelButton();
				audioManager.playSound('button');
				
				if (window.boardModule && window.boardModule.updateAbilityAvailability) {
					window.boardModule.updateAbilityAvailability(gameState);
				}
			});
			
			document.body.appendChild(cancelBtn);
			this._cancelBtn = cancelBtn;
		},
		
		// ===== ИСПРАВЛЕННЫЙ МЕТОД removeHighlights =====
		removeHighlights: function(gameState) {
			const rows = ['close', 'ranged', 'siege'];
			for (const row of rows) {
				const rowElement = document.getElementById(`player${this._gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(card => {
					card.style.cursor = '';
					card.style.filter = '';
					card.style.transform = '';
					card.style.boxShadow = '';
				});
			}
			
			// Удаляем обработчики кликов
			if (this._clickHandlers) {
				this._clickHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('click', handler);
				});
				this._clickHandlers = [];
			}
			
			// Удаляем обработчики mouseenter
			if (this._mouseEnterHandlers) {
				this._mouseEnterHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('mouseenter', handler);
				});
				this._mouseEnterHandlers = [];
			}
			
			// Удаляем обработчики mouseleave
			if (this._mouseLeaveHandlers) {
				this._mouseLeaveHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('mouseleave', handler);
				});
				this._mouseLeaveHandlers = [];
			}
			
			this.removeCancelButton();
			const confirmBtn = document.getElementById('abilityConfirmBtn');
			if (confirmBtn) confirmBtn.remove();
			this._confirmBtn = null;
		},
		
		removeCancelButton: function() {
			if (this._cancelBtn && this._cancelBtn.parentNode) {
				this._cancelBtn.remove();
				this._cancelBtn = null;
			}
			const btn = document.getElementById('abilityCancelBtn');
			if (btn) btn.remove();
		},
		
		boostCard: function(card, amount) {
			if (window.gameModule && window.gameModule.applyCardBoost) {
				window.gameModule.applyCardBoost(card, amount);
				return;
			}
			
			if (card.baseStrength === undefined) card.baseStrength = card.strength;
			if (card.originalStrength === undefined) card.originalStrength = card.strength;
			if (card.modifiedStrength === undefined) card.modifiedStrength = card.strength;
			
			card.modifiedStrength += amount;
			card.currentStrength = card.modifiedStrength;
			card.strength = card.currentStrength;
			card._displayStrength = card.currentStrength;
		}
	},
	'nilfgaard_ability_2': {
		name: 'Заточение',
		description: 'Нанесите вражескому отряду 3 еденицы урона',
		execute: function(gameState, gameModule) {
			const enemyUnits = [];
			const rows = ['close', 'ranged', 'siege'];
			
			rows.forEach(row => {
				gameState.opponent.rows[row].cards.forEach((card) => {
					if (card.type === 'unit') {
						if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
						enemyUnits.push({
							card: card,
							row: row,
							uniqueId: card.uniqueId
						});
					}
				});
			});
			
			if (enemyUnits.length === 0) {
				gameModule.showGameMessage('Нет вражеских отрядов для атаки', 'warning');
				return false;
			}
			
			this._gameState = gameState;
			this._gameModule = gameModule;
			this._damageAmount = 3;
			
			this.showTargetSelection(enemyUnits, gameState, gameModule);
			return true;
		},
		
		showTargetSelection: function(enemyUnits, gameState, gameModule) {
			this.removeHighlights(gameState);
			
			const rows = ['close', 'ranged', 'siege'];
			this._clickHandlers = [];
			
			const clickHandler = (target) => {
				return (event) => {
					const stillExists = gameState.opponent.rows[target.row].cards.some(
						c => c.uniqueId === target.card.uniqueId && c.type === 'unit'
					);
					
					if (!stillExists) {
						gameModule.showGameMessage('Эта карта уже не на поле', 'warning');
						this.removeHighlights(gameState);
						return;
					}
					
					this.dealDamage(target.card, this._damageAmount);
					gameState.player.abilityUsedThisRound = true;
					
					gameModule.updateRowStrength(target.row, 'opponent');
					gameModule.updateTotalScoreDisplays();
					
					this.createDamageVisualEffect(target.card, target.row, gameModule);
					
					if (target.card.modifiedStrength <= 0) {
						this.destroyCard(gameState, target.card, target.row, gameModule);
					}
					
					gameModule.showGameMessage(`Способность "${this.name}" активирована! Нанесён ${this._damageAmount} урон ${target.card.name}.`, 'info');
					audioManager.playSound('card_damage');
					
					this.removeHighlights(gameState);
				};
			};
			
			// === ТОТ ЖЕ ПОДХОД, ЧТО И В SKELLIGE_ABILITY_3 ===
			for (const row of rows) {
				const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(cardElement => {
					const cardId = cardElement.dataset.cardId;
					const uniqueId = cardElement.dataset.uniqueId;
					
					// Ищем цель среди вражеских отрядов (проверяем type === 'unit')
					let target = null;
					for (const r of rows) {
						const found = gameState.opponent.rows[r].cards.find(c => 
							(c.id === cardId || c.uniqueId === uniqueId) && c.type === 'unit'
						);
						if (found) {
							target = { card: found, row: r };
							break;
						}
					}
					
					if (target) {
						// Пропускаем героев
						if (target.card.tags && (target.card.tags.includes('hero') || target.card.tags.includes('герой'))) return;
						
						cardElement.style.cursor = 'pointer';
						cardElement.classList.add('damage-target');
						
						const handler = clickHandler(target);
						cardElement.addEventListener('click', handler);
						this._clickHandlers.push({ element: cardElement, handler: handler });
						
						cardElement.addEventListener('mouseenter', () => {
							cardElement.style.transform = 'scale(1.05)';
							cardElement.style.filter = 'brightness(1.2) drop-shadow(0 0 12px #ff4444)';
						});
						
						cardElement.addEventListener('mouseleave', () => {
							cardElement.style.transform = 'scale(1)';
							cardElement.style.filter = '';
						});
					}
				});
			}
			
			this.showCancelButton(gameState, gameModule);
		},

		createDamageVisualEffect: function(card, row, gameModule) {
			const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
			if (!rowElement) return;
			
			let cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			
			if (!cardElement) {
				const allCards = rowElement.querySelectorAll('.board-card');
				const rowState = this._gameState.opponent.rows[row];
				const position = rowState.cards.findIndex(c => c.uniqueId === card.uniqueId);
				if (position !== -1 && allCards[position]) {
					cardElement = allCards[position];
				}
			}
			
			if (!cardElement) return;
			
			const damageOverlay = document.createElement('div');
			damageOverlay.className = 'card-damage-overlay';
			damageOverlay.textContent = '-3';
			damageOverlay.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #ff1744;
				font-size: 36px;
				font-weight: bold;
				text-shadow: 0 0 20px rgba(255, 23, 68, 0.9), 0 0 40px rgba(255, 0, 0, 0.6);
				z-index: 100;
				pointer-events: none;
				animation: leaderBoostAnimation 1.2s ease-out forwards;
				font-family: 'Gwent', sans-serif;
				letter-spacing: 2px;
			`;
			
			cardElement.style.boxShadow = '0 0 20px 8px rgba(255, 0, 0, 0.5)';
			cardElement.style.transition = 'box-shadow 0.5s ease-out';
			
			cardElement.appendChild(damageOverlay);
			
			setTimeout(() => {
				if (damageOverlay.parentNode) damageOverlay.remove();
				cardElement.style.boxShadow = '';
			}, 1200);
		},
		
		showCancelButton: function(gameState, gameModule) {
			const existingBtn = document.getElementById('abilityCancelBtn');
			if (existingBtn) existingBtn.remove();
			
			const cancelBtn = document.createElement('button');
			cancelBtn.id = 'abilityCancelBtn';
			cancelBtn.textContent = 'ОТМЕНА';
			cancelBtn.className = 'ability-cancel-btn';
			cancelBtn.style.cssText = `
				position: fixed;
				bottom: 30px;
				left: 50%;
				transform: translateX(-50%);
				background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
				color: #d4af37;
				border: 2px solid #d4af37;
				padding: 12px 35px;
				border-radius: 8px;
				cursor: pointer;
				font-weight: bold;
				font-family: 'Gwent', sans-serif;
				font-size: 16px;
				text-transform: uppercase;
				letter-spacing: 2px;
				z-index: 10050;
				transition: all 0.3s ease;
				box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
			`;
			
			cancelBtn.addEventListener('mouseenter', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1.05)';
				cancelBtn.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)';
				audioManager.playSound('touch');
			});
			
			cancelBtn.addEventListener('mouseleave', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1)';
				cancelBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
			});
			
			cancelBtn.addEventListener('click', () => {
				this.removeHighlights(gameState);
				audioManager.playSound('button');
				gameModule.showGameMessage('Использование способности отменено', 'info');
				
				if (gameState) {
					gameState.player.abilityUsedThisRound = false;
				}
				
				if (window.boardModule && window.boardModule.updateAbilityAvailability) {
					window.boardModule.updateAbilityAvailability(gameState);
				}
			});
			
			document.body.appendChild(cancelBtn);
			this._cancelBtn = cancelBtn;
		},
		
		removeCancelButton: function() {
			if (this._cancelBtn && this._cancelBtn.parentNode) {
				this._cancelBtn.remove();
				this._cancelBtn = null;
			}
			const btn = document.getElementById('abilityCancelBtn');
			if (btn) btn.remove();
		},
		
		removeHighlights: function(gameState) {
			const rows = ['close', 'ranged', 'siege'];
			
			for (const row of rows) {
				const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(card => {
					card.style.cursor = '';
					card.classList.remove('damage-target');
					card.style.transform = '';
					card.style.filter = '';
					card.style.boxShadow = '';
				});
			}
			
			if (this._clickHandlers) {
				this._clickHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('click', handler);
				});
				this._clickHandlers = [];
			}
			
			this.removeCancelButton();
		},
		
dealDamage: function(card, amount) {
    if (window.gameModule && window.gameModule.applyCardDamage) {
        window.gameModule.applyCardDamage(card, amount);
        return;
    }
    
    // Инициализируем поля, если их нет
    if (card.baseStrength === undefined) card.baseStrength = card.strength;
    if (card.modifiedStrength === undefined) card.modifiedStrength = card.strength;
    if (card.currentStrength === undefined) card.currentStrength = card.strength;
    if (card.originalStrength === undefined) card.originalStrength = card.strength;
    
    // Наносим урон МОДИФИЦИРОВАННОЙ силе (реальной силе карты)
    card.modifiedStrength = Math.max(0, card.modifiedStrength - amount);
    card.currentStrength = card.modifiedStrength;
    card.strength = card.currentStrength;
    card._displayStrength = card.currentStrength;
},
		
		destroyCard: function(gameState, card, row, gameModule) {
			const rowCards = gameState.opponent.rows[row].cards;
			let cardIndex = -1;
			
			if (card.uniqueId !== undefined) {
				cardIndex = rowCards.findIndex(c => c.uniqueId === card.uniqueId);
			}
			if (cardIndex === -1) {
				cardIndex = rowCards.indexOf(card);
			}
			if (cardIndex === -1) {
				const sameId = rowCards
					.map((c, index) => ({ c, index }))
					.filter(entry => entry.c.id === card.id);
				if (sameId.length === 1) {
					cardIndex = sameId[0].index;
				}
			}
			
			if (cardIndex !== -1) {
				const destroyedCard = rowCards.splice(cardIndex, 1)[0];
				gameModule.addCardToDiscard(destroyedCard, 'opponent');
				gameModule.redrawRow(row, 'opponent');
				gameModule.updateRowStrength(row, 'opponent');
				audioManager.playSound('card_destroy');
			}
		}
	},
	'nilfgaard_ability_3': {
		name: 'Порабощение',
		description: 'Уничтожте вражеский отряд с силой 5 или меньше',
		execute: function(gameState, gameModule) {
			const destroyableUnits = [];
			const rows = ['close', 'ranged', 'siege'];
			
			rows.forEach(row => {
				gameState.opponent.rows[row].cards.forEach((card) => {
					if (card.type === 'unit') {
						const isHero = card.tags && (card.tags.includes('hero') || card.tags.includes('герой'));
						if (!isHero) {
							const currentStrength = card.currentStrength !== undefined ? 
								card.currentStrength : (card.strength || 0);
							if (currentStrength <= 5 && currentStrength > 0) {
								// ===== УБЕЖДАЕМСЯ, ЧТО У КАРТЫ ЕСТЬ uniqueId =====
								if (!card.uniqueId) {
									card.uniqueId = `${card.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
								}
								destroyableUnits.push({ 
									card: card, 
									row: row,
									uniqueId: card.uniqueId 
								});
							}
						}
					}
				});
			});
			
			if (destroyableUnits.length === 0) {
				gameModule.showGameMessage('Нет вражеских отрядов с силой 5 или меньше для уничтожения', 'warning');
				return false;
			}
			
			this._gameState = gameState;
			this._gameModule = gameModule;
			
			this.showTargetSelection(destroyableUnits, gameState, gameModule);
			return true;
		},
		
		showTargetSelection: function(destroyableUnits, gameState, gameModule) {
			this._clickHandlers = [];
			this._mouseEnterHandlers = [];
			this._mouseLeaveHandlers = [];
			this.currentDestroyableUnits = destroyableUnits;
			
			for (const unit of destroyableUnits) {
				const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(unit.row)}Row`);
				if (!rowElement) continue;
				
				// ===== ИЩЕМ ПО uniqueId =====
				let cardElement = rowElement.querySelector(`[data-unique-id="${unit.uniqueId}"]`);
				
				// Если не нашли по uniqueId, обновляем DOM
				if (!cardElement) {
					// Ищем все карты в ряду и обновляем их data-unique-id
					const allCards = rowElement.querySelectorAll('.board-card');
					const rowState = gameState.opponent.rows[unit.row];
					allCards.forEach((el, index) => {
						if (index < rowState.cards.length) {
							const cardData = rowState.cards[index];
							if (cardData.uniqueId) {
								el.dataset.uniqueId = cardData.uniqueId;
							}
						}
					});
					// Пробуем найти снова
					cardElement = rowElement.querySelector(`[data-unique-id="${unit.uniqueId}"]`);
				}
				
				// Если всё ещё не нашли, пробуем по id (как запасной вариант)
				if (!cardElement) {
					cardElement = rowElement.querySelector(`[data-card-id="${unit.card.id}"]`);
					// Если нашли по id, добавляем uniqueId в DOM
					if (cardElement && unit.uniqueId) {
						cardElement.dataset.uniqueId = unit.uniqueId;
					}
				}
				
				if (cardElement) {
					cardElement.style.cursor = 'pointer';
					cardElement.style.filter = 'brightness(1.2) drop-shadow(0 0 8px #ff4444)';
					cardElement.classList.add('destroyable-target');
					
					// ===== СОХРАНЯЕМ uniqueId В DOM =====
					if (unit.uniqueId) {
						cardElement.dataset.uniqueId = unit.uniqueId;
					}
					
					const clickHandler = (event) => {
						event.stopPropagation();
						event.preventDefault();
						
						// ===== ИЩЕМ КАРТУ ПО uniqueId =====
						let targetCard = null;
						let targetRow = null;
						const targetUniqueId = unit.uniqueId;
						
						for (const row of ['close', 'ranged', 'siege']) {
							const foundCard = gameState.opponent.rows[row].cards.find(c => 
								c.uniqueId === targetUniqueId
							);
							if (foundCard) {
								targetCard = foundCard;
								targetRow = row;
								break;
							}
						}
						
						// Если не нашли по uniqueId (маловероятно, но на всякий случай)
						if (!targetCard) {
							console.warn('Карта не найдена по uniqueId, ищем по id');
							for (const row of ['close', 'ranged', 'siege']) {
								const foundCard = gameState.opponent.rows[row].cards.find(c => 
									c.id === unit.card.id
								);
								if (foundCard) {
									targetCard = foundCard;
									targetRow = row;
									break;
								}
							}
						}
						
						if (targetCard) {
							// Создаём анимацию уничтожения
							this.createDestroyVisualEffect(targetCard, targetRow, gameModule);
							
							// Уничтожаем карту с задержкой
							setTimeout(() => {
								// ===== ЕЩЁ РАЗ ПРОВЕРЯЕМ, ЧТО КАРТА ВСЁ ЕЩЁ НА ПОЛЕ =====
								let stillExists = false;
								if (targetRow && gameState.opponent.rows[targetRow]) {
									stillExists = gameState.opponent.rows[targetRow].cards.some(
										c => c.uniqueId === targetCard.uniqueId
									);
								}
								
								if (stillExists) {
									this.destroyCard(gameState, targetCard, targetRow, gameModule);
									gameState.player.abilityUsedThisRound = true;
									
									gameModule.updateTotalScoreDisplays();
									gameModule.showGameMessage(`Способность "${this.name}" активирована! ${targetCard.name} уничтожен.`, 'info');
									audioManager.playSound('card_destroy');
									
									if (window.boardModule && window.boardModule.updateAbilityAvailability) {
										window.boardModule.updateAbilityAvailability(gameState);
									}
								} else {
									gameModule.showGameMessage('Эта карта уже была уничтожена', 'warning');
								}
							}, 500);
						} else {
							gameModule.showGameMessage('Карта не найдена на поле', 'warning');
						}
						
						// Убираем подсветку и обработчики
						this.removeDestroyHighlights(destroyableUnits, gameModule);
					};
					
					cardElement.addEventListener('click', clickHandler);
					this._clickHandlers.push({ element: cardElement, handler: clickHandler });
					
					// Эффект при наведении
					const mouseEnterHandler = () => {
						cardElement.style.transform = 'scale(1.05)';
					};
					const mouseLeaveHandler = () => {
						cardElement.style.transform = 'scale(1)';
					};
					
					cardElement.addEventListener('mouseenter', mouseEnterHandler);
					cardElement.addEventListener('mouseleave', mouseLeaveHandler);
					
					this._mouseEnterHandlers.push({ element: cardElement, handler: mouseEnterHandler });
					this._mouseLeaveHandlers.push({ element: cardElement, handler: mouseLeaveHandler });
				}
			}
			
			this.showDestroyCancelButton(gameState, gameModule);
		},
		
		// ===== АНИМАЦИЯ УНИЧТОЖЕНИЯ =====
		createDestroyVisualEffect: function(card, row, gameModule) {
			const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
			if (!rowElement) return;
			
			let cardElement = null;
			
			// ===== ИЩЕМ ПО uniqueId =====
			if (card.uniqueId) {
				cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			}
			
			if (!cardElement) {
				// Пробуем по id
				const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
				if (elements.length === 1) {
					cardElement = elements[0];
				} else if (elements.length > 1) {
					// Если несколько копий, ищем по позиции
					const rowState = this._gameState.opponent.rows[row];
					const position = rowState.cards.findIndex(c => 
						c.uniqueId === card.uniqueId
					);
					if (position !== -1 && elements[position]) {
						cardElement = elements[position];
					} else {
						cardElement = elements[0];
					}
				}
			}
			
			if (!cardElement) return;
			
			// Эффект уничтожения (как при казни)
			const destroyOverlay = document.createElement('div');
			destroyOverlay.className = 'card-destroy-overlay';
			destroyOverlay.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				z-index: 100;
				border-radius: 5px;
				pointer-events: none;
				animation: destroyCardAnimation 1s ease-out forwards;
			`;
			
			cardElement.style.boxShadow = '0 0 30px 15px rgba(255, 0, 0, 0.8)';
			cardElement.style.transition = 'box-shadow 0.3s ease-out';
			
			cardElement.appendChild(destroyOverlay);
			
			setTimeout(() => {
				if (destroyOverlay.parentNode) {
					destroyOverlay.remove();
				}
				cardElement.style.boxShadow = '';
			}, 1000);
		},
		
		removeDestroyHighlights: function(destroyableUnits, gameModule) {
			// Удаляем все обработчики
			if (this._clickHandlers) {
				this._clickHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('click', handler);
				});
				this._clickHandlers = [];
			}
			
			if (this._mouseEnterHandlers) {
				this._mouseEnterHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('mouseenter', handler);
				});
				this._mouseEnterHandlers = [];
			}
			
			if (this._mouseLeaveHandlers) {
				this._mouseLeaveHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('mouseleave', handler);
				});
				this._mouseLeaveHandlers = [];
			}
			
			// Убираем подсветку со всех карт
			for (const unit of destroyableUnits) {
				const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(unit.row)}Row`);
				if (rowElement) {
					// Ищем по uniqueId
					let cardElement = rowElement.querySelector(`[data-unique-id="${unit.uniqueId}"]`);
					if (!cardElement) {
						cardElement = rowElement.querySelector(`[data-card-id="${unit.card.id}"]`);
					}
					if (cardElement) {
						cardElement.style.cursor = '';
						cardElement.style.filter = '';
						cardElement.style.transform = '';
						cardElement.style.boxShadow = '';
						cardElement.classList.remove('destroyable-target');
					}
				}
			}
			this.removeDestroyCancelButton();
		},
		
		showDestroyCancelButton: function(gameState, gameModule) {
			if (document.getElementById('abilityCancelBtn')) return;
			
			const cancelBtn = document.createElement('button');
			cancelBtn.id = 'abilityCancelBtn';
			cancelBtn.textContent = 'ОТМЕНА';
			cancelBtn.className = 'ability-cancel-btn';
			cancelBtn.style.cssText = `
				position: fixed;
				bottom: 30px;
				left: 50%;
				transform: translateX(-50%);
				background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
				color: #d4af37;
				border: 2px solid #d4af37;
				padding: 12px 35px;
				border-radius: 8px;
				cursor: pointer;
				font-weight: bold;
				font-family: 'Gwent', sans-serif;
				font-size: 16px;
				text-transform: uppercase;
				letter-spacing: 2px;
				z-index: 10050;
				transition: all 0.3s ease;
				box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
			`;
			
			cancelBtn.addEventListener('mouseenter', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1.05)';
				cancelBtn.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)';
				audioManager.playSound('touch');
			});
			
			cancelBtn.addEventListener('mouseleave', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1)';
				cancelBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
			});
			
			cancelBtn.addEventListener('click', () => {
				if (gameState) {
					gameState.player.abilityUsedThisRound = false;
				}
				
				this.removeDestroyHighlights(this.currentDestroyableUnits || [], gameModule);
				audioManager.playSound('button');
				gameModule.showGameMessage('Использование способности отменено', 'info');
				
				if (window.boardModule && window.boardModule.updateAbilityAvailability) {
					window.boardModule.updateAbilityAvailability(gameState);
				}
			});
			
			document.body.appendChild(cancelBtn);
			this.currentCancelBtn = cancelBtn;
		},
		
		removeDestroyCancelButton: function() {
			if (this.currentCancelBtn && this.currentCancelBtn.parentNode) {
				this.currentCancelBtn.remove();
				this.currentCancelBtn = null;
			}
			const btn = document.getElementById('abilityCancelBtn');
			if (btn) btn.remove();
		},
		
		// ===== ИСПРАВЛЕННЫЙ МЕТОД destroyCard =====
		destroyCard: function(gameState, card, row, gameModule) {
			const rowCards = gameState.opponent.rows[row].cards;
			
			// ===== ИЩЕМ ТОЛЬКО ПО uniqueId =====
			let cardIndex = -1;
			if (card.uniqueId) {
				cardIndex = rowCards.findIndex(c => c.uniqueId === card.uniqueId);
			}
			
			// Если не нашли по uniqueId, пробуем найти по id + позиции
			if (cardIndex === -1) {
				// Ищем по id, но проверяем, что это та же карта
				const matchingCards = rowCards.map((c, idx) => ({ card: c, index: idx }))
					.filter(item => item.card.id === card.id);
				
				if (matchingCards.length === 1) {
					cardIndex = matchingCards[0].index;
				} else if (matchingCards.length > 1) {
					// Если несколько копий, ищем по дополнительным признакам
					// Используем uniqueId из переданной карты
					if (card.uniqueId) {
						const found = matchingCards.find(item => item.card.uniqueId === card.uniqueId);
						if (found) {
							cardIndex = found.index;
						}
					}
					// Если всё ещё не нашли, берём первую (но это может быть не та карта)
					if (cardIndex === -1) {
						console.warn('Не удалось точно определить карту для уничтожения, используется первая копия');
						cardIndex = matchingCards[0].index;
					}
				}
			}
			
			if (cardIndex !== -1) {
				const destroyedCard = rowCards.splice(cardIndex, 1)[0];
				gameModule.addCardToDiscard(destroyedCard, 'opponent');
				gameModule.redrawRow(row, 'opponent');
				gameModule.updateRowStrength(row, 'opponent');
			} else {
				console.error('Карта не найдена для уничтожения:', card);
			}
		}
	},
	'nilfgaard_ability_4': {
		name: 'Туссентское гостеприимство',
		description: 'Усильте случайный дружественный отряд на 5 еденицу',
		execute: function(gameState, gameModule) {
			// Собираем все дружественные отряды на поле (исключая героев)
			const friendlyUnits = [];
			const rows = ['close', 'ranged', 'siege'];
			
			rows.forEach(row => {
				gameState.player.rows[row].cards.forEach((card) => {
					if (card.type === 'unit') {
						// Пропускаем героев
						if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
						friendlyUnits.push({
							card: card,
							row: row,
							uniqueId: card.uniqueId
						});
					}
				});
			});
			
			if (friendlyUnits.length === 0) {
				gameModule.showGameMessage('Нет дружественных отрядов на поле для усиления', 'warning');
				return false;
			}
			
			// Сохраняем состояние для анимации
			this._gameState = gameState;
			this._gameModule = gameModule;
			this._boostAmount = 5;
			
			// Выбираем случайный отряд
			const randomIndex = Math.floor(Math.random() * friendlyUnits.length);
			const target = friendlyUnits[randomIndex];
			
			this.boostCard(target.card, this._boostAmount);
			
			// === АНИМАЦИЯ УСИЛЕНИЯ +5 (как в scoiatael_ability_1) ===
			this.createBoostVisualEffect(target.card, target.row, gameModule);
			
			gameState.player.abilityUsedThisRound = true;
			
			gameModule.updateRowStrength(target.row, 'player');
			gameModule.updateTotalScoreDisplays();
			gameModule.updateCardStrengthDisplay(target.card, target.row, 'player');
			gameModule.showGameMessage(`Способность "${this.name}" активирована! Случайный отряд "${target.card.name}" усилен на ${this._boostAmount} ед.`, 'info');
			audioManager.playSound('card_boost');
			
			return true;
		},
		
		// ===== АНИМАЦИЯ УСИЛЕНИЯ +5 (как в scoiatael_ability_1) =====
		createBoostVisualEffect: function(card, row, gameModule) {
			const rowElement = document.getElementById(`player${gameModule.capitalizeFirst(row)}Row`);
			if (!rowElement) return;
			
			// Ищем элемент карты на доске
			let cardElement = null;
			
			if (card.uniqueId) {
				cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			}
			
			if (!cardElement) {
				const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
				if (elements.length === 1) {
					cardElement = elements[0];
				} else if (elements.length > 1) {
					const rowState = this._gameState.player.rows[row];
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
			
			// Если не нашли по селекторам, пробуем найти по позиции
			if (!cardElement) {
				const allCards = rowElement.querySelectorAll('.board-card');
				const rowState = this._gameState.player.rows[row];
				const position = rowState.cards.findIndex(c => 
					c.id === card.id && c.uniqueId === card.uniqueId
				);
				if (position !== -1 && allCards[position]) {
					cardElement = allCards[position];
				}
			}
			
			if (!cardElement) return;
			
			// Создаём элемент с анимацией +5 (зелёный)
			const boostOverlay = document.createElement('div');
			boostOverlay.className = 'card-boost-overlay';
			boostOverlay.textContent = '+5';
			boostOverlay.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #00ff00;
				font-size: 36px;
				font-weight: bold;
				text-shadow: 0 0 20px rgba(0, 255, 0, 0.9), 0 0 40px rgba(0, 255, 0, 0.6);
				z-index: 100;
				pointer-events: none;
				animation: leaderBoostAnimation 1.2s ease-out forwards;
				font-family: 'Gwent', sans-serif;
				letter-spacing: 2px;
			`;
			
			// Добавляем свечение на карту
			cardElement.style.boxShadow = '0 0 20px 8px rgba(0, 255, 0, 0.5)';
			cardElement.style.transition = 'box-shadow 0.5s ease-out';
			
			cardElement.appendChild(boostOverlay);
			
			// Удаляем эффект через 1.2 секунды
			setTimeout(() => {
				if (boostOverlay.parentNode) {
					boostOverlay.remove();
				}
				cardElement.style.boxShadow = '';
			}, 1200);
		},
		
		boostCard: function(card, amount) {
			if (window.gameModule && window.gameModule.applyCardBoost) {
				window.gameModule.applyCardBoost(card, amount);
				return;
			}
			
			if (card.baseStrength === undefined) {
				card.baseStrength = card.strength;
			}
			if (card.originalStrength === undefined) {
				card.originalStrength = card.strength;
			}
			if (card.modifiedStrength === undefined) {
				card.modifiedStrength = card.strength;
			}
			
			card.modifiedStrength += amount;
			card.currentStrength = card.modifiedStrength;
			card.strength = card.currentStrength;
			card._displayStrength = card.currentStrength;
		}
	},
	'nilfgaard_ability_5': {
		name: 'Двойная игра',
		description: 'Вслепую сыграйте карту отряда из руки противника', // Изменено описание
		execute: async function(gameState, gameModule) {
			// 1. Проверяем, есть ли у противника карты отрядов в руке
			const unitCardsInHand = gameState.opponent.hand.filter(card => card.type === 'unit');
			
			if (unitCardsInHand.length === 0) {
				gameModule.showGameMessage('У противника нет карт отрядов в руке', 'warning');
				return false;
			}
			
			// 2. Получаем фракцию противника для фона модального окна
			const opponentFaction = gameState.opponent.faction;
			const factionBackground = `faction/${opponentFaction}/border_faction.png`;
			
			// 3. Показываем модальное окно с рубашками карт (только отряды)
			//    Передаем количество отрядов, а не всех карт
			const selectedIndex = await this.showBlindSelectionModal(unitCardsInHand.length, factionBackground, gameModule);
			if (selectedIndex === null) return false;
			
			// 4. Получаем выбранную карту отряда из оригинальной руки
			//    Нужно найти соответствующий индекс в оригинальной руке
			let originalHandIndex = -1;
			let unitCount = 0;
			for (let i = 0; i < gameState.opponent.hand.length; i++) {
				if (gameState.opponent.hand[i].type === 'unit') {
					if (unitCount === selectedIndex) {
						originalHandIndex = i;
						break;
					}
					unitCount++;
				}
			}
			
			if (originalHandIndex === -1) {
				gameModule.showGameMessage('Ошибка при выборе карты', 'error');
				return false;
			}
			
			const selectedCard = gameState.opponent.hand[originalHandIndex];
			
			// 5. Удаляем карту из руки противника
			gameState.opponent.hand.splice(originalHandIndex, 1);
			
			// 6. Разыгрываем карту отряда на поле противника
			//    Так как мы знаем, что это unit, вызываем playUnitOnOpponentBoard напрямую
			const success = await this.playUnitOnOpponentBoard(selectedCard, gameState, gameModule);
			if (!success) {
				// Если не удалось разместить, возвращаем карту в руку противника
				gameState.opponent.hand.push(selectedCard);
				return false;
			}
			
			gameState.player.abilityUsedThisRound = true;
			gameModule.updateTotalScoreDisplays();
			
			// Обновляем отображение руки противника
			if (window.aiModule && window.aiModule.updateOpponentHandDisplay) {
				window.aiModule.updateOpponentHandDisplay();
			}
			
			gameModule.showGameMessage(`Способность "${this.name}" активирована! Сыгран отряд "${selectedCard.name}" из руки противника.`, 'info');
			audioManager.playSound('cardPlay');
			
			return true;
		},
		
		// Модальное окно с рубашками карт (количество = количество отрядов)
		showBlindSelectionModal: function(cardCount, factionBackground, gameModule) {
			return new Promise((resolve) => {
				const modalOverlay = document.createElement('div');
				modalOverlay.className = 'deck-modal-overlay';
				
				modalOverlay.innerHTML = `
					<div class="deck-modal blind-selection-modal">
						<div class="deck-modal__header" style="background: url('${factionBackground}') center/cover;">
							<div class="deck-modal__title">ВЫБЕРИТЕ ОТРЯД ИЗ РУКИ ПРОТИВНИКА</div>
							<div class="deck-modal__count">Отрядов: ${cardCount}</div>
						</div>
						<div class="deck-modal__content blind-cards-container">
							${Array(cardCount).fill().map((_, i) => `
								<div class="blind-card" data-card-index="${i}" style="
									width: 120px;
									cursor: pointer;
									transition: all 0.3s ease;
								">
									<div class="blind-card__container" style="position: relative;">
										<img src="deck/random.jpg" alt="?" class="blind-card__image" style="
											width: 100%;
											border-radius: 8px;
											box-shadow: 0 4px 8px rgba(0,0,0,0.3);
										">
									</div>
								</div>
							`).join('')}
						</div>
					</div>
				`;
				
				document.body.appendChild(modalOverlay);
				
				setTimeout(() => {
					modalOverlay.classList.add('active');
				}, 10);
				
				const cardElements = modalOverlay.querySelectorAll('.blind-card');
				cardElements.forEach(card => {
					card.addEventListener('click', (e) => {
						const index = parseInt(card.dataset.cardIndex);
						this.closeModal(modalOverlay);
						audioManager.playSound('button');
						resolve(index);
					});
					
					card.addEventListener('mouseenter', () => {
						card.style.transform = 'scale(1.05)';
						card.querySelector('.blind-card__image').style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.5)';
						audioManager.playSound('touch');
					});
					
					card.addEventListener('mouseleave', () => {
						card.style.transform = 'scale(1)';
						card.querySelector('.blind-card__image').style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
					});
				});
				
				modalOverlay.addEventListener('click', (e) => {
					if (e.target === modalOverlay) {
						this.closeModal(modalOverlay);
						audioManager.playSound('button');
						resolve(null);
					}
				});
				
				const escapeHandler = (e) => {
					if (e.key === 'Escape') {
						this.closeModal(modalOverlay);
						document.removeEventListener('keydown', escapeHandler);
						resolve(null);
					}
				};
				document.addEventListener('keydown', escapeHandler);
				modalOverlay.escapeHandler = escapeHandler;
			});
		},
		
		// Размещение отряда на поле противника
		playUnitOnOpponentBoard: async function(card, gameState, gameModule) {
			// Определяем доступные ряды для размещения (на стороне противника)
			const positions = Array.isArray(card.position) ? card.position : [card.position];
			const availableRows = [];
			const rows = ['close', 'ranged', 'siege'];
			
			rows.forEach(row => {
				const rowName = `${row}-row`;
				// Проверяем, может ли карта быть размещена в этом ряду
				if (positions.includes(rowName) || positions.includes('any-row')) {
					// Проверяем, есть ли место в ряду противника
					if (gameState.opponent.rows[row].cards.length < 9) {
						availableRows.push(row);
					}
				}
			});
			
			if (availableRows.length === 0) {
				gameModule.showGameMessage('Нет свободных рядов для размещения отряда на стороне противника', 'warning');
				return false;
			}
			
			// Показываем выбор ряда (подсветка рядов противника)
			const selectedRow = await this.showOpponentRowSelection(availableRows, gameModule);
			if (selectedRow === null) return false;
			
			// Создаем копию карты для размещения на поле противника
			const newCard = gameModule.createCardCopy(card);
			newCard.isStolen = true;
			newCard.originalOwner = 'opponent';
			newCard.stolenFromHand = true;
			
			// Размещаем карту в ряду противника
			gameState.opponent.rows[selectedRow].cards.push(newCard);
			gameModule.displayCardOnRow(selectedRow, newCard, 'opponent');
			
			// Обновляем силу ряда противника
			gameModule.updateRowStrength(selectedRow, 'opponent');
			
			// Проверяем, является ли карта шпионской (если позиция начинается с hidden-)
			const isSpy = positions.some(pos => pos.startsWith('hidden-'));
			if (isSpy) {
				// Шпионская карта - игрок добирает карту
				if (gameState.player.deck.length > 0 && gameState.player.hand.length < 10) {
					const drawnCard = gameState.player.deck.shift();
					gameState.player.hand.push(drawnCard);
					gameModule.displayPlayerHand();
					gameModule.displayPlayerDeck();
					gameModule.showGameMessage(`Шпионская карта! Вы получили карту: ${drawnCard.name}`, 'info');
					audioManager.playSound('cardDraw');
				} else if (gameState.player.hand.length >= 10) {
					gameModule.showGameMessage('Нет места в руке для добора карты!', 'warning');
				} else {
					gameModule.showGameMessage('В колоде нет карт для добора!', 'warning');
				}
			}
			
			// Воспроизводим звук размещения
			switch(selectedRow) {
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
			
			gameModule.showGameMessage(`Отряд "${newCard.name}" размещён на стороне противника в ряду ${this.getRowName(selectedRow)}`, 'info');
			
			return true;
		},
		
		// Подсветка рядов противника для размещения
		showOpponentRowSelection: function(availableRows, gameModule) {
			return new Promise((resolve) => {
				const rowsMap = {
					'close': 'opponentCloseRow',
					'ranged': 'opponentRangedRow',
					'siege': 'opponentSiegeRow'
				};
				
				const clickHandler = (row) => {
					return () => {
						this.removeOpponentRowHighlights();
						resolve(row);
					};
				};
				
				for (const row of availableRows) {
					const rowElement = document.getElementById(rowsMap[row]);
					if (rowElement) {
						rowElement.classList.add('row-available');
						rowElement.style.cursor = 'pointer';
						rowElement.addEventListener('click', clickHandler(row));
						
						rowElement.addEventListener('mouseenter', () => {
							rowElement.style.transform = 'scale(1.02)';
						});
						rowElement.addEventListener('mouseleave', () => {
							rowElement.style.transform = 'scale(1)';
						});
					}
				}
				
				// Кнопка отмены
				const cancelBtn = document.createElement('button');
				cancelBtn.textContent = 'ОТМЕНА';
				cancelBtn.className = 'ability-cancel-btn';
				cancelBtn.style.cssText = `
					position: fixed;
					bottom: 20px;
					left: 50%;
					transform: translateX(-50%);
					background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
					color: #d4af37;
					border: 2px solid #d4af37;
					padding: 10px 30px;
					border-radius: 5px;
					cursor: pointer;
					font-weight: bold;
					font-family: 'Gwent', sans-serif;
					text-transform: uppercase;
					letter-spacing: 2px;
					z-index: 10002;
					transition: all 0.3s ease;
				`;
				
				cancelBtn.addEventListener('mouseenter', () => {
					cancelBtn.style.transform = 'translateX(-50%) scale(1.05)';
					audioManager.playSound('touch');
				});
				cancelBtn.addEventListener('mouseleave', () => {
					cancelBtn.style.transform = 'translateX(-50%) scale(1)';
				});
				cancelBtn.addEventListener('click', () => {
					this.removeOpponentRowHighlights();
					cancelBtn.remove();
					audioManager.playSound('button');
					resolve(null);
				});
				
				document.body.appendChild(cancelBtn);
			});
		},
		
		removeOpponentRowHighlights: function() {
			const rows = ['close', 'ranged', 'siege'];
			for (const row of rows) {
				const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
				if (rowElement) {
					rowElement.classList.remove('row-available');
					rowElement.style.cursor = '';
					rowElement.style.transform = '';
				}
			}
			const btn = document.querySelector('.ability-cancel-btn');
			if (btn) btn.remove();
		},
		
		// Применение специальной карты (погода и т.д.)
		applySpecialCard: function(card, gameState, gameModule) {
			if (gameModule.isWeatherCard(card)) {
				// Для погодных карт применяем эффект
				gameModule.handleRegularWeather(card);
				gameModule.showGameMessage(`Погодная карта "${card.name}" активирована!`, 'info');
			} else {
				// Для других специальных карт
				gameModule.showGameMessage(`Специальная карта "${card.name}" применена!`, 'info');
			}
			
			// Отправляем карту в сброс
			gameModule.addCardToDiscard(card, 'opponent');
		},
		
		// Применение карты артефакта
		applyArtifactCard: function(card, gameState, gameModule) {
			// Артефакты можно добавить в руку или применить эффект
			if (gameState.player.hand.length < 10) {
				gameState.player.hand.push(card);
				gameModule.displayPlayerHand();
				gameModule.showGameMessage(`Артефакт "${card.name}" добавлен в вашу руку!`, 'info');
				audioManager.playSound('cardAdd');
			} else {
				// Если нет места, отправляем в сброс
				gameModule.addCardToDiscard(card, 'opponent');
				gameModule.showGameMessage(`Нет места в руке! Артефакт "${card.name}" отправлен в сброс.`, 'warning');
			}
		},
		
		// Применение тактической карты
		applyTacticCard: function(card, gameState, gameModule) {
			gameModule.showGameMessage(`Тактика "${card.name}" применена!`, 'info');
			// Отправляем в сброс
			gameModule.addCardToDiscard(card, 'opponent');
		},
		
		// Закрытие модального окна
		closeModal: function(modal) {
			if (modal.escapeHandler) {
				document.removeEventListener('keydown', modal.escapeHandler);
			}
			modal.classList.remove('active');
			setTimeout(() => {
				if (modal.parentNode) {
					modal.parentNode.removeChild(modal);
				}
			}, 300);
		},
		
		getRowName: function(row) {
			const names = {
				'close': 'ближнего боя',
				'ranged': 'дальнего боя',
				'siege': 'осадном'
			};
			return names[row] || row;
		}
	},

	'monsters_ability_1': {
		name: 'Белый Хлад',
		description: 'Создайте эффект мороза только в ближнем ряду противника',
		execute: function(gameState, gameModule) {
			const row = 'close';
			this.applyFrostToOpponentRow(gameState, row, gameModule);
			return true;
		},
		
		applyFrostToOpponentRow: function(gameState, row, gameModule) {
			// Убираем существующие эффекты погоды в этом ряду у противника
			this.removeWeatherFromOpponentRow(gameState, row, gameModule);
			
			// Применяем мороз ТОЛЬКО к ряду противника
			if (!gameState.weather) {
				gameState.weather = {
					cards: [],
					maxWeatherCards: 3,
					effects: {
						'close': null,
						'ranged': null,
						'siege': null
					}
				};
			}
			
			gameState.weather.effects[row] = {
				card: { name: 'Трескучий мороз', type: 'special', faction: 'monsters' },
				image: 'board/frost.png',
				sound: 'frost',
				onlyOpponent: true
			};
			
			// Применяем визуальный эффект ТОЛЬКО на ряд противника
			this.applyVisualWeatherToOpponentRow(row, 'board/frost.png', gameModule);
			if (gameModule.playWeatherSound) {
				gameModule.playWeatherSound('frost');
			}
			
			// Уменьшаем силу отрядов противника в этом ряду до 1
			if (gameModule.reduceRowStrengthTo1) {
				gameModule.reduceRowStrengthTo1(row, 'opponent');
			} else {
				gameState.opponent.rows[row].cards.forEach(card => {
					if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
					
					if (card.baseStrength === undefined) card.baseStrength = card.strength || 0;
					if (card.originalStrength === undefined) card.originalStrength = card.strength || 0;
					
					if (!card.underWeather || typeof card._preWeatherStrength !== 'number') {
						card._preWeatherStrength = card.modifiedStrength !== undefined
							? card.modifiedStrength
							: (card.baseStrength || card.strength || 0);
					}
					card.underWeather = true;
					card.modifiedStrength = Math.min(1, card._preWeatherStrength);
					card.currentStrength = card.modifiedStrength;
					card.strength = card.currentStrength;
					
					// Обновляем отображение карты
					if (gameModule.updateCardStrengthDisplay) {
						gameModule.updateCardStrengthDisplay(card, row, 'opponent');
					}
				});
			}
			
			if (gameModule.updateRowStrength) {
				gameModule.updateRowStrength(row, 'opponent');
			}
			if (gameModule.updateTotalScoreDisplays) {
				gameModule.updateTotalScoreDisplays();
			}
			
			gameState.player.abilityUsedThisRound = true;
			if (gameModule.showGameMessage) {
				gameModule.showGameMessage(`Способность "${this.name}" активирована! Мороз в ближнем ряду противника.`, 'info');
			}
			if (audioManager && audioManager.playSound) {
				audioManager.playSound('weather');
			}
		},
		
		applyVisualWeatherToOpponentRow: function(row, image, gameModule) {
			const opponentRowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
			if (opponentRowElement) {
				// Оверлей накрывает весь ряд, включая слот тактики
				const rowContainer = opponentRowElement.closest('.battle-row') || opponentRowElement;
				// Удаляем существующий эффект погоды в этом ряду
				const existingEffect = rowContainer.querySelector(`[data-weather-row="${row}"][data-weather-side="opponent"]`);
				if (existingEffect) {
					existingEffect.remove();
				}
				
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
				weatherOverlay.dataset.weatherSide = 'opponent';
				rowContainer.style.position = 'relative';
				rowContainer.appendChild(weatherOverlay);
			}
		},
		
		removeWeatherFromOpponentRow: function(gameState, row, gameModule) {
			// Удаляем визуальный эффект
			const opponentEffects = document.querySelectorAll(`[data-weather-row="${row}"][data-weather-side="opponent"]`);
			opponentEffects.forEach(effect => effect.remove());
			
			// Проверяем, существует ли weather в gameState
			if (gameState && gameState.weather && gameState.weather.effects && gameState.weather.effects[row]) {
				gameState.weather.effects[row] = null;
			}
			
			// Восстанавливаем силу карт
			if (gameState && gameState.opponent && gameState.opponent.rows && gameState.opponent.rows[row]) {
				gameState.opponent.rows[row].cards.forEach(card => {
					if (card.underWeather) {
						if (gameModule && gameModule.restoreCardFromWeather) {
							gameModule.restoreCardFromWeather(card);
						} else {
							card.underWeather = false;

							if (gameModule && gameModule.refreshCardStrength) {
								gameModule.refreshCardStrength(card);
							} else if (card.modifiedStrength !== undefined) {
								card.strength = card.modifiedStrength;
								card.currentStrength = card.modifiedStrength;
							}
						}
						
						if (gameModule && gameModule.updateCardStrengthDisplay) {
							gameModule.updateCardStrengthDisplay(card, row, 'opponent');
						}
					}
				});
				if (gameModule && gameModule.updateRowStrength) {
					gameModule.updateRowStrength(row, 'opponent');
				}
			}
		}
	},
	'monsters_ability_2': {
		name: 'Неутолимый голод',
		description: 'Уничтожьте дружественный отряд, затем призовите Волколака, усиленного на значение силы уничтоженного отряда, из колоды на поле в этом же ряду',
		execute: function(gameState, gameModule) {
			const friendlyUnits = [];
			const rows = ['close', 'ranged', 'siege'];
			
			rows.forEach(row => {
				gameState.player.rows[row].cards.forEach((card, index) => {
					// ===== ТОЛЬКО ОТРЯДЫ (НЕ ГЕРОИ) =====
					if (card.type === 'unit') {
						// Проверяем, что это не герой
						if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) {
							return;
						}
						// Проверяем, что карта жива (сила > 0)
						const currentStrength = card.currentStrength !== undefined ? 
							card.currentStrength : (card.strength || 0);
						if (currentStrength <= 0) {
							return;
						}
						// Убеждаемся, что есть uniqueId
						if (!card.uniqueId) {
							card.uniqueId = `${card.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
						}
						friendlyUnits.push({ 
							card: card, 
							row: row, 
							index: index,
							uniqueId: card.uniqueId 
						});
					}
				});
			});
			
			if (friendlyUnits.length === 0) {
				gameModule.showGameMessage('Нет дружественных отрядов для жертвоприношения', 'warning');
				return false;
			}
			
			this._gameState = gameState;
			this._gameModule = gameModule;
			
			this.showSacrificeSelection(friendlyUnits, gameState, gameModule);
			return true;
		},
		
		showSacrificeSelection: function(friendlyUnits, gameState, gameModule) {
			const rows = ['close', 'ranged', 'siege'];
			this._clickHandlers = [];
			this._mouseEnterHandlers = [];
			this._mouseLeaveHandlers = [];
			
			const clickHandler = (event) => {
				const cardElement = event.currentTarget;
				const uniqueId = cardElement.dataset.uniqueId;
				const row = cardElement.dataset.row;
				
				// ===== ИЩЕМ КАРТУ ПО uniqueId =====
				let targetCard = null;
				let targetRow = null;
				for (const r of rows) {
					const card = gameState.player.rows[r].cards.find(c => 
						c.uniqueId === uniqueId
					);
					if (card) {
						targetCard = card;
						targetRow = r;
						break;
					}
				}
				
				if (targetCard) {
					// ===== ПРОВЕРЯЕМ, ЧТО ЭТО НЕ ГЕРОЙ =====
					if (targetCard.tags && (targetCard.tags.includes('hero') || targetCard.tags.includes('герой'))) {
						gameModule.showGameMessage('Нельзя пожертвовать Героя!', 'warning');
						this.removeHighlights(gameState);
						return;
					}
					
					// Проверяем, что это отряд
					if (targetCard.type !== 'unit') {
						gameModule.showGameMessage('Можно жертвовать только отряды!', 'warning');
						this.removeHighlights(gameState);
						return;
					}
					
					const sacrificedStrength = targetCard.strength || 0;
					
					// ===== АНИМАЦИЯ УНИЧТОЖЕНИЯ ЖЕРТВЫ =====
					this.createDestroyVisualEffect(targetCard, targetRow, gameModule);
					
					// Уничтожаем отряд с задержкой
					setTimeout(() => {
						this.destroyFriendlyUnit(gameState, targetCard, targetRow, gameModule);
						
						// Ищем Волколака в колоде
						let werewolfIndex = -1;
						let werewolfCard = null;
						for (let i = 0; i < gameState.player.deck.length; i++) {
							const card = gameState.player.deck[i];
							if (card.name === 'Волколак' || 
								card.name === 'Werewolf' ||
								(card.tags && card.tags.includes('werewolf'))) {
								werewolfIndex = i;
								werewolfCard = card;
								break;
							}
						}
						
						if (werewolfCard) {
							gameState.player.deck.splice(werewolfIndex, 1);
							// Усиливаем Волколака
							this.boostCard(werewolfCard, sacrificedStrength);
							
							// Находим место для Волколака в том же ряду
							const rowState = gameState.player.rows[targetRow];
							if (rowState.cards.length < 9) {
								// Добавляем в тот же ряд
								werewolfCard.owner = 'player';
								werewolfCard.row = targetRow;
								werewolfCard.uniqueId = `werewolf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
								rowState.cards.push(werewolfCard);
								gameModule.displayCardOnRow(targetRow, werewolfCard, 'player');
								gameModule.updateRowStrength(targetRow, 'player');
								gameModule.updateCardStrengthDisplay(werewolfCard, targetRow, 'player');
								gameModule.showGameMessage(`Волколак призван из колоды с силой ${werewolfCard.strength}!`, 'info');
							} else {
								// Если нет места, добавляем в руку
								gameState.player.hand.push(werewolfCard);
								gameModule.displayPlayerHand();
								gameModule.showGameMessage(`Нет места на поле! Волколак добавлен в руку.`, 'info');
							}
							audioManager.playSound('summon');
						} else {
							gameModule.showGameMessage('В колоде нет Волколака!', 'warning');
						}
						
						gameState.player.abilityUsedThisRound = true;
						gameModule.updateTotalScoreDisplays();
						gameModule.showGameMessage(`Способность "${this.name}" активирована!`, 'info');
						audioManager.playSound('card_destroy');
						
						if (window.boardModule && window.boardModule.updateAbilityAvailability) {
							window.boardModule.updateAbilityAvailability(gameState);
						}
					}, 500);
				}
				
				this.removeHighlights(gameState);
			};
			
			// ===== ПОДСВЕЧИВАЕМ ТОЛЬКО ОТРЯДЫ (НЕ ГЕРОИ) =====
			for (const row of rows) {
				const rowElement = document.getElementById(`player${gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(card => {
					const uniqueId = card.dataset.uniqueId;
					
					// Ищем цель по uniqueId
					const target = friendlyUnits.find(u => u.uniqueId === uniqueId);
					
					if (target) {
						// ===== ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА =====
						if (target.card.type !== 'unit') return;
						if (target.card.tags && (target.card.tags.includes('hero') || target.card.tags.includes('герой'))) return;
						
						card.style.cursor = 'pointer';
						card.style.filter = 'brightness(1.2) drop-shadow(0 0 8px #ff4444)';
						card.style.transition = 'all 0.2s ease';
						card.dataset.row = row;
						card.dataset.uniqueId = target.uniqueId;
						
						const handler = clickHandler;
						card.addEventListener('click', handler);
						this._clickHandlers.push({ element: card, handler: handler });
						
						// Обработчики наведения
						const mouseEnterHandler = () => {
							card.style.transform = 'scale(1.05)';
						};
						const mouseLeaveHandler = () => {
							card.style.transform = 'scale(1)';
						};
						
						card.addEventListener('mouseenter', mouseEnterHandler);
						card.addEventListener('mouseleave', mouseLeaveHandler);
						
						this._mouseEnterHandlers.push({ element: card, handler: mouseEnterHandler });
						this._mouseLeaveHandlers.push({ element: card, handler: mouseLeaveHandler });
					}
				});
			}
			this.showCancelButton(gameState);
		},
		
		// ===== АНИМАЦИЯ УНИЧТОЖЕНИЯ =====
		createDestroyVisualEffect: function(card, row, gameModule) {
			const rowElement = document.getElementById(`player${gameModule.capitalizeFirst(row)}Row`);
			if (!rowElement) return;
			
			let cardElement = null;
			
			if (card.uniqueId) {
				cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			}
			
			if (!cardElement) {
				const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
				if (elements.length === 1) {
					cardElement = elements[0];
				} else if (elements.length > 1) {
					const rowState = this._gameState.player.rows[row];
					const position = rowState.cards.findIndex(c => 
						c.uniqueId === card.uniqueId
					);
					if (position !== -1 && elements[position]) {
						cardElement = elements[position];
					} else {
						cardElement = elements[0];
					}
				}
			}
			
			if (!cardElement) return;
			
			// Эффект уничтожения (как при казни)
			const destroyOverlay = document.createElement('div');
			destroyOverlay.className = 'card-destroy-overlay';
			destroyOverlay.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				z-index: 100;
				border-radius: 5px;
				pointer-events: none;
				animation: destroyCardAnimation 1s ease-out forwards;
			`;
			
			cardElement.style.boxShadow = '0 0 30px 15px rgba(255, 0, 0, 0.8)';
			cardElement.style.transition = 'box-shadow 0.3s ease-out';
			
			cardElement.appendChild(destroyOverlay);
			
			setTimeout(() => {
				if (destroyOverlay.parentNode) {
					destroyOverlay.remove();
				}
				cardElement.style.boxShadow = '';
			}, 1000);
		},
		
		destroyFriendlyUnit: function(gameState, card, row, gameModule) {
			const rowCards = gameState.player.rows[row].cards;
			// ===== ИЩЕМ ПО uniqueId =====
			let cardIndex = -1;
			if (card.uniqueId) {
				cardIndex = rowCards.findIndex(c => c.uniqueId === card.uniqueId);
			}
			if (cardIndex === -1) {
				cardIndex = rowCards.findIndex(c => c.id === card.id);
			}
			if (cardIndex !== -1) {
				const destroyedCard = rowCards.splice(cardIndex, 1)[0];
				gameModule.addCardToDiscard(destroyedCard, 'player');
				gameModule.redrawRow(row, 'player');
				gameModule.updateRowStrength(row, 'player');
				audioManager.playSound('card_destroy');
			}
		},
		
		removeHighlights: function(gameState) {
			const rows = ['close', 'ranged', 'siege'];
			for (const row of rows) {
				const rowElement = document.getElementById(`player${this._gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(card => {
					card.style.cursor = '';
					card.style.filter = '';
					card.style.transform = '';
					card.style.boxShadow = '';
				});
			}
			
			// Удаляем обработчики
			if (this._clickHandlers) {
				this._clickHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('click', handler);
				});
				this._clickHandlers = [];
			}
			
			if (this._mouseEnterHandlers) {
				this._mouseEnterHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('mouseenter', handler);
				});
				this._mouseEnterHandlers = [];
			}
			
			if (this._mouseLeaveHandlers) {
				this._mouseLeaveHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('mouseleave', handler);
				});
				this._mouseLeaveHandlers = [];
			}
			
			this.removeCancelButton();
		},
		
		showCancelButton: function(gameState) {
			if (document.getElementById('abilityCancelBtn')) return;
			const cancelBtn = document.createElement('button');
			cancelBtn.id = 'abilityCancelBtn';
			cancelBtn.textContent = 'ОТМЕНА';
			cancelBtn.style.cssText = `
				position: fixed;
				bottom: 30px;
				left: 50%;
				transform: translateX(-50%);
				background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
				color: #d4af37;
				border: 2px solid #d4af37;
				padding: 12px 35px;
				border-radius: 8px;
				cursor: pointer;
				font-weight: bold;
				font-family: 'Gwent', sans-serif;
				font-size: 16px;
				text-transform: uppercase;
				letter-spacing: 2px;
				z-index: 10050;
				transition: all 0.3s ease;
				box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
			`;
			
			cancelBtn.addEventListener('mouseenter', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1.05)';
				cancelBtn.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)';
				audioManager.playSound('touch');
			});
			
			cancelBtn.addEventListener('mouseleave', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1)';
				cancelBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
			});
			
			cancelBtn.addEventListener('click', () => {
				if (gameState) {
					gameState.player.abilityUsedThisRound = false;
				}
				
				this.removeHighlights(gameState);
				audioManager.playSound('button');
				
				if (window.boardModule && window.boardModule.updateAbilityAvailability) {
					window.boardModule.updateAbilityAvailability(gameState);
				}
			});
			
			document.body.appendChild(cancelBtn);
			this._cancelBtn = cancelBtn;
		},
		
		removeCancelButton: function() {
			if (this._cancelBtn && this._cancelBtn.parentNode) {
				this._cancelBtn.remove();
				this._cancelBtn = null;
			}
			const btn = document.getElementById('abilityCancelBtn');
			if (btn) btn.remove();
		},
		
		boostCard: function(card, amount) {
			if (window.gameModule && window.gameModule.applyCardBoost) {
				window.gameModule.applyCardBoost(card, amount);
				return;
			}
			
			if (card.baseStrength === undefined) card.baseStrength = card.strength;
			if (card.originalStrength === undefined) card.originalStrength = card.strength;
			if (card.modifiedStrength === undefined) card.modifiedStrength = card.strength;
			
			card.modifiedStrength += amount;
			card.currentStrength = card.modifiedStrength;
			card.strength = card.currentStrength;
			card._displayStrength = card.currentStrength;
		}
	},
	'monsters_ability_3': {
		name: 'Запах крови',
		description: 'Нанесите 2 ед. урона по вражескому ряду с наибольшим количеством карт',
		execute: function(gameState, gameModule) {
			// Сохраняем ссылки для анимации
			this._gameState = gameState;
			this._gameModule = gameModule;
			
			// Находим ряд противника с наибольшим количеством карт
			let targetRow = null;
			let maxCards = -1;
			const rows = ['close', 'ranged', 'siege'];
			
			rows.forEach(row => {
				const cardCount = gameState.opponent.rows[row].cards.length;
				if (cardCount > maxCards) {
					maxCards = cardCount;
					targetRow = row;
				}
			});
			
			if (targetRow === null || maxCards === 0) {
				gameModule.showGameMessage('Нет отрядов противника для атаки', 'warning');
				return false;
			}
			
			// Сохраняем карты для анимации
			const damagedCards = [];
			const unitsToDestroy = [];
			const damageAmount = 2;
			
			gameState.opponent.rows[targetRow].cards.forEach(card => {
				if (card.type === 'unit') {
					// Пропускаем героев
					if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
					
					// Сохраняем карту до нанесения урона
					damagedCards.push({ card: card, row: targetRow });
					
					this.dealDamage(card, damageAmount);
					
					if (card.modifiedStrength <= 0) {
						unitsToDestroy.push({ card: card, row: targetRow });
					}
				}
			});
			
			// === ВАЖНО: ПОКАЗЫВАЕМ АНИМАЦИЮ УРОНА ДЛЯ КАЖДОЙ КАРТЫ ===
			damagedCards.forEach(item => {
				this.createDamageVisualEffect(item.card, item.row, gameModule);
			});
			
			// Уничтожаем уничтоженные карты
			unitsToDestroy.forEach(unit => {
				this.destroyCard(gameState, unit.card, unit.row, gameModule);
			});
			
			gameState.player.abilityUsedThisRound = true;
			gameModule.updateRowStrength(targetRow, 'opponent');
			gameModule.updateTotalScoreDisplays();
			gameModule.showGameMessage(`Способность "${this.name}" активирована! Нанесён 2 урон ${damagedCards.length} отрядам в ряду ${this.getRowName(targetRow)}.`, 'info');
			audioManager.playSound('card_damage');
			
			return true;
		},
		
		// ===== АНИМАЦИЯ УРОНА -2 (как в scoiatael_ability_3) =====
		createDamageVisualEffect: function(card, row, gameModule) {
			const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
			if (!rowElement) return;
			
			// Ищем элемент карты на доске
			let cardElement = null;
			
			if (card.uniqueId) {
				cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			}
			
			if (!cardElement) {
				const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
				if (elements.length === 1) {
					cardElement = elements[0];
				} else if (elements.length > 1) {
					const rowState = this._gameState.opponent.rows[row];
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
			
			// Если не нашли по селекторам, пробуем найти по позиции
			if (!cardElement) {
				const allCards = rowElement.querySelectorAll('.board-card');
				const rowState = this._gameState.opponent.rows[row];
				const position = rowState.cards.findIndex(c => 
					c.id === card.id && c.uniqueId === card.uniqueId
				);
				if (position !== -1 && allCards[position]) {
					cardElement = allCards[position];
				}
			}
			
			if (!cardElement) return;
			
			// Создаём элемент с анимацией -2 (красный, как в scoiatael_ability_3)
			const damageOverlay = document.createElement('div');
			damageOverlay.className = 'card-damage-overlay';
			damageOverlay.textContent = '-2';
			damageOverlay.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #ff1744;
				font-size: 36px;
				font-weight: bold;
				text-shadow: 0 0 20px rgba(255, 23, 68, 0.9), 0 0 40px rgba(255, 0, 0, 0.6);
				z-index: 100;
				pointer-events: none;
				animation: leaderBoostAnimation 1.2s ease-out forwards;
				font-family: 'Gwent', sans-serif;
				letter-spacing: 2px;
			`;
			
			// Добавляем красное свечение на карту
			cardElement.style.boxShadow = '0 0 20px 8px rgba(255, 0, 0, 0.5)';
			cardElement.style.transition = 'box-shadow 0.5s ease-out';
			
			cardElement.appendChild(damageOverlay);
			
			// Удаляем эффект через 1.2 секунды
			setTimeout(() => {
				if (damageOverlay.parentNode) {
					damageOverlay.remove();
				}
				cardElement.style.boxShadow = '';
			}, 1200);
		},
		
		dealDamage: function(card, amount) {
			if (window.gameModule && window.gameModule.applyCardDamage) {
				window.gameModule.applyCardDamage(card, amount);
				return;
			}
			
			if (card.baseStrength === undefined) card.baseStrength = card.strength;
			if (card.originalStrength === undefined) card.originalStrength = card.strength;
			if (card.modifiedStrength === undefined) card.modifiedStrength = card.strength;
			
			card.modifiedStrength = Math.max(0, card.modifiedStrength - amount);
			card.currentStrength = card.modifiedStrength;
			card.strength = card.currentStrength;
			card._displayStrength = card.currentStrength;
		},
		
		destroyCard: function(gameState, card, row, gameModule) {
			const rowCards = gameState.opponent.rows[row].cards;
			let cardIndex = -1;
			
			if (card.uniqueId !== undefined) {
				cardIndex = rowCards.findIndex(c => c.uniqueId === card.uniqueId);
			}
			if (cardIndex === -1) {
				cardIndex = rowCards.indexOf(card);
			}
			if (cardIndex === -1) {
				const sameId = rowCards
					.map((c, index) => ({ c, index }))
					.filter(entry => entry.c.id === card.id);
				if (sameId.length === 1) {
					cardIndex = sameId[0].index;
				}
			}
			
			if (cardIndex !== -1) {
				const destroyedCard = rowCards.splice(cardIndex, 1)[0];
				gameModule.addCardToDiscard(destroyedCard, 'opponent');
				gameModule.redrawRow(row, 'opponent');
				gameModule.updateRowStrength(row, 'opponent');
				audioManager.playSound('card_destroy');
			}
		},
		
		getRowName: function(row) {
			const names = {
				'close': 'Ближнего боя',
				'ranged': 'Дальнего боя',
				'siege': 'Осадном'
			};
			return names[row] || row;
		}
	},
	'monsters_ability_4': {
		name: 'Сила природы',
		description: 'Призовите Духа Леса',
		execute: function(gameState, gameModule) {
			// ===== СОБИРАЕМ ВСЕ ДОСТУПНЫЕ РЯДЫ =====
			const availableRows = [];
			const rows = ['close', 'ranged', 'siege'];
			
			for (const row of rows) {
				if (gameState.player.rows[row].cards.length < 9) {
					availableRows.push(row);
				}
			}
			
			if (availableRows.length === 0) {
				gameModule.showGameMessage('Нет свободных рядов для призыва Духа Леса', 'warning');
				return false;
			}
			
			// ===== ВЫБИРАЕМ СЛУЧАЙНЫЙ РЯД ИЗ ДОСТУПНЫХ =====
			const randomIndex = Math.floor(Math.random() * availableRows.length);
			const targetRow = availableRows[randomIndex];
			
			// Ищем Духа Леса
			let spiritCard = null;
			
			// Ищем среди всех карт фракции monsters
			if (window.cardsModule && window.cardsModule.cardsData) {
				const monstersCards = window.cardsModule.cardsData.monsters;
				if (monstersCards && monstersCards.units) {
					spiritCard = monstersCards.units.find(card => 
						card.name === 'Леший' || 
						card.name === 'Дух Леса' ||
						(card.tags && card.tags.includes('forest_spirit')) ||
						(card.summonBy === 'monsters_ability_4')
					);
				}
			}
			
			// Если не нашли через cardsData, пробуем другие способы
			if (!spiritCard) {
				// Пробуем через getCardByIdIncludingHidden
				if (window.cardsModule && window.cardsModule.getCardByIdIncludingHidden) {
					spiritCard = window.cardsModule.getCardByIdIncludingHidden('monsters_unit_forest_spirit');
				}
				
				// Если всё ещё не нашли, создаём карту динамически
				if (!spiritCard) {
					spiritCard = {
						id: 'monsters_forest_spirit',
						name: 'Дух Леса',
						namefull: 'Дух Леса - Хранитель Брокилона',
						strength: 9,
						image: 'forest_spirit.mp4',
						description: 'Хранитель леса',
						descriptionfull: 'Древний дух, охраняющий священные рощи. Призван силой природы.',
						ability: 'forest_spirit_ability',
						position: 'any-row',
						rarity: 'gold',
						faction: 'monsters',
						type: 'unit',
						tags: ['specter', 'nature'],
						border: 'deck/bord_gold.png',
						banner: 'faction/monsters/banner_gold.png',
						positionBanner: 'faction/monsters/banner_position.png',
						hidden: true,
						summonBy: 'monsters_ability_4'
					};
				}
			}
			
			if (!spiritCard) {
				gameModule.showGameMessage('Не удалось найти карту "Дух Леса"!', 'warning');
				return false;
			}
			
			// Создаём копию карты для размещения на поле
			const summonedCard = gameModule.createCardCopy(spiritCard);
			summonedCard.summonedByAbility = true;
			summonedCard.isSummoned = true;
			summonedCard.summonSource = 'monsters_ability_4';
			
			// ===== РАЗМЕЩАЕМ КАРТУ В ВЫБРАННОМ РЯДУ =====
			gameState.player.rows[targetRow].cards.push(summonedCard);
			gameModule.displayCardOnRow(targetRow, summonedCard, 'player');
			gameModule.updateRowStrength(targetRow, 'player');
			gameModule.updateCardStrengthDisplay(summonedCard, targetRow, 'player');
			
			gameState.player.abilityUsedThisRound = true;
			gameModule.updateTotalScoreDisplays();
			
			const rowNames = {
				'close': 'ближнего боя',
				'ranged': 'дальнего боя',
				'siege': 'осадном'
			};
			
			gameModule.showGameMessage(`Способность "${this.name}" активирована! Дух Леса призван в ряд ${rowNames[targetRow]}.`, 'info');
			audioManager.playSound('summon');
			
			if (window.boardModule && window.boardModule.updateAbilityAvailability) {
				window.boardModule.updateAbilityAvailability(gameState);
			}
			
			return true;
		}
	},
	'monsters_ability_5': {
		name: 'Панцирь',
		description: 'Усильте дружественный отряд на 3 ед. Кроме нейтрального отряда',
		execute: function(gameState, gameModule) {
			const friendlyUnits = [];
			const rows = ['close', 'ranged', 'siege'];
			
			rows.forEach(row => {
				gameState.player.rows[row].cards.forEach(card => {
					// ===== ТОЛЬКО ОТРЯДЫ (НЕ ГЕРОИ, НЕ НЕЙТРАЛЬНЫЕ) =====
					if (card.type === 'unit') {
						// Проверяем, что это не герой
						if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
						// Проверяем, что это не нейтральный отряд
						if (card.faction === 'neutral') return;
						// Проверяем, что карта жива
						const currentStrength = card.currentStrength !== undefined ? 
							card.currentStrength : (card.strength || 0);
						if (currentStrength <= 0) return;
						// Убеждаемся, что есть uniqueId
						if (!card.uniqueId) {
							card.uniqueId = `${card.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
						}
						friendlyUnits.push({ 
							card: card, 
							row: row,
							uniqueId: card.uniqueId 
						});
					}
				});
			});
			
			if (friendlyUnits.length === 0) {
				gameModule.showGameMessage('Нет дружественных отрядов не нейтральной фракции для усиления', 'warning');
				return false;
			}
			
			// Сохраняем состояние для анимации
			this._gameState = gameState;
			this._gameModule = gameModule;
			this._boostAmount = 3;
			
			this.showTargetSelection(friendlyUnits, gameState, gameModule);
			return true;
		},
		
		showTargetSelection: function(friendlyUnits, gameState, gameModule) {
			const rows = ['close', 'ranged', 'siege'];
			this._clickHandlers = [];
			this._mouseEnterHandlers = [];
			this._mouseLeaveHandlers = [];
			
			const clickHandler = (target) => {
				return (event) => {
					// ===== ПРОВЕРЯЕМ ПО uniqueId =====
					const stillExists = gameState.player.rows[target.row].cards.some(
						c => c.uniqueId === target.uniqueId && c.type === 'unit'
					);
					
					if (!stillExists) {
						gameModule.showGameMessage('Эта карта уже не на поле', 'warning');
						this.removeMonsterHighlights();
						return;
					}
					
					// Проверяем, что это не нейтральный отряд
					if (target.card.faction === 'neutral') {
						gameModule.showGameMessage('Нельзя усилить нейтральный отряд!', 'warning');
						return;
					}
					
					// Проверяем героя
					if (target.card.tags && (target.card.tags.includes('hero') || target.card.tags.includes('герой'))) {
						gameModule.showGameMessage('Нельзя усилить Героя!', 'warning');
						this.removeMonsterHighlights();
						return;
					}
					
					// Проверяем, что это отряд
					if (target.card.type !== 'unit') {
						gameModule.showGameMessage('Можно усиливать только отряды!', 'warning');
						this.removeMonsterHighlights();
						return;
					}
					
					// Применяем усиление
					this.boostCard(target.card, this._boostAmount);
					
					// Анимация усиления
					this.createBoostVisualEffect(target.card, target.row, gameModule);
					
					gameState.player.abilityUsedThisRound = true;
					
					gameModule.updateRowStrength(target.row, 'player');
					gameModule.updateTotalScoreDisplays();
					gameModule.showGameMessage(`Способность "${this.name}" активирована! ${target.card.name} усилен на ${this._boostAmount} ед.`, 'info');
					audioManager.playSound('card_boost');
					
					this.removeMonsterHighlights();
					
					if (window.boardModule && window.boardModule.updateAbilityAvailability) {
						window.boardModule.updateAbilityAvailability(gameState);
					}
				};
			};
			
			// ===== ПОДСВЕЧИВАЕМ ТОЛЬКО ПОДХОДЯЩИЕ КАРТЫ =====
			for (const row of rows) {
				const rowElement = document.getElementById(`player${gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(cardElement => {
					const uniqueId = cardElement.dataset.uniqueId;
					
					// Ищем цель по uniqueId
					const target = friendlyUnits.find(u => u.uniqueId === uniqueId);
					
					if (target) {
						// ===== ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА =====
						if (target.card.type !== 'unit') return;
						if (target.card.faction === 'neutral') return;
						if (target.card.tags && (target.card.tags.includes('hero') || target.card.tags.includes('герой'))) return;
						
						cardElement.style.cursor = 'pointer';
						cardElement.classList.add('boost-target');
						cardElement.dataset.boostUniqueId = target.uniqueId;
						
						const handler = clickHandler(target);
						cardElement.addEventListener('click', handler);
						this._clickHandlers.push({ element: cardElement, handler: handler });
						
						// Обработчики наведения
						const mouseEnterHandler = () => {
							if (!cardElement.classList.contains('boost-selected')) {
								cardElement.style.transform = 'scale(1.05)';
								cardElement.style.filter = 'brightness(1.2) drop-shadow(0 0 12px #4CAF50)';
							}
						};
						
						const mouseLeaveHandler = () => {
							if (!cardElement.classList.contains('boost-selected')) {
								cardElement.style.transform = 'scale(1)';
								cardElement.style.filter = '';
							}
						};
						
						cardElement.addEventListener('mouseenter', mouseEnterHandler);
						cardElement.addEventListener('mouseleave', mouseLeaveHandler);
						
						this._mouseEnterHandlers.push({ element: cardElement, handler: mouseEnterHandler });
						this._mouseLeaveHandlers.push({ element: cardElement, handler: mouseLeaveHandler });
					}
				});
			}
			
			this.showMonsterCancelButton(gameState, gameModule);
		},
		
		// ===== АНИМАЦИЯ УСИЛЕНИЯ =====
		createBoostVisualEffect: function(card, row, gameModule) {
			const rowElement = document.getElementById(`player${gameModule.capitalizeFirst(row)}Row`);
			if (!rowElement) return;
			
			let cardElement = null;
			
			if (card.uniqueId) {
				cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			}
			
			if (!cardElement) {
				const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
				if (elements.length === 1) {
					cardElement = elements[0];
				} else if (elements.length > 1) {
					const rowState = this._gameState.player.rows[row];
					const position = rowState.cards.findIndex(c => 
						c.uniqueId === card.uniqueId
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
			boostOverlay.textContent = '+3';
			boostOverlay.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #00ff00;
				font-size: 36px;
				font-weight: bold;
				text-shadow: 0 0 20px rgba(0, 255, 0, 0.9), 0 0 40px rgba(0, 255, 0, 0.6);
				z-index: 100;
				pointer-events: none;
				animation: leaderBoostAnimation 1.2s ease-out forwards;
				font-family: 'Gwent', sans-serif;
				letter-spacing: 2px;
			`;
			
			cardElement.style.boxShadow = '0 0 20px 8px rgba(0, 255, 0, 0.5)';
			cardElement.style.transition = 'box-shadow 0.5s ease-out';
			
			cardElement.appendChild(boostOverlay);
			
			setTimeout(() => {
				if (boostOverlay.parentNode) {
					boostOverlay.remove();
				}
				cardElement.style.boxShadow = '';
			}, 1200);
		},
		
		removeMonsterHighlights: function() {
			const rows = ['close', 'ranged', 'siege'];
			for (const row of rows) {
				const rowElement = document.getElementById(`player${this._gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(card => {
					card.style.cursor = '';
					card.classList.remove('boost-target', 'boost-selected');
					card.style.filter = '';
					card.style.transform = '';
					card.style.boxShadow = '';
				});
			}
			
			// Удаляем обработчики кликов
			if (this._clickHandlers) {
				this._clickHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('click', handler);
				});
				this._clickHandlers = [];
			}
			
			// Удаляем обработчики mouseenter
			if (this._mouseEnterHandlers) {
				this._mouseEnterHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('mouseenter', handler);
				});
				this._mouseEnterHandlers = [];
			}
			
			// Удаляем обработчики mouseleave
			if (this._mouseLeaveHandlers) {
				this._mouseLeaveHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('mouseleave', handler);
				});
				this._mouseLeaveHandlers = [];
			}
			
			this.removeMonsterCancelButton();
		},
		
		showMonsterCancelButton: function(gameState, gameModule) {
			const existingBtn = document.getElementById('abilityCancelBtn');
			if (existingBtn) existingBtn.remove();
			
			const cancelBtn = document.createElement('button');
			cancelBtn.id = 'abilityCancelBtn';
			cancelBtn.textContent = 'ОТМЕНА';
			cancelBtn.className = 'ability-cancel-btn';
			cancelBtn.style.cssText = `
				position: fixed;
				bottom: 30px;
				left: 50%;
				transform: translateX(-50%);
				background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
				color: #d4af37;
				border: 2px solid #d4af37;
				padding: 12px 35px;
				border-radius: 8px;
				cursor: pointer;
				font-weight: bold;
				font-family: 'Gwent', sans-serif;
				font-size: 16px;
				text-transform: uppercase;
				letter-spacing: 2px;
				z-index: 10050;
				transition: all 0.3s ease;
				box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
			`;
			
			cancelBtn.addEventListener('mouseenter', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1.05)';
				cancelBtn.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)';
				audioManager.playSound('touch');
			});
			
			cancelBtn.addEventListener('mouseleave', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1)';
				cancelBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
			});
			
			cancelBtn.addEventListener('click', () => {
				// Отменяем выделение и сбрасываем флаг использования
				this.removeMonsterHighlights();
				
				// Сбрасываем флаг использования способности
				if (gameState) {
					gameState.player.abilityUsedThisRound = false;
				}
				
				audioManager.playSound('button');
				gameModule.showGameMessage('Использование способности отменено', 'info');
				
				// Обновляем иконку способности (возвращаем активное состояние)
				if (window.boardModule && window.boardModule.updateAbilityAvailability) {
					window.boardModule.updateAbilityAvailability(gameState);
				}
			});
			
			document.body.appendChild(cancelBtn);
			this._cancelBtn = cancelBtn;
		},
		
		removeMonsterCancelButton: function() {
			if (this._cancelBtn && this._cancelBtn.parentNode) {
				this._cancelBtn.remove();
				this._cancelBtn = null;
			}
			const btn = document.getElementById('abilityCancelBtn');
			if (btn) btn.remove();
		},
		
		boostCard: function(card, amount) {
			if (window.gameModule && window.gameModule.applyCardBoost) {
				window.gameModule.applyCardBoost(card, amount);
				return;
			}
			
			if (card.baseStrength === undefined) card.baseStrength = card.strength;
			if (card.originalStrength === undefined) card.originalStrength = card.strength;
			if (card.modifiedStrength === undefined) card.modifiedStrength = card.strength;
			
			card.modifiedStrength += amount;
			card.currentStrength = card.modifiedStrength;
			card.strength = card.currentStrength;
			card._displayStrength = card.currentStrength;
		}
	},

	'skellige_ability_1': {
		name: 'Безрассудная ярость',
		description: 'Случайным образом распределите 4 ед. урона между всеми вражескими отрядами',
		execute: function(gameState, gameModule) {
			// Собираем все вражеские отряды на поле (не герои)
			const enemyUnits = [];
			const rows = ['close', 'ranged', 'siege'];
			
			rows.forEach(row => {
				gameState.opponent.rows[row].cards.forEach((card, index) => {
					if (card.type === 'unit') {
						// Пропускаем героев
						if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
						// Пропускаем уже уничтоженные
						if (card.strength <= 0) return;
						enemyUnits.push({ card: card, row: row, index: index });
					}
				});
			});
			
			if (enemyUnits.length === 0) {
				gameModule.showGameMessage('Нет вражеских отрядов для атаки', 'warning');
				return false;
			}
			
			// Сохраняем состояние для анимации
			this._gameState = gameState;
			this._gameModule = gameModule;
			
			// === РАСПРЕДЕЛЯЕМ УРОН ===
			let remainingDamage = 4;
			const unitsToDestroy = [];
			const damagedUnits = [];
			
			// Если отрядов больше 5 - выбираем 4 случайных
			let targets = [...enemyUnits];
			if (targets.length > 5) {
				// Перемешиваем и берем первые 4
				for (let i = targets.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[targets[i], targets[j]] = [targets[j], targets[i]];
				}
				targets = targets.slice(0, 4);
			}
			
			// Рассчитываем урон для каждого
			const totalTargets = targets.length;
			let damagePerUnit = Math.floor(remainingDamage / totalTargets);
			let extraDamage = remainingDamage % totalTargets;
			
			// Если отряд всего 1 - наносим весь урон ему
			if (totalTargets === 1) {
				damagePerUnit = remainingDamage;
				extraDamage = 0;
			}
			
			// Наносим урон
			targets.forEach((target, index) => {
				let damage = damagePerUnit;
				if (extraDamage > 0) {
					damage += 1;
					extraDamage--;
				}
				
				// Сохраняем для анимации
				damagedUnits.push({ card: target.card, row: target.row, damage: damage });
				
				this.dealDamage(target.card, damage);
				
				// Обновляем отображение силы на карте
				gameModule.updateCardStrengthDisplay(target.card, target.row, 'opponent');
				
				if (target.card.modifiedStrength <= 0) {
					unitsToDestroy.push({ card: target.card, row: target.row });
				}
			});
			
			// === АНИМАЦИЯ УРОНА ТОЛЬКО ДЛЯ ПОЛУЧИВШИХ УРОН ===
			// Убеждаемся, что урон был нанесён (damage > 0)
			damagedUnits.forEach(item => {
				if (item.damage > 0) {
					this.createDamageVisualEffect(item.card, item.row, gameModule, item.damage);
				}
			});
			
			// Уничтожаем уничтоженные карты (с задержкой после анимации)
			setTimeout(() => {
				unitsToDestroy.forEach(unit => {
					this.destroyCard(gameState, unit.card, unit.row, gameModule);
				});
			}, 600);
			
			gameState.player.abilityUsedThisRound = true;
			
			// Обновляем все ряды
			rows.forEach(row => {
				gameModule.updateRowStrength(row, 'opponent');
			});
			gameModule.updateTotalScoreDisplays();
			
			// Показываем только карты, которые получили урон
			const damageInfo = damagedUnits
				.filter(item => item.damage > 0)
				.map(item => `${item.card.name} (-${item.damage})`)
				.join(', ');
			
			if (damageInfo) {
				gameModule.showGameMessage(`Способность "${this.name}" активирована! Нанесён урон: ${damageInfo}`, 'info');
			} else {
				gameModule.showGameMessage(`Способность "${this.name}" активирована!`, 'info');
			}
			audioManager.playSound('card_damage');
			
			return true;
		},
		
		// ===== МЕТОД АНИМАЦИИ УРОНА =====
		createDamageVisualEffect: function(card, row, gameModule, damageAmount) {
			const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
			if (!rowElement) return;
			
			// Ищем элемент карты на доске
			let cardElement = null;
			
			if (card.uniqueId) {
				cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			}
			
			if (!cardElement) {
				const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
				if (elements.length === 1) {
					cardElement = elements[0];
				} else if (elements.length > 1) {
					const rowState = this._gameState.opponent.rows[row];
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
			
			// Если не нашли по селекторам, пробуем найти по позиции
			if (!cardElement) {
				const allCards = rowElement.querySelectorAll('.board-card');
				const rowState = this._gameState.opponent.rows[row];
				const position = rowState.cards.findIndex(c => 
					c.id === card.id && c.uniqueId === card.uniqueId
				);
				if (position !== -1 && allCards[position]) {
					cardElement = allCards[position];
				}
			}
			
			if (!cardElement) return;
			
			// Создаём элемент с анимацией урона (красный)
			const damageOverlay = document.createElement('div');
			damageOverlay.className = 'card-damage-overlay';
			damageOverlay.textContent = `-${damageAmount}`;
			damageOverlay.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #ff1744;
				font-size: 36px;
				font-weight: bold;
				text-shadow: 0 0 20px rgba(255, 23, 68, 0.9), 0 0 40px rgba(255, 0, 0, 0.6);
				z-index: 100;
				pointer-events: none;
				animation: leaderBoostAnimation 1.2s ease-out forwards;
				font-family: 'Gwent', sans-serif;
				letter-spacing: 2px;
			`;
			
			// Добавляем красное свечение на карту
			cardElement.style.boxShadow = '0 0 20px 8px rgba(255, 0, 0, 0.5)';
			cardElement.style.transition = 'box-shadow 0.5s ease-out';
			cardElement.style.zIndex = '10';
			
			cardElement.appendChild(damageOverlay);
			
			// Удаляем эффект через 1.2 секунды
			setTimeout(() => {
				if (damageOverlay.parentNode) {
					damageOverlay.remove();
				}
				cardElement.style.boxShadow = '';
				cardElement.style.zIndex = '';
			}, 1200);
		},
		
		dealDamage: function(card, amount) {
			if (window.gameModule && window.gameModule.applyCardDamage) {
				window.gameModule.applyCardDamage(card, amount);
				return;
			}
			
			if (card.baseStrength === undefined) card.baseStrength = card.strength;
			if (card.originalStrength === undefined) card.originalStrength = card.strength;
			if (card.modifiedStrength === undefined) card.modifiedStrength = card.strength;
			
			card.modifiedStrength = Math.max(0, card.modifiedStrength - amount);
			card.currentStrength = card.modifiedStrength;
			card.strength = card.currentStrength;
			card._displayStrength = card.currentStrength;
		},
		
		destroyCard: function(gameState, card, row, gameModule) {
			const rowCards = gameState.opponent.rows[row].cards;
			let cardIndex = -1;
			
			if (card.uniqueId !== undefined) {
				cardIndex = rowCards.findIndex(c => c.uniqueId === card.uniqueId);
			}
			if (cardIndex === -1) {
				cardIndex = rowCards.indexOf(card);
			}
			if (cardIndex === -1) {
				const sameId = rowCards
					.map((c, index) => ({ c, index }))
					.filter(entry => entry.c.id === card.id);
				if (sameId.length === 1) {
					cardIndex = sameId[0].index;
				}
			}
			
			if (cardIndex !== -1) {
				const destroyedCard = rowCards.splice(cardIndex, 1)[0];
				gameModule.addCardToDiscard(destroyedCard, 'opponent');
				gameModule.redrawRow(row, 'opponent');
				gameModule.updateRowStrength(row, 'opponent');
				audioManager.playSound('card_destroy');
			}
		}
	},
	'skellige_ability_2': {
		name: 'Гнев моря',
		description: 'Создайте эффект дождя только в осадном ряду противника',
		execute: function(gameState, gameModule) {
			const row = 'siege';
			this.applyRainToOpponentRow(gameState, row, gameModule);
			return true;
		},
		
		applyRainToOpponentRow: function(gameState, row, gameModule) {
			// Убираем существующие эффекты погоды в этом ряду у противника
			if (gameState.weather.effects[row]) {
				this.removeWeatherFromOpponentRow(gameState, row, gameModule);
			}
			
			// Применяем дождь ТОЛЬКО к ряду противника
			gameState.weather.effects[row] = {
				card: { name: 'Проливной дождь', type: 'special', faction: 'skellige' },
				image: 'board/rain.png',
				sound: 'rain',
				onlyOpponent: true
			};
			
			// Применяем визуальный эффект ТОЛЬКО на ряд противника
			this.applyVisualWeatherToOpponentRow(row, 'board/rain.png', gameModule);
			gameModule.playWeatherSound('rain');
			
			// Уменьшаем силу отрядов противника в этом ряду до 1
			if (gameModule && gameModule.reduceRowStrengthTo1) {
				gameModule.reduceRowStrengthTo1(row, 'opponent');
			} else {
				gameState.opponent.rows[row].cards.forEach(card => {
					if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
					
					if (card.baseStrength === undefined) card.baseStrength = card.strength || 0;
					if (card.originalStrength === undefined) card.originalStrength = card.strength || 0;
					
					if (!card.underWeather || typeof card._preWeatherStrength !== 'number') {
						card._preWeatherStrength = card.modifiedStrength !== undefined
							? card.modifiedStrength
							: (card.baseStrength || card.strength || 0);
					}
					card.underWeather = true;
					card.modifiedStrength = Math.min(1, card._preWeatherStrength);
					card.currentStrength = card.modifiedStrength;
					card.strength = card.currentStrength;
				});
			}
			
			gameModule.updateRowStrength(row, 'opponent');
			gameModule.updateTotalScoreDisplays();
			
			gameState.player.abilityUsedThisRound = true;
			gameModule.showGameMessage(`Способность "${this.name}" активирована! Дождь в осадном ряду противника.`, 'info');
			audioManager.playSound('weather');
		},
		
		applyVisualWeatherToOpponentRow: function(row, image, gameModule) {
			const opponentRowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
			if (opponentRowElement) {
				// Оверлей накрывает весь ряд, включая слот тактики
				const rowContainer = opponentRowElement.closest('.battle-row') || opponentRowElement;
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
				weatherOverlay.dataset.weatherSide = 'opponent';
				rowContainer.style.position = 'relative';
				rowContainer.appendChild(weatherOverlay);
			}
		},
		
		removeWeatherFromOpponentRow: function(gameState, row, gameModule) {
			const opponentEffects = document.querySelectorAll(`[data-weather-row="${row}"][data-weather-side="opponent"]`);
			opponentEffects.forEach(effect => effect.remove());
			
			if (gameState && gameState.opponent && gameState.opponent.rows[row]) {
				gameState.opponent.rows[row].cards.forEach(card => {
					if (card.underWeather) {
						if (gameModule && gameModule.restoreCardFromWeather) {
							gameModule.restoreCardFromWeather(card);
						} else {
							card.underWeather = false;

							if (gameModule && gameModule.refreshCardStrength) {
								gameModule.refreshCardStrength(card);
							} else if (card.modifiedStrength !== undefined) {
								card.strength = card.modifiedStrength;
								card.currentStrength = card.modifiedStrength;
							}
						}
					}
				});
				if (gameModule) gameModule.updateRowStrength(row, 'opponent');
			}
			
			if (gameState) gameState.weather.effects[row] = null;
		}
	},
	'skellige_ability_3': {
		name: 'Натиск',
		description: 'Нанесите 3 ед. урона вражескому отряду',
		execute: function(gameState, gameModule) {
			// Сохраняем состояние для анимации и отмены
			this._gameState = gameState;
			this._gameModule = gameModule;
			this._damageAmount = 3;
			
			this.showTargetSelection(gameState, gameModule);
			return true;
		},
		
		showTargetSelection: function(gameState, gameModule) {
			const rows = ['close', 'ranged', 'siege'];
			this._clickHandlers = [];
			
			const clickHandler = (target) => {
				return (event) => {
					// Проверяем, что цель все еще существует на поле
					const stillExists = gameState.opponent.rows[target.row].cards.some(
						c => c.uniqueId === target.card.uniqueId && c.type === 'unit'
					);
					
					if (!stillExists) {
						gameModule.showGameMessage('Эта карта уже не на поле', 'warning');
						this.removeHighlights();
						return;
					}
					
					if (target.card.tags && (target.card.tags.includes('hero') || target.card.tags.includes('герой'))) {
						gameModule.showGameMessage('Нельзя нанести урон Герою!', 'warning');
						this.removeHighlights();
						return;
					}
					
					// Сохраняем карту до нанесения урона для анимации
					const cardCopy = { card: target.card, row: target.row };
					
					this.dealDamage(target.card, this._damageAmount);
					gameState.player.abilityUsedThisRound = true;
					
					// === АНИМАЦИЯ УРОНА -3 (как в scoiatael_ability_3) ===
					this.createDamageVisualEffect(cardCopy.card, cardCopy.row, gameModule);
					
					gameModule.updateRowStrength(target.row, 'opponent');
					gameModule.updateTotalScoreDisplays();
					
					if (target.card.modifiedStrength <= 0) {
						this.destroyCard(gameState, target.card, target.row, gameModule);
					}
					
					gameModule.showGameMessage(`Способность "${this.name}" активирована! Нанесён ${this._damageAmount} урон ${target.card.name}.`, 'info');
					audioManager.playSound('card_damage');
					
					this.removeHighlights();
				};
			};
			
			this.highlightEnemyUnits(gameState, rows, clickHandler);
		},
		
		highlightEnemyUnits: function(gameState, rows, clickHandler) {
			for (const row of rows) {
				const rowElement = document.getElementById(`opponent${this._gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(cardElement => {
					const cardId = cardElement.dataset.cardId;
					const uniqueId = cardElement.dataset.uniqueId;
					
					// Ищем цель среди вражеских отрядов
					let target = null;
					for (const r of rows) {
						const found = gameState.opponent.rows[r].cards.find(c => 
							(c.id === cardId || c.uniqueId === uniqueId) && c.type === 'unit'
						);
						if (found) {
							target = { card: found, row: r };
							break;
						}
					}
					
					if (target) {
						// Пропускаем героев
						if (target.card.tags && (target.card.tags.includes('hero') || target.card.tags.includes('герой'))) return;
						
						cardElement.style.cursor = 'pointer';
						cardElement.style.filter = 'brightness(1.2) drop-shadow(0 0 8px #ff4444)';
						cardElement.style.transition = 'all 0.2s ease';
						cardElement.dataset.row = row;
						
						const handler = clickHandler(target);
						cardElement.addEventListener('click', handler);
						this._clickHandlers.push({ element: cardElement, handler: handler });
						
						cardElement.addEventListener('mouseenter', () => {
							cardElement.style.transform = 'scale(1.05)';
						});
						cardElement.addEventListener('mouseleave', () => {
							cardElement.style.transform = 'scale(1)';
						});
					}
				});
			}
			this.showCancelButton(gameState);
		},
		
		// ===== АНИМАЦИЯ УРОНА -3 (как в scoiatael_ability_3) =====
		createDamageVisualEffect: function(card, row, gameModule) {
			const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
			if (!rowElement) return;
			
			// Ищем элемент карты на доске
			let cardElement = null;
			
			if (card.uniqueId) {
				cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			}
			
			if (!cardElement) {
				const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
				if (elements.length === 1) {
					cardElement = elements[0];
				} else if (elements.length > 1) {
					const rowState = this._gameState.opponent.rows[row];
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
			
			// Если не нашли по селекторам, пробуем найти по позиции
			if (!cardElement) {
				const allCards = rowElement.querySelectorAll('.board-card');
				const rowState = this._gameState.opponent.rows[row];
				const position = rowState.cards.findIndex(c => 
					c.id === card.id && c.uniqueId === card.uniqueId
				);
				if (position !== -1 && allCards[position]) {
					cardElement = allCards[position];
				}
			}
			
			if (!cardElement) return;
			
			// Создаём элемент с анимацией -3 (красный)
			const damageOverlay = document.createElement('div');
			damageOverlay.className = 'card-damage-overlay';
			damageOverlay.textContent = '-3';
			damageOverlay.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #ff1744;
				font-size: 36px;
				font-weight: bold;
				text-shadow: 0 0 20px rgba(255, 23, 68, 0.9), 0 0 40px rgba(255, 0, 0, 0.6);
				z-index: 100;
				pointer-events: none;
				animation: leaderBoostAnimation 1.2s ease-out forwards;
				font-family: 'Gwent', sans-serif;
				letter-spacing: 2px;
			`;
			
			// Добавляем красное свечение на карту
			cardElement.style.boxShadow = '0 0 20px 8px rgba(255, 0, 0, 0.5)';
			cardElement.style.transition = 'box-shadow 0.5s ease-out';
			
			cardElement.appendChild(damageOverlay);
			
			// Удаляем эффект через 1.2 секунды
			setTimeout(() => {
				if (damageOverlay.parentNode) {
					damageOverlay.remove();
				}
				cardElement.style.boxShadow = '';
			}, 1200);
		},
		
		removeHighlights: function() {
			const rows = ['close', 'ranged', 'siege'];
			for (const row of rows) {
				const rowElement = document.getElementById(`opponent${this._gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(card => {
					card.style.cursor = '';
					card.style.filter = '';
					card.style.transform = '';
					card.style.boxShadow = '';
				});
			}
			
			// Удаляем обработчики кликов
			if (this._clickHandlers) {
				this._clickHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('click', handler);
				});
				this._clickHandlers = [];
			}
			
			this.removeCancelButton();
		},
		
		showCancelButton: function(gameState) {
			const existingBtn = document.getElementById('abilityCancelBtn');
			if (existingBtn) existingBtn.remove();
			
			const cancelBtn = document.createElement('button');
			cancelBtn.id = 'abilityCancelBtn';
			cancelBtn.textContent = 'ОТМЕНА';
			cancelBtn.className = 'ability-cancel-btn';
			cancelBtn.style.cssText = `
				position: fixed;
				bottom: 30px;
				left: 50%;
				transform: translateX(-50%);
				background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
				color: #d4af37;
				border: 2px solid #d4af37;
				padding: 12px 35px;
				border-radius: 8px;
				cursor: pointer;
				font-weight: bold;
				font-family: 'Gwent', sans-serif;
				font-size: 16px;
				text-transform: uppercase;
				letter-spacing: 2px;
				z-index: 10050;
				transition: all 0.3s ease;
				box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
			`;
			
			cancelBtn.addEventListener('mouseenter', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1.05)';
				cancelBtn.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)';
				audioManager.playSound('touch');
			});
			
			cancelBtn.addEventListener('mouseleave', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1)';
				cancelBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
			});
			
			cancelBtn.addEventListener('click', () => {
				// === ВАЖНО: СБРАСЫВАЕМ ФЛАГ ИСПОЛЬЗОВАНИЯ ===
				if (gameState) {
					gameState.player.abilityUsedThisRound = false;
				}
				
				this.removeHighlights();
				audioManager.playSound('button');
				this._gameModule.showGameMessage('Использование способности отменено', 'info');
				
				// === ОБНОВЛЯЕМ ИКОНКУ СПОСОБНОСТИ ===
				if (window.boardModule && window.boardModule.updateAbilityAvailability) {
					window.boardModule.updateAbilityAvailability(gameState);
				}
			});
			
			document.body.appendChild(cancelBtn);
			this._cancelBtn = cancelBtn;
		},
		
		removeCancelButton: function() {
			if (this._cancelBtn && this._cancelBtn.parentNode) {
				this._cancelBtn.remove();
				this._cancelBtn = null;
			}
			const btn = document.getElementById('abilityCancelBtn');
			if (btn) btn.remove();
		},
		
		dealDamage: function(card, amount) {
			if (window.gameModule && window.gameModule.applyCardDamage) {
				window.gameModule.applyCardDamage(card, amount);
				return;
			}
			
			if (card.baseStrength === undefined) card.baseStrength = card.strength;
			if (card.originalStrength === undefined) card.originalStrength = card.strength;
			if (card.modifiedStrength === undefined) card.modifiedStrength = card.strength;
			
			card.modifiedStrength = Math.max(0, card.modifiedStrength - amount);
			card.currentStrength = card.modifiedStrength;
			card.strength = card.currentStrength;
			card._displayStrength = card.currentStrength;
		},
		
		destroyCard: function(gameState, card, row, gameModule) {
			const rowCards = gameState.opponent.rows[row].cards;
			let cardIndex = -1;
			
			if (card.uniqueId !== undefined) {
				cardIndex = rowCards.findIndex(c => c.uniqueId === card.uniqueId);
			}
			if (cardIndex === -1) {
				cardIndex = rowCards.indexOf(card);
			}
			if (cardIndex === -1) {
				// Последний вариант — ищем по id, но только если карта одна
				const sameId = rowCards
					.map((c, index) => ({ c, index }))
					.filter(entry => entry.c.id === card.id);
				if (sameId.length === 1) {
					cardIndex = sameId[0].index;
				}
			}
			
			if (cardIndex !== -1) {
				const destroyedCard = rowCards.splice(cardIndex, 1)[0];
				gameModule.addCardToDiscard(destroyedCard, 'opponent');
				gameModule.redrawRow(row, 'opponent');
				gameModule.updateRowStrength(row, 'opponent');
				audioManager.playSound('card_destroy');
			}
		},
		
		getRowName: function(row) {
			const names = {
				'close': 'Ближний бой',
				'ranged': 'Дальний бой',
				'siege': 'Осадный'
			};
			return names[row] || row;
		}
	},
	'skellige_ability_4': {
		name: 'Медвежий ритуал',
		description: 'Нанесите 1 ед. урона дружественному отряду. И призовите Берсерка из колоды',
		execute: function(gameState, gameModule) {
			const friendlyUnits = [];
			const rows = ['close', 'ranged', 'siege'];
			
			rows.forEach(row => {
				gameState.player.rows[row].cards.forEach((card, index) => {
					if (card.type === 'unit') {
						if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
						const currentStrength = card.currentStrength !== undefined ? 
							card.currentStrength : (card.strength || 0);
						if (currentStrength <= 0) return;
						if (!card.uniqueId) {
							card.uniqueId = `${card.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
						}
						friendlyUnits.push({ 
							card: card, 
							row: row, 
							index: index,
							uniqueId: card.uniqueId 
						});
					}
				});
			});
			
			if (friendlyUnits.length === 0) {
				gameModule.showGameMessage('Нет дружественных отрядов для ритуала', 'warning');
				return false;
			}
			
			this._gameState = gameState;
			this._gameModule = gameModule;
			
			this.showRitualSelection(friendlyUnits, gameState, gameModule);
			return true;
		},
		
		showRitualSelection: function(friendlyUnits, gameState, gameModule) {
			const rows = ['close', 'ranged', 'siege'];
			this._clickHandlers = [];
			this._mouseEnterHandlers = [];
			this._mouseLeaveHandlers = [];
			
			const clickHandler = (event) => {
				const cardElement = event.currentTarget;
				const uniqueId = cardElement.dataset.uniqueId;
				const row = cardElement.dataset.row;
				
				let targetCard = null;
				for (const r of rows) {
					const card = gameState.player.rows[r].cards.find(c => 
						c.uniqueId === uniqueId
					);
					if (card) {
						targetCard = card;
						break;
					}
				}
				
				if (targetCard) {
					if (targetCard.tags && (targetCard.tags.includes('hero') || targetCard.tags.includes('герой'))) {
						gameModule.showGameMessage('Нельзя нанести урон Герою!', 'warning');
						this.removeHighlights();
						return;
					}
					
					if (targetCard.type !== 'unit') {
						gameModule.showGameMessage('Можно выбрать только отряды!', 'warning');
						this.removeHighlights();
						return;
					}
					
					// ===== ПОКАЗЫВАЕМ АНИМАЦИЮ УРОНА =====
					this.createDamageVisualEffect(targetCard, row, gameModule);
					
					// Наносим урон с задержкой
					setTimeout(() => {
						this.dealDamage(targetCard, 1);
						gameModule.updateCardStrengthDisplay(targetCard, row, 'player');
						gameModule.updateRowStrength(row, 'player');
						
						if (targetCard.modifiedStrength <= 0) {
							this.destroyCard(gameState, targetCard, row, gameModule);
						}
						
						// Ищем Берсерка в колоде
						let berserkerIndex = -1;
						let berserkerCard = null;
						for (let i = 0; i < gameState.player.deck.length; i++) {
							const card = gameState.player.deck[i];
							if (card.name === 'Берсерк' || 
								card.name === 'Berserker' ||
								(card.tags && card.tags.includes('berserker'))) {
								berserkerIndex = i;
								berserkerCard = card;
								break;
							}
						}
						
						if (berserkerCard) {
							gameState.player.deck.splice(berserkerIndex, 1);
							
							let targetRow = null;
							for (const r of rows) {
								if (gameState.player.rows[r].cards.length < 9) {
									targetRow = r;
									break;
								}
							}
							
							if (targetRow) {
								berserkerCard.owner = 'player';
								berserkerCard.row = targetRow;
								berserkerCard.uniqueId = `berserker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
								gameState.player.rows[targetRow].cards.push(berserkerCard);
								gameModule.displayCardOnRow(targetRow, berserkerCard, 'player');
								gameModule.updateRowStrength(targetRow, 'player');
								gameModule.updateCardStrengthDisplay(berserkerCard, targetRow, 'player');
								gameModule.showGameMessage(`Берсерк призван из колоды в ряд ${this.getRowName(targetRow)}!`, 'info');
							} else {
								gameState.player.hand.push(berserkerCard);
								gameModule.displayPlayerHand();
								gameModule.showGameMessage(`Нет места на поле! Берсерк добавлен в руку.`, 'info');
							}
							audioManager.playSound('summon');
						} else {
							gameModule.showGameMessage('В колоде нет Берсерка!', 'warning');
						}
						
						gameState.player.abilityUsedThisRound = true;
						gameModule.updateTotalScoreDisplays();
						gameModule.showGameMessage(`Способность "${this.name}" активирована!`, 'info');
						audioManager.playSound('card_damage');
						
						if (window.boardModule && window.boardModule.updateAbilityAvailability) {
							window.boardModule.updateAbilityAvailability(gameState);
						}
					}, 500);
				}
				
				this.removeHighlights();
			};
			
			for (const row of rows) {
				const rowElement = document.getElementById(`player${gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(card => {
					const uniqueId = card.dataset.uniqueId;
					const target = friendlyUnits.find(u => u.uniqueId === uniqueId);
					
					if (target) {
						if (target.card.type !== 'unit') return;
						if (target.card.tags && (target.card.tags.includes('hero') || target.card.tags.includes('герой'))) return;
						
						card.style.cursor = 'pointer';
						card.style.filter = 'brightness(1.2) drop-shadow(0 0 8px #ff9800)';
						card.style.transition = 'all 0.2s ease';
						card.dataset.row = row;
						card.dataset.uniqueId = target.uniqueId;
						
						const handler = clickHandler;
						card.addEventListener('click', handler);
						this._clickHandlers.push({ element: card, handler: handler });
						
						const mouseEnterHandler = () => {
							card.style.transform = 'scale(1.05)';
						};
						const mouseLeaveHandler = () => {
							card.style.transform = 'scale(1)';
						};
						
						card.addEventListener('mouseenter', mouseEnterHandler);
						card.addEventListener('mouseleave', mouseLeaveHandler);
						
						this._mouseEnterHandlers.push({ element: card, handler: mouseEnterHandler });
						this._mouseLeaveHandlers.push({ element: card, handler: mouseLeaveHandler });
					}
				});
			}
			this.showCancelButton(gameState, gameModule);
		},
		
		// ===== ИСПРАВЛЕННЫЙ МЕТОД АНИМАЦИИ УРОНА =====
		createDamageVisualEffect: function(card, row, gameModule) {
			const rowElement = document.getElementById(`player${gameModule.capitalizeFirst(row)}Row`);
			if (!rowElement) {
				console.warn('Row element not found for damage effect:', row);
				return;
			}
			
			// ===== ИЩЕМ ЭЛЕМЕНТ КАРТЫ =====
			let cardElement = null;
			
			// 1. Ищем по uniqueId
			if (card.uniqueId) {
				cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			}
			
			// 2. Если не нашли, ищем по data-card-id
			if (!cardElement) {
				const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
				if (elements.length === 1) {
					cardElement = elements[0];
				} else if (elements.length > 1) {
					// Если несколько копий, ищем по позиции в ряду
					const rowState = this._gameState.player.rows[row];
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
			
			// 3. Если всё ещё не нашли, пробуем найти по позиции
			if (!cardElement) {
				const allCards = rowElement.querySelectorAll('.board-card');
				const rowState = this._gameState.player.rows[row];
				const position = rowState.cards.findIndex(c => 
					c.uniqueId === card.uniqueId
				);
				if (position !== -1 && allCards[position]) {
					cardElement = allCards[position];
				}
			}
			
			if (!cardElement) {
				console.warn('Card element not found for damage effect:', card.name, card.id, card.uniqueId);
				return;
			}
			
			// ===== ПОКАЗЫВАЕМ АНИМАЦИЮ УРОНА =====
			// Создаём оверлей с анимацией -1
			const damageOverlay = document.createElement('div');
			damageOverlay.className = 'card-damage-overlay';
			damageOverlay.textContent = '-1';
			damageOverlay.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #ff1744;
				font-size: 48px;
				font-weight: bold;
				text-shadow: 0 0 30px rgba(255, 23, 68, 0.9), 0 0 60px rgba(255, 0, 0, 0.6);
				z-index: 100;
				pointer-events: none;
				animation: leaderDamageAnimation 1s ease-out forwards;
				font-family: 'Gwent', sans-serif;
				letter-spacing: 2px;
			`;
			
			// Добавляем красное свечение на карту
			cardElement.style.boxShadow = '0 0 30px 15px rgba(255, 0, 0, 0.6)';
			cardElement.style.transition = 'box-shadow 0.3s ease-out';
			cardElement.style.zIndex = '10';
			
			cardElement.appendChild(damageOverlay);
			
			// Удаляем эффект через 1 секунду
			setTimeout(() => {
				if (damageOverlay.parentNode) {
					damageOverlay.remove();
				}
				cardElement.style.boxShadow = '';
				cardElement.style.zIndex = '';
			}, 1000);
		},
		
		dealDamage: function(card, amount) {
			if (window.gameModule && window.gameModule.applyCardDamage) {
				window.gameModule.applyCardDamage(card, amount);
				return;
			}
			
			if (card.baseStrength === undefined) card.baseStrength = card.strength;
			if (card.originalStrength === undefined) card.originalStrength = card.strength;
			if (card.modifiedStrength === undefined) card.modifiedStrength = card.strength;
			
			card.modifiedStrength = Math.max(0, card.modifiedStrength - amount);
			card.currentStrength = card.modifiedStrength;
			card.strength = card.currentStrength;
			card._displayStrength = card.currentStrength;
		},
		
		destroyCard: function(gameState, card, row, gameModule) {
			const rowCards = gameState.player.rows[row].cards;
			let cardIndex = -1;
			if (card.uniqueId) {
				cardIndex = rowCards.findIndex(c => c.uniqueId === card.uniqueId);
			}
			if (cardIndex === -1) {
				cardIndex = rowCards.findIndex(c => c.id === card.id);
			}
			if (cardIndex !== -1) {
				const destroyedCard = rowCards.splice(cardIndex, 1)[0];
				gameModule.addCardToDiscard(destroyedCard, 'player');
				gameModule.redrawRow(row, 'player');
				gameModule.updateRowStrength(row, 'player');
				audioManager.playSound('card_destroy');
			}
		},
		
		removeHighlights: function() {
			const rows = ['close', 'ranged', 'siege'];
			for (const row of rows) {
				const rowElement = document.getElementById(`player${this._gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(card => {
					card.style.cursor = '';
					card.style.filter = '';
					card.style.transform = '';
					card.style.boxShadow = '';
					card.style.zIndex = '';
				});
			}
			
			if (this._clickHandlers) {
				this._clickHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('click', handler);
				});
				this._clickHandlers = [];
			}
			
			if (this._mouseEnterHandlers) {
				this._mouseEnterHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('mouseenter', handler);
				});
				this._mouseEnterHandlers = [];
			}
			
			if (this._mouseLeaveHandlers) {
				this._mouseLeaveHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('mouseleave', handler);
				});
				this._mouseLeaveHandlers = [];
			}
			
			this.removeCancelButton();
		},
		
		showCancelButton: function(gameState, gameModule) {
			const existingBtn = document.getElementById('abilityCancelBtn');
			if (existingBtn) existingBtn.remove();
			
			const cancelBtn = document.createElement('button');
			cancelBtn.id = 'abilityCancelBtn';
			cancelBtn.textContent = 'ОТМЕНА';
			cancelBtn.className = 'ability-cancel-btn';
			cancelBtn.style.cssText = `
				position: fixed;
				bottom: 30px;
				left: 50%;
				transform: translateX(-50%);
				background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
				color: #d4af37;
				border: 2px solid #d4af37;
				padding: 12px 35px;
				border-radius: 8px;
				cursor: pointer;
				font-weight: bold;
				font-family: 'Gwent', sans-serif;
				font-size: 16px;
				text-transform: uppercase;
				letter-spacing: 2px;
				z-index: 10050;
				transition: all 0.3s ease;
				box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
			`;
			
			cancelBtn.addEventListener('mouseenter', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1.05)';
				cancelBtn.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)';
				audioManager.playSound('touch');
			});
			
			cancelBtn.addEventListener('mouseleave', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1)';
				cancelBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
			});
			
			cancelBtn.addEventListener('click', () => {
				if (gameState) {
					gameState.player.abilityUsedThisRound = false;
				}
				
				this.removeHighlights();
				this.removeCancelButton();
				
				audioManager.playSound('button');
				gameModule.showGameMessage('Использование способности отменено', 'info');
				
				if (window.boardModule && window.boardModule.updateAbilityAvailability) {
					window.boardModule.updateAbilityAvailability(gameState);
				}
			});
			
			document.body.appendChild(cancelBtn);
			this._cancelBtn = cancelBtn;
		},
		
		removeCancelButton: function() {
			if (this._cancelBtn && this._cancelBtn.parentNode) {
				this._cancelBtn.remove();
				this._cancelBtn = null;
			}
			const btn = document.getElementById('abilityCancelBtn');
			if (btn) btn.remove();
		},
		
		getRowName: function(row) {
			const names = { 'close': 'ближнего боя', 'ranged': 'дальнего боя', 'siege': 'осадном' };
			return names[row] || row;
		}
	},
	'skellige_ability_5': {
		name: 'Пламя славы',
		description: 'Переместите не нейтральный отряд из вашей колоды в ваш сброс, затем нанесите вражескому отряду урон, равный значению силы перемещенного отряда',
		execute: async function(gameState, gameModule) {
			// 1. Выбор карты из колоды через модальное окно
			const factionUnits = [];
			gameState.player.deck.forEach((card, index) => {
				if (card.type === 'unit' && card.faction !== 'neutral') {
					factionUnits.push({ card: card, index: index });
				}
			});
			
			if (factionUnits.length === 0) {
				gameModule.showGameMessage('Нет не нейтральных отрядов в колоде', 'warning');
				return false;
			}
			
			const selectedUnit = await this.showDeckSelectionModal(factionUnits, gameModule);
			if (!selectedUnit) return false;
			
			const sacrificedStrength = selectedUnit.card.strength || 0;
			
			// 2. Перемещаем в сброс
			gameState.player.deck.splice(selectedUnit.index, 1);
			gameModule.addCardToDiscard(selectedUnit.card, 'player');
			gameModule.displayPlayerDeck();
			gameModule.displayPlayerDiscard();
			gameModule.showGameMessage(`Отряд "${selectedUnit.card.name}" отправлен в сброс (сила ${sacrificedStrength})`, 'info');
			audioManager.playSound('cardRemove');
			
			// 3. Выбор цели для урона
			const enemyUnits = [];
			const rows = ['close', 'ranged', 'siege'];
			
			rows.forEach(row => {
				gameState.opponent.rows[row].cards.forEach(card => {
					if (card.type === 'unit') {
						if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
						enemyUnits.push({ card: card, row: row });
					}
				});
			});
			
			if (enemyUnits.length === 0) {
				gameModule.showGameMessage('Нет вражеских отрядов для атаки', 'warning');
				gameState.player.abilityUsedThisRound = true;
				return false;
			}
			
			const target = await this.showDamageTargetSelection(enemyUnits, sacrificedStrength, gameModule);
			if (!target) return false;
			
			this.dealDamage(target.card, sacrificedStrength);
			
			if (target.card.modifiedStrength <= 0) {
				this.destroyCard(gameState, target.card, target.row, gameModule);
			}
			
			gameState.player.abilityUsedThisRound = true;
			
			gameModule.updateRowStrength(target.row, 'opponent');
			gameModule.updateTotalScoreDisplays();
			gameModule.showGameMessage(`Способность "${this.name}" активирована! Нанесён ${sacrificedStrength} урон ${target.card.name}.`, 'info');
			audioManager.playSound('card_damage');
			
			return true;
		},
		
		showDeckSelectionModal: function(cards, gameModule) {
			return new Promise((resolve) => {
				const playerFaction = (gameModule && gameModule.gameState && gameModule.gameState.player && gameModule.gameState.player.faction)
					|| (cards[0] && cards[0].card && cards[0].card.faction)
					|| 'neutral';
				const factionBackground = `faction/${playerFaction}/border_faction.png`;

				const modalOverlay = document.createElement('div');
				modalOverlay.className = 'deck-modal-overlay';
				modalOverlay.innerHTML = `
					<div class="deck-modal">
						<div class="deck-modal__header" style="background: url('${factionBackground}') center/cover;">
							<div class="deck-modal__title">ВЫБЕРИТЕ ОТРЯД ДЛЯ ЖЕРТВОПРИНОШЕНИЯ</div>
							<div class="deck-modal__count">${cards.length}</div>
						</div>
						<div class="deck-modal__content">
							${cards.map((item, idx) => `
								<div class="deck-card" data-card-index="${idx}">
									<div class="deck-card__container">
										<img src="card/${item.card.faction}/${item.card.imageStatic || item.card.image.replace('.mp4', '.jpg')}" 
											 class="deck-card__media" onerror="this.src='card/placeholder.jpg'">
										<img src="${item.card.border}" class="deck-card__border">
										<img src="${item.card.banner}" class="deck-card__banner">
										<div class="deck-card__name">${item.card.name}</div>
										<div class="deck-card__strength">${item.card.strength}</div>
									</div>
								</div>
							`).join('')}
						</div>
					</div>
				`;
				
				document.body.appendChild(modalOverlay);
				setTimeout(() => modalOverlay.classList.add('active'), 10);
				
				const cardElements = modalOverlay.querySelectorAll('.deck-card');
				cardElements.forEach(card => {
					card.addEventListener('click', () => {
						const index = parseInt(card.dataset.cardIndex);
						this.closeModal(modalOverlay);
						audioManager.playSound('button');
						resolve(cards[index]);
					});
					card.addEventListener('mouseenter', () => {
						card.style.transform = 'scale(1.05)';
						audioManager.playSound('touch');
					});
					card.addEventListener('mouseleave', () => {
						card.style.transform = 'scale(1)';
					});
				});
				
				modalOverlay.addEventListener('click', (e) => {
					if (e.target === modalOverlay) {
						this.closeModal(modalOverlay);
						resolve(null);
					}
				});
			});
		},
		
		showDamageTargetSelection: function(enemyUnits, damageAmount, gameModule) {
			return new Promise((resolve) => {
				const rows = ['close', 'ranged', 'siege'];
				
				const clickHandler = (target) => {
					return () => {
						this.removeDamageTargetHighlights();
						resolve(target);
					};
				};
				
				for (const row of rows) {
					const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
					if (!rowElement) continue;
					const cards = rowElement.querySelectorAll('.board-card');
					cards.forEach(card => {
						const cardId = card.dataset.cardId;
						const uniqueId = card.dataset.uniqueId;
						let target = null;
						if (uniqueId) {
							target = enemyUnits.find(u => u.card.uniqueId === uniqueId) || null;
						}
						if (!target) {
							target = enemyUnits.find(u => u.card.id === cardId) || null;
						}
						if (target) {
							card.style.cursor = 'pointer';
							card.classList.add('damage-target');
							card.addEventListener('click', clickHandler(target));
							card.addEventListener('mouseenter', () => {
								card.style.transform = 'scale(1.05)';
								card.style.filter = 'brightness(1.2) drop-shadow(0 0 8px #ff4444)';
							});
							card.addEventListener('mouseleave', () => {
								card.style.transform = 'scale(1)';
								card.style.filter = '';
							});
						}
					});
				}
				
				const cancelBtn = document.createElement('button');
				cancelBtn.textContent = 'ОТМЕНА';
				cancelBtn.className = 'ability-cancel-btn';
				cancelBtn.addEventListener('click', () => {
					this.removeDamageTargetHighlights();
					cancelBtn.remove();
					resolve(null);
					audioManager.playSound('button');
				});
				document.body.appendChild(cancelBtn);
			});
		},
		
		removeDamageTargetHighlights: function() {
			const rows = ['close', 'ranged', 'siege'];
			for (const row of rows) {
				const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(card => {
					card.style.cursor = '';
					card.classList.remove('damage-target');
					card.style.transform = '';
					card.style.filter = '';
					const newCard = card.cloneNode(true);
					card.parentNode.replaceChild(newCard, card);
				});
			}
			const btn = document.querySelector('.ability-cancel-btn');
			if (btn) btn.remove();
		},
		
		closeModal: function(modal) {
			modal.classList.remove('active');
			setTimeout(() => modal.remove(), 300);
		},
		
		dealDamage: function(card, amount) {
			if (window.gameModule && window.gameModule.applyCardDamage) {
				window.gameModule.applyCardDamage(card, amount);
				return;
			}
			
			if (card.baseStrength === undefined) card.baseStrength = card.strength;
			if (card.originalStrength === undefined) card.originalStrength = card.strength;
			if (card.modifiedStrength === undefined) card.modifiedStrength = card.strength;
			
			card.modifiedStrength = Math.max(0, card.modifiedStrength - amount);
			card.currentStrength = card.modifiedStrength;
			card.strength = card.currentStrength;
			card._displayStrength = card.currentStrength;
		},
		
		destroyCard: function(gameState, card, row, gameModule) {
			const rowCards = gameState.opponent.rows[row].cards;
			let cardIndex = -1;
			
			if (card.uniqueId !== undefined) {
				cardIndex = rowCards.findIndex(c => c.uniqueId === card.uniqueId);
			}
			if (cardIndex === -1) {
				cardIndex = rowCards.indexOf(card);
			}
			if (cardIndex === -1) {
				// Последний вариант — ищем по id, но только если карта одна
				const sameId = rowCards
					.map((c, index) => ({ c, index }))
					.filter(entry => entry.c.id === card.id);
				if (sameId.length === 1) {
					cardIndex = sameId[0].index;
				}
			}
			
			if (cardIndex !== -1) {
				const destroyedCard = rowCards.splice(cardIndex, 1)[0];
				gameModule.addCardToDiscard(destroyedCard, 'opponent');
				gameModule.redrawRow(row, 'opponent');
				gameModule.updateRowStrength(row, 'opponent');
				audioManager.playSound('card_destroy');
			}
		}
	},

	'syndicate_ability_1': {
		name: 'Заказ на убийство',
		description: 'Нанесите 6 ед. урона вражескому отряду',
		execute: function(gameState, gameModule) {
			// Сначала проверяем, есть ли вообще цели
			let hasTargets = false;
			const rows = ['close', 'ranged', 'siege'];
			
			rows.forEach(row => {
				gameState.opponent.rows[row].cards.forEach(card => {
					if (card.type === 'unit') {
						if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
						hasTargets = true;
					}
				});
			});
			
			// ===== ВАЖНО: ЕСЛИ НЕТ ЦЕЛЕЙ - ВОЗВРАЩАЕМ false, НЕ ПОМЕЧАЯ КАК ИСПОЛЬЗОВАННУЮ =====
			if (!hasTargets) {
				gameModule.showGameMessage('Нет вражеских отрядов для атаки', 'warning');
				return false;  // ← Возвращаем false, способность НЕ считается использованной
			}
			
			// Сохраняем состояние для анимации и отмены
			this._gameState = gameState;
			this._gameModule = gameModule;
			this._damageAmount = 6;
			
			this.showTargetSelection(gameState, gameModule);
			return true;
		},
		
		showTargetSelection: function(gameState, gameModule) {
			const enemyUnits = [];
			const rows = ['close', 'ranged', 'siege'];
			this._clickHandlers = [];
			
			rows.forEach(row => {
				gameState.opponent.rows[row].cards.forEach(card => {
					if (card.type === 'unit') {
						if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
						enemyUnits.push({ card: card, row: row });
					}
				});
			});
			
			if (enemyUnits.length === 0) {
				gameModule.showGameMessage('Нет вражеских отрядов для атаки', 'warning');
				return;
			}
			
			this.highlightEnemyUnits(enemyUnits, gameState, gameModule);
		},
		
		highlightEnemyUnits: function(enemyUnits, gameState, gameModule) {
			const rows = ['close', 'ranged', 'siege'];
			
			const clickHandler = (target) => {
				return (event) => {
					// Проверяем, что цель все еще существует на поле
					const stillExists = gameState.opponent.rows[target.row].cards.includes(target.card);
					
					if (!stillExists) {
						gameModule.showGameMessage('Эта карта уже не на поле', 'warning');
						this.removeHighlights();
						return;
					}
					
					// Проверяем героя
					if (target.card.tags && (target.card.tags.includes('hero') || target.card.tags.includes('герой'))) {
						gameModule.showGameMessage('Нельзя нанести урон Герою!', 'warning');
						this.removeHighlights();
						return;
					}
					
					// Сохраняем карту до нанесения урона для анимации
					const cardCopy = { card: target.card, row: target.row };
					
					this.dealDamage(target.card, this._damageAmount);
					gameState.player.abilityUsedThisRound = true;
					
					// === АНИМАЦИЯ УРОНА -6 (как в scoiatael_ability_3) ===
					this.createDamageVisualEffect(cardCopy.card, cardCopy.row, gameModule);
					
					gameModule.updateRowStrength(target.row, 'opponent');
					gameModule.updateTotalScoreDisplays();
					
					// Карта уничтожается, только если её реальная сила стала 0
					if (target.card.modifiedStrength <= 0) {
						this.destroyCard(gameState, target.card, target.row, gameModule);
					}
					
					gameModule.showGameMessage(`Способность "${this.name}" активирована! Нанесён ${this._damageAmount} урон ${target.card.name}.`, 'info');
					audioManager.playSound('card_damage');
					
					this.removeHighlights();
				};
			};
			
			for (const row of rows) {
				const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				
				const rowState = gameState.opponent.rows[row];
				const cards = rowElement.querySelectorAll('.board-card');
				
				cards.forEach((cardElement, index) => {
					// Сопоставляем элемент доски с картой по uniqueId,
					// а если его нет — по позиции в ряду.
					const uniqueId = cardElement.dataset.uniqueId;
					let target = null;
					
					if (uniqueId) {
						target = enemyUnits.find(u => u.row === row && u.card.uniqueId === uniqueId) || null;
					}
					if (!target && rowState.cards[index]) {
						const indexedCard = rowState.cards[index];
						const indexedTarget = enemyUnits.find(u => u.row === row && u.card === indexedCard);
						if (indexedTarget) target = indexedTarget;
					}
					
					if (target) {
						cardElement.style.cursor = 'pointer';
						cardElement.classList.add('damage-target');
						
						const handler = clickHandler(target);
						cardElement.addEventListener('click', handler);
						this._clickHandlers.push({ element: cardElement, handler: handler });
						
						cardElement.addEventListener('mouseenter', () => {
							cardElement.style.transform = 'scale(1.05)';
							cardElement.style.filter = 'brightness(1.2) drop-shadow(0 0 12px #ff4444)';
						});
						cardElement.addEventListener('mouseleave', () => {
							cardElement.style.transform = 'scale(1)';
							cardElement.style.filter = '';
						});
					}
				});
			}
			
			// === КНОПКА ОТМЕНЫ (как в scoiatael_ability_3) ===
			this.showCancelButton(gameState, gameModule);
		},
		
		// ===== АНИМАЦИЯ УРОНА -6 (как в scoiatael_ability_3) =====
		createDamageVisualEffect: function(card, row, gameModule) {
			const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
			if (!rowElement) return;
			
			// Ищем элемент карты на доске
			let cardElement = null;
			
			if (card.uniqueId) {
				cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			}
			
			if (!cardElement) {
				const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
				if (elements.length === 1) {
					cardElement = elements[0];
				} else if (elements.length > 1) {
					const rowState = this._gameState.opponent.rows[row];
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
			
			// Если не нашли по селекторам, пробуем найти по позиции
			if (!cardElement) {
				const allCards = rowElement.querySelectorAll('.board-card');
				const rowState = this._gameState.opponent.rows[row];
				const position = rowState.cards.findIndex(c => 
					c.id === card.id && c.uniqueId === card.uniqueId
				);
				if (position !== -1 && allCards[position]) {
					cardElement = allCards[position];
				}
			}
			
			if (!cardElement) return;
			
			// Создаём элемент с анимацией -6 (красный)
			const damageOverlay = document.createElement('div');
			damageOverlay.className = 'card-damage-overlay';
			damageOverlay.textContent = '-6';
			damageOverlay.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #ff1744;
				font-size: 36px;
				font-weight: bold;
				text-shadow: 0 0 20px rgba(255, 23, 68, 0.9), 0 0 40px rgba(255, 0, 0, 0.6);
				z-index: 100;
				pointer-events: none;
				animation: leaderBoostAnimation 1.2s ease-out forwards;
				font-family: 'Gwent', sans-serif;
				letter-spacing: 2px;
			`;
			
			// Добавляем красное свечение на карту
			cardElement.style.boxShadow = '0 0 20px 8px rgba(255, 0, 0, 0.5)';
			cardElement.style.transition = 'box-shadow 0.5s ease-out';
			
			cardElement.appendChild(damageOverlay);
			
			// Удаляем эффект через 1.2 секунды
			setTimeout(() => {
				if (damageOverlay.parentNode) {
					damageOverlay.remove();
				}
				cardElement.style.boxShadow = '';
			}, 1200);
		},
		
		removeHighlights: function() {
			const rows = ['close', 'ranged', 'siege'];
			for (const row of rows) {
				const rowElement = document.getElementById(`opponent${this._gameModule.capitalizeFirst(row)}Row`);
				if (!rowElement) continue;
				const cards = rowElement.querySelectorAll('.board-card');
				cards.forEach(card => {
					card.style.cursor = '';
					card.classList.remove('damage-target');
					card.style.transform = '';
					card.style.filter = '';
					card.style.boxShadow = '';
				});
			}
			
			// Удаляем обработчики кликов
			if (this._clickHandlers) {
				this._clickHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('click', handler);
				});
				this._clickHandlers = [];
			}
			
			this.removeCancelButton();
		},
		
		// ===== КНОПКА ОТМЕНЫ (как в scoiatael_ability_3) =====
		showCancelButton: function(gameState, gameModule) {
			const existingBtn = document.getElementById('abilityCancelBtn');
			if (existingBtn) existingBtn.remove();
			
			const cancelBtn = document.createElement('button');
			cancelBtn.id = 'abilityCancelBtn';
			cancelBtn.textContent = 'ОТМЕНА';
			cancelBtn.className = 'ability-cancel-btn';
			cancelBtn.style.cssText = `
				position: fixed;
				bottom: 30px;
				left: 50%;
				transform: translateX(-50%);
				background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
				color: #d4af37;
				border: 2px solid #d4af37;
				padding: 12px 35px;
				border-radius: 8px;
				cursor: pointer;
				font-weight: bold;
				font-family: 'Gwent', sans-serif;
				font-size: 16px;
				text-transform: uppercase;
				letter-spacing: 2px;
				z-index: 10050;
				transition: all 0.3s ease;
				box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
			`;
			
			cancelBtn.addEventListener('mouseenter', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1.05)';
				cancelBtn.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)';
				audioManager.playSound('touch');
			});
			
			cancelBtn.addEventListener('mouseleave', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1)';
				cancelBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
			});
			
			cancelBtn.addEventListener('click', () => {
				// === ВАЖНО: СБРАСЫВАЕМ ФЛАГ ИСПОЛЬЗОВАНИЯ ===
				if (gameState) {
					gameState.player.abilityUsedThisRound = false;
				}
				
				this.removeHighlights();
				audioManager.playSound('button');
				gameModule.showGameMessage('Использование способности отменено', 'info');
				
				// === ОБНОВЛЯЕМ ИКОНКУ СПОСОБНОСТИ ===
				if (window.boardModule && window.boardModule.updateAbilityAvailability) {
					window.boardModule.updateAbilityAvailability(gameState);
				}
			});
			
			document.body.appendChild(cancelBtn);
			this._cancelBtn = cancelBtn;
		},
		
		removeCancelButton: function() {
			if (this._cancelBtn && this._cancelBtn.parentNode) {
				this._cancelBtn.remove();
				this._cancelBtn = null;
			}
			const btn = document.getElementById('abilityCancelBtn');
			if (btn) btn.remove();
		},
		
		dealDamage: function(card, amount) {
			if (window.gameModule && window.gameModule.applyCardDamage) {
				window.gameModule.applyCardDamage(card, amount);
				return;
			}
			
			if (card.baseStrength === undefined) card.baseStrength = card.strength;
			if (card.originalStrength === undefined) card.originalStrength = card.strength;
			if (card.modifiedStrength === undefined) card.modifiedStrength = card.strength;
			
			card.modifiedStrength = Math.max(0, card.modifiedStrength - amount);
			card.currentStrength = card.modifiedStrength;
			card.strength = card.currentStrength;
			card._displayStrength = card.currentStrength;
		},
		
		destroyCard: function(gameState, card, row, gameModule) {
			const rowCards = gameState.opponent.rows[row].cards;
			let cardIndex = -1;
			
			if (card.uniqueId !== undefined) {
				cardIndex = rowCards.findIndex(c => c.uniqueId === card.uniqueId);
			}
			if (cardIndex === -1) {
				cardIndex = rowCards.indexOf(card);
			}
			if (cardIndex === -1) {
				// Последний вариант — ищем по id, но только если карта одна
				const sameId = rowCards
					.map((c, index) => ({ c, index }))
					.filter(entry => entry.c.id === card.id);
				if (sameId.length === 1) {
					cardIndex = sameId[0].index;
				}
			}
			
			if (cardIndex !== -1) {
				const destroyedCard = rowCards.splice(cardIndex, 1)[0];
				gameModule.addCardToDiscard(destroyedCard, 'opponent');
				gameModule.redrawRow(row, 'opponent');
				gameModule.updateRowStrength(row, 'opponent');
				audioManager.playSound('card_destroy');
			}
		}
	},
	'syndicate_ability_2': {
		name: 'Резня',
		description: 'Нанесите от 1 до 3 ед. урона всем картам в ряду противника',
		execute: function(gameState, gameModule) {
			// ===== СНАЧАЛА ПРОВЕРЯЕМ, ЕСТЬ ЛИ ВООБЩЕ КАРТЫ У ПРОТИВНИКА =====
			let hasTargets = false;
			const rows = ['close', 'ranged', 'siege'];
			
			rows.forEach(row => {
				if (gameState.opponent.rows[row].cards.length > 0) {
					// Проверяем, есть ли хотя бы один отряд (не герой)
					const hasValidUnit = gameState.opponent.rows[row].cards.some(card => {
						if (card.type !== 'unit') return false;
						if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return false;
						return true;
					});
					if (hasValidUnit) {
						hasTargets = true;
					}
				}
			});
			
			// ===== ВАЖНО: ЕСЛИ НЕТ ЦЕЛЕЙ - ВОЗВРАЩАЕМ false, НЕ ПОМЕЧАЯ КАК ИСПОЛЬЗОВАННУЮ =====
			if (!hasTargets) {
				gameModule.showGameMessage('Нет отрядов противника на поле для атаки', 'warning');
				return false;  // ← Возвращаем false, способность НЕ считается использованной
			}
			
			// Сохраняем состояние для анимации и отмены
			this._gameState = gameState;
			this._gameModule = gameModule;
			
			this.showRowSelection(gameState, gameModule);
			return true;
		},
		
		showRowSelection: function(gameState, gameModule) {
			const rowsWithCards = [];
			const rows = [
				{ id: 'close', name: 'Ближний бой', elementId: 'opponentCloseRow' },
				{ id: 'ranged', name: 'Дальний бой', elementId: 'opponentRangedRow' },
				{ id: 'siege', name: 'Осадный', elementId: 'opponentSiegeRow' }
			];
			
			rows.forEach(row => {
				// Проверяем наличие уязвимых отрядов (не героев)
				const hasValidUnits = gameState.opponent.rows[row.id].cards.some(card => {
					if (card.type !== 'unit') return false;
					if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return false;
					return true;
				});
				if (hasValidUnits) {
					rowsWithCards.push(row);
				}
			});
			
			if (rowsWithCards.length === 0) {
				gameModule.showGameMessage('Нет уязвимых отрядов противника для атаки', 'warning');
				// ===== ВАЖНО: СБРАСЫВАЕМ ФЛАГ, ЕСЛИ НЕТ ЦЕЛЕЙ =====
				if (gameState) {
					gameState.player.abilityUsedThisRound = false;
				}
				return;
			}
			
			// Сохраняем обработчики для удаления
			this._rowHandlers = [];
			
			const clickHandler = (rowId, rowName) => {
				return (event) => {
					let damagedCount = 0;
					const unitsToDestroy = [];
					const randomDamage = Math.floor(Math.random() * 3) + 1; // 1-3 урона
					const damagedCards = [];
					
					// Сохраняем карты до нанесения урона для анимации
					gameState.opponent.rows[rowId].cards.forEach(card => {
						if (card.type === 'unit') {
							if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
							damagedCards.push({ card: card, row: rowId });
						}
					});
					
					// Наносим урон
					gameState.opponent.rows[rowId].cards.forEach(card => {
						if (card.type === 'unit') {
							if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
							
							this.dealDamage(card, randomDamage);
							damagedCount++;
							
							if (card.modifiedStrength <= 0) {
								unitsToDestroy.push({ card: card, row: rowId });
							}
						}
					});
					
					// === АНИМАЦИЯ УРОНА ДЛЯ КАЖДОЙ КАРТЫ ===
					damagedCards.forEach(item => {
						this.createDamageVisualEffect(item.card, item.row, gameModule, randomDamage);
					});
					
					// Уничтожаем уничтоженные карты
					unitsToDestroy.forEach(unit => {
						this.destroyCard(gameState, unit.card, unit.row, gameModule);
					});
					
					if (damagedCount === 0) {
						gameModule.showGameMessage('В выбранном ряду нет уязвимых отрядов', 'warning');
						// ===== ВАЖНО: СБРАСЫВАЕМ ФЛАГ =====
						if (gameState) {
							gameState.player.abilityUsedThisRound = false;
						}
						this.removeHighlights();
						return;
					}
					
					gameState.player.abilityUsedThisRound = true;
					gameModule.updateRowStrength(rowId, 'opponent');
					gameModule.updateTotalScoreDisplays();
					gameModule.showGameMessage(`Способность "${this.name}" активирована! Нанесён ${randomDamage} урон ${damagedCount} отрядам.`, 'info');
					audioManager.playSound('card_damage');
					
					this.removeHighlights();
					
					// Обновляем иконку способности
					if (window.boardModule && window.boardModule.updateAbilityAvailability) {
						window.boardModule.updateAbilityAvailability(gameState);
					}
				};
			};
			
			rowsWithCards.forEach(row => {
				const rowElement = document.getElementById(row.elementId);
				if (rowElement) {
					rowElement.classList.add('row-damage-target');
					rowElement.style.cursor = 'pointer';
					rowElement.style.transition = 'all 0.2s ease';
					
					const handler = clickHandler(row.id, row.name);
					rowElement.addEventListener('click', handler);
					this._rowHandlers.push({ element: rowElement, handler: handler });
					
					rowElement.addEventListener('mouseenter', () => {
						rowElement.style.transform = 'scale(1.02)';
						rowElement.style.boxShadow = '0 0 20px rgba(255, 68, 68, 0.3)';
					});
					rowElement.addEventListener('mouseleave', () => {
						rowElement.style.transform = 'scale(1)';
						rowElement.style.boxShadow = '';
					});
				}
			});
			
			// === ДОБАВЛЯЕМ КНОПКУ ОТМЕНЫ ===
			this.showCancelButton(gameState, gameModule);
		},
		
		// ===== АНИМАЦИЯ УРОНА (как в scoiatael_ability_3) =====
		createDamageVisualEffect: function(card, row, gameModule, damageAmount) {
			const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
			if (!rowElement) return;
			
			// Ищем элемент карты на доске
			let cardElement = null;
			
			if (card.uniqueId) {
				cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			}
			
			if (!cardElement) {
				const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
				if (elements.length === 1) {
					cardElement = elements[0];
				} else if (elements.length > 1) {
					const rowState = this._gameState.opponent.rows[row];
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
			
			// Если не нашли по селекторам, пробуем найти по позиции
			if (!cardElement) {
				const allCards = rowElement.querySelectorAll('.board-card');
				const rowState = this._gameState.opponent.rows[row];
				const position = rowState.cards.findIndex(c => 
					c.id === card.id && c.uniqueId === card.uniqueId
				);
				if (position !== -1 && allCards[position]) {
					cardElement = allCards[position];
				}
			}
			
			if (!cardElement) return;
			
			// Создаём элемент с анимацией урона (красный)
			const damageOverlay = document.createElement('div');
			damageOverlay.className = 'card-damage-overlay';
			damageOverlay.textContent = `-${damageAmount}`;
			damageOverlay.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #ff1744;
				font-size: 36px;
				font-weight: bold;
				text-shadow: 0 0 20px rgba(255, 23, 68, 0.9), 0 0 40px rgba(255, 0, 0, 0.6);
				z-index: 100;
				pointer-events: none;
				animation: leaderBoostAnimation 1.2s ease-out forwards;
				font-family: 'Gwent', sans-serif;
				letter-spacing: 2px;
			`;
			
			// Добавляем красное свечение на карту
			cardElement.style.boxShadow = '0 0 20px 8px rgba(255, 0, 0, 0.5)';
			cardElement.style.transition = 'box-shadow 0.5s ease-out';
			
			cardElement.appendChild(damageOverlay);
			
			// Удаляем эффект через 1.2 секунды
			setTimeout(() => {
				if (damageOverlay.parentNode) {
					damageOverlay.remove();
				}
				cardElement.style.boxShadow = '';
			}, 1200);
		},
		
		// ===== КНОПКА ОТМЕНЫ (как в scoiatael_ability_3) =====
		showCancelButton: function(gameState, gameModule) {
			const existingBtn = document.getElementById('abilityCancelBtn');
			if (existingBtn) existingBtn.remove();
			
			const cancelBtn = document.createElement('button');
			cancelBtn.id = 'abilityCancelBtn';
			cancelBtn.textContent = 'ОТМЕНА';
			cancelBtn.className = 'ability-cancel-btn';
			cancelBtn.style.cssText = `
				position: fixed;
				bottom: 30px;
				left: 50%;
				transform: translateX(-50%);
				background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
				color: #d4af37;
				border: 2px solid #d4af37;
				padding: 12px 35px;
				border-radius: 8px;
				cursor: pointer;
				font-weight: bold;
				font-family: 'Gwent', sans-serif;
				font-size: 16px;
				text-transform: uppercase;
				letter-spacing: 2px;
				z-index: 10050;
				transition: all 0.3s ease;
				box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
			`;
			
			cancelBtn.addEventListener('mouseenter', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1.05)';
				cancelBtn.style.boxShadow = '0 0 25px rgba(212, 175, 55, 0.4)';
				audioManager.playSound('touch');
			});
			
			cancelBtn.addEventListener('mouseleave', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1)';
				cancelBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
			});
			
			cancelBtn.addEventListener('click', () => {
				// === ВАЖНО: СБРАСЫВАЕМ ФЛАГ ИСПОЛЬЗОВАНИЯ ===
				if (gameState) {
					gameState.player.abilityUsedThisRound = false;
				}
				
				// Убираем выделения с рядов
				this.removeHighlights();
				
				// Убираем кнопку отмены
				this.removeCancelButton();
				
				audioManager.playSound('button');
				gameModule.showGameMessage('Использование способности отменено', 'info');
				
				// Обновляем иконку способности (возвращаем активное состояние)
				if (window.boardModule && window.boardModule.updateAbilityAvailability) {
					window.boardModule.updateAbilityAvailability(gameState);
				}
			});
			
			document.body.appendChild(cancelBtn);
			this._cancelBtn = cancelBtn;
		},
		
		removeCancelButton: function() {
			if (this._cancelBtn && this._cancelBtn.parentNode) {
				this._cancelBtn.remove();
				this._cancelBtn = null;
			}
			const btn = document.getElementById('abilityCancelBtn');
			if (btn) btn.remove();
		},
		
		removeHighlights: function() {
			const rows = ['close', 'ranged', 'siege'];
			rows.forEach(row => {
				const rowElement = document.getElementById(`opponent${this._gameModule.capitalizeFirst(row)}Row`);
				if (rowElement) {
					rowElement.classList.remove('row-damage-target');
					rowElement.style.cursor = '';
					rowElement.style.transform = '';
					rowElement.style.boxShadow = '';
				}
			});
			
			// Удаляем обработчики кликов с рядов
			if (this._rowHandlers) {
				this._rowHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('click', handler);
				});
				this._rowHandlers = [];
			}
			
			this.removeCancelButton();
		},
		
		dealDamage: function(card, amount) {
			if (window.gameModule && window.gameModule.applyCardDamage) {
				window.gameModule.applyCardDamage(card, amount);
				return;
			}
			
			if (card.baseStrength === undefined) card.baseStrength = card.strength;
			if (card.originalStrength === undefined) card.originalStrength = card.strength;
			if (card.modifiedStrength === undefined) card.modifiedStrength = card.strength;
			
			card.modifiedStrength = Math.max(0, card.modifiedStrength - amount);
			card.currentStrength = card.modifiedStrength;
			card.strength = card.currentStrength;
			card._displayStrength = card.currentStrength;
		},
		
		destroyCard: function(gameState, card, row, gameModule) {
			const rowCards = gameState.opponent.rows[row].cards;
			let cardIndex = -1;
			
			if (card.uniqueId !== undefined) {
				cardIndex = rowCards.findIndex(c => c.uniqueId === card.uniqueId);
			}
			if (cardIndex === -1) {
				cardIndex = rowCards.indexOf(card);
			}
			if (cardIndex === -1) {
				// Последний вариант — ищем по id, но только если карта одна
				const sameId = rowCards
					.map((c, index) => ({ c, index }))
					.filter(entry => entry.c.id === card.id);
				if (sameId.length === 1) {
					cardIndex = sameId[0].index;
				}
			}
			
			if (cardIndex !== -1) {
				const destroyedCard = rowCards.splice(cardIndex, 1)[0];
				gameModule.addCardToDiscard(destroyedCard, 'opponent');
				gameModule.redrawRow(row, 'opponent');
				gameModule.updateRowStrength(row, 'opponent');
				audioManager.playSound('card_destroy');
			}
		}
	},
	'syndicate_ability_3': {
		name: 'Пиратская бухта',
		description: 'Призовите из колоды в руку 2 карты с тегом "Пират"',
		execute: function(gameState, gameModule) {
			if (gameState.player.hand.length >= 10) {
				gameModule.showGameMessage('Нет места в руке для призыва карт', 'warning');
				return false;
			}
			
			const pirateCards = [];
			
			for (let i = 0; i < gameState.player.deck.length; i++) {
				const card = gameState.player.deck[i];
				if (card.tags && (card.tags.includes('pirat') || card.tags.includes('пират'))) {
					pirateCards.push({ card: card, index: i });
				}
			}
			
			if (pirateCards.length === 0) {
				gameModule.showGameMessage('В колоде нет карт с тегом "Пират"', 'warning');
				return false;
			}
			
			const cardsToDraw = Math.min(2, pirateCards.length, 10 - gameState.player.hand.length);
			
			let drawnCards = [];
			for (let i = 0; i < cardsToDraw; i++) {
				const pirate = pirateCards[i];
				gameState.player.deck.splice(pirate.index - i, 1);
				gameState.player.hand.push(pirate.card);
				drawnCards.push(pirate.card.name);
			}
			
			gameState.player.abilityUsedThisRound = true;
			gameModule.displayPlayerHand();
			gameModule.displayPlayerDeck();
			
			const message = `Способность "${this.name}" активирована! Призваны карты: ${drawnCards.join(', ')}`;
			gameModule.showGameMessage(message, 'info');
			audioManager.playSound('cardAdd');
			
			return true;
		}
	},
	'syndicate_ability_4': {
		name: 'Священное братство',
		description: 'Усильте 2 случайных дружественных отряда на 2 ед.',
		execute: function(gameState, gameModule) {
			// Сохраняем состояние для анимации
			this._gameState = gameState;
			this._gameModule = gameModule;
			this._boostAmount = 2;
			
			const friendlyUnits = [];
			const rows = ['close', 'ranged', 'siege'];
			
			rows.forEach(row => {
				gameState.player.rows[row].cards.forEach(card => {
					if (card.type === 'unit') {
						if (card.tags && (card.tags.includes('hero') || card.tags.includes('герой'))) return;
						friendlyUnits.push({ card: card, row: row });
					}
				});
			});
			
			if (friendlyUnits.length === 0) {
				gameModule.showGameMessage('Нет дружественных отрядов для усиления', 'warning');
				return false;
			}
			
			const boostAmount = 2;
			const boostCount = Math.min(2, friendlyUnits.length);
			
			// Перемешиваем массив для случайного выбора
			const shuffled = [...friendlyUnits];
			for (let i = shuffled.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
			}
			
			let boostedCards = [];
			const boostedWithRows = [];
			
			for (let i = 0; i < boostCount; i++) {
				const target = shuffled[i];
				this.boostCard(target.card, boostAmount);
				boostedCards.push(target.card.name);
				boostedWithRows.push(target);
			}
			
			// === АНИМАЦИЯ УСИЛЕНИЯ ДЛЯ КАЖДОЙ КАРТЫ ===
			boostedWithRows.forEach(item => {
				this.createBoostVisualEffect(item.card, item.row, gameModule);
				gameModule.updateRowStrength(item.row, 'player');
			});
			
			gameState.player.abilityUsedThisRound = true;
			gameModule.updateTotalScoreDisplays();
			gameModule.showGameMessage(`Способность "${this.name}" активирована! Усилены на ${boostAmount} ед.: ${boostedCards.join(', ')}`, 'info');
			audioManager.playSound('card_boost');
			
			return true;
		},
		
		// ===== АНИМАЦИЯ УСИЛЕНИЯ +2 (как в scoiatael_ability_1) =====
		createBoostVisualEffect: function(card, row, gameModule) {
			const rowElement = document.getElementById(`player${gameModule.capitalizeFirst(row)}Row`);
			if (!rowElement) return;
			
			// Ищем элемент карты на доске
			let cardElement = null;
			
			if (card.uniqueId) {
				cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			}
			
			if (!cardElement) {
				const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
				if (elements.length === 1) {
					cardElement = elements[0];
				} else if (elements.length > 1) {
					const rowState = this._gameState.player.rows[row];
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
			
			// Если не нашли по селекторам, пробуем найти по позиции
			if (!cardElement) {
				const allCards = rowElement.querySelectorAll('.board-card');
				const rowState = this._gameState.player.rows[row];
				const position = rowState.cards.findIndex(c => 
					c.id === card.id && c.uniqueId === card.uniqueId
				);
				if (position !== -1 && allCards[position]) {
					cardElement = allCards[position];
				}
			}
			
			if (!cardElement) return;
			
			// Создаём элемент с анимацией +2 (зелёный)
			const boostOverlay = document.createElement('div');
			boostOverlay.className = 'card-boost-overlay';
			boostOverlay.textContent = '+2';
			boostOverlay.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #00ff00;
				font-size: 36px;
				font-weight: bold;
				text-shadow: 0 0 20px rgba(0, 255, 0, 0.9), 0 0 40px rgba(0, 255, 0, 0.6);
				z-index: 100;
				pointer-events: none;
				animation: leaderBoostAnimation 1.2s ease-out forwards;
				font-family: 'Gwent', sans-serif;
				letter-spacing: 2px;
			`;
			
			// Добавляем свечение на карту
			cardElement.style.boxShadow = '0 0 20px 8px rgba(0, 255, 0, 0.5)';
			cardElement.style.transition = 'box-shadow 0.5s ease-out';
			
			cardElement.appendChild(boostOverlay);
			
			// Удаляем эффект через 1.2 секунды
			setTimeout(() => {
				if (boostOverlay.parentNode) {
					boostOverlay.remove();
				}
				cardElement.style.boxShadow = '';
			}, 1200);
		},
		
		boostCard: function(card, amount) {
			if (window.gameModule && window.gameModule.applyCardBoost) {
				window.gameModule.applyCardBoost(card, amount);
				return;
			}
			
			if (card.baseStrength === undefined) card.baseStrength = card.strength;
			if (card.originalStrength === undefined) card.originalStrength = card.strength;
			if (card.modifiedStrength === undefined) card.modifiedStrength = card.strength;
			
			card.modifiedStrength += amount;
			card.currentStrength = card.modifiedStrength;
			card.strength = card.currentStrength;
			card._displayStrength = card.currentStrength;
		}
	},
	'syndicate_ability_5': {
		name: 'Кровавые деньги',
		description: 'Уничтожьте вражеский отряд с силой 4 или меньше',
		execute: function(gameState, gameModule) {
			const destroyableUnits = [];
			const rows = ['close', 'ranged', 'siege'];
			
			rows.forEach(row => {
				gameState.opponent.rows[row].cards.forEach((card) => {
					if (card.type === 'unit') {
						const isHero = card.tags && (card.tags.includes('hero') || card.tags.includes('герой'));
						if (!isHero) {
							// Используем currentStrength для проверки
							const currentStrength = card.currentStrength !== undefined ? 
								card.currentStrength : (card.strength || 0);
							
							if (currentStrength <= 4 && currentStrength > 0) {
								if (!card.uniqueId) {
									card.uniqueId = `${card.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
								}
								destroyableUnits.push({ 
									card: card, 
									row: row,
									uniqueId: card.uniqueId,
									cardId: card.id
								});
							}
						}
					}
				});
			});
			
			if (destroyableUnits.length === 0) {
				gameModule.showGameMessage('Нет вражеских отрядов с силой 4 или меньше для уничтожения', 'warning');
				return false;
			}
			
			this._gameState = gameState;
			this._gameModule = gameModule;
			this.showTargetSelection(destroyableUnits, gameState, gameModule);
			return true;
		},
		
		showTargetSelection: function(destroyableUnits, gameState, gameModule) {
			this.currentDestroyableUnits = destroyableUnits;
			this._clickHandlers = [];
			
			for (const unit of destroyableUnits) {
				const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(unit.row)}Row`);
				if (!rowElement) continue;
				
				let cardElement = rowElement.querySelector(`[data-unique-id="${unit.uniqueId}"]`);
				if (!cardElement) {
					cardElement = rowElement.querySelector(`[data-card-id="${unit.card.id}"]`);
				}
				
				if (!cardElement) {
					const allCards = rowElement.querySelectorAll('.board-card');
					const rowState = gameState.opponent.rows[unit.row];
					for (let i = 0; i < allCards.length && i < rowState.cards.length; i++) {
						const cardData = rowState.cards[i];
						if (cardData.id === unit.card.id || cardData.uniqueId === unit.uniqueId) {
							cardElement = allCards[i];
							if (cardData.uniqueId) {
								cardElement.dataset.uniqueId = cardData.uniqueId;
							}
							break;
						}
					}
				}
				
				if (cardElement) {
					cardElement.style.cursor = 'pointer';
					cardElement.style.filter = 'brightness(1.2) drop-shadow(0 0 8px #ff4444)';
					cardElement.classList.add('destroyable-target');
					
					if (unit.uniqueId) {
						cardElement.dataset.uniqueId = unit.uniqueId;
					}
					
					const clickHandler = (event) => {
						event.stopPropagation();
						event.preventDefault();
						
						let targetCard = null;
						let targetRow = null;
						const targetUniqueId = cardElement.dataset.uniqueId || unit.uniqueId;
						
						for (const row of ['close', 'ranged', 'siege']) {
							const foundCard = gameState.opponent.rows[row].cards.find(c => 
								c.uniqueId === targetUniqueId
							);
							if (foundCard) {
								targetCard = foundCard;
								targetRow = row;
								break;
							}
						}
						
						if (!targetCard) {
							for (const row of ['close', 'ranged', 'siege']) {
								const foundCard = gameState.opponent.rows[row].cards.find(c => 
									c.id === unit.card.id
								);
								if (foundCard) {
									targetCard = foundCard;
									targetRow = row;
									break;
								}
							}
						}
						
						if (!targetCard) {
							gameModule.showGameMessage('Карта не найдена на поле', 'warning');
							this.removeDestroyHighlights(gameState, gameModule);
							return;
						}
						
						const currentStrength = targetCard.currentStrength !== undefined ? 
							targetCard.currentStrength : (targetCard.strength || 0);
						
						if (currentStrength > 4 || currentStrength <= 0) {
							gameModule.showGameMessage(`Сила карты ${currentStrength} - она не подходит для уничтожения`, 'warning');
							this.removeDestroyHighlights(gameState, gameModule);
							return;
						}
						
						// Анимация уничтожения
						this.createDestroyVisualEffect(targetCard, targetRow, gameModule);
						
						setTimeout(() => {
							// ===== УДАЛЯЕМ КАРТУ БЕЗ ПЕРЕРИСОВКИ ВСЕГО РЯДА =====
							this.destroyCardWithoutRedraw(gameState, targetCard, targetRow, gameModule);
							gameState.player.abilityUsedThisRound = true;
							
							gameModule.updateRowStrength(targetRow, 'opponent');
							gameModule.updateTotalScoreDisplays();
							gameModule.showGameMessage(`Способность "${this.name}" активирована! ${targetCard.name} (сила ${currentStrength}) уничтожен.`, 'info');
							audioManager.playSound('card_destroy');
							
							if (window.boardModule && window.boardModule.updateAbilityAvailability) {
								window.boardModule.updateAbilityAvailability(gameState);
							}
						}, 500);
						
						this.removeDestroyHighlights(gameState, gameModule);
					};
					
					cardElement.addEventListener('click', clickHandler);
					this._clickHandlers.push({ element: cardElement, handler: clickHandler });
					
					cardElement.addEventListener('mouseenter', () => {
						cardElement.style.transform = 'scale(1.05)';
					});
					cardElement.addEventListener('mouseleave', () => {
						cardElement.style.transform = 'scale(1)';
					});
				}
			}
			
			this.showDestroyCancelButton(gameState, gameModule);
		},
		
		createDestroyVisualEffect: function(card, row, gameModule) {
			const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
			if (!rowElement) return;
			
			let cardElement = null;
			
			if (card.uniqueId) {
				cardElement = rowElement.querySelector(`[data-unique-id="${card.uniqueId}"]`);
			}
			
			if (!cardElement) {
				const elements = rowElement.querySelectorAll(`[data-card-id="${card.id}"]`);
				if (elements.length === 1) {
					cardElement = elements[0];
				} else if (elements.length > 1) {
					const rowState = this._gameState.opponent.rows[row];
					const position = rowState.cards.findIndex(c => 
						c.uniqueId === card.uniqueId
					);
					if (position !== -1 && elements[position]) {
						cardElement = elements[position];
					} else {
						cardElement = elements[0];
					}
				}
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
				z-index: 100;
				border-radius: 5px;
				pointer-events: none;
				animation: destroyCardAnimation 1s ease-out forwards;
			`;
			
			cardElement.style.boxShadow = '0 0 30px 15px rgba(255, 0, 0, 0.8)';
			cardElement.style.transition = 'box-shadow 0.3s ease-out';
			
			cardElement.appendChild(destroyOverlay);
			
			setTimeout(() => {
				if (destroyOverlay.parentNode) {
					destroyOverlay.remove();
				}
				cardElement.style.boxShadow = '';
			}, 1000);
		},
		
		// ===== НОВЫЙ МЕТОД: УДАЛЕНИЕ КАРТЫ БЕЗ ПЕРЕРИСОВКИ РЯДА =====
		destroyCardWithoutRedraw: function(gameState, card, row, gameModule) {
			const rowCards = gameState.opponent.rows[row].cards;
			
			// Ищем по uniqueId
			let cardIndex = -1;
			if (card.uniqueId) {
				cardIndex = rowCards.findIndex(c => c.uniqueId === card.uniqueId);
			}
			
			// Если не нашли, ищем по id
			if (cardIndex === -1) {
				const matchingCards = rowCards.map((c, idx) => ({ card: c, index: idx }))
					.filter(item => item.card.id === card.id);
				
				if (matchingCards.length === 1) {
					cardIndex = matchingCards[0].index;
				} else if (matchingCards.length > 1) {
					if (card.uniqueId) {
						const found = matchingCards.find(item => item.card.uniqueId === card.uniqueId);
						if (found) {
							cardIndex = found.index;
						}
					}
					if (cardIndex === -1) {
						cardIndex = matchingCards[0].index;
					}
				}
			}
			
			if (cardIndex !== -1) {
				const destroyedCard = rowCards.splice(cardIndex, 1)[0];
				gameModule.addCardToDiscard(destroyedCard, 'opponent');
				
				// ===== УДАЛЯЕМ КАРТУ ИЗ DOM БЕЗ ПЕРЕРИСОВКИ ВСЕГО РЯДА =====
				const rowElement = document.getElementById(`opponent${gameModule.capitalizeFirst(row)}Row`);
				if (rowElement) {
					// Ищем элемент карты в DOM
					let cardElement = null;
					if (destroyedCard.uniqueId) {
						cardElement = rowElement.querySelector(`[data-unique-id="${destroyedCard.uniqueId}"]`);
					}
					if (!cardElement) {
						cardElement = rowElement.querySelector(`[data-card-id="${destroyedCard.id}"]`);
					}
					if (cardElement) {
						// Добавляем анимацию исчезновения
						cardElement.style.animation = 'cardDestroy 0.3s ease-out forwards';
						setTimeout(() => {
							if (cardElement.parentNode) {
								cardElement.remove();
							}
						}, 300);
					}
				}
				
				// Обновляем силу ряда
				gameModule.updateRowStrength(row, 'opponent');
			}
		},
		
		removeDestroyHighlights: function(gameState, gameModule) {
			if (this._clickHandlers) {
				this._clickHandlers.forEach(({ element, handler }) => {
					element.removeEventListener('click', handler);
				});
				this._clickHandlers = [];
			}
			
			const allCards = document.querySelectorAll('.board-card');
			allCards.forEach(card => {
				card.style.cursor = '';
				card.style.filter = '';
				card.style.transform = '';
				card.style.boxShadow = '';
				card.classList.remove('destroyable-target');
			});
			
			this.removeDestroyCancelButton();
		},
		
		showDestroyCancelButton: function(gameState, gameModule) {
			const existingBtn = document.getElementById('abilityCancelBtn');
			if (existingBtn) existingBtn.remove();
			
			const cancelBtn = document.createElement('button');
			cancelBtn.id = 'abilityCancelBtn';
			cancelBtn.textContent = 'ОТМЕНА';
			cancelBtn.className = 'ability-cancel-btn';
			cancelBtn.style.cssText = `
				position: fixed;
				bottom: 30px;
				left: 50%;
				transform: translateX(-50%);
				background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
				color: #d4af37;
				border: 2px solid #d4af37;
				padding: 12px 35px;
				border-radius: 8px;
				cursor: pointer;
				font-weight: bold;
				font-family: 'Gwent', sans-serif;
				font-size: 16px;
				text-transform: uppercase;
				letter-spacing: 2px;
				z-index: 10050;
				transition: all 0.3s ease;
				box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
			`;
			
			cancelBtn.addEventListener('mouseenter', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1.05)';
				cancelBtn.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)';
				audioManager.playSound('touch');
			});
			
			cancelBtn.addEventListener('mouseleave', () => {
				cancelBtn.style.transform = 'translateX(-50%) scale(1)';
				cancelBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
			});
			
			cancelBtn.addEventListener('click', () => {
				if (gameState) {
					gameState.player.abilityUsedThisRound = false;
				}
				
				this.removeDestroyHighlights(gameState, gameModule);
				audioManager.playSound('button');
				gameModule.showGameMessage('Использование способности отменено', 'info');
				
				if (window.boardModule && window.boardModule.updateAbilityAvailability) {
					window.boardModule.updateAbilityAvailability(gameState);
				}
			});
			
			document.body.appendChild(cancelBtn);
			this.currentCancelBtn = cancelBtn;
		},
		
		removeDestroyCancelButton: function() {
			if (this.currentCancelBtn && this.currentCancelBtn.parentNode) {
				this.currentCancelBtn.remove();
				this.currentCancelBtn = null;
			}
			const btn = document.getElementById('abilityCancelBtn');
			if (btn) btn.remove();
		}
	},

};

const leaderAbilitiesStyles = document.createElement('style');
leaderAbilitiesStyles.textContent = `
    .ability-target-overlay {
        animation: overlayFadeIn 0.3s ease-out;
    }
    
    .ability-deck-card:hover {
        transform: scale(1.05);
        filter: drop-shadow(0 0 10px #d4af37);
    }
    
    @keyframes overlayFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

document.head.appendChild(leaderAbilitiesStyles);

window.leaderAbilities = leaderAbilities;