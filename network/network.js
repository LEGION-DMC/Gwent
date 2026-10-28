(function () {
    'use strict';

    const STATE_KEYS = [
        'player', 'opponent', 'weather',
        'currentRound', 'totalRounds', 'roundsWon', 'roundResults', 'winnerOfLastRound',
        'currentPlayer', 'gamePhase', 'cardsPlayedThisTurn', 'maxCardsPerTurn',
        'gameSettings', 'mulligan', 'roundLossDueToTimeout'
    ];

    const HANDLER_ARRAY_KEYS = [
        'artifactSelectionHandlers', 'boostSelectionHandlers', 'decoySelectionHandlers',
        'destroyTargets', 'doubleStrengthHandlers', 'positionSelectionHandlers',
        'rowDamageSelectionHandlers', 'rowSelectionHandlers', 'spySelectionHandlers'
    ];

    const HANDLER_VALUE_KEYS = [
        'placementType', 'boostCard', 'boostTag', 'boostTagValue', 'damageCard',
        'decoyCard', 'destroyArtifactCard', 'destroyUnitCard', 'doubleStrengthCard',
        'selectedCard', 'selectedCardElement', 'selectingRow'
    ];

    // ---------------------------------------------------------------------
    // ICE-серверы
    //
    // STUN бесплатный и не требует регистрации: именно он превращает
    // «игру по локальной сети» в игру через интернет. Без него браузер
    // видит только локальные адреса и соединяет игроков лишь в одной сети.
    //
    // Если у обоих игроков «строгий» NAT (мобильный интернет, некоторые
    // провайдеры), нужен TURN-сервер, который пересылает трафик. TURN
    // можно добавить в массив ниже или задать через localStorage:
    //
    //   localStorage.setItem('gwentIceServers', JSON.stringify([
    //       { urls: 'turn:turn.example.com:3478', username: 'user', credential: 'pass' }
    //   ]));
    //
    // Свой список полностью заменяет стандартный.
    // ---------------------------------------------------------------------

    const DEFAULT_ICE_SERVERS = [
        {
            urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302'
            ]
        },
        { urls: 'stun:stun.cloudflare.com:3478' }
    ];

    function loadIceServers() {
        try {
            const raw = localStorage.getItem('gwentIceServers');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length) return parsed;
            }
        } catch (error) {
            console.warn('[network] gwentIceServers:', error);
        }
        return DEFAULT_ICE_SERVERS;
    }

    // ---------------------------------------------------------------------
    // Вспомогательные функции
    // ---------------------------------------------------------------------

    function flipSide(value) {
        if (value === 'player') return 'opponent';
        if (value === 'opponent') return 'player';
        return value;
    }

    /** gamePhase задан относительно стороны ('playerTurn'/'opponentTurn'). */
    function flipTurnPhase(value) {
        if (value === 'playerTurn') return 'opponentTurn';
        if (value === 'opponentTurn') return 'playerTurn';
        return value;
    }

    function capitalize(value) {
        return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
    }

    function hashString(str) {
        let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
        for (let i = 0; i < str.length; i++) {
            const ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
    }

    /** Меняет местами стороны у всех карт (свойство owner). */
    function swapCardOwners(node) {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) {
            node.forEach(swapCardOwners);
            return;
        }
        Object.keys(node).forEach(function (key) {
            const value = node[key];
            if (key === 'owner' && (value === 'player' || value === 'opponent')) {
                node[key] = flipSide(value);
            } else if (value && typeof value === 'object') {
                swapCardOwners(value);
            }
        });
    }

    /** Зеркалит полученное состояние (перспектива отправителя -> наша). */
    function mirrorState(raw) {
        const state = raw;
        const senderPlayer = state.player;
        const senderOpponent = state.opponent;

        state.player = senderOpponent;
        state.opponent = senderPlayer;

        state.currentPlayer = flipSide(state.currentPlayer);
        state.gamePhase = flipTurnPhase(state.gamePhase);
        state.roundsWon = {
            player: raw.roundsWon ? raw.roundsWon.opponent : 0,
            opponent: raw.roundsWon ? raw.roundsWon.player : 0
        };
        state.roundResults = (state.roundResults || []).map(function (result) {
            return flipSide(result);
        });
        state.winnerOfLastRound = flipSide(state.winnerOfLastRound);
        state.roundLossDueToTimeout = flipSide(state.roundLossDueToTimeout);

        if (state.mulligan) {
            const mp = state.mulligan.player;
            state.mulligan.player = state.mulligan.opponent;
            state.mulligan.opponent = mp;
        }

        swapCardOwners(state.player);
        swapCardOwners(state.opponent);
        swapCardOwners(state.weather);

        return state;
    }

    function bytesToBase64(bytes) {
        let binary = '';
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) {
            binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
        }
        return btoa(binary);
    }

    function base64ToBytes(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    async function packPayload(obj) {
        const bytes = new TextEncoder().encode(JSON.stringify(obj));
        if (typeof CompressionStream !== 'undefined') {
            try {
                const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
                const buffer = await new Response(stream).arrayBuffer();
                return 'GW1.' + bytesToBase64(new Uint8Array(buffer));
            } catch (error) {
                console.warn('[network] gzip недоступен:', error);
            }
        }
        return 'GW0.' + bytesToBase64(bytes);
    }

    async function unpackPayload(code) {
        const clean = String(code || '').replace(/\s+/g, '');
        if (!clean) throw new Error('Код пустой');

        const dot = clean.indexOf('.');
        if (dot < 0) throw new Error('Неверный формат кода');

        const version = clean.slice(0, dot);
        const data = base64ToBytes(clean.slice(dot + 1));
        let bytes = data;

        if (version === 'GW1') {
            if (typeof DecompressionStream === 'undefined') {
                throw new Error('Браузер не поддерживает распаковку кода');
            }
            const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'));
            bytes = new Uint8Array(await new Response(stream).arrayBuffer());
        } else if (version !== 'GW0') {
            throw new Error('Неизвестная версия кода');
        }

        return JSON.parse(new TextDecoder().decode(bytes));
    }

    function cloneDeck(deck) {
        if (!deck) return null;
        return JSON.parse(JSON.stringify({
            faction: deck.faction,
            ability: deck.ability,
            leader: deck.leader || null,
            cards: deck.cards || []
        }));
    }

    function copyText(text) {
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(function () {});
        }
    }

    // ---------------------------------------------------------------------
    // Модуль
    // ---------------------------------------------------------------------

    const networkModule = {
        // Состояние сессии
        side: null,                 // 'host' | 'guest'
        connected: false,
        active: false,              // true после старта партии (доска создана)
        inNetworkFlow: false,       // true после соединения (лобби пройдено)

        // WebRTC
        pc: null,
        dc: null,

        // Деки
        localDeck: null,
        remoteDeck: null,
        localDeckSent: false,
        hostGameStarted: false,
        guestBoardReady: false,

        // Синхронизация
        seq: 0,
        lastIncomingHash: null,
        lastSentHash: null,
        applying: false,
        pendingState: null,
        tickTimer: null,

        // Муллиган / раунды
        mulliganTurn: null,         // 'host' | 'guest' | 'both' | 'done'
        mulliganStartedLocally: false,
        mulliganCompleteHandled: false,
        mulliganCompletionScheduled: false,
        guestMulliganStarted: false,
        syncedMulligan: false,          // одновременная муллигана
        mulliganStartReceived: false,
        localCoinDone: false,
        mulliganHostDone: false,
        mulliganGuestDone: false,
        mulliganFinalizeScheduled: false,
        roundStartShown: false,
        roundEndTriggered: false,
        roundEndScheduled: false,
        startingRound: false,
        lastResultShownCount: 0,
        endGameScheduled: false,
        endGameShown: false,
        wasMyTurn: false,
        abilitySig: null,

        // Монетка / выбор первого хода
        guestReadyForToss: false,
        pendingCoinToss: false,
        coinTossStarted: false,
        coinFirst: null,                // в перспективе хоста
        factionAbilitiesReady: false,

        // Фракции
        localFactionSelection: null,
        remoteFactionSelection: null,
        remoteFactionConfirmed: null,
        factionConfirmed: false,

        // Возврат к сбору колоды после матча
        redeckHandled: false,

        // UI
        lobbyEl: null,
        badgeEl: null,
        waitingEl: null,
        navigatedToFactions: false,
        lobbyBusy: false,

        // Автоматическая сигнализация по коду комнаты
        roomCode: null,
        signaling: null,
        autoConnectTimer: null,
        autoAnswerApplied: false,
        autoOfferApplied: false,
        autoOfferNonce: null,

        _originals: {},

        // -----------------------------------------------------------------
        // Лобби / сигнализация
        // -----------------------------------------------------------------

        openLobby: function () {
            if (this.lobbyEl) return;
            this.resetPeer();
            this.navigatedToFactions = false;
            this.inNetworkFlow = false;

            const overlay = document.createElement('div');
            overlay.className = 'network-overlay';
            overlay.id = 'networkOverlay';
            overlay.innerHTML = `
				<div class="network-panel">
					<div class="network-title">СЕТЕВАЯ ИГРА</div>
					<div class="network-status" id="networkStatus">Не подключено</div>

					<div class="network-body" id="networkBody">
						<div class="network-mode-switch" id="networkMethodSwitch">
							<button data-method="auto" class="active" id="methodAutoTab">ПО КОДУ КОМНАТЫ</button>
							<button data-method="manual" id="methodManualTab">ВРУЧНУЮ (SDP)</button>
						</div>

						<div class="network-pane" id="autoPane">
							<div class="network-mode-switch network-mode-switch--sub" id="autoRoleSwitch">
								<button data-role="host" class="active" id="autoHostTab">СОЗДАТЬ КОМНАТУ</button>
								<button data-role="guest" id="autoGuestTab">ВОЙТИ ПО КОДУ</button>
							</div>

							<div class="network-pane" id="autoHostPane">
								<div class="network-room">
									<div class="network-room-label">Код комнаты</div>
									<div class="network-room-code" id="roomCodeDisplay">------</div>
								</div>
								<button class="network-action" id="createRoomBtn">СОЗДАТЬ КОМНАТУ</button>
								<button class="network-action secondary" id="copyRoomBtn" disabled>КОПИРОВАТЬ КОД</button>
								<div class="network-hint">
									Передайте код другу любым способом. Ему нужно открыть игру,
									выбрать «ВОЙТИ ПО КОДУ» и ввести его. Постоянный сервер не
									нужен: параметры соединения передаются через бесплатный
									сервис ntfy.sh, а сама игра идёт напрямую между браузерами.
								</div>
							</div>

							<div class="network-pane hidden" id="autoGuestPane">
								<label class="network-label">Код комнаты от друга</label>
								<input class="network-code network-code--single" id="roomCodeInput" maxlength="12"
									autocomplete="off" autocapitalize="characters" spellcheck="false"
									placeholder="НАПРИМЕР K7M2QX">
								<button class="network-action" id="joinRoomBtn">ПОДКЛЮЧИТЬСЯ</button>
								<div class="network-hint">
									Код чувствителен к опечаткам — вводите его без пробелов.
								</div>
							</div>
						</div>

						<div class="network-pane hidden" id="manualPane">
							<div class="network-mode-switch network-mode-switch--sub">
								<button data-mode="host" class="active" id="networkHostTab">СОЗДАТЬ ИГРУ</button>
								<button data-mode="guest" id="networkGuestTab">ПОДКЛЮЧИТЬСЯ</button>
							</div>

							<div class="network-pane" id="hostPane">
								<button class="network-action" id="createOfferBtn">СОЗДАТЬ ПРИГЛАШЕНИЕ</button>

								<label class="network-label">Код приглашения</label>
								<textarea class="network-code" id="offerCode" readonly placeholder="Код появится здесь"></textarea>
								<button class="network-action secondary" id="copyOfferBtn">КОПИРОВАТЬ КОД</button>

								<label class="network-label">Код ответа от второго игрока</label>
								<textarea class="network-code" id="answerCode" placeholder="Вставьте сюда код ответа..."></textarea>
								<button class="network-action" id="acceptAnswerBtn">ПОДКЛЮЧИТЬСЯ</button>
							</div>

							<div class="network-pane hidden" id="guestPane">
								<textarea class="network-code" id="offerInput" placeholder="Вставьте код приглашения..."></textarea>
								<button class="network-action" id="createAnswerBtn">СОЗДАТЬ КОД ОТВЕТА</button>

								<label class="network-label">Передайте этот код хосту</label>
								<textarea class="network-code" id="answerOutput" readonly placeholder="Код ответа появится здесь"></textarea>
								<button class="network-action secondary" id="copyAnswerBtn">КОПИРОВАТЬ КОД</button>
							</div>

							<div class="network-hint">
								Ручной режим: коды приглашения и ответа нужно передать друг другу
								любым способом. Работает и через интернет, если браузерам удаётся
								пробить NAT (STUN уже включён).
							</div>
						</div>
					</div>
				</div>
			`;
            document.body.appendChild(overlay);
            this.lobbyEl = overlay;

            // Прячем страницу выбора типа игры за панелью, чтобы её
            // содержимое не просвечивало сквозь полупрозрачные элементы.
            const modePage = document.querySelector('.game-mode-selection');
            if (modePage) {
                modePage.dataset.hiddenByNetwork = '1';
                modePage.style.visibility = 'hidden';
            }

            const methodAutoTab = overlay.querySelector('#methodAutoTab');
            const methodManualTab = overlay.querySelector('#methodManualTab');
            const autoPane = overlay.querySelector('#autoPane');
            const manualPane = overlay.querySelector('#manualPane');

            methodAutoTab.addEventListener('click', () => {
                methodAutoTab.classList.add('active');
                methodManualTab.classList.remove('active');
                autoPane.classList.remove('hidden');
                manualPane.classList.add('hidden');
            });
            methodManualTab.addEventListener('click', () => {
                methodManualTab.classList.add('active');
                methodAutoTab.classList.remove('active');
                manualPane.classList.remove('hidden');
                autoPane.classList.add('hidden');
            });

            const autoHostTab = overlay.querySelector('#autoHostTab');
            const autoGuestTab = overlay.querySelector('#autoGuestTab');
            const autoHostPane = overlay.querySelector('#autoHostPane');
            const autoGuestPane = overlay.querySelector('#autoGuestPane');

            autoHostTab.addEventListener('click', () => {
                autoHostTab.classList.add('active');
                autoGuestTab.classList.remove('active');
                autoHostPane.classList.remove('hidden');
                autoGuestPane.classList.add('hidden');
            });
            autoGuestTab.addEventListener('click', () => {
                autoGuestTab.classList.add('active');
                autoHostTab.classList.remove('active');
                autoGuestPane.classList.remove('hidden');
                autoHostPane.classList.add('hidden');
            });

            overlay.querySelector('#createRoomBtn').addEventListener('click', () => this.createRoom());
            overlay.querySelector('#joinRoomBtn').addEventListener('click', () => this.joinRoom());
            overlay.querySelector('#copyRoomBtn').addEventListener('click', () => copyText(this.roomCode));

            const roomInput = overlay.querySelector('#roomCodeInput');
            if (roomInput) {
                roomInput.addEventListener('input', () => {
                    const normalized = window.networkSignaling
                        ? window.networkSignaling.normalizeCode(roomInput.value)
                        : roomInput.value.toUpperCase();
                    if (roomInput.value !== normalized) roomInput.value = normalized;
                });
                roomInput.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') this.joinRoom();
                });
            }

            const hostTab = overlay.querySelector('#networkHostTab');
            const guestTab = overlay.querySelector('#networkGuestTab');
            const hostPane = overlay.querySelector('#hostPane');
            const guestPane = overlay.querySelector('#guestPane');

            hostTab.addEventListener('click', () => {
                hostTab.classList.add('active');
                guestTab.classList.remove('active');
                hostPane.classList.remove('hidden');
                guestPane.classList.add('hidden');
            });
            guestTab.addEventListener('click', () => {
                guestTab.classList.add('active');
                hostTab.classList.remove('active');
                guestPane.classList.remove('hidden');
                hostPane.classList.add('hidden');
            });

            overlay.querySelector('#createOfferBtn').addEventListener('click', () => this.createOffer());
            overlay.querySelector('#acceptAnswerBtn').addEventListener('click', () => this.acceptAnswer());
            overlay.querySelector('#createAnswerBtn').addEventListener('click', () => this.createAnswer());
            overlay.querySelector('#copyOfferBtn').addEventListener('click', () => {
                copyText(overlay.querySelector('#offerCode').value);
            });
            overlay.querySelector('#copyAnswerBtn').addEventListener('click', () => {
                copyText(overlay.querySelector('#answerOutput').value);
            });
        },

        closeLobby: function () {
            if (this.lobbyEl && this.lobbyEl.parentNode) {
                this.lobbyEl.parentNode.removeChild(this.lobbyEl);
            }
            this.lobbyEl = null;

            // Возвращаем страницу выбора типа игры, если её скрывали.
            const modePage = document.querySelector('.game-mode-selection');
            if (modePage && modePage.dataset.hiddenByNetwork) {
                delete modePage.dataset.hiddenByNetwork;
                modePage.style.visibility = '';
            }
        },

        setStatus: function (text, type) {
            if (!this.lobbyEl) return;
            const status = this.lobbyEl.querySelector('#networkStatus');
            if (!status) return;
            status.textContent = text;
            status.className = 'network-status' + (type ? ' network-status-' + type : '');
        },

		setBusy: function (busy) {
			this.lobbyBusy = busy;
			if (!this.lobbyEl) return;
			this.lobbyEl.querySelectorAll('button').forEach(function (button) {
				button.disabled = busy;
			});
		},

        resetPeer: function () {
            this.stopSignaling();
            this.roomCode = null;
            if (this.dc) {
                try { this.dc.close(); } catch (error) {}
                this.dc = null;
            }
            if (this.pc) {
                try { this.pc.close(); } catch (error) {}
                this.pc = null;
            }
            this.connected = false;
            this.inNetworkFlow = false;
            this.seq = 0;
            this.lastIncomingHash = null;
            this.lastSentHash = null;
        },

        createPeer: function () {
            const pc = new RTCPeerConnection({
                iceServers: loadIceServers(),
                iceCandidatePoolSize: 0
            });
            this.pc = pc;

            pc.addEventListener('connectionstatechange', () => {
                if (pc !== this.pc) return;
                if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                    const failedBeforeConnect = pc.connectionState === 'failed' && !this.connected;
                    this.onConnectionLost(
                        failedBeforeConnect
                            ? 'Не удалось установить соединение. Если у кого-то «строгий» NAT, нужен TURN-сервер (см. NETWORK.md).'
                            : 'Соединение потеряно'
                    );
                }
            });

            pc.addEventListener('datachannel', (event) => {
                if (this.dc) return;
                this.setupDataChannel(event.channel);
            });

            return pc;
        },

        setupDataChannel: function (channel) {
            this.dc = channel;
            channel.binaryType = 'arraybuffer';

            channel.addEventListener('open', () => this.onConnected());
            channel.addEventListener('close', () => this.onConnectionLost('Соединение закрыто'));
            channel.addEventListener('message', (event) => this.onMessage(event.data));
        },

        waitIce: function (pc) {
            return new Promise((resolve) => {
                if (pc.iceGatheringState === 'complete') {
                    resolve();
                    return;
                }
                let finished = false;
                const check = () => {
                    if (pc.iceGatheringState === 'complete') finish();
                };
                const finish = () => {
                    if (finished) return;
                    finished = true;
                    clearTimeout(timer);
                    pc.removeEventListener('icegatheringstatechange', check);
                    resolve();
                };
                const timer = setTimeout(finish, 5000);
                pc.addEventListener('icegatheringstatechange', check);
            });
        },

        createOffer: async function () {
            if (this.lobbyBusy) return;
            try {
                this.resetPeer();
                this.side = 'host';
                this.setBusy(true);
                this.setStatus('Создание приглашения…');

                const pc = this.createPeer();
                const channel = pc.createDataChannel('gwent', { ordered: true });
                this.setupDataChannel(channel);

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                await this.waitIce(pc);

                if (!pc.localDescription) throw new Error('Не удалось собрать параметры соединения');

                const code = await packPayload({
                    type: pc.localDescription.type,
                    sdp: pc.localDescription.sdp
                });

                const field = this.lobbyEl && this.lobbyEl.querySelector('#offerCode');
                if (field) field.value = code;

                this.setStatus('Ожидание кода ответа от второго игрока…', 'wait');
            } catch (error) {
                console.error('[network] createOffer:', error);
                this.setStatus('Ошибка: ' + error.message, 'error');
            } finally {
                this.setBusy(false);
            }
        },

        acceptAnswer: async function () {
            if (this.lobbyBusy || !this.pc) return;
            try {
                const field = this.lobbyEl && this.lobbyEl.querySelector('#answerCode');
                const code = field ? field.value.trim() : '';
                if (!code) throw new Error('Вставьте код ответа');

                this.setBusy(true);
                this.setStatus('Установка соединения…');

                const description = await unpackPayload(code);
                await this.pc.setRemoteDescription({
                    type: description.type,
                    sdp: description.sdp
                });

                this.setStatus('Ожидание соединения…', 'wait');
            } catch (error) {
                console.error('[network] acceptAnswer:', error);
                this.setStatus('Ошибка: ' + error.message, 'error');
            } finally {
                this.setBusy(false);
            }
        },

        createAnswer: async function () {
            if (this.lobbyBusy) return;
            try {
                const field = this.lobbyEl && this.lobbyEl.querySelector('#offerInput');
                const code = field ? field.value.trim() : '';
                if (!code) throw new Error('Вставьте код приглашения');

                this.resetPeer();
                this.side = 'guest';
                this.setBusy(true);
                this.setStatus('Создание кода ответа…');

                const pc = this.createPeer();
                const description = await unpackPayload(code);
                await pc.setRemoteDescription({
                    type: description.type,
                    sdp: description.sdp
                });

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                await this.waitIce(pc);

                if (!pc.localDescription) throw new Error('Не удалось собрать параметры соединения');

                const answerCode = await packPayload({
                    type: pc.localDescription.type,
                    sdp: pc.localDescription.sdp
                });

                const output = this.lobbyEl && this.lobbyEl.querySelector('#answerOutput');
                if (output) output.value = answerCode;

                this.setStatus('Передайте код ответа хосту и ожидайте соединения…', 'wait');
            } catch (error) {
                console.error('[network] createAnswer:', error);
                this.setStatus('Ошибка: ' + error.message, 'error');
            } finally {
                this.setBusy(false);
            }
        },

        // -----------------------------------------------------------------
        // Автоматическое соединение по коду комнаты
        // (сигнализация через бесплатный ntfy.sh, трафик — напрямую)
        // -----------------------------------------------------------------

        createRoom: async function () {
            if (this.lobbyBusy) return;
            try {
                if (!window.networkSignaling) throw new Error('Модуль сигнализации не загружен');

                this.resetPeer();
                this.side = 'host';
                this.autoAnswerApplied = false;
                this.setBusy(true);
                this.setStatus('Создание комнаты…');

                const code = window.networkSignaling.generateCode(6);
                this.roomCode = code;
                this.autoOfferNonce = window.networkSignaling.generateCode(8);
                this.showRoomCode(code);

                const pc = this.createPeer();
                const channel = pc.createDataChannel('gwent', { ordered: true });
                this.setupDataChannel(channel);

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                await this.waitIce(pc);

                if (!pc.localDescription) throw new Error('Не удалось собрать параметры соединения');

                this.signaling = window.networkSignaling.createChannel({
                    code: code,
                    role: 'host',
                    onMessage: (message) => this.onAutoSignal(message),
                    onStatus: (state, error) => this.onSignalStatus(state, error)
                });
                this.signaling.start();

                await this.signaling.publish({
                    t: 'offer',
                    type: pc.localDescription.type,
                    nonce: this.autoOfferNonce,
                    sdp: pc.localDescription.sdp
                });

                this.setStatus('Комната ' + code + '. Ждём второго игрока…', 'wait');
                this.startAutoTimeout();
            } catch (error) {
                console.error('[network] createRoom:', error);
                this.setStatus('Ошибка: ' + error.message, 'error');
            } finally {
                this.setBusy(false);
            }
        },

        joinRoom: async function () {
            if (this.lobbyBusy) return;
            const input = this.lobbyEl && this.lobbyEl.querySelector('#roomCodeInput');
            const raw = input ? input.value : '';
            try {
                if (!window.networkSignaling) throw new Error('Модуль сигнализации не загружен');

                const code = window.networkSignaling.normalizeCode(raw);
                if (code.length < 4) throw new Error('Введите код комнаты');

                this.resetPeer();
                this.side = 'guest';
                this.autoOfferApplied = false;
                this.setBusy(true);
                this.setStatus('Ищем комнату ' + code + '…');

                this.signaling = window.networkSignaling.createChannel({
                    code: code,
                    role: 'guest',
                    onMessage: (message) => this.onAutoSignal(message),
                    onStatus: (state, error) => this.onSignalStatus(state, error)
                });
                this.signaling.start();

                this.startAutoTimeout();
            } catch (error) {
                console.error('[network] joinRoom:', error);
                this.setStatus('Ошибка: ' + error.message, 'error');
            } finally {
                this.setBusy(false);
            }
        },

        showRoomCode: function (code) {
            if (!this.lobbyEl) return;
            const display = this.lobbyEl.querySelector('#roomCodeDisplay');
            if (display) display.textContent = code;
            const copy = this.lobbyEl.querySelector('#copyRoomBtn');
            if (copy) copy.disabled = false;
        },

        startAutoTimeout: function () {
            if (this.autoConnectTimer) clearTimeout(this.autoConnectTimer);
            this.autoConnectTimer = setTimeout(() => {
                this.autoConnectTimer = null;
                if (this.connected) return;
                this.setStatus(
                    this.side === 'host'
                        ? 'Соперник не подключился. Код можно передать ещё раз или создать новую комнату.'
                        : 'Не удалось подключиться. Проверьте код и попробуйте снова.',
                    'error'
                );
            }, 60000);
        },

        onAutoSignal: function (message) {
            if (!message || !message.sdp) return;
            if (this.side === 'host') this.onHostAnswer(message);
            else if (this.side === 'guest') this.onGuestOffer(message);
        },

        /** Хост получает ответ гостя и завершает рукопожатие. */
        onHostAnswer: async function (message) {
            if (message.t !== 'answer' || !this.pc) return;
            if (this.autoAnswerApplied) return;
            if (this.pc.signalingState !== 'have-local-offer') return;

            // Ответ должен относиться именно к нашему приглашению.
            if (this.autoOfferNonce && message.nonce !== this.autoOfferNonce) return;

            this.autoAnswerApplied = true;
            try {
                this.setStatus('Соперник найден. Устанавливаем соединение…', 'wait');
                await this.pc.setRemoteDescription({ type: 'answer', sdp: message.sdp });
            } catch (error) {
                this.autoAnswerApplied = false;
                console.warn('[network] не удалось применить ответ:', error);
            }
        },

        /** Гость получает приглашение и отправляет ответ. */
        onGuestOffer: async function (message) {
            if (message.t !== 'offer' || this.pc) return;
            this.autoOfferApplied = true;
            try {
                this.setStatus('Комната найдена. Устанавливаем соединение…', 'wait');

                const pc = this.createPeer();
                await pc.setRemoteDescription({ type: 'offer', sdp: message.sdp });

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                await this.waitIce(pc);

                if (!pc.localDescription) throw new Error('Не удалось собрать параметры соединения');

                if (this.signaling) {
                    await this.signaling.publish({
                        t: 'answer',
                        type: pc.localDescription.type,
                        nonce: message.nonce || null,
                        sdp: pc.localDescription.sdp
                    });
                }

                this.setStatus('Ответ отправлен. Устанавливаем соединение…', 'wait');
            } catch (error) {
                console.error('[network] onGuestOffer:', error);
                this.setStatus('Не удалось подключиться к комнате: ' + error.message, 'error');
            }
        },

        onSignalStatus: function (state) {
            if (this.connected || !this.lobbyEl) return;
            if (state === 'closed') {
                this.setStatus('Переподключение к сервису сигнализации…', 'wait');
            } else if (state === 'open') {
                if (this.side === 'host' && this.roomCode) {
                    this.setStatus('Комната ' + this.roomCode + '. Ждём второго игрока…', 'wait');
                } else if (this.side === 'guest' && this.signaling) {
                    this.setStatus('Ищем комнату ' + this.signaling.code + '…', 'wait');
                }
            }
        },

        stopSignaling: function () {
            if (this.autoConnectTimer) {
                clearTimeout(this.autoConnectTimer);
                this.autoConnectTimer = null;
            }
            if (this.signaling) {
                try { this.signaling.close(); } catch (error) {}
                this.signaling = null;
            }
        },

        onConnected: function () {
            if (this.connected) return;
            this.stopSignaling();
            this.connected = true;
            this.inNetworkFlow = true;
            this.localDeck = null;
            this.remoteDeck = null;
            this.localDeckSent = false;
            this.hostGameStarted = false;
            this.guestBoardReady = false;
            this.lastIncomingHash = null;
            this.lastSentHash = null;
            this.seq = 0;
            this.mulliganTurn = null;
            this.mulliganStartedLocally = false;
            this.mulliganCompleteHandled = false;
            this.mulliganCompletionScheduled = false;
            this.guestMulliganStarted = false;
            this.syncedMulligan = false;
            this.mulliganStartReceived = false;
            this.localCoinDone = false;
            this.mulliganHostDone = false;
            this.mulliganGuestDone = false;
            this.mulliganFinalizeScheduled = false;
            this.roundStartShown = false;
            this.guestReadyForToss = false;
            this.pendingCoinToss = false;
            this.coinTossStarted = false;
            this.coinFirst = null;
            this.factionAbilitiesReady = false;
            this.localFactionSelection = null;
            this.remoteFactionSelection = null;
            this.remoteFactionConfirmed = null;
            this.factionConfirmed = false;
            this.roundEndTriggered = false;
            this.roundEndScheduled = false;
            this.lastResultShownCount = 0;
            this.endGameScheduled = false;
            this.endGameShown = false;

            console.log('[network] соединение установлено, роль:', this.side);

            if (this.lobbyEl) {
                this.setStatus('Соединение установлено!', 'ok');
                this.renderConnectedPane();
                setTimeout(() => {
                    if (this.connected) this.enterFactionSelection();
                }, 1200);
            }

            this.startTick();
        },

        renderConnectedPane: function () {
            if (!this.lobbyEl) return;
            const body = this.lobbyEl.querySelector('#networkBody');
            if (!body) return;
            body.innerHTML = `
                <div class="network-connected">
                    <div class="network-connected-title">СОЕДИНЕНИЕ УСТАНОВЛЕНО</div>
                    <div class="network-connected-role">
                        Вы — <b>${this.side === 'host' ? 'ХОСТ' : 'ГОСТЬ'}</b>
                    </div>
                    <div class="network-connected-note">Сейчас откроется выбор фракции и сборка колоды.</div>
                    <button class="network-action" id="networkContinueBtn">ПЕРЕЙТИ К ВЫБОРУ ФРАКЦИИ</button>
                </div>
            `;
            const button = body.querySelector('#networkContinueBtn');
            if (button) {
                button.addEventListener('click', () => this.enterFactionSelection());
            }
        },

        enterFactionSelection: function () {
            if (this.navigatedToFactions) return;
            this.navigatedToFactions = true;
            this.closeLobby();

            if (window.gameModeModule && window.gameModeModule.cleanup) {
                window.gameModeModule.cleanup();
            }

            const startPage = document.querySelector('.start-page');
            if (startPage) startPage.style.display = 'none';

            if (window.factionModule && window.factionModule.initFactionSelection) {
                window.factionModule.initFactionSelection();
            }
        },

        onConnectionLost: function (reason) {
            if (!this.connected && !this.active) {
                if (this.lobbyEl) this.setStatus(reason || 'Не удалось установить соединение', 'error');
                return;
            }
            this.connected = false;

            if (this.active) {
                this.showDisconnectOverlay(reason || 'Соединение потеряно');
            } else if (this.lobbyEl) {
                this.setStatus(reason || 'Соединение потеряно', 'error');
            }
        },

        showDisconnectOverlay: function (text) {
            if (document.getElementById('networkDisconnect')) return;
            const overlay = document.createElement('div');
            overlay.className = 'network-disconnect';
            overlay.id = 'networkDisconnect';
            overlay.innerHTML = `
                <div class="network-disconnect-box">
                    <div class="network-disconnect-title">СВЯЗЬ ПОТЕРЯНА</div>
                    <div class="network-disconnect-text">${text}</div>
                    <button class="network-action" id="networkReloadBtn">В ГЛАВНОЕ МЕНЮ</button>
                </div>
            `;
            document.body.appendChild(overlay);
            const button = overlay.querySelector('#networkReloadBtn');
            if (button) button.addEventListener('click', () => window.location.reload());
        },

        // -----------------------------------------------------------------
        // Обмен данными
        // -----------------------------------------------------------------

        send: function (payload) {
            if (!this.dc || this.dc.readyState !== 'open') return false;
            try {
                this.dc.send(JSON.stringify(payload));
                return true;
            } catch (error) {
                console.error('[network] send:', error);
                return false;
            }
        },

        onMessage: function (data) {
            let message;
            try {
                message = JSON.parse(data);
            } catch (error) {
                return;
            }
            if (!message || !message.t) return;

            switch (message.t) {
                case 'deck':
                    this.remoteDeck = message.deck || null;
                    if (this.side === 'host') this.hostTryStart();
                    break;

                case 'prepare':
                    if (this.side === 'guest') this.beginGuestBoard();
                    break;

                case 'board-ready':
                    if (this.side === 'host') {
                        this.guestReadyForToss = true;
                        this.tryStartCoinToss();
                    }
                    break;

                case 'coin':
                    if (this.side === 'guest') this.onCoinMessage(message);
                    break;

                case 'scoia-choose':
                    if (this.side === 'guest') this.onScoiaChooseMessage();
                    break;

                case 'scoia-first':
                    if (this.side === 'host') this.onScoiaFirstHost(message);
                    else if (this.side === 'guest') this.onScoiaFirstGuest(message);
                    break;

                case 'scoia-wait':
                    if (this.side === 'guest') {
                        this.localCoinDone = true;
                        this.showWaiting('Соперник выбирает, кто ходит первым…');
                    }
                    break;

                case 'mulligan-start':
                    if (this.side === 'guest') this.onMulliganStartMessage();
                    break;

                case 'mulligan-done':
                    if (this.side === 'host') this.onGuestMulliganDone(message);
                    break;

                case 'redeck':
                    this.onRemoteRedeck();
                    break;

                case 'faction-select':
                    this.onRemoteFactionSelect(message.faction);
                    break;

                case 'faction-release':
                    this.onRemoteFactionRelease(message.faction);
                    break;

                case 'faction-confirm':
                    this.onRemoteFactionConfirm(message.faction);
                    break;

                case 'faction-conflict':
                    this.onFactionConflict(message);
                    break;

                case 'state':
                    if (!this.active) {
                        this.pendingState = message;
                        if (this.side === 'guest' && this.localDeckSent) {
                            this.beginGuestBoard();
                        }
                    } else {
                        this.applyRemoteState(message);
                    }
                    break;

                case 'bye':
                    this.onConnectionLost('Соперник покинул игру');
                    break;
            }
        },

        isNetworkSession: function () {
            return this.connected && !!this.side;
        },

        // -----------------------------------------------------------------
        // Выбор фракции (уникальность)
        // -----------------------------------------------------------------

        onFactionSelected: function (factionId) {
            if (!this.isNetworkSession() || this.factionConfirmed) return;
            if (this.localFactionSelection && this.localFactionSelection !== factionId) {
                this.send({ t: 'faction-release', faction: this.localFactionSelection });
            }
            this.localFactionSelection = factionId;
            this.send({ t: 'faction-select', faction: factionId });
        },

        onFactionDeselected: function () {
            if (!this.isNetworkSession() || this.factionConfirmed) return;
            if (this.localFactionSelection) {
                this.send({ t: 'faction-release', faction: this.localFactionSelection });
            }
            this.localFactionSelection = null;
        },

        onFactionConfirmRequest: function (factionId) {
            if (!this.isNetworkSession()) return true;

            if (window.factionModule && window.factionModule.isFactionLocked &&
                window.factionModule.isFactionLocked(factionId)) {
                this.showFactionNote('Эта фракция уже выбрана соперником');
                return false;
            }

            this.localFactionSelection = factionId;
            this.factionConfirmed = true;
            this.send({ t: 'faction-confirm', faction: factionId });
            return true;
        },

        onRemoteFactionSelect: function (factionId) {
            if (!factionId) return;
            this.remoteFactionSelection = factionId;

            if (this.localFactionSelection === factionId && !this.remoteFactionConfirmed) {
                if (this.side === 'host') {
                    // Хост имеет приоритет — гость уступит по conflict.
                    this.send({ t: 'faction-conflict', faction: factionId, winner: 'host' });
                    return;
                }
                // Гость уступает сразу.
                this.dropLocalFactionPick();
                this.showFactionNote('Эта фракция уже выбрана соперником');
                this.send({ t: 'faction-release', faction: factionId });
            }

            if (window.factionModule && window.factionModule.lockFaction) {
                window.factionModule.lockFaction(factionId, 'ВЫБРАНО СОПЕРНИКОМ');
            }
        },

        onRemoteFactionRelease: function (factionId) {
            if (!factionId) return;
            if (this.remoteFactionSelection === factionId) this.remoteFactionSelection = null;
            if (this.remoteFactionConfirmed === factionId) return;
            if (window.factionModule && window.factionModule.unlockFaction) {
                window.factionModule.unlockFaction(factionId);
            }
        },

        onRemoteFactionConfirm: function (factionId) {
            if (!factionId) return;
            this.remoteFactionConfirmed = factionId;
            this.remoteFactionSelection = factionId;

            if (this.localFactionSelection === factionId) {
                if (this.side === 'host') {
                    // Хост всегда сохраняет свою фракцию.
                    this.send({ t: 'faction-conflict', faction: factionId, winner: 'host' });
                    return;
                }

                if (this.factionConfirmed) {
                    this.forceReselectFaction('Эта фракция уже выбрана соперником. Выберите другую.');
                } else {
                    this.dropLocalFactionPick();
                    this.showFactionNote('Эта фракция уже выбрана соперником');
                }
                return;
            }

            if (window.factionModule && window.factionModule.lockFaction) {
                window.factionModule.lockFaction(factionId, 'ВЫБРАНО СОПЕРНИКОМ');
            }
        },

        onFactionConflict: function (message) {
            if (!message || !message.faction) return;
            if (message.faction !== this.localFactionSelection) return;
            if (message.winner === this.side) return;
            if (this.factionConfirmed) {
                this.forceReselectFaction('Эта фракция уже выбрана соперником. Выберите другую.');
            } else {
                this.dropLocalFactionPick();
                this.showFactionNote('Эта фракция уже выбрана соперником');
            }
            if (window.factionModule && window.factionModule.lockFaction) {
                window.factionModule.lockFaction(message.faction, 'ВЫБРАНО СОПЕРНИКОМ');
            }
        },

        dropLocalFactionPick: function () {
            this.localFactionSelection = null;
            if (window.factionModule && window.factionModule.clearFactionSelection) {
                window.factionModule.clearFactionSelection();
            }
        },

        forceReselectFaction: function (text) {
            this.factionConfirmed = false;
            this.localFactionSelection = null;

            const deckBuilding = document.querySelector('.deck-building');
            if (deckBuilding) deckBuilding.remove();
            window.selectedFaction = null;

            if (window.factionModule && window.factionModule.initFactionSelection) {
                window.factionModule.initFactionSelection();
                setTimeout(() => this.reapplyFactionLocks(), 80);
            }

            this.showFactionNote(text || 'Выберите другую фракцию');
        },

        reapplyFactionLocks: function () {
            if (!window.factionModule || !window.factionModule.lockFaction) return;
            const factionId = this.remoteFactionConfirmed || this.remoteFactionSelection;
            if (!factionId) return;
            window.factionModule.lockFaction(
                factionId,
                this.remoteFactionConfirmed ? 'ВЫБРАНО СОПЕРНИКОМ' : 'ВЫБРАНО СОПЕРНИКОМ'
            );
        },

        showFactionNote: function (text) {
            const existing = document.getElementById('networkNote');
            if (existing) existing.remove();

            const note = document.createElement('div');
            note.id = 'networkNote';
            note.className = 'network-note';
            note.textContent = text;
            document.body.appendChild(note);

            setTimeout(() => {
                if (note.parentNode) note.parentNode.removeChild(note);
            }, 3500);
        },

        // -----------------------------------------------------------------
        // Монетка / выбор первого хода
        // -----------------------------------------------------------------

        tryStartCoinToss: function () {
            if (this.side !== 'host' || !this.active) return;
            if (!this.pendingCoinToss || this.coinTossStarted) return;
            if (!this.guestReadyForToss) return;

            this.coinTossStarted = true;
            this.pendingCoinToss = false;

            // Стартовый снапшот до монетки: гость должен знать фракции
            // (для выбора Скоя'таэлей) и получить руки.
            this.broadcastNow(true);

            const gameState = window.gameModule.gameState;
            const hostIsScoia = gameState.player.faction === 'scoiatael';
            const guestIsScoia = gameState.opponent.faction === 'scoiatael';

            if (hostIsScoia) {
                this.hostScoiaChoice();
                return;
            }
            if (guestIsScoia) {
                // Право выбора у гостя.
                this.send({ t: 'scoia-choose' });
                this.showWaiting('Соперник выбирает, кто ходит первым…');
                return;
            }

            const first = Math.random() < 0.5 ? 'player' : 'opponent';
            this.startSyncedCoin(first);
        },

        startSyncedCoin: function (first) {
            this.coinFirst = first;
            this.send({ t: 'coin', first: first });
            if (window.gameModule && window.gameModule.startCoinTossAnimation) {
                window.gameModule.startCoinTossAnimation(first);
            }
        },

        onCoinMessage: function (message) {
            if (!message || !message.first) return;
            this.coinFirst = message.first;
            const guestFirst = flipSide(message.first);
            if (window.gameModule && window.gameModule.startCoinTossAnimation) {
                window.gameModule.startCoinTossAnimation(guestFirst);
            }
        },

        hostScoiaChoice: function () {
            this.send({ t: 'scoia-wait' });

            const gameState = window.gameModule.gameState;
            const choose = window.factionAbilitiesModule &&
                window.factionAbilitiesModule.determineFirstTurn;

            if (!choose) {
                this.send({ t: 'scoia-first', first: 'player' });
                window.gameModule.startGameAfterCoinToss('player');
                return;
            }

            Promise.resolve(window.factionAbilitiesModule.determineFirstTurn(gameState))
                .then((first) => {
                    const value = (first === 'opponent') ? 'opponent' : 'player';
                    this.coinFirst = value;
                    this.send({ t: 'scoia-first', first: value });
                    window.gameModule.startGameAfterCoinToss(value);
                })
                .catch((error) => {
                    console.error('[network] scoia choice:', error);
                    this.send({ t: 'scoia-first', first: 'player' });
                    window.gameModule.startGameAfterCoinToss('player');
                });
        },

        onScoiaChooseMessage: function () {
            this.localCoinDone = true;
            this.showWaiting('Выберите, кто ходит первым…');

            const gameState = window.gameModule.gameState;
            const choose = window.factionAbilitiesModule &&
                window.factionAbilitiesModule.determineFirstTurn;

            if (!choose) {
                this.hideWaiting();
                this.send({ t: 'scoia-first', first: 'player' });
                return;
            }

            Promise.resolve(window.factionAbilitiesModule.determineFirstTurn(gameState))
                .then((choice) => {
                    this.hideWaiting();
                    const guestChoice = (choice === 'opponent') ? 'opponent' : 'player';
                    gameState.currentPlayer = guestChoice;
                    const hostFirst = flipSide(guestChoice);
                    this.coinFirst = hostFirst;
                    this.send({ t: 'scoia-first', first: hostFirst });
                })
                .catch((error) => {
                    console.error('[network] scoia guest choice:', error);
                    this.hideWaiting();
                    this.send({ t: 'scoia-first', first: 'player' });
                });
        },

        onScoiaFirstHost: function (message) {
            const first = (message && message.first === 'opponent') ? 'opponent' : 'player';
            this.coinFirst = first;
            window.gameModule.gameState.currentPlayer = first;
            this.hideWaiting();
            window.gameModule.startGameAfterCoinToss(first);
        },

        onScoiaFirstGuest: function (message) {
            const first = (message && message.first === 'opponent') ? 'opponent' : 'player';
            this.localCoinDone = true;
            window.gameModule.gameState.currentPlayer = flipSide(first);
            this.hideWaiting();
            // Далее ждём mulligan-start от хоста.
        },

        // -----------------------------------------------------------------
        // Синхронная муллигана
        // -----------------------------------------------------------------

        beginSyncedMulligan: function () {
            if (this.syncedMulligan) return false;
            this.syncedMulligan = true;
            this.mulliganStartedLocally = true;
            this.mulliganHostDone = false;
            this.mulliganGuestDone = false;
            this.mulliganFinalizeScheduled = false;
            this.roundStartShown = false;
            this.mulliganTurn = 'both';
            return true;
        },

        onMulliganStartMessage: function () {
            this.mulliganStartReceived = true;
            if (!this.localCoinDone) return;
            if (this.mulliganStartedLocally || this.syncedMulligan) return;
            window.gameModule.startMulliganPhase();
        },

        snapshotOwnSide: function () {
            const gameState = window.gameModule.gameState;
            return {
                hand: JSON.parse(JSON.stringify(gameState.player.hand || [])),
                deck: JSON.parse(JSON.stringify(gameState.player.deck || [])),
                mulligan: JSON.parse(JSON.stringify(gameState.mulligan.player || {}))
            };
        },

        onGuestMulliganDone: function (message) {
            const data = message && message.data;
            if (!data) return;

            const gameState = window.gameModule.gameState;
            if (Array.isArray(data.hand)) gameState.opponent.hand = data.hand;
            if (Array.isArray(data.deck)) gameState.opponent.deck = data.deck;
            if (data.mulligan) gameState.mulligan.opponent = data.mulligan;

            this.mulliganGuestDone = true;
            this.hideWaiting();
            this.tryCompleteSyncedMulligan();
        },

        tryCompleteSyncedMulligan: function () {
            if (this.side !== 'host' || !this.syncedMulligan) return;
            if (this.mulliganCompleteHandled || this.mulliganFinalizeScheduled) return;
            if (!this.mulliganHostDone || !this.mulliganGuestDone) return;

            this.mulliganFinalizeScheduled = true;
            setTimeout(() => {
                this.mulliganFinalizeScheduled = false;
                if (!this.active) return;
                const gameState = window.gameModule.gameState;
                if (!gameState.mulligan || gameState.mulligan.phase === 'completed') return;
                window.gameModule.completeMulliganPhase();
            }, 400);
        },

        // -----------------------------------------------------------------
        // Возврат к сбору колоды после матча (соединение сохраняется)
        // -----------------------------------------------------------------

        /** Клик «К сбору колоды»: обе стороны одновременно возвращаются к колодам. */
        beginRedeckFlow: function () {
            if (!this.isNetworkSession()) return false;
            if (this.redeckHandled) return true;
            this.redeckHandled = true;

            this.send({ t: 'redeck' });
            this.performRedeck();
            return true;
        },

        onRemoteRedeck: function () {
            if (this.redeckHandled) return;
            this.redeckHandled = true;
            this.performRedeck();
        },

        /** Локальный возврат в сборку колоды без перезагрузки страницы. */
        performRedeck: function () {
            const game = window.gameModule;
            const originals = this._originals;

            // Партия завершена — снимаем «активную» сессию, но соединение
            // и роль (хост/гость) сохраняем для следующего матча.
            this.active = false;
            this.pendingState = null;
            this.hostGameStarted = false;
            this.guestBoardReady = false;
            this.localDeck = null;
            this.remoteDeck = null;
            this.localDeckSent = false;
            this.guestReadyForToss = false;
            this.pendingCoinToss = false;
            this.coinTossStarted = false;
            this.coinFirst = null;
            this.factionAbilitiesReady = false;
            this.lastIncomingHash = null;
            this.lastSentHash = null;
            this.seq = 0;

            this.mulliganTurn = null;
            this.mulliganStartedLocally = false;
            this.mulliganCompleteHandled = false;
            this.mulliganCompletionScheduled = false;
            this.guestMulliganStarted = false;
            this.syncedMulligan = false;
            this.mulliganStartReceived = false;
            this.localCoinDone = false;
            this.mulliganHostDone = false;
            this.mulliganGuestDone = false;
            this.mulliganFinalizeScheduled = false;
            this.roundStartShown = false;
            this.roundEndTriggered = false;
            this.roundEndScheduled = false;
            this.startingRound = false;
            this.lastResultShownCount = 0;
            this.endGameScheduled = false;
            this.endGameShown = false;
            this.wasMyTurn = false;
            this.abilitySig = null;

            this.hideWaiting();

            if (game && game.stopTurnTimer) {
                try { game.stopTurnTimer(); } catch (error) {}
            }

            if (originals && originals.redeckGame && game) {
                // Штатный возврат: убирает доску и оверлей результата,
                // сбрасывает состояние и открывает сборку колоды.
                originals.redeckGame.call(game);
            } else {
                window.location.reload();
            }
        },

        // -----------------------------------------------------------------
        // Колоды и старт партии
        // -----------------------------------------------------------------

        onLocalDeckReady: function (deck) {
            if (!this.isNetworkSession()) return false;
            this.localDeck = cloneDeck(deck);

            if (this.side === 'host') {
                if (this.remoteDeck) {
                    this.startHostGame();
                } else {
                    this.showWaiting('Ожидание колоды соперника…');
                }
            } else {
                this.localDeckSent = true;
                this.send({ t: 'deck', deck: this.localDeck });
                this.showWaiting('Колода отправлена. Ожидание старта игры…');
            }
            return true;
        },

        hostTryStart: function () {
            if (this.side !== 'host' || this.hostGameStarted) return;
            if (!this.localDeck || !this.remoteDeck) return;
            this.startHostGame();
        },

        startHostGame: function () {
            if (this.hostGameStarted) return;
            this.hostGameStarted = true;
            this.active = true;
            this.side = 'host';
            this.mulliganTurn = null;
            this.mulliganStartedLocally = false;
            this.mulliganCompleteHandled = false;
            this.mulliganCompletionScheduled = false;
            this.guestMulliganStarted = false;
            this.syncedMulligan = false;
            this.mulliganStartReceived = false;
            this.localCoinDone = false;
            this.mulliganHostDone = false;
            this.mulliganGuestDone = false;
            this.mulliganFinalizeScheduled = false;
            this.roundStartShown = false;
            this.guestReadyForToss = false;
            this.pendingCoinToss = false;
            this.coinTossStarted = false;
            this.coinFirst = null;
            this.roundEndTriggered = false;
            this.roundEndScheduled = false;
            this.lastResultShownCount = 0;
            this.endGameScheduled = false;
            this.endGameShown = false;
            this.lastIncomingHash = null;
            this.lastSentHash = null;
            this.seq = 0;
            this.redeckHandled = false;

            this.hideWaiting();
            this.showBadge();
            this.send({ t: 'prepare' });

            if (window.audioManager && window.audioManager.setBattleMusic) {
                window.audioManager.setBattleMusic();
            }
            if (window.deckModule && window.deckModule.currentDeck) {
                window.deckModule.currentDeck.ability = this.localDeck.ability;
            }

            window.gameModule.gameState.network = {
                active: true,
                side: 'host',
                mulliganTurn: null,
                seq: 0
            };

            if (window.boardModule && window.boardModule.initGameBoard) {
                window.boardModule.initGameBoard();
            }
        },

        beginGuestBoard: function () {
            if (this.active || this.side !== 'guest') return;
            this.active = true;
            this.guestBoardReady = true;
            this.syncedMulligan = false;
            this.mulliganStartReceived = false;
            this.localCoinDone = false;
            this.mulliganHostDone = false;
            this.mulliganGuestDone = false;
            this.mulliganFinalizeScheduled = false;
            this.roundStartShown = false;
            this.pendingState = null;
            this.redeckHandled = false;

            this.hideWaiting();
            this.showBadge();

            if (window.audioManager && window.audioManager.setBattleMusic) {
                window.audioManager.setBattleMusic();
            }
            if (window.boardModule && window.boardModule.initGameBoard) {
                window.boardModule.initGameBoard();
            }
        },

        // -----------------------------------------------------------------
        // Сериализация и снапшоты
        // -----------------------------------------------------------------

        buildStateObject: function () {
            const gameState = window.gameModule && window.gameModule.gameState;
            const result = {};
            if (!gameState) return result;
            STATE_KEYS.forEach(function (key) {
                if (gameState[key] !== undefined) result[key] = gameState[key];
            });
            return result;
        },

        buildContent: function () {
            return JSON.stringify(this.buildStateObject());
        },

        broadcastNow: function (force) {
            if (!this.active || !this.connected) return;
            if (!this.dc || this.dc.readyState !== 'open') return;

            let content;
            try {
                content = this.buildContent();
            } catch (error) {
                console.error('[network] не удалось сериализовать состояние:', error);
                return;
            }

            const contentHash = hashString(content);
            if (!force && contentHash === this.lastSentHash) return;
            this.lastSentHash = contentHash;
            this.seq++;

            const state = this.buildStateObject();
            state.network = {
                active: true,
                side: this.side,
                mulliganTurn: this.mulliganTurn,
                seq: this.seq
            };

            this.send({ t: 'state', s: this.seq, st: state });
        },

        /** Можно ли отправлять состояние прямо сейчас (мы — активная сторона). */
        isAuthoritative: function () {
            const gameState = window.gameModule && window.gameModule.gameState;
            if (!gameState || !gameState.mulligan) return false;

            // Во время муллигана полные снапшоты не рассылаем — стороны
            // обмениваются только данными муллигана.
            if (gameState.mulligan.phase !== 'completed') return false;

            if (this.side === 'host' && gameState.gamePhase === 'roundEnd') {
                return true;
            }
            return gameState.gamePhase === 'playerTurn' && gameState.currentPlayer === 'player';
        },

        /** Мы сейчас совершаем ход — входящие снапшоты игнорируем. */
        isOurActiveTurn: function () {
            const gameState = window.gameModule && window.gameModule.gameState;
            if (!gameState || !gameState.mulligan) return false;

            if (gameState.mulligan.phase !== 'completed') {
                // До начала своего муллигана принимаем стартовый снапшот хоста,
                // во время своего муллигана — игнорируем.
                return this.mulliganStartedLocally;
            }
            return gameState.gamePhase === 'playerTurn' && gameState.currentPlayer === 'player';
        },

        applyRemoteState: function (message) {
            if (!message || !message.st) return;
            if (!this.connected) return;

            const raw = message.st;
            let rawContent;
            try {
                rawContent = JSON.stringify(raw);
            } catch (error) {
                return;
            }

            const incomingHash = hashString(rawContent);
            if (incomingHash === this.lastIncomingHash) return;
            this.lastIncomingHash = incomingHash;

            const networkInfo = raw.network || {};
            if (networkInfo.mulliganTurn) {
                this.mulliganTurn = networkInfo.mulliganTurn;
            }

            const incomingMulliganDone = !!(raw.mulligan && raw.mulligan.phase === 'completed');

            if (!incomingMulliganDone && this.isOurActiveTurn()) {
                // Мы — активная сторона, входящее состояние уже устарело.
                return;
            }

            const gameState = window.gameModule.gameState;
            const previousResultsLength = (gameState.roundResults || []).length;
            const previousRound = gameState.currentRound;
            const previousMulliganPhase = gameState.mulligan ? gameState.mulligan.phase : null;

            let mirrored;
            try {
                mirrored = mirrorState(raw);
            } catch (error) {
                console.error('[network] mirrorState:', error);
                return;
            }

            mirrored.network = {
                active: true,
                side: this.side,
                mulliganTurn: this.mulliganTurn,
                seq: message.s || 0
            };

            this.applying = true;
            try {
                if (window.playerModule && window.playerModule.cancelCardSelection) {
                    try { window.playerModule.cancelCardSelection(); } catch (error) {}
                }
                STATE_KEYS.forEach(function (key) {
                    if (mirrored[key] !== undefined) {
                        gameState[key] = mirrored[key];
                    }
                });
                gameState.network = mirrored.network;
                gameState.selectedCard = null;
                gameState.selectedCardElement = null;
                gameState.selectingRow = false;
                HANDLER_ARRAY_KEYS.forEach(function (key) { gameState[key] = []; });
                HANDLER_VALUE_KEYS.forEach(function (key) { delete gameState[key]; });
            } finally {
                this.applying = false;
            }

            this.lastSentHash = hashString(this.buildContent());

            // Гость инициализирует фракционные способности по полученному состоянию.
            if (this.side === 'guest' && !this.factionAbilitiesReady &&
                gameState.player.faction && window.factionAbilitiesModule &&
                window.factionAbilitiesModule.init) {
                try {
                    window.factionAbilitiesModule.init(gameState);
                    this.factionAbilitiesReady = true;
                } catch (error) {
                    console.warn('[network] factionAbilities.init:', error);
                }
            }

            this.mulliganStartedLocally = false;
            this.hideWaiting();
            this.renderAll();
            this.updateLocalTurnUI();
            this.handlePostApply(previousResultsLength, previousRound, previousMulliganPhase);
        },

        handlePostApply: function (previousResultsLength, previousRound, previousMulliganPhase) {
            const gameState = window.gameModule.gameState;

            if (this.side === 'host') {
                // Гость завершил раунд (оба пасанули / таймаут) — считаем результат у хоста.
                if (!this.roundEndScheduled && !this.roundEndTriggered &&
                    (gameState.gamePhase === 'roundEnd' || gameState.roundLossDueToTimeout)) {
                    this.roundEndScheduled = true;
                    setTimeout(() => {
                        this.roundEndScheduled = false;
                        if (!this.active) return;
                        window.gameModule.endRound();
                    }, 600);
                }
                return;
            }

            // Гость: показываем старт раунда, когда хост завершил муллигану.
            if (previousMulliganPhase !== 'completed' &&
                gameState.mulligan && gameState.mulligan.phase === 'completed' &&
                !this.roundStartShown) {
                this.roundStartShown = true;
                window.gameModule.showRoundStartMessage('РАУНД ' + gameState.currentRound);
            }

            // Гость: показываем результат раунда, когда хост его посчитал.
            const results = gameState.roundResults || [];
            if (results.length > this.lastResultShownCount) {
                this.lastResultShownCount = results.length;
                const winner = results[results.length - 1];
                const playerScore = window.gameModule.calculateTotalScore('player');
                const opponentScore = window.gameModule.calculateTotalScore('opponent');
                window.gameModule.showRoundResult(winner, playerScore, opponentScore);
            }

            if (gameState.currentRound !== previousRound) {
                this.roundStartShown = false;
                window.gameModule.showRoundStartMessage('РАУНД ' + gameState.currentRound);
            }

            if (!this.endGameScheduled &&
                (gameState.roundsWon.player >= 2 || gameState.roundsWon.opponent >= 2)) {
                this.endGameScheduled = true;
                setTimeout(() => {
                    if (!this.active || this.endGameShown) return;
                    this.endGameShown = true;
                    window.gameModule.endGame();
                }, 3500);
            }
        },

        // -----------------------------------------------------------------
        // Отрисовка
        // -----------------------------------------------------------------

        renderAll: function () {
            const game = window.gameModule;
            if (!game) return;
            const gameState = game.gameState;

            const safe = (fn) => {
                try { fn(); } catch (error) { console.warn('[network] render:', error); }
            };

            safe(() => game.displayPlayerDeck());
            safe(() => game.displayOpponentDeck());
            safe(() => game.displayPlayerDiscard());
            safe(() => game.displayOpponentDiscard());
            safe(() => game.displayWeatherCards());
            safe(() => game.displayPlayerHand());

            ['close', 'ranged', 'siege'].forEach((row) => {
                safe(() => game.redrawRow(row, 'player'));
                safe(() => game.redrawRow(row, 'opponent'));

                safe(() => {
                    const playerTactics = document.getElementById('player' + capitalize(row) + 'Tactics');
                    if (playerTactics) playerTactics.innerHTML = '';
                    if (gameState.player.rows[row].tactic) {
                        game.redrawTacticCard(gameState.player.rows[row].tactic, row, 'player');
                    }
                });
                safe(() => {
                    const opponentTactics = document.getElementById('opponent' + capitalize(row) + 'Tactics');
                    if (opponentTactics) opponentTactics.innerHTML = '';
                    if (gameState.opponent.rows[row].tactic) {
                        game.redrawTacticCard(gameState.opponent.rows[row].tactic, row, 'opponent');
                    }
                });
            });

            safe(() => this.renderLeaders());
            safe(() => game.updateTotalScoreDisplays());
            safe(() => game.updateTurnIndicator());
            safe(() => game.updateControlButtons());
            safe(() => game.updateCrownIndicators());
            safe(() => game.updateWinsIndicator && game.updateWinsIndicator());
            safe(() => {
                if (window.boardModule && window.boardModule.updateAbilityAvailability) {
                    window.boardModule.updateAbilityAvailability(gameState);
                }
            });
            safe(() => this.ensureAbilityIcon());
        },

        renderLeaders: function () {
            const game = window.gameModule;
            const playerSlot = document.getElementById('playerLeader');
            const opponentSlot = document.getElementById('opponentLeader');

            if (playerSlot && !playerSlot.querySelector('.leader-card-on-board')) {
                game.setupPlayerLeader();
            }
            if (opponentSlot && !opponentSlot.querySelector('.leader-card-on-board')) {
                game.setupOpponentLeader();
            }
        },

        ensureAbilityIcon: function () {
            const gameState = window.gameModule.gameState;
            if (!gameState.player.faction || !gameState.player.ability) return;

            const signature = gameState.player.faction + '|' + gameState.player.ability;
            if (signature === this.abilitySig) return;
            this.abilitySig = signature;

            if (window.boardModule && window.boardModule.initAbilityIcon) {
                window.boardModule.initAbilityIcon();
            }
        },

        updateLocalTurnUI: function () {
            const game = window.gameModule;
            const gameState = game.gameState;
            if (!gameState || !gameState.mulligan) return;

            const mulliganDone = gameState.mulligan.phase === 'completed';
            const myTurn = mulliganDone &&
                gameState.gamePhase === 'playerTurn' &&
                gameState.currentPlayer === 'player' &&
                !gameState.player.passed;

            if (window.boardModule && window.boardModule.updateControlsVisibility) {
                window.boardModule.updateControlsVisibility(myTurn);
            }

            if (myTurn) {
                if (!gameState.turnTimer.active) game.startTurnTimer();
            } else {
                game.stopTurnTimer();
            }

            game.updateTurnIndicator();
            game.updateControlButtons();

            if (window.boardModule && window.boardModule.updateAbilityAvailability) {
                window.boardModule.updateAbilityAvailability(gameState);
            }

            if (myTurn && !this.wasMyTurn) {
                game.showGameMessage('Ваш ход', 'info');
            } else if (!myTurn && this.wasMyTurn && mulliganDone) {
                game.showGameMessage('Ход соперника', 'warning');
            }
            this.wasMyTurn = myTurn;
        },

        // -----------------------------------------------------------------
        // Периодическая синхронизация (страховка для сложных способностей)
        // -----------------------------------------------------------------

        startTick: function () {
            if (this.tickTimer) return;
            this.tickTimer = setInterval(() => {
                if (!this.active || !this.connected) return;
                if (this.applying) return;
                if (!this.isAuthoritative()) return;
                this.broadcastNow(false);
            }, 250);
        },

        // -----------------------------------------------------------------
        // Оверлеи
        // -----------------------------------------------------------------

        showWaiting: function (text) {
            if (!this.waitingEl) {
                const overlay = document.createElement('div');
                overlay.className = 'network-waiting';
                overlay.id = 'networkWaiting';
                overlay.innerHTML = `
                    <div class="network-waiting-box">
                        <div class="network-spinner"></div>
                        <div class="network-waiting-text" id="networkWaitingText"></div>
                    </div>
                `;
                document.body.appendChild(overlay);
                this.waitingEl = overlay;
            }
            const label = this.waitingEl.querySelector('#networkWaitingText');
            if (label) label.textContent = text || 'Ожидание соперника…';
            this.waitingEl.classList.remove('hidden');
        },

        hideWaiting: function () {
            if (!this.waitingEl) return;
            this.waitingEl.classList.add('hidden');
        },

        showBadge: function () {
            if (this.badgeEl) {
                this.badgeEl.classList.remove('hidden');
                return;
            }
            const badge = document.createElement('div');
            badge.className = 'network-badge';
            badge.id = 'networkBadge';
            badge.innerHTML = `
                <span class="network-badge-dot"></span>
                <span class="network-badge-label">СЕТЕВОЙ РЕЖИМ · ${this.side === 'host' ? 'ХОСТ' : 'ГОСТЬ'}</span>
                <button class="network-badge-leave" id="networkLeaveBtn">ВЫЙТИ</button>
            `;
            document.body.appendChild(badge);
            this.badgeEl = badge;

            const leave = badge.querySelector('#networkLeaveBtn');
            if (leave) {
                leave.addEventListener('click', () => {
                    if (window.confirm('Выйти из сетевой игры?')) {
                        this.leave();
                        window.location.reload();
                    }
                });
            }
        },

        leave: function () {
            try { this.send({ t: 'bye' }); } catch (error) {}
            this.active = false;
            this.connected = false;
            if (this.tickTimer) {
                clearInterval(this.tickTimer);
                this.tickTimer = null;
            }
            this.resetPeer();
        },

        // -----------------------------------------------------------------
        // Патчи игрового движка
        // -----------------------------------------------------------------

        installHooks: function () {
            const self = this;
            const game = window.gameModule;
            const originals = this._originals;

            if (!game) {
                console.error('[network] gameModule не найден');
                return;
            }

            originals.init = game.init;
            originals.loadOpponentDeck = game.loadOpponentDeck;
            originals.startCoinToss = game.startCoinToss;
            originals.startMulliganPhase = game.startMulliganPhase;
            originals.completePlayerMulligan = game.completePlayerMulligan;
            originals.completeMulliganPhase = game.completeMulliganPhase;
            originals.startPlayerTurn = game.startPlayerTurn;
            originals.startOpponentTurn = game.startOpponentTurn;
            originals.handleTurnEnd = game.handleTurnEnd;
            originals.completeCardPlay = game.completeCardPlay;
            originals.endRound = game.endRound;
            originals.startNewRoundAfterDelay = game.startNewRoundAfterDelay;
            originals.handleTimeExpired = game.handleTimeExpired;
            originals.useLeaderAbility = game.useLeaderAbility;
            originals.redeckGame = game.redeckGame;
            originals.returnToMainMenu = game.returnToMainMenu;

            // --- init ---
            game.init = function () {
                if (self.side === 'guest' && self.connected) {
                    return self.initGuestGame();
                }
                return originals.init.apply(this, arguments);
            };

            // --- Колода соперника ---
            game.loadOpponentDeck = function () {
                if (self.active && self.side === 'host' && self.remoteDeck) {
                    const deck = self.remoteDeck;
                    this.gameState.opponent.deck = this.shuffleArray([...(deck.cards || [])]);
                    this.gameState.opponent.faction = deck.faction || null;
                    this.gameState.opponent.ability = deck.ability || null;
                    this.displayOpponentDeck();
                    return;
                }
                return originals.loadOpponentDeck.apply(this, arguments);
            };

            // --- Монетка: бросок выполняет хост, гость повторяет анимацию ---
            game.startCoinToss = function () {
                if (!self.active) return originals.startCoinToss.apply(this, arguments);
                if (self.side !== 'host') return;

                self.pendingCoinToss = true;
                self.tryStartCoinToss();
            };

            // --- Муллиган (одновременный) ---
            game.startMulliganPhase = function () {
                if (!self.active) return originals.startMulliganPhase.apply(this, arguments);

                if (self.side === 'guest') {
                    self.localCoinDone = true;
                    if (!self.mulliganStartReceived) return;
                }

                if (!self.beginSyncedMulligan()) return;
                self.hideWaiting();

                self.roundEndTriggered = false;
                self.roundEndScheduled = false;
                self.lastResultShownCount = (this.gameState.roundResults || []).length;
                self.endGameScheduled = false;
                self.endGameShown = false;
                self.wasMyTurn = false;

                const result = originals.startMulliganPhase.apply(this, arguments);

                if (self.side === 'host') {
                    // Стартовый снапшот: у гостя появляются руки, колоды и лидеры.
                    self.broadcastNow(true);
                    self.send({ t: 'mulligan-start' });
                }
                return result;
            };

            game.completePlayerMulligan = function () {
                if (!self.active) return originals.completePlayerMulligan.apply(this, arguments);

                const mulliganState = this.gameState.mulligan.player;
                if (mulliganState.available > 0 && mulliganState.cards.length !== 0) {
                    this.replaceMulliganCards('player');
                }

                this.removeMulliganInterface();
                this.gameState.mulligan.phase = 'waiting';
                self.mulliganStartedLocally = false;

                const data = self.snapshotOwnSide();

                if (self.side === 'host') {
                    self.mulliganHostDone = true;
                    self.mulliganHostData = data;
                    if (!self.mulliganGuestDone) {
                        self.showWaiting('Ожидание выбора соперника…');
                    }
                    self.tryCompleteSyncedMulligan();
                } else {
                    self.mulliganGuestDone = true;
                    self.send({ t: 'mulligan-done', data: data });
                    self.showWaiting('Ожидание соперника…');
                }

                self.updateLocalTurnUI();
            };

            game.completeMulliganPhase = function () {
                if (!self.active) return originals.completeMulliganPhase.apply(this, arguments);
                if (self.side !== 'host') return;
                if (self.mulliganCompleteHandled) return;

                self.mulliganCompleteHandled = true;
                self.mulliganTurn = 'done';
                const result = originals.completeMulliganPhase.apply(this, arguments);
                self.hideWaiting();
                self.broadcastNow(true);
                return result;
            };

            // --- Ходы ---
            game.startPlayerTurn = function () {
                const result = originals.startPlayerTurn.apply(this, arguments);
                if (self.active) self.broadcastNow(false);
                return result;
            };

            game.startOpponentTurn = function () {
                if (!self.active) return originals.startOpponentTurn.apply(this, arguments);

                this.gameState.gamePhase = 'opponentTurn';
                this.gameState.currentPlayer = 'opponent';
                this.gameState.cardsPlayedThisTurn = 0;
                this.stopTurnTimer();

                if (window.boardModule && window.boardModule.updateControlsVisibility) {
                    window.boardModule.updateControlsVisibility(false);
                }
                if (window.boardModule && window.boardModule.updateAbilityAvailability) {
                    window.boardModule.updateAbilityAvailability(this.gameState);
                }

                this.updateTurnIndicator();
                this.updateControlButtons();
                this.showGameMessage('Ход соперника', 'warning');
                if (window.audioManager && window.audioManager.playSound) {
                    window.audioManager.playSound('warning');
                }

                self.broadcastNow(false);
            };

            game.handleTurnEnd = function () {
                const result = originals.handleTurnEnd.apply(this, arguments);
                if (self.active) self.broadcastNow(false);
                return result;
            };

            game.completeCardPlay = function () {
                const result = originals.completeCardPlay.apply(this, arguments);
                if (self.active) self.broadcastNow(false);
                return result;
            };

            // --- Раунды: считает только хост ---
            game.endRound = function () {
                if (!self.active) return originals.endRound.apply(this, arguments);
                if (self.side !== 'host') return;
                if (self.roundEndTriggered) return;

                self.roundEndTriggered = true;
                const result = originals.endRound.apply(this, arguments);
                self.broadcastNow(true);
                return result;
            };

            game.startNewRoundAfterDelay = function () {
                if (!self.active) return originals.startNewRoundAfterDelay.apply(this, arguments);
                if (self.side !== 'host') return;
                if (self.startingRound) return;

                self.startingRound = true;
                self.roundEndTriggered = false;
                self.roundEndScheduled = false;
                const result = originals.startNewRoundAfterDelay.apply(this, arguments);
                self.startingRound = false;
                self.broadcastNow(true);
                return result;
            };

            game.handleTimeExpired = function () {
                const result = originals.handleTimeExpired.apply(this, arguments);
                if (self.active) self.broadcastNow(true);
                return result;
            };

            game.useLeaderAbility = function () {
                const result = originals.useLeaderAbility.apply(this, arguments);
                if (self.active) self.broadcastNow(false);
                return result;
            };

            game.redeckGame = function () {
                if (self.isNetworkSession()) {
                    // Оба игрока одновременно возвращаются к сборке колоды,
                    // соединение при этом не разрывается.
                    self.beginRedeckFlow();
                    return;
                }
                return originals.redeckGame.apply(this, arguments);
            };

            game.returnToMainMenu = function () {
                if (self.connected) {
                    try { self.send({ t: 'bye' }); } catch (error) {}
                }
                return originals.returnToMainMenu.apply(this, arguments);
            };

            // --- Игрок: пас ---
            if (window.playerModule && window.playerModule.handlePass) {
                const originalPass = window.playerModule.handlePass;
                window.playerModule.handlePass = function () {
                    const result = originalPass.apply(this, arguments);
                    if (self.active) self.broadcastNow(false);
                    return result;
                };
            }

            // --- ИИ полностью отключаем в сетевой игре ---
            if (window.aiModule && window.aiModule.makeMove) {
                const originalMakeMove = window.aiModule.makeMove;
                window.aiModule.makeMove = function () {
                    if (self.active) return;
                    return originalMakeMove.apply(this, arguments);
                };
            }

            // --- Прощание при закрытии вкладки ---
            window.addEventListener('pagehide', function () {
                if (self.active || self.connected) {
                    try { self.send({ t: 'bye' }); } catch (error) {}
                }
            });

            this.startTick();
        },

        /** Инициализация доски у гостя (без загрузки своих колод и без ИИ). */
        initGuestGame: function () {
            const game = window.gameModule;
            this.active = true;
            this.side = 'guest';

            game.loadSettings();
            game.updateGameSettings();
            game.createTotalScoreDisplays();
            game.createTimerDisplay();
            game.createCrownIndicators();
            game.setupEventListeners();

            if (window.playerModule) window.playerModule.init(game.gameState);
            if (window.aiModule) window.aiModule.init(game.gameState);

            game.gameState.network = {
                active: true,
                side: 'guest',
                mulliganTurn: this.mulliganTurn,
                seq: this.seq
            };

            this.showWaiting('Ожидание данных от хоста…');

            // Доска и игровые модули готовы — разрешаем хосту начать монетку.
            this.send({ t: 'board-ready' });

            setTimeout(() => {
                if (!this.pendingState) return;
                const message = this.pendingState;
                this.pendingState = null;
                this.applyRemoteState(message);
            }, 150);
        }
    };

    window.networkModule = networkModule;
    networkModule.installHooks();
})();
