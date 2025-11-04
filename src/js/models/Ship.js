import { ORIENTATIONS } from '../config/constants.js';

export class Ship {
    constructor({ id, name, size, icon }) {
        this.id = id;
        this.name = name;
        this.size = size;
        this.icon = icon;
        this.orientation = ORIENTATIONS.HORIZONTAL;
        this.positions = [];
        this.hits = new Set();
    }

    place(startRow, startCol, orientation) {
        this.orientation = orientation;
        this.positions = [];

        for (let i = 0; i < this.size; i++) {
            if (orientation === ORIENTATIONS.HORIZONTAL) {
                this.positions.push({ row: startRow, col: startCol + i });
            } else {
                this.positions.push({ row: startRow + i, col: startCol });
            }
        }
    }

    hit(row, col) {
        const key = `${row},${col}`;
        if (!this.hits.has(key)) {
            this.hits.add(key);
            return true;
        }
        return false;
    }

    isSunk() {
        return this.hits.size === this.size;
    }

    occupiesPosition(row, col) {
        return this.positions.some(pos => pos.row === row && pos.col === col);
    }
}