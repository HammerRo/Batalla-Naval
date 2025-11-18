import { CELL_STATES, CSS_CLASSES, GAME_CONFIG } from '../config/constants.js';

export class BoardView {
    constructor(boardElement, boardType) {
        this.boardElement = boardElement;
        this.boardType = boardType;
        this.cells = [];
        this.cellClickHandler = null;
        this.cellHoverHandler = null;
        this.hideShips = boardType === 'computer'; // ⭐ OCULTAR BARCOS DEL ENEMIGO
        this.currentBoard = null;

        // Base de sprites (relativa a index.html)
        this.assetBase = './src/assets/images';
        // Control de animaciones por celda
        this.animTimers = new Map(); // key: "r,c" -> timer id
    }

    render(board) {
        this.boardElement.innerHTML = '';
        this.cells = [];
        this.currentBoard = board;

        // If the board should hide ships, ensure reveal class is removed
        if (this.hideShips) {
            this.boardElement.classList.remove('board--reveal-ships');
        }

        for (let row = 0; row < GAME_CONFIG.BOARD_SIZE; row++) {
            for (let col = 0; col < GAME_CONFIG.BOARD_SIZE; col++) {
                const cell = this.createCell(row, col, board);
                this.boardElement.appendChild(cell);
                this.cells.push(cell);
            }
        }
    }

    createCell(row, col, board) {
        const cell = document.createElement('div');
        cell.className = CSS_CLASSES.CELL;
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.dataset.boardType = this.boardType;

        // For computer board, never render ship state until explicitly revealed
        let state = board.getCellState(row, col);
        if (this.hideShips && state === CELL_STATES.SHIP) {
            // Treat ship cells as empty during hide phase to avoid any visual
            state = CELL_STATES.EMPTY;
        }

        // Inicializar fondo por defecto
        this.setCellBackgroundLayers(cell, {
            base: `${this.assetBase}/board/cell_default.png`
        });

        // Si es celda de barco visible, anotar metadatos de sprite
        if (state === CELL_STATES.SHIP && !this.hideShips) {
            this.applyShipSpriteMeta(cell, row, col);
        }

        this.updateCellState(cell, state);

        if (this.cellClickHandler) {
            cell.addEventListener('click', this.cellClickHandler);
        }

        if (this.cellHoverHandler) {
            cell.addEventListener('mouseenter', this.cellHoverHandler);
            cell.addEventListener('mouseleave', this.cellHoverHandler);
        }

        return cell;
    }

    updateCellState(cell, state) {
        cell.classList.remove(
            CSS_CLASSES.CELL_SHIP,
            CSS_CLASSES.CELL_HIT,
            CSS_CLASSES.CELL_MISS
        );

        // also remove sunk class when re-rendering/updating
        cell.classList.remove(CSS_CLASSES.CELL_SUNK);

        switch (state) {
            case CELL_STATES.SHIP:
                cell.classList.add(CSS_CLASSES.CELL_SHIP);
                // aplicar sprite del barco si es visible
                if (!this.hideShips) {
                    this.updateCellVisualFromMeta(cell);
                } else {
                    // tablero enemigo oculto: mantener solo base
                    this.setCellBackgroundLayers(cell, { base: `${this.assetBase}/board/cell_default.png` });
                }
                break;
            case CELL_STATES.HIT:
                cell.classList.add(CSS_CLASSES.CELL_HIT);
                // reproducir animación y luego dejar marca
                this.playHitAnimation(cell, () => {
                    this.applyFinalMark(cell, 'hit');
                });
                break;
            case CELL_STATES.MISS:
                cell.classList.add(CSS_CLASSES.CELL_MISS);
                this.playMissAnimation(cell, () => {
                    this.applyFinalMark(cell, 'miss');
                });
                break;
            default:
                // EMPTY u otros: solo el fondo base
                this.setCellBackgroundLayers(cell, { base: `${this.assetBase}/board/cell_default.png` });
        }
    }

    updateCell(row, col, state) {
        const cell = this.getCell(row, col);
        if (cell) {
            this.updateCellState(cell, state);
        }
    }

    getCell(row, col) {
        return this.boardElement.querySelector(
            `[data-row="${row}"][data-col="${col}"][data-board-type="${this.boardType}"]`
        );
    }

    showShipPreview(positions, isValid) {
        // Limpia cualquier preview anterior y pinta usando una imagen overlay
        this.clearPreview();

        const basePath = `${this.assetBase}/board`;
        const overlay = isValid
            ? `${basePath}/cell_hit_mark.png`
            : `${basePath}/cell_miss_mark.png`;

        positions.forEach(({ row, col }) => {
            const cell = this.getCell(row, col);
            if (!cell) return;

            // Marcar semánticamente con clases
            cell.classList.add(isValid ? CSS_CLASSES.CELL_PREVIEW : CSS_CLASSES.CELL_INVALID);
            cell.dataset.preview = isValid ? 'valid' : 'invalid';

            // Conservar sprite de barco si existe y es visible
            const base = `${this.assetBase}/board/cell_default.png`;
            let shipLayer = null;
            if (cell.dataset.shipType && (!this.hideShips || cell.dataset.forceVisible === 'true')) {
                const typeId = cell.dataset.shipType;
                const idx = cell.dataset.segIndex;
                const orient = cell.dataset.orientation;
                const destroyed = cell.dataset.destroyed === 'true';
                shipLayer = `${this.assetBase}/ships/${typeId}/${typeId}_${orient}_${idx}${destroyed ? 'q' : ''}.png`;
            }

            this.setCellBackgroundLayers(cell, { top: overlay, middle: shipLayer, base });
        });
    }

    clearPreview() {
        this.cells.forEach(cell => {
            if (!cell.dataset.preview) return;

            delete cell.dataset.preview;
            cell.classList.remove(CSS_CLASSES.CELL_PREVIEW, CSS_CLASSES.CELL_INVALID);

            // Restaurar la visual previa sin animaciones
            if (cell.dataset.shipType && (!this.hideShips || cell.dataset.forceVisible === 'true')) {
                this.updateCellVisualFromMeta(cell);
            } else {
                this.setCellBackgroundLayers(cell, { base: `${this.assetBase}/board/cell_default.png` });
            }
        });
    }

    disable() {
        this.boardElement.classList.add(CSS_CLASSES.BOARD_DISABLED);
    }

    enable() {
        this.boardElement.classList.remove(CSS_CLASSES.BOARD_DISABLED);
    }

    setCellClickHandler(handler) {
        this.cellClickHandler = handler;
    }

    setCellHoverHandler(handler) {
        this.cellHoverHandler = handler;
    }

    clear() {
        this.boardElement.innerHTML = '';
        this.cells = [];
    }

    // ⭐ NUEVO: Revelar barcos al final del juego
    revealShips(board) {
        this.hideShips = false; // Permitir mostrar barcos
        // Add a reveal class to the board element so CSS will show ship markers
        this.boardElement.classList.add('board--reveal-ships');

        for (let row = 0; row < GAME_CONFIG.BOARD_SIZE; row++) {
            for (let col = 0; col < GAME_CONFIG.BOARD_SIZE; col++) {
                const state = board.getCellState(row, col);
                if (state === CELL_STATES.SHIP) {
                    const cell = this.getCell(row, col);
                    if (cell) {
                        this.applyShipSpriteMeta(cell, row, col);
                        this.updateCell(row, col, state);
                    } else {
                        this.updateCell(row, col, state);
                    }
                }
            }
        }
    }

    // Optional: hide ships again (used when resetting)
    hideShipsMarkers() {
        this.hideShips = true;
        this.boardElement.classList.remove('board--reveal-ships');
    }

    // Mark all positions of a ship as sunk (visual feedback)
    markShipSunk(ship) {
        if (!ship || !ship.positions) return;

        ship.positions.forEach(pos => {
            const cell = this.getCell(pos.row, pos.col);
            if (cell) {
                // Ensure base hit class is applied then add sunk
                cell.classList.remove(CSS_CLASSES.CELL_SHIP, CSS_CLASSES.CELL_MISS);
                cell.classList.add(CSS_CLASSES.CELL_HIT, CSS_CLASSES.CELL_SUNK);
                // Detener cualquier animación en curso para estas celdas
                this.stopAnimation(cell);

                // Forzar sprite de barco destruido (siempre visible aunque sea tablero enemigo)
                this.applyShipSpriteMeta(cell, pos.row, pos.col, /*forceVisible*/ true, /*destroyed*/ true);
                this.updateCellVisualFromMeta(cell);
            }
        });
    }

    // === Sprites y animaciones ===

    applyShipSpriteMeta(cell, row, col, forceVisible = false, destroyedOverride = false) {
        if (!this.currentBoard) return;
        const ship = this.currentBoard.ships.find(s => s.occupiesPosition(row, col));
        if (!ship) return;
        // índice 1..size
        const index = ship.positions.findIndex(p => p.row === row && p.col === col) + 1;
        const orientation = ship.orientation === 'horizontal' ? 'h' : 'v';
        const typeId = ship.id.split('_')[0]; // 'carrier', 'battleship', etc.
        const destroyed = destroyedOverride || ship.isSunk();

        cell.dataset.shipType = typeId;
        cell.dataset.segIndex = String(index);
        cell.dataset.orientation = orientation;
        cell.dataset.destroyed = destroyed ? 'true' : 'false';

        if (forceVisible) {
            cell.dataset.forceVisible = 'true';
        }
    }

    updateCellVisualFromMeta(cell) {
        const base = `${this.assetBase}/board/cell_default.png`;
        const typeId = cell.dataset.shipType;
        const idx = cell.dataset.segIndex;
        const orient = cell.dataset.orientation; // 'h' | 'v'
        const destroyed = cell.dataset.destroyed === 'true';

        const shipLayer = (typeId && idx && orient)
            ? `${this.assetBase}/ships/${typeId}/${typeId}_${orient}_${idx}${destroyed ? 'q' : ''}.png`
            : null;

        // Si la celda fue impactada pero el barco no está hundido, overlay de marca
        const mark = cell.classList.contains(CSS_CLASSES.CELL_HIT) && !destroyed
            ? `${this.assetBase}/board/cell_hit_mark.png`
            : (cell.classList.contains(CSS_CLASSES.CELL_MISS)
                ? `${this.assetBase}/board/cell_miss_mark.png`
                : null);

        this.setCellBackgroundLayers(cell, { top: mark, middle: shipLayer, base });
    }

    applyFinalMark(cell, kind /* 'hit' | 'miss' */) {
        // Mantener sprite de barco si existe (y no oculto), y añadir marca encima
        const base = `${this.assetBase}/board/cell_default.png`;
        let shipLayer = null;
        if (cell.dataset.shipType && (!this.hideShips || cell.dataset.forceVisible === 'true')) {
            const typeId = cell.dataset.shipType;
            const idx = cell.dataset.segIndex;
            const orient = cell.dataset.orientation;
            const destroyed = cell.dataset.destroyed === 'true';
            shipLayer = `${this.assetBase}/ships/${typeId}/${typeId}_${orient}_${idx}${destroyed ? 'q' : ''}.png`;
        }
        const isDestroyed = cell.dataset.destroyed === 'true';
        const top = isDestroyed
            ? null
            : (kind === 'hit'
                ? `${this.assetBase}/board/cell_hit_mark.png`
                : `${this.assetBase}/board/cell_miss_mark.png`);

        this.setCellBackgroundLayers(cell, { top, middle: shipLayer, base });
    }

    setCellBackgroundLayers(cell, { top = null, middle = null, base }) {
        const layers = [];
        if (top) layers.push(`url("${top}")`);
        if (middle) layers.push(`url("${middle}")`);
        if (base) layers.push(`url("${base}")`);
        cell.style.backgroundImage = layers.join(', ');
        cell.style.backgroundSize = 'contain, contain, cover';
        cell.style.backgroundPosition = 'center, center, center';
        cell.style.backgroundRepeat = 'no-repeat, no-repeat, no-repeat';
    }

    playHitAnimation(cell, onComplete) {
        this.stopAnimation(cell);
        const frames = [1,2,3,4,5,6].map(n => `${this.assetBase}/board/animations/hit/hit_0${n}.png`);
        this.runFrameAnimation(cell, frames, 60, onComplete);
    }

    playMissAnimation(cell, onComplete) {
        this.stopAnimation(cell);
        const frames = [1,2,3,4,5,6].map(n => `${this.assetBase}/board/animations/miss/miss_0${n}.png`);
        this.runFrameAnimation(cell, frames, 60, onComplete);
    }

    runFrameAnimation(cell, frameUrls, frameDurationMs, onComplete) {
        const key = `${cell.dataset.row},${cell.dataset.col}`;
        let i = 0;
        const base = `${this.assetBase}/board/cell_default.png`;
        let shipLayer = null;
        if (cell.dataset.shipType && (!this.hideShips || cell.dataset.forceVisible === 'true')) {
            const typeId = cell.dataset.shipType;
            const idx = cell.dataset.segIndex;
            const orient = cell.dataset.orientation;
            const destroyed = cell.dataset.destroyed === 'true';
            shipLayer = `${this.assetBase}/ships/${typeId}/${typeId}_${orient}_${idx}${destroyed ? 'q' : ''}.png`;
        }

        const tick = () => {
            if (i >= frameUrls.length) {
                this.animTimers.delete(key);
                if (onComplete) onComplete();
                return;
            }
            const top = frameUrls[i++];
            this.setCellBackgroundLayers(cell, { top, middle: shipLayer, base });
            const t = setTimeout(tick, frameDurationMs);
            this.animTimers.set(key, t);
        };
        tick();
    }

    stopAnimation(cell) {
        const key = `${cell.dataset.row},${cell.dataset.col}`;
        const t = this.animTimers.get(key);
        if (t) {
            clearTimeout(t);
            this.animTimers.delete(key);
        }
    }
}