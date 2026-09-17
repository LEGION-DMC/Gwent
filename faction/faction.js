const factionsData = {  
    scoiatael: {
        id: 'scoiatael',
        name: 'Скоя\'таэли',
        leaderName: 'Францеска Финдабаир',
        description: 'Княгиня Дол Блатанны',
        descriptionfull: 'Когда-то Большой землей владели Старшие расы: эльфы, краснолюды, гномы. Люди оттеснили их, в горы, в густые леса — и ждут, пока те вымрут от голода и болезней. Но это вовсе не ослабляет их желания бунтовать, а лишь усиливает его. В конце концов им нечего терять.',
        ability: 'Право выбора первого хода',
        logo: 'faction/scoiatael/logo_faction.png',
        background: 'faction/scoiatael/fon_faction.jpg',
    },
    realms: {
        id: 'realms',
        name: 'Королевства Севера',
        leaderName: 'Фольтест',
        description: 'Король Темерии',
        descriptionfull: 'Ни при одном дворе, ни в одной библиотеке нет точной карты Королевств Севера. Ибо стоит картографу провести последнюю черту, как один из многочисленных королей, принцев или маркграфов уже атакует соседа и переносит границу. Без конца кто-то с кем-то воюет.',
        ability: 'Замена до 3 карт на этапе Муллиганы',
        logo: 'faction/realms/logo_faction.png',
        background: 'faction/realms/fon_faction.jpg',
    },
    nilfgaard: {
        id: 'nilfgaard',
        name: 'Нильфгаард',
        leaderName: 'Эмгыр вар Эмрейс',
        description: 'IV Император Нильфгаарда',
        descriptionfull: 'Весь Континент дрожит от чеканного шага нильфгаардских пехотинцев. За ними следом движутся плюющие огнем боевые машины, наемные убийцы с окровавленными стилетами. Жители Севера с ужасом наблюдают за этим походом и шепчут слова молитвы',
        ability: 'Победа в раунде при ничьей',
        logo: 'faction/nilfgaard/logo_faction.png',
        background: 'faction/nilfgaard/fon_faction.jpg',
    },
    monsters: {
        id: 'monsters',
        name: 'Чудовища',
        leaderName: 'Эредин Бреакк Глас',
        description: 'Командир Дикой Охоты',
        descriptionfull: 'Люди думают, что они хозяева земель. Но достаточно сойти с большака или навострить ухо во время полнолуния, как станет ясно, насколько далека эта мысль от истины. Посреди лесной чащи, в тенистых оврагах и сырых погребах покинутых домов сверкает множество глаз.',
        ability: 'Сохранение 1 размещённой карты, в конце раунда',
        logo: 'faction/monsters/logo_faction.png',
        background: 'faction/monsters/fon_faction.jpg',
    },
    skellige: {
        id: 'skellige',
        name: 'Скеллиге',
        leaderName: 'Бран Тиршах',
        description: 'Король Скеллиге',
        descriptionfull: 'В дали от западных берегов Континента лежат острова Скеллиге. В сравнении с Королевствами Севера или Нильфгаардской империей они нечтожно малы. Хотя многие пытались захватить их. Останки их кораблей до сих пор торчат среди скал, а островитяне пьют мед из их шлемов.',
        ability: 'Возврат 2 карт из Сброса в 3 раунде',
        logo: 'faction/skellige/logo_faction.png',
        background: 'faction/skellige/fon_faction.jpg',
    },
    syndicate: {
        id: 'syndicate',
        name: 'Синдикат',
        leaderName: 'Тесак',
        description: 'Предводитель группировки «Златорубы»',
        descriptionfull: 'Одни сражаются за честь, а другие — за империю. Одни сражаются за короля, а другие — за свободу. Те, кто состоит в Синдикате, не станут сражаться ни за что, кроме богатства. И если щедро им заплатить, они будут готовы для вас на любые деяния… Даже самые чудовищные.',
        ability: 'Отмена фазы Муллиганы противника',
        logo: 'faction/syndicate/logo_faction.png',
        background: 'faction/syndicate/fon_faction.jpg',
    },
};

let selectedFaction = null;
let isHovering = false;
let cachedElements = {};
let currentAudio = null;

function stopCurrentVoice() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
}

function playFactionVoice(factionId) {
    stopCurrentVoice();
    
    const voicePath = `faction/${factionId}/voice.mp3`;
    
    const audio = new Audio(voicePath);
    currentAudio = audio;
    
    audio.onerror = () => {
        console.warn(`Voice file not found: ${voicePath}`);
        currentAudio = null;
    };
    
    audio.play().catch(error => {
        console.warn(`Failed to play voice: ${error.message}`);
        currentAudio = null;
    });
}

function preloadFactionVoice(factionId) {
    const voicePath = `faction/${factionId}/voice.mp3`;
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = voicePath;
    return audio;
}

function getElement(selector) {
    if (!cachedElements[selector]) {
        cachedElements[selector] = document.querySelector(selector);
    }
    return cachedElements[selector];
}

function clearCache() {
    cachedElements = {};
}

function initFactionSelection() {
    window.selectedFaction = null;
    selectedFaction = null;
    
    document.body.style.background = "url('ui/fon.jpg') no-repeat center center fixed";
    document.body.style.backgroundSize = 'cover';
    
    const startPage = getElement('.start-page');
    if (startPage) startPage.style.display = 'none';
    
    const existingSection = document.querySelector('.faction-selection');
    if (existingSection) existingSection.remove();
    
    createFactionSelectionHTML();
    setupFactionEventListeners();
    document.addEventListener('keydown', handleKeyPress);
}

function createFactionSelectionHTML() {
    if (document.querySelector('.faction-selection')) return;
    
    const factionSection = document.createElement('section');
    factionSection.className = 'faction-selection';
    
    factionSection.innerHTML = `
        <div class="faction-selection__title">ВЫБЕРИТЕ ФРАКЦИЮ</div>
        <div class="faction-selection__container">
            ${Object.values(factionsData).map(faction => `
                <div class="faction-card" data-faction="${faction.id}">
                    <img src="${faction.logo}" alt="${faction.name}" class="faction-card__logo">
                </div>
            `).join('')}
        </div>
        <div class="faction-description">
            <div class="faction-description__name"></div>
            <div class="faction-description__text"></div>
            <div class="faction-description__ability"></div>
        </div>
        <button class="confirm-btn" id="confirmFactionBtn">ПОДТВЕРДИТЬ ВЫБОР</button>
    `;
    
    document.body.appendChild(factionSection);
    clearCache();
    
    setTimeout(() => {
        factionSection.style.opacity = '1';
        factionSection.style.transform = 'translateY(0)';
    }, 50);
}

function setupFactionEventListeners() {
    const confirmBtn = document.getElementById('confirmFactionBtn');
    
    document.querySelectorAll('.faction-card').forEach(card => {
        const factionId = card.dataset.faction;
        const faction = factionsData[factionId];
        
        card.addEventListener('mouseenter', () => {
            audioManager?.playSound('touch');
            isHovering = true;
            showFactionDescription(faction);
        });
        
        card.addEventListener('mouseleave', () => {
            isHovering = false;
            if (!selectedFaction) {
                hideFactionDescription();
            } else {
                setTimeout(() => {
                    if (!isHovering) showFactionDescription(selectedFaction);
                }, 100);
            }
        });
        
        card.addEventListener('click', () => {
            audioManager?.playSound('touch');
            playFactionVoice(factionId);
            selectFaction(faction);
        });
    });
    
    if (confirmBtn) {
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.replaceWith(newConfirmBtn);
        
        newConfirmBtn.addEventListener('mouseenter', () => audioManager?.playSound('touch'));
        newConfirmBtn.addEventListener('click', () => {
            if (selectedFaction) {
                audioManager?.playSound('button');
                proceedToDeckBuilding(selectedFaction);
            }
        });
    }
}

function cleanupFactionSelection() {
    document.removeEventListener('keydown', handleKeyPress);
    stopCurrentVoice();
    selectedFaction = null;
    isHovering = false;
    clearCache();
}

function selectFaction(faction) {
    document.querySelectorAll('.faction-card').forEach(card => {
        card.classList.remove('faction-card--selected');
    });
    
    const selectedCard = document.querySelector(`[data-faction="${faction.id}"]`);
    selectedCard?.classList.add('faction-card--selected');
    selectedFaction = faction;
    
    showFactionDescription(faction);
    
    const confirmBtn = document.getElementById('confirmFactionBtn');
    if (confirmBtn) {
        confirmBtn.style.opacity = '1';
        confirmBtn.style.transform = 'translateY(0)';
        confirmBtn.style.pointerEvents = 'auto';
    }
}

function showFactionDescription(faction) {
    const description = document.querySelector('.faction-description');
    if (!description) return;
    
    const nameElement = description.querySelector('.faction-description__name');
    const textElement = description.querySelector('.faction-description__text');
    const abilityElement = description.querySelector('.faction-description__ability');
    
    if (nameElement) nameElement.textContent = faction.name;
    if (textElement) textElement.textContent = faction.descriptionfull;
    
    if (abilityElement) {
        abilityElement.innerHTML = faction.ability 
            ? `<strong>Способность фракции:</strong> ${faction.ability}`
            : '';
        abilityElement.style.display = faction.ability ? 'block' : 'none';
    }
    
    description.style.opacity = '1';
    description.style.transform = 'translateY(0)';
}

function hideFactionDescription() {
    const description = document.querySelector('.faction-description');
    if (description) {
        description.style.opacity = '0';
        description.style.transform = 'translateY(20px)';
    }
}

function proceedToDeckBuilding(faction) {
    window.selectedFaction = faction;
    cleanupFactionSelection();
    window.deckModule?.initDeckBuilding?.(faction);
}

function handleKeyPress(event) {
    if (event.key === 'Escape') {
        if (selectedFaction) {
            stopCurrentVoice();
            
            document.querySelectorAll('.faction-card').forEach(card => {
                card.classList.remove('faction-card--selected');
            });
            selectedFaction = null;
            
            const confirmBtn = document.getElementById('confirmFactionBtn');
            if (confirmBtn) {
                confirmBtn.style.opacity = '0';
                confirmBtn.style.transform = 'translateY(20px)';
                confirmBtn.style.pointerEvents = 'none';
            }
            
            hideFactionDescription();
            audioManager?.playSound('button');
        } else {
            returnToMainMenu();
        }
    }
}

function returnToMainMenu() {
    stopCurrentVoice();
    
    const factionSection = document.querySelector('.faction-selection');
    const startPage = document.querySelector('.start-page');
    
    if (factionSection) {
        factionSection.style.opacity = '0';
        factionSection.style.transform = 'translateY(50px)';
        setTimeout(() => factionSection.remove(), 500);
    }
    
    if (startPage) {
        startPage.style.display = 'flex';
        setTimeout(() => {
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
        }, 400);
    }
    
    window.selectedFaction = null;
    selectedFaction = null;
    cleanupFactionSelection();
}

window.factionModule = {
    initFactionSelection,
    cleanupFactionSelection,
    factionsData,
    returnToMainMenu,
    playFactionVoice,    
    stopCurrentVoice     
};