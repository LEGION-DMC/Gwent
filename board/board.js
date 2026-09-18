const boardModule = {
    gameState: null,
    boardElement: null,
    _previewEnterHandler: null,
    _previewLeaveHandler: null,
    _previewObserver: null,

    initGameBoard: function() {
        this.hideDeckBuilding();
        this.createBoardHTML();
        this.setupBoardEventListeners();
        this.animateBoardEntrance();

        setTimeout(() => {
            if (window.gameModule && window.gameModule.init) {
                window.gameModule.init();
            }
            // Инициализируем иконку способности после загрузки игры
            setTimeout(() => {
                this.initAbilityIcon();
                // Инициализируем превью карт
                this.initCardPreview();
            }, 500);
        }, 100);
    },

    initCardPreview: function() {
        // Даем время на рендеринг карт
        setTimeout(() => {
            this.setupCardPreview();
        }, 800);
    },

    setupCardPreview: function() {
        // Навешиваем обработчики на все карты на доске и в руке
        this.setupPreviewForCards('.hand-card, .board-card, .weather-card, .leader-card-on-board');
        
        // Используем MutationObserver для новых карт
        this.setupPreviewObserver();
    },

    setupPreviewForCards: function(selector) {
        const cards = document.querySelectorAll(selector);
        cards.forEach(card => {
            this.addPreviewListeners(card);
        });
    },

    addPreviewListeners: function(cardElement) {
        // Удаляем старые обработчики, чтобы избежать дублирования
        cardElement.removeEventListener('mouseenter', this._previewEnterHandler);
        cardElement.removeEventListener('mouseleave', this._previewLeaveHandler);
        
        // Сохраняем ссылки на обработчики
        this._previewEnterHandler = (event) => {
            const cardData = this.extractCardData(cardElement);
            if (cardData) {
                this.showCardPreview(cardData, event);
            }
        };
        
        this._previewLeaveHandler = () => {
            this.hideCardPreview();
        };
        
        cardElement.addEventListener('mouseenter', this._previewEnterHandler);
        cardElement.addEventListener('mouseleave', this._previewLeaveHandler);
    },

	extractCardData: function(cardElement) {
		const cardData = {};
		
		// Пытаемся получить данные из data-атрибутов
		cardData.id = cardElement.dataset.cardId || cardElement.dataset.id || '';
		cardData.name = cardElement.dataset.cardName || 
						cardElement.querySelector('.hand-card-name, .board-card-name, .weather-card-name, .leader-card-name')?.textContent || 
						'Карта';
		
		// Сила - ищем в разных местах
		let strengthEl = cardElement.querySelector('.hand-card-strength, .board-card-strength');
		if (strengthEl) {
			cardData.strength = parseInt(strengthEl.textContent) || null;
		} else if (cardElement.dataset.strength) {
			cardData.strength = parseInt(cardElement.dataset.strength) || null;
		} else {
			cardData.strength = null;
		}
		
		// Определяем тип карты
		if (cardElement.dataset.type) {
			cardData.type = cardElement.dataset.type;
		} else if (cardElement.classList.contains('leader-card-on-board') || 
				   cardElement.dataset.cardId?.includes('leader') ||
				   cardElement.querySelector('.leader-card-name')) {
			cardData.type = 'leader';
		} else if (cardElement.classList.contains('tactic')) {
			cardData.type = 'tactic';
		} else {
			cardData.type = 'unit';
		}
		
		cardData.position = cardElement.dataset.position || null;
		cardData.rarity = cardElement.dataset.rarity || 'bronze';
		cardData.faction = cardElement.dataset.faction || null;
		cardData.ability = cardElement.dataset.ability || '';
		cardData.description = cardElement.dataset.description || '';
		cardData.descriptionfull = cardElement.dataset.descriptionfull || '';
		cardData.image = cardElement.dataset.image || '';
		cardData.tags = cardElement.dataset.tags ? cardElement.dataset.tags.split(',') : [];
		
		// Медиа
		const mediaEl = cardElement.querySelector('.hand-card-media, .board-card-media, .weather-card-media, .leader-card-media');
		if (mediaEl) {
			if (mediaEl.tagName === 'VIDEO') {
				const source = mediaEl.querySelector('source');
				cardData.media = source ? source.src : mediaEl.src;
				cardData.isVideo = true;
			} else {
				cardData.media = mediaEl.src;
				cardData.isVideo = false;
			}
		} else {
			cardData.media = '';
		}
		
		// Рамка
		const borderEl = cardElement.querySelector('.hand-card-border, .board-card-border, .weather-card-border, .leader-card-border, .leader__border');
		if (borderEl) {
			cardData.border = borderEl.src;
		}
		
		// Баннер
		const bannerEl = cardElement.querySelector('.hand-card-banner, .board-card-banner, .weather-card-banner, .leader-card-banner, .leader__banner');
		if (bannerEl) {
			cardData.banner = bannerEl.src;
		}
		
		// Позиция (иконка)
		const posIconEl = cardElement.querySelector('.hand-card-position-icon, .board-card-position-icon');
		if (posIconEl) {
			cardData.positionIcon = posIconEl.src;
			const src = posIconEl.src;
			if (src.includes('close')) cardData.position = 'close';
			else if (src.includes('ranged')) cardData.position = 'ranged';
			else if (src.includes('siege')) cardData.position = 'siege';
			else if (src.includes('any')) cardData.position = 'any';
		}
		
		// Если есть объект карты в data
		if (cardElement.dataset.cardData) {
			try {
				const parsed = JSON.parse(cardElement.dataset.cardData);
				Object.assign(cardData, parsed);
			} catch (e) {}
		}
		
		// ===== ПОИСК В CARDSDATA =====
		if (window.cardsData) {
			for (const factionName in window.cardsData) {
				const factionData = window.cardsData[factionName];
				for (const cardType in factionData) {
					if (Array.isArray(factionData[cardType])) {
						const foundCard = factionData[cardType].find(c => c.id === cardData.id);
						if (foundCard) {
							if (!cardData.namefull && foundCard.namefull) cardData.namefull = foundCard.namefull;
							if (!cardData.descriptionfull && foundCard.descriptionfull) cardData.descriptionfull = foundCard.descriptionfull;
							if (!cardData.description && foundCard.description) cardData.description = foundCard.description;
							if (!cardData.ability && foundCard.ability) cardData.ability = foundCard.ability;
							if (!cardData.image && foundCard.image) cardData.image = foundCard.image;
							if (!cardData.tags || cardData.tags.length === 0) cardData.tags = foundCard.tags || [];
							if (!cardData.faction) cardData.faction = foundCard.faction || factionName;
							if (!cardData.rarity && foundCard.rarity) cardData.rarity = foundCard.rarity;
							if (!cardData.type && foundCard.type) cardData.type = foundCard.type;
							if (!cardData.position && foundCard.position) cardData.position = foundCard.position;
							if (cardData.strength === null && foundCard.strength !== undefined) {
								cardData.strength = foundCard.strength;
							}
							if (!cardData.border && foundCard.border) cardData.border = foundCard.border;
							if (!cardData.banner && foundCard.banner) cardData.banner = foundCard.banner;
							break;
						}
					}
				}
				if (cardData.namefull || cardData.descriptionfull) break;
			}
		}
		
		// ===== ПОИСК В MINIMALCARDSDATA =====
		if (window.minimalCardsData) {
			for (const factionName in window.minimalCardsData) {
				const factionData = window.minimalCardsData[factionName];
				for (const cardType in factionData) {
					if (Array.isArray(factionData[cardType])) {
						const foundCard = factionData[cardType].find(c => c.id === cardData.id);
						if (foundCard) {
							if (!cardData.namefull && foundCard.namefull) cardData.namefull = foundCard.namefull;
							if (!cardData.descriptionfull && foundCard.descriptionfull) cardData.descriptionfull = foundCard.descriptionfull;
							if (!cardData.description && foundCard.description) cardData.description = foundCard.description;
							if (!cardData.ability && foundCard.ability) cardData.ability = foundCard.ability;
							if (!cardData.image && foundCard.image) cardData.image = foundCard.image;
							if (!cardData.tags || cardData.tags.length === 0) cardData.tags = foundCard.tags || [];
							if (!cardData.faction) cardData.faction = foundCard.faction || factionName;
							if (!cardData.rarity && foundCard.rarity) cardData.rarity = foundCard.rarity;
							if (!cardData.type && foundCard.type) cardData.type = foundCard.type;
							if (!cardData.position && foundCard.position) cardData.position = foundCard.position;
							if (cardData.strength === null && foundCard.strength !== undefined) {
								cardData.strength = foundCard.strength;
							}
							if (!cardData.border && foundCard.border) cardData.border = foundCard.border;
							if (!cardData.banner && foundCard.banner) cardData.banner = foundCard.banner;
							break;
						}
					}
				}
				if (cardData.namefull || cardData.descriptionfull) break;
			}
		}
		
		// ===== ПОИСК В GAMESTATE =====
		if (window.gameModule?.gameState) {
			const gameState = window.gameModule.gameState;
			
			// Ищем карту в руке игрока
			const handCard = gameState.player?.hand?.find(c => c.id === cardData.id || c.uniqueId === cardData.id);
			if (handCard) {
				Object.assign(cardData, handCard);
			}
			
			// Ищем карту в рядах игрока
			if (gameState.player?.rows) {
				for (const row of ['close', 'ranged', 'siege']) {
					const rowCard = gameState.player.rows[row]?.cards?.find(c => c.id === cardData.id || c.uniqueId === cardData.id);
					if (rowCard) {
						Object.assign(cardData, rowCard);
						break;
					}
				}
			}
			
			// ===== ИЩЕМ ТАКТИКИ ИГРОКА =====
			if (gameState.player?.rows) {
				for (const row of ['close', 'ranged', 'siege']) {
					const tactic = gameState.player.rows[row]?.tactic;
					if (tactic && (tactic.id === cardData.id || tactic.uniqueId === cardData.id)) {
						Object.assign(cardData, tactic);
						break;
					}
				}
			}
			
			// Ищем карту в рядах противника
			if (gameState.opponent?.rows) {
				for (const row of ['close', 'ranged', 'siege']) {
					const rowCards = gameState.opponent.rows[row]?.cards || [];
					const rowCard = rowCards.find(c => c.id === cardData.id || c.uniqueId === cardData.id);
					if (rowCard) {
						Object.assign(cardData, rowCard);
						break;
					}
				}
			}
			
			// ===== ИЩЕМ ТАКТИКИ ПРОТИВНИКА =====
			if (gameState.opponent?.rows) {
				for (const row of ['close', 'ranged', 'siege']) {
					const tactic = gameState.opponent.rows[row]?.tactic;
					if (tactic && (tactic.id === cardData.id || tactic.uniqueId === cardData.id)) {
						Object.assign(cardData, tactic);
						break;
					}
				}
			}
			
			// Ищем карту в руке противника
			const opponentHand = gameState.opponent?.hand || [];
			const oppHandCard = opponentHand.find(c => c.id === cardData.id || c.uniqueId === cardData.id);
			if (oppHandCard) {
				Object.assign(cardData, oppHandCard);
			}
			
			// Ищем карту в сбросе противника
			const opponentDiscard = gameState.opponent?.discard || [];
			const oppDiscardCard = opponentDiscard.find(c => c.id === cardData.id || c.uniqueId === cardData.id);
			if (oppDiscardCard) {
				Object.assign(cardData, oppDiscardCard);
			}
			
			// Ищем лидера игрока
			if (gameState.player?.leader && gameState.player.leader.id === cardData.id) {
				Object.assign(cardData, gameState.player.leader);
				cardData.type = 'leader';
			}
			
			// Ищем лидера противника
			if (gameState.opponent?.leader && gameState.opponent.leader.id === cardData.id) {
				Object.assign(cardData, gameState.opponent.leader);
				cardData.type = 'leader';
			}
			
			// Ищем карты погоды
			if (gameState.weather?.cards) {
				const weatherCard = gameState.weather.cards.find(c => c.id === cardData.id || c.uniqueId === cardData.id);
				if (weatherCard) {
					Object.assign(cardData, weatherCard);
				}
			}
		}
		
		// Убеждаемся, что описание берется из descriptionfull если есть
		if (cardData.descriptionfull && !cardData.description) {
			cardData.description = cardData.descriptionfull;
		}
		
		// Для лидера устанавливаем правильный тип
		if (cardData.id && cardData.id.includes('leader') && cardData.type !== 'leader') {
			cardData.type = 'leader';
		}
		
		return cardData;
	},

	showCardPreview: function(cardData, event) {
		const preview = document.getElementById('cardPreview');
		if (!preview || !cardData) return;
		
		// Проверяем, есть ли уже контейнер
		let container = preview.querySelector('.card-preview-container');
		if (!container) {
			container = document.createElement('div');
			container.className = 'card-preview-container';
			preview.appendChild(container);
		}
		
		// Создаем структуру если её нет
		let cardWrapper = container.querySelector('.card-preview-card');
		if (!cardWrapper) {
			cardWrapper = document.createElement('div');
			cardWrapper.className = 'card-preview-card';
			container.appendChild(cardWrapper);
			
			cardWrapper.innerHTML = `
				<img class="card-preview-media" id="cardPreviewMedia" src="" alt="Превью карты">
				<img class="card-preview-border" id="cardPreviewBorder" src="" alt="">
				<img class="card-preview-banner" id="cardPreviewBanner" src="" alt="">
				<div class="card-preview-name" id="cardPreviewName"></div>
				<div class="card-preview-strength" id="cardPreviewStrength"></div>
				<div class="card-preview-type-icon" id="cardPreviewTypeIcon"></div>
				<div class="card-preview-position" id="cardPreviewPosition">
					<img class="card-preview-position-banner" id="cardPreviewPositionBanner" src="" alt="">
					<img class="card-preview-position-icon" id="cardPreviewPositionIcon" src="" alt="">
				</div>
			`;
			
			const descDiv = document.createElement('div');
			descDiv.className = 'card-preview-description';
			descDiv.id = 'cardPreviewDescription';
			container.appendChild(descDiv);
		}
		
		// Получаем все элементы
		const media = document.getElementById('cardPreviewMedia');
		const border = document.getElementById('cardPreviewBorder');
		const banner = document.getElementById('cardPreviewBanner');
		const nameEl = document.getElementById('cardPreviewName');
		const strengthEl = document.getElementById('cardPreviewStrength');
		const typeIconEl = document.getElementById('cardPreviewTypeIcon');
		const posBanner = document.getElementById('cardPreviewPositionBanner');
		const posIcon = document.getElementById('cardPreviewPositionIcon');
		const description = document.getElementById('cardPreviewDescription');
		const positionWrapper = document.getElementById('cardPreviewPosition');
		
		// Медиа
		let mediaPath = '';
		if (cardData.media) {
			mediaPath = cardData.media;
		} else if (cardData.image) {
			const basePath = cardData.faction ? `card/${cardData.faction}` : 'card';
			mediaPath = `${basePath}/${cardData.image}`;
		} else {
			const basePath = cardData.faction ? `faction/${cardData.faction}` : 'card';
			const cardId = cardData.id || 'placeholder';
			mediaPath = `${basePath}/cards/${cardId}.png`;
		}
		
		const isVideo = mediaPath.endsWith('.mp4');
		if (isVideo) {
			if (media.tagName !== 'VIDEO') {
				const videoEl = document.createElement('video');
				videoEl.id = 'cardPreviewMedia';
				videoEl.className = 'card-preview-media';
				videoEl.autoplay = true;
				videoEl.loop = true;
				videoEl.muted = true;
				videoEl.playsinline = true;
				videoEl.src = mediaPath;
				media.parentNode.replaceChild(videoEl, media);
			} else {
				media.src = mediaPath;
			}
		} else {
			if (media.tagName === 'VIDEO') {
				const img = document.createElement('img');
				img.id = 'cardPreviewMedia';
				img.className = 'card-preview-media';
				img.src = mediaPath;
				img.alt = cardData.name || 'Карта';
				media.parentNode.replaceChild(img, media);
			} else {
				media.src = mediaPath;
				media.alt = cardData.name || 'Карта';
			}
		}
		
		// Рамка
		if (cardData.border) {
			border.src = cardData.border;
		} else {
			const borderMap = {
				'gold': 'deck/bord_gold.png',
				'silver': 'deck/bord_silver.png',
				'bronze': 'deck/bord_bronze.png'
			};
			border.src = borderMap[cardData.rarity] || 'deck/bord_bronze.png';
		}
		
		// Баннер
		if (cardData.banner) {
			banner.src = cardData.banner;
		} else {
			const bannerMap = {
				'gold': 'ui/banner_gold.png',
				'silver': 'ui/banner_silver.png',
				'bronze': 'ui/banner_bronze.png'
			};
			const faction = cardData.faction || 'neutral';
			banner.src = bannerMap[cardData.rarity] || `faction/${faction}/banner_bronze.png`;
		}
		
		// Имя
		nameEl.textContent = cardData.name || 'Карта';
		
		// Сила - для юнитов показываем силу
		if (cardData.type === 'unit' && cardData.strength !== undefined && cardData.strength !== null) {
			strengthEl.textContent = cardData.strength;
			strengthEl.style.display = 'block';
		} else {
			strengthEl.style.display = 'none';
		}
		
    // ===== ИКОНКА ТИПА - для всех НЕ юнитов, включая лидера =====
    const typeIcons = {
        'tactic': 'deck/type_tactic.png',
        'artifact': 'deck/type_artifact.png',
        'leader': 'deck/type_leader.png',
        'special': 'deck/type_special.png',
        'weather': 'deck/type_special.png',
        'unit': null // для юнитов не показываем
    };
    
    // Для лидера всегда показываем иконку, даже если type определен как leader
    if (cardData.type === 'leader') {
        typeIconEl.innerHTML = `<img src="deck/type_leader.png" alt="Лидер">`;
        typeIconEl.style.display = 'block';
    } else if (cardData.type && cardData.type !== 'unit' && typeIcons[cardData.type]) {
        typeIconEl.innerHTML = `<img src="${typeIcons[cardData.type]}" alt="${cardData.type}">`;
        typeIconEl.style.display = 'block';
    } else {
        typeIconEl.style.display = 'none';
    }
		
		// Позиция
		const positionIcons = {
			'close': 'deck/close-row.png',
			'ranged': 'deck/ranged-row.png',
			'siege': 'deck/siege-row.png',
			'any': 'deck/any-row.png',
			'close-row': 'deck/close-row.png',
			'ranged-row': 'deck/ranged-row.png',
			'siege-row': 'deck/siege-row.png',
			'any-row': 'deck/any-row.png',
			'hidden-close-row': 'deck/hidden-close-row.png',
			'hidden-ranged-row': 'deck/hidden-ranged-row.png',
			'hidden-siege-row': 'deck/hidden-siege-row.png',
			'hidden-any-row': 'deck/hidden-any-row.png'
		};
		
		const faction = cardData.faction || 'neutral';
		
		if (cardData.position) {
			let posKey = cardData.position;
			if (!posKey.endsWith('-row') && posKey !== 'any') {
				posKey = posKey + '-row';
			}
			posBanner.src = `faction/${faction}/banner_position.png`;
			posIcon.src = positionIcons[posKey] || 'deck/any-row.png';
			posIcon.style.display = 'block';
			posBanner.style.display = 'block';
			positionWrapper.style.display = 'block';
		} else if (cardData.positionIcon) {
			posBanner.src = `faction/${faction}/banner_position.png`;
			posIcon.src = cardData.positionIcon;
			posIcon.style.display = 'block';
			posBanner.style.display = 'block';
			positionWrapper.style.display = 'block';
		} else {
			posIcon.style.display = 'none';
			posBanner.style.display = 'none';
			positionWrapper.style.display = 'none';
		}
		
    // ===== ОПИСАНИЕ СПОСОБНОСТИ (ABILITY) - СКРЫТО ДЛЯ ЛИДЕРА =====
    let abilityName = '';
    let abilityDesc = '';
    let abilityHint = '';
    let tagsText = '';
    
    // Проверяем, есть ли способность у карты И это НЕ лидер
    if (cardData.type !== 'leader' && cardData.ability && cardData.ability !== ' ' && cardData.ability !== '') {
        const abilityId = cardData.ability;
        
        // Ищем способность в skillSystem.abilities
        let abilityData = null;
        if (window.skillSystem && window.skillSystem.abilities) {
            abilityData = window.skillSystem.abilities[abilityId];
        }
        
		if (abilityData) {
			abilityName = abilityData.name || 'Способность';
			abilityDesc = abilityData.description || 'Описание отсутствует';
			
			// Извлекаем hint-tooltip из description, если есть
			const hintMatch = abilityDesc.match(/<span class="hint-tooltip">(.*?)<\/span>/);
			if (hintMatch) {
				abilityHint = hintMatch[1];
				// Убираем только блок с tooltip, но сохраняем hint-trigger
				abilityDesc = abilityDesc.replace(/<span class="ability-hint">[\s\S]*?<\/span>/, function(match) {
					// Внутри ability-hint оставляем только содержимое hint-trigger
					const triggerMatch = match.match(/<span class="hint-trigger">([\s\S]*?)<\/span>/);
					return triggerMatch ? `<span class="hint-trigger">${triggerMatch[1]}</span>` : '';
				});
				// Убираем оставшиеся span-теги description-normal, но сохраняем hint-trigger
				abilityDesc = abilityDesc.replace(/<span class="description-normal">([\s\S]*?)<\/span>/g, '$1');
			}
			
			// НЕ удаляем все HTML-теги, оставляем hint-trigger
			// Удаляем только нежелательные теги (кроме span с hint-trigger)
			abilityDesc = abilityDesc.replace(/<(?!\/?span\b)[^>]*>/g, '');
		} else {
            // Если способность не найдена в skillSystem, пробуем найти в factionAbilities
            let abilityInfo = null;
            
            if (window.factionAbilities) {
                for (const factionId in window.factionAbilities) {
                    const abilities = window.factionAbilities[factionId];
                    const found = abilities.find(a => a.id === abilityId);
                    if (found) {
                        abilityInfo = found;
                        break;
                    }
                }
            }
            
            if (abilityInfo) {
                abilityName = abilityInfo.name || 'Способность';
                abilityDesc = abilityInfo.description || 'Описание отсутствует';
            } else {
                abilityName = 'Способность';
                abilityDesc = abilityId;
            }
        }
    }
    
    // Формируем теги, если есть описание способности (и это не лидер)
    if (abilityName && cardData.tags && cardData.tags.length > 0) {
        const tagNames = {
            'witcher': 'Ведьмак',
            'hero': 'Герой',
            'mage': 'Маг',
            'leader': 'Лидер',
            'king': 'Король',
            'kingser': 'Придворный',
            'warrior': 'Воин',
            'criminal': 'Преступник',
            'dragon': 'Дракон',
            'elf': 'Эльф',
            'dwarf': 'Краснолюд',
            'monster': 'Чудовище',
            'ghost': 'Призрак',
            'specter': 'Спектр',
            'curse': 'Проклятие',
            'scavenger': 'Падальщик',
            'blood': 'Вампир',
            'ogr': 'Огр',
            'relict': 'Реликт',
            'pirat': 'Пират',
            'weapons': 'Оружие',
            'alchimy': 'Алхимия',
            'treasure': 'Сокровище',
            'ritual': 'Ритуал',
            'tactic': 'Тактика',
            'spell': 'Заклинание',
            'hazard': 'Бедствие',
            'religy': 'Религия',
            'mercenary': 'Наёмник',
            'wild_hunt': 'Дикая Охота',
            'animal': 'Животное',
            'driada': 'Дриада',
            'oak': 'Дубочуд',
            'weather': 'Погода'
        };
        
        const displayTags = cardData.tags
            .filter(tag => tag && tag !== ' ' && tag !== '')
            .map(tag => tagNames[tag] || tag)
            .join(', ');
        
        if (displayTags) {
            tagsText = displayTags;
        }
    }
    
    // Формируем HTML с разделением на строки (только если есть описание способности)
    let descriptionHTML = '';
    if (abilityName) {
        descriptionHTML += `<div class="ability-name-line">${abilityName}</div>`;
        if (abilityDesc) {
            descriptionHTML += `<div class="ability-desc-line">${abilityDesc}</div>`;
        }
        // Если есть hint - добавляем дополнительную плашку
        if (abilityHint) {
            descriptionHTML += `<div class="ability-hint-line">${abilityHint}</div>`;
        }
        if (tagsText) {
            descriptionHTML += `<div class="ability-tags-line">Теги: ${tagsText}</div>`;
        }
    }
    
    if (descriptionHTML) {
        description.innerHTML = descriptionHTML;
        description.className = 'card-preview-description has-text';
        description.style.display = 'flex';
    } else {
        description.innerHTML = '';
        description.className = 'card-preview-description empty';
        description.style.display = 'flex';
    }
    
    preview.classList.add('visible');
},

    hideCardPreview: function() {
        const preview = document.getElementById('cardPreview');
        if (preview) {
            preview.classList.remove('visible');
        }
    },

    setupPreviewObserver: function() {
        // Наблюдаем за появлением новых карт
        if (this._previewObserver) {
            this._previewObserver.disconnect();
        }
        
        this._previewObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element
                        // Проверяем, является ли элемент картой
                        if (node.matches && node.matches('.hand-card, .board-card, .weather-card, .leader-card-on-board')) {
                            this.addPreviewListeners(node);
                        }
                        // Проверяем дочерние элементы
                        if (node.querySelectorAll) {
                            const cards = node.querySelectorAll('.hand-card, .board-card, .weather-card, .leader-card-on-board');
                            cards.forEach(card => this.addPreviewListeners(card));
                        }
                    }
                });
            });
        });
        
        // Наблюдаем за игровой доской
        const board = document.querySelector('.game-board');
        if (board) {
            this._previewObserver.observe(board, {
                childList: true,
                subtree: true
            });
        } else {
            // Если доска еще не создана, наблюдаем за body
            this._previewObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    },

    initAbilityIcon: function() {
        const gameState = window.gameModule?.gameState;
        if (!gameState || !gameState.player) {
            setTimeout(() => this.initAbilityIcon(), 1000);
            return;
        }
        
        const abilityIcon = document.getElementById('playerAbilityIcon');
        const abilityIconImg = document.getElementById('playerAbilityIconImg');
        const tooltipTitle = document.getElementById('playerAbilityTooltipTitle');
        const tooltipDesc = document.getElementById('playerAbilityTooltipDesc');
        
        if (!abilityIcon) return;
        
        const factionId = gameState.player.faction;
        const abilityId = gameState.player.ability;
        
        // Получаем данные способности
        let abilityData = this.getAbilityData(factionId, abilityId);
        
        // Обновляем иконку и подсказки
        if (abilityData && abilityIconImg) {
            if (abilityData.icon) {
                abilityIconImg.src = abilityData.icon;
            } else {
                abilityIconImg.src = 'deck/ability.png';
            }
            if (tooltipTitle) tooltipTitle.textContent = abilityData.name || 'Способность лидера';
            if (tooltipDesc) tooltipDesc.textContent = abilityData.description || 'Активируйте способность лидера';
        }
        
        // Сохраняем данные
        abilityIcon.dataset.abilityId = abilityId;
        abilityIcon.dataset.factionId = factionId;
        
        // Настраиваем активацию
        this.setupAbilityActivation(abilityIcon);
        
        // Обновляем доступность
        this.updateAbilityAvailability(gameState);
    },

    getAbilityData: function(factionId, abilityId) {
        if (!factionId || !abilityId) return null;
        
        if (window.factionAbilities && window.factionAbilities[factionId]) {
            const abilities = window.factionAbilities[factionId];
            const found = abilities.find(a => a.id === abilityId);
            if (found) {
                return found;
            }
        }
        
        if (window.leaderAbilities && window.leaderAbilities[abilityId]) {
            const ability = window.leaderAbilities[abilityId];
            const iconName = this.getAbilityIconName(abilityId, factionId);
            return {
                id: abilityId,
                name: ability.name,
                description: ability.description,
                icon: iconName
            };
        }
        
        const iconName = this.getAbilityIconName(abilityId, factionId);
        return {
            id: abilityId,
            name: this.getAbilityName(abilityId),
            description: this.getAbilityDescription(abilityId),
            icon: iconName
        };
    },

    getAbilityIconName: function(abilityId, factionId) {
        if (!abilityId) return 'deck/ability.png';
        
        const iconMap = {
            'scoiatael_ability_1': 'forge.png',
            'scoiatael_ability_2': 'ambush.png',
            'scoiatael_ability_3': 'accuracy.png',
            'scoiatael_ability_4': 'gift.png',
            'scoiatael_ability_5': 'tactic.png',
            'realms_ability_1': 'king.png',
            'realms_ability_2': 'militia.png',
            'realms_ability_3': 'shield.png',
            'realms_ability_4': 'incitement.png',
            'realms_ability_5': 'mobilization.png',
            'nilfgaard_ability_1': 'construction.png',
            'nilfgaard_ability_2': 'block.png',
            'nilfgaard_ability_3': 'capture.png',
            'nilfgaard_ability_4': 'tusent.png',
            'nilfgaard_ability_5': 'twoface.png',
            'monsters_ability_1': 'cold.png',
            'monsters_ability_2': 'hangry.png',
            'monsters_ability_3': 'blood.png',
            'monsters_ability_4': 'forest.png',
            'monsters_ability_5': 'sheild.png',
            'skellige_ability_1': 'rage.png',
            'skellige_ability_2': 'more.png',
            'skellige_ability_3': 'onslaught.png',
            'skellige_ability_4': 'bear.png',
            'skellige_ability_5': 'respect.png',
            'syndicate_ability_1': 'order.png',
            'syndicate_ability_2': 'carnage.png',
            'syndicate_ability_3': 'pirates.png',
            'syndicate_ability_4': 'brother.png',
            'syndicate_ability_5': 'money.png'
        };
        
        const iconFile = iconMap[abilityId];
        if (iconFile && factionId) {
            return `faction/${factionId}/abilities/${iconFile}`;
        }
        
        return 'deck/ability.png';
    },

    getAbilityName: function(abilityId) {
        const nameMap = {
            'scoiatael_ability_1': 'Махакамская кузня',
            'scoiatael_ability_2': 'Засада ловчих',
            'scoiatael_ability_3': 'Точный удар',
            'scoiatael_ability_4': 'Дар природы',
            'scoiatael_ability_5': 'Партизанская тактика',
            'realms_ability_1': 'Королевское вдохновение',
            'realms_ability_2': 'Ополчение',
            'realms_ability_3': 'Стена щитов',
            'realms_ability_4': 'Побуждение к действию',
            'realms_ability_5': 'Мобилизация',
            'nilfgaard_ability_1': 'Имперское построение',
            'nilfgaard_ability_2': 'Заточение',
            'nilfgaard_ability_3': 'Порабощение',
            'nilfgaard_ability_4': 'Туссентское гостеприимство',
            'nilfgaard_ability_5': 'Двойная игра',
            'monsters_ability_1': 'Белый Хлад',
            'monsters_ability_2': 'Неутолимый голод',
            'monsters_ability_3': 'Запах крови',
            'monsters_ability_4': 'Сила природы',
            'monsters_ability_5': 'Панцирь',
            'skellige_ability_1': 'Безрассудная ярость',
            'skellige_ability_2': 'Гнев моря',
            'skellige_ability_3': 'Натиск',
            'skellige_ability_4': 'Медвежий ритуал',
            'skellige_ability_5': 'Пламя славы',
            'syndicate_ability_1': 'Заказ на убийство',
            'syndicate_ability_2': 'Резня',
            'syndicate_ability_3': 'Пиратская бухта',
            'syndicate_ability_4': 'Священное братство',
            'syndicate_ability_5': 'Кровавые деньги'
        };
        return nameMap[abilityId] || 'Способность лидера';
    },

    getAbilityDescription: function(abilityId) {
        const descMap = {
            'scoiatael_ability_1': 'Усильте всех Краснолюдов на поле 3 единицы',
            'scoiatael_ability_2': 'Призывите из колоды в руку карту Эльфа',
            'scoiatael_ability_3': 'Нанесите 5 единиц урона отряду противника',
            'scoiatael_ability_4': 'Усильте 3 отряда на поле на 2 единицы',
            'scoiatael_ability_5': 'Нанесите 3 единицы урона всем картам в ряду противника',
            'realms_ability_1': 'Усильте дружественный отряд на 5 единиц',
            'realms_ability_2': 'Нанесите 3 единицы урона 2-м отрядам противника',
            'realms_ability_3': 'Усильте дружественный отряд на 2 единицы и призвать в руку артефакт',
            'realms_ability_4': 'Усильте дружественный отряд на поле на 3 единицы',
            'realms_ability_5': 'Призовите бронзовый отряд на поле и усильте его и смежные с ним отряды на 3 единицы',
            'nilfgaard_ability_1': 'Усильте 2 дружественных отряда на 1 единицу и поменяйте их местами (только в пределах одного ряда)',
            'nilfgaard_ability_2': 'Нанесите вражескому отряду 3 единицы урона',
            'nilfgaard_ability_3': 'Уничтожьте вражеский отряд с силой 5 или меньше',
            'nilfgaard_ability_4': 'Усильте случайный дружественный отряд на 5 единиц',
            'nilfgaard_ability_5': 'Вслепую сыграйте карту из руки противника',
            'monsters_ability_1': 'Создайте эффект мороза только в ряду противника',
            'monsters_ability_2': 'Уничтожьте дружественный отряд, затем призовите Волколака, усиленного на значение силы уничтоженого отряда, из колоды на поле в этом же ряду',
            'monsters_ability_3': 'Нанесите 2 ед. урона по вражескому ряду с наибольшим количеством карт',
            'monsters_ability_4': 'Призовите могущественного "Духа Леса"',
            'monsters_ability_5': 'Усильте дружественный отряд на 3 ед. Если это не нейтральный отряд',
            'skellige_ability_1': 'Случайным образом распределите 4 ед. урона между всеми вражескими отрядами',
            'skellige_ability_2': 'Создайте эффект дождя только в ряду противника',
            'skellige_ability_3': 'Нанесите 3 ед. урона вражескому отряду',
            'skellige_ability_4': 'Нанесите 1 ед. урона дружественному отряду. И призовите Берсерка',
            'skellige_ability_5': 'Переместите не нейтральный отряд из вашей колоды в ваш сброс, затем нанесите вражескому отряду урон, равный значению силы перемещенного отряда',
            'syndicate_ability_1': 'Нанесите 6 ед. урона вражескому отряду',
            'syndicate_ability_2': 'Нанесите от 1 до 3 ед. урона всем картам в ряду противника',
            'syndicate_ability_3': 'Призовите из колоды в руку 2 карты с тегом "Пират"',
            'syndicate_ability_4': 'Усильте 2 случайных дружественных отряда на 2 ед.',
            'syndicate_ability_5': 'Уничтожьте вражеский отряд с силой 4 или меньше'
        };
        return descMap[abilityId] || 'Активируйте способность лидера';
    },

    setupAbilityActivation: function(abilityIcon) {
        // Удаляем старые обработчики
        const newIcon = abilityIcon.cloneNode(true);
        abilityIcon.parentNode.replaceChild(newIcon, abilityIcon);
        
        // Добавляем обработчик клика с проверкой
        newIcon.addEventListener('click', (event) => {
            event.stopPropagation();
            
            const gameState = window.gameModule?.gameState;
            
            // Проверяем, можно ли использовать способность
            if (this.canUseAbility(gameState)) {
                this.handleAbilityClick();
            } else {
                // Показываем сообщение о причине недоступности
                if (gameState) {
                    if (gameState.player.abilityUsedThisRound) {
                        window.gameModule?.showGameMessage('Способность уже использована в этом раунде', 'warning');
                    } else if (gameState.player.passed) {
                        window.gameModule?.showGameMessage('Нельзя использовать способность после паса', 'warning');
                    } else if (gameState.gamePhase !== 'playerTurn' || gameState.currentPlayer !== 'player') {
                        window.gameModule?.showGameMessage('Способность можно использовать только в свой ход', 'warning');
                    } else {
                        window.gameModule?.showGameMessage('Способность недоступна', 'warning');
                    }
                }
            }
        });
        
        newIcon.addEventListener('mouseenter', () => {
            if (audioManager && audioManager.playSound) {
                audioManager.playSound('touch');
            }
        });
    },

    canUseAbility: function(gameState) {
        if (!gameState) return false;
        
        // 1. Способность не должна быть использована в этом раунде
        if (gameState.player.abilityUsedThisRound) return false;
        
        // 2. Игрок не должен быть в пасе
        if (gameState.player.passed) return false;
        
        // 3. Должен быть ход игрока
        if (gameState.gamePhase !== 'playerTurn' || gameState.currentPlayer !== 'player') return false;
        
        return true;
    },

    handleAbilityClick: function() {
        // Используем метод из game.js
        if (window.gameModule?.useLeaderAbility) {
            window.gameModule.useLeaderAbility();
        }
    },

    markAbilityAsUsed: function() {
        const abilityIcon = document.getElementById('playerAbilityIcon');
        if (abilityIcon) {
            abilityIcon.classList.remove('ability-available');
            abilityIcon.classList.add('ability-used');
            abilityIcon.style.cursor = 'not-allowed';
            abilityIcon.style.opacity = '0.4';
        }
    },

    updateAbilityAvailability: function(gameState) {
        const abilityIcon = document.getElementById('playerAbilityIcon');
        if (!abilityIcon) return;
        
        // Если gameState не передан, получаем из gameModule
        if (!gameState) {
            gameState = window.gameModule?.gameState;
        }
        
        const canUse = this.canUseAbility(gameState);
        
        // Сбрасываем классы
        abilityIcon.classList.remove('ability-available', 'ability-used');
        
        if (canUse) {
            abilityIcon.classList.add('ability-available');
            abilityIcon.style.cursor = 'pointer';
            abilityIcon.style.opacity = '1';
        } else {
            abilityIcon.classList.add('ability-used');
            abilityIcon.style.cursor = 'not-allowed';
            abilityIcon.style.opacity = '0.4';
        }
    },

	generateBoardHTML: function() {
		return `
			<div class="board-background"></div>
			
			<!-- Превью карты при наведении -->
			<div class="card-preview" id="cardPreview">
			</div>

			<div class="opponent-leader-area leader-area">
				<div class="leader-slot" id="opponentLeader"></div>
			</div>

			<div class="player-leader-area leader-area">
				<div class="leader-slot" id="playerLeader">
					<div class="leader-ability-wrapper" id="playerAbilityWrapper">
						<div class="leader-ability-icon ability-used" id="playerAbilityIcon">
							<img src="deck/ability.png" alt="Способность лидера" id="playerAbilityIconImg">
							<div class="leader-ability-tooltip" id="playerAbilityTooltip">
								<div class="tooltip-title" id="playerAbilityTooltipTitle">Способность лидера</div>
								<div class="tooltip-description" id="playerAbilityTooltipDesc">Активируйте способность лидера</div>
							</div>
						</div>
					</div>
				</div>
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
				<button class="control-btn pass-btn hidden-control" id="passBtn">ПАС</button>
				<button class="control-btn end-turn-btn hidden-control" id="endTurnBtn">ЗАКОНЧИТЬ ХОД</button>
			</div>
		`;
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

    updateControlsVisibility: function(isPlayerTurn) {
        const passBtn = document.getElementById('passBtn');
        const endTurnBtn = document.getElementById('endTurnBtn');
        
        if (passBtn && endTurnBtn) {
            if (isPlayerTurn) {
                passBtn.classList.remove('hidden-control');
                endTurnBtn.classList.remove('hidden-control');
                
                setTimeout(() => {
                    passBtn.style.opacity = '1';
                    passBtn.style.transform = 'translateY(0)';
                    endTurnBtn.style.opacity = '1';
                    endTurnBtn.style.transform = 'translateY(0)';
                }, 50);
            } else {
                passBtn.style.opacity = '0';
                passBtn.style.transform = 'translateY(15px)';
                endTurnBtn.style.opacity = '0';
                endTurnBtn.style.transform = 'translateY(15px)';
                
                setTimeout(() => {
                    passBtn.classList.add('hidden-control');
                    endTurnBtn.classList.add('hidden-control');
                }, 100);
            }
        }
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
        this.updateControlsVisibility(false);
        if (window.playerModule && window.playerModule.handlePass) {
            window.playerModule.handlePass();
        }
    },

    handleEndTurn: function() {
        audioManager.playSound('button');
        this.updateControlsVisibility(false);
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