import { GAME_CONFIG } from '../config/constants.js';

export class AIService {
    constructor() {
        this.lastHits = [];
        this.targetMode = false;
    }

    selectTarget(opponentBoard) {
        const availableCells = opponentBoard.getAvailableCells();

        if (availableCells.length === 0) {
            throw new Error('No hay celdas disponibles');
        }

        // Modo objetivo: atacar alrededor del último hit
        if (this.targetMode && this.lastHits.length > 0) {
            const lastHit = this.lastHits[this.lastHits.length - 1];
            const adjacent = this.getAdjacentCells(lastHit.row, lastHit.col);
            
            const availableAdjacent = adjacent.filter(cell => {
                const key = `${cell.row},${cell.col}`;
                return !opponentBoard.attackHistory.has(key);
            });

            if (availableAdjacent.length > 0) {
                return availableAdjacent[Math.floor(Math.random() * availableAdjacent.length)];
            }
        }

        // Ataque aleatorio
        return availableCells[Math.floor(Math.random() * availableCells.length)];
    }

    getAdjacentCells(row, col) {
        const adjacent = [];
        const directions = [
            { row: -1, col: 0 },  // arriba
            { row: 1, col: 0 },   // abajo
            { row: 0, col: -1 },  // izquierda
            { row: 0, col: 1 }    // derecha
        ];

        directions.forEach(dir => {
            const newRow = row + dir.row;
            const newCol = col + dir.col;

            if (newRow >= 0 && newRow < GAME_CONFIG.BOARD_SIZE &&
                newCol >= 0 && newCol < GAME_CONFIG.BOARD_SIZE) {
                adjacent.push({ row: newRow, col: newCol });
            }
        });

        return adjacent;
    }

    processAttackResult(result) {
        if (result.hit) {
            this.lastHits.push({ row: result.row, col: result.col });
            this.targetMode = true;

            if (result.sunk) {
                this.resetTargetMode();
            }
        }
    }

    resetTargetMode() {
        this.targetMode = false;
        this.lastHits = [];
    }

    generateRandomShipPlacement(board, shipSize, orientation) {
        const maxAttempts = GAME_CONFIG.MAX_ATTEMPTS;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const row = Math.floor(Math.random() * GAME_CONFIG.BOARD_SIZE);
            const col = Math.floor(Math.random() * GAME_CONFIG.BOARD_SIZE);

            if (board.canPlaceShip(row, col, shipSize, orientation)) {
                return { row, col };
            }
        }

        return null;
    }

    reset() {
        this.resetTargetMode();
    }
}