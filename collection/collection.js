const collectionModule = (function() {
    let allCards = [];
    let currentFilters = {
        faction: 'all',
        type: 'all',
        rarity: 'all',
        position: 'all'
    };
    let escapeHandler = null;
    let showCopies = false;
    let showHidden = false;
    let cachedElements = {};
    
    function getElement(id) {
        if (!cachedElements[id]) {
            cachedElements[id] = document.getElementById(id);
        }
        return cachedElements[id];
    }
    
    function clearCache() {
        cachedElements = {};
    }
    
    function getCardDisplayMode() {
        return window.settingsModule?.getCardDisplayMode?.() ?? 'static';
    }

	function getAllCards() {
		if (allCards.length > 0) return allCards;
		
		// Используем новую функцию, которая возвращает ВСЕ карты (включая скрытые)
		if (window.cardsModule?.getAllCardsForCollection) {
			allCards = window.cardsModule.getAllCardsForCollection();
		} else {
			// Fallback
			const allFactions = ['monsters', 'nilfgaard', 'realms', 'scoiatael', 'skellige', 'syndicate', 'neutral'];
			
			allFactions.forEach(factionId => {
				const factionCards = window.cardsModule?.getFactionCards?.(factionId, true);
				if (factionCards) {
					const cards = [
						...(factionCards.units || []),
						...(factionCards.specials || []),
						...(factionCards.artifacts || []),
						...(factionCards.tactics || [])
					];
					allCards.push(...cards);
				}
			});
		}
		
		allCards = allCards.filter((card, index, self) => 
			index === self.findIndex(c => c.id === card.id)
		);
		
		return allCards;
	}
    
    function filterCards() {
        let filtered = [...allCards];
        
        if (currentFilters.faction !== 'all') {
            filtered = filtered.filter(card => card.faction === currentFilters.faction);
        }
        
        if (currentFilters.type !== 'all') {
            filtered = filtered.filter(card => card.type === currentFilters.type);
        }
        
        if (currentFilters.rarity !== 'all') {
            filtered = filtered.filter(card => card.rarity === currentFilters.rarity);
        }
        
        if (currentFilters.position !== 'all') {
            filtered = filtered.filter(card => {
                if (card.type !== 'unit') return false;
                return card.position === currentFilters.position;
            });
        }

		if (!showHidden) {
			filtered = filtered.filter(card => !card.hidden);
		}
		
		if (!showCopies) {
			const uniqueCards = new Map();
			filtered.forEach(card => {
				if (!uniqueCards.has(card.id)) uniqueCards.set(card.id, card);
			});
			filtered = Array.from(uniqueCards.values());
		}
	        
        filtered.sort((a, b) => {
            const typeOrder = { unit: 1, special: 2, artifact: 3, tactic: 4 };
            const typeDiff = (typeOrder[a.type] || 5) - (typeOrder[b.type] || 5);
            if (typeDiff !== 0) return typeDiff;
            
            const rarityOrder = { gold: 1, silver: 2, bronze: 3 };
            const rarityDiff = (rarityOrder[a.rarity] || 4) - (rarityOrder[b.rarity] || 4);
            if (rarityDiff !== 0) return rarityDiff;
            
            if (a.type === 'unit' && b.type === 'unit') {
                const strengthDiff = (b.strength || 0) - (a.strength || 0);
                if (strengthDiff !== 0) return strengthDiff;
            }
            
            if (a.faction !== b.faction) {
                if (currentFilters.faction !== 'all') {
                    if (a.faction === currentFilters.faction && b.faction !== currentFilters.faction) return -1;
                    if (b.faction === currentFilters.faction && a.faction !== currentFilters.faction) return 1;
                }
                if (a.faction === 'neutral' && b.faction !== 'neutral') return 1;
                if (b.faction === 'neutral' && a.faction !== 'neutral') return -1;
            }
            
            return a.name.localeCompare(b.name);
        });
        
        return filtered;
    }
    
    function updateCardCount(filteredCards) {
        const countElement = getElement('collectionCount');
        const strengthElement = getElement('collectionStrength');
        
        let totalCardsCount = 0;
        let totalStrength = 0;
        
        filteredCards.forEach(card => {
            const copies = showCopies ? (card.copy || 1) : 1;
            totalCardsCount += copies;
            if (card.type === 'unit' && card.strength) {
                totalStrength += card.strength * copies;
            }
        });
        
        if (countElement) {
            countElement.textContent = `${totalCardsCount} карт`;
        }
        
        if (strengthElement) {
            const showStrength = currentFilters.type === 'all' || currentFilters.type === 'unit';
            if (showStrength && totalCardsCount > 0) {
                strengthElement.textContent = `Cила: ${totalStrength}`;
                strengthElement.style.display = 'flex';
            } else {
                strengthElement.style.display = 'none';
            }
        }
    }
    
    function getTypeIconPath(cardType) {
        const icons = {
            special: 'deck/type_special.png',
            artifact: 'deck/type_artifact.png',
            tactic: 'deck/type_tactic.png',
            unit: 'deck/unit.png'
        };
        return icons[cardType] || 'deck/type_unknown.png';
    }
    
    function getPositionIconPath(position) {
        const icons = {
            'close-row': 'deck/close-row.png', 'ranged-row': 'deck/ranged-row.png',
            'siege-row': 'deck/siege-row.png', 'any-row': 'deck/any-row.png',
            'hidden-close-row': 'deck/hidden-close-row.png', 'hidden-ranged-row': 'deck/hidden-ranged-row.png',
            'hidden-siege-row': 'deck/hidden-siege-row.png', 'hidden-any-row': 'deck/hidden-any-row.png'
        };
        return icons[position] || 'deck/any-row.png';
    }
    
    function setupVideoControls(cardElement) {
        const video = cardElement.querySelector('video');
        if (!video) return;
        
        video.removeAttribute('autoplay');
        video.removeAttribute('loop');
        
        cardElement.addEventListener('mouseenter', () => {
            video.currentTime = 0;
            video.play().catch(() => {});
            video.loop = true;
        });
        
        cardElement.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
            video.loop = false;
        });
        
        cardElement.addEventListener('click', () => {
            video.pause();
            video.currentTime = 0;
        });
    }
    
	function createCollectionCardElement(card) {
		const cardElement = document.createElement('div');
		cardElement.className = `card ${card.type} ${card.rarity} collection-card`;
		if (card.hidden) {
			cardElement.classList.add('hidden-card');
		}
		cardElement.dataset.cardId = card.id;
		
		const cardDisplayMode = getCardDisplayMode();
		let mediaPath = `card/${card.faction}/${card.image}`;
		let isVideo = card.image?.endsWith('.mp4') ?? false;
		
		if (cardDisplayMode === 'static' && isVideo) {
			mediaPath = mediaPath.replace('.mp4', '.jpg');
			isVideo = false;
		}
		
		let mediaElement = isVideo 
			? `<video class="card__media" muted playsinline preload="metadata"><source src="${mediaPath}" type="video/mp4"></video>`
			: `<img src="${mediaPath}" alt="${card.name}" class="card__media" onerror="this.src='card/placeholder.jpg'">`;
		
		let topRightElement = card.type === 'unit'
			? `<div class="card__strength">${card.strength}</div>`
			: `<div class="card__type-icon"><img src="${getTypeIconPath(card.type)}" alt="${card.type}"></div>`;
		
		let positionElement = '';
		if (card.type === 'unit' && card.position) {
			positionElement = `
				<div class="card__position">
					<img src="${card.positionBanner || 'deck/position_banner.png'}" alt="Позиция" class="card__position-banner">
					<img src="${getPositionIconPath(card.position)}" alt="${card.position}" class="card__position-icon">
				</div>
			`;
		}
		
		cardElement.innerHTML = `
			<div class="card__container">
				${mediaElement}
				<img src="${card.border}" alt="Рамка" class="card__border">
				<img src="${card.banner}" alt="Баннер" class="card__banner">
				<div class="card__name">${card.name}</div>
				${topRightElement}
				${positionElement}
			</div>
		`;
		
		if (card.copy && card.copy > 1) {
			const cardContainer = cardElement.querySelector('.card__container');
			const copyBanner = document.createElement('img');
			copyBanner.className = 'card__copy-banner';
			copyBanner.src = `faction/${card.faction}/banner_position.png`;
			
			const copyIndicator = document.createElement('div');
			copyIndicator.className = 'card__copy-indicator';
			copyIndicator.textContent = `×${card.copy}`;
			
			cardContainer?.appendChild(copyBanner);
			cardContainer?.appendChild(copyIndicator);
		}
		
		// ЛКМ - открыть модальное окно
		cardElement.addEventListener('click', () => showCardDetailsModal(card));
		
		// ПКМ - тоже открыть модальное окно
		cardElement.addEventListener('contextmenu', (e) => {
			e.preventDefault();
			showCardDetailsModal(card);
		});
		
		if (isVideo && cardDisplayMode === 'animated') {
			setupVideoControls(cardElement);
		}
		
		return cardElement;
	}

    function displayCards() {
        const filteredCards = filterCards();
        const collectionGrid = document.getElementById('collectionGrid');
        
        if (!collectionGrid) return;
        
        collectionGrid.innerHTML = '';
        
        if (filteredCards.length === 0) {
            collectionGrid.innerHTML = `
                <div class="collection-empty">
                    <img src="deck/none_cards.png" alt="Нет карт">
                    <p>Нет карт, соответствующих выбранным фильтрам</p>
                </div>
            `;
            updateCardCount([]);
            return;
        }
        
        filteredCards.forEach((card, index) => {
            const cardElement = createCollectionCardElement(card);
            cardElement.style.animation = `cardAddition 0.3s ease ${index * 0.02}s both`;
            collectionGrid.appendChild(cardElement);
        });
        
        updateCardCount(filteredCards);
    }
    
    function showCardDetailsModal(card) {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'card-modal-overlay';
        
        const cardDisplayMode = getCardDisplayMode();
        let mediaPath = `card/${card.faction}/${card.image}`;
        let isVideo = card.image?.endsWith('.mp4') ?? false;
        
        if (cardDisplayMode === 'static' && isVideo) {
            mediaPath = mediaPath.replace('.mp4', '.jpg');
            isVideo = false;
        }
        
        let mediaElement = isVideo
            ? `<video class="card__media" autoplay loop muted playsinline><source src="${mediaPath}" type="video/mp4"></video>`
            : `<img src="${mediaPath}" alt="${card.name}" class="card__media">`;
        
        let topRightElement = card.type === 'unit'
            ? `<div class="card__strength">${card.strength}</div>`
            : `<div class="card__type-icon"><img src="${getTypeIconPath(card.type)}" alt="${card.type}"></div>`;
        
        let positionElement = '';
        if (card.type === 'unit' && card.position) {
            positionElement = `
                <div class="card__position">
                    <img src="${card.positionBanner || 'deck/position_banner.png'}" alt="Позиция" class="card__position-banner">
                    <img src="${getPositionIconPath(card.position)}" alt="${card.position}" class="card__position-icon">
                </div>
            `;
        }
        
        let abilityHtml = '';
        if (card.ability && window.skillSystem?.abilities?.[card.ability]) {
            const ability = window.skillSystem.abilities[card.ability];
            abilityHtml = `
                <div class="card-modal__abilities">
                    <div class="card-modal__abilities-title">Способность</div>
                    <div class="card-modal__ability">
                        <div class="card-modal__ability-name">${ability.name}</div>
                        <div class="card-modal__ability-description">${ability.description}</div>
                    </div>
                </div>
            `;
        }
        
        modalOverlay.innerHTML = `
            <div class="card-modal">
                <div class="card-modal__preview">
                    <div class="card__container">
                        ${mediaElement}
                        <img src="${card.border}" alt="Рамка" class="card__border">
                        <img src="${card.banner}" alt="Баннер" class="card__banner">
                        ${topRightElement}
                        ${positionElement}
                    </div>
                </div>
                <div class="card-modal__info">
                    <div class="card-modal__title">${(card.namefull || card.name).replace(/'/g, "\\'")}</div>
                    <div class="card-modal__faction">${card.description || localizeFaction(card.faction)}</div>
                    <div class="card-modal__stats">
                        <div class="card-modal__stat">
                            <div class="card-modal__stat-label">Тип</div>
                            <div class="card-modal__stat-value">${localizeCardType(card.type)}</div>
                        </div>
                        <div class="card-modal__stat">
                            <div class="card-modal__stat-label">Редкость</div>
                            <div class="card-modal__stat-value">${localizeRarity(card.rarity)}</div>
                        </div>
                        ${card.strength ? `
                        <div class="card-modal__stat">
                            <div class="card-modal__stat-label">Сила</div>
                            <div class="card-modal__stat-value">${card.strength}</div>
                        </div>
                        ` : ''}
                        ${card.position ? `
                        <div class="card-modal__stat">
                            <div class="card-modal__stat-label">Позиция</div>
                            <div class="card-modal__stat-value">${getPositionName(card.position)}</div>
                        </div>
                        ` : ''}
                    </div>
                    <div class="card-modal__description">
                        <div class="card-modal__description-title">Описание</div>
                        <div class="card-modal__description-text">${(card.descriptionfull || card.description || 'Описание отсутствует').replace(/'/g, "\\'")}</div>
                    </div>
                    ${abilityHtml}
                    ${card.tags?.length ? `
                    <div class="card-modal__abilities">
                        <div class="card-modal__abilities-title">Теги</div>
                        <div class="tags-container ${card.tags.length > 6 ? 'tags-container-3col' : 'tags-container-2col'}">
                            ${localizeTags(card.tags).map(tag => `<div class="card-tag">${tag}</div>`).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modalOverlay);
        
        const closeModal = () => {
            modalOverlay.classList.remove('active');
            setTimeout(() => modalOverlay.remove(), 300);
            if (modalOverlay._escapeHandler) {
                document.removeEventListener('keydown', modalOverlay._escapeHandler);
            }
            audioManager?.playSound('button');
        };
        
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
        
        setTimeout(() => modalOverlay.classList.add('active'), 100);
        
        const escapeHandler = (e) => {
            if (e.key === 'Escape') closeModal();
        };
        document.addEventListener('keydown', escapeHandler);
        modalOverlay._escapeHandler = escapeHandler;
        
        audioManager?.playSound('button');
    }
    
	function resetFilters() {
		currentFilters = { faction: 'all', type: 'all', rarity: 'all', position: 'all' };
		showCopies = false;
		
		const showCopiesCheckbox = document.getElementById('showCopiesCheckbox');
		if (showCopiesCheckbox) {
			showCopiesCheckbox.checked = false;
		}
		
		updateCopyToggleState();
		updateHiddenToggleState();
		
		document.querySelectorAll('.filter-faction-btn, .filter-type-btn, .filter-rarity-btn, .filter-position-btn').forEach(btn => {
			btn.classList.remove('active');
		});
		
		document.querySelectorAll('.filter-faction-all, .filter-btn-all').forEach(btn => {
			btn.classList.add('active');
		});
		
		displayCards();
		audioManager?.playSound('button');
	}

	function updateHiddenToggleState() {
		const hiddenToggle = document.querySelector('.hidden-toggle');
		if (hiddenToggle) {
			if (showHidden) {
				hiddenToggle.classList.add('active');
			} else {
				hiddenToggle.classList.remove('active');
			}
		}
	}

	function setupFilterListeners() {
		const filters = {
			faction: '.filter-faction-btn',
			type: '.filter-type-btn',
			rarity: '.filter-rarity-btn',
			position: '.filter-position-btn'
		};
		
		const updateFilter = (type, value, btn) => {
			document.querySelectorAll(filters[type]).forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			currentFilters[type] = value;
			
			if (type === 'position' && value !== 'all') {
				currentFilters.type = 'unit';
				document.querySelectorAll('.filter-type-btn').forEach(b => {
					b.classList.toggle('active', b.dataset.type === 'unit');
				});
			}
			if (type === 'type' && value !== 'unit' && value !== 'all') {
				currentFilters.position = 'all';
				document.querySelectorAll('.filter-position-btn').forEach(b => {
					b.classList.toggle('active', b.dataset.position === 'all');
				});
			}
			
			displayCards();
			audioManager?.playSound('button');
		};
		
		for (const [type, selector] of Object.entries(filters)) {
			document.querySelectorAll(selector).forEach(btn => {
				btn.addEventListener('click', () => {
					updateFilter(type, btn.dataset[type], btn);
				});
				btn.addEventListener('mouseenter', () => audioManager?.playSound('touch'));
			});
		}
		
		const showCopiesCheckbox = document.getElementById('showCopiesCheckbox');
		if (showCopiesCheckbox) {
			showCopiesCheckbox.checked = showCopies;
			updateCopyToggleState();
			
			showCopiesCheckbox.addEventListener('change', (e) => {
				showCopies = e.target.checked;
				updateCopyToggleState();
				displayCards();
				audioManager?.playSound('button');
			});
			showCopiesCheckbox.addEventListener('mouseenter', () => audioManager?.playSound('touch'));
		}

		const showHiddenCheckbox = document.getElementById('showHiddenCheckbox');
		if (showHiddenCheckbox) {
			showHiddenCheckbox.checked = showHidden;
			updateHiddenToggleState();
			
			showHiddenCheckbox.addEventListener('change', (e) => {
				showHidden = e.target.checked;
				updateHiddenToggleState();
				displayCards();
				audioManager?.playSound('button');
			});
			showHiddenCheckbox.addEventListener('mouseenter', () => audioManager?.playSound('touch'));
		}
	
		const resetBtn = document.getElementById('resetFiltersBtn');
		if (resetBtn) {
			resetBtn.addEventListener('click', resetFilters);
			resetBtn.addEventListener('mouseenter', () => audioManager?.playSound('touch'));
		}
	}
   
    function setupEscapeHandler() {
        if (escapeHandler) document.removeEventListener('keydown', escapeHandler);
        
        escapeHandler = (e) => {
            if (e.key === 'Escape') {
                const modalOverlay = document.querySelector('.card-modal-overlay');
                if (modalOverlay?.classList.contains('active')) {
                    const closeModal = () => {
                        modalOverlay.classList.remove('active');
                        setTimeout(() => modalOverlay.remove(), 300);
                        if (modalOverlay._escapeHandler) {
                            document.removeEventListener('keydown', modalOverlay._escapeHandler);
                        }
                    };
                    closeModal();
                } else {
                    closeCollection();
                }
            }
        };
        
        document.addEventListener('keydown', escapeHandler);
    }
    
    function removeEscapeHandler() {
        if (escapeHandler) {
            document.removeEventListener('keydown', escapeHandler);
            escapeHandler = null;
        }
    }
    
    function closeCollection() {
        const collectionPage = document.querySelector('.collection-page');
        if (collectionPage) {
            collectionPage.style.opacity = '0';
            setTimeout(() => {
                collectionPage.remove();
                removeEscapeHandler();
                clearCache();
                
                const startPage = document.querySelector('.start-page');
                if (startPage) {
                    startPage.style.display = 'flex';
                    startPage.style.opacity = '1';
                    
                    const logo = startPage.querySelector('.logo');
                    const menuButtons = startPage.querySelector('.main-menu-buttons');
                    
                    if (logo) {
                        logo.style.animation = 'none';
                        logo.offsetHeight;
                        logo.style.animation = 'fadeInDown 0.5s ease forwards';
                    }
                    if (menuButtons) {
                        menuButtons.style.animation = 'none';
                        menuButtons.offsetHeight;
                        menuButtons.style.animation = 'fadeInUp 0.5s ease forwards';
                    }
                } else {
                    location.reload();
                }
            }, 500);
        }
    }
    
	function initCollection() {
		const existingCollection = document.querySelector('.collection-page');
		if (existingCollection) existingCollection.remove();
		
		currentFilters = { faction: 'all', type: 'all', rarity: 'all', position: 'all' };
		allCards = [];
		showCopies = false;
		showHidden = false;
		clearCache();
		
		const startPage = document.querySelector('.start-page');
		const logo = startPage?.querySelector('.logo');
		const menuButtons = startPage?.querySelector('.main-menu-buttons');
		
		if (logo) logo.style.animation = 'fadeOutUp 0.5s ease forwards';
		if (menuButtons) menuButtons.style.animation = 'fadeOutDown 0.5s ease forwards';
		
		setTimeout(() => {
			if (startPage) {
				startPage.style.opacity = '0';
				setTimeout(() => startPage.style.display = 'none', 500);
			}
			
			getAllCards();
			
			const collectionHTML = `
				<div class="collection-page">
					<button class="back-to-menu-btn-collection" id="backToMenuBtn">Назад</button>
					<div class="collection-container">
						<div class="collection-filters">
							${generateFiltersHTML()}
						</div>
						<div class="collection-cards-area">
							<div class="collection-header">
								<h2>КОЛЛЕКЦИЯ</h2>
								<div class="collection-stats">
									<div class="collection-strength" id="collectionStrength" style="display: none;"></div>
									<div class="collection-count" id="collectionCount">0 карт</div>
								</div>
							</div>
							<div class="section-divider"></div>
							<div class="collection-grid" id="collectionGrid">
								<div class="collection-empty">
									<img src="deck/none_cards.png" alt="Загрузка">
									<p>Загрузка карт...</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			`;
			
			document.body.appendChild(createElementFromHTML(collectionHTML));
			
			setTimeout(() => {
				const collectionPage = document.querySelector('.collection-page');
				if (collectionPage) collectionPage.style.opacity = '1';
				document.body.style.background = "url('ui/fon.jpg') no-repeat center center fixed";
				document.body.style.backgroundSize = 'cover';
			}, 100);
			
			setupFilterListeners();
			setupEscapeHandler();
			
			setTimeout(() => {
				document.querySelectorAll('.filter-faction-all, .filter-btn-all').forEach(btn => btn.classList.add('active'));
				displayCards();
			}, 50);
			
			const backBtn = document.getElementById('backToMenuBtn');
			if (backBtn) {
				backBtn.addEventListener('click', () => {
					audioManager?.playSound('button');
					closeCollection();
				});
				backBtn.addEventListener('mouseenter', () => audioManager?.playSound('touch'));
			}
			
			updateCopyToggleState();
			
			if (window.settingsModule) {
				const originalNotify = settingsModule.notifySettingsChange;
				settingsModule.notifySettingsChange = function() {
					originalNotify?.call(this);
					refreshCardsDisplay();
				};
			}
		}, 500);
	}
   
	function updateCopyToggleState() {
		const copyToggle = document.querySelector('.copy-toggle');
		if (copyToggle) {
			if (showCopies) {
				copyToggle.classList.add('active');
			} else {
				copyToggle.classList.remove('active');
			}
		}
	}
   
    function generateFiltersHTML() {
        return `
            <div class="filter-section">
                <div class="filter-title">Фракция</div>
                <div class="section-divider"></div>
                <div class="filter-buttons faction-buttons">
                    <button class="filter-faction-btn filter-faction-all active" data-faction="all"><span>Все</span></button>
                    <div class="faction-grid">
                        ${generateFactionButtons()}
                    </div>
                </div>
            </div>
            <div class="filter-section">
                <div class="filter-title">Тип</div>
                <div class="section-divider"></div>
                <div class="filter-buttons type-buttons">
                    <button class="filter-btn filter-type-btn filter-btn-all active" data-type="all"><span>Все</span></button>
                    <div class="type-grid">
                        ${generateTypeButtons()}
                    </div>
                </div>
            </div>
            <div class="filter-section">
                <div class="filter-title">Редкость</div>
                <div class="section-divider"></div>
                <div class="filter-buttons rarity-buttons">
                    <button class="filter-btn filter-rarity-btn filter-btn-all active" data-rarity="all"><span>Все</span></button>
                    <div class="rarity-grid">
                        ${generateRarityButtons()}
                    </div>
                </div>
            </div>
            <div class="filter-section">
                <div class="filter-title">Позиция</div>
                <div class="section-divider"></div>
                <div class="filter-buttons position-buttons">
                    <button class="filter-position-btn filter-btn-all active" data-position="all"><span>Все</span></button>
                    <div class="position-grid">
                        ${generatePositionButtons()}
                    </div>
                </div>
            </div>
			<div class="section-divider"></div>
			<div class="toggles-group">
				<label class="copy-toggle">
					<input type="checkbox" id="showCopiesCheckbox">
					<span class="copy-toggle-label">Учитывать силу и кол-во копий</span>
				</label>
				<label class="copy-toggle hidden-toggle">
					<input type="checkbox" id="showHiddenCheckbox">
					<span class="copy-toggle-label">Отображать скрытые карты</span>
				</label>
			</div>
            <div class="section-divider"></div>
            <div class="filter-section reset-section">
                <button class="reset-filters-btn" id="resetFiltersBtn">
                    <img src="deck/auto_build.png" alt="Сброс">
                    <span>СБРОСИТЬ ФИЛЬТРЫ</span>
                </button>
            </div>
        `;
    }
    
    function generateFactionButtons() {
        const factions = [
            { id: 'monsters', name: 'Чудовища', icon: 'faction/monsters/icon.png' },
            { id: 'nilfgaard', name: 'Нильфгаард', icon: 'faction/nilfgaard/icon.png' },
            { id: 'realms', name: 'Королевства', icon: 'faction/realms/icon.png' },
            { id: 'scoiatael', name: 'Скоя\'таэли', icon: 'faction/scoiatael/icon.png' },
            { id: 'skellige', name: 'Скеллиге', icon: 'faction/skellige/icon.png' },
            { id: 'syndicate', name: 'Синдикат', icon: 'faction/syndicate/icon.png' },
            { id: 'neutral', name: 'Нейтральные', icon: 'faction/neutral/icon.png' }
        ];
        
        return factions.map(f => `
            <button class="filter-faction-btn" data-faction="${f.id}">
                <img src="${f.icon}" alt="${f.name}" class="filter-faction-img" onerror="this.src='faction/${f.id}/logo_faction.png'">
                <span>${f.name}</span>
            </button>
        `).join('');
    }
    
    function generateTypeButtons() {
        const types = [
            { id: 'unit', name: 'Отряды', icon: 'deck/unit.png' },
            { id: 'special', name: 'Спец. карты', icon: 'deck/special.png' },
            { id: 'artifact', name: 'Артефакты', icon: 'deck/artifact.png' },
            { id: 'tactic', name: 'Тактики', icon: 'deck/tactic.png' }
        ];
        
        return types.map(t => `
            <button class="filter-btn filter-type-btn" data-type="${t.id}">
                <img src="${t.icon}" alt="${t.name}" class="filter-icon">
                <span>${t.name}</span>
            </button>
        `).join('');
    }
    
    function generateRarityButtons() {
        const rarities = [
            { id: 'bronze', name: 'Бронзовые', color: '#b87333' },
            { id: 'silver', name: 'Серебряные', color: '#e3e4e5' },
            { id: 'gold', name: 'Золотые', color: '#f5b642' }
        ];
        
        return rarities.map(r => `
            <button class="filter-btn filter-rarity-btn" data-rarity="${r.id}" style="color: ${r.color}">${r.name}</button>
        `).join('');
    }
    
    function generatePositionButtons() {
        const positions = [
            { id: 'close-row', name: 'Ближний', icon: 'deck/close-row.png' },
            { id: 'hidden-close-row', name: 'Шпион-Ближ', icon: 'deck/hidden-close-row.png' },
            { id: 'ranged-row', name: 'Дальний', icon: 'deck/ranged-row.png' },
            { id: 'hidden-ranged-row', name: 'Шпион-Даль', icon: 'deck/hidden-ranged-row.png' },
            { id: 'siege-row', name: 'Осадный', icon: 'deck/siege-row.png' },
            { id: 'hidden-siege-row', name: 'Шпион-Осад', icon: 'deck/hidden-siege-row.png' },
            { id: 'any-row', name: 'Гибридный', icon: 'deck/any-row.png' },
            { id: 'hidden-any-row', name: 'Шпион-Гибр', icon: 'deck/hidden-any-row.png' }
        ];
        
        return positions.map(p => `
            <button class="filter-position-btn" data-position="${p.id}">
                <img src="${p.icon}" alt="${p.name}" class="filter-icon">
                <span>${p.name}</span>
            </button>
        `).join('');
    }
    
    function createElementFromHTML(htmlString) {
        const div = document.createElement('div');
        div.innerHTML = htmlString.trim();
        return div.firstChild;
    }
    
    function refreshCardsDisplay() {
        if (document.querySelector('.collection-page')) displayCards();
    }
    
    return {
        initCollection,
        getAllCards,
        filterCards,
        displayCards,
        resetFilters,
        refreshCardsDisplay
    };
})();

window.collectionModule = collectionModule;