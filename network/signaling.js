(function () {
    'use strict';

    // ---------------------------------------------------------------------
    // Сигнализация через бесплатный публичный сервис ntfy.sh.
    //
    // Сервер не нужен: ntfy.sh — это открытый pub/sub-сервис, который
    // работает по HTTPS/WSS и не требует регистрации. Комната — это
    // случайный код, который одновременно является именем темы.
    //
    // Схема:
    //   хост   -> публикует offer  в тему  gwent-v1-<код>-o
    //   гость  -> слушает  offer  из темы  gwent-v1-<код>-o
    //   гость  -> публикует answer в тему  gwent-v1-<код>-a
    //   хост   -> слушает  answer из темы  gwent-v1-<код>-a
    //
    // Трафик игры идёт напрямую между игроками по WebRTC, ntfy.sh
    // используется только для обмена параметрами соединения.
    // ---------------------------------------------------------------------

    const HTTP_BASE = 'https://ntfy.sh';
    const WS_BASE = 'wss://ntfy.sh';
    const TOPIC_PREFIX = 'gwent-v1';

    // ntfy.sh принимает текстовые сообщения до 4096 байт. Оставляем запас
    // на JSON-обёртку и экранирование.
    const CHUNK_SIZE = 1600;

    // Сообщения старше этого возраста в кэше темы считаем «прошлой сессией».
    const MAX_AGE_MS = 60 * 60 * 1000;

    // Без похожих символов (0/O, 1/I/L), чтобы код было легко продиктовать.
    const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

    function randomString(length) {
        const bytes = new Uint8Array(length);
        if (window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(bytes);
        } else {
            for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
        }
        let result = '';
        for (let i = 0; i < length; i++) {
            result += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
        }
        return result;
    }

    function generateCode(length) {
        return randomString(length || 6);
    }

    function normalizeCode(raw) {
        return String(raw || '')
            .toUpperCase()
            .replace(/[^0-9A-Z]/g, '');
    }

    function topicFor(code, kind) {
        return TOPIC_PREFIX + '-' + code + '-' + kind;
    }

    function SignalingChannel(options) {
        options = options || {};
        this.code = normalizeCode(options.code);
        this.role = options.role === 'host' ? 'host' : 'guest';
        this.onMessage = typeof options.onMessage === 'function' ? options.onMessage : function () {};
        this.onStatus = typeof options.onStatus === 'function' ? options.onStatus : function () {};

        // Хост принимает ответы и публикует приглашение; гость наоборот.
        this.inboxKind = this.role === 'host' ? 'a' : 'o';
        this.outboxKind = this.role === 'host' ? 'o' : 'a';

        this.ws = null;
        this.closed = false;
        this.startedAt = Date.now();
        this.reconnectDelay = 600;
        this.reconnectTimer = null;
        this.chunks = {};
        this.publishQueue = Promise.resolve();
    }

    SignalingChannel.prototype.start = function () {
        this.connect();
    };

    SignalingChannel.prototype.connect = function () {
        if (this.closed) return;
        const topic = topicFor(this.code, this.inboxKind);
        const url = WS_BASE + '/' + encodeURIComponent(topic) + '/ws?since=all';

        let socket;
        try {
            socket = new WebSocket(url);
        } catch (error) {
            this.onStatus('error', error);
            this.scheduleReconnect();
            return;
        }

        this.ws = socket;

        socket.addEventListener('open', () => {
            if (this.ws !== socket) return;
            this.reconnectDelay = 600;
            this.onStatus('open');
        });

        socket.addEventListener('message', (event) => {
            if (this.ws !== socket) return;
            this.handleRawMessage(event.data);
        });

        socket.addEventListener('error', () => {
            // Подробностей браузер не даёт; закроется следом.
        });

        socket.addEventListener('close', () => {
            if (this.ws !== socket) return;
            this.ws = null;
            if (this.closed) return;
            this.onStatus('closed');
            this.scheduleReconnect();
        });
    };

    SignalingChannel.prototype.scheduleReconnect = function () {
        if (this.closed || this.reconnectTimer) return;
        const delay = this.reconnectDelay;
        this.reconnectDelay = Math.min(this.reconnectDelay * 1.7, 6000);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
        }, delay);
    };

    SignalingChannel.prototype.handleRawMessage = function (raw) {
        let envelope;
        try {
            envelope = JSON.parse(raw);
        } catch (error) {
            return;
        }
        if (!envelope || envelope.event !== 'message' || !envelope.message) return;

        const time = (Number(envelope.time) || 0) * 1000;
        if (time && time < this.startedAt - MAX_AGE_MS) return;

        let packet;
        try {
            packet = JSON.parse(envelope.message);
        } catch (error) {
            return;
        }
        if (!packet || packet.k !== 'gw' || !packet.sid) return;

        const total = Math.max(1, Number(packet.n) || 1);
        const index = Number(packet.i) || 0;
        if (index < 0 || index >= total) return;

        let entry = this.chunks[packet.sid];
        if (!entry) {
            entry = this.chunks[packet.sid] = {
                parts: new Array(total),
                received: 0,
                total: total,
                time: time
            };
        }
        if (entry.parts[index] !== undefined) return;

        entry.parts[index] = String(packet.d == null ? '' : packet.d);
        entry.received++;

        if (entry.received < entry.total) return;
        delete this.chunks[packet.sid];

        let payload;
        try {
            payload = JSON.parse(entry.parts.join(''));
        } catch (error) {
            console.warn('[signaling] не удалось разобрать сообщение:', error);
            return;
        }
        this.onMessage(payload);
    };

    /**
     * Публикует объект в исходящую тему. Большие объекты (SDP) режутся
     * на части: ntfy.sh не принимает текст длиннее 4096 байт.
     */
    SignalingChannel.prototype.publish = function (payload) {
        if (this.closed) return Promise.reject(new Error('Канал сигнализации закрыт'));

        const topic = topicFor(this.code, this.outboxKind);
        const url = HTTP_BASE + '/' + encodeURIComponent(topic);
        const sid = randomString(10);
        const json = JSON.stringify(payload);
        const parts = [];

        for (let i = 0; i < json.length; i += CHUNK_SIZE) {
            parts.push(json.slice(i, i + CHUNK_SIZE));
        }

        const send = () => parts.reduce((chain, data, index) => {
            return chain.then(() => fetch(url, {
                method: 'POST',
                body: JSON.stringify({ k: 'gw', sid: sid, i: index, n: parts.length, d: data })
            }).then((response) => {
                if (!response.ok) throw new Error('ntfy.sh ответил ' + response.status);
            }));
        }, Promise.resolve());

        // Не отправляем несколько публикаций одновременно.
        this.publishQueue = this.publishQueue.then(send, send);
        return this.publishQueue;
    };

    SignalingChannel.prototype.close = function () {
        this.closed = true;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            try { this.ws.close(); } catch (error) {}
            this.ws = null;
        }
        this.chunks = {};
    };

    window.networkSignaling = {
        generateCode: generateCode,
        normalizeCode: normalizeCode,
        createChannel: function (options) {
            return new SignalingChannel(options);
        }
    };
})();
