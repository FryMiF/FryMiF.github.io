(function () {
    'use strict';

    const STR = {
        title: '\u65B9\u5757\u95EF\u5173\uFF1A\u8DF3\u8DC3\u5192\u9669',
        subtitle: '\u539F\u521B\u6A2A\u7248\u95EF\u5173\uFF0C\u8DD1\u8DF3\u3001\u8E29\u602A\u3001\u6536\u96C6\u91D1\u5E01\uFF0C\u5230\u8FBE\u7EC8\u70B9\u5373\u8FC7\u5173\u3002',
        rulesTitle: '\u73A9\u6CD5\u8BF4\u660E\uFF08\u8BF7\u5148\u770B\u8FD9\u91CC\uFF09',
        rules: [
            ['\u76EE\u6807\uFF1A', '\u6536\u96C6\u91D1\u5E01\u5E76\u5230\u8FBE\u7EC8\u70B9\u65D7\u5E1C\u3002'],
            ['\u79FB\u52A8\uFF1A', 'A/D \u6216 \u2190/\u2192\uFF1B\u8DF3\u8DC3\uFF1AW/\u2191/\u7A7A\u683C\u3002'],
            ['\u52A0\u901F\uFF1A', 'Shift \u6216 \u89E6\u6478\u6309\u94AE\u3002'],
            ['\u8E29\u602A\uFF1A', '\u4ECE\u4E0A\u65B9\u843D\u4E0B\u53EF\u6D88\u706D\u654C\u4EBA\uFF0C\u4FA7\u9762\u78B0\u649E\u4F1A\u6389\u751F\u547D\u3002'],
            ['\u64CD\u4F5C\uFF1A', 'P \u6682\u505C\uFF0CR \u91CD\u65B0\u5F00\u59CB\u3002'],
            ['\u7ED3\u7B97\u5FEB\u6377\u952E\uFF1A', '\u80DC\u5229 Enter \u4E0B\u4E00\u5173\uFF1B\u5931\u8D25 R \u518D\u6765\u4E00\u6B21\uFF1BEsc \u8FD4\u56DE\u9996\u9875\u3002'],
        ],
        overlayPausedTitle: '\u6682\u505C',
        overlayPausedSub: '\u6309 P \u6216 Enter \u7EE7\u7EED',
        overlayWinTitle: '\u901A\u5173\u6210\u529F\uFF01',
        overlayLoseTitle: '\u95EF\u5173\u5931\u8D25',
        overlayNext: '\u4E0B\u4E00\u5173',
        overlayRetry: '\u518D\u6765\u4E00\u6B21',
        overlayResume: '\u7EE7\u7EED',
        overlayBack: '\u8FD4\u56DE\u9996\u9875',
        btnPause: '\u6682\u505C',
        btnRestart: '\u91CD\u65B0\u5F00\u59CB',
        touchNote: '\u89E6\u6478\u63A7\u5236\uFF1A\u6309\u4F4F\u65B9\u5411\u952E\u79FB\u52A8\uFF0C\u70B9\u51FB\u2191 \u8DF3\u8DC3',
        statTime: '\u7528\u65F6\uFF1A',
        statCoins: '\u91D1\u5E01\uFF1A',
    };

    const $ = (id) => document.getElementById(id);

    const el = {
        title: $('platformer-title'),
        rules: $('platformer-rules'),
        canvas: $('platformer-canvas'),
        overlay: $('platformer-overlay'),
        overlayTitle: $('overlay-title'),
        overlaySub: $('overlay-subtitle'),
        overlayPrimary: $('overlay-primary-btn'),
        overlaySecondary: $('overlay-secondary-btn'),
        overlayHint: $('overlay-hint'),
        pauseBtn: $('pause-btn'),
        restartBtn: $('restart-btn'),
        level: $('level-display'),
        coins: $('coins-display'),
        coinsTotal: $('coins-total-display'),
        lives: $('lives-display'),
        time: $('time-display'),
        touch: $('platformer-touch'),
        touchNote: $('platformer-touch-note'),
    };

    function setText(node, text) {
        if (!node) return;
        node.textContent = text;
    }

    function pad2(n) {
        return String(n).padStart(2, '0');
    }

    function formatTime(t) {
        const ms = Math.max(0, Math.floor(t * 1000));
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        const tenths = Math.floor((ms % 1000) / 100);
        return `${pad2(min)}:${pad2(sec)}.${tenths}`;
    }

    function clamp(v, a, b) {
        return Math.max(a, Math.min(b, v));
    }

    function moveTowards(v, target, maxDelta) {
        const d = target - v;
        if (Math.abs(d) <= maxDelta) return target;
        return v + Math.sign(d) * maxDelta;
    }

    function aabb(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function initUI() {
        setText(el.title, STR.title);
        document.title = `${STR.title} - \u8FF7\u4F60\u6E38\u620F\u5408\u96C6`;

        if (el.rules) {
            const icon = '<i class="fas fa-scroll" aria-hidden="true"></i>';
            const items = STR.rules.map(([k, v]) => `<li><strong>${k}</strong>${v}</li>`).join('');
            el.rules.classList.add('platformer-rules');
            el.rules.innerHTML = `<h3>${icon}${STR.rulesTitle}</h3><p>${STR.subtitle}</p><ul>${items}</ul>`;
        }

        setText(el.pauseBtn, STR.btnPause);
        setText(el.restartBtn, STR.btnRestart);
        setText(el.touchNote, STR.touchNote);
    }

    initUI();

    const canvas = el.canvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 960;
    const H = 540;
    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const input = {
        left: false,
        right: false,
        jumpHeld: false,
        jumpPressed: false,
        sprint: false,
        pausePressed: false,
    };

    function bindInput() {
        window.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            const code = e.code;
            if (code === 'ArrowLeft' || code === 'KeyA') input.left = true;
            if (code === 'ArrowRight' || code === 'KeyD') input.right = true;
            if (code === 'ArrowUp' || code === 'KeyW' || code === 'Space') { input.jumpHeld = true; input.jumpPressed = true; }
            if (code === 'ShiftLeft' || code === 'ShiftRight') input.sprint = true;
            if (code === 'KeyP') input.pausePressed = true;
            if (code === 'KeyR') onRestartHotkey();
            if (code === 'Escape') onEscapeHotkey();
            if (code === 'Enter') onEnterHotkey();
        }, { passive: true });

        window.addEventListener('keyup', (e) => {
            const code = e.code;
            if (code === 'ArrowLeft' || code === 'KeyA') input.left = false;
            if (code === 'ArrowRight' || code === 'KeyD') input.right = false;
            if (code === 'ArrowUp' || code === 'KeyW' || code === 'Space') input.jumpHeld = false;
            if (code === 'ShiftLeft' || code === 'ShiftRight') input.sprint = false;
        }, { passive: true });

        if (!el.touch) return;
        el.touch.querySelectorAll('[data-action]').forEach((btn) => {
            const action = btn.getAttribute('data-action');
            if (!action) return;
            const down = (ev) => {
                ev.preventDefault();
                if (action === 'left') input.left = true;
                if (action === 'right') input.right = true;
                if (action === 'jump') { input.jumpHeld = true; input.jumpPressed = true; }
                if (action === 'sprint') input.sprint = true;
                if (action === 'pause') input.pausePressed = true;
            };
            const up = (ev) => {
                ev.preventDefault();
                if (action === 'left') input.left = false;
                if (action === 'right') input.right = false;
                if (action === 'jump') input.jumpHeld = false;
                if (action === 'sprint') input.sprint = false;
                if (action === 'pause') input.pausePressed = false;
            };
            btn.addEventListener('pointerdown', down, { passive: false });
            btn.addEventListener('pointerup', up, { passive: false });
            btn.addEventListener('pointercancel', up, { passive: false });
            btn.addEventListener('pointerleave', up, { passive: false });
        });
    }

    bindInput();

    const PHYS = {
        gravity: 2200,
        maxFall: 1400,
        runSpeed: 360,
        sprintSpeed: 480,
        accelGround: 2600,
        accelAir: 1700,
        decelGround: 3000,
        decelAir: 900,
        jumpVel: 780,
        stompBounce: 420,
        coyote: 0.09,
        jumpBuffer: 0.12,
        invincible: 1.0,
    };

    const COLORS = {
        skyTop: '#8fd7ff',
        skyBottom: '#ecf8ff',
        ground: '#2ecc71',
        dirt: '#a06b42',
        platform: 'rgba(52,152,219,0.18)',
        platformEdge: 'rgba(0,0,0,0.16)',
        box: '#f1c40f',
        boxEmpty: 'rgba(241,196,15,0.45)',
        coin: '#f39c12',
        coinShine: '#fff3b0',
        player: '#34495e',
        enemy: '#e74c3c',
        spike: '#7f8c8d',
        goalPole: '#8e44ad',
        goalFlag: 'rgba(155,89,182,0.95)',
    };

    const LEVEL_DEFS = [
        {
            id: '1-1',
            width: 2600,
            height: 700,
            spawn: { x: 120, y: 420 },
            solids: [
                { x: 0, y: 520, w: 2600, h: 180, kind: 'ground' },
                { x: 260, y: 440, w: 160, h: 24, kind: 'plat' },
                { x: 520, y: 390, w: 160, h: 24, kind: 'plat' },
                { x: 880, y: 420, w: 160, h: 24, kind: 'plat' },
                { x: 1120, y: 360, w: 200, h: 24, kind: 'plat' },
                { x: 1500, y: 460, w: 200, h: 24, kind: 'plat' },
                { x: 1820, y: 410, w: 220, h: 24, kind: 'plat' },
                { x: 2140, y: 360, w: 220, h: 24, kind: 'plat' },
            ],
            boxes: [
                { x: 600, y: 350, w: 40, h: 40, hits: 1 },
                { x: 640, y: 350, w: 40, h: 40, hits: 1 },
                { x: 680, y: 350, w: 40, h: 40, hits: 1 },
                { x: 1200, y: 320, w: 40, h: 40, hits: 2 },
            ],
            coins: [
                { x: 310, y: 400 },
                { x: 360, y: 400 },
                { x: 570, y: 350 },
                { x: 920, y: 380 },
                { x: 1160, y: 320 },
                { x: 1540, y: 420 },
                { x: 1900, y: 370 },
                { x: 2220, y: 320 },
                { x: 2280, y: 320 },
            ],
            enemies: [
                { x: 760, y: 480, dir: -1 },
                { x: 1660, y: 480, dir: 1 },
            ],
            spikes: [
                { x: 980, y: 510, w: 90, h: 10 },
                { x: 1970, y: 510, w: 90, h: 10 },
            ],
            goal: { x: 2450, y: 430, w: 44, h: 90 },
        },
        {
            id: '1-2',
            width: 3000,
            height: 800,
            spawn: { x: 120, y: 420 },
            solids: [
                { x: 0, y: 540, w: 3000, h: 200, kind: 'ground' },
                { x: 280, y: 470, w: 140, h: 24, kind: 'plat' },
                { x: 520, y: 410, w: 140, h: 24, kind: 'plat' },
                { x: 760, y: 350, w: 180, h: 24, kind: 'plat' },
                { x: 1080, y: 420, w: 180, h: 24, kind: 'plat' },
                { x: 1320, y: 480, w: 140, h: 24, kind: 'plat' },
                { x: 1580, y: 420, w: 160, h: 24, kind: 'plat' },
                { x: 1840, y: 360, w: 180, h: 24, kind: 'plat' },
                { x: 2100, y: 300, w: 180, h: 24, kind: 'plat' },
                { x: 2360, y: 360, w: 180, h: 24, kind: 'plat' },
                { x: 2620, y: 420, w: 220, h: 24, kind: 'plat' },
            ],
            boxes: [
                { x: 820, y: 310, w: 40, h: 40, hits: 2 },
                { x: 860, y: 310, w: 40, h: 40, hits: 1 },
                { x: 900, y: 310, w: 40, h: 40, hits: 1 },
                { x: 2140, y: 260, w: 40, h: 40, hits: 3 },
            ],
            coins: [
                { x: 310, y: 430 },
                { x: 560, y: 370 },
                { x: 820, y: 280 },
                { x: 900, y: 280 },
                { x: 1100, y: 380 },
                { x: 1600, y: 380 },
                { x: 1860, y: 320 },
                { x: 2120, y: 260 },
                { x: 2380, y: 320 },
                { x: 2660, y: 380 },
                { x: 2720, y: 380 },
            ],
            enemies: [
                { x: 980, y: 500, dir: 1 },
                { x: 1400, y: 500, dir: -1 },
                { x: 2240, y: 500, dir: 1 },
            ],
            spikes: [
                { x: 1220, y: 530, w: 110, h: 10 },
                { x: 1710, y: 530, w: 110, h: 10 },
            ],
            goal: { x: 2860, y: 450, w: 44, h: 90 },
        },
    ];

    function cloneLevel(def) {
        const solids = def.solids.map((s) => ({ ...s }));
        const boxes = def.boxes.map((b) => ({ ...b, kind: 'box', bump: 0 }));
        const coins = def.coins.map((c) => ({ x: c.x, y: c.y, r: 11 }));
        const enemies = def.enemies.map((e) => ({
            x: e.x,
            y: e.y,
            w: 44,
            h: 30,
            vx: (e.dir || 1) * 90,
            vy: 0,
            onGround: false,
            alive: true,
        }));
        const spikes = def.spikes.map((s) => ({ ...s }));
        const goal = { ...def.goal };
        return {
            id: def.id,
            width: def.width,
            height: def.height,
            spawn: { ...def.spawn },
            solids: solids.concat(boxes),
            coins,
            enemies,
            spikes,
            goal,
        };
    }

    const player = {
        x: 0, y: 0, w: 34, h: 44,
        vx: 0, vy: 0,
        onGround: false,
        coyote: 0,
        jumpBuf: 0,
        prevY: 0,
        face: 1,
    };

    let levelIndex = 0;
    let level = null;
    let cameraX = 0;
    let time = 0;
    let hudT = 0;
    let coins = 0;
    let coinsTotal = 0;
    let lives = 3;
    let inv = 0;
    let mode = 'playing'; // playing | paused | win | dead

    function countTotalCoins(lv) {
        let total = lv.coins.length;
        lv.solids.forEach((s) => { if (s.kind === 'box') total += (s.hits || 0); });
        return total;
    }

    function loadLevel(idx, resetLives) {
        levelIndex = clamp(idx, 0, LEVEL_DEFS.length - 1);
        level = cloneLevel(LEVEL_DEFS[levelIndex]);
        time = 0;
        coins = 0;
        inv = 0;
        cameraX = 0;
        mode = 'playing';
        if (resetLives) lives = 3;
        coinsTotal = countTotalCoins(level);

        player.x = level.spawn.x;
        player.y = level.spawn.y;
        player.vx = 0;
        player.vy = 0;
        player.onGround = false;
        player.coyote = 0;
        player.jumpBuf = 0;
        player.face = 1;

        hideOverlay();
        updateHud(true);
    }

    function updateHud(force) {
        const t = performance.now();
        if (!force && t - hudT < 100) return;
        hudT = t;
        if (el.level) el.level.textContent = level ? level.id : '--';
        if (el.coins) el.coins.textContent = String(coins);
        if (el.coinsTotal) el.coinsTotal.textContent = String(coinsTotal);
        if (el.lives) el.lives.textContent = String(lives);
        if (el.time) el.time.textContent = formatTime(time);
    }

    function showOverlay(kind) {
        if (!el.overlay) return;
        el.overlay.classList.add('active');

        if (kind === 'paused') {
            setText(el.overlayTitle, STR.overlayPausedTitle);
            setText(el.overlaySub, STR.overlayPausedSub);
            setText(el.overlayPrimary, STR.overlayResume);
            setText(el.overlaySecondary, STR.overlayBack);
            setText(el.overlayHint, 'P / Enter');
            el.overlayPrimary.onclick = () => resume();
            el.overlaySecondary.onclick = () => backHome();
        } else if (kind === 'win') {
            setText(el.overlayTitle, STR.overlayWinTitle);
            setText(el.overlaySub, `${STR.statTime}${formatTime(time)}  \u00B7  ${STR.statCoins}${coins}/${coinsTotal}`);
            setText(el.overlayPrimary, STR.overlayNext);
            setText(el.overlaySecondary, STR.overlayBack);
            setText(el.overlayHint, 'Enter / R / Esc');
            el.overlayPrimary.onclick = () => nextLevel();
            el.overlaySecondary.onclick = () => backHome();
        } else if (kind === 'dead') {
            setText(el.overlayTitle, STR.overlayLoseTitle);
            setText(el.overlaySub, `${STR.statCoins}${coins}/${coinsTotal}  \u00B7  ${STR.statTime}${formatTime(time)}`);
            setText(el.overlayPrimary, STR.overlayRetry);
            setText(el.overlaySecondary, STR.overlayBack);
            setText(el.overlayHint, 'R / Esc');
            el.overlayPrimary.onclick = () => restart(true);
            el.overlaySecondary.onclick = () => backHome();
        }
    }

    function hideOverlay() {
        if (!el.overlay) return;
        el.overlay.classList.remove('active');
    }

    function pause() {
        if (mode !== 'playing') return;
        mode = 'paused';
        showOverlay('paused');
    }

    function resume() {
        if (mode !== 'paused') return;
        mode = 'playing';
        hideOverlay();
    }

    function restart(resetLives) {
        loadLevel(levelIndex, resetLives);
    }

    function nextLevel() {
        const next = (levelIndex + 1) % LEVEL_DEFS.length;
        loadLevel(next, false);
    }

    function backHome() {
        window.location.href = 'index.html';
    }

    function onRestartHotkey() {
        if (mode === 'win' || mode === 'dead') restart(true);
        else restart(false);
    }

    function onEscapeHotkey() {
        if (mode === 'paused' || mode === 'win' || mode === 'dead') backHome();
        else pause();
    }

    function onEnterHotkey() {
        if (mode === 'paused') resume();
        else if (mode === 'win') nextLevel();
    }

    if (el.pauseBtn) {
        el.pauseBtn.addEventListener('click', () => {
            if (mode === 'playing') pause();
            else if (mode === 'paused') resume();
        });
    }
    if (el.restartBtn) el.restartBtn.addEventListener('click', () => restart(mode !== 'playing'));

    function resolveX(body, solids) {
        for (let i = 0; i < solids.length; i++) {
            const s = solids[i];
            if (!aabb(body, s)) continue;
            if (body.vx > 0) body.x = s.x - body.w;
            else if (body.vx < 0) body.x = s.x + s.w;
            body.vx = 0;
        }
    }

    function resolveY(body, solids, onCeilHit) {
        body.onGround = false;
        for (let i = 0; i < solids.length; i++) {
            const s = solids[i];
            if (!aabb(body, s)) continue;
            if (body.vy > 0) {
                body.y = s.y - body.h;
                body.vy = 0;
                body.onGround = true;
            } else if (body.vy < 0) {
                body.y = s.y + s.h;
                body.vy = 0;
                if (onCeilHit) onCeilHit(s);
            }
        }
    }

    function pointOnSolid(px, py, solids) {
        for (let i = 0; i < solids.length; i++) {
            const s = solids[i];
            if (px >= s.x && px <= s.x + s.w && py >= s.y && py <= s.y + s.h) return true;
        }
        return false;
    }

    function bumpBox(box) {
        if (box.kind !== 'box') return;
        box.bump = 0.16;
        if (box.hits > 0) {
            box.hits -= 1;
            coins += 1;
        }
    }

    function updateBoxes(dt) {
        level.solids.forEach((s) => {
            if (s.kind !== 'box') return;
            if (s.bump > 0) s.bump = Math.max(0, s.bump - dt);
        });
    }

    function updatePlayer(dt) {
        player.prevY = player.y;

        const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
        if (dir) player.face = dir;

        const speed = input.sprint ? PHYS.sprintSpeed : PHYS.runSpeed;
        const accel = player.onGround ? PHYS.accelGround : PHYS.accelAir;
        const decel = player.onGround ? PHYS.decelGround : PHYS.decelAir;
        const targetVX = dir * speed;

        if (dir) player.vx = moveTowards(player.vx, targetVX, accel * dt);
        else player.vx = moveTowards(player.vx, 0, decel * dt);

        player.vy = clamp(player.vy + PHYS.gravity * dt, -2000, PHYS.maxFall);

        if (player.onGround) player.coyote = PHYS.coyote;
        else player.coyote = Math.max(0, player.coyote - dt);

        if (input.jumpPressed) player.jumpBuf = PHYS.jumpBuffer;
        else player.jumpBuf = Math.max(0, player.jumpBuf - dt);

        if (player.jumpBuf > 0 && player.coyote > 0) {
            player.vy = -PHYS.jumpVel;
            player.onGround = false;
            player.coyote = 0;
            player.jumpBuf = 0;
        }

        if (!input.jumpHeld && player.vy < -220) player.vy *= 0.85;

        player.x += player.vx * dt;
        player.x = clamp(player.x, 0, level.width - player.w);
        resolveX(player, level.solids);

        player.y += player.vy * dt;
        resolveY(player, level.solids, (hit) => bumpBox(hit));

        if (player.y > level.height + 200) onPlayerDie();
    }

    function updateCoins() {
        for (let i = level.coins.length - 1; i >= 0; i--) {
            const c = level.coins[i];
            const r = c.r;
            const box = { x: c.x - r, y: c.y - r, w: r * 2, h: r * 2 };
            if (aabb(player, box)) {
                coins += 1;
                level.coins.splice(i, 1);
            }
        }
    }

    function updateEnemies(dt) {
        level.enemies.forEach((e) => {
            if (!e.alive) return;
            e.vy = clamp(e.vy + PHYS.gravity * dt, -2000, PHYS.maxFall);
            e.x += e.vx * dt;
            resolveX(e, level.solids);
            e.y += e.vy * dt;
            resolveY(e, level.solids);

            if (e.onGround) {
                const aheadX = e.vx > 0 ? (e.x + e.w + 2) : (e.x - 2);
                const footY = e.y + e.h + 2;
                if (!pointOnSolid(aheadX, footY, level.solids)) e.vx *= -1;
            }

            if (e.x < 0) { e.x = 0; e.vx = Math.abs(e.vx); }
            if (e.x + e.w > level.width) { e.x = level.width - e.w; e.vx = -Math.abs(e.vx); }
        });
    }

    function playerEnemyCollisions() {
        if (inv > 0) return;
        for (let i = 0; i < level.enemies.length; i++) {
            const e = level.enemies[i];
            if (!e.alive) continue;
            if (!aabb(player, e)) continue;

            const prevBottom = player.prevY + player.h;
            const stomp = player.vy > 0 && prevBottom <= e.y + 6;
            if (stomp) {
                e.alive = false;
                player.vy = -PHYS.stompBounce;
            } else {
                onPlayerHit();
            }
        }
    }

    function playerHazardCollisions() {
        if (inv > 0) return;
        for (let i = 0; i < level.spikes.length; i++) {
            if (aabb(player, level.spikes[i])) { onPlayerHit(); return; }
        }
    }

    function playerGoalCollision() {
        if (mode !== 'playing') return;
        if (aabb(player, level.goal)) onWin();
    }

    function onWin() {
        mode = 'win';
        showOverlay('win');
    }

    function onPlayerHit() {
        lives -= 1;
        inv = PHYS.invincible;
        if (lives <= 0) { onPlayerDie(); return; }
        player.x = level.spawn.x;
        player.y = level.spawn.y;
        player.vx = 0;
        player.vy = 0;
        player.onGround = false;
        player.coyote = 0;
        player.jumpBuf = 0;
    }

    function onPlayerDie() {
        if (mode !== 'playing') return;
        mode = 'dead';
        showOverlay('dead');
    }

    function drawBackground() {
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, COLORS.skyTop);
        g.addColorStop(1, COLORS.skyBottom);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        // simple parallax dots
        const t = time * 10;
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        for (let i = 0; i < 40; i++) {
            const x = ((i * 160) - (cameraX * 0.12 + t)) % (W + 200);
            const y = 60 + (i * 37) % 180;
            ctx.beginPath();
            ctx.arc(x, y, 2.2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawSolid(s) {
        const x = s.x - cameraX;
        const bump = s.kind === 'box' && s.bump > 0 ? Math.sin((s.bump / 0.16) * Math.PI) * -10 : 0;
        const y = s.y + bump;

        if (s.kind === 'ground') {
            ctx.fillStyle = COLORS.dirt;
            ctx.fillRect(x, y, s.w, s.h);
            ctx.fillStyle = COLORS.ground;
            ctx.fillRect(x, y, s.w, 24);
            return;
        }

        if (s.kind === 'box') {
            ctx.fillStyle = s.hits > 0 ? COLORS.box : COLORS.boxEmpty;
            ctx.fillRect(x, y, s.w, s.h);
            ctx.strokeStyle = 'rgba(0,0,0,0.20)';
            ctx.strokeRect(x + 0.5, y + 0.5, s.w - 1, s.h - 1);
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.fillRect(x + 6, y + 6, s.w - 12, 10);
            return;
        }

        ctx.fillStyle = COLORS.platform;
        ctx.fillRect(x, y, s.w, s.h);
        ctx.strokeStyle = COLORS.platformEdge;
        ctx.strokeRect(x + 0.5, y + 0.5, s.w - 1, s.h - 1);
    }

    function drawCoin(c) {
        const x = c.x - cameraX;
        const y = c.y;
        const spin = 0.6 + 0.4 * Math.sin(time * 5 + c.x * 0.01);
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(spin, 1);
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.coin;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.22)';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-c.r * 0.2, -c.r * 0.2, c.r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.coinShine;
        ctx.fill();
        ctx.restore();
    }

    function drawSpike(s) {
        const x = s.x - cameraX;
        const y = s.y;
        const n = Math.max(1, Math.floor(s.w / 18));
        ctx.fillStyle = COLORS.spike;
        for (let i = 0; i < n; i++) {
            const sx = x + i * (s.w / n);
            ctx.beginPath();
            ctx.moveTo(sx, y + s.h);
            ctx.lineTo(sx + (s.w / n) / 2, y);
            ctx.lineTo(sx + (s.w / n), y + s.h);
            ctx.closePath();
            ctx.fill();
        }
    }

    function drawGoal(g) {
        const x = g.x - cameraX;
        const y = g.y;
        ctx.fillStyle = COLORS.goalPole;
        ctx.fillRect(x + g.w * 0.45, y, 6, g.h);
        ctx.beginPath();
        ctx.moveTo(x + 6, y + 14);
        ctx.lineTo(x + 44, y + 24);
        ctx.lineTo(x + 6, y + 38);
        ctx.closePath();
        ctx.fillStyle = COLORS.goalFlag;
        ctx.fill();
    }

    function drawEnemy(e) {
        if (!e.alive) return;
        const x = e.x - cameraX;
        const y = e.y;
        const squish = 1 + 0.05 * Math.sin(time * 6 + e.x * 0.01);
        const w = e.w / squish;
        const h = e.h * squish;
        ctx.fillStyle = COLORS.enemy;
        ctx.fillRect(x + (e.w - w) / 2, y + (e.h - h) / 2, w, h);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillRect(x + 12, y + 10, 6, 6);
        ctx.fillRect(x + e.w - 18, y + 10, 6, 6);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        const px = e.vx > 0 ? 1.5 : -1.5;
        ctx.fillRect(x + 14 + px, y + 12, 2, 2);
        ctx.fillRect(x + e.w - 16 + px, y + 12, 2, 2);
    }

    function drawPlayer() {
        const x = player.x - cameraX;
        const y = player.y;
        const blink = (Math.sin(time * 2.2) > 0.98) ? 0.25 : 1;
        const invBlink = inv > 0 ? (Math.sin(time * 24) > 0 ? 0.4 : 1) : 1;
        ctx.save();
        ctx.globalAlpha = invBlink;
        ctx.fillStyle = COLORS.player;
        ctx.fillRect(x, y, player.w, player.h);
        ctx.fillStyle = 'rgba(236,240,241,0.95)';
        ctx.fillRect(x + 6, y + 10, player.w - 12, 18);
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        const eyeY = y + 18;
        const eyeOffset = player.face > 0 ? 1.6 : -1.6;
        ctx.fillRect(x + 13 + eyeOffset, eyeY, 3, 3 * blink);
        ctx.fillRect(x + player.w - 16 + eyeOffset, eyeY, 3, 3 * blink);
        ctx.restore();
        ctx.globalAlpha = 1;
    }

    function render() {
        if (!level) return;
        drawBackground();
        level.solids.forEach(drawSolid);
        level.spikes.forEach(drawSpike);
        level.coins.forEach(drawCoin);
        level.enemies.forEach(drawEnemy);
        drawGoal(level.goal);
        drawPlayer();

        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        ctx.fillRect(0, 0, W, 6);
        ctx.fillRect(0, H - 6, W, 6);
    }

    function step(dt) {
        time += dt;
        updateBoxes(dt);
        updatePlayer(dt);
        updateCoins();
        updateEnemies(dt);
        playerEnemyCollisions();
        playerHazardCollisions();
        playerGoalCollision();
        if (inv > 0) inv = Math.max(0, inv - dt);
        cameraX = clamp(player.x + player.w / 2 - W / 2, 0, level.width - W);

        updateHud(false);
        input.jumpPressed = false;
        input.pausePressed = false;
    }

    loadLevel(0, true);

    let last = performance.now();
    function loop(ts) {
        const dt = clamp((ts - last) / 1000, 0, 1 / 24);
        last = ts;

        if (input.pausePressed) {
            if (mode === 'playing') pause();
            else if (mode === 'paused') resume();
            input.pausePressed = false;
        }

        if (mode === 'playing') step(dt);
        render();
        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
})();
