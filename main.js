document.addEventListener('DOMContentLoaded', function() {
    const playBtn = document.getElementById('playBtn');
    const rulesBtn = document.getElementById('rulesBtn');
    const settingsBtn = document.getElementById('settingsBtn');

    playBtn.addEventListener('click', function() {
        audioManager.playSound('button');
        animateTransitionToFactionSelection();
    });

    rulesBtn.addEventListener('click', function() {
        audioManager.playSound('button');
        window.rulesModule.initRulesPage();
    });

    settingsBtn.addEventListener('click', function() {
        audioManager.playSound('button');
        showSettingsModal();
    });

    const menuButtons = [playBtn, rulesBtn, settingsBtn];
    menuButtons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            audioManager.playSound('touch');
        });
    });

    function animateTransitionToFactionSelection() {
        const logo = document.querySelector('.logo');
        const menuButtons = document.querySelector('.main-menu-buttons');
        const startPage = document.querySelector('.start-page');

        logo.style.animation = 'fadeOutUp 0.5s ease forwards';
        menuButtons.style.animation = 'fadeOutDown 0.5s ease forwards';
        audioManager.playSound('transition');

        setTimeout(() => {
            startPage.style.opacity = '0';

            setTimeout(() => {
                startPage.style.display = 'none';
            }, 500);

            window.factionModule.initFactionSelection();
        }, 500);
    }

    function enterFullscreen() {
        const docElement = document.documentElement;

        if (docElement.requestFullscreen) {
            docElement.requestFullscreen();
        } else if (docElement.mozRequestFullScreen) {
            docElement.mozRequestFullScreen();
        } else if (docElement.webkitRequestFullscreen) {
            docElement.webkitRequestFullscreen();
        } else if (docElement.msRequestFullscreen) {
            docElement.msRequestFullscreen();
        }

        updateFullscreenButtons();
    }

    function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }

        updateFullscreenButtons();
    }

    function isFullscreen() {
        return !!(document.fullscreenElement ||
                 document.mozFullScreenElement ||
                 document.webkitFullscreenElement ||
                 document.msFullscreenElement);
    }

    function toggleFullscreen() {
        if (isFullscreen()) {
            exitFullscreen();
            return false;
        } else {
            enterFullscreen();
            return true;
        }
    }

    function updateFullscreenButtons() {
        const fullscreenOnBtn = document.getElementById('modalFullscreenOn');
        const fullscreenOffBtn = document.getElementById('modalFullscreenOff');

        if (fullscreenOnBtn && fullscreenOffBtn) {
            const fullscreenActive = isFullscreen();
            fullscreenOnBtn.classList.toggle('active', fullscreenActive);
            fullscreenOffBtn.classList.toggle('active', !fullscreenActive);
        }
    }

    document.addEventListener('fullscreenchange', updateFullscreenButtons);
    document.addEventListener('mozfullscreenchange', updateFullscreenButtons);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButtons);
    document.addEventListener('msfullscreenchange', updateFullscreenButtons);

    window.fullscreenManager = {
        enterFullscreen,
        exitFullscreen,
        isFullscreen,
        toggleFullscreen,
        updateFullscreenButtons
    };
});