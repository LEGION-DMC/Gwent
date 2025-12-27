// Данные правил игры, организованные по категориям
const rulesData = {
    basics: {
			title: 'Фракции',
            description: 'Противоборствующие фракции',
            content: `
				<div class="bloc-rule">
				<p>У каждой фракции своя история и свои способы ведения боя.</p>
				</div>
				
                <div class="bloc-rule">
					<img src="faction/nilfgaard/logo_faction.png" alt="Нильфгаард" class="rule-modal__image">
					<div class="faction">
						<h3>Нильфгаард</h3>
						<p>Государство крайностей. Самое большое, самое многонаселённое, самое могущественное, самое богатое... и, конечно, самое безжало</p>
						<p style="color: #6a66d3; font-style: italic;">Способность колоды состоит в том, что при равном счете по окончании раунда победа засчитывается игравшему данной колодой.</p>
					</div>
                </div>
				
				<div class="bloc-rule">
					<img src="faction/realms/logo_faction.png" alt="Королевства Севера" class="rule-modal__image">
					<div class="faction">
						<h3>Королевства Севера</h3>
						<p>Королевства Севера славятся внушительными армиями, смертоносной военной техникой и отважными военачальниками.</p>
						<p style="color: #6a66d3; font-style: italic;">Способность колоды состоит в том, что после победы в раунде игрок получает дополнительную карту.</p>
					</div>
                </div>
				
				<div class="bloc-rule">
					<img src="faction/monsters/logo_faction.png" alt="Чудовища" class="rule-modal__image">                
					<div class="faction">
						<h3>Чудовища</h3>
						<p>Эти жуткие чудовища подчиняются звериным инстинктам и ради еще большей мощи готовы даже поглотить своих собратьев.</p>
						<p style="color: #6a66d3; font-style: italic;">Способность колоды состоит в том, что по завершении раунда на столе остаётся случайная дружественная карта.</p>
					</div>
                </div>
				
 				<div class="bloc-rule">
					<img src="faction/scoiatael/logo_faction.png" alt="Скоя\'таэли" class="rule-modal__image"> 
					<div class="faction">
						<h3>Скоя\'таэли</h3>
						<p>Эльфы и краснолюды, лишённые всяческих прав и загнанные в переполненные гетто, ждали удобного момента, чтобы броситься в бой против королевств Севера.</p>
						<p style="color: #6a66d3; font-style: italic;">Способность колоды состоит в том, что за ней закреплено право выбора первого хода.</p>
					</div>
                </div>
				
				<div class="bloc-rule">	
					<img src="faction/skellige/logo_faction.png" alt="Скеллиге" class="rule-modal__image">	
					<div class="faction">
						<h3>Скеллиге</h3>
						<p>Воины Скеллиге без страха бросаются на врага, а потери и полученные раны лишь придают им сил в бою.</p>
						<p style="color: #6a66d3; font-style: italic;">Способность колоды состоит в том, что в третьем раунде две случайные карты из отбоя возвращаются в игру.</p>
					</div>
                </div>
				<!--
				<div class="bloc-rule">	
					<img src="faction/syndicate/logo_faction.png" alt="Синдикат" class="rule-modal__image">	
					<div class="faction">
						<h3>Синдикат</h3>
						<p>другие — за империю. Одни сражаются за короля, а другие — за свободу. Те, кто состоит в Синдикате, не станут сражаться ни за что, кроме богатства.</p>
						<p style="color: #6a66d3; font-style: italic;">Способность колоды состоит в том, что ...</p>
					</div>
                </div> 
				-->
				<div class="bloc-rule">	
					<img src="faction/neutral/logo_faction.png" alt="Нейтралитет" class="rule-modal__image">	
					<div class="faction">
						<h3>Нейтралитет</h3>
						<p>Воины Скеллиге без страха бросаются на врага, а потери и полученные раны лишь придают им сил в бою.</p>
						<p style="color: #6a66d3; font-style: italic;">Особенностью этих карт является то, что ими можно играть за любую фракцию.</p>
					</div>
                </div>
            `
        },
    cards: {
			title: 'Типы карт',
            description: 'Различные виды карт и их особенности',
            content: `
				<div class="bloc-rule">
				<p>У каждой фракции своя история и свои способы ведения боя.</p>
				</div>
				
                <div class="bloc-rule">
					<img src="deck/unit.png" alt="Отряды" class="rule-modal__image">
					<div class="cards">
						<h3>Отряды</h3>
						<p>Государство</p>
					</div>
                </div>
				
                <div class="bloc-rule">
					<img src="deck/special.png" alt="Специальные" class="rule-modal__image">
					<div class="cards">
						<h3>Специальные</h3>
						<p>Государство</p>
					</div>
                </div>
				
                <div class="bloc-rule">
					<img src="deck/artifact.png" alt="Артефакты" class="rule-modal__image">
					<div class="cards">
						<h3>Артефакты</h3>
						<p>Государство</p>
					</div>
                </div>
				
                <div class="bloc-rule">
					<img src="deck/tactic.png" alt="Тактики" class="rule-modal__image">
					<div class="cards">
						<h3>Тактики</h3>
						<p>Государство</p>
					</div>
                </div>
            `
        },
    rows: {
        title: 'Боевые ряды',
        description: 'Размещение карт на поле боя',
        content: `
            <img src="deck/close-row.png" alt="Ближний бой" class="rule-modal__image">
			<h3>Ближний бой</h3>
			<p>Первый ряд для карт ближнего боя.</p>
            
            <img src="deck/ranged-row.png" alt="Дальний бой" class="rule-modal__image">
            <h3>Дальний бой</h3>
            <p>Второй ряд для карт дальнего боя.</p>
            
            <img src="deck/siege-row.png" alt="Осадные ряд" class="rule-modal__image">
            <h3>Осадные орудия</h3>
            <p>Третий ряд для осадных орудий и магов.</p>
            
			<img src="deck/any-row.png" alt="Гибрид" class="rule-modal__image">
            <h3>Гибрид</h3>
            <p>Возможно размещение в любом из доступных рядов</p>
            
            <div class="bloc-rule">
                <img src="data/rules/rows.jpg" alt="Боевые ряды" class="rule-modal__image">
            </div>
        `
    },
    abilities: {
        title: 'Способности',
        description: 'Особые умения карт',
        content: `
            <h3>Боевые способности</h3>
            <p>Усиление, ослабление или уничтожение карт.</p>
            
            <h3>Погодные эффекты</h3>
            <p>Влияние на целые ряды карт.</p>
            
            <h3>Способности лидеров</h3>
            <p>Уникальные умения, доступные только лидерам фракций.</p>
            
            <h3>Комбо-способности</h3>
            <p>Взаимодействия между картами одной фракции.</p>
        `
    },
    strategy: {
        title: 'Стратегия',
        description: 'Советы по построению колоды и тактике',
        content: `
            <h3>Построение колоды</h3>
            <p>Баланс между картами отрядов и специальными картами.</p>
            
            <h3>Управление картами</h3>
            <p>Когда пасовать, когда играть агрессивно.</p>
            
            <h3>Контроль раундов</h3>
            <p>Стратегия победы в двух из трех раундов.</p>
            
            <h3>Адаптация к противнику</h3>
            <p>Изменение тактики в зависимости от фракции противника.</p>
        `
    }
};

const rulesModule = {
    escapeHandler: null,

    initRulesPage: function() {
        this.createRulesPageHTML();     
        this.setupRulesEventListeners(); 
        this.showRulesPage();           
    },

    createRulesPageHTML: function() {
        const rulesPage = document.createElement('div');
        rulesPage.className = 'rules-page';
        rulesPage.innerHTML = `
            <button class="rules-back-btn" id="rulesBackBtn">НАЗАД</button>
            <div class="rules-title">ПРАВИЛА ИГРЫ</div>
            <div class="rules-grid" id="rulesGrid">
                ${this.generateRulesGrid()}
            </div>
        `;
        
        document.body.appendChild(rulesPage);
        this.createRuleModal();
    },

    generateRulesGrid: function() {
        return Object.values(rulesData).map(rule => `
            <div class="rule-card" data-rule="${rule.title}">
                <div class="rule-card__title">${rule.title}</div>
                <div class="rule-card__description">${rule.description}</div>
            </div>
        `).join('');
    },

    createRuleModal: function() {
        const ruleModal = document.createElement('div');
        ruleModal.className = 'rule-modal-overlay';
        ruleModal.innerHTML = `
            <div class="rule-modal" id="ruleModal">
                <div class="rule-modal__title" id="ruleModalTitle"></div>
                <div class="rule-modal__content" id="ruleModalContent"></div>
            </div>
        `;
        document.body.appendChild(ruleModal);
    },

    setupRulesEventListeners: function() {
        document.getElementById('rulesBackBtn').addEventListener('click', () => {
            this.hideRulesPage();
            audioManager.playSound('button');
        });

        document.querySelectorAll('.rule-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const ruleTitle = e.currentTarget.dataset.rule;
                this.showRuleModal(ruleTitle);
                audioManager.playSound('button');
            });
            
            card.addEventListener('mouseenter', () => {
                audioManager.playSound('touch');
            });
        });

        document.querySelector('.rule-modal-overlay').addEventListener('click', (e) => {
            if (e.target.classList.contains('rule-modal-overlay')) {
                this.hideRuleModal();
            }
        });

        this.setupEscapeHandler();
    },

    setupEscapeHandler: function() {
        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
        }
        
        this.escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.handleEscape();
            }
        };
        
        document.addEventListener('keydown', this.escapeHandler);
    },

    handleEscape: function() {
        if (this.isRuleModalOpen()) {
            this.hideRuleModal();
        } 
        else {
            this.hideRulesPage();
        }
    },

    isRuleModalOpen: function() {
        const modalOverlay = document.querySelector('.rule-modal-overlay');
        return modalOverlay && modalOverlay.classList.contains('active');
    },

    showRulesPage: function() {
        const rulesPage = document.querySelector('.rules-page');
        rulesPage.classList.add('active');
        
        setTimeout(() => {
            rulesPage.style.opacity = '1';
        }, 50);
        
        this.setupEscapeHandler();
    },

    hideRulesPage: function() {
        const rulesPage = document.querySelector('.rules-page');
        rulesPage.style.opacity = '0';
        
        setTimeout(() => {
            rulesPage.classList.remove('active');
            if (this.escapeHandler) {
                document.removeEventListener('keydown', this.escapeHandler);
                this.escapeHandler = null;
            }
        }, 300);
        
        audioManager.playSound('button');
    },

    showRuleModal: function(ruleTitle) {
        const rule = Object.values(rulesData).find(r => r.title === ruleTitle);
        if (!rule) return;

        const modalOverlay = document.querySelector('.rule-modal-overlay');
        const titleElement = document.getElementById('ruleModalTitle');
        const contentElement = document.getElementById('ruleModalContent');

        titleElement.textContent = rule.title;
        contentElement.innerHTML = rule.content;
        modalOverlay.classList.add('active');
        this.setupEscapeHandler();
    },

    hideRuleModal: function() {
        const modalOverlay = document.querySelector('.rule-modal-overlay');
        modalOverlay.classList.remove('active');
        audioManager.playSound('button');
    }
};

window.rulesModule = rulesModule;