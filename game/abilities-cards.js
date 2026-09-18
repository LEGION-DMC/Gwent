const tagTranslations = {
    'criminal': 'Преступник',
    'witcher': 'Ведьмак',
};

function getRussianTagName(englishTag) {
    return tagTranslations[englishTag] || englishTag;
}

const skillSystem = {
    abilityTypes: {
        COMBAT: 'combat',
        WEATHER: 'weather', 
        SPECIAL: 'special',
        PASSIVE: 'passive',
        LEADER: 'leader'
    },

    targets: {
        UNIT: 'unit',
        ROW: 'row',
        GLOBAL: 'global',
        HAND: 'hand',
        DECK: 'deck'
    },

    cardStates: {
        ACTIVE: 'active',
        DAMAGED: 'damaged',
        DESTROYED: 'destroyed',
        BOOSTED: 'boosted',
        WEATHERED: 'weathered'
    },

    abilities: {
        'biting_frost': {
            name: 'Белый хлад',
            type: 'weather',
            description: 'Накладывает эффект мороза и тумана, снижая силу всех отрядов в <span class="hint-trigger">Дальнем и Блежнем рядах</span> до 1',
            effect: {
                type: 'weather',
                weatherType: 'frost',
                row: 'close',
                target: 'enemy',
                strengthCap: 1
            }
        },      
		'frost': {
            name: 'Трескучий мороз',
            type: 'weather',
            description: 'Накладывает эффект мороза, снижая силу всех отрядов в <span class="hint-trigger">Блежнем ряду</span> до 1',
            effect: {
                type: 'weather',
                weatherType: 'frost',
                row: 'close',
                target: 'enemy',
                strengthCap: 1
            }
        },		
        'impenetrable_fog': {
            name: 'Густой туман',
            type: 'weather',
            description: 'Накладывает эффект тумана, снижая силу всех отрядов в <span class="hint-trigger">Дальнем ряду</span> до 1',
            effect: {
                type: 'weather',
                weatherType: 'fog',
                row: 'ranged',
                target: 'enemy',
                strengthCap: 1
            }
        },       
        'torrential_rain': {
            name: 'Проливной дождь',
            type: 'weather',
            description: 'Накладывает эффект дождя, снижая силу всех отрядов в <span class="hint-trigger">Осадном ряду</span> до 1',
            effect: {
                type: 'weather',
                weatherType: 'rain',
                row: 'siege',
                target: 'enemy',
                strengthCap: 1
            }
        },       
        'storm': {
            name: 'Гнев богов',
            type: 'weather',
            description: 'Накладывает эффект дождя и тумана, снижая силу всех отрядов в <span class="hint-trigger">Дальнем и Осадном рядах</span> до 1',
            effect: {
                type: 'weather',
                weatherType: 'storm',
                row: 'ranged',
                target: 'all',
                damage: 1
            }
        },    
        'clear_weather': {
            name: 'Чистое небо',
            type: 'weather',
            description: 'Снимает все погодные эффекты с поля боя',
            effect: {
                type: 'clear_weather'
            }
        },
        
		'destroy': {
			name: 'Пламя и пепел',
			type: 'special',
			description: '<span class="ability-hint"><span class="hint-trigger">Уничтожает</span><span class="hint-tooltip"><strong style="color:#0cbe38">Уничтожение:</strong> Перемещает карту в Сброс.</span></span><span class="description-normal"> самый сильный отряд противника',
			effect: {
				type: 'destroy_strongest_enemy',
				target: 'unit',
				condition: 'enemy'
			}
		},
		'destroy_artf': {
			name: 'Мираж',
			type: 'special',
			description: '<span class="ability-hint"><span class="hint-trigger">Уничтожает</span><span class="hint-tooltip"><strong style="color:#0cbe38">Уничтожение:</strong> Перемещает карту в Сброс.</span></span><span class="description-normal"> карту артефакта противника',
			effect: {
				type: 'destroy_artifact',
				target: 'artifact',
				condition: 'enemy'
			}
		},
		
		'decoy': {
			name: 'Чучело',
			type: 'special',
			description: 'Замещает собой дружественный отряд на поле, возвращая его в руку',
			effect: {
				type: 'swap_with_hand',
				target: 'unit',
				condition: 'ally'
			}
		},
		'flock': {
			name: 'Двойник',
			type: 'special',
			description: '<span class="ability-hint"><span class="hint-trigger">Призывает</span><span class="hint-tooltip"><strong style="color:#0cbe38">Призыв:</strong> Автоматически размещает на поле указанную карту.</span></span><span class="description-normal"> из руки и колоды все копии данного отряда',
			effect: {
				type: 'flock',
				target: 'self'
			}
		},
		'spy': {
			name: 'Шпион',
			type: 'special',
			description: 'Размещается на стороне противника. После размещения из Колоды в Руку добирается случайная карта',
		},

		'call_rat': {
			name: 'Чумной мор',
			type: 'special',
			description: '<span class="ability-hint"><span class="hint-trigger">Призывает</span><span class="hint-tooltip"><strong style="color:#0cbe38">Призыв:</strong> Автоматически размещает на поле указанные карты.</span></span><span class="description-normal"> на поле стаю из 3 крыс.</span>',
			effect: {
				type: 'summon_named_card', 
				target: 'self'
			}
		},
		'call_driad': {
			name: 'Зов Брокилона',
			type: 'special',
			description: '<span class="ability-hint"><span class="hint-trigger">Призывает</span><span class="hint-tooltip"><strong style="color:#0cbe38">Призыв:</strong> Автоматически размещает на поле указанные карты.</span></span><span class="description-normal"> на поле 2 дриад-охотниц.',
			effect: {
				type: 'summon_named_card', 
				target: 'self'
			}
		},
		
		'damage_1': {
			name: 'Атака I',
			type: 'special',
			description: 'Наносит 1 ед. урона выбранному отряду противника',
			effect: {
				type: 'damage',
				target: 'unit',
				condition: 'enemy',
				value: 1,
				requiresSelection: true
			}
		},
		'damage_2': {
			name: 'Атака II',
			type: 'special',
			description: 'Наносит 2 ед. урона выбранному отряду противника',
			effect: {
				type: 'damage',
				target: 'unit',
				condition: 'enemy',
				value: 2,
				requiresSelection: true
			}
		},
		'damage_3': {
			name: 'Атака III',
			type: 'special',
			description: 'Наносит 3 ед. урона выбранному отряду противника',
			effect: {
				type: 'damage',
				target: 'unit',
				condition: 'enemy',
				value: 3,
				requiresSelection: true
			}
		},
		'damage_4': {
			name: 'Атака IV',
			type: 'special',
			description: 'Наносит 4 ед. урона выбранному отряду противника',
			effect: {
				type: 'damage',
				target: 'unit',
				condition: 'enemy',
				value: 4,
				requiresSelection: true
			}
		},
		'damage_5': {
			name: 'Атака V',
			type: 'special',
			description: 'Наносит 5 ед. урона выбранному отряду противника',
			effect: {
				type: 'damage',
				target: 'unit',
				condition: 'enemy',
				value: 5,
				requiresSelection: true
			}
		},
		
		'damage_row_1': {
			name: 'Атака по ряду I',
			type: 'special',
			description: 'Наносит 1 ед. урона всем отрядам в выбранном ряду противника',
			effect: {
				type: 'damage_row',
				target: 'row',
				condition: 'enemy',
				value: 1,
				requiresRowSelection: true
			}
		},
		'damage_row_2': {
			name: 'Атака по ряду II',
			type: 'special',
			description: 'Наносит 2 ед. урона всем отрядам в выбранном ряду противника',
			effect: {
				type: 'damage_row',
				target: 'row',
				condition: 'enemy',
				value: 2,
				requiresRowSelection: true
			}
		},
		'damage_row_3': {
			name: 'Атака по ряду III',
			type: 'special',
			description: 'Наносит 3 ед. урона всем отрядам в выбранном ряду противника',
			effect: {
				type: 'damage_row',
				target: 'row',
				condition: 'enemy',
				value: 3,
				requiresRowSelection: true
			}
		},
		'damage_row_4': {
			name: 'Атака по ряду IV',
			type: 'special',
			description: 'Наносит 4 ед. урона всем отрядам в выбранном ряду противника',
			effect: {
				type: 'damage_row',
				target: 'row',
				condition: 'enemy',
				value: 4,
				requiresRowSelection: true
			}
		},
		'damage_row_5': {
			name: 'Атака по ряду V',
			type: 'special',
			description: 'Наносит 5 ед. урона всем отрядам в выбранном ряду противника',
			effect: {
				type: 'damage_row',
				target: 'row',
				condition: 'enemy',
				value: 5,
				requiresRowSelection: true
			}
		},

		'boost_1': {
			name: 'Усиление I',
			type: 'artifact',
			description: 'Усиливает выбранный отряд на 1 ед. силы',
			effect: {
				type: 'boost_card',
				target: 'unit',
				condition: 'ally',
				value: 1,
				requiresSelection: true
			}
		},
		'boost_2': {
			name: 'Усиление II',
			type: 'artifact',
			description: 'Усиливает выбранный отряд на 2 ед. силы',
			effect: {
				type: 'boost_card',
				target: 'unit',
				condition: 'ally',
				value: 2,
				requiresSelection: true
			}
		},
		'boost_3': {
			name: 'Усиление III',
			type: 'artifact',
			description: 'Усиливает выбранный отряд на 3 ед. силы',
			effect: {
				type: 'boost_card',
				target: 'unit',
				condition: 'ally',
				value: 3,
				requiresSelection: true
			}
		},
		'boost_4': {
			name: 'Усиление IV',
			type: 'artifact',
			description: 'Усиливает выбранный отряд на 4 ед. силы',
			effect: {
				type: 'boost_card',
				target: 'unit',
				condition: 'ally',
				value: 4,
				requiresSelection: true
			}
		},
		'boost_5': {
			name: 'Усиление V',
			type: 'artifact',
			description: 'Усиливает выбранный отряд на 5 ед. силы',
			effect: {
				type: 'boost_card',
				target: 'unit',
				condition: 'ally',
				value: 5,
				requiresSelection: true
			}
		},
		
		'boost_near_1': {
			name: 'Усиление союза I',
			type: 'artifact',
			description: 'Усиливает смежные отряды на 1 ед. силы',
			effect: {
				type: 'boost_near',
				target: 'unit',
				condition: 'ally',
				value: 1,
				requiresSelection: true
			}
		},
		'boost_near_2': {
			name: 'Усиление союза II',
			type: 'artifact',
			description: 'Усиливает смежные отряды на 2 ед. силы',
			effect: {
				type: 'boost_near',
				target: 'unit',
				condition: 'ally',
				value: 2,
				requiresSelection: true
			}
		},
		'boost_near_3': {
			name: 'Усиление союза III',
			type: 'artifact',
			description: 'Усиливает смежные отряды на 3 ед. силы',
			effect: {
				type: 'boost_near',
				target: 'unit',
				condition: 'ally',
				value: 3,
				requiresSelection: true
			}
		},
		'boost_near_4': {
			name: 'Усиление союза IV',
			type: 'artifact',
			description: 'Усиливает смежные отряды на 4 ед. силы',
			effect: {
				type: 'boost_near',
				target: 'unit',
				condition: 'ally',
				value: 4,
				requiresSelection: true
			}
		},
		'boost_near_5': {
			name: 'Усиление союза V',
			type: 'artifact',
			description: 'Усиливает смежные отряды на 5 ед. силы',
			effect: {
				type: 'boost_near',
				target: 'unit',
				condition: 'ally',
				value: 5,
				requiresSelection: true
			}
		},
		
		'boost_row_1': {
			name: 'Усиление ряда I',
			type: 'tactic',
			description: 'Усиливает все отряды в выбранном ряду на 1 ед. силы',
			effect: {
				type: 'boost_row',
				target: 'row',
				condition: 'ally',
				value: 1,
				requiresRowSelection: true
			}
		},
		'boost_row_2': {
			name: 'Усиление ряда II',
			type: 'tactic',
			description: 'Усиливает все отряды в выбранном ряду на 2 ед. силы',
			effect: {
				type: 'boost_row',
				target: 'row',
				condition: 'ally',
				value: 2,
				requiresRowSelection: true
			}
		},
		'boost_row_3': {
			name: 'Усиление ряда III',
			type: 'tactic',
			description: 'Усиливает все отряды в выбранном ряду на 3 ед. силы',
			effect: {
				type: 'boost_row',
				target: 'row',
				condition: 'ally',
				value: 3,
				requiresRowSelection: true
			}
		},
		'boost_row_4': {
			name: 'Усиление ряда IV',
			type: 'tactic',
			description: 'Усиливает все отряды в выбранном ряду на 4 ед. силы',
			effect: {
				type: 'boost_row',
				target: 'row',
				condition: 'ally',
				value: 4,
				requiresRowSelection: true
			}
		},
		'boost_row_5': {
			name: 'Усиление ряда V',
			type: 'tactic',
			description: 'Усиливает все отряды в выбранном ряду на 5 ед. силы',
			effect: {
				type: 'boost_row',
				target: 'row',
				condition: 'ally',
				value: 5,
				requiresRowSelection: true
			}
		},

		'double_row_strength': {
			name: 'Командирский рог',
			type: 'tactic',
			description: 'Удваивает силу всех отрядов в выбранном ряду',
			effect: {
				type: 'double_row_strength',
				target: 'row',
				condition: 'ally',
				multiplier: 2,
				requiresRowSelection: true
			}
		},

		'boost_tag_witcher_2': {
			name: 'Подготовка ведьмаков',
			type: 'special',
			description: 'Усиливает все отряды с тегом "Ведьмак" в одном ряду на 2 ед. силы',
			effect: {
				type: 'special_tag_boost',
				target: 'unit',
				condition: 'ally',
				value: 2,
				tag: 'witcher',
				requiresRowSelection: true
			}
		},
		'boost_tag_witcher_3': {
			name: 'Охотник на чудовищь',
			type: 'tactic',
			description: 'Усиливает все отряды с тегом "Ведьмак", в выбранном ряду, на 3 ед. силы',
			effect: {
				type: 'boost_tag',
				target: 'unit',
				condition: 'ally',
				value: 3,
				tag: 'witcher',
				requiresRowSelection: true
			}
		},
		'boost_tag_criminal': {
			name: 'Рэкет и Разбой',
			type: 'tactic',
			description: 'Усиливает все отряды с тегом "Преступник" в выбранном ряду на 2 ед. силы',
			effect: {
				type: 'boost_tag',
				target: 'unit',
				condition: 'ally',
				value: 2,
				tag: 'criminal',
				requiresRowSelection: true
			}
		}, 	
		'boost_tag_thirst': {
			name: 'Жажда крови',
			type: 'special',
			description: 'Усиливает все отряды с тегом "Вампир" в одном ряду на 2 ед. силы',
			effect: {
				type: 'special_tag_boost',
				target: 'unit',
				condition: 'ally',
				value: 2,
				tag: 'blood',
				requiresRowSelection: true
			}
		}, 	
		'boost_tag_dwarf': {
			name: 'Жар кузни',
			type: 'special',
			description: 'Усиливает все отряды с тегом "Краснолюд" в одном ряду на 1 ед. силы',
			effect: {
				type: 'special_tag_boost',
				target: 'unit',
				condition: 'ally',
				value: 1,
				tag: 'dwarf',
				requiresRowSelection: true
			}
		}, 	

	},

	applyFlockEffect: function(effect, context) {
		const playedCard = context.playedCard;
		
		if (!playedCard || !playedCard.tags || playedCard.tags.length === 0) {
			return { success: false, message: 'Карта не имеет тега для призыва стаи' };
		}
		
		const flockTag = playedCard.tags.find(tag => 
			tag !== 'hero' && tag !== 'герой' && 
			!playedCard.usedFlockTag
		);
		
		if (!flockTag) {
			return { success: false, message: 'Не найден тег для призыва стаи' };
		}
		
		playedCard.usedFlockTag = flockTag;
		
		let summonedCount = 0;
		const summonedCards = [];
		
		const handCards = [...context.playerHand];
		handCards.forEach(card => {
			if (card.id !== playedCard.id && 
				card.tags && 
				card.tags.includes(flockTag) &&
				card.type === 'unit') {
				
				const targetRow = this.getBestRowForCard(card, context);
				if (targetRow) {
					const cardIndex = context.playerHand.findIndex(c => c.id === card.id);
					if (cardIndex !== -1) {
						context.playerHand.splice(cardIndex, 1);
					}
					
					const placedCard = this.placeSummonedCard(card, targetRow, context);
					if (placedCard) {
						summonedCards.push(placedCard);
						summonedCount++;
					}
				}
			}
		});
		
		const deckCards = [...context.playerDeck];
		deckCards.forEach(card => {
			if (card.id !== playedCard.id &&
				card.tags && 
				card.tags.includes(flockTag) &&
				card.type === 'unit') {
				
				const targetRow = this.getBestRowForCard(card, context);
				if (targetRow) {
					const cardIndex = context.playerDeck.findIndex(c => c.id === card.id);
					if (cardIndex !== -1) {
						context.playerDeck.splice(cardIndex, 1);
					}
					
					const placedCard = this.placeSummonedCard(card, targetRow, context);
					if (placedCard) {
						summonedCards.push(placedCard);
						summonedCount++;
					}
				}
			}
		});
		
		if (window.gameModule) {
			window.gameModule.displayPlayerHand();
			window.gameModule.displayPlayerDeck();
			
			const rows = ['close', 'ranged', 'siege'];
			rows.forEach(row => {
				window.gameModule.updateRowStrength(row, 'player');
			});
		}
		
		return {
			success: true,
			message: `Призвано ${summonedCount} карт из стаи`,
			summonedCount: summonedCount,
			summonedCards: summonedCards,
			flockTag: flockTag
		};
	},

	getBestRowForCard: function(card, context) {
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
		
		const freeRows = availableRows.filter(row => 
			context.playerState.rows[row].cards.length < 9
		);
		
		if (freeRows.length === 0) return null;
		
		let bestRow = freeRows[0];
		let bestSynergy = -1;
		
		freeRows.forEach(row => {
			let synergy = 0;
			const rowCards = context.playerState.rows[row].cards;
			
			rowCards.forEach(existingCard => {
				if (existingCard.tags && card.tags) {
					const commonTags = card.tags.filter(tag => existingCard.tags.includes(tag));
					synergy += commonTags.length * 2;
				}
			});
			
			if (!context.weatherState.effects[row]) {
				synergy += 3;
			}
			
			if (synergy > bestSynergy) {
				bestSynergy = synergy;
				bestRow = row;
			}
		});
		
		return bestRow;
	},

	placeSummonedCard: function(card, row, context) {
		const rowState = context.playerState.rows[row];
		
		if (rowState.cards.length >= 9) return null;
		
		const cardCopy = window.gameModule ? 
			window.gameModule.createCardCopy(card) : { 
				...card, 
				uniqueId: `${card.id}_flock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				baseStrength: card.strength,
				currentStrength: card.strength,
				modifiedStrength: card.strength,
				underWeather: false,
				summonedByFlock: true
			};
		
		rowState.cards.push(cardCopy);
		
		if (window.gameModule) {
			window.gameModule.displayCardOnRow(row, cardCopy, 'player', rowState.cards.length - 1);
		}
		
		this.createSummonVisualEffect(cardCopy, row);
		
		return cardCopy;
	},

	createSummonVisualEffect: function(card, row) {
		if (!window.gameModule) return;
		
		const rowElement = document.getElementById(`player${this.capitalizeFirst(row)}Row`);
		if (!rowElement) return;
		
		const cardElement = rowElement.querySelector(`[data-card-id="${card.id}"]`);
		if (!cardElement) return;
		
		cardElement.style.opacity = '0';
		cardElement.style.transform = 'scale(0.5)';
		
		setTimeout(() => {
			cardElement.style.transition = 'all 0.3s ease-out';
			cardElement.style.opacity = '1';
			cardElement.style.transform = 'scale(1)';
			
			setTimeout(() => {
				cardElement.style.transition = '';
			}, 300);
		}, 10);
		
		const flashOverlay = document.createElement('div');
		flashOverlay.style.cssText = `
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: radial-gradient(circle, rgba(255,215,0,0.6) 0%, rgba(255,215,0,0) 70%);
			pointer-events: none;
			z-index: 50;
			animation: flockFlash 0.5s ease-out forwards;
		`;
		
		cardElement.appendChild(flashOverlay);
		
		setTimeout(() => {
			if (flashOverlay.parentNode) {
				flashOverlay.remove();
			}
		}, 500);
	},

	capitalizeFirst: function(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},

	applyBoostCardEffect: function(effect, context) {
		if (!context.gameState || !context.boostCardState) {
			return { 
				success: false, 
				message: 'Требуется выбор карты',
				requiresSelection: true,
				selectionType: 'boost_card'
			};
		}
		
		if (context.boostCardState && context.boostCardState.awaitingSelection) {
			const selectedCard = context.boostCardState.selectedCard;
			if (selectedCard) {
				return this.executeCardBoost(selectedCard, effect.value, context);
			}
		}
		
		return { 
			success: true, 
			message: 'Выберите карту для усиления',
			requiresSelection: true,
			selectionType: 'boost_card'
		};
	},

	applyBoostNearEffect: function(effect, context) {
		if (!context.gameState || !context.boostNearState) {
			return { 
				success: false, 
				message: 'Требуется выбор позиции',
				requiresSelection: true,
				selectionType: 'boost_near'
			};
		}
		
		if (context.boostNearState && context.boostNearState.awaitingSelection) {
			const selectedData = context.boostNearState.selectedData;
			if (selectedData) {
				return this.executeNearBoost(selectedData, effect.value, context);
			}
		}
		
		return { 
			success: true, 
			message: 'Выберите позицию для усиления соседних карт',
			requiresSelection: true,
			selectionType: 'boost_near'
		};
	},

	executeCardBoost: function(cardData, boostValue, context) {
		const { card, row, position } = cardData;
		
		if (!card || !row) {
			return { success: false, message: 'Ошибка: карта не найдена' };
		}
		
		if (card.type !== 'unit' || this.isHeroCard(card)) {
			return { success: false, message: 'Можно усиливать только обычные карты отрядов' };
		}
		
		if (card.originalStrength === undefined) {
			card.originalStrength = card.strength;
		}
		
		const currentStrength = card._displayStrength !== undefined ? 
			card._displayStrength : card.strength;
		
		card.strength = currentStrength + boostValue;
		card._displayStrength = card.strength;
		
		if (context.gameState) {
			context.gameState.player.rows[row].strength = 
				context.gameState.player.rows[row].cards.reduce((sum, c) => 
					sum + (c._displayStrength || c.strength || 0), 0
				);
		}
		
		if (window.gameModule) {
			window.gameModule.updateCardStrengthDisplay(card, row, 'player');
			window.gameModule.updateRowStrength(row, 'player');
		}
		
		return {
			success: true,
			message: `Карта "${card.name}" усилена на ${boostValue} ед. силы`,
			boostedCard: card,
			boostValue: boostValue
		};
	},

	executeNearBoost: function(selectedData, boostValue, context) {
		const { row, position } = selectedData;
		const rowState = context.gameState.player.rows[row];
		let boostedCards = 0;
		
		// Усиливаем карту слева
		if (position > 0) {
			const leftCard = rowState.cards[position - 1];
			if (leftCard.type === 'unit' && !this.isHeroCard(leftCard)) {
				if (leftCard.originalStrength === undefined) {
					leftCard.originalStrength = leftCard.strength;
				}
				
				const currentStrength = leftCard._displayStrength !== undefined ? 
					leftCard._displayStrength : leftCard.strength;
				
				leftCard.strength = currentStrength + boostValue;
				leftCard._displayStrength = leftCard.strength;
				boostedCards++;
				
				this.createVisualEffect(leftCard, 'boost', boostValue);
				this.updateCardDisplay(leftCard);
			}
		}
		
		// Усиливаем карту справа
		if (position < rowState.cards.length - 1) {
			const rightCard = rowState.cards[position + 1];
			if (rightCard.type === 'unit' && !this.isHeroCard(rightCard)) {
				if (rightCard.originalStrength === undefined) {
					rightCard.originalStrength = rightCard.strength;
				}
				
				const currentStrength = rightCard._displayStrength !== undefined ? 
					rightCard._displayStrength : rightCard.strength;
				
				rightCard.strength = currentStrength + boostValue;
				rightCard._displayStrength = rightCard.strength;
				boostedCards++;
				
				this.createVisualEffect(rightCard, 'boost', boostValue);
				this.updateCardDisplay(rightCard);
			}
		}
		
		if (context.gameState) {
			context.gameState.player.rows[row].strength = 
				rowState.cards.reduce((sum, card) => 
					sum + (card._displayStrength || card.strength || 0), 0
				);
		}
		
		if (window.gameModule) {
			window.gameModule.updateRowStrength(row, 'player');
		}
		
		return {
			success: true,
			message: `Усилено ${boostedCards} соседних карт на ${boostValue} ед. силы`,
			boostedCount: boostedCards,
			boostValue: boostValue
		};
	},

	applyBoostRowEffect: function(effect, context) {
		if (!context.gameState || !context.boostRowState) {
			return { 
				success: false, 
				message: 'Требуется выбор ряда',
				requiresRowSelection: true,
				selectionType: 'boost_row'
			};
		}
		
		if (context.boostRowState && context.boostRowState.awaitingSelection) {
			const selectedRow = context.boostRowState.selectedRow;
			if (selectedRow) {
				return this.executeRowBoost(selectedRow, effect.value, context);
			}
		}
		
		return { 
			success: true, 
			message: 'Выберите ряд для усиления',
			requiresRowSelection: true,
			selectionType: 'boost_row'
		};
	},

	applyBoostTagEffect: function(effect, context) {
		if (!effect.tag) {
			return { success: false, message: 'Не указан тег для усиления' };
		}
		
		if (!context.gameState || !context.boostTagState) {
			return { 
				success: false, 
				message: 'Требуется выбор ряда',
				requiresRowSelection: true,
				selectionType: 'boost_tag',
				tag: effect.tag
			};
		}
		
		if (context.boostTagState && context.boostTagState.awaitingSelection) {
			const selectedRow = context.boostTagState.selectedRow;
			if (selectedRow) {
				return this.executeTagBoost(effect.tag, effect.value, selectedRow, context);
			}
		}
		
		return { 
			success: true, 
			message: `Выберите ряд для усиления карт с тегом "${effect.tag}"`,
			requiresRowSelection: true,
			selectionType: 'boost_tag',
			tag: effect.tag
		};
	},

	executeRowBoost: function(row, boostValue, context) {
		const rowState = context.gameState.player.rows[row];
		let boostedCards = 0;
		
		rowState.cards.forEach(card => {
			if (card.type === 'unit' && !this.isHeroCard(card)) {
				if (card.originalStrength === undefined) {
					card.originalStrength = card.strength;
				}
				
				const currentStrength = card._displayStrength !== undefined ? 
					card._displayStrength : card.strength;
				
				card.strength = currentStrength + boostValue;
				card._displayStrength = card.strength;
				
				boostedCards++;
				
				this.createVisualEffect(card, 'boost', boostValue);
				this.updateCardDisplay(card);
			}
		});
		
		if (context.gameState) {
			context.gameState.player.rows[row].strength = rowState.cards.reduce((sum, card) => 
				sum + (card._displayStrength || card.strength || 0), 0
			);
		}
		
		if (window.gameModule) {
			window.gameModule.updateRowStrength(row, 'player');
		}
		
		return {
			success: true,
			message: `Усилено ${boostedCards} карт в ряду ${row} на ${boostValue}`,
			boostedCount: boostedCards
		};
	},

	executeTagBoost: function(tag, boostValue, selectedRow, context) {
		let boostedCards = 0;
		
		const rowState = context.gameState.player.rows[selectedRow];
		
		rowState.cards.forEach(card => {
			if (card.type === 'unit' && 
				!this.isHeroCard(card) && 
				card.tags && 
				card.tags.includes(tag)) {
				
				if (card.originalStrength === undefined) {
					card.originalStrength = card.strength;
				}
				
				const currentStrength = card._displayStrength !== undefined ? 
					card._displayStrength : card.strength;
				
				card.strength = currentStrength + boostValue;
				card._displayStrength = card.strength;
				
				boostedCards++;
				
				this.updateCardDisplay(card);
			}
		});
		
		if (context.gameState) {
			context.gameState.player.rows[selectedRow].strength = rowState.cards.reduce((sum, card) => 
				sum + (card._displayStrength || card.strength || 0), 0
			);
		}
		
		return {
			success: true,
			boostedCount: boostedCards
		};
	},

	applyDamageRowEffect: function(effect, context) {
		if (!context.gameState || !context.damageRowState) {
			return { 
				success: false, 
				message: 'Требуется выбор ряда',
				requiresRowSelection: true
			};
		}
		
		if (context.damageRowState && context.damageRowState.awaitingSelection) {
			const selectedRow = context.damageRowState.selectedRow;
			if (selectedRow) {
				return this.executeRowDamage(selectedRow, effect.value, context);
			}
		}
		
		return { 
			success: true, 
			message: 'Выберите ряд противника для нанесения урона',
			requiresRowSelection: true
		};
	},

	executeRowDamage: function(row, damageValue, context) {
		const rowState = context.gameState.opponent.rows[row];
		let damagedCards = 0;
		let destroyedCards = 0;
		
		rowState.cards.forEach(card => {
			if (card.type === 'unit') {
				const originalStrength = card.strength;
				card.strength = Math.max(0, card.strength - damageValue);
				
				if (card.strength === 0) {
					destroyedCards++;
					this.destroyCard(card);
				} else {
					damagedCards++;
					this.updateCardDisplay(card);
				}
				
				this.createVisualEffect(card, 'damage', damageValue);
			}
		});
		
		this.updateRowStrength(row, 'opponent');
		
		return {
			success: true,
			message: `Нанесен урон ${damageValue} по ряду ${row}. Повреждено: ${damagedCards}, уничтожено: ${destroyedCards}`,
			damagedCount: damagedCards,
			destroyedCount: destroyedCards
		};
	},

	canActivateAbility: function(ability, context) {
		if (ability.type === 'leader' && context.leaderUsed) {
			return false;
		}
		
		if (ability.id === 'flock' || (ability.effect && ability.effect.type === 'flock')) {
			return true;
		}

		const targets = this.findTargets(ability.effect, context);
		return targets.length > 0 || ability.effect.type === 'clear_weather';
	},

	applyEffect: function(effect, context) {
		try {
			switch (effect.type) {
				case 'boost':
					return this.applyBoostEffect(effect, context);
				case 'damage':
					return this.applyDamageEffect(effect, context);
				case 'conditional_damage':
					return this.applyConditionalDamageEffect(effect, context);
				case 'summon':
					return this.applySummonEffect(effect, context);
				case 'weather':
					return this.applyWeatherEffect(effect, context);
				case 'clear_weather':
					return this.applyClearWeatherEffect(context);
				case 'destroy_strongest_enemy':
					return this.applyDestroyStrongestEnemyEffect(effect, context);
				case 'destroy_artifact':
					return this.applyDestroyArtifactEffect(effect, context);
				case 'reveal':
					return this.applyRevealEffect(effect, context);
				case 'swap_with_hand':
					return this.applySwapEffect(effect, context);
				case 'flock':
					return this.applyFlockEffect(effect, context);
				case 'damage_row': 
					return this.applyDamageRowEffect(effect, context);
				case 'boost_row':
					return this.applyBoostRowEffect(effect, context);
				case 'boost_tag':
					return this.applyBoostTagEffect(effect, context);
				case 'boost_card':
					return this.applyBoostCardEffect(effect, context);
				case 'boost_near':
					return this.applyBoostNearEffect(effect, context);
				case 'double_row_strength':
					return this.applyDoubleRowStrengthEffect(effect, context);
				default:
					return { success: false, message: 'Неизвестный тип эффекта' };
			}
		} catch (error) {
			return { success: false, message: 'Ошибка применения способности' };
		}
	},

	applyDestroyArtifactEffect: function(effect, context) {
		const enemyArtifacts = this.findEnemyArtifacts(context);
		
		if (enemyArtifacts.length === 0) {
			return { 
				success: false,
				requiresSelection: true,
				selectionType: 'artifact_on_board'
			};
		}
		
		if (context.destroyArtifactState && context.destroyArtifactState.awaitingSelection) {
			const selectedArtifact = context.destroyArtifactState.selectedCard;
			if (selectedArtifact && (selectedArtifact.type === 'artifact' || selectedArtifact.type === 'tactic')) {
				return this.executeArtifactDestroy(selectedArtifact, context);
			}
		}
		
		return { 
			success: true, 
			message: 'Выберите артефакт противника для уничтожения',
			requiresSelection: true,
			selectionType: 'artifact_on_board'
		};
	},

	findEnemyArtifacts: function(context) {
		if (!context.gameState || !context.gameState.opponent) return [];
		
		const artifacts = [];
		const rows = ['close', 'ranged', 'siege'];
		
		rows.forEach(row => {
			if (context.gameState.opponent.rows[row].tactic) {
				artifacts.push({
					card: context.gameState.opponent.rows[row].tactic,
					row: row,
					type: 'tactic',
					location: 'tactic_slot'
				});
			}
			
			const rowCards = context.gameState.opponent.rows[row].cards || [];
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

	executeArtifactDestroy: function(artifactData, context) {
		const { card, row, type, location } = artifactData;
		
		this.createDestroyArtifactVisualEffect(card, row, type);
		
		if (type === 'tactic' && location === 'tactic_slot') {
			delete context.gameState.opponent.rows[row].tactic;
			
			if (window.gameModule) {
				const tacticSlot = document.getElementById(`opponent${row.charAt(0).toUpperCase() + row.slice(1)}Tactics`);
				if (tacticSlot) {
					tacticSlot.innerHTML = '';
				}
			}
		} else if (type === 'artifact' && location === 'row') {
			const rowState = context.gameState.opponent.rows[row];
			const cardIndex = rowState.cards.findIndex(c => c.id === card.id);
			if (cardIndex !== -1) {
				rowState.cards.splice(cardIndex, 1);
				
				if (window.gameModule) {
					window.gameModule.removeCardFromBoardVisual(card, row, 'opponent');
					window.gameModule.updateRowStrength(row, 'opponent');
				}
			}
		}
		
		const destroyedCardCopy = { ...card };
		context.gameState.opponent.discard.push(destroyedCardCopy);
		
		return { 
			success: true, 
			message: `Уничтожен артефакт: ${card.name}`,
			destroyedCard: card
		};
	},

	createDestroyArtifactVisualEffect: function(card, row, type) {
		if (!window.gameModule) return;
		
		let targetElement;
		
		if (type === 'tactic') {
			const tacticSlot = document.getElementById(`opponent${row.charAt(0).toUpperCase() + row.slice(1)}Tactics`);
			if (tacticSlot) {
				targetElement = tacticSlot.querySelector(`[data-card-id="${card.id}"]`);
			}
		} else {
			const rowElement = document.getElementById(`opponent${row.charAt(0).toUpperCase() + row.slice(1)}Row`);
			if (rowElement) {
				targetElement = rowElement.querySelector(`[data-card-id="${card.id}"]`);
			}
		}
		
		if (!targetElement) return;
		
		const destroyEffect = document.createElement('div');
		destroyEffect.className = 'destroy-artifact-effect';
		destroyEffect.style.cssText = `
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: url('card/destroy_card.jpg') center/cover no-repeat;
			z-index: 100;
			animation: destroyArtifactAnimation 1s ease-out forwards;
			border-radius: 5px;
		`;
		
		targetElement.appendChild(destroyEffect);
		
		if (window.audioManager && window.audioManager.playSound) {
			audioManager.playSound('card_destroy');
		}
		
		setTimeout(() => {
			if (destroyEffect.parentNode) {
				destroyEffect.remove();
			}
		}, 1000);
	},

	applyDestroyStrongestEnemyEffect: function(effect, context) {
		const strongestCards = this.findStrongestEnemyCards(context);
		
		if (strongestCards.length === 0) {
			return { success: false, message: 'Нет подходящих целей у противника' };
		}
		
		const targetCard = strongestCards[0];
		
		this.createDestroyVisualEffect(targetCard);
		
		this.destroyEnemyCard(targetCard, context);
		
		return { 
			success: true, 
			message: `Уничтожена карта ${targetCard.name} (сила: ${targetCard.currentStrength || targetCard.strength})`,
			destroyedCard: targetCard
		};
	},

	findStrongestEnemyCards: function(context) {
		const strongestCards = this.findStrongestEnemyCards(context);
		
		const nonHeroCards = strongestCards.filter(cardData => 
			!(cardData.card.tags && (cardData.card.tags.includes('hero') || cardData.card.tags.includes('герой')))
		);
		
		if (nonHeroCards.length === 0) {
			return { success: false, message: 'Нет подходящих целей у противника (герои не могут быть уничтожены)' };
		}
		
		const targetCard = nonHeroCards[0];
		
		if (!context.gameBoard || !context.gameState) return [];
		
		const enemyCards = [];
		const rows = ['close', 'ranged', 'siege'];
		
		rows.forEach(row => {
			if (context.gameState.opponent && context.gameState.opponent.rows) {
				const rowCards = context.gameState.opponent.rows[row].cards || [];
				rowCards.forEach(card => {
					if (card.type === 'unit') {
						enemyCards.push({
							card: card,
							row: row,
							strength: card.currentStrength || card.strength || 0
						});
					}
				});
			}
		});
		
		if (enemyCards.length === 0) return [];
		
		enemyCards.sort((a, b) => b.strength - a.strength);
		
		const maxStrength = enemyCards[0].strength;
		
		return enemyCards.filter(card => card.strength === maxStrength);
	},

	createDestroyVisualEffect: function(targetCardData) {
		if (!window.gameModule) return;
		
		const { card, row } = targetCardData;
		
		const rowElement = document.getElementById(`opponent${row.charAt(0).toUpperCase() + row.slice(1)}Row`);
		if (!rowElement) return;
		
		const cardElement = rowElement.querySelector(`[data-card-id="${card.id}"]`);
		if (!cardElement) return;
		
		const destroyEffect = document.createElement('div');
		destroyEffect.className = 'destroy-effect';
		destroyEffect.style.cssText = `
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: url('card/destroy_card.jpg') center/cover no-repeat;
			z-index: 100;
			animation: destroyAnimation 1s ease-out forwards;
		`;
		
		cardElement.appendChild(destroyEffect);
		
		setTimeout(() => {
			if (destroyEffect.parentNode) {
				destroyEffect.remove();
			}
		}, 1000);
	},

	applySwapEffect: function(effect, context) {
		if (context.decoyState && context.decoyState.awaitingSelection) {
			if (context.decoyState.selectedCard && context.decoyState.selectedCard.type === 'unit') {
				const cardToSwap = context.decoyState.selectedCard;
				
				const decoyCard = context.playerHand.find(card => 
					card.ability === 'decoy' || card.id === 'neutral_special_5'
				);
				
				if (!decoyCard) {
					return { success: false, message: 'Чучело не найдено в руке' };
				}
				
				const decoyIndex = context.playerHand.indexOf(decoyCard);
				if (decoyIndex !== -1) {
					context.playerHand.splice(decoyIndex, 1);
				}
				
				if (window.gameModule && window.gameModule.removeCardFromBoard) {
					window.gameModule.removeCardFromBoard(cardToSwap);
				}
				
				const cardCopy = { ...cardToSwap };
				cardCopy.playedThisRound = false;
				context.playerHand.push(cardCopy);
				
				decoyCard.owner = 'player';
				decoyCard.row = cardToSwap.row;
				decoyCard.positionInRow = cardToSwap.positionInRow;
				
				if (window.gameModule && window.gameModule.placeCardOnBoard) {
					window.gameModule.placeCardOnBoard(decoyCard, decoyCard.row, decoyCard.positionInRow);
				}
				
				if (window.gameModule) {
					window.gameModule.displayPlayerHand();
					window.gameModule.updateRowStrength(cardToSwap.row);
				}
				
				context.decoyState = null;
				
				return { 
					success: true, 
					message: `Карта ${cardToSwap.name} заменена на Чучело`,
					swappedCard: cardToSwap
				};
			}
		}
		
		return { 
			success: true, 
			message: 'Выберите карту на поле для замены на Чучело',
			requiresSelection: true,
			selectionType: 'unit_on_board'
		};
	},

    applyBoostEffect: function(effect, context) {
        const targets = this.findTargets(effect, context);
        
        if (targets.length === 0) {
            return { success: false, message: 'Нет подходящих целей' };
        }

        targets.forEach(target => {
            const boostValue = effect.value || 1;
            this.boostCard(target, boostValue);
            this.createVisualEffect(target, 'boost', boostValue);
        });

        return { 
            success: true,
            targets: targets.length
        };
    },

	applyDamageEffect: function(effect, context) {
		const targets = this.findTargets(effect, context);
		const nonHeroTargets = targets.filter(card => 
			!(card.tags && (card.tags.includes('hero') || card.tags.includes('герой')))
		);
		
		if (nonHeroTargets.length === 0) {
			return { success: false, message: 'Нет подходящих целей (герои не могут быть повреждены)' };
		}

		nonHeroTargets.forEach(target => {
			const damageValue = effect.value || 1;
			this.damageCard(target, damageValue);
			this.createVisualEffect(target, 'damage', damageValue);
		});

		return { 
			success: true, 
			message: `Нанесен урон ${nonHeroTargets.length} целям`,
			targets: nonHeroTargets.length
		};
	},

    applyConditionalDamageEffect: function(effect, context) {
        const target = this.findSingleTarget(effect, context);
        
        if (!target) {
            return { success: false, message: 'Нет подходящей цели' };
        }

        this.damageCard(target, effect.baseDamage);
        
        if (this.checkCondition(effect.condition, target)) {
            if (effect.bonusEffect === 'destroy') {
                this.destroyCard(target);
                return { 
                    success: true, 
                    message: 'Урон нанесен и цель уничтожена',
                    destroyed: true
                };
            }
        }

        return { 
            success: true, 
            message: 'Нанесен урон цели',
            conditionMet: false
        };
    },

    applyWeatherEffect: function(effect, context) {
        if (!context.gameBoard) {
            return { success: false, message: 'Игровое поле не доступно' };
        }

        const result = context.gameBoard.setWeather(
            effect.weatherType, 
            effect.row, 
            effect.target,
            effect.strengthCap,
            effect.damage
        );

        return result ? 
            { success: true, message: `Погода применена к ряду ${effect.row}` } :
            { success: false, message: 'Ошибка применения погоды' };
    },

    applyClearWeatherEffect: function(context) {
        if (!context.gameBoard) {
            return { success: false, message: 'Игровое поле не доступно' };
        }

        const result = context.gameBoard.clearWeather();
        return result ? 
            { success: true, message: 'Погода очищена' } :
            { success: false, message: 'Ошибка очистки погоды' };
    },

    applySummonEffect: function(effect, context) {
        const availableCards = this.findSummonableCards(effect, context);
        
        if (availableCards.length === 0) {
            return { success: false, message: 'Нет карт для призыва' };
        }

        const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
        const summonedCard = this.summonCard(randomCard, context);
        
        return summonedCard ? 
            { success: true, message: `Призван ${summonedCard.name}`, card: summonedCard } :
            { success: false, message: 'Ошибка призыва карты' };
    },

    applyDestroyEffect: function(effect, context) {
        const targets = this.findStrongestCards(effect, context);
        
        if (targets.length === 0) {
            return { success: false, message: 'Нет целей для уничтожения' };
        }

        targets.forEach(target => {
            this.destroyCard(target);
        });

        return { 
            success: true, 
            message: `Уничтожено ${targets.length} самых сильных карт`,
            targets: targets.length
        };
    },

    applyRevealEffect: function(effect, context) {
        const revealedCards = this.revealOpponentCards(effect.count, context);
        
        return { 
            success: true, 
            message: `Показано ${revealedCards.length} карт противника`,
            cards: revealedCards
        };
    },

	findTargets: function(effect, context) {
		const { target, condition, row, count } = effect;
		let targets = [];

		if (!context.gameBoard) return targets;

		switch (target) {
			case 'row':
				targets = context.gameBoard.getCardsInRow(row, condition);
				break;
			case 'random':
				targets = context.gameBoard.getRandomCards(condition, count || 1);
				break;
			case 'strongest':
				targets = context.gameBoard.getStrongestCards(condition);
				break;
			case 'unit':
				targets = context.gameBoard.getCardsByCondition(card => 
					card.type === 'unit' && 
					this.checkCardCondition(card, condition) &&
					!(card.tags && (card.tags.includes('hero') || card.tags.includes('герой')))
				);
				break;
			default:
				targets = context.gameBoard.getAllCards(condition);
		}

		targets = targets.filter(card => 
			!(card.tags && (card.tags.includes('hero') || card.tags.includes('герой')))
		);

		return targets.slice(0, count || targets.length);
	},

    findSingleTarget: function(effect, context) {
        const targets = this.findTargets(effect, context);
        return targets.length > 0 ? targets[0] : null;
    },

    findSummonableCards: function(effect, context) {
        const { filters, faction } = effect;
        return context.playerDeck.filter(card => {
            if (faction && card.faction !== faction) return false;
            if (filters && !filters.some(filter => card.tags?.includes(filter))) return false;
            return card.type === 'unit';
        });
    },

    findStrongestCards: function(effect, context) {
        if (!context.gameBoard) return [];
        
        const allCards = context.gameBoard.getAllCards(effect.condition);
        if (allCards.length === 0) return [];

        const maxStrength = Math.max(...allCards.map(card => card.currentStrength));
        return allCards.filter(card => card.currentStrength === maxStrength);
    },

    checkCondition: function(condition, card) {
        switch (condition) {
            case 'strength_multiple_of_3':
                return card.currentStrength % 3 === 0;
            default:
                return true;
        }
    },

    checkCardCondition: function(card, condition) {
        switch (condition) {
            case 'ally':
                return card.owner === 'player';
            case 'enemy':
                return card.owner === 'opponent';
            case 'all':
                return true;
            default:
                return true;
        }
    },

    boostCard: function(card, value) {
        card.currentStrength += value;
        card.state = this.cardStates.BOOSTED;
        this.updateCardDisplay(card);
    },

    damageCard: function(card, value) {
        card.currentStrength = Math.max(0, card.currentStrength - value);
        card.state = card.currentStrength === 0 ? this.cardStates.DESTROYED : this.cardStates.DAMAGED;
        
        this.updateCardDisplay(card);
        
        if (card.currentStrength === 0) {
            this.onCardDestroyed(card);
        }
    },

    destroyCard: function(card) {
        card.currentStrength = 0;
        card.state = this.cardStates.DESTROYED;
        this.onCardDestroyed(card);
    },

    summonCard: function(cardData, context) {
        const summonedCard = {
            ...cardData,
            id: `${cardData.id}_summoned_${Date.now()}`,
            currentStrength: cardData.strength,
            owner: 'player',
            state: this.cardStates.ACTIVE
        };

        if (context.gameBoard.placeCard(summonedCard, 'any', 'player')) {
            return summonedCard;
        }
        
        return null;
    },

    revealOpponentCards: function(count, context) {
        const opponentHand = context.opponentHand || [];
        const revealedCards = opponentHand.slice(0, count);
        
        revealedCards.forEach(card => {
            card.revealed = true;
        });
        
        return revealedCards;
    },

    createVisualEffect: function(card, effectType, value) {
        if (!window.gameModule) return;
        
        const effect = {
            type: effectType,
            cardId: card.id,
            value: value,
            duration: 1000
        };
        
        window.gameModule.createVisualEffect(effect);
    },

    updateCardDisplay: function(card) {
        const cardElement = document.querySelector(`[data-card-id="${card.id}"]`);
        if (cardElement) {
            const strengthElement = cardElement.querySelector('.card__strength');
            if (strengthElement) {
                strengthElement.textContent = card.currentStrength;
                strengthElement.classList.add('strength-update');
                setTimeout(() => {
                    strengthElement.classList.remove('strength-update');
                }, 500);
            }
        }
    },

    onCardDestroyed: function(card) {
        if (window.gameModule) {
            window.gameModule.removeCardFromBoard(card);
        }
    },

    onAbilityActivated: function(ability, context) {
        if (ability.type === 'leader') {
            context.leaderUsed = true;
        }
    },

    initialize: function() {
        this.enhanceCardsWithAbilities();
    },

    enhanceCardsWithAbilities: function() {
        if (!window.cardsModule || !window.cardsModule.cardsData) {
            return;
        }

        const cardsData = window.cardsModule.cardsData;
        
        Object.values(cardsData).forEach(faction => {
            if (faction.units) {
                faction.units.forEach(unit => {
                    if (unit.tags && unit.tags.includes('witcher')) {
                        unit.ability = unit.ability || 'geralt';
                    }
                    if (unit.tags && unit.tags.includes('wild_hunt')) {
                        unit.ability = unit.ability || 'morale_boost';
                    }
                });
            }

            if (faction.specials) {
                faction.specials.forEach(special => {
                    if (special.tags && special.tags.includes('weather')) {
                        switch(special.name) {
                            case 'Белый Хлад':
								special.ability = 'biting_frost';
                                break;
                            case 'Трескучий мороз':
                                special.ability = 'frost';
                                break;
                            case 'Густой туман':
                                special.ability = 'impenetrable_fog';
                                break;
                            case 'Проливной дождь':
                                special.ability = 'torrential_rain';
                                break;
                            case 'Чистое небо':
                                special.ability = 'clear_weather';
                                break;
                            case 'Шторм Скеллиге':
                                special.ability = 'storm';
                                break;
                        }
                    }
                });
            }
        });
    }
};

skillSystem.updateCallAbilityDescription = function(card) {
    if (card.ability === 'call' && card.summon) {
        // Получаем информацию о призываемой карте
        let summonedCard = null;
        let copyCount = 1;
        
        // Ищем карту в глобальной коллекции
        if (window.cardsModule && window.cardsModule.cardsData) {
            for (const factionName in window.cardsModule.cardsData) {
                const faction = window.cardsModule.cardsData[factionName];
                for (const cardType in faction) {
                    if (Array.isArray(faction[cardType])) {
                        const foundCard = faction[cardType].find(c => c.name === card.summon);
                        if (foundCard) {
                            summonedCard = foundCard;
                            copyCount = foundCard.copy || 1;
                            break;
                        }
                    }
                }
                if (summonedCard) break;
            }
        }
        
        // Формируем описание в зависимости от количества копий
        let description = '';
        if (copyCount === 1) {
            description = `Призывает на поле карту "${card.summon}".`;
        } else if (copyCount > 1) {
            description = `Призывает на поле ${copyCount} копии карты "${card.summon}".`;
        }
        
        // Обновляем описание способности для этой карты
        if (skillSystem.abilities['call']) {
            // Создаем уникальное описание для конкретной карты
            // Сохраняем оригинальное описание в отдельном поле, если нужно
            if (!skillSystem.abilities['call']._originalDescription) {
                skillSystem.abilities['call']._originalDescription = skillSystem.abilities['call'].description;
            }
            skillSystem.abilities['call'].description = description;
        }
    }
};

const originalEnhanceCardsWithAbilities = skillSystem.enhanceCardsWithAbilities;

skillSystem.enhanceCardsWithAbilities = function() {
    originalEnhanceCardsWithAbilities.call(this);
    
    // Проходим по всем картам и обновляем описания способностей call
    if (window.cardsModule && window.cardsModule.cardsData) {
        for (const factionName in window.cardsModule.cardsData) {
            const faction = window.cardsModule.cardsData[factionName];
            for (const cardType in faction) {
                if (Array.isArray(faction[cardType])) {
                    faction[cardType].forEach(card => {
                        if (card.ability === 'call') {
                            this.updateCallAbilityDescription(card);
                        }
                    });
                }
            }
        }
    }
};

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            if (window.cardsModule && window.cardsModule.cardsData) {
                for (const factionName in window.cardsModule.cardsData) {
                    const faction = window.cardsModule.cardsData[factionName];
                    for (const cardType in faction) {
                        if (Array.isArray(faction[cardType])) {
                            faction[cardType].forEach(card => {
                                if (card.ability === 'call' && skillSystem.updateCallAbilityDescription) {
                                    skillSystem.updateCallAbilityDescription(card);
                                }
                            });
                        }
                    }
                }
            }
        }, 100);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    skillSystem.initialize();
});

window.skillSystem = skillSystem;