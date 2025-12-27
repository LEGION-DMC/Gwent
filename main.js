document.addEventListener('DOMContentLoaded', function() {
    // Автоматически включаем полноэкранный режим при загрузке
    enterFullscreen();
    
    // Получаем ссылки на кнопки главного меню
    const playBtn = document.getElementById('playBtn');
    const rulesBtn = document.getElementById('rulesBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    
    // Обработчик для кнопки "ИГРАТЬ" - переход к выбору фракции
    playBtn.addEventListener('click', function() {
        audioManager.playSound('button'); // Звук клика
        animateTransitionToFactionSelection(); // Анимация перехода
    });
	
    // Обработчик для кнопки "ПРАВИЛА" - открытие экрана правил
    rulesBtn.addEventListener('click', function() {
        audioManager.playSound('button');
        window.rulesModule.initRulesPage();
    });
    
    // Обработчик для кнопки "ОПЦИИ" - открытие настроек
    settingsBtn.addEventListener('click', function() {
        audioManager.playSound('button');
        showSettingsModal();
    });
    
    // Добавляем звуки наведения для всех кнопок меню
    const menuButtons = [playBtn, rulesBtn, settingsBtn];
    menuButtons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            audioManager.playSound('touch'); // Звук наведения
        });
    });
	
    // Анимирует переход к выбору фракции
    function animateTransitionToFactionSelection() {
        const logo = document.querySelector('.logo');
        const menuButtons = document.querySelector('.main-menu-buttons');
        const startPage = document.querySelector('.start-page');
        
        // Запускаем анимации исчезновения
        logo.style.animation = 'fadeOutUp 0.5s ease forwards';    // Логотип уезжает вверх
        menuButtons.style.animation = 'fadeOutDown 0.5s ease forwards'; // Кнопки уезжают вниз
        audioManager.playSound('transition'); // Воспроизводим звук перехода
        
        // Cкрываем страницу и переходим к выбору фракции
        setTimeout(() => {
            startPage.style.opacity = '0'; // Плавное исчезновение
            
            // Полностью скрываем стартовую страницу после анимации
            setTimeout(() => {
                startPage.style.display = 'none';
            }, 500);
            
            window.factionModule.initFactionSelection(); // Инициализируем выбор фракции
        }, 500);
    }

    // Функция для входа в полноэкранный режим
    function enterFullscreen() {
        const docElement = document.documentElement;
        
        if (docElement.requestFullscreen) {
            docElement.requestFullscreen();
        } else if (docElement.mozRequestFullScreen) { // Firefox
            docElement.mozRequestFullScreen();
        } else if (docElement.webkitRequestFullscreen) { // Chrome, Safari, Opera
            docElement.webkitRequestFullscreen();
        } else if (docElement.msRequestFullscreen) { // IE/Edge
            docElement.msRequestFullscreen();
        }
        
        // Обновляем состояние кнопок в настройках
        updateFullscreenButtons();
    }

    // Функция для выхода из полноэкранного режима
    function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari, Opera
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge
            document.msExitFullscreen();
        }
        
        // Обновляем состояние кнопок в настройках
        updateFullscreenButtons();
    }

    // Функция для проверки полноэкранного режима
    function isFullscreen() {
        return !!(document.fullscreenElement || 
                 document.mozFullScreenElement || 
                 document.webkitFullscreenElement || 
                 document.msFullscreenElement);
    }

    // Функция для переключения полноэкранного режима
    function toggleFullscreen() {
        if (isFullscreen()) {
            exitFullscreen();
            return false;
        } else {
            enterFullscreen();
            return true;
        }
    }

    // Функция для обновления состояния кнопок полноэкранного режима
    function updateFullscreenButtons() {
        const fullscreenOnBtn = document.getElementById('modalFullscreenOn');
        const fullscreenOffBtn = document.getElementById('modalFullscreenOff');
        
        if (fullscreenOnBtn && fullscreenOffBtn) {
            const fullscreenActive = isFullscreen();
            fullscreenOnBtn.classList.toggle('active', fullscreenActive);
            fullscreenOffBtn.classList.toggle('active', !fullscreenActive);
        }
    }

    // Слушаем события изменения полноэкранного режима
    document.addEventListener('fullscreenchange', updateFullscreenButtons);
    document.addEventListener('mozfullscreenchange', updateFullscreenButtons);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButtons);
    document.addEventListener('msfullscreenchange', updateFullscreenButtons);

    // Добавляем функции в глобальную область видимости для использования в настройках
    window.fullscreenManager = {
        enterFullscreen,
        exitFullscreen,
        isFullscreen,
        toggleFullscreen,
        updateFullscreenButtons
    };
});