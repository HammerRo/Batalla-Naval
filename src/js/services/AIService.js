import { GAME_CONFIG } from '../config/constants.js';

export class AIService {
    constructor(difficulty = 'normal') {
        this.difficulty = difficulty; // 'easy', 'normal', 'hard'
        this.lastHits = [];
        this.targetMode = false;
        this.huntDirection = null; // Para modo difícil: 'horizontal' o 'vertical'
    }

    /**
     * Establece el nivel de dificultad de la IA
     * @param {string} difficulty - 'easy', 'normal', 'hard'
     */
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.reset();
    }

    selectTarget(opponentBoard) {
        const availableCells = opponentBoard.getAvailableCells();

        if (availableCells.length === 0) {
            throw new Error('No hay celdas disponibles');
        }

        // Modo FÁCIL: siempre ataque aleatorio
        if (this.difficulty === 'easy') {
            return this.selectRandomTarget(availableCells);
        }

        // Modo NORMAL: atacar alrededor del último hit
        if (this.difficulty === 'normal') {
            return this.selectNormalTarget(opponentBoard, availableCells);
        }

        // Modo DIFÍCIL: buscar en línea después de un hit
        if (this.difficulty === 'hard') {
            return this.selectHardTarget(opponentBoard, availableCells);
        }

        // Fallback: ataque aleatorio
        return this.selectRandomTarget(availableCells);
    }

    /**
     * Selecciona un objetivo aleatorio (modo fácil)
     */
    selectRandomTarget(availableCells) {
        return availableCells[Math.floor(Math.random() * availableCells.length)];
    }

    /**
     * Selecciona un objetivo cercano al último hit (modo normal)
     */
    selectNormalTarget(opponentBoard, availableCells) {
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
        return this.selectRandomTarget(availableCells);
    }

    /**
     * Selecciona un objetivo inteligente en línea (modo difícil)
     */
    selectHardTarget(opponentBoard, availableCells) {
        // Si no hay hits previos, ataque aleatorio
        if (!this.targetMode || this.lastHits.length === 0) {
            return this.selectRandomTarget(availableCells);
        }

        // Si tenemos múltiples hits, determinar la dirección del barco
        if (this.lastHits.length >= 2 && !this.huntDirection) {
            this.determineHuntDirection();
        }

        // Si ya sabemos la dirección, atacar en esa línea
        if (this.huntDirection) {
            const target = this.selectTargetInDirection(opponentBoard);
            if (target) {
                return target;
            }
        }

        // Si solo tenemos un hit, atacar en las 4 direcciones posibles
        if (this.lastHits.length === 1) {
            const lastHit = this.lastHits[0];
            const adjacent = this.getAdjacentCells(lastHit.row, lastHit.col);
            
            const availableAdjacent = adjacent.filter(cell => {
                const key = `${cell.row},${cell.col}`;
                return !opponentBoard.attackHistory.has(key);
            });

            if (availableAdjacent.length > 0) {
                return availableAdjacent[Math.floor(Math.random() * availableAdjacent.length)];
            }
        }

        // Fallback: ataque aleatorio
        return this.selectRandomTarget(availableCells);
    }

    /**
     * Determina si el barco está en horizontal o vertical basado en los hits
     */
    determineHuntDirection() {
        if (this.lastHits.length < 2) return;

        const first = this.lastHits[0];
        const second = this.lastHits[1];

        if (first.row === second.row) {
            this.huntDirection = 'horizontal';
        } else if (first.col === second.col) {
            this.huntDirection = 'vertical';
        }
    }

    /**
     * Selecciona el siguiente objetivo en la dirección del barco
     */
    selectTargetInDirection(opponentBoard) {
        if (!this.huntDirection || this.lastHits.length === 0) return null;

        // Ordenar hits para encontrar los extremos
        const sortedHits = [...this.lastHits].sort((a, b) => {
            if (this.huntDirection === 'horizontal') {
                return a.col - b.col;
            } else {
                return a.row - b.row;
            }
        });

        const first = sortedHits[0];
        const last = sortedHits[sortedHits.length - 1];

        // Intentar atacar en ambos extremos de la línea
        const targets = [];

        if (this.huntDirection === 'horizontal') {
            // Intentar a la izquierda
            if (first.col > 0) {
                targets.push({ row: first.row, col: first.col - 1 });
            }
            // Intentar a la derecha
            if (last.col < GAME_CONFIG.BOARD_SIZE - 1) {
                targets.push({ row: last.row, col: last.col + 1 });
            }
        } else if (this.huntDirection === 'vertical') {
            // Intentar arriba
            if (first.row > 0) {
                targets.push({ row: first.row - 1, col: first.col });
            }
            // Intentar abajo
            if (last.row < GAME_CONFIG.BOARD_SIZE - 1) {
                targets.push({ row: last.row + 1, col: last.col });
            }
        }

        // Filtrar targets que ya fueron atacados
        const availableTargets = targets.filter(cell => {
            const key = `${cell.row},${cell.col}`;
            return !opponentBoard.attackHistory.has(key);
        });

        if (availableTargets.length > 0) {
            return availableTargets[Math.floor(Math.random() * availableTargets.length)];
        }

        return null;
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

            // En modo difícil, determinar dirección si tenemos 2+ hits
            if (this.difficulty === 'hard' && this.lastHits.length >= 2) {
                this.determineHuntDirection();
            }

            if (result.sunk) {
                this.resetTargetMode();
            }
        } else {
            // En modo difícil, si fallamos mientras cazamos en una dirección,
            // podemos intentar la dirección opuesta
            if (this.difficulty === 'hard' && this.huntDirection && this.lastHits.length >= 2) {
                // Mantener el modo de caza pero permitir cambiar de extremo
            }
        }
    }

    resetTargetMode() {
        this.targetMode = false;
        this.lastHits = [];
        this.huntDirection = null;
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