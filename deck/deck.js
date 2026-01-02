const localization = {
    factions: {
        neutral: 'Нейтралитет',
        monsters: 'Чудовища',
        nilfgaard: 'Нильфгаард',
        realms: 'Королевства Севера',
        scoiatael: 'Скоя\'таэли',
        skellige: 'Скеллиге',
		syndicate: 'Синдикат',
    },
    cardTypes: {
        unit: 'Отряд',
        special: 'Специальная карта',
        artifact: 'Артефакт',
        tactic: 'Тактика',
        leader: 'Лидер',
    },
    rarities: {
        bronze: 'Бронзовая',
        silver: 'Серебренная',
        gold: 'Золотая'
    },
    tags: {
        leader: 'Лидер',
        wild_hunt: 'Дикая Охота',
        emperor: 'Император',
        king: 'Король',
        kingser: 'Знать',
        mage: 'Чародей',
        witcher: 'Ведьмак',
        soldier: 'Солдат',
        monster: 'Чудовище',
        weather: 'Погода',
        tactic: 'Тактика',
    }
};

const factionAbilities = {
    scoiatael: [
        {
            id: 'scoiatael_ability_1',
            name: 'Махакамская кузня',
            description: 'Добавьте всем краснолюдам в вашей стартовой колоде 1 ед. брони',
            icon: 'faction/scoiatael/abilities/forge.png'
        },
        {
            id: 'scoiatael_ability_2', 
            name: 'Засада ловчих',
            description: 'Призыв Эльфского ловчего',
            icon: 'faction/scoiatael/abilities/ambush.png'
        },
        {
            id: 'scoiatael_ability_3', 
            name: 'Точный удар',
            description: 'Нанесите 1 ед. урона отряду противника',
            icon: 'faction/scoiatael/abilities/accuracy.png'
        },
        {
            id: 'scoiatael_ability_4', 
            name: 'Дар природы',
            description: 'Усильте 4 отряда в вашей руке на 1 ед',
            icon: 'faction/scoiatael/abilities/gift.png'
        },
        {
            id: 'scoiatael_ability_5', 
            name: 'Партизанская тактика',
            description: 'Переместите отряд в другой ряд на его стороне. Если это вражеский отряд, нанесите ему 1 ед. урона; если дружественный — усильте его на 3 ед.',
            icon: 'faction/scoiatael/abilities/tactic.png'
        },
    ],
    realms: [
        {
            id: 'realms_ability_1',
            name: 'Королевское вдохновение',
            description: 'Усильте дружественный отряд на 5 ед.',
            icon: 'faction/realms/abilities/king.png'
        },
        {
            id: 'realms_ability_2',
            name: 'Ополчение',
            description: 'Усильте дружественный отряд на 1 ед.',
            icon: 'faction/realms/abilities/militia.png'
        },
        {
            id: 'realms_ability_3',
            name: 'Стена щитов',
            description: 'Усильте дружественный отряд на 2 ед. и добавьте ему щит',
            icon: 'faction/realms/abilities/shield.png'
        },
        {
            id: 'realms_ability_4',
            name: 'Побуждение к действию',
            description: 'Усильте дружественный отряд на 2 ед. ',
            icon: 'faction/realms/abilities/incitement.png'
        },
        {
            id: 'realms_ability_5',
            name: 'Мобилизация',
            description: 'Создайте изначальную копию бронзового дружественного солдата в его ряду и усильте оба отряда на 3 ед.',
            icon: 'faction/realms/abilities/mobilization.png'
        }
    ],
    nilfgaard: [
        {
            id: 'nilfgaard_ability_1',
            name: 'Имперское построение',
            description: 'Усильте 2 дружественных отряда на 1 ед. и поменяйте их местами, затем добавьте по 1 ед. брони каждому из этих отрядов',
            icon: 'faction/nilfgaard/abilities/construction.png'
        },
        {
            id: 'nilfgaard_ability_2',
            name: 'Заточение',
            description: 'Заблокируйте вражеский отряд и нанесите ему 3 ед. урона',
            icon: 'faction/nilfgaard/abilities/block.png'
        },
        {
            id: 'nilfgaard_ability_3',
            name: 'Порабощение',
            description: 'Захватите вражеский отряд с силой 3 ед. или меньше. Увеличьте это значение на 1 ед. за каждую карту тактики в вашей колоде',
            icon: 'faction/nilfgaard/abilities/capture.png'
        },
        {
            id: 'nilfgaard_ability_4',
            name: 'Туссентское гостеприимство',
            description: 'Усиливайте случайный дружественный отряд на 1 ед. каждый раз, когда усиливаете хотя бы один вражеский отряд во время вашего хода',
            icon: 'faction/nilfgaard/abilities/tusent.png'
        },
        {
            id: 'nilfgaard_ability_5',
            name: 'Двойная игра',
            description: 'Сыграйте карту из руки противника',
            icon: 'faction/nilfgaard/abilities/twoface.png'
        }
    ],
    monsters: [
        {
            id: 'monsters_ability_1',
            name: 'Белый Хлад',
            description: 'Переместите вражеский отряд в другой ряд на его стороне и создайте эффект мороза в его ряду на 2 хода',
            icon: 'faction/monsters/abilities/cold.png'
        },
        {
            id: 'monsters_ability_2',
            name: 'Неутолимый голод',
            description: 'Уничтожьте дружественный отряд, затем создайте в этом ряду Экимму и усильте ее на значение силы уничтоженного отряда',
            icon: 'faction/monsters/abilities/hangry.png'
        },
        {
            id: 'monsters_ability_3',
            name: 'Запах крови',
            description: 'Добавьте кровотечение вражескому отряду на 3 хода',
            icon: 'faction/monsters/abilities/blood.png'
        },
        {
            id: 'monsters_ability_4',
            name: 'Сила природы',
            description: 'Призыв Духа Леса',
            icon: 'faction/monsters/abilities/forest.png'
        },
        {
            id: 'monsters_ability_5',
            name: 'Панцирь',
            description: 'Усильте дружественный отряд на 3 ед. Если это не нейтральный отряд, также добавьте ему покров',
            icon: 'faction/monsters/abilities/sheild.png'
        }
    ],
    skellige: [
        {
            id: 'skellige_ability_1',
            name: 'Безрассудная ярость',
            description: 'Случайным образом распределите 4 ед. урона между всеми вражескими отрядами, игнорируя их броню',
            icon: 'faction/skellige/abilities/rage.png'
        },
        {
            id: 'skellige_ability_2',
            name: 'Гнев моря',
            description: 'Создайте эффект дождя в ряду противника на 2 хода',
            icon: 'faction/skellige/abilities/more.png'
        },
        {
            id: 'skellige_ability_3',
            name: 'Натиск',
            description: 'Нанесите 3 ед. урона вражескому отряду',
            icon: 'faction/skellige/abilities/onslaught.png'
        },
        {
            id: 'skellige_ability_4',
            name: 'Медвежий ритуал',
            description: 'Нанесите 1 ед. урона дружественному отряду. И призовите Медведя Свальблода',
            icon: 'faction/skellige/abilities/bear.png'
        },
        {
            id: 'skellige_ability_5',
            name: 'Пламя славы',
            description: 'Переместите не нейтральный отряд из вашей колоды в ваш сброс, затем нанесите вражескому отряду урон, равный значению силы перемещенного отряда',
            icon: 'faction/skellige/abilities/respect.png'
        }
    ],
	syndicate: [
        {
            id: 'syndicate_ability_1',
            name: 'Пиратская бухта',
            description: 'Создайте Морскую гиену в дружественном ряду',
            icon: 'faction/syndicate/abilities/pirates.png'
        },
        {
            id: 'syndicate_ability_2',
            name: 'Заказ на убийство',
            description: 'Нанесите 6 ед. урона вражескому отряду',
            icon: 'faction/syndicate/abilities/order.png'
        },
        {
            id: 'syndicate_ability_3',
            name: 'Священное братство',
            description: 'Призыв карты «Дети Огня: адепт» в дружественном ряду',
            icon: 'faction/syndicate/abilities/brother.png'
        },
        {
            id: 'syndicate_ability_4',
            name: 'Кровавые деньги',
            description: 'В начале каждого раунда восстанавливает способность Лидера',
            icon: 'faction/syndicate/abilities/money.png'
        },
        {
            id: 'syndicate_ability_5',
            name: 'Резьня',
            description: 'Нанесите 3 ед. урона вражескому отряду',
            icon: 'faction/syndicate/abilities/carnage.png'
        }
    ]
};

const defaultAbilities = {
    scoiatael: 'scoiatael_ability_1',
    realms: 'realms_ability_1', 
    nilfgaard: 'nilfgaard_ability_1',
    monsters: 'monsters_ability_1',
    skellige: 'skellige_ability_1',
    syndicate: 'syndicate_ability_1',
};

function localizeFaction(factionId) {
    return localization.factions[factionId] || factionId;
}

function localizeCardType(type) {
    return localization.cardTypes[type] || type;
}

function localizeRarity(rarity) {
    return localization.rarities[rarity] || rarity;
}

function localizeTags(tags) {
    return tags ? tags.map(tag => localization.tags[tag] || tag) : [];
}

let currentDeck = {
    faction: null,
    leader: null,
    ability: null, 
    cards: [],
    stats: {
        total: 0,
        units: 0,
        specials: 0,
        totalStrength: 0
    }
};

let availableCards = {
    units: [],
    specials: [],
    artifacts: [],
    tactics: []
};

let displayedCollectionCards = [];

function initDeckBuilding(faction) {
    window.selectedFaction = faction;
    currentDeck.faction = faction.id;
    currentDeck.ability = defaultAbilities[faction.id];
    currentDeck.cards = [];
    hideFactionSelection();
    createDeckBuildingHTML();
    loadFactionCards(faction);
    setFactionBackground(faction);
    setFactionHeadersBackground(faction.id);
}

function hideFactionSelection() {
    const factionSection = document.querySelector('.faction-selection');
    if (factionSection) {
        factionSection.style.opacity = '0';
        factionSection.style.transform = 'translateY(50px)';
        setTimeout(() => {
            factionSection.remove();
        }, 800);
    }
}

function createDeckBuildingHTML() {
    const faction = window.selectedFaction;
    const leaderImage = `faction/${faction.id}/leader.jpg`;
    const leaderVideo = `faction/${faction.id}/leader.mp4`;
    
    const hasVideo = true; 
    
    let leaderMedia = '';
    if (hasVideo) {
        leaderMedia = `
            <video class="leader-card__media" autoplay loop muted playsinline>
                <source src="${leaderVideo}" type="video/mp4"></video>
        `;
    } else {
        leaderMedia = `<img src="${leaderImage}" alt="Лидер ${faction.name}" class="leader-card__media">`;
    }
    const leaderName = window.selectedFaction.leaderName || 'Лидер';
	
	const currentAbility = currentDeck.ability || defaultAbilities[faction.id];
    const abilityData = factionAbilities[faction.id].find(a => a.id === currentAbility) || factionAbilities[faction.id][0];
	
    const deckBuildingSection = document.createElement('section');
    deckBuildingSection.className = 'deck-building';
    deckBuildingSection.innerHTML = `
        <button class="back-to-faction-btn" id="backToFactionBtn">Назад</button>
		
		<div class="deck-building__container">

            <div class="cards-collection">
				<div class="deck-cards__header" id="collectionHeader" data-faction="${faction.id}">
					<div class="section-header">
						<h2>КОЛЛЕКЦИЯ</h2>
						<div class="sort-buttons">
							<button class="sort-btn active" data-type="all">
								<img src="deck/all.png" alt="Все карты" title="Все карты">
							</button>
							<button class="sort-btn" data-type="units">
								<img src="deck/unit.png" alt="Отряды" title="Отряды">
							</button>
							<button class="sort-btn" data-type="specials">
								<img src="deck/special.png" alt="Спец. карты" title="Спец. карты">
							</button>
							<button class="sort-btn" data-type="tactics">
								<img src="deck/tactic.png" alt="Тактика" title="Тактика">
							</button>
							<button class="sort-btn" data-type="artifacts">
								<img src="deck/artifact.png" alt="Артефакты" title="Артефакты">
							</button>
						</div>
					</div>
				</div>
					<div class="deck-cards__content">
						<div class="cards-grid" id="collectionGrid">
						</div>
					</div>
            </div>
            
            <div class="deck-stats">
			
                <div class="leader-card">
                    ${leaderMedia}
                    <img src="deck/bord_gold.png" alt="Рамка" class="leader__border">
                    <img src="faction/${faction.id}/banner_gold.png" alt="Баннер" class="leader__banner">
                    <div class="leader__name">${faction.leaderName.split(' ')[0]}</div>
					<img src="deck/ability.png" alt="Лого" class="leader__logo" id="factionLogo">
                </div>
				
				<div class="faction-ability">
                    <div class="faction-ability__header">
                        <h3>СПОСОБНОСТЬ ЛИДЕРА</h3>
                    </div>
                    <div class="faction-ability__content">
                        <div class="ability-icon">
                            <img src="${abilityData.icon}" alt="${abilityData.name}">
                        </div>
                        <div class="ability-info">
                            <div class="ability-name">${abilityData.name}</div>
                            <div class="ability-description">${abilityData.description}</div>
                        </div>
                    </div>
                </div>
				
                <div class="stats-info">
                    <div class="stat-group">
                        <span class="stat-label">Карт в колоде</span>
                        <div class="stat-item">
                            <img src="deck/stats_count.png" alt="Всего карт">
                            <span class="stat-value" id="totalCards">0</span>
                        </div>
                    </div>
                    <div class="stat-group">
                        <span class="stat-label">Карт отрядов</span>
                        <div class="stat-item">
                            <img src="deck/stats_unit.png" alt="Отряды">
                            <span class="stat-value" id="unitCards">0</span>
                        </div>
                    </div>
                    <div class="stat-group">
                        <span class="stat-label">Специальных карт</span>
                        <div class="stat-item">
                            <img src="deck/stats_special.png" alt="Спец. карты">
                            <span class="stat-value" id="specialCards">0</span>
                        </div>
                    </div>
                    <div class="stat-group">
                        <span class="stat-label">Общая сила колоды</span>
                        <div class="stat-item">
                            <img src="deck/stats_strength.png" alt="Общая сила">
                            <span class="stat-value" id="totalStrength">0</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="deck-cards">
				<div class="deck-cards__header" id="deckHeader" data-faction="${faction.id}">
					<div class="section-header">
						<h2>КОЛОДА</h2>
						<div class="sort-buttons">
							<button class="sort-btn active" data-type="all">
								<img src="deck/all.png" alt="Все карты" title="Все карты">
							</button>
							<button class="sort-btn" data-type="units">
								<img src="deck/unit.png" alt="Отряды" title="Отряды">
							</button>
							<button class="sort-btn" data-type="specials">
								<img src="deck/special.png" alt="Спец. карты" title="Спец. карты">
							</button>
							<button class="sort-btn" data-type="tactics">
								<img src="deck/tactic.png" alt="Тактика" title="Тактика">
							</button>
							<button class="sort-btn" data-type="artifacts">
								<img src="deck/artifact.png" alt="Артефакты" title="Артефакты">
							</button>
						</div>
					</div>
				</div>
				
				<div class="deck-cards__content">
					<div class="cards-grid" id="deckGrid">
						<div class="empty-deck-message">
							<p>Колода пуста</p>
							<p>Добавьте карты из коллекции</p>
							<img src="deck/none_cards.png" alt="Пустая колода" class="empty-deck-icon">
						</div>
					</div>
				</div>
				
				<div class="deck-controls-panel" id="deckControlsPanel">
					<button class="deck-control-btn auto-build-btn" id="autoBuildBtn" title="Автоматический сбор колоды">
						<img src="deck/auto_build.png" alt="A">
						<span>АВТОСБОР</span>
					</button>
					<button class="deck-control-btn save-deck-btn" id="saveDeckBtn" title="Сохранить колоду в файл">
						<img src="deck/auto_build.png" alt="S">
						<span>СОХРАНИТЬ</span>
					</button>
					<button class="deck-control-btn load-deck-btn" id="loadDeckBtn" title="Загрузить колоду из файла">
						<img src="deck/auto_build.png" alt="D">
						<span>ЗАГРУЗИТЬ</span>
					</button>
					<button class="deck-control-btn clear-deck-btn" id="clearDeckBtn" title="Очистить колоду">
						<img src="deck/none_cards.png" alt="C">
						<span>ОЧИСТИТЬ</span>
					</button>
				</div>
			</div>
		</div>
        
        <button class="start-game-btn" id="startGameBtn">В БОЙ</button>
    `;
    
    document.body.appendChild(deckBuildingSection);
    setTimeout(() => {
        deckBuildingSection.style.opacity = '1';
    }, 50);
    
    setupLeaderVideoControls();
    setupDeckBuildingEventListeners();
}             

function setupFactionAbilityControls(faction) {
    const factionLogo = document.getElementById('factionLogo');
    if (factionLogo) {
        factionLogo.style.cursor = 'pointer';
        factionLogo.addEventListener('click', () => {
            showAbilitiesModal(faction);
            audioManager.playSound('button');
        });
        
        factionLogo.addEventListener('mouseenter', () => {
            audioManager.playSound('touch');
        });
    }
}

function showAbilitiesModal(faction) {
    const abilities = factionAbilities[faction.id] || [];
    const currentAbility = currentDeck.ability || defaultAbilities[faction.id];
    
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'abilities-modal-overlay';
    modalOverlay.innerHTML = `
        <div class="abilities-modal">
            <div class="abilities-modal__title">ВЫБЕРИТЕ СПОСОБНОСТЬ ЛИДЕРА</div>
            <div class="abilities-list">
                ${abilities.map(ability => `
                    <div class="ability-option ${ability.id === currentAbility ? 'selected' : ''}" 
                         data-ability-id="${ability.id}">
                        <div class="ability-option__icon">
                            <img src="${ability.icon}" alt="${ability.name}">
                        </div>
                        <div class="ability-option__info">
                            <div class="ability-option__name">${ability.name}</div>
                            <div class="ability-option__description">${ability.description}</div>
                        </div>
                        ${ability.id === currentAbility ? '<div class="ability-option__check"><img src="deck/activ.png" alt="Выбрано"></div>' : ''}
                    </div>
                `).join('')}
            </div>
            <button class="abilities-confirm-btn" id="confirmAbilityBtn">ПОДТВЕРДИТЬ ВЫБОР</button>
        </div>
    `;
    
    document.body.appendChild(modalOverlay);
    
    setTimeout(() => {
        modalOverlay.classList.add('active');
    }, 10);
    
    setupAbilitiesModalEventListeners(modalOverlay, faction, abilities);
}

function setupAbilitiesModalEventListeners(modalOverlay, faction, abilities) {
    const abilityOptions = modalOverlay.querySelectorAll('.ability-option');
    let selectedAbility = currentDeck.ability || defaultAbilities[faction.id];
    
    abilityOptions.forEach(option => {
        option.addEventListener('click', () => {
            abilityOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedAbility = option.dataset.abilityId;
            audioManager.playSound('touch');
        });
        
        option.addEventListener('mouseenter', () => {
            audioManager.playSound('touch');
        });
    });
    
    const confirmBtn = modalOverlay.querySelector('#confirmAbilityBtn');
    confirmBtn.addEventListener('click', () => {
        currentDeck.ability = selectedAbility;
        updateFactionAbilityDisplay(faction);
        closeAbilitiesModal(modalOverlay);
        audioManager.playSound('button');
    });
    
    confirmBtn.addEventListener('mouseenter', () => {
        audioManager.playSound('touch');
    });
    
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeAbilitiesModal(modalOverlay);
        }
    });
    
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeAbilitiesModal(modalOverlay);
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

function updateFactionAbilityDisplay(faction) {
    const abilityData = factionAbilities[faction.id].find(a => a.id === currentDeck.ability);
    if (!abilityData) return;
    
    const abilitySection = document.querySelector('.faction-ability__content');
    if (abilitySection) {
        abilitySection.innerHTML = `
            <div class="ability-icon">
                <img src="${abilityData.icon}" alt="${abilityData.name}">
            </div>
            <div class="ability-info">
                <div class="ability-name">${abilityData.name}</div>
                <div class="ability-description">${abilityData.description}</div>
            </div>
        `;
    }
}

function closeAbilitiesModal(modalOverlay) {
    modalOverlay.classList.remove('active');
    setTimeout(() => {
        if (modalOverlay.parentNode) {
            modalOverlay.parentNode.removeChild(modalOverlay);
        }
    }, 300);
    audioManager.playSound('button');
}

function setupLeaderVideoControls() {
    const leaderCard = document.querySelector('.leader-card');
    const video = leaderCard.querySelector('video');
    const factionLogo = document.getElementById('factionLogo');
    const cardDisplayMode = window.settingsModule ? window.settingsModule.getCardDisplayMode() : 'animated';
    
    if (cardDisplayMode === 'static' && video) {
        const leaderImage = `faction/${window.selectedFaction.id}/leader.jpg`;
        const imgElement = document.createElement('img');
        imgElement.src = leaderImage;
        imgElement.alt = `Лидер ${window.selectedFaction.name}`;
        imgElement.className = 'leader-card__media';
        
        video.parentNode.replaceChild(imgElement, video);
    }
    if (factionLogo) {
        factionLogo.style.cursor = 'pointer';
        factionLogo.addEventListener('click', (e) => {
            e.stopPropagation();
            const faction = window.selectedFaction;
            if (faction) {
                showAbilitiesModal(faction);
                audioManager.playSound('button');
            }
        });
        
        factionLogo.addEventListener('mouseenter', () => {
            audioManager.playSound('touch');
        });
    }
    leaderCard.addEventListener('click', () => {
        const faction = window.selectedFaction;
        if (faction) {
            const leaderCardData = {
                id: `${faction.id}_leader`,
                name: faction.leaderName.split(' ')[0],
                namefull: faction.leaderName, 
                type: 'leader',
                faction: faction.id,
                image: `leader.mp4`,
                descriptionfull: `${faction.description}`,
                ability: `${faction.id}_ability`,
                rarity: 'gold',
                tags: ['leader'],
                border: 'deck/bord_gold.png',
                banner: `faction/${faction.id}/banner_gold.png`
            };
            showCardModal(leaderCardData);
        }
    });
    if (video) {
        leaderCard.addEventListener('mouseenter', () => {
            video.play().catch(e => {});
        });
    }
}

function setFactionBackground(faction) {
    document.body.style.background = `url('${faction.background}') no-repeat center center fixed`;
    document.body.style.backgroundSize = 'cover';
}

function setFactionHeadersBackground(factionId) {
    const deckHeader = document.getElementById('deckHeader');
    if (deckHeader) {
        const backgroundImage = `faction/${factionId}/border_faction.png`;
        setHeaderBackground(deckHeader, backgroundImage);
    }
    
    const collectionHeader = document.getElementById('collectionHeader');
    if (collectionHeader) {
        const backgroundImage = `faction/${factionId}/border_faction.png`;
        setHeaderBackground(collectionHeader, backgroundImage);
    }
}

function setHeaderBackground(headerElement, backgroundImage) {
    headerElement.style.background = `url('${backgroundImage}')`;
    const img = new Image();
    img.src = backgroundImage;
}

function loadFactionCards(faction) {
    displayedCollectionCards = [];
    if (window.cardsModule && window.cardsModule.getFactionCards) {
        availableCards = window.cardsModule.getFactionCards(faction.id);
        displayedCollectionCards = [
            ...availableCards.units,
            ...availableCards.specials,
            ...availableCards.artifacts,
            ...availableCards.tactics 
        ];
        sortCollectionCards();
    }
    setTimeout(() => {
        displayCollectionCards();
    }, 100);
}

function backToFactionSelection() {
    const deckBuildingSection = document.querySelector('.deck-building');
    if (deckBuildingSection) {
        deckBuildingSection.style.opacity = '0';
        deckBuildingSection.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            deckBuildingSection.remove();
            currentDeck = {
                faction: null,
                leader: null,
                ability: null, 
                cards: [],
                stats: {
                    total: 0,
                    units: 0,
                    specials: 0,
                    totalStrength: 0
                }
            };
            displayedCollectionCards = [];
            document.body.style.background = "url('ui/fon.jpg') no-repeat center center fixed";
            document.body.style.backgroundSize = 'cover';
            
            if (window.factionModule && window.factionModule.initFactionSelection) {
                window.factionModule.initFactionSelection();
            }
        }, 800);
    }
}


function displayCollectionCards() {
    const collectionGrid = document.getElementById('collectionGrid');
    const activeFilter = document.querySelector('.cards-collection .sort-btn.active');
    let filterType = 'all';
    
    if (activeFilter) {
        filterType = activeFilter.dataset.type;
    }
    
    sortCollection(filterType);
}

function createCardElement(card, context) {
    const cardElement = document.createElement('div');
    cardElement.className = `card ${card.type} ${card.rarity} ${context}-card`;
    cardElement.dataset.cardId = card.id;
    cardElement.dataset.cardType = card.type;
    cardElement.dataset.cardPosition = card.position || 'any';
    
    const cardDisplayMode = window.settingsModule ? window.settingsModule.getCardDisplayMode() : 'animated';
    
    let mediaPath = `card/${card.faction}/${card.image}`;
    let isVideo = card.image.endsWith('.mp4');
    
    if (cardDisplayMode === 'static' && isVideo) {
        mediaPath = mediaPath.replace('.mp4', '.jpg');
        isVideo = false;
    }
    
    let mediaElement = '';
    if (isVideo) {
        mediaElement = `
            <video class="card__media" muted playsinline preload="metadata">
                <source src="${mediaPath}" type="video/mp4">
            </video>
        `;
    } else {
        mediaElement = `<img src="${mediaPath}" alt="${card.name}" class="card__media" onerror="this.src='card/placeholder.jpg'">`;
    }
    
    let topRightElement = '';
    if (card.type === 'unit') {
        topRightElement = `<div class="card__strength">${card.strength}</div>`;
    } else {
        const typeIconPath = getTypeIconPath(card.type);
        topRightElement = `
            <div class="card__type-icon">
                <img src="${typeIconPath}" alt="${card.type}">
            </div>
        `;
    }
    
    let positionElement = '';
    if (card.type === 'unit' && card.position) {
        const positionIconPath = getPositionIconPath(card.position);
        positionElement = `
            <div class="card__position">
                <img src="${card.positionBanner || 'deck/position_banner.png'}" alt="Позиция" class="card__position-banner">
                <img src="${positionIconPath}" alt="${card.position}" class="card__position-icon">
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
            <div class="card__description">
                <div class="card__description-text">${card.description}</div>
            </div>
        </div>
    `;
    
    cardElement.addEventListener('click', (event) => {
        handleCardClick(card, context, event);
    });
    
    cardElement.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        handleCardClick(card, context, event);
    });
    
    if (context === 'collection') {
        setupCardHoverEffects(cardElement);
    } else if (context === 'deck') {
        setupCardHoverEffects(cardElement);
    }
    
    if (isVideo && cardDisplayMode === 'animated') {
        setupVideoControls(cardElement);
    }
    
    return cardElement;
}

function getPositionIconPath(position) {
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
}

function getPositionName(position) {
    const positionNames = {
        'close-row': 'Ближний бой',
        'ranged-row': 'Дальний бой',
        'siege-row': 'Осадный ряд',
		'any-row': 'Все ряды',
        'hidden-close-row': 'Ближний бой',
        'hidden-ranged-row': 'Дальний бой',
        'hidden-siege-row': 'Осадный ряд',
		'hidden-any-row': 'Все ряды',
    };
    
    return positionNames[position] || position;
}

function handleCardClick(card, context, event) {
    if (event.button === 0) {
        if (context === 'collection') {
            addCardToDeck(card);
        } else if (context === 'deck') {
            removeCardFromDeck(card);
        }
        event.stopPropagation();
    } else if (event.button === 2) {
        event.preventDefault();
        showCardModal(card);
        event.stopPropagation();
    }
}

function showCardModal(card) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'card-modal-overlay';
    
    const cardDisplayMode = window.settingsModule ? window.settingsModule.getCardDisplayMode() : 'animated';
    
    let mediaPath = '';
    if (card.type === 'leader') {
        mediaPath = `faction/${card.faction}/${card.image}`;
    } else {
        mediaPath = `card/${card.faction}/${card.image}`;
    }
    
    let isVideo = card.image.endsWith('.mp4');
    
    if (cardDisplayMode === 'static' && isVideo) {
        mediaPath = mediaPath.replace('.mp4', '.jpg');
        isVideo = false;
    }
    
    let mediaElement = '';
    if (isVideo) {
        mediaElement = `
            <video class="card__media" autoplay loop muted playsinline>
                <source src="${mediaPath}" type="video/mp4">
            </video>
        `;
    } else {
        mediaElement = `<img src="${mediaPath}" alt="${card.name}" class="card__media">`;
    }
    
    let topRightElement = '';
    if (card.type === 'unit') {
        topRightElement = `<div class="card__strength">${card.strength}</div>`;
    } else if (card.type === 'leader') {
        topRightElement = `
            <div class="card__type-icon">
                <img src="deck/type_leader.png" alt="Лидер">
            </div>
        `;
    } else {
        const typeIconPath = getTypeIconPath(card.type);
        topRightElement = `
            <div class="card__type-icon">
                <img src="${typeIconPath}" alt="${card.type}">
            </div>
        `;
    }
	
    let positionElement = '';
    if (card.type === 'unit' && card.position) {
        const positionIconPath = getPositionIconPath(card.position);
        positionElement = `
            <div class="card__position">
                <img src="${card.positionBanner || 'faction/${card.faction}/position_banner.png'}" alt="Позиция" class="card__position-banner">
                <img src="${positionIconPath}" alt="${card.position}" class="card__position-icon">
            </div>
        `;
    }
	
    const displayName = card.name || 'Без имени';
    
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
                ${createCardInfoHTML(card)}
            </div>
        </div>
    `;
    
    document.body.appendChild(modalOverlay);
    
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            closeCardModal(modalOverlay);
        }
    });
    
    const escapeHandler = (event) => {
        if (event.key === 'Escape') {
            closeCardModal(modalOverlay);
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    setTimeout(() => {
        modalOverlay.classList.add('active');
        setupModalVideoControls(modalOverlay);
    }, 10);
    
    audioManager.playSound('button');
}

function createCardInfoHTML(card) {
    const factionName = localizeFaction(card.faction);
    
    const displayName = card.namefull || card.name || 'Без имени';
    const displayDescription = card.descriptionfull || card.description || 'Описание отсутствует';
    
    const ability = window.skillSystem ? window.skillSystem.abilities[card.ability] : null;
    
    return `
        <div class="card-modal__title">${displayName}</div>
        <div class="card-modal__faction">${card.description}</div>
        
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
            <div class="card-modal__stat">
                <div class="card-modal__stat-label">Фракция</div>
                <div class="card-modal__stat-value">${factionName}</div>
            </div>
        </div>
        
        <div class="card-modal__description">
            <div class="card-modal__description-title">Описание</div>
            <div class="card-modal__description-text">${displayDescription}</div>
        </div>
        
        ${ability ? `
        <div class="card-modal__abilities">
            <div class="card-modal__abilities-title">Способность</div>
            <div class="card-modal__ability">
                <div class="card-modal__ability-name">${ability.name}</div>
                <div class="card-modal__ability-description">${ability.description}</div>
            </div>
        </div>
        ` : ''}
        
        ${card.tags && card.tags.length > 0 ? `
		<div class="card-modal__abilities">
			<div class="card-modal__abilities-title">Теги</div>
			${localizeTags(card.tags).map(tag => `
				<div class="card-modal__ability">
					<div class="card-modal__ability-description">${tag}</div>
				</div>
			`).join('')}
		</div>
		` : ''}
    `;
}

function closeCardModal(modalOverlay) {
    modalOverlay.classList.remove('active');
    setTimeout(() => {
        if (modalOverlay.parentNode) {
            modalOverlay.parentNode.removeChild(modalOverlay);
        }
    }, 300);
    audioManager.playSound('button');
}

function setupModalVideoControls(modalOverlay) {
    const video = modalOverlay.querySelector('video');
    if (!video) return;
    
    video.loop = true;
}

function getTypeIconPath(cardType) {
    const typeIcons = {
        'special': 'deck/type_special.png',
        'artifact': 'deck/type_artifact.png',
        'tactic': 'deck/type_tactic.png'
    };
    
    return typeIcons[cardType] || 'deck/type_unknown.png';
}

function setupVideoControls(cardElement) {
    const video = cardElement.querySelector('video');
    if (!video) return;
    
    video.removeAttribute('autoplay');
    video.removeAttribute('loop');
    
    cardElement.addEventListener('mouseenter', () => {
        video.currentTime = 0; 
        video.play().catch(e => {});
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
    
    cardElement.addEventListener('contextmenu', () => {
        video.pause();
        video.currentTime = 0;
    });
}

function setupCardHoverEffects(cardElement) {
    const card = cardElement;
    const description = card.querySelector('.card__description');
    
    card.addEventListener('mouseenter', () => {
        description.style.transform = 'translateY(0)';
        description.style.opacity = '1';
    });
    
    card.addEventListener('mouseleave', () => {
        description.style.transform = 'translateY(100%)';
        description.style.opacity = '0';
    });
    
    card.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        audioManager.playSound('button');
    });
}

function sortDeckCards() {
    currentDeck.cards.sort((a, b) => {
        const rarityOrder = { 'gold': 1, 'silver': 2, 'bronze': 3 };
        const rarityA = rarityOrder[a.rarity] || 4;
        const rarityB = rarityOrder[b.rarity] || 4;
        if (rarityA !== rarityB) {
            return rarityA - rarityB;
        }
        const typeOrder = { 'unit': 1, 'special': 2, 'artifact': 3, 'tactic': 4 };
        const typeA = typeOrder[a.type] || 5;
        const typeB = typeOrder[b.type] || 5;
        if (typeA !== typeB) {
            return typeA - typeB;
        }
        if (a.type === 'unit' && b.type === 'unit') {
            return (b.strength || 0) - (a.strength || 0);
        }
        return a.name.localeCompare(b.name);
    });
}

function addCardToDeck(card) {
    if (currentDeck.cards.length >= 40) {
        showMessage('Максимальный размер колоды - 40 карт');
        return;
    }
    currentDeck.cards.push(card);
    sortDeckCards();
    removeCardFromCollection(card.id);
    updateDeckStats();
    updateDeckDisplay();
    animateCardAddition(card);
    audioManager.playSound('cardAdd');
}

function removeCardFromDeck(card) {
    const index = currentDeck.cards.findIndex(c => c.id === card.id);
    if (index !== -1) {
        currentDeck.cards.splice(index, 1);
        sortDeckCards();
        addCardToCollection(card);
        updateDeckStats();
        updateDeckDisplay();
        animateCardRemoval(card);
        audioManager.playSound('cardRemove');
    }
}

function removeCardFromCollection(cardId) {
    const index = displayedCollectionCards.findIndex(c => c.id === cardId);
    if (index !== -1) {
        displayedCollectionCards.splice(index, 1);
        displayCollectionCards();
    }
}

function addCardToCollection(card) {
    const existingIndex = displayedCollectionCards.findIndex(c => c.id === card.id);
    if (existingIndex === -1) {
        displayedCollectionCards.push(card);
        sortCollectionCards();
        const activeFilter = document.querySelector('.cards-collection .sort-btn.active');
        if (activeFilter) {
            const filterType = activeFilter.dataset.type;
            sortCollection(filterType);
        } else {
            displayCollectionCards();
        }
    }
}

function sortCollectionCards() {
    displayedCollectionCards.sort((a, b) => {
        const rarityOrder = { 'gold': 1, 'silver': 2, 'bronze': 3 };
        const rarityA = rarityOrder[a.rarity] || 4;
        const rarityB = rarityOrder[b.rarity] || 4;
        if (rarityA !== rarityB) {
            return rarityA - rarityB;
        }
        const typeOrder = { 'unit': 1, 'special': 2, 'artifact': 3, 'tactic': 4 };
        const typeA = typeOrder[a.type] || 5;
        const typeB = typeOrder[b.type] || 5;
        if (typeA !== typeB) {
            return typeA - typeB;
        }
        if (a.type === 'unit' && b.type === 'unit') {
            return (b.strength || 0) - (a.strength || 0);
        }
        return a.name.localeCompare(b.name);
    });
}

function animateCardAddition(card) {
    const cardElement = document.querySelector(`[data-card-id="${card.id}"]`);
    if (cardElement) {
        cardElement.style.animation = 'cardAddition 0.5s ease';
        setTimeout(() => {
            cardElement.style.animation = '';
        }, 500);
    }
}

function animateCardRemoval(card) {
    const cardElement = document.querySelector(`[data-card-id="${card.id}"]`);
    if (cardElement) {
        cardElement.style.animation = 'cardAddition 0.5s ease';
         setTimeout(() => {
            cardElement.style.animation = '';
        }, 500);
    }
}

function updateDeckStats() {
    const specialCardsCount = currentDeck.cards.filter(card => 
        card.type === 'special' || card.type === 'tactic' || card.type === 'artifact'
    ).length;
    
    const stats = {
        total: currentDeck.cards.length,
        units: currentDeck.cards.filter(card => card.type === 'unit').length,
        specials: specialCardsCount,
        totalStrength: currentDeck.cards.reduce((sum, card) => sum + (card.strength || 0), 0)
    };
    
    currentDeck.stats = stats;
    
    document.getElementById('totalCards').textContent = stats.total;
    document.getElementById('unitCards').textContent = stats.units;
    document.getElementById('specialCards').textContent = stats.specials;
    document.getElementById('totalStrength').textContent = stats.totalStrength;
}

function updateDeckDisplay() {
    const deckGrid = document.getElementById('deckGrid');
    
    if (currentDeck.cards.length === 0) {
        deckGrid.innerHTML = `
            <div class="empty-deck-message">
                <p>Колода пуста</p>
                <p>Добавьте карты из коллекции</p>
			    <img src="deck/none_cards.png" alt="Пустая колода" class="empty-deck-icon">
            </div>
        `;
    } else {
        const activeFilter = document.querySelector('.deck-cards .sort-btn.active');
        if (activeFilter) {
            const filterType = activeFilter.dataset.type;
            sortDeck(filterType);
        } else {
            sortDeck('all');
        }
    }
}

function setupDeckBuildingEventListeners() {
    const collectionSortButtons = document.querySelectorAll('.cards-collection .sort-btn');
    const deckSortButtons = document.querySelectorAll('.deck-cards .sort-btn');
	
    collectionSortButtons.forEach(btn => {
        if (btn.dataset.type === 'all') {
            btn.classList.add('active');
        }
    });
    
    deckSortButtons.forEach(btn => {
        if (btn.dataset.type === 'all') {
            btn.classList.add('active');
        }
    });
    
    collectionSortButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            audioManager.playSound('button');
            const type = e.currentTarget.dataset.type;
            collectionSortButtons.forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');
            sortCollection(type);
        });
        
        button.addEventListener('mouseenter', () => {
            audioManager.playSound('touch');
        });
    });
    
    deckSortButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            audioManager.playSound('button');
            const type = e.currentTarget.dataset.type;
            deckSortButtons.forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');
            sortDeck(type);
        });
        
        button.addEventListener('mouseenter', () => {
            audioManager.playSound('touch');
        });
    });
    
    const startGameBtn = document.getElementById('startGameBtn');
    startGameBtn.addEventListener('click', () => {
        validateDeckAndStartGame();
    });
    
    startGameBtn.addEventListener('mouseenter', () => {
        audioManager.playSound('touch');
    });

    const backToFactionBtn = document.getElementById('backToFactionBtn');
    backToFactionBtn.addEventListener('click', () => {
        audioManager.playSound('button');
        backToFactionSelection();
    });
    
    backToFactionBtn.addEventListener('mouseenter', () => {
        audioManager.playSound('touch');
    });
    
    const autoBuildBtn = document.getElementById('autoBuildBtn');
    const saveDeckBtn = document.getElementById('saveDeckBtn');
    const loadDeckBtn = document.getElementById('loadDeckBtn');
    const clearDeckBtn = document.getElementById('clearDeckBtn');
    
    autoBuildBtn.addEventListener('click', () => {
        audioManager.playSound('button');
        autoBuildDeck();
    });
    
    saveDeckBtn.addEventListener('click', () => {
        audioManager.playSound('button');
        saveDeckToFile();
    });
    
    loadDeckBtn.addEventListener('click', () => {
        audioManager.playSound('button');
        loadDeckFromFile();
    });
    
    clearDeckBtn.addEventListener('click', () => {
        audioManager.playSound('button');
        clearDeck();
    });
    
    [autoBuildBtn, saveDeckBtn, loadDeckBtn, clearDeckBtn].forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            audioManager.playSound('touch');
        });
    });
}

function backToFactionSelection() {
    const deckBuildingSection = document.querySelector('.deck-building');
    if (deckBuildingSection) {
        deckBuildingSection.style.opacity = '0';
        deckBuildingSection.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            deckBuildingSection.remove();
            
            document.body.style.background = "url('ui/fon.jpg') no-repeat center center fixed";
            document.body.style.backgroundSize = 'cover';
            
            if (window.factionModule && window.factionModule.initFactionSelection) {
                window.factionModule.initFactionSelection();
            }
        }, 800);
    }
}

function autoBuildDeck() {
    const faction = window.selectedFaction;
    if (!faction) return;
    clearDeckSilent();
    const factionCards = window.cardsModule.getFactionCards(faction.id);
    const allCards = [
        ...factionCards.units,
        ...factionCards.specials,
        ...factionCards.artifacts,
        ...factionCards.tactics
    ];
    const uniqueCards = allCards.filter((card, index, self) => 
        index === self.findIndex(c => c.id === card.id)
    );
    const sortedCards = uniqueCards.sort((a, b) => {
        if (a.rarity === 'gold' && b.rarity !== 'gold') return -1;
        if (a.rarity !== 'gold' && b.rarity === 'gold') return 1;
        return (b.strength || 0) - (a.strength || 0);
    });
    let unitsCount = 0;
    let specialsCount = 0;  
    const cardsToAdd = [];
    for (const card of sortedCards) {
        if (cardsToAdd.length >= 40) break;
        if (card.type === 'unit') {
            if (unitsCount >= 32) continue;
            unitsCount++;
        } else {
            if (specialsCount >= 10) continue;
            specialsCount++;
        }
        cardsToAdd.push(card);
    }
    cardsToAdd.forEach(card => {
        currentDeck.cards.push(card);
        removeCardFromCollection(card.id);
    });
    sortDeckCards();
    updateDeckStats();
    updateDeckDisplay();
    displayCollectionCards();
}

function clearDeckSilent() {
    currentDeck.cards.forEach(card => {
        addCardToCollection(card);
    });
    currentDeck.cards = [];
    sortCollectionCards();
    updateDeckStats();
    updateDeckDisplay();
    const activeFilter = document.querySelector('.cards-collection .sort-btn.active');
    if (activeFilter) {
        const filterType = activeFilter.dataset.type;
        sortCollection(filterType);
    } else {
        displayCollectionCards();
    }
}

function saveDeckToFile() {
    if (currentDeck.cards.length === 0) {
        return;
    }
    
    const deckData = {
        faction: currentDeck.faction,
        ability: currentDeck.ability,
        cards: currentDeck.cards.map(card => card.id),
        timestamp: new Date().toISOString(),
        version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(deckData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `gwent_deck_${currentDeck.faction}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function loadDeckFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = event => {
            try {
                const deckData = JSON.parse(event.target.result);
                
                if (deckData.faction !== currentDeck.faction) {
                    showMessage(`Колода предназначена для фракции "${localizeFaction(deckData.faction)}"!`);
                    return;
                }
                
                if (!deckData.version) {
                    showMessage('Неверный формат файла колоды!');
                    return;
                }
                
                clearDeckSilent();
                
                currentDeck.ability = deckData.ability || defaultAbilities[currentDeck.faction];
                
                const factionCards = window.cardsModule.getFactionCards(currentDeck.faction);
                const allCards = [
                    ...factionCards.units,
                    ...factionCards.specials,
                    ...factionCards.artifacts,
                    ...factionCards.tactics
                ];
                
                const cardsToAdd = [];
                
                for (const cardId of deckData.cards) {
                    const card = allCards.find(c => c.id === cardId);
                    if (card && cardsToAdd.length < 40) {
                        cardsToAdd.push(card);
                    }
                }
                
                cardsToAdd.forEach(card => {
                    currentDeck.cards.push(card);
                    removeCardFromCollection(card.id);
                });
                
                updateDeckStats();
                updateDeckDisplay();
                displayCollectionCards();
                updateFactionAbilityDisplay(window.selectedFaction);
                
                showMessage(`Колода загружена! ${currentDeck.cards.length} карт.`);
                
            } catch (error) {
                showMessage('Неверный формат файла колоды!');
            }
        };
        reader.readAsText(file);
		setFactionHeadersBackground(currentDeck.faction);
    };
    
    input.click();
}

function clearDeck() {
    if (currentDeck.cards.length === 0) {
        return;
    }
    currentDeck.cards.forEach(card => {
        addCardToCollection(card);
    });
    currentDeck.cards = [];
    sortCollectionCards();
    
    updateDeckStats();
    updateDeckDisplay();
    const activeFilter = document.querySelector('.cards-collection .sort-btn.active');
    if (activeFilter) {
        const filterType = activeFilter.dataset.type;
        sortCollection(filterType);
    } else {
        displayCollectionCards();
    }
}

function validateDeckAndStartGame() {
    const totalCards = currentDeck.cards.length;
    const unitCardsCount = currentDeck.cards.filter(card => card.type === 'unit').length;
    const specialCardsCount = currentDeck.cards.filter(card => 
        card.type === 'special' || card.type === 'tactic' || card.type === 'artifact'
    ).length;
    
    const errors = [];
    
    if (totalCards < 15) {
        errors.push(`Минимальный размер колоды - 15 карт`);
    }
    
    if (totalCards > 25) {
        errors.push(`Максимальный размер колоды - 25 карт`);
    }
    
    if (unitCardsCount < 10) {
        errors.push(`Минимальное количество карт отрядов - 10`);
    }
    
    if (specialCardsCount < 3) {
        errors.push(`Обязательное количество специальных карт - 3`);
    }
    
    if (specialCardsCount > 5) {
        errors.push(`Максимальное количество специальных карт - 5`);
    }
    
    if (errors.length > 0) {
        showMessage(errors.join('\n\n'));
        return;
    }
    
    audioManager.playSound('button');
    startGame();
}

function showMessage(text) {
    const overlay = document.createElement('div');
    overlay.className = 'message-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(2px);
    `;
    
    const messageBox = document.createElement('div');
    messageBox.className = 'message-box';
    messageBox.style.cssText = `
        background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
        border: 3px solid #d4af37;
        border-radius: 15px;
        padding: 30px;
        color: #fff;
        text-align: center;
        max-width: 500px;
        width: 80%;
        box-shadow: 0 0 30px rgba(212, 175, 55, 0.2);
        position: relative;
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'ВНИМАНИЕ';
    title.style.cssText = `
        color: #d4af37;
        margin: 0 0 15px 0;
        font-size: 24px;
        text-transform: uppercase;
        letter-spacing: 2px;
        text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
    `;
    
    const messageText = document.createElement('div');
    messageText.innerHTML = text.replace(/\n\n/g, '<br><br>');
    messageText.style.cssText = `
        font-size: 16px;
        line-height: 1.5;
        margin-bottom: 20px;
        color: #ccc;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'ОК';
    closeButton.style.cssText = `
        background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
        color: #d4af37;
        border: 2px solid #d4af37;
        border-radius: 5px;
        padding: 10px 20px;
        cursor: url('ui/cursor_hover.png'), pointer;
        font-family: 'Gwent', sans-serif;
        text-transform: uppercase;
        letter-spacing: 2px;
        transition: all 0.3s ease;
    `;
    
    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.transform = 'translateY(-2px)';
        closeButton.style.boxShadow = '0 5px 15px rgba(212, 175, 55, 0.3)';
        closeButton.style.background = 'linear-gradient(145deg, #3a3a3a, #2a2a2a)';
        closeButton.style.color = '#ffd700';
        audioManager.playSound('touch');
    });
    
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.transform = 'translateY(0)';
        closeButton.style.boxShadow = 'none';
        closeButton.style.background = 'linear-gradient(145deg, #2a2a2a, #1a1a1a)';
        closeButton.style.color = '#d4af37';
    });
    
    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        audioManager.playSound('button');
    });
    
    messageBox.appendChild(title);
    messageBox.appendChild(messageText);
    messageBox.appendChild(closeButton);
    overlay.appendChild(messageBox);
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        messageBox.style.transform = 'scale(1)';
        messageBox.style.opacity = '1';
    }, 10);
    
    audioManager.playSound('button');
    
    setTimeout(() => {
        if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
        }
    }, 5000);
}

function sortCollection(type) {
    const collectionGrid = document.getElementById('collectionGrid');
    let sortedCards = [];
    
    switch (type) {
        case 'units':
            sortedCards = displayedCollectionCards.filter(card => card.type === 'unit');
            break;
        case 'specials':
            sortedCards = displayedCollectionCards.filter(card => card.type === 'special');
            break;
        case 'artifacts':
            sortedCards = displayedCollectionCards.filter(card => card.type === 'artifact');
            break;
        case 'tactics':
            sortedCards = displayedCollectionCards.filter(card => card.type === 'tactic');
            break;
        case 'all':
        default:
            sortedCards = [...displayedCollectionCards];
            break;
    }
    
    collectionGrid.innerHTML = '';
    
    if (sortedCards.length === 0) {
        collectionGrid.innerHTML = `
            <div class="empty-category-message">
                <p>Нет карт данной категории</p>
			    <img src="deck/none_cards.png" alt="Пустая колода" class="empty-deck-icon">
            </div>
        `;
    } else {
        sortedCards.forEach(card => {
            const cardElement = createCardElement(card, 'collection');
            collectionGrid.appendChild(cardElement);
        });
    }
}

function sortDeck(type) {
    const deckGrid = document.getElementById('deckGrid');
    
    if (currentDeck.cards.length === 0) {
        return;
    }
    
    let sortedCards = [];
    
    switch (type) {
        case 'units':
            sortedCards = currentDeck.cards.filter(card => card.type === 'unit');
            break;
        case 'specials':
            sortedCards = currentDeck.cards.filter(card => card.type === 'special');
            break;
        case 'artifacts':
            sortedCards = currentDeck.cards.filter(card => card.type === 'artifact');
            break;
        case 'tactics':
            sortedCards = currentDeck.cards.filter(card => card.type === 'tactic');
            break;
        case 'all':
        default:
            sortedCards = [...currentDeck.cards];
            break;
    }
    
    deckGrid.innerHTML = '';
    
    if (sortedCards.length === 0) {
        deckGrid.innerHTML = `
            <div class="empty-category-message">
                <p>Нет карт данной категории в колоде</p>
			    <img src="deck/none_cards.png" alt="Пустая колода" class="empty-deck-icon">
            </div>
        `;
    } else {
        sortedCards.forEach(card => {
            const cardElement = createCardElement(card, 'deck');
            deckGrid.appendChild(cardElement);
        });
    }
}

function startGame() {
    if (window.boardModule && window.boardModule.initGameBoard) {
        const deckBuildingSection = document.querySelector('.deck-building');
        if (deckBuildingSection) {
            deckBuildingSection.style.opacity = '0';
            deckBuildingSection.style.transform = 'translateY(50px)';
            
            setTimeout(() => {
                window.boardModule.initGameBoard();
            }, 800);
        }
    } else {
        showMessage('Ошибка загрузки игрового модуля');
    }
}

window.deckModule = {
    initDeckBuilding,
    currentDeck,
    addCardToDeck,
    removeCardFromDeck,
    autoBuildDeck,
    saveDeckToFile,
    loadDeckFromFile,
    clearDeck,
    clearDeckSilent,
    backToFactionSelection,
    setFactionHeadersBackground
};