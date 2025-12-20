/* Tetris game logic for game_tetris.html */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const boardEl = document.getElementById('tetris-board');
        const canvas = document.getElementById('tetris-canvas');
        if (!boardEl || !canvas) return;

        const ctx = canvas.getContext('2d');

        const nextCanvas = document.getElementById('next-canvas');
        const nextCtx = nextCanvas ? nextCanvas.getContext('2d') : null;
        const holdCanvas = document.getElementById('hold-canvas');
        const holdCtx = holdCanvas ? holdCanvas.getContext('2d') : null;

        const scoreDisplay = document.getElementById('score-display');
        const linesDisplay = document.getElementById('lines-display');
        const levelDisplay = document.getElementById('level-display');
        const bestDisplay = document.getElementById('best-display');
        const timeDisplay = document.getElementById('time-display');
        const sprintDisplay = document.getElementById('sprint-display');
        const bestSprintDisplay = document.getElementById('best-sprint-display');
        const modeBtns = document.querySelectorAll('.mode-btn');

        const overlay = document.getElementById('tetris-overlay');
        const overlayTitle = document.getElementById('overlay-title');
        const overlaySubtitle = document.getElementById('overlay-subtitle');
        const resumeBtn = document.getElementById('resume-btn');
        const restartBtn = document.getElementById('restart-btn');

        const COLS = 10;
        const ROWS = 20;
        const PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

        const COLORS = {
            I: '#00BCD4',
            O: '#F1C40F',
            T: '#9B59B6',
            S: '#2ECC71',
            Z: '#E74C3C',
            J: '#3498DB',
            L: '#E67E22',
        };

        const SHAPES = {
            I: [
                [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                ],
                [
                    [0, 0, 1, 0],
                    [0, 0, 1, 0],
                    [0, 0, 1, 0],
                    [0, 0, 1, 0],
                ],
                [
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                ],
                [
                    [0, 1, 0, 0],
                    [0, 1, 0, 0],
                    [0, 1, 0, 0],
                    [0, 1, 0, 0],
                ],
            ],
            O: [
                [
                    [0, 1, 1, 0],
                    [0, 1, 1, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                ],
            ],
            T: [
                [
                    [0, 1, 0, 0],
                    [1, 1, 1, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                ],
                [
                    [0, 1, 0, 0],
                    [0, 1, 1, 0],
                    [0, 1, 0, 0],
                    [0, 0, 0, 0],
                ],
                [
                    [0, 0, 0, 0],
                    [1, 1, 1, 0],
                    [0, 1, 0, 0],
                    [0, 0, 0, 0],
                ],
                [
                    [0, 1, 0, 0],
                    [1, 1, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, 0, 0],
                ],
            ],
            S: [
                [
                    [0, 1, 1, 0],
                    [1, 1, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                ],
                [
                    [0, 1, 0, 0],
                    [0, 1, 1, 0],
                    [0, 0, 1, 0],
                    [0, 0, 0, 0],
                ],
                [
                    [0, 0, 0, 0],
                    [0, 1, 1, 0],
                    [1, 1, 0, 0],
                    [0, 0, 0, 0],
                ],
                [
                    [1, 0, 0, 0],
                    [1, 1, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, 0, 0],
                ],
            ],
            Z: [
                [
                    [1, 1, 0, 0],
                    [0, 1, 1, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                ],
                [
                    [0, 0, 1, 0],
                    [0, 1, 1, 0],
                    [0, 1, 0, 0],
                    [0, 0, 0, 0],
                ],
                [
                    [0, 0, 0, 0],
                    [1, 1, 0, 0],
                    [0, 1, 1, 0],
                    [0, 0, 0, 0],
                ],
                [
                    [0, 1, 0, 0],
                    [1, 1, 0, 0],
                    [1, 0, 0, 0],
                    [0, 0, 0, 0],
                ],
            ],
            J: [
                [
                    [1, 0, 0, 0],
                    [1, 1, 1, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                ],
                [
                    [0, 1, 1, 0],
                    [0, 1, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, 0, 0],
                ],
                [
                    [0, 0, 0, 0],
                    [1, 1, 1, 0],
                    [0, 0, 1, 0],
                    [0, 0, 0, 0],
                ],
                [
                    [0, 1, 0, 0],
                    [0, 1, 0, 0],
                    [1, 1, 0, 0],
                    [0, 0, 0, 0],
                ],
            ],
            L: [
                [
                    [0, 0, 1, 0],
                    [1, 1, 1, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                ],
                [
                    [0, 1, 0, 0],
                    [0, 1, 0, 0],
                    [0, 1, 1, 0],
                    [0, 0, 0, 0],
                ],
                [
                    [0, 0, 0, 0],
                    [1, 1, 1, 0],
                    [1, 0, 0, 0],
                    [0, 0, 0, 0],
                ],
                [
                    [1, 1, 0, 0],
                    [0, 1, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, 0, 0],
                ],
            ],
        };

        function shuffle(arr) {
            const a = arr.slice();
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const t = a[i];
                a[i] = a[j];
                a[j] = t;
            }
            return a;
        }

        function getCssVar(name, fallback) {
            const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
            return v || fallback;
        }

        const gridLineColor = getCssVar('--tetris-grid-line', '#b0c4c4');

        let board = [];
        let current = null;
        let nextQueue = [];
        let holdType = null;
        let holdUsed = false;

        let score = 0;
        let lines = 0;
        let level = 1;
        let best = Number(localStorage.getItem('tetrisBestScore') || 0);
        let sprintBestMs = Number(localStorage.getItem('tetrisSprintBestMs') || 0);
        let mode = localStorage.getItem('tetrisMode') || 'endless'; // endless|sprint40

        let runTimeMs = 0;

        let isPaused = false;
        let isGameOver = false;
        let softDrop = false;

        let lastTime = 0;
        let dropCounter = 0;

        let boardWidth = 0;
        let boardHeight = 0;
        let cellSize = 24;

        function emptyBoard() {
            board = Array.from({ length: ROWS }, function () {
                return Array(COLS).fill(null);
            });
        }

        function refillQueue() {
            while (nextQueue.length < 6) {
                nextQueue = nextQueue.concat(shuffle(PIECE_TYPES));
            }
        }

        function makePiece(type) {
            return {
                type: type,
                rot: 0,
                x: Math.floor(COLS / 2) - 2,
                y: -2,
                rotations: SHAPES[type],
            };
        }

        function cellAt(x, y) {
            if (y < 0) return null;
            if (y >= ROWS) return 'OUT';
            if (x < 0 || x >= COLS) return 'OUT';
            return board[y][x];
        }

        function collides(piece, dx, dy, nextRot) {
            const matrix = piece.rotations[nextRot];
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (!matrix[r][c]) continue;
                    const x = piece.x + c + dx;
                    const y = piece.y + r + dy;
                    const cell = cellAt(x, y);
                    if (cell === 'OUT') return true;
                    if (cell && cell !== null) return true;
                }
            }
            return false;
        }

        function updateHud() {
            if (scoreDisplay) scoreDisplay.textContent = String(score);
            if (linesDisplay) linesDisplay.textContent = String(lines);
            if (levelDisplay) levelDisplay.textContent = String(level);
            if (bestDisplay) bestDisplay.textContent = String(best);
            if (timeDisplay) timeDisplay.textContent = formatTimeMs(runTimeMs);

            if (sprintDisplay) {
                sprintDisplay.textContent = mode === 'sprint40' ? `${Math.min(lines, 40)}/40` : '--';
            }
            if (bestSprintDisplay) {
                bestSprintDisplay.textContent = sprintBestMs > 0 ? formatTimeMs(sprintBestMs) : '--:--';
            }
        }

        function formatTimeMs(ms) {
            const totalSeconds = Math.floor(ms / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
        }

        function showOverlay(title, subtitle, showResume) {
            if (!overlay) return;
            if (overlayTitle) overlayTitle.textContent = title;
            if (overlaySubtitle) overlaySubtitle.textContent = subtitle;
            overlay.classList.add('active');
            overlay.setAttribute('aria-hidden', 'false');
            if (resumeBtn) resumeBtn.style.display = showResume ? '' : 'none';
        }

        function hideOverlay() {
            if (!overlay) return;
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');
            if (resumeBtn) resumeBtn.style.display = '';
        }

        function getDropInterval() {
            const base = 900;
            const min = 90;
            const interval = base - (level - 1) * 70;
            return Math.max(min, interval);
        }

        function clearLines() {
            let cleared = 0;
            for (let y = ROWS - 1; y >= 0; y--) {
                let full = true;
                for (let x = 0; x < COLS; x++) {
                    if (board[y][x] === null) {
                        full = false;
                        break;
                    }
                }
                if (!full) continue;
                board.splice(y, 1);
                board.unshift(Array(COLS).fill(null));
                cleared++;
                y++;
            }

            if (cleared === 0) return;

            lines += cleared;
            const lineScore = [0, 100, 300, 500, 800][cleared] || cleared * 200;
            score += lineScore * level;
            level = Math.floor(lines / 10) + 1;
            updateHud();

            if (mode === 'sprint40' && lines >= 40 && !isGameOver) {
                sprintComplete();
            }
        }

        function gameOver() {
            isGameOver = true;
            isPaused = false;
            if (score > best) {
                best = score;
                localStorage.setItem('tetrisBestScore', String(best));
            }
            updateHud();
            showOverlay('\u6E38\u620F\u7ED3\u675F', '\u672C\u5C40\u5F97\u5206\uFF1A' + score + '\uFF08Enter/Space/R \u91CD\u65B0\u5F00\u59CB\uFF0CEsc/B \u8FD4\u56DE\uFF09', false);
        }

        function sprintComplete() {
            isGameOver = true;
            isPaused = false;

            const finalMs = runTimeMs;
            if (!sprintBestMs || finalMs < sprintBestMs) {
                sprintBestMs = finalMs;
                localStorage.setItem('tetrisSprintBestMs', String(sprintBestMs));
            }
            updateHud();
            showOverlay('\u51B2\u523A\u5B8C\u6210', '\u7528\u65F6\uFF1A ' + formatTimeMs(finalMs) + '\uFF08Enter/Space/R \u91CD\u65B0\u5F00\u59CB\uFF0CEsc/B \u8FD4\u56DE\uFF09', false);
        }

        function lockPiece() {
            const matrix = current.rotations[current.rot];
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (!matrix[r][c]) continue;
                    const x = current.x + c;
                    const y = current.y + r;
                    if (y < 0) {
                        gameOver();
                        return;
                    }
                    board[y][x] = current.type;
                }
            }
            holdUsed = false;
            clearLines();
            spawn();
        }

        function spawn() {
            refillQueue();
            current = makePiece(nextQueue.shift());
            dropCounter = 0;
            if (collides(current, 0, 0, current.rot)) {
                gameOver();
            }
            drawSide();
        }

        function resetGame() {
            emptyBoard();
            nextQueue = [];
            holdType = null;
            holdUsed = false;
            score = 0;
            lines = 0;
            level = 1;
            runTimeMs = 0;
            isPaused = false;
            isGameOver = false;
            softDrop = false;
            lastTime = 0;
            dropCounter = 0;
            hideOverlay();
            refillQueue();
            spawn();
            updateHud();
        }

        function pause() {
            if (isGameOver) return;
            isPaused = true;
            showOverlay('暂停', '按 P 或点击按钮继续', true);
        }

        function resume() {
            if (isGameOver) return;
            isPaused = false;
            hideOverlay();
        }

        function togglePause() {
            if (isPaused) resume();
            else pause();
        }

        function normalizeMode() {
            if (mode !== 'endless' && mode !== 'sprint40') mode = 'endless';
        }

        function applyModeUi() {
            normalizeMode();
            if (modeBtns && modeBtns.length > 0) {
                modeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
            }
            localStorage.setItem('tetrisMode', mode);
            updateHud();
        }

        function changeMode() {
            mode = this.dataset.mode;
            normalizeMode();
            applyModeUi();
            resetGame();
        }

        function move(dx) {
            if (isPaused || isGameOver) return;
            if (!collides(current, dx, 0, current.rot)) current.x += dx;
        }

        function dropOneRow() {
            if (isPaused || isGameOver) return false;
            if (!collides(current, 0, 1, current.rot)) {
                current.y += 1;
                if (softDrop) {
                    score += 1;
                    updateHud();
                }
                return true;
            }
            lockPiece();
            return false;
        }

        function hardDrop() {
            if (isPaused || isGameOver) return;
            let rowsDropped = 0;
            while (!collides(current, 0, 1, current.rot)) {
                current.y += 1;
                rowsDropped++;
            }
            score += rowsDropped * 2;
            updateHud();
            lockPiece();
        }

        function tryRotate(dir) {
            if (isPaused || isGameOver) return;
            const rotationsLen = current.rotations.length;
            let nextRot = (current.rot + dir) % rotationsLen;
            if (nextRot < 0) nextRot += rotationsLen;

            if (!collides(current, 0, 0, nextRot)) {
                current.rot = nextRot;
                return;
            }

            const kicks = [-1, 1, -2, 2];
            for (let i = 0; i < kicks.length; i++) {
                const k = kicks[i];
                if (!collides(current, k, 0, nextRot)) {
                    current.x += k;
                    current.rot = nextRot;
                    return;
                }
            }
        }

        function hold() {
            if (isPaused || isGameOver) return;
            if (holdUsed) return;
            holdUsed = true;

            const curType = current.type;
            if (!holdType) {
                holdType = curType;
                spawn();
            } else {
                const swap = holdType;
                holdType = curType;
                current = makePiece(swap);
                if (collides(current, 0, 0, current.rot)) gameOver();
            }
            drawSide();
        }

        function resizeMainCanvas() {
            const rect = boardEl.getBoundingClientRect();
            boardWidth = rect.width;
            boardHeight = rect.height;
            const dpr = Math.max(1, window.devicePixelRatio || 1);

            canvas.width = Math.floor(boardWidth * dpr);
            canvas.height = Math.floor(boardHeight * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            cellSize = boardWidth / COLS;
        }

        function resizeMiniCanvas(c, cctx) {
            if (!c || !cctx) return;
            const rect = c.getBoundingClientRect();
            const dpr = Math.max(1, window.devicePixelRatio || 1);
            c.width = Math.floor(rect.width * dpr);
            c.height = Math.floor(rect.height * dpr);
            cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function drawBackgroundGrid(ctx2, w, h, cols, rows) {
            ctx2.save();
            ctx2.strokeStyle = gridLineColor;
            ctx2.lineWidth = 1;
            ctx2.globalAlpha = 0.7;

            const cellW = w / cols;
            const cellH = h / rows;
            for (let x = 0; x <= cols; x++) {
                ctx2.beginPath();
                ctx2.moveTo(x * cellW, 0);
                ctx2.lineTo(x * cellW, h);
                ctx2.stroke();
            }
            for (let y = 0; y <= rows; y++) {
                ctx2.beginPath();
                ctx2.moveTo(0, y * cellH);
                ctx2.lineTo(w, y * cellH);
                ctx2.stroke();
            }
            ctx2.restore();
        }

        function drawBlock(ctx2, x, y, size, color, alpha) {
            const padding = Math.max(1, Math.floor(size * 0.08));
            const px = x * size;
            const py = y * size;

            ctx2.save();
            ctx2.globalAlpha = alpha === undefined ? 1 : alpha;
            ctx2.fillStyle = color;
            ctx2.fillRect(px + padding, py + padding, size - padding * 2, size - padding * 2);

            ctx2.globalAlpha = (alpha === undefined ? 1 : alpha) * 0.22;
            ctx2.fillStyle = '#fff';
            ctx2.fillRect(px + padding, py + padding, size - padding * 2, Math.max(2, Math.floor(size * 0.18)));

            ctx2.globalAlpha = (alpha === undefined ? 1 : alpha) * 0.18;
            ctx2.fillStyle = '#000';
            ctx2.fillRect(
                px + padding,
                py + size - padding - Math.max(2, Math.floor(size * 0.18)),
                size - padding * 2,
                Math.max(2, Math.floor(size * 0.18))
            );

            ctx2.restore();
        }

        function drawGhost() {
            let ghostY = current.y;
            while (!collides(current, 0, (ghostY - current.y) + 1, current.rot)) {
                ghostY += 1;
            }
            const matrix = current.rotations[current.rot];
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (!matrix[r][c]) continue;
                    const x = current.x + c;
                    const y = ghostY + r;
                    if (y < 0) continue;
                    drawBlock(ctx, x, y, cellSize, COLORS[current.type], 0.18);
                }
            }
        }

        function draw() {
            ctx.clearRect(0, 0, boardWidth, boardHeight);
            drawBackgroundGrid(ctx, boardWidth, boardHeight, COLS, ROWS);

            for (let y = 0; y < ROWS; y++) {
                for (let x = 0; x < COLS; x++) {
                    const cell = board[y][x];
                    if (!cell) continue;
                    drawBlock(ctx, x, y, cellSize, COLORS[cell], 1);
                }
            }

            if (current) {
                drawGhost();
                const matrix = current.rotations[current.rot];
                for (let r = 0; r < 4; r++) {
                    for (let c = 0; c < 4; c++) {
                        if (!matrix[r][c]) continue;
                        const x = current.x + c;
                        const y = current.y + r;
                        if (y < 0) continue;
                        drawBlock(ctx, x, y, cellSize, COLORS[current.type], 1);
                    }
                }
            }
        }

        function drawMini(ctx2, type) {
            if (!ctx2) return;
            const c = ctx2.canvas;
            const rect = c.getBoundingClientRect();
            const size = Math.min(rect.width, rect.height);
            ctx2.clearRect(0, 0, rect.width, rect.height);
            drawBackgroundGrid(ctx2, size, size, 4, 4);
            if (!type) return;

            const matrix = SHAPES[type][0];
            let minX = 4, minY = 4, maxX = 0, maxY = 0;
            for (let r = 0; r < 4; r++) {
                for (let c2 = 0; c2 < 4; c2++) {
                    if (!matrix[r][c2]) continue;
                    if (c2 < minX) minX = c2;
                    if (r < minY) minY = r;
                    if (c2 > maxX) maxX = c2;
                    if (r > maxY) maxY = r;
                }
            }
            const w = (maxX - minX + 1);
            const h = (maxY - minY + 1);
            const offsetX = Math.floor((4 - w) / 2) - minX;
            const offsetY = Math.floor((4 - h) / 2) - minY;

            const cell = size / 4;
            for (let r = 0; r < 4; r++) {
                for (let c2 = 0; c2 < 4; c2++) {
                    if (!matrix[r][c2]) continue;
                    drawBlock(ctx2, c2 + offsetX, r + offsetY, cell, COLORS[type], 1);
                }
            }
        }

        function drawSide() {
            resizeMiniCanvas(nextCanvas, nextCtx);
            resizeMiniCanvas(holdCanvas, holdCtx);
            refillQueue();
            drawMini(nextCtx, nextQueue[0]);
            drawMini(holdCtx, holdType);
        }

        function onKeyDown(e) {
            const code = e.code;
            const handledBase = [
                'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp',
                'Space', 'KeyP', 'KeyR', 'KeyC', 'KeyX', 'KeyZ',
                'ShiftLeft', 'ShiftRight',
            ].includes(code);
            const handledWhenOver = isGameOver && ['Enter', 'Space', 'Escape', 'Backspace', 'KeyB'].includes(code);
            if (handledBase || handledWhenOver) e.preventDefault();

            if (code === 'KeyP') {
                togglePause();
                return;
            }
            if (code === 'KeyR') {
                resetGame();
                return;
            }

            if (isGameOver) {
                if (code === 'Enter' || code === 'Space') {
                    resetGame();
                    return;
                }
                if (code === 'Escape' || code === 'Backspace' || code === 'KeyB') {
                    window.location.href = 'index.html';
                }
                return;
            }

            if (isPaused) return;

            if (code === 'ArrowLeft') move(-1);
            else if (code === 'ArrowRight') move(1);
            else if (code === 'ArrowDown') {
                softDrop = true;
                dropOneRow();
            } else if (code === 'ArrowUp' || code === 'KeyX') tryRotate(1);
            else if (code === 'KeyZ') tryRotate(-1);
            else if (code === 'Space') hardDrop();
            else if (code === 'KeyC' || code === 'ShiftLeft' || code === 'ShiftRight') hold();
        }

        function onKeyUp(e) {
            if (e.code === 'ArrowDown') softDrop = false;
        }

        function bindTouchControls() {
            const buttons = document.querySelectorAll('[data-action]');
            buttons.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    const action = btn.getAttribute('data-action');
                    if (action === 'left') move(-1);
                    else if (action === 'right') move(1);
                    else if (action === 'down') {
                        const prev = softDrop;
                        softDrop = true;
                        dropOneRow();
                        softDrop = prev;
                    } else if (action === 'rotate') tryRotate(1);
                    else if (action === 'drop') hardDrop();
                    else if (action === 'hold') hold();
                    else if (action === 'pause') togglePause();
                });
            });
        }

        if (resumeBtn) resumeBtn.addEventListener('click', resume);
        if (restartBtn) restartBtn.addEventListener('click', resetGame);

        document.addEventListener('keydown', onKeyDown, { passive: false });
        document.addEventListener('keyup', onKeyUp, { passive: true });
        window.addEventListener('resize', function () {
            resizeMainCanvas();
            drawSide();
            draw();
        });

        bestDisplay.textContent = String(best);
        resizeMainCanvas();
        bindTouchControls();
        if (modeBtns && modeBtns.length > 0) {
            applyModeUi();
            modeBtns.forEach(btn => btn.addEventListener('click', changeMode));
        } else {
            normalizeMode();
            applyModeUi();
        }
        resetGame();

        function update(time) {
            const delta = time - lastTime;
            lastTime = time;

            if (!isPaused && !isGameOver) {
                runTimeMs += delta;
                dropCounter += delta;
                const interval = softDrop ? 55 : getDropInterval();
                if (dropCounter >= interval) {
                    dropOneRow();
                    dropCounter = 0;
                }
            }

            draw();
            window.requestAnimationFrame(update);
        }

        window.requestAnimationFrame(update);
    });
})();
