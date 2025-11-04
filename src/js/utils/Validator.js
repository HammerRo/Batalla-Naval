import { GAME_CONFIG, ORIENTATIONS } from '../config/constants.js';

export class Validator {
    static isValidCoordinate(row, col) {
        return row >= 0 && row < GAME_CONFIG.BOARD_SIZE && 
               col >= 0 && col < GAME_CONFIG.BOARD_SIZE;
    }

    static canShipFit(row, col, size, orientation) {
        if (orientation === ORIENTATIONS.HORIZONTAL) {
            return col + size <= GAME_CONFIG.BOARD_SIZE;
        }
        return row + size <= GAME_CONFIG.BOARD_SIZE;
    }
}