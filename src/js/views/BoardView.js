import { CELL_STATES, CSS_CLASSES, GAME_CONFIG } from '../config/constants.js';

export class BoardView {
    constructor(boardElement, boardType) {
        this.boardElement = boardElement;
        this.boardType = boardType;
        this.cells = [];
        this.cellClickHandler = null;
        this.cellHoverHandler = null;
        this.hideShips = boardType === 'computer'; // ⭐ OCULTAR BARCOS DEL ENEMIGO
    }

    render(board) {
        this.boardElement.innerHTML = '';
        this.cells = [];

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

        const state = board.getCellState(row, col);
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

        // ⭐ SI ES TABLERO ENEMIGO, NO MOSTRAR BARCOS (solo mostrar hits y miss)
        if (this.hideShips && state === CELL_STATES.SHIP) {
            // No agregar clase, dejar celda normal
            return;
        }

        switch (state) {
            case CELL_STATES.SHIP:
                cell.classList.add(CSS_CLASSES.CELL_SHIP);
                break;
            case CELL_STATES.HIT:
                cell.classList.add(CSS_CLASSES.CELL_HIT);
                break;
            case CELL_STATES.MISS:
                cell.classList.add(CSS_CLASSES.CELL_MISS);
                break;
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
        this.clearPreview();

        positions.forEach(({ row, col }) => {
            const cell = this.getCell(row, col);
            if (cell) {
                if (isValid) {
                    cell.classList.add(CSS_CLASSES.CELL_PREVIEW);
                } else {
                    cell.classList.add(CSS_CLASSES.CELL_INVALID);
                }
            }
        });
    }

    clearPreview() {
        this.cells.forEach(cell => {
            cell.classList.remove(CSS_CLASSES.CELL_PREVIEW, CSS_CLASSES.CELL_INVALID);
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
                    this.updateCell(row, col, state);
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
            }
        });
    }
}