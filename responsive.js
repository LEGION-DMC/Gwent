/* ==========================================================================
   Масштабирование игрового поля под размер окна (только ПК-мониторы)
   --------------------------------------------------------------------------
   Игровое поле свёрстано как фиксированный макет 1920×1080.
   Здесь вычисляется коэффициент, который целиком вписывает макет в окно
   с сохранением пропорций, и передаётся в CSS-переменную --gw-scale.
   ========================================================================== */
(function () {
    'use strict';

    var DESIGN_WIDTH = 1920;
    var DESIGN_HEIGHT = 1080;

    var root = document.documentElement;
    var frame = 0;

    function applyScale() {
        frame = 0;

        var width = root.clientWidth || window.innerWidth;
        var height = root.clientHeight || window.innerHeight;
        if (!width || !height) return;

        var scale = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT);
        root.style.setProperty('--gw-scale', String(scale));
    }

    function scheduleScale() {
        if (frame) return;
        frame = window.requestAnimationFrame(applyScale);
    }

    window.addEventListener('resize', scheduleScale, { passive: true });
    window.addEventListener('orientationchange', scheduleScale, { passive: true });

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', scheduleScale, { passive: true });
    }

    applyScale();
    document.addEventListener('DOMContentLoaded', applyScale);

    window.addEventListener('load', applyScale);
})();
