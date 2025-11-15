import { GAME_CONFIG, CELL_STATES } from '../config/constants.js';
import { Validator } from '../utils/Validator.js';

export class Board {
    constructor(size = GAME_CONFIG.BOARD_SIZE) {
        this.size = size;
        this.matrix = this.createEmptyMatrix();
        this.ships = [];
        this.attackHistory = new Set();
    }

    createEmptyMatrix() {
        return Array(this.size).fill(null)
            .map(() => Array(this.size).fill(CELL_STATES.EMPTY));
    }

    placeShip(ship, row, col) {
        if (!Validator.canShipFit(row, col, ship.size, ship.orientation)) {
            throw new Error('El barco no cabe en esta posición');
        }

        // Verificar colisión
        for (let pos of ship.positions) {
            if (this.matrix[pos.row][pos.col] === CELL_STATES.SHIP) {
                throw new Error('Colisión con otro barco');
            }
        }

        // Colocar barco
        ship.positions.forEach(pos => {
            this.matrix[pos.row][pos.col] = CELL_STATES.SHIP;
        });

        this.ships.push(ship);
    }

    removeShip(ship) {
        // Eliminar las celdas del barco del tablero
        if (ship && ship.positions) {
            ship.positions.forEach(pos => {
                if (this.matrix[pos.row] && this.matrix[pos.row][pos.col] === CELL_STATES.SHIP) {
                    this.matrix[pos.row][pos.col] = CELL_STATES.EMPTY;
                }
            });
        }
        // Eliminar de la lista de barcos
        const index = this.ships.indexOf(ship);
        if (index !== -1) {
            this.ships.splice(index, 1);
        }
    }

    canPlaceShipExcluding(row, col, size, orientation, excludeShip) {
        if (!Validator.canShipFit(row, col, size, orientation)) {
            return false;
        }

        for (let i = 0; i < size; i++) {
            const r = orientation === 'horizontal' ? row : row + i;
            const c = orientation === 'horizontal' ? col + i : col;

            if (this.matrix[r][c] === CELL_STATES.SHIP) {
                // Verificar si la celda ocupada pertenece al barco excluido
                if (excludeShip && excludeShip.occupiesPosition(r, c)) {
                    continue; // Ignorar esta colisión
                }
                return false;
            }
        }

        return true;
    }

    receiveAttack(row, col) {
        if (!Validator.isValidCoordinate(row, col)) {
            throw new Error('Coordenadas inválidas');
        }

        const key = `${row},${col}`;

        if (this.attackHistory.has(key)) {
            return { alreadyAttacked: true, row, col };
        }

        this.attackHistory.add(key);

        const currentState = this.matrix[row][col];

        if (currentState === CELL_STATES.SHIP) {
            const hitShip = this.ships.find(ship => ship.occupiesPosition(row, col));
            if (hitShip) {
                hitShip.hit(row, col);
                this.matrix[row][col] = CELL_STATES.HIT;

                return {
                    hit: true,
                    miss: false,
                    row,
                    col,
                    ship: hitShip,
                    sunk: hitShip.isSunk()
                };
            }
        }

        this.matrix[row][col] = CELL_STATES.MISS;
        return { hit: false, miss: true, row, col };
    }

    allShipsSunk() {
        return this.ships.length > 0 && this.ships.every(ship => ship.isSunk());
    }

    getCellState(row, col) {
        if (!Validator.isValidCoordinate(row, col)) {
            return CELL_STATES.EMPTY;
        }
        return this.matrix[row][col];
    }

    canPlaceShip(row, col, size, orientation) {
        if (!Validator.canShipFit(row, col, size, orientation)) {
            return false;
        }

        for (let i = 0; i < size; i++) {
            const r = orientation === 'horizontal' ? row : row + i;
            const c = orientation === 'horizontal' ? col + i : col;

            if (this.matrix[r][c] === CELL_STATES.SHIP) {
                return false;
            }
        }

        return true;
    }

    getAvailableCells() {
        const available = [];
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const key = `${row},${col}`;
                if (!this.attackHistory.has(key)) {
                    available.push({ row, col });
                }
            }
        }
        return available;
    }

    reset() {
        this.matrix = this.createEmptyMatrix();
        this.ships = [];
        this.attackHistory.clear();
    }
}