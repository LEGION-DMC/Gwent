const factionAbilities = {
    scoiatael: [
        {
            id: 'scoiatael_ability_1',
            name: 'Махакамская кузня',
            description: 'Усильте всех Краснолюдов на поле 3 еденицы',
            icon: 'faction/scoiatael/abilities/forge.png'
        },
        {
            id: 'scoiatael_ability_2', 
            name: 'Засада ловчих',
            description: 'Призывите из колоды в руку карту Эльфа',
            icon: 'faction/scoiatael/abilities/ambush.png'
        },
        {
            id: 'scoiatael_ability_3', 
            name: 'Точный удар',
            description: 'Нанесите 5 едениц урона отряду противника',
            icon: 'faction/scoiatael/abilities/accuracy.png'
        },
        {
            id: 'scoiatael_ability_4', 
            name: 'Дар природы',
            description: 'Усильте 3 отряда на поле на 2 еденицы',
            icon: 'faction/scoiatael/abilities/gift.png'
        },
        {
            id: 'scoiatael_ability_5', 
            name: 'Партизанская тактика',
            description: 'Нанесите 3 еденицы урона всем картам в ряду противника',
            icon: 'faction/scoiatael/abilities/tactic.png'
        },
    ],
    realms: [
        {
            id: 'realms_ability_1',
            name: 'Королевское вдохновение',
            description: 'Усильте дружественный отряд на 5 едениц',
            icon: 'faction/realms/abilities/king.png'
        },
        {
            id: 'realms_ability_2',
            name: 'Ополчение',
            description: 'Нанесите 3 еденицы урона 2-м отрядам противника',
            icon: 'faction/realms/abilities/militia.png'
        },
        {
            id: 'realms_ability_3',
            name: 'Стена щитов',
            description: 'Усильте дружественный отряд на 2 еденицы и призвать в руку артефакт',
            icon: 'faction/realms/abilities/shield.png'
        },
        {
            id: 'realms_ability_4',
            name: 'Побуждение к действию',
            description: 'Усильте дружественный отряд на поле на 3 еденицы',
            icon: 'faction/realms/abilities/incitement.png'
        },
        {
            id: 'realms_ability_5',
            name: 'Мобилизация',
            description: 'Призовите бронзовый отряд на поле и усильте его и смежные с ним отряды на 3 еденицы',
            icon: 'faction/realms/abilities/mobilization.png'
        }
    ],
    nilfgaard: [
        {
            id: 'nilfgaard_ability_1',
            name: 'Имперское построение',
            description: 'Усильте 2 дружественных отряда на 1 еденицу и поменяйте их местами (только в пределах одного ряда)',
            icon: 'faction/nilfgaard/abilities/construction.png'
        },
        {
            id: 'nilfgaard_ability_2',
            name: 'Заточение',
            description: 'Нанесите вражескому отряду 3 еденицы урона',
            icon: 'faction/nilfgaard/abilities/block.png'
        },
        {
            id: 'nilfgaard_ability_3',
            name: 'Порабощение',
            description: 'Уничтожте вражеский отряд с силой 5 или меньше',
            icon: 'faction/nilfgaard/abilities/capture.png'
        },
        {
            id: 'nilfgaard_ability_4',
            name: 'Туссентское гостеприимство',
            description: 'Усильте случайный дружественный отряд на 5 едениц',
            icon: 'faction/nilfgaard/abilities/tusent.png'
        },
        {
            id: 'nilfgaard_ability_5',
            name: 'Двойная игра',
            description: 'Вслепую сыграйте карту из руки противника',
            icon: 'faction/nilfgaard/abilities/twoface.png'
        }
    ],
    monsters: [
        {
            id: 'monsters_ability_1',
            name: 'Белый Хлад',
            description: 'Создайте эффект мороза только в ряду противника',
            icon: 'faction/monsters/abilities/cold.png'
        },
        {
            id: 'monsters_ability_2',
            name: 'Неутолимый голод',
            description: 'Уничтожьте дружественный отряд, затем призовите Волколака, усиленного на значение силы уничтоженого отряда, из колоды на поле в этом же ряду',
            icon: 'faction/monsters/abilities/hangry.png'
        },
        {
            id: 'monsters_ability_3',
            name: 'Запах крови',
            description: 'Нанесите 2 ед. урона по вражескому ряду с наибольшим количеством карт',
            icon: 'faction/monsters/abilities/blood.png'
        },
        {
            id: 'monsters_ability_4',
            name: 'Сила природы',
            description: 'Призовите мугущественого "Духа Леса"',
            icon: 'faction/monsters/abilities/forest.png'
        },
        {
            id: 'monsters_ability_5',
            name: 'Панцирь',
            description: 'Усильте дружественный отряд на 3 ед. Если это не нейтральный отряд',
            icon: 'faction/monsters/abilities/sheild.png'
        }
    ],
    skellige: [
        {
            id: 'skellige_ability_1',
            name: 'Безрассудная ярость',
            description: 'Случайным образом распределите 4 ед. урона между всеми вражескими отрядами',
            icon: 'faction/skellige/abilities/rage.png'
        },
        {
            id: 'skellige_ability_2',
            name: 'Гнев моря',
            description: 'Создайте эффект дождя только в ряду противника',
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
            description: 'Нанесите 1 ед. урона дружественному отряду. И призовите Берсерка',
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
			name: 'Заказ на убийство',
			description: 'Нанесите 6 ед. урона вражескому отряду',
			icon: 'faction/syndicate/abilities/order.png'
		},
		{
			id: 'syndicate_ability_2',
			name: 'Резня',
			description: 'Нанесите от 1 до 3 ед. урона всем картам в ряду противника',
			icon: 'faction/syndicate/abilities/carnage.png'
		},
		{
			id: 'syndicate_ability_3',
			name: 'Пиратская бухта',
			description: 'Призовите из колоды в руку 2 карты с тегом "Пират"',
			icon: 'faction/syndicate/abilities/pirates.png'
		},
		{
			id: 'syndicate_ability_4',
			name: 'Священное братство',
			description: 'Усильте 2 случайных дружественных отряда на 2 ед.',
			icon: 'faction/syndicate/abilities/brother.png'
		},
		{
			id: 'syndicate_ability_5',
			name: 'Кровавые деньги',
			description: 'Уничтожьте вражеский отряд с силой 4 или меньше',
			icon: 'faction/syndicate/abilities/money.png'
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

let currentDeck = {
    faction: null,
    leader: null,
    ability: null, 
    cards: [],
    stats: {
        total: 0,
        units: 0,
        specials: 0,
        heroes: 0,
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
let lastCollectionFilter = 'all';
let lastDeckFilter = 'all';
let factionSortEnabled = false;
let deckFactionSortEnabled = false;

function initDeckBuilding(faction) {
    window.selectedFaction = faction;
    currentDeck.faction = faction.id;
    
    const savedDeck = localStorage.getItem(`gwent_deck_${faction.id}`);
    
    if (savedDeck) {
        try {
            const deckData = JSON.parse(savedDeck);
            if (deckData.faction === faction.id) {
                currentDeck.faction = deckData.faction;
                currentDeck.ability = deckData.ability || defaultAbilities[faction.id];
                currentDeck.cards = [];
                
                const availableCardsForFaction = window.cardsModule.getCardsForDeckBuilding 
                    ? window.cardsModule.getCardsForDeckBuilding(faction.id)
                    : { units: [], specials: [], artifacts: [], tactics: [] };
                
                const allCards = [
                    ...availableCardsForFaction.units,
                    ...availableCardsForFaction.specials,
                    ...availableCardsForFaction.artifacts,
                    ...availableCardsForFaction.tactics
                ];
                
                deckData.cards.forEach(cardId => {
                    const card = allCards.find(c => c.id === cardId);
                    if (card && !card.hidden) {
                        currentDeck.cards.push(card);
                    }
                });
            } else {
                currentDeck.faction = faction.id;
                currentDeck.ability = defaultAbilities[faction.id];
                currentDeck.cards = [];
            }
        } catch (e) {
            currentDeck.faction = faction.id;
            currentDeck.ability = defaultAbilities[faction.id];
            currentDeck.cards = [];
        }
    } else {
        currentDeck.faction = faction.id;
        currentDeck.ability = defaultAbilities[faction.id];
        currentDeck.cards = [];
    }
    
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
								<img src="deck/all.png" alt="Все карты" title="">
							</button>
							<button class="sort-btn" data-type="units">
								<img src="deck/unit.png" alt="Отряды" title="">
							</button>
							<button class="sort-btn" data-type="specials">
								<img src="deck/special.png" alt="Спец. карты" title="">
							</button>
							<button class="sort-btn" data-type="tactics">
								<img src="deck/tactic.png" alt="Тактика" title="">
							</button>
							<button class="sort-btn" data-type="artifacts">
								<img src="deck/artifact.png" alt="Артефакты" title="">
							</button>
							<button class="sort-btn faction-sort-btn" data-type="faction">
								<img src="faction/${faction.id}/sort.png" alt="Только карты фракции" title="">
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
					<div class="card__type-icon_leader"><img class="card__type-icon_leader" src="deck/type_leader.png" alt="Лидер"></div>
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
                            <img src="deck/stats_count.png" alt="">
                            <span class="stat-value" id="totalCards">0</span>
                        </div>
                    </div>
                    <div class="stat-group">
                        <span class="stat-label">Карт отрядов</span>
                        <div class="stat-item">
                            <img src="deck/stats_unit.png" alt="">
                            <span class="stat-value" id="unitCards">0</span>
                        </div>
                    </div>
                    <div class="stat-group">
                        <span class="stat-label">Специальных карт</span>
                        <div class="stat-item">
                            <img src="deck/stats_special.png" alt="">
                            <span class="stat-value" id="specialCards">0</span>
                        </div>
                    </div>
					<div class="stat-group">
						<span class="stat-label">Карт героев</span>
						<div class="stat-item">
							<img src="deck/stats_hero.png" alt="">
							<span class="stat-value" id="heroCards">0</span>
						</div>
					</div>
                    <div class="stat-group">
                        <span class="stat-label">Общая сила колоды</span>
                        <div class="stat-item">
                            <img src="deck/stats_strength.png" alt="">
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
								<img src="deck/all.png" alt="Все карты" title="">
							</button>
							<button class="sort-btn" data-type="units">
								<img src="deck/unit.png" alt="Отряды" title="">
							</button>
							<button class="sort-btn" data-type="specials">
								<img src="deck/special.png" alt="Спец. карты" title="">
							</button>
							<button class="sort-btn" data-type="tactics">
								<img src="deck/tactic.png" alt="Тактика" title="">
							</button>
							<button class="sort-btn" data-type="artifacts">
								<img src="deck/artifact.png" alt="Артефакты" title="">
							</button>
							<button class="sort-btn deck-faction-sort-btn" data-type="faction">
								<img src="faction/${faction.id}/sort.png" alt="Только карты фракции" title="">
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
					<button class="deck-control-btn auto-build-btn" id="autoBuildBtn" title="">
						<img src="deck/auto_build.png" alt="A">
						<span>АВТОСБОР</span>
					</button>
					<button class="deck-control-btn save-deck-btn" id="saveDeckBtn" title="">
						<img src="deck/auto_build.png" alt="S">
						<span>СОХРАНИТЬ</span>
					</button>
					<button class="deck-control-btn load-deck-btn" id="loadDeckBtn" title="">
						<img src="deck/auto_build.png" alt="D">
						<span>ЗАГРУЗИТЬ</span>
					</button>
					<button class="deck-control-btn clear-deck-btn" id="clearDeckBtn" title="">
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
    }, 1000);
    
    setupLeaderVideoControls();
    setupDeckBuildingEventListeners();
}             

function setupDeckBuildingEventListeners() {
    const collectionSortButtons = document.querySelectorAll('.cards-collection .sort-btn');
    const deckSortButtons = document.querySelectorAll('.deck-cards .sort-btn');
    
    collectionSortButtons.forEach(btn => {
        if (btn.dataset.type === 'all') {
            btn.classList.add('active');
            btn.classList.remove('inactive');
        } else if (btn.dataset.type !== 'faction') {
            btn.classList.add('inactive');
            btn.classList.remove('active');
        }
    });
    
    deckSortButtons.forEach(btn => {
        if (btn.dataset.type === 'all') {
            btn.classList.add('active');
            btn.classList.remove('inactive');
        } else if (btn.dataset.type !== 'faction') {
            btn.classList.add('inactive');
            btn.classList.remove('active');
        }
    });
    
    collectionSortButtons.forEach(button => {
        // Пропускаем кнопку фракции
        if (button.dataset.type === 'faction') return;
        
        button.addEventListener('click', (e) => {
            audioManager.playSound('button');
            const type = e.currentTarget.dataset.type;
            
            collectionSortButtons.forEach(btn => {
                if (btn.dataset.type !== 'faction' && btn.dataset.type !== 'all') {
                    btn.classList.remove('active');
                    btn.classList.add('inactive');
                }
            });
            
            e.currentTarget.classList.remove('inactive');
            e.currentTarget.classList.add('active');
            
            const allButton = Array.from(collectionSortButtons).find(btn => btn.dataset.type === 'all');
            if (allButton && type !== 'all') {
                allButton.classList.remove('active');
                allButton.classList.add('inactive');
            }
            
            if (type === 'all') {
                collectionSortButtons.forEach(btn => {
                    if (btn.dataset.type !== 'faction') {
                        btn.classList.remove('active');
                        btn.classList.add('inactive');
                    }
                });
                e.currentTarget.classList.remove('inactive');
                e.currentTarget.classList.add('active');
            }
            
            sortCollectionWithFactionFilter(type);
        });
        
        button.addEventListener('mouseenter', () => {
            audioManager.playSound('touch');
        });
    });
    
    deckSortButtons.forEach(button => {
        if (button.dataset.type === 'faction') return;
        
        button.addEventListener('click', (e) => {
            audioManager.playSound('button');
            const type = e.currentTarget.dataset.type;
            
            deckSortButtons.forEach(btn => {
                if (btn.dataset.type !== 'faction' && btn.dataset.type !== 'all') {
                    btn.classList.remove('active');
                    btn.classList.add('inactive');
                }
            });
            
            e.currentTarget.classList.remove('inactive');
            e.currentTarget.classList.add('active');
            
            const allButton = Array.from(deckSortButtons).find(btn => btn.dataset.type === 'all');
            if (allButton && type !== 'all') {
                allButton.classList.remove('active');
                allButton.classList.add('inactive');
            }
            
            if (type === 'all') {
                deckSortButtons.forEach(btn => {
                    if (btn.dataset.type !== 'faction') {
                        btn.classList.remove('active');
                        btn.classList.add('inactive');
                    }
                });
                e.currentTarget.classList.remove('inactive');
                e.currentTarget.classList.add('active');
            }
            
            sortDeckWithFactionFilter(type);
        });
        
        button.addEventListener('mouseenter', () => {
            audioManager.playSound('touch');
        });
    });
    
    const factionSortBtn = document.querySelector('.cards-collection .faction-sort-btn');
    if (factionSortBtn) {
        if (!factionSortEnabled) {
            factionSortBtn.classList.add('inactive');
            factionSortBtn.classList.remove('active');
        } else {
            factionSortBtn.classList.remove('inactive');
            factionSortBtn.classList.add('active');
        }
        
        factionSortBtn.addEventListener('click', (e) => {
            audioManager.playSound('button');
            factionSortEnabled = !factionSortEnabled;
            
            if (factionSortEnabled) {
                factionSortBtn.classList.remove('inactive');
                factionSortBtn.classList.add('active');
            } else {
                factionSortBtn.classList.remove('active');
                factionSortBtn.classList.add('inactive');
            }
            
            const activeFilter = document.querySelector('.cards-collection .sort-btn.active:not(.faction-sort-btn)');
            const filterType = activeFilter ? activeFilter.dataset.type : 'all';
            sortCollectionWithFactionFilter(filterType);
        });
        
        factionSortBtn.addEventListener('mouseenter', () => {
            audioManager.playSound('touch');
        });
    }
    
    const deckFactionSortBtn = document.querySelector('.deck-cards .deck-faction-sort-btn');
    if (deckFactionSortBtn) {
        if (!deckFactionSortEnabled) {
            deckFactionSortBtn.classList.add('inactive');
            deckFactionSortBtn.classList.remove('active');
        } else {
            deckFactionSortBtn.classList.remove('inactive');
            deckFactionSortBtn.classList.add('active');
        }
        
        deckFactionSortBtn.addEventListener('click', (e) => {
            audioManager.playSound('button');
            deckFactionSortEnabled = !deckFactionSortEnabled;
            
            if (deckFactionSortEnabled) {
                deckFactionSortBtn.classList.remove('inactive');
                deckFactionSortBtn.classList.add('active');
            } else {
                deckFactionSortBtn.classList.remove('active');
                deckFactionSortBtn.classList.add('inactive');
            }
            
            const activeFilter = document.querySelector('.deck-cards .sort-btn.active:not(.deck-faction-sort-btn)');
            const filterType = activeFilter ? activeFilter.dataset.type : 'all';
            sortDeckWithFactionFilter(filterType);
        });
        
        deckFactionSortBtn.addEventListener('mouseenter', () => {
            audioManager.playSound('touch');
        });
    }
    
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
    factionSortEnabled = false;
    deckFactionSortEnabled = false;
    
    const deckBuildingSection = document.querySelector('.deck-building');
    if (deckBuildingSection) {
        deckBuildingSection.style.opacity = '0';
        deckBuildingSection.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            deckBuildingSection.remove();
            
            currentDeck.faction = null;
            currentDeck.leader = null;
            currentDeck.ability = null;
            currentDeck.cards = [];
            currentDeck.stats = {
                total: 0,
                units: 0,
                specials: 0,
                totalStrength: 0
            };
            
            displayedCollectionCards = [];
            document.body.style.background = "url('ui/fon.jpg') no-repeat center center fixed";
            document.body.style.backgroundSize = 'cover';
            
            window.selectedFaction = null;
            
            if (window.factionModule && window.factionModule.initFactionSelection) {
                window.factionModule.initFactionSelection();
            }
        }, 800);
    }
}

function loadFactionCards(faction) {
    displayedCollectionCards = [];
    if (window.cardsModule && window.cardsModule.getCardsForDeckBuilding) {
        // Используем функцию, которая исключает скрытые карты
        availableCards = window.cardsModule.getCardsForDeckBuilding(faction.id);
        displayedCollectionCards = [
            ...availableCards.units,
            ...availableCards.specials,
            ...availableCards.artifacts,
            ...availableCards.tactics 
        ];
        sortCollectionCards();
    } else if (window.cardsModule && window.cardsModule.getFactionCards) {
        // Fallback
        availableCards = window.cardsModule.getFactionCards(faction.id);
        displayedCollectionCards = [
            ...availableCards.units,
            ...availableCards.specials,
            ...availableCards.artifacts,
            ...availableCards.tactics 
        ];
        displayedCollectionCards = displayedCollectionCards.filter(card => !card.hidden);
        sortCollectionCards();
    }
    setTimeout(() => {
        displayCollectionCards();
    }, 10);
}

function displayCollectionCards() {
    const collectionGrid = document.getElementById('collectionGrid');
    const activeFilter = document.querySelector('.cards-collection .sort-btn.active:not(.faction-sort-btn)');
    let filterType = 'all';
    
    if (activeFilter) {
        filterType = activeFilter.dataset.type;
    }
    
    sortCollectionWithFactionFilter(filterType);
}

function sortCollectionCards() {
    displayedCollectionCards.sort((a, b) => {
        const typeOrder = { 
            'unit': 1, 
            'special': 2, 
            'artifact': 3, 
            'tactic': 4 
        };
        
        const typeA = typeOrder[a.type] || 5;
        const typeB = typeOrder[b.type] || 5;
        
        if (typeA !== typeB) {
            return typeA - typeB;
        }
        
        const rarityOrder = { 
            'gold': 1, 
            'silver': 2, 
            'bronze': 3 
        };
        const rarityA = rarityOrder[a.rarity] || 4;
        const rarityB = rarityOrder[b.rarity] || 4;
        
        if (rarityA !== rarityB) {
            return rarityA - rarityB;
        }
        if (a.type === 'unit' && b.type === 'unit') {
            const strengthDiff = (b.strength || 0) - (a.strength || 0);
            if (strengthDiff !== 0) {
                return strengthDiff;
            }
        }
        if (a.faction !== b.faction) {
            if (a.faction === window.selectedFaction?.id && b.faction === 'neutral') {
                return -1;
            }
            if (a.faction === 'neutral' && b.faction === window.selectedFaction?.id) {
                return 1;
            }
        }
        
        return a.name.localeCompare(b.name);
    });
}

function createCardElement(card, context) {
    const cardElement = document.createElement('div');
    cardElement.className = `card ${card.type} ${card.rarity} ${context}-card`;
    cardElement.dataset.cardId = card.id;
    cardElement.dataset.cardType = card.type;
    cardElement.dataset.cardPosition = card.position || 'any';
    
    if (card.copy) {
        cardElement.dataset.cardCopy = card.copy;
    }
    
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
        </div>
    `;
    
    if (context === 'collection') {
        updateCardCopyIndicator(cardElement, card);
    }
    
    cardElement.addEventListener('click', (event) => {
        handleCardClick(card, context, event);
    });
    
    cardElement.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        handleCardClick(card, context, event);
    });
    
    if (isVideo && cardDisplayMode === 'animated') {
        setupVideoControls(cardElement);
    }
    
    return cardElement;
}

function sortDeckCards() {
    currentDeck.cards.sort((a, b) => {
        const typeOrder = { 
            'unit': 1, 
            'special': 2, 
            'artifact': 3, 
            'tactic': 4 
        };
        
        const typeA = typeOrder[a.type] || 5;
        const typeB = typeOrder[b.type] || 5;
        
        if (typeA !== typeB) {
            return typeA - typeB;
        }
        
        const rarityOrder = { 
            'gold': 1, 
            'silver': 2, 
            'bronze': 3 
        };
        const rarityA = rarityOrder[a.rarity] || 4;
        const rarityB = rarityOrder[b.rarity] || 4;
        
        if (rarityA !== rarityB) {
            return rarityA - rarityB;
        }
        if (a.type === 'unit' && b.type === 'unit') {
            const strengthDiff = (b.strength || 0) - (a.strength || 0);
            if (strengthDiff !== 0) {
                return strengthDiff;
            }
        }
        if (a.faction !== b.faction) {
            if (a.faction === window.selectedFaction?.id && b.faction === 'neutral') {
                return -1;
            }
            if (a.faction === 'neutral' && b.faction === window.selectedFaction?.id) {
                return 1;
            }
        }
        
        return a.name.localeCompare(b.name);
    });
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
    }, 100);
    
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
			<div class="tags-container ${card.tags.length > 6 ? 'tags-container-3col' : 'tags-container-2col'}">
				${localizeTags(card.tags).map(tag => `
					<div class="card-tag">${tag}</div>
				`).join('')}
			</div>
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

function addCardToDeck(card) {
    if (card.hidden) {
        showMessage('Эту карту нельзя добавить в колоду');
        return;
    }
    
    if (currentDeck.cards.length >= 40) {
        showMessage('Максимальный размер колоды - 40 карт');
        return;
    }
    
    if (card.copy && card.copy > 1) {
        const availableCopies = getAvailableCopies(card);
        if (availableCopies <= 0) {
            showMessage('Все доступные копии этой карты уже добавлены в колоду');
            return;
        }
        
        const copiesInDeck = getCardCopyCountInDeck(card.id);
        if (copiesInDeck >= card.copy) {
            showMessage(`Максимальное количество копий этой карты (${card.copy}) уже в колоде`);
            return;
        }
    } else {
        const alreadyInDeck = currentDeck.cards.some(c => c.id === card.id);
        if (alreadyInDeck) {
            showMessage('Эта карта уже добавлена в колоду');
            return;
        }
    }
    
    currentDeck.cards.push({...card});
    sortDeckCards();
    
    if (card.copy && card.copy > 1) {
        updateCollectionCardDisplay(card.id);
    } else {
        removeCardFromCollectionCompletely(card.id);
    }
    
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

function clearDeck() {
    if (currentDeck.cards.length === 0) {
        return;
    }
    
    const cardsToClear = [...currentDeck.cards];
    
    const deckCards = document.querySelectorAll('.deck-card');
    deckCards.forEach((cardElement, index) => {
        cardElement.style.animation = `cardRemoval 0.2s ease ${index * 0.02}s both`;
    });
    
    setTimeout(() => {
        currentDeck.cards.forEach(card => {
            addCardToCollection(card);
        });
        currentDeck.cards = [];
        sortCollectionCards();
        updateDeckStats();
        updateDeckDisplay();
        
        loadFactionCards(window.selectedFaction);
        
        setTimeout(() => {
            const collectionGrid = document.getElementById('collectionGrid');
            if (collectionGrid) {
                const collectionCards = collectionGrid.querySelectorAll('.collection-card');
                collectionCards.forEach((cardElement, index) => {
                    const cardId = cardElement.dataset.cardId;
                    const wasInDeck = cardsToClear.some(card => card.id === cardId);
                    
                    if (wasInDeck) {
                        cardElement.style.animation = `cardAddition 0.3s ease ${index * 0.02}s both`;
                    }
                });
            }
        }, 10);
        
    }, deckCards.length * 10);
}

function clearDeckSilent() {
    currentDeck.cards.forEach(card => {
        addCardToCollection(card);
    });
    currentDeck.cards = [];
    sortCollectionCards();
    updateDeckStats();
    updateDeckDisplay();
    displayCollectionCards();
}

function autoBuildDeck() {
    const faction = window.selectedFaction;
    if (!faction) return;
    
    audioManager.playSound('button');
    
    const collectionGrid = document.getElementById('collectionGrid');
    if (!collectionGrid) return;
    
    clearDeckSilent();
    
    // Используем функцию для сборки колоды (исключает скрытые карты)
    let allCards = [];
    if (window.cardsModule?.getCardsForDeckBuilding) {
        const deckCards = window.cardsModule.getCardsForDeckBuilding(faction.id);
        allCards = [
            ...deckCards.units,
            ...deckCards.specials,
            ...deckCards.artifacts,
            ...deckCards.tactics
        ];
    } else {
        const factionCards = window.cardsModule.getFactionCards(faction.id);
        allCards = [
            ...factionCards.units,
            ...factionCards.specials,
            ...factionCards.artifacts,
            ...factionCards.tactics
        ].filter(card => !card.hidden);
    }
    
    if (allCards.length === 0) {
        showMessage('Нет доступных карт для этой фракции');
        return;
    }
    
    const MIN_TOTAL_CARDS = 25;
    const MAX_TOTAL_CARDS = 40;
    const MIN_UNIT_CARDS = 15;
    const MIN_SPECIAL_CARDS = 5;
    const MAX_SPECIAL_CARDS = 10;
    
    const unitCards = allCards.filter(card => card.type === 'unit');
    const specialCards = allCards.filter(card => card.type === 'special');
    const artifactCards = allCards.filter(card => card.type === 'artifact');
    const tacticCards = allCards.filter(card => card.type === 'tactic');
    
    const allSpecialCards = [...specialCards, ...artifactCards, ...tacticCards];
    
    if (unitCards.length < MIN_UNIT_CARDS) {
        showMessage(`Недостаточно карт отрядов для фракции ${faction.name}. Требуется минимум ${MIN_UNIT_CARDS}, доступно: ${unitCards.length}`);
        return;
    }
    
    if (allSpecialCards.length < MIN_SPECIAL_CARDS) {
        showMessage(`Недостаточно специальных карт для фракции ${faction.name}. Требуется минимум ${MIN_SPECIAL_CARDS}, доступно: ${allSpecialCards.length}`);
        return;
    }
    
    const collectionCards = collectionGrid.querySelectorAll('.collection-card');
    collectionCards.forEach((cardElement, index) => {
        cardElement.style.animation = `cardRemoval 0.2s ease ${index * 0.02}s both`;
    });
    
    setTimeout(() => {
        displayedCollectionCards = [];
        collectionGrid.innerHTML = '';
        
        function selectRandomCards(cardPool, count) {
            const selected = [];
            const availableCards = [...cardPool];
            const usedCardIds = new Set();
            
            while (selected.length < count && availableCards.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableCards.length);
                const card = availableCards[randomIndex];
                
                if (card.copy && card.copy > 1) {
                    const copiesAlreadySelected = selected.filter(c => c.id === card.id).length;
                    if (copiesAlreadySelected < card.copy) {
                        selected.push(card);
                        if (copiesAlreadySelected + 1 >= card.copy) {
                            availableCards.splice(randomIndex, 1);
                        }
                    } else {
                        availableCards.splice(randomIndex, 1);
                    }
                } else {
                    if (!usedCardIds.has(card.id)) {
                        selected.push(card);
                        usedCardIds.add(card.id);
                        availableCards.splice(randomIndex, 1);
                    } else {
                        availableCards.splice(randomIndex, 1);
                    }
                }
            }
            
            return selected;
        }
        
        const specialCount = Math.min(
            MAX_SPECIAL_CARDS,
            Math.max(MIN_SPECIAL_CARDS, Math.floor(Math.random() * 3) + MIN_SPECIAL_CARDS)
        );
        const selectedSpecialCards = selectRandomCards(allSpecialCards, specialCount);
        
        const remainingSlots = MAX_TOTAL_CARDS - specialCount;
        const minUnitCount = Math.max(MIN_UNIT_CARDS, MIN_TOTAL_CARDS - specialCount);
        const maxUnitCount = Math.min(22, remainingSlots); 
        const unitCount = Math.min(
            maxUnitCount,
            Math.max(minUnitCount, Math.floor(Math.random() * (maxUnitCount - minUnitCount + 1)) + minUnitCount)
        );
        const selectedUnitCards = selectRandomCards(unitCards, unitCount);
        
        const allSelectedCards = [...selectedUnitCards, ...selectedSpecialCards];
        
        if (allSelectedCards.length < MIN_TOTAL_CARDS) {
            const neededCards = MIN_TOTAL_CARDS - allSelectedCards.length;
            const additionalUnits = selectRandomCards(
                unitCards.filter(card => !allSelectedCards.some(selected => selected.id === card.id)),
                neededCards
            );
            allSelectedCards.push(...additionalUnits);
        }
        
        const finalSelectedCards = allSelectedCards.slice(0, MAX_TOTAL_CARDS);
        
        finalSelectedCards.forEach(card => {
            currentDeck.cards.push(card);
        });
        
        sortDeckCards();
        
        if (window.cardsModule && window.cardsModule.getFactionCards) {
            availableCards = window.cardsModule.getFactionCards(faction.id);
            displayedCollectionCards = [
                ...availableCards.units,
                ...availableCards.specials,
                ...availableCards.artifacts,
                ...availableCards.tactics 
            ];
            
            displayedCollectionCards = displayedCollectionCards.filter(card => {
                if (card.copy && card.copy > 1) {
                    const copiesInDeck = finalSelectedCards.filter(c => c.id === card.id).length;
                    return copiesInDeck < card.copy;
                } else {
                    return !finalSelectedCards.some(c => c.id === card.id);
                }
            });
            
            sortCollectionCards();
        }
        
        updateDeckStats();
        updateDeckDisplay();
        
        setTimeout(() => {
            const deckGrid = document.getElementById('deckGrid');
            if (deckGrid) {
                const deckCards = deckGrid.querySelectorAll('.deck-card');
                deckCards.forEach((cardElement, index) => {
                    cardElement.style.animation = `cardAddition 0.3s ease ${index * 0.02}s both`;
                });
            }
        }, 10);
        
        setTimeout(() => {
            const activeFilter = document.querySelector('.cards-collection .sort-btn.active');
            if (activeFilter) {
                const filterType = activeFilter.dataset.type;
                sortCollection(filterType);
                
                setTimeout(() => {
                    const newCollectionCards = collectionGrid.querySelectorAll('.collection-card');
                    newCollectionCards.forEach((cardElement, index) => {
                        cardElement.style.animation = `cardAddition 0.3s ease ${index * 0.02}s both`;
                    });
                }, 10);
            }
        }, 10);
        
    }, collectionCards.length * 10);
}

function updateDeckStats() {
    const specialCardsCount = currentDeck.cards.filter(card => 
        card.type === 'special' || card.type === 'tactic' || card.type === 'artifact'
    ).length;
    
	const heroesCount = currentDeck.cards.filter(card => 
        card.tags && (card.tags.includes('герой') || card.tags.includes('hero'))
    ).length;
	
    const stats = {
        total: currentDeck.cards.length,
        units: currentDeck.cards.filter(card => card.type === 'unit').length,
        specials: specialCardsCount,
        heroes: heroesCount,
        totalStrength: currentDeck.cards.reduce((sum, card) => sum + (card.strength || 0), 0)
    };
    
    currentDeck.stats = stats;
    
    document.getElementById('totalCards').textContent = stats.total;
    document.getElementById('unitCards').textContent = stats.units;
    document.getElementById('specialCards').textContent = stats.specials;
    document.getElementById('totalStrength').textContent = stats.totalStrength;
	
	const heroCardsElement = document.getElementById('heroCards');
    if (heroCardsElement) {
        heroCardsElement.textContent = stats.heroes;
    }
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
        const activeFilter = document.querySelector('.deck-cards .sort-btn.active:not(.deck-faction-sort-btn)');
        if (activeFilter) {
            const filterType = activeFilter.dataset.type;
            sortDeckWithFactionFilter(filterType);
        } else {
            sortDeckWithFactionFilter('all');
        }
    }
}

function getCardCopyCountInDeck(cardId) {
    return currentDeck.cards.filter(card => card.id === cardId).length;
}

function getAvailableCopies(card) {
    if (!card.copy || card.copy <= 1) return 1;
    const inDeck = getCardCopyCountInDeck(card.id);
    return Math.max(0, card.copy - inDeck);
}

function updateCardCopyIndicator(cardElement, card) {
    const availableCopies = getAvailableCopies(card);
    const oldIndicator = cardElement.querySelector('.card__copy-indicator');
    const oldBanner = cardElement.querySelector('.card__copy-banner');
    
    if (oldIndicator) {
        oldIndicator.remove();
    }
    if (oldBanner) {
        oldBanner.remove();
    }
    
    if (card.copy && card.copy > 1 && availableCopies > 1) {
        const copyBanner = document.createElement('img');
        copyBanner.className = 'card__copy-banner';
        copyBanner.src = `faction/${card.faction}/banner_position.png`;
        copyBanner.alt = 'Копия';
		
        const copyIndicator = document.createElement('div');
        copyIndicator.className = 'card__copy-indicator';
        copyIndicator.textContent = `×${availableCopies}`;
        
        const cardContainer = cardElement.querySelector('.card__container');
        if (cardContainer) {
            cardContainer.appendChild(copyBanner);
            cardContainer.appendChild(copyIndicator);
        }
    }
}

function updateCollectionCardDisplay(cardId) {
    const card = displayedCollectionCards.find(c => c.id === cardId);
    if (!card) return;
    
    const collectionCardElement = document.querySelector(`.collection-card[data-card-id="${cardId}"]`);
    
    if (card.copy && card.copy > 1) {
        if (collectionCardElement) {
            updateCardCopyIndicator(collectionCardElement, card);
            
            const availableCopies = getAvailableCopies(card);
            if (availableCopies <= 0) {
                removeCardFromCollectionCompletely(cardId);
            } else {
                collectionCardElement.style.display = 'block';
            }
        }
    } else {
        if (collectionCardElement) {
            collectionCardElement.remove();
        }
    }
}

function removeCardFromCollection(cardId) {
    const card = displayedCollectionCards.find(c => c.id === cardId);
    if (!card) return;
    
    if (card.copy && card.copy > 1) {
        const availableCopies = getAvailableCopies(card);
        if (availableCopies > 0) {
            updateCollectionCardDisplay(cardId);
        } else {
            removeCardFromCollectionCompletely(cardId);
        }
    } else {
        removeCardFromCollectionCompletely(cardId);
    }
}

function removeCardFromCollectionCompletely(cardId) {
    const index = displayedCollectionCards.findIndex(c => c.id === cardId);
    if (index !== -1) {
        displayedCollectionCards.splice(index, 1);
    }
    
    const cardElement = document.querySelector(`.collection-card[data-card-id="${cardId}"]`);
    if (cardElement) {
        cardElement.remove();
    }
}

function addCardToCollection(card) {
    const existingCard = displayedCollectionCards.find(c => c.id === card.id);
    if (!existingCard) {
        displayedCollectionCards.push(card);
        sortCollectionCards();
    }
    
    const activeFilter = document.querySelector('.cards-collection .sort-btn.active');
    if (activeFilter) {
        const filterType = activeFilter.dataset.type;
        sortCollection(filterType);
    } else {
        displayCollectionCards();
    }
}

function animateCardAddition(card) {
    const deckCards = document.querySelectorAll('.deck-card');
    const addedCardElement = Array.from(deckCards).find(cardElement => 
        cardElement.dataset.cardId === card.id
    );
    
    if (addedCardElement) {
        addedCardElement.style.animation = 'cardAddition 0.5s ease';
        setTimeout(() => {
            addedCardElement.style.animation = '';
        }, 500);
    }
    
    if (card.copy && card.copy > 1) {
        const collectionCard = document.querySelector(`.collection-card[data-card-id="${card.id}"]`);
        if (collectionCard) {
            const copyIndicator = collectionCard.querySelector('.card__copy-indicator');
            if (copyIndicator) {
                copyIndicator.style.animation = 'copyIndicatorPulse 0.5s ease';
                setTimeout(() => {
                    copyIndicator.style.animation = '';
                }, 500);
            }
        }
    } else {
        const collectionCard = document.querySelector(`.collection-card[data-card-id="${card.id}"]`);
        if (collectionCard) {
            collectionCard.style.animation = 'cardRemoval 0.5s ease';
            setTimeout(() => {
                collectionCard.style.animation = '';
                collectionCard.remove();
            }, 500);
        }
    }
    
    audioManager.playSound('cardAdd');
}

function animateCardRemoval(card) {
    if (card.copy && card.copy > 1) {
        const collectionCard = document.querySelector(`.collection-card[data-card-id="${card.id}"]`);
        if (collectionCard) {
            collectionCard.style.animation = 'cardAddition 0.5s ease';
            setTimeout(() => {
                collectionCard.style.animation = '';
            }, 500);
            
            const copyIndicator = collectionCard.querySelector('.card__copy-indicator');
            if (copyIndicator) {
                copyIndicator.style.animation = 'copyIndicatorPulse 0.5s ease';
                setTimeout(() => {
                    copyIndicator.style.animation = '';
                }, 500);
            }
        }
    }
    else {
        const collectionCard = document.querySelector(`.collection-card[data-card-id="${card.id}"]`);
        if (collectionCard) {
            collectionCard.style.animation = 'cardAddition 0.5s ease';
            setTimeout(() => {
                collectionCard.style.animation = '';
            }, 500);
        }
    }
}

function sortCollection(type) {
    const collectionGrid = document.getElementById('collectionGrid');
    
    const isFilterChanged = lastCollectionFilter !== type;
    lastCollectionFilter = type;
    
    sortCollectionWithFactionFilter(type);
}

function sortCollectionWithFactionFilter(type) {
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
    
    if (factionSortEnabled && window.selectedFaction) {
        sortedCards = sortedCards.filter(card => card.faction === window.selectedFaction.id);
    }
    
    sortedCards = sortedCards.filter(card => !card.hidden);
    
    const filteredCards = sortedCards.filter(card => {
        if (card.copy && card.copy > 1) {
            return getAvailableCopies(card) > 0;
        } else {
            return !currentDeck.cards.some(c => c.id === card.id);
        }
    });
    
    collectionGrid.innerHTML = '';
    
    if (filteredCards.length === 0) {
        collectionGrid.innerHTML = `
            <div class="empty-category-message">
                <p>Нет карт данной категории</p>
                <img src="deck/none_cards.png" alt="Пустая колода" class="empty-deck-icon">
            </div>
        `;
    } else {
        filteredCards.forEach((card, index) => {
            const cardElement = createCardElement(card, 'collection');
            cardElement.classList.add('collection-card');
            
            cardElement.style.animation = `cardAddition 0.3s ease ${index * 0.02}s both`;
            
            collectionGrid.appendChild(cardElement);
        });
    }
}

function createDeckCardElement(card) {
    const cardElement = createCardElement(card, 'deck');
    cardElement.classList.add('deck-card');
    
    const copiesInDeck = getCardCopyCountInDeck(card.id);
    if (copiesInDeck > 1) {
        const copyBanner = document.createElement('img');
        copyBanner.className = 'card__copy-banner';
        copyBanner.src = `faction/${card.faction}/banner_position.png`;
        copyBanner.alt = 'Копия';
        
        const copyCount = document.createElement('div');
        copyCount.className = 'card__copy-count';
        copyCount.textContent = `×${copiesInDeck}`;
        
        const cardContainer = cardElement.querySelector('.card__container');
        if (cardContainer) {
            cardContainer.appendChild(copyBanner);
            cardContainer.appendChild(copyCount);
        }
    }
    
    return cardElement;
}

function sortDeck(type) {
    sortDeckWithFactionFilter(type);
}

function sortDeckWithFactionFilter(type) {
    const deckGrid = document.getElementById('deckGrid');
    
    if (currentDeck.cards.length === 0) {
        deckGrid.innerHTML = `
            <div class="empty-deck-message">
                <p>Колода пуста</p>
                <p>Добавьте карты из коллекции</p>
                <img src="deck/none_cards.png" alt="Пустая колода" class="empty-deck-icon">
            </div>
        `;
        return;
    }
    
    const previousFilter = lastDeckFilter;
    const isFilterChanged = previousFilter !== type;
    lastDeckFilter = type;
    
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
    
    if (deckFactionSortEnabled && window.selectedFaction) {
        sortedCards = sortedCards.filter(card => card.faction === window.selectedFaction.id);
    }
    
    const oldCards = Array.from(deckGrid.querySelectorAll('.deck-card')).map(el => el.dataset.cardId);
    const newCards = sortedCards.map(card => card.id);
    
    const cardsChanged = oldCards.length !== newCards.length || 
                         oldCards.some((id, index) => id !== newCards[index]);
    
    deckGrid.innerHTML = '';
    
    if (sortedCards.length === 0) {
        deckGrid.innerHTML = `
            <div class="empty-category-message">
                <p>Нет карт данной категории в колоде</p>
                <img src="deck/none_cards.png" alt="Пустая колода" class="empty-deck-icon">
            </div>
        `;
    } else {
        const uniqueCards = [];
        const cardCounts = {};
        
        sortedCards.forEach(card => {
            if (!cardCounts[card.id]) {
                cardCounts[card.id] = 0;
                uniqueCards.push(card);
            }
            cardCounts[card.id]++;
        });
        
        uniqueCards.forEach((card, index) => {
            const cardElement = createDeckCardElement(card);
            
            if (isFilterChanged || cardsChanged) {
                cardElement.style.animation = `cardAddition 0.3s ease ${index * 0.02}s both`;
            }
            
            deckGrid.appendChild(cardElement);
        });
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
    a.download = `${currentDeck.faction}.json`;
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
                
                clearDeckSilent();
                
                currentDeck.ability = deckData.ability || defaultAbilities[currentDeck.faction];
                
                const availableCardsForFaction = window.cardsModule.getCardsForDeckBuilding 
                    ? window.cardsModule.getCardsForDeckBuilding(currentDeck.faction)
                    : window.cardsModule.getFactionCards(currentDeck.faction);
                
                const allCards = [
                    ...availableCardsForFaction.units,
                    ...availableCardsForFaction.specials,
                    ...availableCardsForFaction.artifacts,
                    ...availableCardsForFaction.tactics
                ];
                
                const cardsToAdd = [];
                
                for (const cardId of deckData.cards) {
                    const card = allCards.find(c => c.id === cardId);
                    if (card && !card.hidden && cardsToAdd.length < 40) {
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
                
            } catch (error) {
                showMessage('Неверный формат файла колоды!');
            }
        };
        reader.readAsText(file);
        setFactionHeadersBackground(currentDeck.faction);
    };
    
    input.click();
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
            // Убираем выделение со всех опций
            abilityOptions.forEach(opt => {
                opt.classList.remove('selected');
                // Удаляем существующий флажок
                const existingCheck = opt.querySelector('.ability-option__check');
                if (existingCheck) {
                    existingCheck.remove();
                }
            });
            
            // Добавляем выделение выбранной опции
            option.classList.add('selected');
            
            // Создаем и добавляем флажок для выбранной опции
            const checkMark = document.createElement('div');
            checkMark.className = 'ability-option__check';
            checkMark.innerHTML = `<img src="deck/activ.png" alt="Выбрано">`;
            option.appendChild(checkMark);
            
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
    
    // Обработчик для открытия модального окна с картой лидера
    const showLeaderModal = (e) => {
        e.stopPropagation();
        const faction = window.selectedFaction;
        if (faction) {
            const leaderCardData = {
                id: `${faction.id}_leader`,
                name: faction.leaderName.split(' ')[0],
                namefull: faction.leaderName,
                type: 'leader',
                faction: faction.id,
                image: `leader.mp4`,
                imageStatic: `leader.jpg`,
                description: faction.description || '',
                descriptionfull: faction.descriptionfull || '',
                ability: `${faction.id}_ability`,
                rarity: 'gold',
                tags: ['leader'],
                border: 'deck/bord_gold.png',
                banner: `faction/${faction.id}/banner_gold.png`
            };
            showCardModal(leaderCardData);
        }
    };
    
    // ЛКМ - открываем модальное окно с картой лидера
    leaderCard.addEventListener('click', showLeaderModal);
    
    // ПКМ - тоже открываем модальное окно с картой лидера
    leaderCard.addEventListener('contextmenu', (e) => {
        e.preventDefault(); // Отключаем стандартное контекстное меню браузера
        showLeaderModal(e);
        audioManager.playSound('button');
    });
    
    // Видео эффекты при наведении
    if (video) {
        leaderCard.addEventListener('mouseenter', () => {
            video.play().catch(e => {});
        });
        
        leaderCard.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
    }
    
    // Звук при наведении
    leaderCard.addEventListener('mouseenter', () => {
        audioManager.playSound('touch');
    });
}

function validateDeckAndStartGame() {
    const totalCards = currentDeck.cards.length;
    const unitCardsCount = currentDeck.cards.filter(card => card.type === 'unit').length;
    const specialCardsCount = currentDeck.cards.filter(card => 
        card.type === 'special' || card.type === 'tactic' || card.type === 'artifact'
    ).length;
    
    const errors = [];
    
    if (totalCards < 25) {
        errors.push(`Минимальный размер колоды: 25 карт`);
    }
    
    if (totalCards > 40) {
        errors.push(`Максимальный размер колоды: 40 карт`);
    }
    
    if (unitCardsCount < 15) {
        errors.push(`Минимальное количество карт отрядов: 15`);
    }
    
    if (specialCardsCount < 5) {
        errors.push(`Обязательное количество специальных карт: 5`);
    }
    
    if (specialCardsCount > 10) {
        errors.push(`Максимальное количество специальных карт: 10`);
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
    
    const messageBox = document.createElement('div');
    messageBox.className = 'message-box';
    
    const title = document.createElement('h3');
    title.textContent = 'ВНИМАНИЕ';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.innerHTML = text.replace(/\n\n/g, '<br><br>');
    
    messageBox.appendChild(title);
    messageBox.appendChild(messageText);
    overlay.appendChild(messageBox);
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        messageBox.classList.add('active');
    }, 10);
    
    audioManager.playSound('button');
    audioManager.playSound('warning');
    
    setTimeout(() => {
        if (document.body.contains(overlay)) {
            messageBox.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
            }, 100);
        }
    }, 3000);
}

function startGame() {
    if (window.boardModule && window.boardModule.initGameBoard) {
        if (window.audioManager) {
            window.audioManager.setBattleMusic();
        }
        
        if (window.deckModule && window.deckModule.currentDeck) {
            window.deckModule.currentDeck.ability = currentDeck.ability;
        }
        
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